import React from 'react';
import { CreationFormState } from '../../types';
import { STYLE_OPTIONS } from '../../data/mockData';
import { Sparkles, Play, Pause, Check } from 'lucide-react';

interface StyleStepProps {
  formData: CreationFormState;
  onChange: (updates: Partial<CreationFormState>) => void;
  isPlayingPreview: boolean;
  onTogglePreview: (genreKey: string) => void;
}

export const StyleStep: React.FC<StyleStepProps> = ({
  formData,
  onChange,
  isPlayingPreview,
  onTogglePreview,
}) => {
  const currentStyleObj =
    STYLE_OPTIONS.find((s) => s.id === formData.styleId) || STYLE_OPTIONS[0];

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Step Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Paso 2 de 5</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Selecciona el estilo musical
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Define el alma y la energía de tu canción. ¿Qué ritmo te imaginas para tu historia?
        </p>
      </div>

      {/* Selected style summary + counter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/70 border border-slate-700 text-xs">
          <span className="text-base leading-none">{currentStyleObj.icon}</span>
          <span className="text-slate-400">Estilo seleccionado:</span>
          <span className="font-bold text-white">{currentStyleObj.name}</span>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          {STYLE_OPTIONS.length} estilos disponibles
        </span>
      </div>

      {/* Styles Grid (adaptable + scrollable) */}
      <div className="max-h-[30rem] overflow-y-auto overscroll-contain pr-1 sm:pr-2 -mr-1 sm:-mr-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {STYLE_OPTIONS.map((style) => {
            const isSelected = formData.styleId === style.id;

            return (
              <button
                key={style.id}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange({ styleId: style.id })}
                className={`group relative text-left rounded-2xl p-6 cursor-pointer transition-all duration-200 ${
                  isSelected
                    ? 'bg-slate-800/90 border-2 border-indigo-500 shadow-xl shadow-indigo-600/15 ring-2 ring-indigo-500/20'
                    : 'bg-slate-800/50 border border-slate-700 hover:border-indigo-400/80 hover:bg-slate-800'
                }`}
              >
                {/* Selected Checkmark Badge in Top-Right */}
                {isSelected && (
                  <div className="absolute top-4 right-4">
                    <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/50">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 text-2xl transition-transform group-hover:scale-110 ${
                    isSelected ? 'bg-indigo-500/20 text-indigo-400' : 'bg-slate-700/60'
                  }`}
                >
                  <span>{style.icon}</span>
                </div>

                {/* Title & Vibe */}
                <h3 className="text-white font-bold text-lg mb-1 group-hover:text-indigo-400 transition-colors">
                  {style.name}
                </h3>
                <span className="text-[11px] font-semibold text-indigo-400 block mb-2">
                  {style.vibe}
                </span>

                {/* Description */}
                <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 mb-3">
                  {style.description}
                </p>

                {/* BPM Pill */}
                <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between text-[10px] font-mono text-slate-400">
                  <span>{style.bpm}</span>
                  <span className="font-semibold text-slate-400 group-hover:text-indigo-400">
                    {isSelected ? 'Seleccionado' : 'Elegir'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Demo Player Banner for Current Style */}
      <div className="p-6 bg-indigo-900/20 border border-indigo-500/30 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-indigo-950/30">
        <div>
          <p className="text-white font-bold text-base flex items-center gap-2">
            <span>Escucha una muestra del estilo {currentStyleObj.name}</span>
          </p>
          <p className="text-xs text-slate-400 mt-0.5">
            Sintetizador en tiempo real basado en acordes y tempo ({currentStyleObj.bpmNumber} BPM).
          </p>
        </div>

        <button
          onClick={() => onTogglePreview(formData.styleId)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-slate-100 transition-all shadow-md active:scale-95 text-xs uppercase tracking-wider cursor-pointer flex-shrink-0"
        >
          {isPlayingPreview ? (
            <>
              <Pause className="w-4 h-4 fill-current" />
              <span>Pausar Demo</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Escuchar Demo</span>
            </>
          )}
        </button>
      </div>

    </div>
  );
};
