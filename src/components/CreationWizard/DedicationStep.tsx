import React from 'react';
import { CreationFormState } from '../../types';
import { OCCASIONS } from '../../data/mockData';
import { MediaUploadSection } from './MediaUploadSection';
import { Sparkles, Heart, Tag, Gift, Type } from 'lucide-react';

interface DedicationStepProps {
  formData: CreationFormState;
  onChange: (updates: Partial<CreationFormState>) => void;
}

export const DedicationStep: React.FC<DedicationStepProps> = ({
  formData,
  onChange,
}) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Paso 4 de 5</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Dedicatoria y detalles
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Personaliza la entrega. Estos datos aparecerán en la letra oficial, la carátula y el certificado musical.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Left: Input Fields */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 space-y-5">
          
          {/* Song Title */}
          <div>
            <label htmlFor="song-title-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-indigo-400" />
              <span>Título de la canción (Opcional)</span>
            </label>
            <input
              id="song-title-input"
              type="text"
              value={formData.songTitle || ''}
              onChange={(e) => onChange({ songTitle: e.target.value })}
              placeholder="Ej: El Viaje de Sofía, Eterno Amor, etc."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* For Whom */}
          <div>
            <label htmlFor="for-whom-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-indigo-400" />
              <span>¿Para quién es la canción? *</span>
            </label>
            <input
              id="for-whom-input"
              type="text"
              value={formData.forWhom}
              onChange={(e) => onChange({ forWhom: e.target.value })}
              placeholder="Ej: Sofía, Mamá, Mi mejor amigo Carlos..."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* From Whom */}
          <div>
            <label htmlFor="from-whom-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
              <Gift className="w-3.5 h-3.5 text-indigo-400" />
              <span>¿De parte de quién?</span>
            </label>
            <input
              id="from-whom-input"
              type="text"
              value={formData.fromWhom}
              onChange={(e) => onChange({ fromWhom: e.target.value })}
              placeholder="Ej: Tu novio Marcos, Tus hijos, etc."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 transition-all"
            />
          </div>

          {/* Message on Artwork */}
          <div>
            <label htmlFor="dedication-msg-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
              Mensaje impreso en la carátula
            </label>
            <textarea
              id="dedication-msg-input"
              rows={3}
              value={formData.dedicationMessage}
              onChange={(e) => onChange({ dedicationMessage: e.target.value })}
              placeholder="Ej: 'Gracias por cada risa y por estar siempre a mi lado. ¡Feliz Aniversario!'"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-indigo-500 resize-none transition-all"
            />
          </div>

        </div>

        {/* Right: Occasions Pill Selector */}
        <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6 flex flex-col justify-between">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ocasión especial</span>
            </label>

            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((occ, idx) => {
                const isSelected = formData.occasion === occ;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onChange({ occasion: occ })}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400 scale-105'
                        : 'bg-slate-900/80 text-slate-300 border border-slate-700/80 hover:border-slate-500 hover:text-white'
                    }`}
                  >
                    {occ}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Live Preview of Dedication Plate */}
          <div className="mt-6 p-5 bg-slate-950/70 border border-slate-800 rounded-2xl">
            <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-400 block mb-1">
              Vista previa de la dedicatoria
            </span>
            <p className="text-white font-bold text-sm">
              Para: {formData.forWhom || 'Nombre del destinatario'}
            </p>
            {formData.fromWhom && (
              <p className="text-xs text-slate-400">
                De: {formData.fromWhom}
              </p>
            )}
            {formData.occasion && (
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] font-bold">
                {formData.occasion}
              </span>
            )}
          </div>

        </div>

      </div>

      {/* Fotos y videos opcionales para el videoclip personalizado */}
      <MediaUploadSection
        files={formData.mediaFiles || []}
        onChange={(mediaFiles) => onChange({ mediaFiles })}
      />

    </div>
  );
};
