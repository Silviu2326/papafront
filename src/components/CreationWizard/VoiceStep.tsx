import React from 'react';
import { CreationFormState, VoiceOption } from '../../types';
import { VOICE_OPTIONS } from '../../data/mockData';
import { audioEngine } from '../../utils/audioEngine';
import { Sparkles, Mic, Play, Check } from 'lucide-react';

interface VoiceStepProps {
  formData: CreationFormState;
  onChange: (updates: Partial<CreationFormState>) => void;
}

export const VoiceStep: React.FC<VoiceStepProps> = ({ formData, onChange }) => {
  const handlePreviewVoice = (e: React.MouseEvent, voiceType: string) => {
    e.stopPropagation();
    audioEngine.previewVoiceSample(voiceType);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Paso 3 de 5</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Elige la voz de tu canción
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Elige la referencia vocal que mejor encaje con la emoción y el estilo de tu canción.
        </p>
      </div>

      {/* Voices List Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {VOICE_OPTIONS.map((voice) => {
          const isSelected = formData.voiceId === voice.id;

          return (
            <div
              key={voice.id}
              onClick={() => onChange({ voiceId: voice.id })}
              className={`group relative rounded-3xl p-6 cursor-pointer transition-all duration-200 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-2 border-indigo-500 shadow-xl shadow-indigo-600/15 ring-2 ring-indigo-500/20'
                  : 'bg-slate-800/50 border border-slate-700 hover:border-indigo-400/80 hover:bg-slate-800'
              }`}
            >
              {/* Checkmark in top-right */}
              {isSelected && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/50">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                </div>
              )}

              {/* Avatar & Voice Info */}
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-slate-700 group-hover:border-indigo-500/60 shadow-md">
                    <img
                      src={voice.imageUrl}
                      alt={voice.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute bottom-0 inset-x-0 bg-slate-950/70 text-[9px] text-center font-bold text-indigo-300 py-0.5">
                      {voice.gender.toUpperCase()}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-white font-bold text-base group-hover:text-indigo-400 transition-colors">
                      {voice.name}
                    </h3>
                    <span className="inline-block text-xs font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 mt-1">
                      {voice.badge}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {voice.description}
                </p>
                <p className="text-[11px] text-slate-400 italic mb-4">
                  "{voice.tone}"
                </p>
              </div>

              {/* Preview Button */}
              <div className="pt-3 border-t border-slate-700/60 flex items-center justify-between">
                <button
                  type="button"
                  onClick={(e) => handlePreviewVoice(e, voice.audioSampleKey)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-indigo-600/15 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/30 text-xs font-bold transition-all active:scale-95 cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current text-indigo-400" />
                  <span>Probar Timbre</span>
                </button>

                <span className="text-xs font-bold text-slate-400 group-hover:text-indigo-400">
                  {isSelected ? 'Elegida' : 'Seleccionar'}
                </span>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
