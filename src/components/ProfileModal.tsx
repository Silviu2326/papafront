import React, { useState } from 'react';
import { X, User, Shield, CreditCard, Sparkles, Music2, DownloadCloud, LogOut, Loader2, Mail } from 'lucide-react';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Correo del usuario autenticado en Supabase */
  userEmail: string;
  songsCount: number;
  /** Cierre de sesión (supabase.auth.signOut) */
  onSignOut?: () => void | Promise<void>;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  userEmail,
  songsCount,
  onSignOut,
}) => {
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!isOpen) return null;

  const handleSignOut = async () => {
    if (!onSignOut) return;
    setIsSigningOut(true);
    try {
      await onSignOut();
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/80 overflow-hidden animate-fadeIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Avatar */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-500/50 flex items-center justify-center mx-auto text-indigo-400 shadow-lg shadow-indigo-600/30">
            <User className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Mi Perfil Melody AI</h3>
            <p className="text-xs text-slate-300 font-semibold flex items-center justify-center gap-1.5 mt-1">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span className="break-all">{userEmail}</span>
            </p>
            <p className="text-[11px] text-emerald-400 font-semibold mt-1">Sesión activa</p>
          </div>
        </div>

        {/* Account Stats */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-center">
            <span className="text-2xl font-black text-indigo-400">{songsCount}</span>
            <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">Canciones Creadas</span>
          </div>
          <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 text-center">
            <span className="text-2xl font-black text-emerald-400">HD 24b</span>
            <span className="text-[11px] font-semibold text-slate-400 block mt-0.5">Calidad Master</span>
          </div>
        </div>

        {/* Account Details */}
        <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 text-xs mb-6">
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-400" />
              <span>Licencia:</span>
            </span>
            <span className="font-bold text-white">Comercial Ilimitada</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400 flex items-center gap-1.5">
              <DownloadCloud className="w-3.5 h-3.5 text-indigo-400" />
              <span>Descargas:</span>
            </span>
            <span className="font-bold text-emerald-400">Ilimitadas WAV/MP3</span>
          </div>
          <div className="flex justify-between items-center text-slate-300">
            <span className="text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-indigo-400" />
              <span>Método de pago:</span>
            </span>
            <span className="font-medium text-slate-300">Stripe / Tarjeta</span>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-2.5">
          <button
            onClick={onClose}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
          >
            Cerrar
          </button>

          {onSignOut && (
            <button
              onClick={handleSignOut}
              disabled={isSigningOut}
              className="w-full py-3 bg-slate-800 hover:bg-rose-600/20 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Cerrando sesión...</span>
                </>
              ) : (
                <>
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar sesión</span>
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
