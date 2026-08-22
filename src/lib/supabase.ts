import { createClient } from '@supabase/supabase-js';
import type { Session } from '@supabase/supabase-js';
import type { Order } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
// Clave pública del frontend. Preferimos la nueva publishable key de Supabase
// y mantenemos anon como fallback para instalaciones antiguas.
const SUPABASE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: {
    // La sesion sobrevive al refresco de pagina y se renueva sola
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

// ============================================================================
// Pedidos: tabla public.orders
// ----------------------------------------------------------------------------
// La tabla usa snake_case; el tipo `Order` de la app usa camelCase. Todo el
// mapeo entre ambos vive aquí, de modo que los componentes siguen trabajando
// con `Order` sin enterarse de los nombres de columna.
//
// Columnas reales: id, customer_name, customer_email, story, style, voice,
// plan, price, status, created_at, mp3_name, mp3_path, media_files.
// `mp3FileId` y `mp3Url` son locales (IndexedDB / object URL) y no se envían.
// ============================================================================

export const ORDERS_TABLE = 'orders';

/** Fila tal y como la devuelve PostgREST. */
interface OrderRow {
  id: string;
  customer_name?: string | null;
  customer_email?: string | null;
  story?: string | null;
  style?: string | null;
  voice?: string | null;
  plan?: string | null;
  price?: number | string | null;
  status?: string | null;
  created_at?: string | null;
  mp3_name?: string | null;
  mp3_path?: string | null;
  media_files?: unknown;
  catalog_product_id?: string | null;
  catalog_price_id?: string | null;
  stripe_checkout_session_id?: string | null;
  stripe_payment_intent_id?: string | null;
  generation_status?: string | null;
  generated_audio_path?: string | null;
  lyrics?: string | null;
}

/** Fecha ISO de Postgres -> texto corto en español para la tabla. */
function formatOrderDate(value?: string | null): string {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Fila de Supabase -> `Order` de la app. */
export function mapRowToOrder(row: OrderRow): Order {
  const price = typeof row.price === 'string' ? parseFloat(row.price) : row.price;
  return {
    id: row.id,
    customerName: row.customer_name || '',
    email: row.customer_email || '',
    story: row.story || '',
    styleId: row.style || '',
    voiceId: row.voice || '',
    planId: (row.plan || 'esencial') as Order['planId'],
    priceNumber: Number.isFinite(price as number) ? (price as number) : 0,
    status: (row.status || 'Nuevo pedido') as Order['status'],
    createdAt: formatOrderDate(row.created_at),
    mp3Name: row.mp3_name || undefined,
    mp3Path: row.mp3_path || undefined,
    mediaFiles: Array.isArray(row.media_files) ? (row.media_files as Order['mediaFiles']) : undefined,
    catalogProductId: row.catalog_product_id || undefined,
    catalogPriceId: row.catalog_price_id || undefined,
    stripeCheckoutSessionId: row.stripe_checkout_session_id || undefined,
    stripePaymentIntentId: row.stripe_payment_intent_id || undefined,
    generationStatus: (row.generation_status as Order['generationStatus']) || 'not_started',
    generatedAudioPath: row.generated_audio_path || undefined,
    lyrics: row.lyrics || undefined,
  };
}

/**
 * `Order` (parcial) -> fila de Supabase. Solo se incluyen las claves presentes,
 * y se descartan las que no tienen columna (mp3Url, mp3FileId: son locales).
 */
export function mapOrderToRow(order: Partial<Order>): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  if (order.id !== undefined) row.id = order.id;
  if (order.customerName !== undefined) row.customer_name = order.customerName;
  if (order.email !== undefined) row.customer_email = order.email;
  if (order.story !== undefined) row.story = order.story;
  if (order.styleId !== undefined) row.style = order.styleId;
  if (order.voiceId !== undefined) row.voice = order.voiceId;
  if (order.planId !== undefined) row.plan = order.planId;
  if (order.priceNumber !== undefined) row.price = order.priceNumber;
  if (order.status !== undefined) row.status = order.status;
  if (order.mp3Name !== undefined) row.mp3_name = order.mp3Name;
  if (order.mp3Path !== undefined) row.mp3_path = order.mp3Path;
  if (order.mediaFiles !== undefined) row.media_files = order.mediaFiles;
  if (order.catalogProductId !== undefined) row.catalog_product_id = order.catalogProductId;
  if (order.catalogPriceId !== undefined) row.catalog_price_id = order.catalogPriceId;
  if (order.stripeCheckoutSessionId !== undefined) row.stripe_checkout_session_id = order.stripeCheckoutSessionId;
  if (order.stripePaymentIntentId !== undefined) row.stripe_payment_intent_id = order.stripePaymentIntentId;
  if (order.generationStatus !== undefined) row.generation_status = order.generationStatus;
  if (order.generatedAudioPath !== undefined) row.generated_audio_path = order.generatedAudioPath;
  if (order.lyrics !== undefined) row.lyrics = order.lyrics;
  return row;
}

/**
 * Pedidos reales de public.orders, del más reciente al más antiguo.
 * Requiere sesión iniciada: sin ella, la política de la tabla deniega la lectura.
 */
export async function fetchOrdersFromSupabase(): Promise<Order[]> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase credentials missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  }
  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return ((data || []) as OrderRow[]).map(mapRowToOrder);
}

