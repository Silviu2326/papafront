import React from 'react';
import { CreationFormState, PricingPlan } from '../../types';
import { PRICING_PLANS, STYLE_OPTIONS, VOICE_OPTIONS } from '../../data/mockData';
import { Sparkles, Check, Music2, Mic, Heart, ShieldCheck, Zap, Film, Video, Image as ImageIcon } from 'lucide-react';
import { formatFileSize, totalMediaSize } from '../../utils/mediaFiles';

interface ReviewStepProps {
  formData: CreationFormState;
  catalogPlans: PricingPlan[];
  onChange: (updates: Partial<CreationFormState>) => void;
  onGenerateSong: () => void;
  isGenerating: boolean;
}

export const ReviewStep: React.FC<ReviewStepProps> = ({
  formData,
  catalogPlans,
  onChange,
  onGenerateSong,
  isGenerating,
}) => {
  const currentStyle = STYLE_OPTIONS.find((s) => s.id === formData.styleId) || STYLE_OPTIONS[0];
  const currentVoice = VOICE_OPTIONS.find((v) => v.id === formData.voiceId) || VOICE_OPTIONS[0];
  const currentPlan = catalogPlans.find((p) => p.id === formData.planId) || catalogPlans[0] || PRICING_PLANS[1];
  const mediaFiles = formData.mediaFiles || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Paso 5 de 5</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Revisión final de tu encargo
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Comprueba todos los detalles antes de enviar el pedido a producción.
        </p>
      </div>

      {/* Main Review Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Song Artwork & Summary Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* Main Visual Preview Card */}
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-2xl overflow-hidden border-2 border-indigo-500/40 shadow-xl flex-shrink-0">
                <img
                  src={currentStyle.imageUrl}
                  alt={formData.songTitle || 'Mi Canción'}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2">
                  <div className="flex items-end gap-1 h-3">
                    <div className="w-1 bg-indigo-400 rounded-full animate-pulse"></div>
                    <div className="w-1 bg-indigo-400 rounded-full animate-pulse"></div>
                    <div className="w-1 bg-indigo-400 rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>

              <div className="space-y-2 text-center sm:text-left flex-1">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[11px] font-bold">
                  Encargo personalizado
                </div>
                <h3 className="text-2xl font-black text-white">
                  {formData.songTitle || `Canción para ${formData.forWhom || 'Alguien Especial'}`}
                </h3>
                <p className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-2">
                  <span className="flex items-center gap-1">
                    <span className="text-sm leading-none">{currentStyle.icon}</span>
                    <span>{currentStyle.name}</span>
                  </span>
                  <span>•</span>
                  <span>{currentVoice.name}</span>
                </p>
              </div>
            </div>

            {/* Meta Table */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-700/80">
              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Music2 className="w-3 h-3 text-indigo-400" />
                  <span>Estilo</span>
                </span>
                <p className="text-sm font-bold text-white mt-0.5 flex items-center gap-1.5">
                  <span className="text-base leading-none">{currentStyle.icon}</span>
                  <span>{currentStyle.name}</span>
                </p>
                <span className="text-[10px] text-indigo-400">{currentStyle.vibe}</span>
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Mic className="w-3 h-3 text-indigo-400" />
                  <span>Voz</span>
                </span>
                <p className="text-sm font-bold text-white mt-0.5">{currentVoice.name}</p>
                <span className="text-[10px] text-indigo-400">{currentVoice.badge}</span>
              </div>

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                  <Heart className="w-3 h-3 text-indigo-400" />
                  <span>Destinatario</span>
                </span>
                <p className="text-sm font-bold text-white mt-0.5">{formData.forWhom || 'No especificado'}</p>
                <span className="text-[10px] text-indigo-400">{formData.occasion || 'Personal'}</span>
              </div>
            </div>

            {/* Fotos y videos del videoclip (opcional) */}
            {mediaFiles.length > 0 && (
              <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Film className="w-3 h-3 text-indigo-400" />
                    <span>Videoclip personalizado</span>
                  </span>
                  <span className="text-[10px] text-indigo-400 font-mono">
                    {mediaFiles.length} archivos • {formatFileSize(totalMediaSize(mediaFiles))}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {mediaFiles.map((item) => (
                    <span
                      key={item.id}
                      title={`${item.name} — ${formatFileSize(item.size)}`}
                      className="max-w-full text-[10px] px-2 py-1 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 flex items-center gap-1.5"
                    >
                      {item.kind === 'image' ? (
                        <ImageIcon className="w-2.5 h-2.5 text-indigo-400 flex-shrink-0" />
                      ) : (
                        <Video className="w-2.5 h-2.5 text-indigo-400 flex-shrink-0" />
                      )}
                      <span className="truncate max-w-[140px]">{item.name}</span>
                      <span className="font-mono text-slate-400">{formatFileSize(item.size)}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Story Extract */}
            <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                Extracto de la historia
              </span>
              <p className="text-xs text-slate-300 italic line-clamp-3 leading-relaxed">
                "{formData.story || 'Sin historia escrita aún...'}"
              </p>
            </div>

          </div>

        </div>

        {/* Right: Package Selector & Checkout confirmation (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl">
            
            <h3 className="text-lg font-bold text-white mb-4">
              Selecciona el paquete de producción
            </h3>

            {/* Package selector radio options */}
            <div className="space-y-3 mb-6">
              {catalogPlans.map((plan) => {
                const isSelected = formData.planId === plan.id;

                return (
                  <div
                    key={plan.id}
                    onClick={() => onChange({
                      planId: plan.id,
                      catalogProductId: plan.catalogProductId,
                      catalogPriceId: plan.catalogPriceId,
                    })}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-indigo-600/15 border-indigo-500 ring-2 ring-indigo-500/20'
                        : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected
                              ? 'border-indigo-500 bg-indigo-600'
                              : 'border-slate-500 bg-slate-800'
                          }`}
                        >
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                        </div>
                        <span className="font-bold text-sm text-white">{plan.name}</span>
                      </div>

                      {plan.recommended && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-500 text-white text-[9px] font-bold uppercase tracking-wider">
                          Recomendado
                        </span>
                      )}
                    </div>

                    <div className="flex items-baseline justify-between pl-6 mt-1">
                      <span className="text-xs text-slate-400">{plan.durationText}</span>
                      <span className="text-base font-black text-white">{plan.price}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Total price highlight */}
            <div className="pt-4 border-t border-slate-700 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Plazo de entrega:</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Según el paquete elegido</span>
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Garantía:</span>
                <span className="text-slate-200 font-medium">Revisión incluida</span>
              </div>
              <div className="flex justify-between items-center text-lg font-bold text-white pt-2 border-t border-slate-700/60">
                <span>Total a pagar</span>
                <span className="text-2xl font-black text-indigo-400">{currentPlan.price}</span>
              </div>
            </div>

            {/* Main order CTA */}
            <button
              onClick={onGenerateSong}
              disabled={isGenerating}
              className="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold text-base rounded-2xl transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              {isGenerating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Preparando tu pedido...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-white" />
                  <span>Enviar pedido y pagar ({currentPlan.price})</span>
                </>
              )}
            </button>

            <p className="text-[11px] text-slate-400 text-center mt-3 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span>Pago 100% seguro • Recibirás tu canción al completar la producción</span>
            </p>

          </div>
        </div>

      </div>

    </div>
  );
};
