import React, { useEffect, useRef, useState } from 'react';
import { X, Mail, KeyRound, LogIn, AlertTriangle, Loader2, ShieldCheck, Music2 } from 'lucide-react';
import { describeAuthError, signInWithEmail } from '../lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Se dispara tras un inicio de sesión correcto (App ya recibe la sesión por onAuthChange) */
  onSignedIn?: (email: string) => void;
}

/**
 * Modal de inicio de sesión real contra Supabase Auth (email + contraseña).
 * Sustituye al antiguo perfil local: la sesión la gestiona supabase.auth.
 */
export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSignedIn }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Al abrir: foco en el email y formulario limpio
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setPassword('');
    const id = window.setTimeout(() => emailRef.current?.focus(), 50);
    return () => window.clearTimeout(id);
  }, [isOpen]);

  // Cerrar con la tecla Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !isSubmitting) onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Introduce tu email y contraseña.');
      return;
    }

    setIsSubmitting(true);
    try {
      const session = await signInWithEmail(trimmedEmail, password);
      setPassword('');
      onSignedIn && onSignedIn(session.user.email || trimmedEmail);
      onClose();
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/80 overflow-hidden animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand mark + title */}
        <div className="text-center space-y-3 mb-6">
          <div className="w-20 h-20 rounded-full bg-indigo-600/20 border-2 border-indigo-500/50 flex items-center justify-center mx-auto text-indigo-400 shadow-lg shadow-indigo-600/30">
            <Music2 className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Iniciar sesión</h3>
            <p className="text-xs text-slate-400">Accede a tu cuenta de Melody AI Studio</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="auth-email" className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              <span>Correo electrónico</span>
            </label>
            <input
              id="auth-email"
              ref={emailRef}
              type="email"
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tucorreo@ejemplo.com"
              disabled={isSubmitting}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-indigo-400" />
              <span>Contraseña</span>
            </label>
            <input
              id="auth-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              className="w-full bg-slate-950/60 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors disabled:opacity-60"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-300 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-rose-200 leading-relaxed">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Entrando...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Entrar</span>
              </>
            )}
          </button>
        </form>

        <p className="text-[11px] text-slate-400 text-center mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sesión gestionada por Supabase Auth</span>
        </p>

      </div>
    </div>
  );
};

export default AuthModal;
