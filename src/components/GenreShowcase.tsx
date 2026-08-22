import React from 'react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import { StyleOption } from '../types';
import { FEATURED_STYLE_OPTIONS } from '../data/mockData';
import styleRock from '../assets/style-rock.png';
import stylePop from '../assets/style-pop.png';
import styleLofi from '../assets/style-lofi.png';
import styleJazz from '../assets/style-jazz.png';

interface GenreShowcaseProps {
  onSelectGenre: (genreId: string) => void;
  playingGenreId: string | null;
  onToggleGenrePreview: (style: StyleOption) => void;
}

export const GenreShowcase: React.FC<GenreShowcaseProps> = ({ onSelectGenre, playingGenreId, onToggleGenrePreview }) => {
  const styleAssets: Record<string, string> = {
    rock: styleRock,
    pop: stylePop,
    lofi: styleLofi,
    jazz: styleJazz,
  };

  return (
    <section id="explore-styles" className="scroll-mt-20 py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-12">
        <div className="mb-8 flex items-end justify-between gap-5">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-[#ff8975]">Elige la atmósfera</p>
            <h2 className="font-display text-4xl text-[#f7f1e7] sm:text-5xl">Explora estilos</h2>
          </div>
          <button onClick={() => onSelectGenre('pop')} className="hidden items-center gap-2 text-sm font-semibold text-[#a99bff] transition hover:text-[#d8d1ff] sm:flex">
            Ver todos los estilos <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {FEATURED_STYLE_OPTIONS.slice(0, 4).map((style) => {
            const isPlaying = playingGenreId === style.id;
            return (
              <article key={style.id} className="group relative aspect-[0.83] overflow-hidden rounded-[22px] border border-[#634f51] bg-[#19161d] shadow-[0_20px_50px_rgba(0,0,0,0.22)] transition duration-500 hover:-translate-y-1 hover:border-[#ff8975]/70">
                <img src={styleAssets[style.id] ?? style.imageUrl} alt={style.name} className="h-full w-full object-cover saturate-[0.88] transition duration-700 group-hover:scale-105 group-hover:saturate-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111014] via-[#111014]/25 to-[#111014]/5" />
                <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-white/15 bg-[#111014]/55 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#f7f1e7] backdrop-blur-md">
                  <span className="text-sm leading-none" aria-hidden="true">{style.icon}</span>
                  <span>Estilo</span>
                </div>
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  <div className="flex items-end justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl text-[#f7f1e7] sm:text-[28px]">{style.name.replace(' Moderno', '').replace(' Beats', '')}</h3>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#c2b8c2]">{style.subVibe}</p>
                    </div>
                    <button
                      onClick={(event) => { event.stopPropagation(); onToggleGenrePreview(style); }}
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[#a99bff]/70 bg-[#19161d]/70 text-[#f7f1e7] backdrop-blur transition hover:bg-[#a99bff] hover:text-[#19161d]"
                      aria-label={isPlaying ? `Pausar muestra de ${style.name}` : `Escuchar muestra de ${style.name}`}
                    >
                      {isPlaying ? <Pause className="h-3.5 w-3.5 fill-current" /> : <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />}
                    </button>
                  </div>
                  <button onClick={() => onSelectGenre(style.id)} className="mt-4 text-xs font-bold text-[#ff8975] opacity-0 transition group-hover:opacity-100">
                    Encargar en este estilo <span className="ml-1">↗</span>
                  </button>
                </div>
              </article>
            );
          })}
        </div>
        <button onClick={() => onSelectGenre('pop')} className="mt-6 flex items-center gap-2 text-sm font-semibold text-[#a99bff] sm:hidden">
          Ver todos los estilos <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </section>
  );
};
