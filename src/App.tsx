import React, { lazy, Suspense, useState, useEffect } from 'react';
import { NavigationTab, Song, PricingPlan, RevisionRequest, Order } from './types';
import { PRICING_PLANS, SAMPLE_SONGS, STYLE_OPTIONS } from './data/mockData';
import { getBlob } from './utils/indexedDb';
import { hasRealAudio, resolveSongAudioUrl } from './utils/songAudio';
import type { Session } from '@supabase/supabase-js';
import {
  describeOrdersError,
  fetchOrdersFromSupabase,
  getCurrentSession,
  onAuthChange,
  signOut,
} from './lib/supabase';
import { fetchCheckoutStatus, fetchOrderProductionStatus } from './lib/checkout';
import {
  clearPendingCheckout,
  readPendingCheckout,
  type PendingCheckout,
} from './utils/pendingCheckout';
import { audioEngine } from './utils/audioEngine';
import { Header } from './components/Header';
import { MobileNav } from './components/MobileNav';
import { AdminLogin } from './components/AdminLogin';
import { CheckCircle2 } from 'lucide-react';
import { HeroSection } from './components/HeroSection';
import { StudioSignature } from './components/StudioSignature';
import { SongPlayer } from './components/SongPlayer';
import { RevisionModal } from './components/RevisionModal';
import { ProfileModal } from './components/ProfileModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import { catalogToPricingPlans, fetchPublicCatalog } from './lib/catalog';

// Estas vistas son pesadas y no deben entrar en el bundle inicial de la portada.
const CreationWizard = lazy(() => import('./components/CreationWizard/CreationWizard').then((m) => ({ default: m.CreationWizard })));
const PricingView = lazy(() => import('./components/PricingView').then((m) => ({ default: m.PricingView })));
const MySongsView = lazy(() => import('./components/MySongsView').then((m) => ({ default: m.MySongsView })));
const OrdersAdmin = lazy(() => import('./components/OrdersAdmin').then((m) => ({ default: m.OrdersAdmin })));
const CatalogAdmin = lazy(() => import('./components/CatalogAdmin').then((m) => ({ default: m.CatalogAdmin })));

/** Ids de las canciones de demostración, para poder apartarlas cuando hay reales. */
const SAMPLE_SONG_IDS = new Set(SAMPLE_SONGS.map((s) => s.id));

