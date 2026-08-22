import React, { useState } from 'react';
import { Song, RevisionRequest } from '../types';
import { X, RotateCcw, Send, CheckCircle2, MessageSquare, Clock } from 'lucide-react';

interface RevisionModalProps {
  song: Song | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitRevision: (req: RevisionRequest) => void;
}

export const RevisionModal: React.FC<RevisionModalProps> = ({
  song,
  isOpen,
  onClose,
  onSubmitRevision,
}) => {
  const [revisionType, setRevisionType] = useState<'letra' | 'tempo' | 'voz' | 'instrumental' | 'otro'>('letra');
  const [notes, setNotes] = useState('');
  const [timestamp, setTimestamp] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen || !song) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notes.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
      onSubmitRevision({
        songId: song.id,
        type: revisionType,
        notes: notes,
        targetTimestamp: timestamp,
      });

      setTimeout(() => {
        setIsSuccess(false);
        setNotes('');
        setTimestamp('');
        onClose();
      }, 1400);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-indigo-950/70 overflow-hidden animate-fadeIn">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-white">¡Solicitud de revisión enviada!</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Nuestros ingenieros de audio y modelos de IA han comenzado a ajustar tu pista. Recibirás la nueva versión en unos minutos.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Revisiones Disponibles: {song.revisionsLeft}</span>
              </div>
              <h2 className="text-2xl font-extrabold text-white">Solicitar Revisión</h2>
              <p className="text-xs text-slate-400 mt-1">
                Canción: <strong className="text-white">"{song.title}"</strong>
              </p>
            </div>

            {/* Type of change selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2.5">
                ¿Qué te gustaría cambiar o ajustar?
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'letra', label: 'Letra o rimas' },
                  { id: 'tempo', label: 'Velocidad / Ritmo' },
                  { id: 'voz', label: 'Tono / Cantante' },
                  { id: 'instrumental', label: 'Arreglos / Instrumentos' },
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setRevisionType(type.id as any)}
                    className={`p-3 rounded-xl text-xs font-bold transition-all text-left border cursor-pointer ${
                      revisionType === type.id
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300 ring-2 ring-indigo-500/20'
                        : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Timestamp Target (Optional) */}
            <div>
              <label htmlFor="timestamp-input" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Minuto o sección concreta (Opcional)</span>
              </label>
              <input
                id="timestamp-input"
                type="text"
                value={timestamp}
                onChange={(e) => setTimestamp(e.target.value)}
                placeholder="Ej: 0:45 en el coro, o todo el tema"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            {/* Notes Textarea */}
            <div>
              <label htmlFor="revision-notes" className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-indigo-400" />
                <span>Detalles de las modificaciones deseadas *</span>
              </label>
              <textarea
                id="revision-notes"
                rows={4}
                required
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ej: Me gustaría que el segundo verso mencione más el viaje a Barcelona y que el solo de guitarra al final sea un poco más alegre..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 text-xs leading-relaxed focus:outline-none focus:border-indigo-500 resize-none"
              />
            </div>

            {/* Submit CTA */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isSubmitting || !notes.trim()}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                    <span>Enviando...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar a Producción</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
