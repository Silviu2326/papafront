import React from 'react';
import { NavigationTab } from '../types';
import { CreditCard, Home, Library, Package, Sparkles, User } from 'lucide-react';

interface MobileNavProps { currentTab: NavigationTab; onSelectTab: (tab: NavigationTab) => void; onOpenProfile: () => void; isSignedIn?: boolean; }

export const MobileNav: React.FC<MobileNavProps> = ({ currentTab, onSelectTab, onOpenProfile, isSignedIn = false }) => {
  const items = [
    { id: 'inicio' as NavigationTab, label: 'Inicio', icon: Home },
    { id: 'crear' as NavigationTab, label: 'Encargar', icon: Sparkles },
    { id: 'mis-canciones' as NavigationTab, label: 'Canciones', icon: Library },
    { id: 'pedidos' as NavigationTab, label: 'Pedidos', icon: Package },
    { id: 'precios' as NavigationTab, label: 'Precios', icon: CreditCard },
    { id: 'catalogo' as NavigationTab, label: 'Catálogo', icon: Package },
  ];
  return (
    <nav className="fixed bottom-0 z-50 w-full border-t border-[#3a3035] bg-[#111014]/95 pb-safe shadow-[0_-12px_34px_rgba(0,0,0,0.35)] backdrop-blur-xl md:hidden">
      <div className="flex h-16 items-center justify-around px-1">
        {items.map(({ id, label, icon: Icon }) => {
          const active = currentTab === id;
          return <button key={id} onClick={() => onSelectTab(id)} className={`flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 transition ${active ? 'text-[#ff715b]' : 'text-[#918a97]'}`}><Icon className="h-[17px] w-[17px]" /><span className="text-[9px] font-bold uppercase tracking-[0.04em]">{label}</span></button>;
        })}
        <button onClick={onOpenProfile} className="flex h-14 min-w-0 flex-1 flex-col items-center justify-center gap-1 text-[#918a97] transition hover:text-[#f7f1e7]"><span className="relative"><User className="h-[17px] w-[17px]" />{isSignedIn && <span className="absolute -right-1 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-[#111014] bg-[#bdf4d1]" />}</span><span className="text-[9px] font-bold uppercase tracking-[0.04em]">{isSignedIn ? 'Perfil' : 'Entrar'}</span></button>
      </div>
    </nav>
  );
};
