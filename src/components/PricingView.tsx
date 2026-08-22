import React, { useState } from 'react';
import { PricingPlan } from '../types';
import { Sparkles, Check, X, ShieldCheck, Zap, HelpCircle, ChevronDown, ChevronUp } from 'lucide-react';

interface PricingViewProps {
  plans: PricingPlan[];
  onSelectPlan: (plan: PricingPlan) => void;
  onStartCreationWithPlan: (planId: string) => void;
}

export const PricingView: React.FC<PricingViewProps> = ({
  plans,
  onSelectPlan,
  onStartCreationWithPlan,
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: '¿Cómo funciona el proceso de encargo?',
          a: 'Escribes tu historia, eliges el género y la voz, realizas el pago y nuestro equipo prepara la letra y produce el audio. Cuando esté terminado, adjuntamos el MP3 a tu pedido.',
    },
    {
      q: '¿Qué formato de archivo recibiré al descargar?',
          a: 'El panel te avisará cuando el MP3 final esté listo. El formato y la calidad dependen del producto configurado en el catálogo.',
    },
    {
      q: '¿Qué ocurre si deseo cambiar alguna parte de la canción?',
      a: 'Todos nuestros paquetes incluyen revisiones. Puedes solicitar ajustes de letra, cambiar el tempo, el cantante o la intensidad del coro fácilmente desde tu panel.',
    },
    {
      q: '¿Tengo derechos para usar la canción comercialmente?',
      a: 'Los paquetes Premium y Profesional incluyen licencia comercial completa, lo que te permite publicar tu canción en Spotify, YouTube, podcasts o proyectos audiovisuales sin restricciones.',
    },
  ];

  return (
    <div className="pt-24 pb-32 bg-[#0F172A] text-slate-200">
      
      {/* Header */}
      <div className="max-w-[1360px] mx-auto px-5 lg:px-12 text-center mb-16 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Precios Transparentes</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Elige el plan perfecto para tu canción
        </h1>
        <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
          Sin suscripciones ocultas. Pago único por producto, con el plazo de entrega indicado en cada ficha y garantía de satisfacción.
        </p>
      </div>

      {/* Pricing Cards Grid */}
      <div className="max-w-[1360px] mx-auto px-5 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
        {plans.map((plan) => {
          const isRecommended = plan.recommended;

          return (
            <div
              key={plan.id}
              className={`relative rounded-3xl p-8 flex flex-col justify-between transition-all duration-300 ${
                isRecommended
                  ? 'bg-slate-800 border-2 border-indigo-500 shadow-2xl shadow-indigo-950/60 ring-4 ring-indigo-500/10 md:-translate-y-3'
                  : 'bg-slate-800/70 border border-slate-700 hover:border-slate-600 hover:bg-slate-800 shadow-xl'
              }`}
            >
              {/* Popular / Recommended Badge */}
              {isRecommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-indigo-600 text-white font-black text-xs px-4 py-1 rounded-full uppercase tracking-wider shadow-lg shadow-indigo-600/40">
                  Más Popular • Recomendado
                </div>
              )}

              <div>
                {/* Plan Title & Price */}
                <div className="mb-6">
                  <h3 className="text-xl font-extrabold text-white mb-2">{plan.name}</h3>
                  <p className="text-xs text-slate-400 min-h-[36px]">{plan.description}</p>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/{plan.period}</span>
                  </div>
                </div>

                {/* Key Specs Pills */}
                <div className="space-y-2 py-4 border-y border-slate-700/80 mb-6 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Duración:</span>
                    <span className="font-semibold text-white">{plan.durationText}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Calidad:</span>
                    <span className="font-semibold text-white">{plan.qualityText}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-slate-400">Revisiones:</span>
                    <span className="font-semibold text-white">{plan.revisionsText}</span>
                  </div>
                </div>

                {/* Features List */}
                <div className="space-y-3 mb-8">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-2">
                    Lo que incluye:
                  </span>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs">
                      {feat.included ? (
                        <div className="w-4 h-4 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-slate-800 text-slate-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <X className="w-3 h-3 stroke-[2]" />
                        </div>
                      )}
                      <span className={feat.included ? 'text-slate-200 font-medium' : 'text-slate-500 line-through'}>
                        {feat.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onStartCreationWithPlan(plan.id)}
                className={`w-full py-4 rounded-2xl font-bold text-sm tracking-wide transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  isRecommended
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-102 active:scale-95'
                    : 'bg-slate-700 hover:bg-slate-600 text-white hover:scale-102 active:scale-95'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Encargar {plan.name}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Trust & Guarantee Banner */}
      <div className="max-w-[1360px] mx-auto px-5 lg:px-12 mb-24">
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-2xl font-bold text-white">Garantía de Satisfacción 100%</h3>
            <p className="text-slate-300 text-sm max-w-xl">
              Si por cualquier motivo no quedas completamente satisfecho con la primera versión de tu canción, nuestro equipo aplicará las revisiones incluidas en tu paquete.
            </p>
          </div>
          <div className="flex items-center gap-4 flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <span className="block font-black text-white text-lg">Compra Segura</span>
              <span className="text-xs text-slate-400">Certificado SSL & Stripe</span>
            </div>
          </div>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="max-w-3xl mx-auto px-5 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Preguntas Frecuentes</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white">Resolvemos tus dudas</h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx;
            return (
              <div
                key={idx}
                className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-bold text-base text-white flex items-center justify-between gap-4 cursor-pointer hover:text-indigo-400 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-5 h-5 text-indigo-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-300 leading-relaxed border-t border-slate-700/60 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
