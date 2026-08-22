import React, { useState, useRef, useEffect } from 'react';
import { Song } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { resolveSongAudioUrl } from '../utils/songAudio';
import {
  Play,
  Pause,
  Download,
  FileText,
  RotateCcw,
  Heart,
  Share2,
  Search,
  Sparkles,
  Music2,
  CheckCircle2,
} from 'lucide-react';

interface MySongsViewProps {
  songs: Song[];
  currentPlayingSong: Song | null;
  isPlaying: boolean;
  onPlaySong: (song: Song) => void;
  onToggleFavorite: (songId: string) => void;
  onOpenRevisionModal: (song: Song) => void;
  onStartCreation: () => void;
  onSetSongMp3Url?: (songId: string, url: string) => void;
}

export const MySongsView: React.FC<MySongsViewProps> = ({
  songs,
  currentPlayingSong,
  isPlaying,
  onPlaySong,
  onToggleFavorite,
  onOpenRevisionModal,
  onStartCreation,
  onSetSongMp3Url,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'todas' | 'favoritas' | 'listas'>('todas');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = (song: Song) => {
    const shareText = `¡Escucha mi canción personalizada "${song.title}" producida por Melody AI Studio!`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${shareText} - https://melodyai.studio/song/${song.id}`);
      showToast('¡Enlace de la canción copiado al portapapeles!');
    } else {
      showToast('Enlace listo para compartir');
    }
  };

  const handleDownload = (song: Song) => {
    (async () => {
      try {
        const url = await resolveSongAudioUrl(song);
        if (!url) {
          showToast('No hay archivo MP3 disponible para descargar.');
          return;
        }
        const a = document.createElement('a');
        a.href = url;
        a.download = song.mp3Name || `${song.title}.mp3`;
        document.body.appendChild(a);
        a.click();
        setTimeout(() => document.body.removeChild(a), 500);
        showToast(`Descargando "${song.title}"...`);
      } catch (err) {
        console.error('Download error', err);
        showToast('Error al descargar el archivo. Inténtalo de nuevo.');
      }
    })();
  };

  /**
   * Toda la reproducción pasa por el motor principal (la barra inferior).
   * Antes esta vista creaba su propio <audio>, de modo que el MP3 podía sonar
   * a la vez que el reproductor y con la barra desincronizada.
   */
  const handlePlay = (song: Song) => {
    const esLaActual = currentPlayingSong?.id === song.id;
    if (esLaActual && isPlaying) {
      audioEngine.pause();
      return;
    }
    onPlaySong(song);
  };

  const filteredSongs = songs.filter((song) => {
    const matchesSearch =
      song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      song.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (song.dedication?.to && song.dedication.to.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;
    if (selectedFilter === 'favoritas') return song.isFavorite;
    if (selectedFilter === 'listas') return song.status === 'ready';
    return true;
  });

  return (
    <div className="melody-workspace pt-24 pb-32 min-h-screen bg-[#111014] text-[#f7f1e7]">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-5 z-50 bg-indigo-600 text-white px-5 py-3 rounded-2xl shadow-xl shadow-indigo-600/40 flex items-center gap-2 text-sm font-semibold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="max-w-[1360px] mx-auto px-5 lg:px-12">
        
        {/* Header and Quick Stats */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Music2 className="w-3.5 h-3.5" />
              <span>Tu Biblioteca Personal</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
              Mis Canciones
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Escucha y descarga tus pistas cuando estén listas, o solicita revisiones a nuestro equipo.
            </p>
          </div>

          <button
            onClick={onStartCreation}
            className="self-start md:self-auto px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Encargar otra canción</span>
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por título, género o dedicatoria..."
              className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setSelectedFilter('todas')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'todas'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Todas ({songs.length})
            </button>
            <button
              onClick={() => setSelectedFilter('favoritas')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'favoritas'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Favoritas ({songs.filter((s) => s.isFavorite).length})
            </button>
            <button
              onClick={() => setSelectedFilter('listas')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedFilter === 'listas'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              Listas en HD ({songs.filter((s) => s.status === 'ready').length})
            </button>
          </div>

        </div>

        {/* Songs Grid */}
        {filteredSongs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSongs.map((song) => {
              const isCurrentPlaying = currentPlayingSong?.id === song.id && isPlaying;

              return (
                <div
                  key={song.id}
                  className="group bg-slate-800 border border-slate-700 hover:border-indigo-500/80 rounded-3xl p-6 shadow-xl hover:shadow-2xl hover:shadow-indigo-950/40 transition-all duration-300 flex flex-col justify-between"
                >
                  
                  <div>
                    {/* Top Artwork & Play Button */}
                    <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-700 mb-5">
                      <img
                        src={song.coverUrl}
                        alt={song.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

                      {/* Play Button Overlay */}
                      <button
                        onClick={() => onPlaySong(song)}
                        className="absolute inset-0 m-auto w-12 h-12 rounded-full bg-indigo-600/90 hover:bg-indigo-500 text-white flex items-center justify-center shadow-lg shadow-indigo-600/50 backdrop-blur-md transition-transform hover:scale-110 active:scale-95 cursor-pointer"
                        title={isCurrentPlaying ? 'Pausar' : 'Escuchar canción'}
                      >
                        {isCurrentPlaying ? (
                          <Pause className="w-5 h-5 fill-current" />
                        ) : (
                          <Play className="w-5 h-5 fill-current ml-0.5" />
                        )}
                      </button>

                      {/* Top Badges */}
                      <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                        <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-[10px] font-bold text-white uppercase">
                          {song.genre}
                        </span>

                        {song.status !== 'ready' && (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/15 backdrop-blur-md border border-amber-500/40 text-[10px] font-bold text-amber-200 uppercase">
                            Audio en producción
                          </span>
                        )}

                        <button
                          onClick={() => onToggleFavorite(song.id)}
                          className={`p-2 rounded-full backdrop-blur-md transition-colors cursor-pointer ${
                            song.isFavorite
                              ? 'bg-rose-500/20 text-rose-400'
                              : 'bg-slate-900/80 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${song.isFavorite ? 'fill-current' : ''}`} />
                        </button>
                      </div>

                      {/* Bottom duration & date */}
                      <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-[11px] text-slate-300 font-mono">
                        <span>{song.duration}s</span>
                        <span>{song.createdAt}</span>
                      </div>
                    </div>

                    {/* Title & Info */}
                    <div className="space-y-1 mb-4">
                      <h3 className="font-bold text-lg text-white group-hover:text-indigo-400 transition-colors">
                        {song.title}
                      </h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5">
                        <span>{song.dedication?.to ? `Para: ${song.dedication.to}` : song.subtitle}</span>
                        <span>•</span>
                        <span className="text-indigo-400">{song.voiceName}</span>
                      </p>
                    </div>

                    {/* Dedication quote */}
                    {song.dedication?.message && (
                      <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800 mb-4">
                        <p className="text-xs text-slate-300 italic line-clamp-2">
                          "{song.dedication.message}"
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Functional Action Buttons */}
                  <div className="pt-4 border-t border-slate-700/80 space-y-2">
                    
                    <div className="grid grid-cols-2 gap-2">
                      {/* Escuchar / Play */}
                      <button
                        onClick={() => handlePlay(song)}
                        className="py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                      >
                        {isCurrentPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                        <span>{isCurrentPlaying ? 'Pausar' : 'Escuchar'}</span>
                      </button>

                      {/* Descargar WAV */}
                      <button
                        onClick={() => handleDownload(song)}
                        className="py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-400" />
                        <span>Descargar</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {/* Solicitar Revisión */}
                      <button
                        onClick={() => onOpenRevisionModal(song)}
                        className="py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 text-indigo-400" />
                        <span>Revisión ({song.revisionsLeft})</span>
                      </button>

                      {/* Compartir */}
                      <button
                        onClick={() => handleShare(song)}
                        className="py-2 px-3 rounded-xl bg-slate-900/80 hover:bg-slate-900 text-slate-300 hover:text-white font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-3 h-3 text-slate-400" />
                        <span>Compartir</span>
                      </button>
                    </div>

                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Empty Search State */
          <div className="bg-slate-800/50 border border-slate-700 rounded-3xl p-12 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Music2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-white">
              {songs.length === 0 ? 'Aún no has encargado ninguna canción' : 'No se encontraron canciones'}
            </h3>
            <p className="text-xs text-slate-400">
              {songs.length === 0
                ? 'Cuando hagas tu primer encargo, aquí podrás escucharlo, descargarlo y pedir revisiones.'
                : 'Prueba con otro término de búsqueda o encarga una nueva canción a nuestro estudio.'}
            </p>
            <button
              onClick={onStartCreation}
              className="px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{songs.length === 0 ? 'Encargar mi primera canción' : 'Encargar otra canción'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
