import React from 'react';
import { Heart, MoreHorizontal, Pause, Play, Sparkles, Volume2 } from 'lucide-react';
import { Song } from '../types';
import featuredCover from '../assets/melody-featured-cover.png';
import bannerBackground from '../../assets/melody-banner-background.mp4';

interface HeroSectionProps {
  onStartCreation: () => void;
  featuredSong: Song;
  isPlayingFeatured: boolean;
  onToggleFeaturedPlay: () => void;
}

const waveform = [18, 28, 12, 38, 22, 48, 30, 18, 42, 24, 54, 32, 16, 44, 27, 50, 20, 34, 14, 42, 24, 46, 18, 30, 14, 38, 20, 49, 28, 15, 42, 25, 36, 17, 30, 12, 39, 22, 44, 18, 31, 15, 43, 24, 37, 19, 46, 27, 16, 36, 21, 42, 26, 14, 34, 18, 40, 22, 30, 15, 37, 20, 44];

export const HeroSection: React.FC<HeroSectionProps> = ({
  onStartCreation,
  featuredSong,
  isPlayingFeatured,
  onToggleFeaturedPlay,
}) => {
  return (
    <section className="relative overflow-hidden pb-16 pt-[126px] lg:pb-24 lg:pt-[156px]">
      <video
        className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-45"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        poster={featuredCover}
        aria-hidden="true"
      >
        <source src={bannerBackground} type="video/mp4" />
      </video>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#111014]/95 via-[#111014]/80 to-[#111014]/45" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#111014]/45 via-transparent to-[#111014]/80" />
      <div className="melody-grain absolute inset-0" />
      <div className="pointer-events-none absolute -left-40 top-24 h-[460px] w-[460px] rounded-full bg-[#ff715b]/[0.07] blur-[130px]" />
      <div className="pointer-events-none absolute right-[-150px] top-10 h-[520px] w-[520px] rounded-full bg-[#a99bff]/[0.08] blur-[150px]" />

      <div className="relative z-10 mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 px-5 lg:grid-cols-12 lg:gap-14 lg:px-12">
        <div className="lg:col-span-5">
          <h1 className="font-display max-w-[640px] text-[clamp(3.5rem,6.2vw,6.6rem)] font-medium leading-[0.94] tracking-[-0.055em] text-[#f7f1e7]">
            Encarga una <span className="text-[#ff715b]">canción única</span> a partir de tu historia
          </h1>
          <p className="mt-8 max-w-[530px] text-[17px] leading-[1.65] text-[#aaa1aa] sm:text-lg">
            Cuéntanos tus vivencias, recuerdos y emociones. Nuestro equipo las convertirá en una canción personalizada con calidad de estudio y te la entregará lista para escuchar y regalar.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={onStartCreation}
              className="inline-flex items-center justify-center gap-2.5 rounded-[10px] bg-[#ff715b] px-5 py-3.5 text-[15px] font-bold text-[#211517] shadow-[0_14px_34px_rgba(255,113,91,0.18)] transition hover:-translate-y-0.5 hover:bg-[#ff8975]"
            >
              <Sparkles className="h-4 w-4" />
              Encargar mi canción
            </button>
            <button
              onClick={onToggleFeaturedPlay}
              className="inline-flex items-center justify-center gap-2.5 rounded-[10px] border border-[#69565a] bg-[#171419]/80 px-5 py-3.5 text-[15px] font-semibold text-[#f7f1e7] transition hover:border-[#a99bff] hover:text-[#d8d1ff]"
            >
              {isPlayingFeatured ? <Pause className="h-4 w-4 fill-current text-[#a99bff]" /> : <Play className="h-4 w-4 fill-current text-[#a99bff]" />}
              {isPlayingFeatured ? 'Pausar ejemplo' : 'Escuchar ejemplo'}
            </button>
          </div>
        </div>

        <div className="relative lg:col-span-7">
          <div className="absolute -inset-5 rounded-[34px] bg-[#ff715b]/[0.08] blur-3xl" />
          <div className="relative overflow-hidden rounded-[22px] border border-[#8e6d58] bg-[#19161d] shadow-[0_25px_80px_rgba(0,0,0,0.45)]">
            <div className="relative aspect-[1.55] overflow-hidden">
              <img
                src={featuredCover}
                alt="Arte de la canción El Viaje de Sofía"
                className={`h-full w-full object-cover transition-transform duration-1000 ${isPlayingFeatured ? 'scale-[1.035]' : 'scale-100'}`}
              />
              <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-full border border-white/15 bg-[#111014]/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em] text-[#f7f1e7] backdrop-blur-md">
                <span className="h-2 w-2 rounded-full bg-[#bdf4d1]" />
                Éxito reciente
              </div>
            </div>

            <div className="border-t border-[#59484c] px-5 py-4 sm:px-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={onToggleFeaturedPlay}
                  aria-label={isPlayingFeatured ? 'Pausar canción' : 'Reproducir canción'}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#ff715b] text-[#211517] transition hover:scale-105 hover:bg-[#ff8975]"
                >
                  {isPlayingFeatured ? <Pause className="h-5 w-5 fill-current" /> : <Play className="ml-0.5 h-5 w-5 fill-current" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex items-center gap-1.5">
                    {waveform.map((height, index) => (
                      <span
                        key={index}
                        className={`w-[3px] rounded-full bg-[#a99bff] transition-all ${isPlayingFeatured ? 'animate-pulse-wave' : ''}`}
                        style={{ height: `${height / 2}px`, animationDelay: `${index * 0.025}s` }}
                      />
                    ))}
                  </div>
                  <div className="h-1 overflow-hidden rounded-full bg-[#4d4147]"><div className="h-full w-[39%] rounded-full bg-[#ff715b]" /></div>
                </div>
                <span className="hidden text-xs font-semibold tabular-nums text-[#b8afb7] sm:block">1:28 / 3:45</span>
                <Heart className="hidden h-[18px] w-[18px] fill-[#bdf4d1] text-[#bdf4d1] sm:block" />
                <MoreHorizontal className="h-[19px] w-[19px] text-[#aaa1aa]" />
              </div>
              <div className="mt-3 flex items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl text-[#f7f1e7]">{featuredSong.title}</h2>
                  <p className="mt-0.5 text-xs font-semibold uppercase tracking-[0.14em] text-[#918a97]">{featuredSong.genreVibe}</p>
                </div>
                <span className="hidden items-center gap-1.5 text-xs font-semibold text-[#918a97] sm:flex"><Volume2 className="h-3.5 w-3.5" /> {featuredSong.bpm} BPM</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
