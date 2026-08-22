import React, { useEffect, useState } from 'react';
import { MediaAssetMeta, Order, OrderStatus, Song } from '../types';
import { saveBlob } from '../utils/indexedDb';
import {
  createCustomerMediaSignedUrl,
  describeOrdersError,
  updateOrderInSupabase,
  uploadSongToSupabase,
} from '../lib/supabase';
import { formatFileSize, getOrderMedia, uploadOrderMediaToSupabase } from '../utils/mediaFiles';
import {
  CheckCircle2,
  FileText,
  Upload,
  MoreHorizontal,
  Download,
  Film,
  Image as ImageIcon,
  Video,
  CloudUpload,
  Loader2,
  LogOut,
  AlertTriangle,
  RefreshCw,
  Inbox,
} from 'lucide-react';

interface OrdersAdminProps {
  orders: Order[];
  onUpdateOrder: (orderId: string, updates: Partial<Order>) => void;
  onCompleteOrderWithSong: (orderId: string, mp3FileId: string, mp3Name: string, song: Song) => void;
  onShowToast?: (msg: string) => void;
  adminEmail?: string;
  onSignOut?: () => void;
  /** true mientras se cargan los pedidos desde Supabase */
  isLoading?: boolean;
  /** mensaje de error si la carga falló */
  error?: string | null;
  /** reintentar la carga */
  onReload?: () => void;
}

