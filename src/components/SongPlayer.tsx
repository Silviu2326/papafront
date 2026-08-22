import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { audioEngine } from '../utils/audioEngine';
import { hasRealAudio, resolveSongAudioUrl } from '../utils/songAudio';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Heart,
  Download,
  FileText,
  X,
  Sparkles,
} from 'lucide-react';

interface SongPlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime?: number;
  volume?: number;
  onTogglePlay: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  onNextSong?: () => void;
  onPrevSong?: () => void;
  onSeek?: (time: number) => void;
  onVolumeChange?: (volume: number) => void;
  onToggleFavorite?: (songId: string) => void;
}

export const SongPlayer: React.FC<SongPlayerProps> = ({
  currentSong,
  isPlaying,
  currentTime: externalTime,
  volume: externalVolume = 0.8,
  onTogglePlay,
  onNext,
  onPrev,
  onNextSong,
  onPrevSong,
  onSeek,
  onVolumeChange,
  onToggleFavorite,
}) => {
  const [internalTime, setInternalTime] = useState(0);
  const [volume, setVolume] = useState(externalVolume);
  const [isMuted, setIsMuted] = useState(false);
  const [showLyricsModal, setShowLyricsModal] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const nextHandler = onNext || onNextSong;
  const prevHandler = onPrev || onPrevSong;

  useEffect(() => {
    const unsubscribe = audioEngine.onStateChange((state) => {
      setInternalTime(state.currentTime);
    });
    return () => {
      unsubscribe();
    };
  }, []);

  if (!currentSong) return null;

  const currentTime = externalTime !== undefined ? externalTime : internalTime;
  const duration = currentSong.duration || 180;
  const progressPercent = Math.min(100, (currentTime / duration) * 100);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setInternalTime(newTime);
    if (onSeek) {
      onSeek(newTime);
    } else {
      audioEngine.seek(newTime);
    }
  };

  const handleVolumeSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    setIsMuted(val === 0);
    if (onVolumeChange) {
      onVolumeChange(val);
    } else {
      audioEngine.setVolume(val);
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      const restored = volume || 0.7;
      if (onVolumeChange) onVolumeChange(restored);
      audioEngine.setVolume(restored);
    } else {
      setIsMuted(true);
      if (onVolumeChange) onVolumeChange(0);
      audioEngine.setVolume(0);
    }
  };

  /**
   * Descarga el MP3 real si la canción lo tiene. Solo se recurre al WAV
   * sintetizado en las canciones de muestra, que no tienen archivo detrás.
   */
  const handleDownload = async () => {
    if (currentSong.status !== 'ready') return;
    if (hasRealAudio(currentSong)) {
      setIsDownloading(true);
      try {
        const url = await resolveSongAudioUrl(currentSong);
        if (!url) throw new Error('sin URL de descarga');
        const a = document.createElement('a');
        a.href = url;
        a.download = currentSong.mp3Name || `${currentSong.title}.mp3`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      } catch (err) {
        console.error('[audio] no se pudo descargar el MP3', err);
      } finally {
        setIsDownloading(false);
      }
      return;
    }

    audioEngine.generateAndDownloadWav(currentSong.title, currentSong.audioKey || 'pop', currentSong.bpm || 110);
  };

  return (
    <>
      {/* Docked Player Bar at Bottom (Desktop & Mobile) */}
      <div className="fixed bottom-16 left-0 z-40 w-full px-2 md:bottom-5 md:left-1/2 md:w-[88%] md:max-w-[980px] md:-translate-x-1/2 md:px-0">
        <div className="relative overflow-hidden border border-[#51434a] bg-[#19161d]/95 p-2.5 shadow-[0_12px_40px_rgba(0,0,0,0.65)] backdrop-blur-2xl md:rounded-[16px] md:p-3">
          
          {/* Ambient luminous glow top line */}
          <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-[#ff715b] to-transparent"></div>

          {/* Progress Bar Slider */}
          <div className="group relative mb-2 w-full">
            <input
              type="range"
              min="0"
              max={duration}
              value={currentTime}
              onChange={handleSeekChange}
              className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-[#4d4147] accent-[#ff715b] focus:outline-none"
            />
            <div
              className="pointer-events-none absolute left-0 top-0 h-1 rounded-lg bg-[#ff715b] shadow-[0_0_10px_rgba(255,113,91,0.35)]"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          <div className="flex items-center justify-between gap-3">
            
            {/* Left: Song Info & Thumbnail */}
            <div className="flex items-center gap-3.5 min-w-0 flex-1 sm:flex-initial">
              <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-[10px] border border-[#51434a] shadow-md">
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className={`w-full h-full object-cover ${isPlaying ? 'scale-105 transition-transform duration-1000' : ''}`}
                />
                {isPlaying && (
                  <div className="absolute inset-0 bg-slate-900/40 flex items-center justify-center">
                    <div className="flex items-end gap-0.5 h-4">
                    <div className="w-1 rounded-full bg-[#a99bff] animate-[pulseWave_0.8s_ease-in-out_infinite_0.1s]"></div>
                      <div className="w-1 rounded-full bg-[#a99bff] animate-[pulseWave_0.8s_ease-in-out_infinite_0.3s]"></div>
                      <div className="w-1 rounded-full bg-[#a99bff] animate-[pulseWave_0.8s_ease-in-out_infinite_0.2s]"></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <h4 className="cursor-pointer truncate text-sm font-bold text-[#f7f1e7] transition-colors hover:text-[#ff8975]" onClick={() => setShowLyricsModal(true)}>
                  {currentSong.title}
                </h4>
                <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs text-[#918a97]">
                  <span>{currentSong.dedication?.to ? `Para: ${currentSong.dedication.to}` : currentSong.subtitle}</span>
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#ff715b]"></span>
                  <span className="font-semibold text-[#ff8975]">{currentSong.genre}</span>
                </p>
              </div>

              {onToggleFavorite && (
                <button
                  onClick={() => onToggleFavorite(currentSong.id)}
                    className={`hidden cursor-pointer rounded-full p-2 transition-colors sm:block ${
                    currentSong.isFavorite
                      ? 'bg-[#ff715b]/10 text-[#ff8975]'
                      : 'text-[#918a97] hover:text-[#f7f1e7]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${currentSong.isFavorite ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>

            {/* Center: Controls & Timestamps */}
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-3 sm:gap-6">
                {prevHandler && (
                  <button
                    onClick={prevHandler}
                    className="cursor-pointer p-1.5 text-[#918a97] transition-colors hover:text-[#f7f1e7]"
                    title="Anterior"
                  >
                    <SkipBack className="w-5 h-5" />
                  </button>
                )}

                <button
                  onClick={onTogglePlay}
                  className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-[#ff715b] text-[#211517] shadow-lg shadow-[#ff715b]/20 transition-all hover:scale-105 hover:bg-[#ff8975] active:scale-95"
                  title={isPlaying ? 'Pausar' : 'Reproducir'}
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5 fill-current" />
                  ) : (
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  )}
                </button>

                {nextHandler && (
                  <button
                    onClick={nextHandler}
                    className="cursor-pointer p-1.5 text-[#918a97] transition-colors hover:text-[#f7f1e7]"
                    title="Siguiente"
                  >
                    <SkipForward className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 font-mono text-[10px] text-[#918a97]">
                <span>{formatTime(currentTime)}</span>
                <span>/</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Right: Actions (Lyrics, Volume, Download) */}
            <div className="hidden md:flex items-center gap-4">
              
              {/* Lyrics button */}
              <button
                onClick={() => setShowLyricsModal(true)}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#51434a] bg-[#211c23] px-3 py-1.5 text-xs font-semibold text-[#b8afb7] transition-colors hover:text-[#f7f1e7]"
              >
                <FileText className="h-3.5 w-3.5 text-[#a99bff]" />
                <span>Letra</span>
              </button>

              {/* Download WAV button */}
              <button
                onClick={handleDownload}
                disabled={isDownloading || currentSong.status !== 'ready'}
                title="Descargar Canción (WAV)"
                className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-[#ff715b]/35 bg-[#ff715b]/10 px-3 py-1.5 text-xs font-bold text-[#ffb0a4] transition-all hover:bg-[#ff715b]/20"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar</span>
              </button>

              {/* Volume Slider */}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-slate-400 hover:text-white transition-colors cursor-pointer">
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-4 h-4 text-rose-400" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeSliderChange}
                  className="w-18 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

            </div>

          </div>
        </div>
      </div>

      {/* Lyrics & Track Info Modal */}
      {showLyricsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 lg:p-8 shadow-2xl shadow-indigo-950/50 max-h-[90vh] flex flex-col overflow-hidden">
            
            <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-4">
                <img
                  src={currentSong.coverUrl}
                  alt={currentSong.title}
                  className="w-16 h-16 rounded-2xl object-cover border border-slate-700 shadow-md"
                />
                <div>
                  <h3 className="font-extrabold text-2xl text-white">{currentSong.title}</h3>
                  <p className="text-sm text-indigo-400 font-semibold flex items-center gap-2 mt-0.5">
                    <span>{currentSong.genre}</span>
                    <span>•</span>
                    <span className="text-slate-400">{currentSong.voiceName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowLyricsModal(false)}
                className="p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dedication Banner */}
            {currentSong.dedication && (
              <div className="bg-slate-800/80 rounded-2xl p-4 mb-6 border border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <span className="text-xs uppercase font-bold tracking-wider text-slate-400 block">Dedicatoria Especial</span>
                  <p className="text-sm font-semibold text-white mt-0.5">
                    Para: <span className="text-indigo-400">{currentSong.dedication.to}</span> {currentSong.dedication.from ? `(De: ${currentSong.dedication.from})` : ''}
                  </p>
                </div>
                {currentSong.dedication.occasion && (
                  <span className="px-3 py-1 rounded-full bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
                    {currentSong.dedication.occasion}
                  </span>
                )}
              </div>
            )}

            {/* Lyrics Content */}
            <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-sm leading-relaxed text-slate-200 bg-slate-950/60 p-6 rounded-2xl border border-slate-800">
              <pre className="font-sans whitespace-pre-wrap text-base leading-loose">
                {currentSong.lyrics || 'Cargando letra personalizada...'}
              </pre>
            </div>

            {/* Actions in Modal */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800 mt-6">
              <button
                onClick={onTogglePlay}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span>{isPlaying ? 'Pausar Canción' : 'Escuchar Ahora'}</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm border border-slate-700 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Descargar WAV</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
