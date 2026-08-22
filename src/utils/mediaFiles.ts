import { MediaAssetMeta, MediaAttachment } from '../types';
import { saveBlob, getBlob, deleteBlob } from './indexedDb';
import {
  isSupabaseConfigured,
  removeCustomerMediaFromSupabase,
  uploadCustomerMediaToSupabase,
} from '../lib/supabase';

/** Límites iniciales del videoclip personalizado (fáciles de subir más adelante). */
export const MEDIA_MAX_FILES = 10;
export const MEDIA_MAX_TOTAL_BYTES = 500 * 1024 * 1024; // 500 MB

export const MEDIA_ACCEPTED_MIME: string[] = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'video/mp4',
  'video/quicktime',
  'video/webm',
];

export const MEDIA_ACCEPTED_EXTENSIONS: string[] = [
  '.jpg',
  '.jpeg',
  '.png',
  '.webp',
  '.mp4',
  '.mov',
  '.webm',
];

/** Valor para el atributo accept del input file. */
export const MEDIA_ACCEPT_ATTR = [...MEDIA_ACCEPTED_MIME, ...MEDIA_ACCEPTED_EXTENSIONS].join(',');

const VIDEO_EXTENSIONS = ['.mp4', '.mov', '.webm'];

function getExtension(name: string): string {
  const idx = name.lastIndexOf('.');
  return idx === -1 ? '' : name.slice(idx).toLowerCase();
}

/** Algunos navegadores no rellenan el MIME (típico en .mov), por eso miramos también la extensión. */
export function isAcceptedMediaFile(file: File): boolean {
  const mime = (file.type || '').toLowerCase();
  if (mime && MEDIA_ACCEPTED_MIME.includes(mime)) return true;
  return MEDIA_ACCEPTED_EXTENSIONS.includes(getExtension(file.name));
}

export function getMediaKind(file: File): 'image' | 'video' {
  const mime = (file.type || '').toLowerCase();
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('image/')) return 'image';
  return VIDEO_EXTENSIONS.includes(getExtension(file.name)) ? 'video' : 'image';
}

