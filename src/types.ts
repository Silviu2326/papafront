export type NavigationTab = 'inicio' | 'crear' | 'mis-canciones' | 'precios' | 'pedidos' | 'catalogo';
export type NavTab = NavigationTab;

export type CreationStep = 1 | 2 | 3 | 4 | 5;

export type MediaKind = 'image' | 'video';

export type MediaUploadStatus = 'pending' | 'uploading' | 'uploaded' | 'error';

/** Información persistible de una foto o vídeo adjuntado para el videoclip. */
export interface MediaAssetMeta {
  id: string;
  name: string;
  size: number; // bytes
  type: string; // MIME type
  kind: MediaKind;
  fileId?: string; // clave del blob en IndexedDB (copia local)
  storagePath?: string; // ruta dentro del bucket privado customer-media: <pedido>/<archivo>
  uploadStatus?: MediaUploadStatus;
  uploadError?: string;
}

/** Versión en memoria usada por el formulario: incluye el File y su vista previa. */
export interface MediaAttachment extends MediaAssetMeta {
  file: File;
  previewUrl: string;
}

export interface Song {
  id: string;
  title: string;
  subtitle: string;
  author: string;
  genre: string;
  genreVibe: string;
  voiceName: string;
  duration: number; // in seconds
  bpm: number;
  story: string;
  dedication: {
    to: string;
    from: string;
    occasion: string;
    message?: string;
  };
  lyrics: string;
  coverUrl: string;
  createdAt: string;
  planId: string;
  status: 'ready' | 'generating' | 'review_requested';
  revisionsLeft: number;
  isFavorite?: boolean;
  tags: string[];
  audioKey?: string;
  mp3Url?: string; // runtime object URL for uploaded MP3
  mp3Name?: string;
  mp3FileId?: string; // reference to blob stored in IndexedDB
  mp3Path?: string; // ruta del MP3 en el bucket privado `songs` (enlace duradero)
  mediaFiles?: MediaAssetMeta[]; // fotos/vídeos para el videoclip personalizado
}

export interface PricingPlan {
  /** Identificador estable del producto en el catálogo (slug). */
  id: string;
  name: string;
  price: string;
  priceNumber: number;
  period: string;
  description: string;
  popular?: boolean;
  recommended?: boolean;
  durationText: string;
  revisionsText: string;
  qualityText: string;
  deliveryText: string;
  commercialRights: boolean;
  stems: boolean;
  /** Identificadores del catálogo remoto; no se muestran al cliente final. */
  catalogProductId?: string;
  catalogPriceId?: string;
  stripePriceId?: string;
  priceCents?: number;
  features: {
    text: string;
    included: boolean;
    highlight?: boolean;
    icon?: string;
  }[];
}

export interface StyleOption {
  id: string;
  name: string;
  icon: string;
  vibe: string;
  subVibe: string;
  bpm: string;
  bpmNumber: number;
  description: string;
  imageUrl: string;
  accentColor: string;
  tagColor: string;
  audioKey: string;
  featured?: boolean;
}

export interface VoiceOption {
  id: string;
  name: string;
  gender: 'masculino' | 'femenino' | 'duo';
  badge: string;
  tone: string;
  description: string;
  imageUrl: string;
  audioSampleKey: string;
}

export interface CreationFormState {
  story: string;
  styleId: string;
  voiceId: string;
  forWhom: string;
  fromWhom: string;
  occasion: string;
  dedicationMessage: string;
  songTitle?: string;
  tags: string[];
  planId: string;
  catalogProductId?: string;
  catalogPriceId?: string;
  selectedVibeTheme?: string;
  mediaFiles: MediaAttachment[]; // fotos/vídeos opcionales para el videoclip
}

export interface RevisionRequest {
  songId: string;
  type: 'letra' | 'tempo' | 'voz' | 'instrumental' | 'otro';
  notes: string;
  targetTimestamp?: string;
}

// Estados del flujo de pago con Stripe:
//   pending   -> pedido creado, aún no pagado (antes de ir a la pasarela)
//   paid      -> Stripe confirmó el cobro (lo escribe el webhook)
//   cancelled -> el cliente abandonó la pasarela o la sesión caducó
//   failed    -> el pago fue rechazado
// El resto son los estados de producción que gestiona el panel de Pedidos.
export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'cancelled'
  | 'failed'
  | 'Nuevo pedido'
  | 'En producción'
  | 'Pendiente de revisión'
  | 'Completado';

export interface Order {
  id: string;
  customerName: string;
  email: string;
  story: string;
  styleId: string;
  voiceId: string;
  planId: string;
  priceNumber: number;
  status: OrderStatus;
  createdAt: string;
  mp3Url?: string;
  mp3Name?: string;
  mp3FileId?: string; // reference to blob in IndexedDB
  mp3Path?: string; // ruta del MP3 en el bucket `songs` de Supabase Storage
  mediaFiles?: MediaAssetMeta[]; // fotos/vídeos del videoclip asociados al pedido
  catalogProductId?: string;
  catalogPriceId?: string;
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  generationStatus?: 'not_started' | 'queued' | 'processing' | 'lyrics_ready' | 'ready' | 'failed';
  generatedAudioPath?: string;
  lyrics?: string;
}