// NOTA: el alta de pedidos ya NO se hace desde el navegador. El pedido lo crea
// el servidor en POST /api/checkout/create-session (con status 'pending') y solo
// pasa a 'paid' cuando Stripe confirma el cobro en el webhook. Así el frontend
// no puede marcar un pedido como pagado sin haber pasado por la pasarela.

/**
 * Actualiza un pedido concreto: update(...).eq('id', order.id).
 * Se usa para el cambio de estado y para adjuntar el MP3.
 */
export async function updateOrderInSupabase(
  orderId: string,
  updates: Partial<Order>
): Promise<Order | null> {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase credentials missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  }
  const { data, error } = await supabase
    .from(ORDERS_TABLE)
    .update(mapOrderToRow(updates))
    .eq('id', orderId)
    .select()
    .maybeSingle();
  if (error) throw error;
  return data ? mapRowToOrder(data as OrderRow) : null;
}

/** Mensajes claros para los fallos al leer/escribir pedidos. */
export function describeOrdersError(err: unknown): string {
  const anyErr = err as { code?: string; message?: string } | null;
  const code = anyErr?.code || '';
  const message = anyErr?.message || 'Error desconocido';
  if (code === '42501' || /permission denied/i.test(message)) {
    return 'Tu usuario no tiene permiso para leer la tabla orders. Revisa las políticas RLS y los permisos del rol authenticated en Supabase.';
  }
  if (code === '42P01' || /does not exist/i.test(message)) {
    return 'La tabla public.orders no existe en este proyecto de Supabase.';
  }
  if (code === 'PGRST301' || /JWT|token/i.test(message)) {
    return 'Tu sesión ha caducado. Vuelve a iniciar sesión.';
  }
  if (/fetch|network/i.test(message)) {
    return 'Sin conexión con Supabase. Revisa tu red.';
  }
  return message;
}

export async function uploadSongToSupabase(path: string, file: Blob | File) {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error('Supabase credentials missing');
  }
  // Attempt upload to storage bucket 'songs'
  const storage = supabase.storage.from('songs');
  const { error } = await storage.upload(path, file, { upsert: true });
  if (error) throw error;
  // try to get a public URL (may be private depending on bucket settings)
  try {
    const { data } = storage.getPublicUrl(path);
    return { path, publicUrl: data.publicUrl };
  } catch (e) {
    return { path };
  }
}

/** Bucket de los MP3 finales. Es privado: se accede con enlaces firmados. */
export const SONGS_BUCKET = 'songs';

/**
 * Enlace temporal firmado para reproducir o descargar el MP3 de un pedido.
 * El bucket `songs` es privado, así que getPublicUrl() no sirve.
 */
export async function createSongSignedUrl(
  path: string,
  expiresIn = 3600,
  downloadName?: string
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials missing');
  }
  const { data, error } = await supabase.storage
    .from(SONGS_BUCKET)
    .createSignedUrl(path, expiresIn, downloadName ? { download: downloadName } : undefined);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error('No se pudo generar el enlace del MP3');
  return data.signedUrl;
}