export function formatFileSize(bytes: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export function totalMediaSize(items: { size: number }[]): number {
  return items.reduce((sum, item) => sum + item.size, 0);
}

export interface MediaSelectionResult {
  accepted: MediaAttachment[];
  errors: string[];
}

/**
 * Valida los archivos elegidos contra los ya añadidos: formato, duplicados,
 * número máximo de archivos y tamaño total máximo.
 */
export function buildMediaAttachments(
  files: File[],
  existing: MediaAttachment[]
): MediaSelectionResult {
  const accepted: MediaAttachment[] = [];
  const errors: string[] = [];

  let count = existing.length;
  let totalBytes = totalMediaSize(existing);

  for (const file of files) {
    if (!isAcceptedMediaFile(file)) {
      errors.push(`"${file.name}": formato no admitido (usa JPG, PNG, WEBP, MP4, MOV o WEBM).`);
      continue;
    }

    const isDuplicate =
      existing.some((item) => item.name === file.name && item.size === file.size) ||
      accepted.some((item) => item.name === file.name && item.size === file.size);
    if (isDuplicate) {
      errors.push(`"${file.name}": ya lo has añadido.`);
      continue;
    }

    if (count >= MEDIA_MAX_FILES) {
      errors.push(`"${file.name}": has alcanzado el máximo de ${MEDIA_MAX_FILES} archivos.`);
      continue;
    }

    if (totalBytes + file.size > MEDIA_MAX_TOTAL_BYTES) {
      errors.push(
        `"${file.name}": superarías el límite de ${formatFileSize(MEDIA_MAX_TOTAL_BYTES)} en total.`
      );
      continue;
    }

    accepted.push({
      id: `media-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: file.name,
      size: file.size,
      type: file.type || (getMediaKind(file) === 'video' ? 'video/*' : 'image/*'),
      kind: getMediaKind(file),
      file,
      previewUrl: URL.createObjectURL(file),
    });

    count += 1;
    totalBytes += file.size;
  }

  return { accepted, errors };
}

export function toMediaAssetMeta(item: MediaAttachment | MediaAssetMeta): MediaAssetMeta {
  return {
    id: item.id,
    name: item.name,
    size: item.size,
    type: item.type,
    kind: item.kind,
    fileId: item.fileId,
    storagePath: item.storagePath,
    uploadStatus: item.uploadStatus,
    uploadError: item.uploadError,
  };
}

export const ORDER_MEDIA_STORAGE_KEY = 'melody_ai_order_media';

export interface OrderMediaRecord {
  orderId: string;
  createdAt: string;
  files: MediaAssetMeta[];
}

export function readOrderMediaRecords(): Record<string, OrderMediaRecord> {
  try {
    const raw = localStorage.getItem(ORDER_MEDIA_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, OrderMediaRecord>;
  } catch (e) {
    return {};
  }
}

export function getOrderMedia(orderId: string): MediaAssetMeta[] {
  return readOrderMediaRecords()[orderId]?.files || [];
}

function writeOrderMediaRecord(record: OrderMediaRecord) {
  try {
    const all = readOrderMediaRecords();
    all[record.orderId] = record;
    localStorage.setItem(ORDER_MEDIA_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('No se pudo guardar la información de los archivos del videoclip', e);
  }
}

/**
 * Guarda los archivos del videoclip asociados a un pedido: metadatos en localStorage y
 * blobs en IndexedDB (copia local). Quedan marcados como 'pending' hasta que
 * uploadOrderMediaToSupabase() los sube al bucket privado.
 */
export async function persistOrderMedia(
  orderId: string,
  attachments: MediaAttachment[],
  createdAt: string
): Promise<MediaAssetMeta[]> {
  const stored: MediaAssetMeta[] = [];

  for (const item of attachments) {
    const meta = toMediaAssetMeta(item);
    meta.uploadStatus = meta.uploadStatus || 'pending';
    const fileId = `media-${orderId}-${item.id}`;
    try {
      await saveBlob(fileId, item.file);
      meta.fileId = fileId;
    } catch (e) {
      console.error(`No se pudo guardar en IndexedDB el archivo ${item.name}`, e);
    }
    stored.push(meta);
  }

  writeOrderMediaRecord({ orderId, createdAt, files: stored });
  return stored;
}

/** Actualiza (o crea) la lista de archivos guardada para un pedido. */
export function updateOrderMediaFiles(orderId: string, files: MediaAssetMeta[]): void {
  const all = readOrderMediaRecords();
  const existing = all[orderId];
  writeOrderMediaRecord({
    orderId,
    createdAt: existing?.createdAt || new Date().toISOString(),
    files,
  });
}

/** Nombre seguro para usar como clave dentro del bucket (sin acentos ni espacios). */
export function toStorageFileName(meta: MediaAssetMeta): string {
  const normalized = meta.name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();
  return `${meta.id}-${normalized}`;
}

export interface MediaUploadOutcome {
  files: MediaAssetMeta[];
  uploaded: number;
  failed: number;
}

/**
 * Sube al bucket privado customer-media los archivos pendientes de un pedido,
 * dentro de la carpeta <orderId>/. Se llama al guardar el pedido y también
 * desde el panel de Pedidos para reintentar los que fallaron.
 *
 * Los blobs se toman de los adjuntos en memoria si están disponibles y,
 * si no, de la copia guardada en IndexedDB.
 */
export async function uploadOrderMediaToSupabase(
  orderId: string,
  attachments?: MediaAttachment[]
): Promise<MediaUploadOutcome> {
  const files = getOrderMedia(orderId);
  if (files.length === 0) return { files, uploaded: 0, failed: 0 };

  if (!isSupabaseConfigured()) {
    const pending = files.map((file) =>
      file.uploadStatus === 'uploaded'
        ? file
        : { ...file, uploadStatus: 'error' as const, uploadError: 'Supabase no está configurado' }
    );
    updateOrderMediaFiles(orderId, pending);
    return { files: pending, uploaded: 0, failed: pending.filter((f) => f.uploadStatus === 'error').length };
  }

  const attachmentById = new Map((attachments || []).map((item) => [item.id, item.file]));
  const result: MediaAssetMeta[] = [];
  let uploaded = 0;
  let failed = 0;

  for (const file of files) {
    if (file.uploadStatus === 'uploaded' && file.storagePath) {
      result.push(file);
      continue;
    }

    let blob: Blob | undefined = attachmentById.get(file.id);
    if (!blob && file.fileId) {
      try {
        blob = await getBlob(file.fileId);
      } catch (e) {
        console.error(`No se pudo recuperar de IndexedDB el archivo ${file.name}`, e);
      }
    }

    if (!blob) {
      failed += 1;
      result.push({ ...file, uploadStatus: 'error', uploadError: 'Archivo local no disponible' });
      continue;
    }

    try {
      const storagePath = await uploadCustomerMediaToSupabase(orderId, toStorageFileName(file), blob);
      uploaded += 1;
      result.push({ ...file, storagePath, uploadStatus: 'uploaded', uploadError: undefined });
    } catch (e) {
      failed += 1;
      const message = e instanceof Error ? e.message : 'Error de subida';
      console.error(`Error subiendo ${file.name} a customer-media`, e);
      result.push({ ...file, uploadStatus: 'error', uploadError: message });
    }
  }

  updateOrderMediaFiles(orderId, result);
  return { files: result, uploaded, failed };
}

export async function removeOrderMedia(orderId: string): Promise<void> {
  const all = readOrderMediaRecords();
  const record = all[orderId];
  if (!record) return;

  for (const file of record.files) {
    if (!file.fileId) continue;
    try {
      await deleteBlob(file.fileId);
    } catch (e) {
      console.error(`No se pudo eliminar de IndexedDB el archivo ${file.name}`, e);
    }
  }

  // Limpia también el bucket privado (best-effort)
  const remotePaths = record.files
    .map((file) => file.storagePath)
    .filter((path): path is string => Boolean(path));
  if (remotePaths.length > 0) {
    try {
      await removeCustomerMediaFromSupabase(remotePaths);
    } catch (e) {
      console.error('No se pudieron eliminar los archivos del bucket customer-media', e);
    }
  }

  delete all[orderId];
  try {
    localStorage.setItem(ORDER_MEDIA_STORAGE_KEY, JSON.stringify(all));
  } catch (e) {
    console.error('No se pudo actualizar la información de archivos del videoclip', e);
  }
}
