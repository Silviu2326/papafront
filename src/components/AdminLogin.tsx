import React, { useState } from 'react';
import { describeAuthError, signInWithEmail } from '../lib/supabase';
import { Lock, ShieldCheck, LogIn, AlertTriangle, Loader2 } from 'lucide-react';

interface AdminLoginProps {
  /** true mientras se comprueba si ya hay una sesión abierta */
  isChecking?: boolean;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ isChecking = false }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      // El cambio de sesión lo recoge App a través de onAuthChange
      await signInWithEmail(trimmedEmail, password);
      setPassword('');
    } catch (err) {
      setError(describeAuthError(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="melody-workspace pt-24 pb-32 min-h-screen bg-[#111014] text-[#f7f1e7]">
      <div className="max-w-md mx-auto px-5">

        <div className="mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold uppercase tracking-wider mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Pedidos</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Acceso restringido</h1>
          <p className="text-slate-400 text-sm mt-1">
            Necesitas una sesión iniciada para ver los pedidos. Introduce tu correo y contraseña para continuar.
          </p>
        </div>

        <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 sm:p-8 shadow-xl">
          {isChecking ? (
            <div className="flex items-center justify-center gap-2 py-8 text-slate-400 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Comprobando sesión...</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-xs font-semibold text-slate-300 mb-1">
                  Email
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoComplete="username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@correo.com"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="block text-xs font-semibold text-slate-300 mb-1">
                  Contraseña
                </label>
                <input
                  id="admin-password"
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
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
                className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 text-white text-sm font-bold transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Entrando...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    <span>Iniciar sesión</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        <p className="text-[11px] text-slate-400 text-center mt-4 flex items-center justify-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sesión gestionada por Supabase Auth</span>
        </p>

      </div>
    </div>
  );
};

export default AdminLogin;
