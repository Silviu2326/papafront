import { getBlob } from './indexedDb';
import { createSongSignedUrl } from '../lib/supabase';
import type { Song } from '../types';

/**
 * Resuelve la URL reproducible del MP3 de una canción, probando por orden:
 *
 *   1. mp3Url    -> ya resuelta en esta sesión (object URL o enlace firmado)
 *   2. mp3FileId -> copia local en IndexedDB (subida hecha en este dispositivo)
 *   3. mp3Path   -> bucket privado `songs`, con enlace firmado
 *
 * Devuelve null si la canción no tiene MP3 (las de muestra, que se sintetizan).
 */
export async function resolveSongAudioUrl(song: Song): Promise<string | null> {
  if (song.mp3Url) return song.mp3Url;

  if (song.mp3FileId) {
    try {
      const blob = await getBlob(song.mp3FileId);
      if (blob) return URL.createObjectURL(blob);
    } catch (err) {
      console.error('[audio] no se pudo leer el MP3 de IndexedDB', err);
    }
  }

  if (song.mp3Path) {
    try {
      return await createSongSignedUrl(song.mp3Path, 3600);
    } catch (err) {
      console.error('[audio] no se pudo firmar el enlace del MP3', err);
    }
  }

  return null;
}

/** true si la canción tiene un MP3 real detrás (y no solo la melodía sintetizada). */
export function hasRealAudio(song: Song): boolean {
  return Boolean(song.mp3Url || song.mp3FileId || song.mp3Path);
}
