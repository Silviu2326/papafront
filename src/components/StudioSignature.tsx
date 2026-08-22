import React from 'react';
import { AudioLines, Check, Clock3, Disc3, Sparkles } from 'lucide-react';

const signalBars = [18, 30, 22, 42, 26, 56, 34, 24, 46, 30, 64, 38, 22, 48, 28, 54, 36, 20, 44, 27, 58, 34, 24, 50, 30, 42, 20, 36, 26, 52, 32, 22, 46, 28, 58, 34, 20, 44, 26, 50, 30, 40, 22, 34, 26, 48, 32, 20, 42, 28, 54, 36, 22, 46, 30, 40, 24, 36, 20, 44, 28, 52];

const phases = [
  { label: 'Historia', detail: 'Tu recuerdo', icon: Sparkles },
  { label: 'Dirección', detail: 'Tu estilo', icon: AudioLines },
  { label: 'Entrega', detail: 'Tu canción', icon: Disc3 },
];

export const StudioSignature: React.FC = () => {
  return (
    <section id="studio-signature" className="scroll-mt-20 relative overflow-hidden border-y border-[#3a3035] bg-[#151219] py-20 lg:py-24">
      <div className="pointer-events-none absolute -right-32 top-1/2 h-[420px] w-[420px] -translate-y-1/2 rounded-full bg-[#a99bff]/[0.08] blur-[120px]" />
      <div className="pointer-events-none absolute -left-28 bottom-[-180px] h-[420px] w-[420px] rounded-full bg-[#ff715b]/[0.07] blur-[110px]" />

      <div className="relative mx-auto grid max-w-[1440px] items-center gap-12 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:px-12">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[#ff8975]">El estudio detrás de cada encargo</p>
          <h2 className="max-w-[560px] font-display text-5xl leading-[0.95] tracking-[-0.04em] text-[#f7f1e7] sm:text-6xl">
            Tu historia entra.<br /><span className="text-[#a99bff]">Tu canción sale.</span>
          </h2>
          <p className="mt-7 max-w-[510px] text-[16px] leading-7 text-[#aaa1aa]">
            No tienes que aprender a producir ni pelearte con un generador. Tú pones la verdad de la historia; nuestro equipo le da forma, voz y acabado de estudio.
          </p>

          <div className="mt-10 grid max-w-[540px] gap-6 sm:grid-cols-3 sm:gap-4">
            {phases.map(({ label, detail, icon: Icon }, index) => (
              <div key={label} className="relative">
                {index < phases.length - 1 && <span className="absolute left-10 right-[-16px] top-5 hidden h-px bg-[#5c4a70] sm:block" />}
                <div className="relative z-10 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[#765f91] bg-[#19161d] text-[#c8beff]">
                    <Icon className="h-4 w-4" strokeWidth={1.7} />
                  </span>
                  <span className="text-xs font-bold uppercase tracking-[0.12em] text-[#f7f1e7]">0{index + 1}</span>
                </div>
                <p className="mt-3 text-sm font-semibold text-[#f7f1e7]">{label}</p>
                <p className="mt-1 text-xs text-[#918a97]">{detail}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-[680px]">
          <div className="absolute -inset-7 rounded-[42px] bg-[#a99bff]/[0.07] blur-3xl" />
          <div className="relative rounded-[26px] border border-[#69566f] bg-[#1c1820]/95 p-4 shadow-[0_25px_80px_rgba(0,0,0,0.35)] sm:p-6">
            <div className="flex items-center justify-between border-b border-[#403443] pb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#918a97]">
              <span className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-[#ff715b] shadow-[0_0_12px_rgba(255,113,91,0.7)]" /> Melody / producción</span>
              <span className="flex items-center gap-1.5 text-[#bdf4d1]"><Clock3 className="h-3.5 w-3.5" /> En buenas manos</span>
            </div>

            <div className="relative mt-6 overflow-hidden rounded-[18px] border border-[#403443] bg-[#111014] px-4 pb-5 pt-6 sm:px-6">
              <div className="pointer-events-none absolute -right-16 -top-20 h-48 w-48 rounded-full bg-[#ff715b]/[0.14] blur-3xl" />
              <div className="relative flex items-end justify-between gap-4">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#ff8975]">Dirección sonora</p>
                  <p className="mt-2 font-display text-3xl text-[#f7f1e7]">Hecha para ti</p>
                </div>
                <AudioLines className="h-7 w-7 text-[#a99bff]" strokeWidth={1.5} />
              </div>

              <div className="relative mt-8 flex h-20 items-center gap-[3px] overflow-hidden">
                {signalBars.map((height, index) => (
                  <span
                    key={index}
                    className="w-1 rounded-full bg-gradient-to-t from-[#ff715b] via-[#ff8975] to-[#c8beff] opacity-90 transition-all duration-500 hover:scale-y-125"
                    style={{ height: `${height}px` }}
                  />
                ))}
              </div>

              <div className="mt-5 flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff715b]" />
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#403443]"><div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#ff715b] to-[#a99bff]" /></div>
                <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#918a97]">Boceto sonoro</span>
              </div>

              <div className="mt-6 grid grid-cols-3 border-t border-[#403443] pt-4 text-[10px] font-bold uppercase tracking-[0.14em] text-[#918a97]">
                <span className="text-[#f7f1e7]">Letra</span>
                <span className="text-center">Melodía</span>
                <span className="text-right">Master</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-4 rounded-[16px] border border-[#403443] bg-[#19161d] px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#bdf4d1]/10 text-[#bdf4d1]"><Check className="h-4 w-4" /></span>
                <p className="text-sm font-semibold text-[#f7f1e7]">Revisión incluida</p>
              </div>
              <span className="text-xs text-[#918a97]">Calidad de estudio</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