/** Bucket PRIVADO con las fotos y vídeos que el cliente adjunta para su videoclip. */
export const CUSTOMER_MEDIA_BUCKET = 'customer-media';

export function isSupabaseConfigured(): boolean {
  return Boolean(SUPABASE_URL && SUPABASE_KEY);
}

/**
 * Sube un archivo del videoclip al bucket privado, dentro de la carpeta del pedido.
 * Devuelve la ruta interna: nunca se genera URL pública (el bucket sigue siendo privado).
 */
export async function uploadCustomerMediaToSupabase(
  orderId: string,
  fileName: string,
  file: Blob | File
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  }
  const path = `${orderId}/${fileName}`;
  const { error } = await supabase.storage.from(CUSTOMER_MEDIA_BUCKET).upload(path, file, {
    upsert: true,
    contentType: (file as File).type || undefined,
  });
  if (error) throw error;
  return path;
}

/**
 * Enlace firmado y temporal para descargar un archivo del bucket privado.
 * expiresIn en segundos (por defecto 5 minutos).
 */
export async function createCustomerMediaSignedUrl(
  path: string,
  expiresIn = 300,
  downloadName?: string
): Promise<string> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials missing');
  }
  const { data, error } = await supabase.storage
    .from(CUSTOMER_MEDIA_BUCKET)
    .createSignedUrl(path, expiresIn, downloadName ? { download: downloadName } : undefined);
  if (error) throw error;
  if (!data?.signedUrl) throw new Error('No se pudo generar el enlace firmado');
  return data.signedUrl;
}

/** Elimina un archivo del bucket privado (por ejemplo al descartar un pedido). */
export async function removeCustomerMediaFromSupabase(paths: string[]): Promise<void> {
  if (!isSupabaseConfigured() || paths.length === 0) return;
  const { error } = await supabase.storage.from(CUSTOMER_MEDIA_BUCKET).remove(paths);
  if (error) throw error;
}

// ============================================================================
// Autenticación de usuario (Supabase Auth, email + contraseña)
// La sesión identifica al usuario en toda la app y protege la sección Pedidos.
// ============================================================================

/** Inicio de sesión con email y contraseña (supabase.auth.signInWithPassword). */
export async function signInWithEmail(email: string, password: string): Promise<Session> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.session) throw new Error('No se pudo iniciar sesión');
  return data.session;
}

/** Registro de usuarios finales con email + contraseña. */
export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: displayName ? { full_name: displayName } : undefined,
      emailRedirectTo: window.location.origin,
    },
  });
  if (error) throw error;
  return data;
}

/** Cierre de sesión (supabase.auth.signOut). */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Traduce los errores de Supabase Auth a mensajes claros en español. */
export function describeAuthError(err: unknown): string {
  const message = err instanceof Error ? err.message : 'No se pudo iniciar sesión';
  if (/invalid login credentials/i.test(message)) return 'Email o contraseña incorrectos.';
  if (/user already registered|already been registered/i.test(message)) return 'Ya existe una cuenta con ese correo.';
  if (/password should be at least|password.*characters/i.test(message)) return 'La contraseña debe tener al menos 6 caracteres.';
  if (/email not confirmed/i.test(message)) return 'Confirma tu email antes de iniciar sesión.';
  if (/rate limit|too many/i.test(message)) return 'Demasiados intentos. Espera unos segundos.';
  if (/credentials missing/i.test(message)) {
    return 'Falta la configuración de Supabase (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).';
  }
  if (/fetch|network/i.test(message)) return 'Sin conexión con Supabase. Revisa tu red.';
  return message;
}

// --- Alias históricos del panel de administrador (siguen en uso) -------------

export async function signInAdmin(email: string, password: string): Promise<Session> {
  if (!isSupabaseConfigured()) {
    throw new Error('Supabase credentials missing (VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY)');
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  if (!data.session) throw new Error('No se pudo iniciar sesión');
  return data.session;
}

export async function signOutAdmin(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getCurrentSession(): Promise<Session | null> {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/** Suscripción a cambios de sesión. Devuelve la función para cancelarla. */
export function onAuthChange(callback: (session: Session | null) => void): () => void {
  if (!isSupabaseConfigured()) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

export default supabase;
