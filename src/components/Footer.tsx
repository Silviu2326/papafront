import React from 'react';
import { NavigationTab } from '../types';
import { ArrowUpRight, ShieldCheck, Waves } from 'lucide-react';

interface FooterProps { onNavigate: (tab: NavigationTab) => void; onSelectGenre?: (genreId: string) => void; }

export const Footer: React.FC<FooterProps> = ({ onNavigate, onSelectGenre }) => {
  return (
    <footer className="border-t border-[#3a3035] bg-[#0c0b0e] pb-24 pt-14 text-[#918a97] lg:pb-12">
      <div className="mx-auto max-w-[1440px] px-5 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <button onClick={() => onNavigate('inicio')} className="flex items-center gap-3 text-left">
              <span className="flex h-9 w-9 items-center justify-center rounded-[12px] border border-[#ff715b]/60 text-[#ff715b]"><Waves className="h-4 w-4" /></span>
              <span className="font-display text-2xl text-[#f7f1e7]">Melody <span className="text-[#ff715b]">AI</span></span>
            </button>
            <p className="mt-5 max-w-sm text-sm leading-6">Historias reales, canciones irrepetibles. Un estudio de producción musical donde convertimos lo que sientes en algo que puedas escuchar.</p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7f1e7]">Explorar</h3>
            <div className="mt-4 flex flex-col items-start gap-3 text-sm">
              <button onClick={() => onNavigate('crear')} className="transition hover:text-[#ff8975]">Encargar una canción</button>
              <button onClick={() => onNavigate('precios')} className="transition hover:text-[#ff8975]">Precios y paquetes</button>
              <button onClick={() => onNavigate('mis-canciones')} className="transition hover:text-[#ff8975]">Mis canciones</button>
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.18em] text-[#f7f1e7]">Hecho con cuidado</h3>
            <div className="mt-4 flex items-center gap-2 text-sm text-[#b8afb7]"><ShieldCheck className="h-4 w-4 text-[#bdf4d1]" /> Audio master 24-bit</div>
            <button onClick={() => onSelectGenre?.('acustico')} className="mt-3 flex items-center gap-2 text-sm transition hover:text-[#ff8975]">Descubre el estilo acústico <ArrowUpRight className="h-4 w-4" /></button>
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-3 border-t border-[#2c262c] pt-5 text-xs sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Melody AI Studio</span>
          <span>Hecho con pasión por la música y el trabajo de nuestro estudio.</span>
        </div>
      </div>
    </footer>
  );
};