export default function App() {
  // Navigation tab state: 'inicio' | 'crear' | 'mis-canciones' | 'precios'
  const [currentTab, setCurrentTab] = useState<NavigationTab>('inicio');
  const [creationInitialStyle, setCreationInitialStyle] = useState<string>('pop');
  const [creationInitialPlan, setCreationInitialPlan] = useState<string>('premium');
  const [catalogPlans, setCatalogPlans] = useState<PricingPlan[]>(PRICING_PLANS);
  
  // Songs library state: prefer persisted songs; otherwise build from orders on startup; demo only if none restored
  const [songs, setSongs] = useState<Song[]>(() => {
    const saved = localStorage.getItem('melody_ai_songs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return [] as Song[];
      }
    }
    return [] as Song[];
  });

  // Sesión de usuario (Supabase Auth): identifica al usuario y protege la sección Pedidos
  const [session, setSession] = useState<Session | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const userEmail = session?.user.email || '';

  // Vuelta desde Stripe: verificación del pago y reanudación de la generación
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [resumeAfterPayment, setResumeAfterPayment] = useState<{
    orderId: string;
    formData: PendingCheckout['formData'];
    customerName: string;
    customerEmail: string;
  } | null>(null);

  const [appToast, setAppToast] = useState<string | null>(null);
  const prevUrlsRef = React.useRef<string[]>([]);

  // Player state
  const [currentPlayingSong, setCurrentPlayingSong] = useState<Song | null>(SAMPLE_SONGS[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.8);

  // Modals state
  const [revisionSong, setRevisionSong] = useState<Song | null>(null);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Pedidos: siempre desde public.orders en Supabase (sin datos de prueba locales)
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [ordersReloadKey, setOrdersReloadKey] = useState(0);

  // El catálogo público es la fuente de verdad de la pantalla de precios.
  // Si la migración aún no se ha ejecutado, mantenemos los planes históricos
  // para que la portada siga siendo navegable mientras se configura Supabase.
  useEffect(() => {
    let cancelled = false;
    fetchPublicCatalog()
      .then((products) => {
        if (cancelled) return;
        const plans = catalogToPricingPlans(products);
        if (plans.length > 0) setCatalogPlans(plans);
      })
      .catch((err) => {
        console.warn('[catalog] usando planes locales mientras se configura Supabase:', err);
      });
    return () => { cancelled = true; };
  }, []);

  // Recreate object URLs for stored MP3s on mount
  // Orders are loaded from localStorage; blobs are retrieved from IndexedDB when needed below.

  /**
   * Reconstruye la biblioteca a partir de los pedidos que ya tienen MP3.
   *
   * Sirve para que la canción sobreviva a un refresco: `mp3FileId` solo existe
   * en este dispositivo (IndexedDB), mientras que `mp3Path` apunta al bucket
   * privado y funciona desde cualquiera. No se filtra por estado del pedido:
   * lo que decide es que haya un MP3, no cómo se llame el estado.
   */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const restored: Song[] = [];
        const existingIds = new Set(songs.map((s) => s.id));

        for (const o of orders) {
          if (!o.mp3FileId && !o.mp3Path) continue;

          const id = `song-from-${o.id}`;
          if (existingIds.has(id)) continue;

          const base: Song = {
            id,
            title: (o.mp3Name || '').replace(/\.mp3$/i, '') || `Pedido - ${o.customerName}`,
            subtitle: `Para ${o.customerName}`,
            author: 'Melody AI Studio',
            genre: o.styleId,
            genreVibe: '',
            voiceName: o.voiceId,
            duration: 0,
            bpm: 120,
            story: o.story,
            dedication: {
              to: o.customerName,
              from: 'Cliente',
              occasion: '',
              message: '',
            },
            lyrics: o.lyrics || '',
            coverUrl: '',
            createdAt: o.createdAt || 'Reciente',
            planId: o.planId,
            status: 'ready',
            revisionsLeft: 0,
            isFavorite: false,
            tags: [],
            audioKey: undefined,
            mp3Name: o.mp3Name,
            mp3FileId: o.mp3FileId,
            mp3Path: o.mp3Path,
          };

          // La URL se resuelve al vuelo (IndexedDB o enlace firmado)
          const url = await resolveSongAudioUrl(base);
          if (!url) continue;

          restored.push({ ...base, mp3Url: url });
          existingIds.add(id);
        }

        if (cancelled) return;

        if (restored.length > 0) {
          setSongs((prev) => {
            const prevIds = new Set(prev.map((s) => s.id));
            // Las canciones reales van delante; la de muestra deja de estorbar
            const withoutDemo = prev.filter((s) => !SAMPLE_SONG_IDS.has(s.id));
            return [...restored.filter((r) => !prevIds.has(r.id)), ...withoutDemo];
          });
        }

        // Sin nada que mostrar, se deja la demo
        setTimeout(() => {
          setSongs((prev) => (prev.length === 0 ? SAMPLE_SONGS : prev));
        }, 0);
      } catch (err) {
        console.error('Error restoring songs from orders', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [orders]);

  /**
   * Vuelta desde Stripe. El confeti depende SOLO de lo que diga el servidor
   * tras consultar la sesión a Stripe: los parámetros de la URL por sí solos
   * no bastan (cualquiera podría escribirlos a mano).
   */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const outcome = params.get('checkout');
    if (!outcome) return;

    // La URL se limpia enseguida para que un refresco no repita el proceso
    const cleanUrl = () => {
      window.history.replaceState({}, '', window.location.pathname);
    };

    if (outcome === 'cancel') {
      console.log('[checkout] pago cancelado por el cliente');
      clearPendingCheckout();
      cleanUrl();
      setAppToast('Pago cancelado. No se te ha cobrado nada.');
      setTimeout(() => setAppToast(null), 5000);
      return;
    }

    if (outcome !== 'success') {
      cleanUrl();
      return;
    }

    const sessionId = params.get('session_id');
    if (!sessionId) {
      cleanUrl();
      return;
    }

    let cancelled = false;
    setIsVerifyingPayment(true);

    (async () => {
      try {
        const result = await fetchCheckoutStatus(sessionId);
        if (cancelled) return;

        console.log('[checkout] estado devuelto por el servidor:', result);

        if (!result.paid) {
          // Pago no confirmado: ni confeti ni canción
          setAppToast('El pago no se ha confirmado. Revisa tu método de pago.');
          setTimeout(() => setAppToast(null), 6000);
          clearPendingCheckout();
          return;
        }

        // Pago confirmado: se retoma el asistente donde se quedó
        const pending = readPendingCheckout();
        if (pending && (!result.orderId || pending.orderId === result.orderId)) {
          setResumeAfterPayment({
            orderId: pending.orderId,
            formData: pending.formData,
            customerName: pending.customer.name,
            customerEmail: pending.customer.email,
          });
          setCurrentTab('crear');
        } else {
          // Se pagó, pero se perdió el contexto (otra pestaña, sesión limpiada)
          setAppToast('Pago confirmado. Tu pedido ya está registrado.');
          setTimeout(() => setAppToast(null), 5000);
          clearPendingCheckout();
        }
        // La lista de Pedidos se recarga para reflejar el nuevo estado
        setOrdersReloadKey((k) => k + 1);
      } catch (err) {
        console.error('[checkout] no se pudo verificar el pago:', err);
        if (cancelled) return;
        setAppToast(
          err instanceof Error ? `No se pudo verificar el pago: ${err.message}` : 'No se pudo verificar el pago.'
        );
        setTimeout(() => setAppToast(null), 6000);
      } finally {
        if (!cancelled) {
          setIsVerifyingPayment(false);
          cleanUrl();
        }
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Si el navegador se refrescó después de volver de Stripe, el pedido pagado
  // se puede reanudar usando el contexto de esta pestaña.
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('checkout')) return;
    const pending = readPendingCheckout();
    if (!pending) return;
    let cancelled = false;
    (async () => {
      try {
        const status = await fetchOrderProductionStatus(pending.orderId);
        if (cancelled || status.status !== 'paid' || status.generationStatus === 'lyrics_ready') return;
        setResumeAfterPayment({
          orderId: pending.orderId,
          formData: pending.formData,
          customerName: pending.customer.name,
          customerEmail: pending.customer.email,
        });
        setCurrentTab('crear');
      } catch {
        // La sesión pendiente puede pertenecer a un pedido aún no pagado.
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Limpieza única: la lista de pedidos ya no se cachea en local (antes guardaba
  // los pedidos de prueba). Se borra la clave para no dejar datos ficticios sueltos.
  useEffect(() => {
    try {
      localStorage.removeItem('melody_ai_orders');
    } catch (e) {
      /* almacenamiento no disponible: nada que limpiar */
    }
  }, []);

  // Sesión: estado inicial + suscripción a cambios (login/logout)
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const currentSession = await getCurrentSession();
        if (!cancelled) setSession(currentSession);
      } catch (err) {
        console.error('No se pudo comprobar la sesión', err);
      } finally {
        if (!cancelled) setAuthChecked(true);
      }
    })();

    const unsubscribe = onAuthChange((nextSession) => {
      setSession(nextSession);
      setAuthChecked(true);
    });

    return () => {
      cancelled = true;
      unsubscribe();
    };
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsProfileModalOpen(false);
      setAppToast('Sesión cerrada');
      setTimeout(() => setAppToast(null), 3000);
    } catch (err) {
      console.error('No se pudo cerrar la sesión', err);
      setAppToast('No se pudo cerrar la sesión');
      setTimeout(() => setAppToast(null), 3000);
    }
  };

  // Los pedidos solo se consultan con la sesión iniciada: sin sesión, la lista
  // se vacía para que no quede nada visible del usuario anterior.
  useEffect(() => {
    if (!session) {
      setOrders([]);
      setOrdersError(null);
      setOrdersLoading(false);
      return;
    }

    let cancelled = false;
    setOrdersLoading(true);
    setOrdersError(null);

    (async () => {
      try {
        const remoteOrders = await fetchOrdersFromSupabase();
        if (cancelled) return;
        setOrders(remoteOrders);
      } catch (err) {
        console.error('Supabase fetch orders failed', err);
        if (cancelled) return;
        setOrders([]);
        setOrdersError(describeOrdersError(err));
      } finally {
        if (!cancelled) setOrdersLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [session, ordersReloadKey]);

  // Sync songs to localStorage
  useEffect(() => {
    try {
      const sanitized = songs.map(({ mp3Url, ...rest }) => rest);
      localStorage.setItem('melody_ai_songs', JSON.stringify(sanitized));
    } catch (e) {
      console.error('Failed to persist songs', e);
    }
  }, [songs]);

  // Revoke object URLs when songs change or on unmount to avoid leaks.
  useEffect(() => {
    const prev = prevUrlsRef.current || [];
    const current = songs.map((s) => s.mp3Url).filter(Boolean) as string[];
    // revoke urls that were present before but not now
    for (const url of prev) {
      if (!current.includes(url)) {
        try { URL.revokeObjectURL(url); } catch (e) {}
      }
    }
    prevUrlsRef.current = current;
    return () => {
      // on unmount revoke current
      for (const url of current) {
        try { URL.revokeObjectURL(url); } catch (e) {}
      }
    };
  }, [songs]);

  // Provide a small global toast rendered from App so OrdersAdmin can trigger it on save

  // Audio Engine listeners
  useEffect(() => {
    const unsubscribe = audioEngine.onStateChange((state) => {
      setIsPlaying(state.isPlaying);
      setCurrentTime(state.currentTime);
    });
    return () => unsubscribe();
  }, []);

  // Player controls
  const handleTogglePlay = () => {
    if (!currentPlayingSong) {
      if (songs.length > 0) {
        handlePlaySong(songs[0]);
      }
      return;
    }

    if (isPlaying) {
      audioEngine.pause();
    } else {
      // resume() respeta el modo activo: reanuda el MP3 o la melodía sintetizada
      audioEngine.resume();
    }
  };

  /**
   * Reproduce una canción. Si tiene MP3 real (subido a un pedido) suena el
   * archivo; si no, se sintetiza la melodía de muestra por género.
   */
  const handlePlaySong = (song: Song) => {
    if (!hasRealAudio(song)) {
      if (song.status !== 'ready') {
        setAppToast('El audio todavía está en producción. El administrador lo añadirá al pedido.');
        setTimeout(() => setAppToast(null), 4000);
        return;
      }
      setCurrentPlayingSong(song);
      audioEngine.play(song.audioKey || 'pop', song.bpm || 120);
      return;
    }

    setCurrentPlayingSong(song);
    (async () => {
      try {
        const url = await resolveSongAudioUrl(song);
        if (!url) {
          // El MP3 consta pero no se puede recuperar: no se disimula con la muestra
          console.error('[audio] no se pudo obtener el MP3 de', song.id);
          setAppToast('No se pudo cargar el MP3 de esta canción');
          setTimeout(() => setAppToast(null), 4000);
          return;
        }
        // Se guarda la URL resuelta para no volver a firmarla en cada play
        if (url !== song.mp3Url) {
          setSongs((prev) => prev.map((x) => (x.id === song.id ? { ...x, mp3Url: url } : x)));
          setCurrentPlayingSong((prev) => (prev && prev.id === song.id ? { ...prev, mp3Url: url } : prev));
        }
        audioEngine.playFile(url);
      } catch (err) {
        console.error('[audio] error reproduciendo el MP3', err);
        setAppToast('No se pudo reproducir el MP3');
        setTimeout(() => setAppToast(null), 4000);
      }
    })();
  };

  const handleNextSong = () => {
    if (!currentPlayingSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentPlayingSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    handlePlaySong(songs[nextIndex]);
  };

  const handlePrevSong = () => {
    if (!currentPlayingSong || songs.length === 0) return;
    const currentIndex = songs.findIndex((s) => s.id === currentPlayingSong.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    handlePlaySong(songs[prevIndex]);
  };

  const handleSeek = (time: number) => {
    audioEngine.seek(time);
    setCurrentTime(time);
  };

  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    audioEngine.setVolume(newVolume);
  };

  // Creation workflow actions
  const handleStartCreation = (
    styleId: string = 'pop',
    planId: string = 'premium'
  ) => {
    setCreationInitialStyle(styleId);
    setCreationInitialPlan(planId);
    setCurrentTab('crear');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSongCreated = (newSong: Song) => {
    clearPendingCheckout();
    setResumeAfterPayment(null);
    setSongs((prev) => [newSong, ...prev]);
    setCurrentTab('mis-canciones');
    if (newSong.status === 'ready') handlePlaySong(newSong);
    else {
          setAppToast('Pedido confirmado. Tu canción ha pasado a producción.');
      setTimeout(() => setAppToast(null), 5000);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleOrderUpdated = (orderId: string, updates: Partial<Order>) => {
    setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o)));
  };

  const handleToggleFavorite = (songId: string) => {
    setSongs((prev) =>
      prev.map((s) => (s.id === songId ? { ...s, isFavorite: !s.isFavorite } : s))
    );
  };

  const handleOpenRevisionModal = (song: Song) => {
    setRevisionSong(song);
    setIsRevisionModalOpen(true);
  };

  const handleSubmitRevision = (req: RevisionRequest) => {
    setSongs((prev) =>
      prev.map((s) => {
        if (s.id === req.songId) {
          return {
            ...s,
            status: 'review_requested',
            revisionsLeft: Math.max(0, s.revisionsLeft - 1),
          };
        }
        return s;
      })
    );
  };

  /** El botón de perfil abre el login si no hay sesión, o el perfil real si la hay */
  const handleOpenProfile = () => {
    if (session) {
      setIsProfileModalOpen(true);
    } else {
      setIsAuthModalOpen(true);
    }
  };

  // La biblioteca del cliente nunca debe mezclar las canciones de muestra
  // de la portada con sus encargos reales.
  const librarySongs = session ? songs.filter((song) => !SAMPLE_SONG_IDS.has(song.id)) : [];

  const handleNavigate = (tab: NavigationTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#111014] text-[#F7F1E7] flex flex-col selection:bg-[#FF715B]/30 selection:text-[#F7F1E7] font-sans antialiased overflow-x-hidden">
      
      {/* Top Fixed Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        onStartCreation={() => handleStartCreation('pop')}
        onOpenProfile={handleOpenProfile}
        userEmail={userEmail}
      />

      {/* Verificación del pago al volver de Stripe (antes de cualquier confeti) */}
      {isVerifyingPayment && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl shadow-indigo-950/80 text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full border-2 border-indigo-500/40 border-t-indigo-400 animate-spin" />
            <h3 className="text-lg font-black text-white tracking-tight">Confirmando tu pago</h3>
            <p className="text-xs text-slate-400 mt-1.5">
              Estamos verificando el cobro con Stripe. No cierres esta ventana.
            </p>
          </div>
        </div>
      )}

      {/* Global App Toast */}
      {appToast && (
        <div className="fixed top-24 right-5 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-indigo-600/40 flex items-center gap-2 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{appToast}</span>
        </div>
      )}

      {/* Main Content View Switcher */}
      <Suspense fallback={<div className="flex-1 min-h-screen pt-32 text-center text-slate-400">Cargando estudio…</div>}>
      <div className="flex-1">
        {currentTab === 'inicio' && (
          <div className="animate-fadeIn">
            {/* Hero Section */}
            <HeroSection
              onStartCreation={() => handleStartCreation('pop')}
              featuredSong={SAMPLE_SONGS[0]}
              isPlayingFeatured={isPlaying && currentPlayingSong?.id === SAMPLE_SONGS[0].id}
              onToggleFeaturedPlay={() => {
                if (isPlaying && currentPlayingSong?.id === SAMPLE_SONGS[0].id) {
                  audioEngine.pause();
                } else {
                  handlePlaySong(SAMPLE_SONGS[0]);
                }
              }}
            />

            {/* Signature visual del estudio */}
            <StudioSignature />
          </div>
        )}

        {currentTab === 'crear' && (
          <CreationWizard
            key={
              resumeAfterPayment
                ? `wizard-resume-${resumeAfterPayment.orderId}`
                : `wizard-${creationInitialStyle}-${creationInitialPlan}`
            }
            initialStyleId={creationInitialStyle}
            initialPlanId={creationInitialPlan}
            catalogPlans={catalogPlans}
            onCancel={() => handleNavigate('inicio')}
            onSongCreated={handleSongCreated}
            onOrderUpdated={handleOrderUpdated}
            onOpenPricing={() => handleNavigate('precios')}
            resumeAfterPayment={resumeAfterPayment}
          />
        )}

        {currentTab === 'precios' && (
          <PricingView
            plans={catalogPlans}
            onSelectPlan={(plan) => handleStartCreation('pop', plan.id)}
            onStartCreationWithPlan={(planId) => handleStartCreation('pop', planId)}
          />
        )}

        {currentTab === 'mis-canciones' && (
          <MySongsView
            songs={librarySongs}
            currentPlayingSong={currentPlayingSong}
            isPlaying={isPlaying}
            onPlaySong={handlePlaySong}
            onToggleFavorite={handleToggleFavorite}
            onOpenRevisionModal={handleOpenRevisionModal}
            onStartCreation={() => handleStartCreation('pop')}
            onSetSongMp3Url={(songId: string, url: string) => {
              setSongs((prev) => prev.map((s) => (s.id === songId ? { ...s, mp3Url: url } : s)));
            }}
          />
        )}

        {/* Pedidos: sección privada. Sin sesión se muestra "Acceso restringido" */}
        {currentTab === 'pedidos' && !session && (
          <AdminLogin isChecking={!authChecked} />
        )}

        {currentTab === 'pedidos' && session && (
          <OrdersAdmin
            adminEmail={userEmail}
            onSignOut={handleSignOut}
            orders={orders}
            isLoading={ordersLoading}
            error={ordersError}
            onReload={() => setOrdersReloadKey((k) => k + 1)}
            onUpdateOrder={(orderId, updates) =>
              setOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, ...updates } : o)))
            }
            onShowToast={(msg: string) => {
              setAppToast(msg);
              setTimeout(() => setAppToast(null), 3000);
            }}
            onCompleteOrderWithSong={(orderId, mp3FileId, mp3Name, song) => {
              (async () => {
                // El pedido queda marcado con su MP3
                setOrders((prev) =>
                  prev.map((o) =>
                    o.id === orderId
                      ? { ...o, status: 'Completado', mp3FileId, mp3Name, mp3Path: song.mp3Path }
                      : o
                  )
                );

                // URL reproducible: IndexedDB si está, si no el bucket privado
                let mp3Url: string | undefined;
                try {
                  const resolved = await resolveSongAudioUrl(song);
                  mp3Url = resolved || undefined;
                } catch (err) {
                  console.error('[audio] no se pudo preparar el MP3 subido', err);
                }

                const songWithMp3: Song = { ...song, mp3Url, mp3Name, mp3FileId };

                // Entra en la biblioteca y se aparta la canción de muestra
                setSongs((prev) => {
                  const sinDemo = prev.filter((x) => !SAMPLE_SONG_IDS.has(x.id));
                  const sinDuplicado = sinDemo.filter((x) => x.id !== songWithMp3.id);
                  return [songWithMp3, ...sinDuplicado];
                });

                setCurrentTab('mis-canciones');

                // Pasa a ser lo que suena, en lugar de la muestra
                if (mp3Url) {
                  setCurrentPlayingSong(songWithMp3);
                  audioEngine.playFile(mp3Url);
                } else {
                  setAppToast('El MP3 se guardó, pero no se pudo cargar para reproducir');
                  setTimeout(() => setAppToast(null), 4000);
                }
              })();
            }}
          />
        )}

        {currentTab === 'catalogo' && !session && (
          <AdminLogin isChecking={!authChecked} />
        )}

        {currentTab === 'catalogo' && session && (
          <CatalogAdmin
            accessToken={session.access_token}
            adminEmail={userEmail}
            onShowToast={(msg) => {
              setAppToast(msg);
              setTimeout(() => setAppToast(null), 3000);
            }}
          />
        )}
      </div>
      </Suspense>

      {/* Persistent Audio Player Bar: the home hero has its own featured player. */}
      {currentTab !== 'inicio' && (currentTab !== 'mis-canciones' || librarySongs.length > 0) && (
        <SongPlayer
          currentSong={currentPlayingSong}
          isPlaying={isPlaying}
          currentTime={currentTime}
          volume={volume}
          onTogglePlay={handleTogglePlay}
          onNext={handleNextSong}
          onPrev={handlePrevSong}
          onSeek={handleSeek}
          onVolumeChange={handleVolumeChange}
        />
      )}

      {/* Mobile Floating Bottom Dock */}
      <MobileNav
        currentTab={currentTab}
        onSelectTab={handleNavigate}
        onOpenProfile={handleOpenProfile}
        isSignedIn={Boolean(session)}
      />

      {/* Revision Request Modal */}
      <RevisionModal
        song={revisionSong}
        isOpen={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        onSubmitRevision={handleSubmitRevision}
      />

      {/* User Profile Modal (solo con sesión: muestra el correo autenticado) */}
      <ProfileModal
        isOpen={isProfileModalOpen && Boolean(session)}
        onClose={() => setIsProfileModalOpen(false)}
        userEmail={userEmail}
        songsCount={songs.length}
        onSignOut={handleSignOut}
      />

      {/* Login con email y contraseña (Supabase Auth) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSignedIn={(email) => {
          setAppToast(`Sesión iniciada como ${email}`);
          setTimeout(() => setAppToast(null), 3000);
        }}
      />

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSelectGenre={(genreId) => handleStartCreation(genreId)}
      />

    </div>
  );
}
