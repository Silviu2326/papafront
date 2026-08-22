import React from 'react';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import { StyleOption } from '../types';
import { FEATURED_STYLE_OPTIONS } from '../data/mockData';

interface GenreShowcaseProps {
  onSelectGenre: (genreId: string) => void;
  playingGenreId: string | null;
  onToggleGenrePreview: (style: StyleOption) => void;
}

export const GenreShowcase: React.FC<GenreShowcaseProps> = ({ onSelectGenre, playingGenreId, onToggleGenrePreview }) => {
  return (
    <section id="explore-styles" className="scroll-mt-20 py-16 lg:py-20">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-12">
        <div className="mb-8 flex items-end justify-between gap-5">
          <h2 className="font-display text-4xl text-[#f7f1e7] sm:text-5xl">Explora estilos</h2>
          <button onClick={() => onSelectGenre('pop')} className="hidden items-center gap-2 text-sm font-semibold text-[#a99bff] transition hover:text-[#d8d1ff] sm:flex">
            Ver todos los estilos <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {FEATURED_STYLE_OPTIONS.slice(0, 4).map((style) => {
            const isPlaying = playingGenreId === style.id;
            return (
              <article key={style.id} className="group relative aspect-[0.83] overflow-hidden rounded-[18px] border border-[#634f51] bg-[#19161d]">
                <img src={style.imageUrl} alt={style.name} className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#111014] via-[#111014]/20 to-transparent" />
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
