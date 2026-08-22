import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';
import { Sparkles, Music, CheckCircle2, Disc3 } from 'lucide-react';

interface GenerationModalProps {
  isOpen: boolean;
  songTitle: string;
  onComplete: () => void;
  onCancel?: () => void;
}

export const GenerationModal: React.FC<GenerationModalProps> = ({
  isOpen,
  songTitle,
  onComplete,
  onCancel,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  const stages = [
    { title: 'Revisando tu encargo', subtitle: 'Organizando tu historia, dedicatoria y preferencias musicales...' },
    { title: 'Guardando tus preferencias', subtitle: 'Dejando todos los detalles listos para el equipo de producción...' },
    { title: 'Enviando el pedido al estudio', subtitle: 'Guardando todos los detalles y archivos asociados a tu encargo...' },
    { title: 'Producción en curso', subtitle: 'Nuestro equipo producirá el audio y lo adjuntará a tu pedido...' },
  ];

  // onComplete cambia de identidad en cada render del asistente: lo guardamos en una
  // ref para que el temporizador de progreso no se reinicie ni capture una versión vieja.
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Garantiza que la finalización se notifica UNA sola vez por pedido
  const hasCompletedRef = useRef(false);

  // Barra de progreso (sin efectos secundarios dentro del updater de estado)
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentStageIndex(0);
      hasCompletedRef.current = false;
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return Math.min(100, prev + 2.5);
      });
    }, 90);

    return () => clearInterval(interval);
  }, [isOpen]);

  // Etapa visible según el progreso
  useEffect(() => {
    if (progress < 25) setCurrentStageIndex(0);
    else if (progress < 55) setCurrentStageIndex(1);
    else if (progress < 85) setCurrentStageIndex(2);
    else setCurrentStageIndex(3);
  }, [progress]);

  // Final de la confirmación: confeti y aviso al asistente (una única vez)
  useEffect(() => {
    if (!isOpen || progress < 100 || hasCompletedRef.current) return;
    hasCompletedRef.current = true;

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch (e) {
      // ignore if not loaded
    }

    const timeout = setTimeout(() => {
      onCompleteRef.current();
    }, 1200);

    return () => clearTimeout(timeout);
  }, [isOpen, progress]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-2xl flex items-center justify-center p-4">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-3xl p-8 shadow-2xl shadow-indigo-950/80 text-center overflow-hidden">
        
        {/* Glow behind */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Animated Vinyl/Logo */}
        <div className="relative w-28 h-28 mx-auto mb-6">
          <div className="w-full h-full rounded-full bg-indigo-600/20 border-2 border-indigo-500/50 flex items-center justify-center animate-spin-slow">
            <Disc3 className="w-14 h-14 text-indigo-400" />
          </div>
          <div className="absolute inset-0 m-auto w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center border border-indigo-400">
            <Music className="w-5 h-5 text-indigo-400" />
          </div>
        </div>

        {/* Status Text */}
        <div className="space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pedido recibido por el estudio</span>
          </div>
          <h3 className="text-2xl font-black text-white tracking-tight">
            {progress >= 100 ? '¡Tu pedido está confirmado!' : stages[currentStageIndex].title}
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            {progress >= 100 ? `"${songTitle}" ya está en producción. Te avisaremos cuando el audio esté terminado.` : stages[currentStageIndex].subtitle}
          </p>
        </div>

        {/* Progress bar */}
        <div className="space-y-2 mb-6">
          <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden p-0.5 border border-slate-700">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-150 shadow-md shadow-indigo-500/50"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs font-mono text-slate-400">
            <span>Preparando el pedido de "{songTitle}"</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>

        {/* Stages Checklist */}
        <div className="space-y-2 text-left bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          {stages.map((stage, idx) => {
            const isFinished = currentStageIndex > idx || progress >= 100;
            const isCurrent = currentStageIndex === idx && progress < 100;

            return (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className={`font-medium ${isFinished ? 'text-white' : isCurrent ? 'text-indigo-400 font-bold' : 'text-slate-500'}`}>
                  {stage.title}
                </span>
                {isFinished ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : isCurrent ? (
                  <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span className="w-2 h-2 rounded-full bg-slate-700"></span>
                )}
              </div>
            );
          })}
        </div>

        {onCancel && (
          <div className="mt-5 flex items-center justify-center gap-3">
            <button onClick={onCancel} className="px-5 py-2.5 rounded-full bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold">
              Cerrar
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
