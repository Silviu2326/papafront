import React, { useState } from 'react';
import { PricingPlan, CreationFormState } from '../../types';
import { PRICING_PLANS, STYLE_OPTIONS, VOICE_OPTIONS } from '../../data/mockData';
import { isStripeTestMode } from '../../lib/checkout';
import {
  CreditCard,
  Lock,
  ShieldCheck,
  CheckCircle2,
  X,
  Sparkles,
  AlertTriangle,
} from 'lucide-react';

export interface CheckoutCustomer {
  name: string;
  email: string;
}

interface CheckoutModalProps {
  isOpen: boolean;
  catalogPlans: PricingPlan[];
  onClose: () => void;
  /**
   * Da de alta el pedido en Supabase. Debe lanzar excepción si la inserción
   * falla: en ese caso no se muestra ni la pantalla de éxito ni el confeti.
   */
  onConfirmPayment: (customer: CheckoutCustomer) => Promise<void>;
  formData: CreationFormState;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  catalogPlans,
  onClose,
  onConfirmPayment,
  formData,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  // Error al crear el pedido o la sesión de pago: se muestra aquí y no se avanza
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Datos obligatorios del cliente: se guardan en el pedido
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerErrors, setCustomerErrors] = useState<{ name?: string; email?: string }>({});

  if (!isOpen) return null;

  const currentPlan =
    catalogPlans.find((p) => p.id === formData.planId) || catalogPlans[0] || PRICING_PLANS[1];
  const currentStyle =
    STYLE_OPTIONS.find((s) => s.id === formData.styleId) || STYLE_OPTIONS[0];
  const currentVoice =
    VOICE_OPTIONS.find((v) => v.id === formData.voiceId) || VOICE_OPTIONS[0];

  const validateCustomer = () => {
    const name = customerName.trim();
    const email = customerEmail.trim();
    const errors: { name?: string; email?: string } = {};

    if (!name) {
      errors.name = 'Indica el nombre del cliente.';
    }
    if (!email) {
      errors.email = 'Indica el email del cliente.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      errors.email = 'Introduce un email válido (ejemplo: nombre@correo.com).';
    }

    setCustomerErrors(errors);
    return Object.keys(errors).length === 0 ? { name, email } : null;
  };

  /**
   * Da de alta el pedido (status 'pending') y lleva al cliente a la pasarela
   * alojada de Stripe. Aquí no hay pantalla de éxito ni confeti: eso solo pasa
   * al volver de Stripe con el pago confirmado.
   */
  const handlePay = async () => {
    const customer = validateCustomer();
    if (!customer) return;

    setCheckoutError(null);
    setIsProcessing(true);

    try {
      // Si resuelve, se está redirigiendo a Stripe y este modal desaparece
      await onConfirmPayment(customer);
    } catch (err) {
      console.error('[checkout] no se pudo iniciar el pago:', err);
      setIsProcessing(false);
      setCheckoutError(err instanceof Error ? err.message : 'No se pudo iniciar el pago.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/80 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              Confirmar tu encargo
            </h2>
            <p className="text-xs text-slate-400">
              Pago procesado por Stripe{isStripeTestMode ? ' • Modo test' : ''}
            </p>
          </div>
        </div>

        {/* Order Preview Badge */}
        <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 mb-6">
          <div className="flex justify-between items-start mb-2">
            <div>
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                {currentPlan.name}
              </span>
              <h4 className="text-base font-extrabold text-white">
                {formData.songTitle || (formData.forWhom ? `Canción para ${formData.forWhom}` : 'Melodía Personalizada')}
              </h4>
            </div>
            <span className="text-xl font-black text-white">{currentPlan.price}</span>
          </div>

          <div className="flex flex-wrap gap-2 text-[11px] text-slate-300 pt-2 border-t border-slate-700/60">
            <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
              Estilo: <strong className="text-white">{currentStyle.icon} {currentStyle.name}</strong>
            </span>
            <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
              Voz: <strong className="text-white">{currentVoice.name}</strong>
            </span>
            <span className="bg-slate-900 px-2 py-0.5 rounded-md border border-slate-800">
              {currentPlan.durationText}
            </span>
          </div>
        </div>

        {/* Datos del cliente (obligatorios, se guardan en el pedido) */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Datos del Cliente
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="checkout-customer-name" className="block text-xs font-semibold text-slate-300 mb-1">
                Nombre del cliente *
              </label>
              <input
                id="checkout-customer-name"
                type="text"
                value={customerName}
                onChange={(e) => {
                  setCustomerName(e.target.value);
                  if (customerErrors.name) setCustomerErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Ej: Carlos Mendoza"
                aria-invalid={Boolean(customerErrors.name)}
                className={`w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none ${
                  customerErrors.name
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-slate-700 focus:border-indigo-500'
                }`}
              />
              {customerErrors.name && (
                <p className="text-[11px] text-rose-300 mt-1">{customerErrors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="checkout-customer-email" className="block text-xs font-semibold text-slate-300 mb-1">
                Email del cliente *
              </label>
              <input
                id="checkout-customer-email"
                type="email"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  if (customerErrors.email) setCustomerErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="Ej: carlos@correo.com"
                aria-invalid={Boolean(customerErrors.email)}
                className={`w-full bg-slate-800 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none ${
                  customerErrors.email
                    ? 'border-rose-500 focus:border-rose-400'
                    : 'border-slate-700 focus:border-indigo-500'
                }`}
              />
              {customerErrors.email && (
                <p className="text-[11px] text-rose-300 mt-1">{customerErrors.email}</p>
              )}
            </div>
          </div>

          <p className="text-[11px] text-slate-400 mt-2">
            Usaremos estos datos para identificar tu pedido y enviarte la canción terminada.
          </p>
        </div>

        {/* Pago con Stripe: la tarjeta se introduce en la pagina alojada de
            Stripe, nunca aqui. Esta app no recibe ni guarda datos de tarjeta. */}
        <div className="mb-6">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Método de Pago
          </label>

          <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-4 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <CreditCard className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-white">Pago seguro con Stripe</p>
                <p className="text-[11px] text-slate-400 leading-relaxed mt-0.5">
                  Al continuar te llevamos a la pasarela de Stripe para introducir la tarjeta.
                  Melody AI Studio no recibe ni almacena los datos de tu tarjeta.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-700/60">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                Tarjeta
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                Apple Pay
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
                Google Pay
              </span>
              {isStripeTestMode && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-amber-500/10 border border-amber-500/40 text-amber-300">
                  Modo test
                </span>
              )}
            </div>
          </div>

        </div>

        {/* Error al registrar el pedido */}
        {checkoutError && (
          <div className="mb-4 rounded-2xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-300 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-rose-100 mb-0.5">No se ha podido registrar el pedido</p>
              <p className="text-[11px] text-rose-200/90 leading-relaxed break-words">{checkoutError}</p>
              <p className="text-[11px] text-rose-200/70 mt-1">No se te ha cobrado nada. Puedes reintentarlo.</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handlePay}
          disabled={isProcessing}
          className="w-full py-4 rounded-2xl font-black text-sm tracking-wide transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 disabled:text-slate-400 disabled:hover:scale-100 text-white shadow-indigo-600/30 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Conectando con Stripe...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>
                {checkoutError
                  ? `Reintentar pago de ${currentPlan.price}`
                  : `Enviar pedido y pagar ${currentPlan.price}`}
              </span>
            </>
          )}
        </button>

        {/* Trust Badges */}
        <div className="flex items-center justify-center gap-6 mt-4 text-[11px] text-slate-400">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
            <span>Encriptación SSL 256-bit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Garantía de Satisfacción</span>
          </div>
        </div>

      </div>
    </div>
  );
};
