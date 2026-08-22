import React from 'react';
import { CreationFormState } from '../../types';
import { INSPIRATION_IDEAS } from '../../data/mockData';
import { Sparkles, Dices, Mic, Heart, Lightbulb } from 'lucide-react';

interface StoryStepProps {
  formData: CreationFormState;
  onChange: (updates: Partial<CreationFormState>) => void;
}

export const StoryStep: React.FC<StoryStepProps> = ({ formData, onChange }) => {
  const handleRandomIdea = () => {
    const random = INSPIRATION_IDEAS[Math.floor(Math.random() * INSPIRATION_IDEAS.length)];
    onChange({
      story: random.text,
      occasion: random.title,
    });
  };

  const handleSelectIdea = (ideaText: string, occasion: string) => {
    onChange({
      story: ideaText,
      occasion: occasion,
    });
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Paso 1 de 5</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Cuéntanos tu historia
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Cuéntanos los recuerdos, anécdotas y emociones que quieres transmitir. Usaremos tu relato como base para preparar la letra de tu encargo.
        </p>
      </div>

      {/* Story Input Area */}
      <div className="bg-slate-800/70 border border-slate-700 rounded-3xl p-6 relative focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all">
        <div className="flex items-center justify-between mb-3 text-xs">
          <label htmlFor="story-textarea" className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 text-indigo-400" />
            <span>Tu relato o mensaje especial</span>
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRandomIdea}
              className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              title="Cargar idea aleatoria"
            >
              <Dices className="w-3.5 h-3.5" />
              <span>Sugerir idea</span>
            </button>
          </div>
        </div>

        <textarea
          id="story-textarea"
          rows={6}
          value={formData.story}
          onChange={(e) => onChange({ story: e.target.value })}
          placeholder="Ej: Nos conocimos hace 5 años en un café lluvioso en Madrid. Hemos viajado juntos por la costa y quiero agradecerle su apoyo incondicional en los momentos difíciles. Siempre le digo que su sonrisa ilumina mi mundo..."
          className="w-full bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 text-white placeholder-slate-500 text-sm sm:text-base leading-relaxed focus:outline-none focus:border-indigo-500/80 resize-none transition-all"
        />

        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Lightbulb className="w-3.5 h-3.5 text-indigo-400" />
            <span>Sé tan específico como quieras: nombres, lugares o fechas clave.</span>
          </span>
          <span className={`font-mono font-medium ${formData.story.length > 800 ? 'text-amber-400' : 'text-slate-400'}`}>
            {formData.story.length} / 1000 caracteres
          </span>
        </div>
      </div>

      {/* Inspiration Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>O elige una plantilla de inspiración</span>
          </h3>
          <span className="text-xs text-slate-400">Haz clic para rellenar</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INSPIRATION_IDEAS.map((idea, idx) => (
            <div
              key={idx}
              onClick={() => handleSelectIdea(idea.text, idea.title)}
              className="group bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/70 rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-md hover:shadow-lg hover:shadow-indigo-950/30"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-white group-hover:text-indigo-400 transition-colors">
                  {idea.title}
                </span>
                <span className="text-xs font-bold text-indigo-400 group-hover:translate-x-0.5 transition-transform">
                  Usar +
                </span>
              </div>
              <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                {idea.text}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {idea.tags.map((tag, tIdx) => (
                  <span
                    key={tIdx}
                    className="text-[10px] px-2 py-0.5 rounded-md bg-slate-700/60 text-slate-300 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
