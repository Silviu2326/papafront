import React from 'react';
import { FilePenLine, Music2, Sparkles } from 'lucide-react';

interface ThreeStepsProps { onStartCreation: () => void; }

export const ThreeSteps: React.FC<ThreeStepsProps> = ({ onStartCreation }) => {
  const steps = [
    { num: '01', title: 'Cuéntanos tu historia', desc: 'Escribe sobre tus recuerdos, emociones y los momentos que quieres convertir en una canción.', icon: FilePenLine },
    { num: '02', title: 'Define el estilo del encargo', desc: 'Elige el género y la referencia vocal que mejor encajen con tu historia. Nosotros nos encargamos de la producción.', icon: Sparkles },
    { num: '03', title: 'Recibe y comparte', desc: 'Tras el pago, producimos tu canción y te entregamos el audio terminado para descargarlo, compartirlo y regalarlo.', icon: Music2 },
  ];

  return (
    <section id="how-it-works" className="scroll-mt-20 border-y border-[#3a3035] bg-[#19161d]/90 py-12 lg:py-14">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 lg:grid-cols-[180px_1fr] lg:gap-10 lg:px-12">
        <div>
          <p className="font-display text-4xl leading-[0.92] text-[#f7f1e7] sm:text-5xl">Cómo<br />funciona</p>
          <button onClick={onStartCreation} className="mt-6 hidden text-left text-xs font-bold uppercase tracking-[0.18em] text-[#ff715b] transition hover:text-[#ff8975] lg:block">
            Empezar <span className="ml-1">↗</span>
          </button>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <button key={step.num} onClick={onStartCreation} className="group relative text-left">
                {index < steps.length - 1 && <span className="absolute left-[60px] right-[-26px] top-8 hidden h-px bg-[#6e5b86] md:block" />}
                <div className="relative z-10 flex items-center gap-4">
                  <span className="font-display text-4xl text-[#ff715b]">{step.num}</span>
                  <span className="flex h-16 w-16 items-center justify-center rounded-full border border-[#79639d] bg-[#19161d] text-[#a99bff] transition group-hover:border-[#ff715b] group-hover:text-[#ff715b]">
                    <Icon className="h-6 w-6" strokeWidth={1.7} />
                  </span>
                </div>
                <h3 className="mt-5 font-display text-[22px] text-[#f7f1e7] transition group-hover:text-[#ff8975]">{step.title}</h3>
                <p className="mt-2 max-w-[270px] text-sm leading-6 text-[#918a97]">{step.desc}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
