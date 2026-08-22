import React, { useEffect, useRef, useState } from 'react';
import { X, Mail, KeyRound, LogIn, UserPlus, AlertTriangle, Loader2, ShieldCheck, Music2, ArrowLeft } from 'lucide-react';
import { describeAuthError, signInWithEmail, signUpWithEmail } from '../lib/supabase';

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
  const [displayName, setDisplayName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = useRef<HTMLInputElement>(null);

  // Al abrir: foco en el email y formulario limpio
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setSuccess(null);
    setMode('signin');
    setDisplayName('');
    setPassword('');
    setConfirmPassword('');
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

    if (mode === 'signup') {
      if (password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signup') {
        const result = await signUpWithEmail(trimmedEmail, password, displayName.trim() || undefined);
        setPassword('');
        setConfirmPassword('');
        if (result.session) {
          onSignedIn && onSignedIn(result.session.user.email || trimmedEmail);
          onClose();
        } else {
          setSuccess('Cuenta creada. Revisa tu correo para confirmar el acceso.');
        }
      } else {
        const session = await signInWithEmail(trimmedEmail, password);
        setPassword('');
        onSignedIn && onSignedIn(session.user.email || trimmedEmail);
        onClose();
      }
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#111014]/85 p-4 backdrop-blur-xl"
      onClick={() => !isSubmitting && onClose()}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-[#69566f] bg-[#19161d] p-6 shadow-[0_25px_90px_rgba(0,0,0,0.6)] animate-fadeIn sm:p-8"
        onClick={(e) => e.stopPropagation()}
      >

        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isSubmitting}
          className="absolute right-5 top-5 cursor-pointer rounded-full border border-[#4b4147] bg-[#211c23] p-2 text-[#918a97] transition-colors hover:border-[#ff715b] hover:text-[#f7f1e7] disabled:cursor-not-allowed disabled:opacity-50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand mark + title */}
        <div className="mb-6 space-y-3 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#ff715b]/50 bg-[#ff715b]/10 text-[#ff8975] shadow-[0_0_30px_rgba(255,113,91,0.18)]">
            {mode === 'signup' ? <UserPlus className="h-10 w-10" /> : <Music2 className="h-10 w-10" />}
          </div>
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.22em] text-[#ff8975]">Melody / acceso</p>
            <h3 className="font-display text-3xl text-[#f7f1e7]">{mode === 'signup' ? 'Crea tu cuenta' : 'Inicia sesión'}</h3>
            <p className="mt-1 text-xs text-[#918a97]">{mode === 'signup' ? 'Guarda tus encargos y recibe tus canciones aquí.' : 'Accede a tu cuenta de Melody AI Studio.'}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-name" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#ddd5d6]">
                <UserPlus className="h-3.5 w-3.5 text-[#a99bff]" />
                <span>Tu nombre</span>
              </label>
              <input
                id="auth-name"
                type="text"
                autoComplete="name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Sofía García"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-[#4b4147] bg-[#111014]/70 px-4 py-2.5 text-sm text-[#f7f1e7] placeholder-[#746b75] transition-colors focus:border-[#a99bff] focus:outline-none disabled:opacity-60"
              />
            </div>
          )}
          <div>
            <label htmlFor="auth-email" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#ddd5d6]">
              <Mail className="h-3.5 w-3.5 text-[#a99bff]" />
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
              className="w-full rounded-xl border border-[#4b4147] bg-[#111014]/70 px-4 py-2.5 text-sm text-[#f7f1e7] placeholder-[#746b75] transition-colors focus:border-[#a99bff] focus:outline-none disabled:opacity-60"
            />
          </div>

          <div>
            <label htmlFor="auth-password" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#ddd5d6]">
              <KeyRound className="h-3.5 w-3.5 text-[#a99bff]" />
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
              className="w-full rounded-xl border border-[#4b4147] bg-[#111014]/70 px-4 py-2.5 text-sm text-[#f7f1e7] placeholder-[#746b75] transition-colors focus:border-[#a99bff] focus:outline-none disabled:opacity-60"
            />
          </div>

          {mode === 'signup' && (
            <div>
              <label htmlFor="auth-confirm-password" className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#ddd5d6]">
                <KeyRound className="h-3.5 w-3.5 text-[#a99bff]" />
                <span>Repite la contraseña</span>
              </label>
              <input
                id="auth-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-[#4b4147] bg-[#111014]/70 px-4 py-2.5 text-sm text-[#f7f1e7] placeholder-[#746b75] transition-colors focus:border-[#a99bff] focus:outline-none disabled:opacity-60"
              />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-xl border border-[#ff715b]/35 bg-[#ff715b]/10 px-4 py-3">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#ff8975]" />
              <p className="text-xs leading-relaxed text-[#ffb0a4]">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-2 rounded-xl border border-[#bdf4d1]/30 bg-[#bdf4d1]/10 px-4 py-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#bdf4d1]" />
              <p className="text-xs leading-relaxed text-[#d7ffe3]">{success}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#ff715b] py-3 text-xs font-bold uppercase tracking-wider text-[#211517] shadow-[0_12px_30px_rgba(255,113,91,0.22)] transition-all hover:bg-[#ff8975] disabled:cursor-not-allowed disabled:bg-[#352c34] disabled:text-[#746b75]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{mode === 'signup' ? 'Creando cuenta...' : 'Entrando...'}</span>
              </>
            ) : (
              <>
                {mode === 'signup' ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
                <span>{mode === 'signup' ? 'Crear cuenta' : 'Entrar'}</span>
              </>
            )}
          </button>
        </form>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(null); setSuccess(null); }}
          className="mx-auto mt-5 flex items-center gap-1.5 text-xs font-semibold text-[#a99bff] transition hover:text-[#d8d1ff] disabled:opacity-50"
        >
          {mode === 'signup' ? <ArrowLeft className="h-3.5 w-3.5" /> : <UserPlus className="h-3.5 w-3.5" />}
          <span>{mode === 'signup' ? 'Volver a iniciar sesión' : 'Crear una cuenta nueva'}</span>
        </button>

        <p className="mt-4 flex items-center justify-center gap-1.5 text-center text-[11px] text-[#918a97]">
          <ShieldCheck className="h-3.5 w-3.5 text-[#a99bff]" />
          <span>Sesión gestionada por Supabase Auth</span>
        </p>

      </div>
    </div>
  );
};

export default AuthModal;
