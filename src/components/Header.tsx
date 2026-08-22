import React from 'react';
import { NavigationTab } from '../types';
import { ArrowDownRight, User, Waves } from 'lucide-react';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenProfile: () => void;
  onStartCreation: () => void;
  userEmail?: string;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  onOpenProfile,
  onStartCreation,
  userEmail = '',
}) => {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <header className="fixed top-0 z-50 w-full border-b border-[#3a3035] bg-[#111014]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-[1440px] items-center justify-between px-5 lg:px-12">
        <button
          onClick={() => onSelectTab('inicio')}
          className="group flex items-center gap-3 text-left"
          aria-label="Volver al inicio"
        >
          <span className="relative flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#ff715b]/60 bg-[#1d171a] text-[#ff715b] shadow-[0_0_24px_rgba(255,113,91,0.16)] transition-transform group-hover:-rotate-6">
            <Waves className="h-5 w-5" strokeWidth={2.2} />
            <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#bdf4d1]" />
          </span>
          <span>
            <span className="block font-display text-[21px] font-semibold leading-none tracking-[-0.02em] text-[#f7f1e7]">
              Melody <span className="text-[#ff715b]">AI</span>
            </span>
            <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.28em] text-[#918a97]">
              Studio
            </span>
          </span>
        </button>

        <nav className="hidden items-center gap-1 rounded-full border border-[#3a3035] bg-[#19161d]/70 p-1 md:flex" aria-label="Navegación principal">
          <button onClick={() => onSelectTab('inicio')} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${currentTab === 'inicio' ? 'bg-[#ff715b] text-[#211517]' : 'text-[#b8afb7] hover:text-[#f7f1e7]'}`}>Inicio</button>
          <button
            onClick={() => scrollTo('how-it-works')}
            className="rounded-full px-3 py-2 text-xs font-semibold text-[#b8afb7] transition-colors hover:text-[#f7f1e7]"
          >
            Cómo funciona
          </button>
          <button
            onClick={() => scrollTo('explore-styles')}
            className="rounded-full px-3 py-2 text-xs font-semibold text-[#b8afb7] transition-colors hover:text-[#f7f1e7]"
          >
            Explora estilos
          </button>
          <button onClick={() => onSelectTab('mis-canciones')} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${currentTab === 'mis-canciones' ? 'bg-[#ff715b] text-[#211517]' : 'text-[#b8afb7] hover:text-[#f7f1e7]'}`}>Mis canciones</button>
          <button onClick={() => onSelectTab('pedidos')} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${currentTab === 'pedidos' ? 'bg-[#ff715b] text-[#211517]' : 'text-[#b8afb7] hover:text-[#f7f1e7]'}`}>Pedidos</button>
          <button onClick={() => onSelectTab('precios')} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${currentTab === 'precios' ? 'bg-[#ff715b] text-[#211517]' : 'text-[#b8afb7] hover:text-[#f7f1e7]'}`}>Precios</button>
          <button onClick={() => onSelectTab('catalogo')} className={`rounded-full px-3 py-2 text-xs font-semibold transition ${currentTab === 'catalogo' ? 'bg-[#ff715b] text-[#211517]' : 'text-[#b8afb7] hover:text-[#f7f1e7]'}`}>Catálogo</button>
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={onStartCreation}
            className="hidden items-center gap-2 rounded-[10px] bg-[#ff715b] px-4 py-2.5 text-sm font-bold text-[#211517] shadow-[0_10px_28px_rgba(255,113,91,0.2)] transition hover:-translate-y-0.5 hover:bg-[#ff8975] sm:flex"
          >
            Encargar mi canción
            <ArrowDownRight className="h-4 w-4" />
          </button>
          <button
            onClick={onOpenProfile}
            title={userEmail || 'Iniciar sesión'}
            className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#4b4147] bg-[#19161d] text-[#b8afb7] transition hover:border-[#ff715b] hover:text-[#ff715b]"
            aria-label={userEmail ? 'Abrir perfil' : 'Iniciar sesión'}
          >
            <User className="h-[18px] w-[18px]" />
            {userEmail && <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#111014] bg-[#bdf4d1]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