export const OrdersAdmin: React.FC<OrdersAdminProps> = ({
  orders,
  onUpdateOrder,
  onCompleteOrderWithSong,
  onShowToast,
  adminEmail,
  onSignOut,
  isLoading = false,
  error = null,
  onReload,
}) => {
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [savingOrderId, setSavingOrderId] = useState<string | null>(null);
  const [orderMedia, setOrderMedia] = useState<MediaAssetMeta[]>([]);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);
  const [signingFileId, setSigningFileId] = useState<string | null>(null);

  // Carga los archivos del videoclip del pedido abierto (localStorage manda: lleva el estado de subida)
  useEffect(() => {
    if (!selectedOrder) {
      setOrderMedia([]);
      return;
    }
    const stored = getOrderMedia(selectedOrder.id);
    setOrderMedia(stored.length > 0 ? stored : selectedOrder.mediaFiles || []);
  }, [selectedOrder]);

  const pendingMedia = orderMedia.filter((file) => file.uploadStatus !== 'uploaded');

  /** Sube (o reintenta) al bucket privado los archivos que aún no están en customer-media. */
  const handleUploadMedia = async (order: Order) => {
    setIsUploadingMedia(true);
    try {
      const result = await uploadOrderMediaToSupabase(order.id);
      setOrderMedia(result.files);
      onUpdateOrder(order.id, { mediaFiles: result.files });
      if (result.failed > 0) {
        onShowToast && onShowToast(`Videoclip: ${result.uploaded} subidos, ${result.failed} con error`);
      } else if (result.uploaded > 0) {
        onShowToast && onShowToast(`Videoclip: ${result.uploaded} archivos subidos`);
      } else {
        onShowToast && onShowToast('Videoclip: no hay archivos pendientes');
      }
    } catch (err) {
      console.error('Error subiendo archivos del videoclip', err);
      onShowToast && onShowToast('Supabase error: no se pudieron subir los archivos');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  /** Enlace firmado temporal (bucket privado) para descargar un archivo concreto. */
  const handleDownloadMedia = async (file: MediaAssetMeta) => {
    if (!file.storagePath) return;
    setSigningFileId(file.id);
    try {
      const signedUrl = await createCustomerMediaSignedUrl(file.storagePath, 300, file.name);
      window.open(signedUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('No se pudo generar el enlace firmado', err);
      onShowToast && onShowToast('Supabase error: no se pudo generar el enlace de descarga');
    } finally {
      setSigningFileId(null);
    }
  };

  // Estados del pago (los escribe Stripe) + estados de producción del panel
  const statusOptions: OrderStatus[] = [
    'pending',
    'paid',
    'cancelled',
    'failed',
    'Nuevo pedido',
    'En producción',
    'Pendiente de revisión',
    'Completado',
  ];

  /**
   * Cambio de estado: se escribe en Supabase con update(...).eq('id', order.id).
   * La fila local se actualiza al momento y se revierte si Supabase rechaza el cambio.
   */
  const handleChangeStatus = async (order: Order, nextStatus: OrderStatus) => {
    const previousStatus = order.status;
    if (previousStatus === nextStatus) return;

    onUpdateOrder(order.id, { status: nextStatus });
    setSavingOrderId(order.id);
    try {
      await updateOrderInSupabase(order.id, { status: nextStatus });
      onShowToast && onShowToast(`Estado actualizado: ${nextStatus}`);
    } catch (err) {
      console.error('Supabase update status error', err);
      // Deshacer: en la tabla manda Supabase, no el estado local
      onUpdateOrder(order.id, { status: previousStatus });
      onShowToast && onShowToast(`No se pudo guardar: ${describeOrdersError(err)}`);
    } finally {
      setSavingOrderId(null);
    }
  };

  const [uploadingOrderId, setUploadingOrderId] = useState<string | null>(null);

  /**
   * Sube el MP3 final de un pedido.
   *
   * Los tres destinos son independientes y ninguno puede tumbar a los otros:
   *   1. IndexedDB  -> copia local, permite reproducir al instante
   *   2. bucket songs -> copia duradera (privada)
   *   3. public.orders -> mp3_name y mp3_path, para recuperarlo tras recargar
   *
   * Antes, un fallo en el paso 2 abortaba el 3 y el pedido se quedaba sin
   * rastro del MP3, que es justo lo que pasaba.
   */
  const handleFileUpload = async (order: Order, file?: File) => {
    if (!file) return;

    const fileId = `file-${order.id}-${Date.now()}`;
    const mp3Name = file.name;
    const remotePath = `${order.id}/${fileId}-${mp3Name}`;

    setUploadingOrderId(order.id);
    let localOk = false;
    let remoteOk = false;

    // --- 1. Copia local en IndexedDB ---------------------------------------
    try {
      await saveBlob(fileId, file);
      localOk = true;
    } catch (err) {
      console.error('[mp3] no se pudo guardar en IndexedDB', err);
    }

    // --- 2. Copia duradera en el bucket privado `songs` --------------------
    try {
      await uploadSongToSupabase(remotePath, file);
      remoteOk = true;
    } catch (err) {
      console.error('[mp3] no se pudo subir al bucket songs', err);
    }

    // --- 3. El pedido guarda el nombre y la ruta ---------------------------
    const updates: Partial<Order> = {
      status: 'Completado',
      generationStatus: 'ready',
      ...(remoteOk ? { generatedAudioPath: remotePath } : {}),
      mp3Name,
      mp3FileId: fileId,
      ...(remoteOk ? { mp3Path: remotePath } : {}),
    };
    onUpdateOrder(order.id, updates);

    let dbOk = false;
    try {
      await updateOrderInSupabase(order.id, {
        status: 'Completado',
        mp3Name,
        generationStatus: 'ready',
        generatedAudioPath: remoteOk ? remotePath : undefined,
        ...(remoteOk ? { mp3Path: remotePath } : {}),
      });
      dbOk = true;
    } catch (err) {
      console.error('[mp3] no se pudo guardar el MP3 en el pedido', err);
    }

    setUploadingOrderId(null);

    // --- Aviso honesto de lo que ha funcionado -----------------------------
    if (remoteOk && dbOk) {
      onShowToast && onShowToast('MP3 guardado en el pedido');
    } else if (dbOk) {
      onShowToast && onShowToast('MP3 guardado, pero no se pudo subir al almacenamiento');
    } else if (localOk) {
      onShowToast && onShowToast('MP3 disponible solo en este dispositivo: no se pudo guardar en el pedido');
    } else {
      onShowToast && onShowToast('No se pudo guardar el MP3');
      return;
    }

    // --- La canción entra en la biblioteca y pasa a sonar ------------------
    const newSong: Song = {
      id: `song-from-${order.id}`,
      title: mp3Name.replace(/\.mp3$/i, '') || `Pedido - ${order.customerName}`,
      subtitle: `Para ${order.customerName}`,
      author: 'Melody AI Studio',
      genre: order.styleId,
      genreVibe: '',
      voiceName: order.voiceId,
      duration: 0, // la real la aporta el propio MP3 al cargarse
      bpm: 120,
      story: order.story,
      dedication: {
        to: order.customerName,
        from: 'Cliente',
        occasion: '',
        message: '',
      },
      lyrics: order.lyrics || '',
      coverUrl: '',
      createdAt: 'Reciente',
      planId: order.planId,
      status: 'ready',
      revisionsLeft: 0,
      isFavorite: false,
      tags: [],
      // Sin audioKey: así nadie la confunde con una canción sintetizada
      audioKey: undefined,
      mp3FileId: localOk ? fileId : undefined,
      mp3Path: remoteOk ? remotePath : undefined,
      mp3Name,
    };

    onCompleteOrderWithSong(order.id, fileId, mp3Name, newSong);
  };

  return (
    <div className="melody-workspace pt-24 pb-32 min-h-screen bg-[#111014] text-[#f7f1e7]">
      <div className="max-w-[1360px] mx-auto px-5 lg:px-12">
        <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <FileText className="w-3.5 h-3.5" />
              <span>Panel Privado</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Pedidos</h1>
            <p className="text-slate-400 text-sm mt-1">
              {isLoading
                ? 'Cargando pedidos desde Supabase...'
                : error
                ? 'No se pudieron cargar los pedidos.'
                : `${orders.length} ${orders.length === 1 ? 'pedido' : 'pedidos'} en Supabase.`}
            </p>
          </div>

          {onSignOut && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {adminEmail && (
                <span className="text-xs text-slate-400 truncate max-w-[200px]" title={adminEmail}>
                  {adminEmail}
                </span>
              )}
              <button
                onClick={onSignOut}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Cerrar sesión</span>
              </button>
            </div>
          )}
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4">
          {/* Estado: cargando */}
          {isLoading && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
              <p className="text-sm font-semibold">Cargando pedidos...</p>
            </div>
          )}

          {/* Estado: error */}
          {!isLoading && error && (
            <div className="py-12 px-4">
              <div className="max-w-lg mx-auto rounded-2xl border border-rose-500/40 bg-rose-500/10 px-5 py-5 text-center">
                <AlertTriangle className="w-7 h-7 text-rose-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-rose-100 mb-1">Error al cargar los pedidos</p>
                <p className="text-xs text-rose-200/90 leading-relaxed break-words">{error}</p>
                {onReload && (
                  <button
                    onClick={onReload}
                    className="mt-4 px-4 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-200 text-xs font-bold border border-slate-700 inline-flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reintentar</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Estado: sin pedidos */}
          {!isLoading && !error && orders.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-slate-400">
              <Inbox className="w-8 h-8 text-slate-500" />
              <p className="text-sm font-semibold text-slate-300">Todavía no hay pedidos</p>
              <p className="text-xs text-slate-400">Los pedidos aparecerán aquí en cuanto se confirme un checkout.</p>
              {onReload && (
                <button
                  onClick={onReload}
                  className="mt-2 px-4 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-300 text-xs font-semibold border border-slate-700 inline-flex items-center gap-2 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Actualizar</span>
                </button>
              )}
            </div>
          )}

          {!isLoading && !error && orders.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="text-slate-400 text-xs">
                  <th className="px-4 py-3">Cliente</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Historia</th>
                  <th className="px-4 py-3">Estilo</th>
                  <th className="px-4 py-3">Voz</th>
                  <th className="px-4 py-3">Plan</th>
                  <th className="px-4 py-3">Precio</th>
                  <th className="px-4 py-3">Estado</th>
                  <th className="px-4 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-t border-slate-700/60 hover:bg-slate-900/30 transition-colors">
                    <td className="px-4 py-3 align-top text-white font-semibold">{order.customerName}</td>
                    <td className="px-4 py-3 align-top text-slate-300">{order.email}</td>
                    <td className="px-4 py-3 align-top text-slate-300 max-w-xs truncate">{order.story}</td>
                    <td className="px-4 py-3 align-top text-slate-300">{order.styleId}</td>
                    <td className="px-4 py-3 align-top text-slate-300">{order.voiceId}</td>
                    <td className="px-4 py-3 align-top text-slate-300">{order.planId}</td>
                    <td className="px-4 py-3 align-top text-slate-300">{order.priceNumber.toFixed(2)} €</td>
                    <td className="px-4 py-3 align-top">
                      <div className="inline-flex items-center gap-2">
                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-slate-900/60 border border-slate-700 text-slate-300">{order.status}</span>
                        {order.generationStatus && order.generationStatus !== 'not_started' && (
                          <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-200">
                            {order.generationStatus === 'lyrics_ready' ? 'Letra lista' : order.generationStatus === 'ready' ? 'Audio listo' : order.generationStatus}
                          </span>
                        )}
                        {savingOrderId === order.id && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-slate-300 text-xs font-semibold border border-slate-700"
                        >
                          Detalles
                        </button>

                        <div className="relative">
                          <select
                            value={order.status}
                            disabled={savingOrderId === order.id}
                            onChange={(e) => handleChangeStatus(order, e.target.value as OrderStatus)}
                            className="bg-slate-900/80 text-xs text-slate-300 px-3 py-2 rounded-lg border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {statusOptions.map((s) => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="file"
                            accept="audio/mpeg,audio/mp3"
                            className="sr-only"
                            disabled={uploadingOrderId === order.id}
                            onChange={(e) => handleFileUpload(order, e.target.files?.[0])}
                          />
                          <span className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2">
                            {uploadingOrderId === order.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            {uploadingOrderId === order.id ? 'Subiendo...' : 'Subir MP3'}
                          </span>
                        </label>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>

        {/* Details Modal (simple) */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold text-white">Detalles de {selectedOrder.customerName}</h3>
                  <p className="text-sm text-slate-400 mt-1">{selectedOrder.email} • {selectedOrder.createdAt}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400">Cerrar</button>
              </div>

              <div className="mt-4 text-slate-300 space-y-3 text-sm">
                <p><strong>Historia:</strong> {selectedOrder.story}</p>
                <p><strong>Estilo:</strong> {selectedOrder.styleId}</p>
                <p><strong>Voz:</strong> {selectedOrder.voiceId}</p>
                <p><strong>Plan:</strong> {selectedOrder.planId} — {selectedOrder.priceNumber.toFixed(2)} €</p>
                <p><strong>Estado:</strong> {selectedOrder.status}</p>
                <p><strong>Producción:</strong> {selectedOrder.generationStatus || 'not_started'}</p>

                {selectedOrder.lyrics && (
                  <div className="pt-3 border-t border-slate-700/60">
                    <strong className="text-slate-200">Letra generada</strong>
                    <pre className="mt-2 max-h-64 overflow-y-auto whitespace-pre-wrap rounded-xl bg-slate-950/70 border border-slate-700 p-3 text-xs leading-relaxed text-slate-300">{selectedOrder.lyrics}</pre>
                  </div>
                )}

                {/* Fotos y videos del videoclip: bucket privado customer-media, carpeta <pedido>/ */}
                {orderMedia.length > 0 && (
                  <div className="pt-3 border-t border-slate-700/60">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <strong className="flex items-center gap-1.5 text-slate-200">
                        <Film className="w-4 h-4 text-indigo-400" />
                        <span>Videoclip ({orderMedia.length} archivos)</span>
                      </strong>

                      {pendingMedia.length > 0 && (
                        <button
                          onClick={() => handleUploadMedia(selectedOrder)}
                          disabled={isUploadingMedia}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          {isUploadingMedia ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CloudUpload className="w-3.5 h-3.5" />
                          )}
                          <span>Subir pendientes ({pendingMedia.length})</span>
                        </button>
                      )}
                    </div>

                    <ul className="space-y-2">
                      {orderMedia.map((file) => {
                        const isUploaded = file.uploadStatus === 'uploaded' && Boolean(file.storagePath);
                        return (
                          <li
                            key={file.id}
                            className="flex items-center justify-between gap-3 bg-slate-900/60 border border-slate-700 rounded-lg px-3 py-2 text-xs"
                          >
                            <div className="min-w-0 flex items-center gap-2">
                              {file.kind === 'image' ? (
                                <ImageIcon className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                              ) : (
                                <Video className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                              )}
                              <div className="min-w-0">
                                <p className="truncate text-slate-200" title={file.name}>{file.name}</p>
                                <p className="font-mono text-[10px] text-slate-400">
                                  {formatFileSize(file.size)}
                                  {file.storagePath ? ` • ${file.storagePath}` : ''}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span
                                title={file.uploadError || ''}
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                                  isUploaded
                                    ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                    : file.uploadStatus === 'error'
                                    ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                                    : 'bg-slate-800 text-slate-300 border-slate-700'
                                }`}
                              >
                                {isUploaded ? 'Subido' : file.uploadStatus === 'error' ? 'Error' : 'Pendiente'}
                              </span>

                              <button
                                onClick={() => handleDownloadMedia(file)}
                                disabled={!isUploaded || signingFileId === file.id}
                                title={isUploaded ? 'Descargar con enlace firmado (5 min)' : 'Aún no está en customer-media'}
                                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors"
                              >
                                {signingFileId === file.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Download className="w-3.5 h-3.5" />
                                )}
                                <span>Descargar</span>
                              </button>
                            </div>
                          </li>
                        );
                      })}
                    </ul>

                    <p className="text-[10px] text-slate-400 mt-2">
                      Bucket privado <span className="font-mono">customer-media</span> • los enlaces de descarga se firman al momento y caducan en 5 minutos.
                    </p>
                  </div>
                )}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 rounded-lg bg-slate-900/80 text-slate-300 border border-slate-700"
                >Cerrar</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default OrdersAdmin;
