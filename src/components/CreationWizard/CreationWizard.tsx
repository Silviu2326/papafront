import React, { useEffect, useRef, useState } from 'react';
import { CreationFormState, CreationStep, MediaAssetMeta, Order, PricingPlan, Song } from '../../types';
import { PRICING_PLANS, STYLE_OPTIONS, VOICE_OPTIONS } from '../../data/mockData';
import { audioEngine } from '../../utils/audioEngine';
import {
  getOrderMedia,
  persistOrderMedia,
  toMediaAssetMeta,
  uploadOrderMediaToSupabase,
} from '../../utils/mediaFiles';
import { updateOrderInSupabase } from '../../lib/supabase';
import { createCheckoutSession } from '../../lib/checkout';
import { savePendingCheckout } from '../../utils/pendingCheckout';
import { StoryStep } from './StoryStep';
import { StyleStep } from './StyleStep';
import { VoiceStep } from './VoiceStep';
import { DedicationStep } from './DedicationStep';
import { ReviewStep } from './ReviewStep';
import { GenerationModal } from './GenerationModal';
import { CheckoutModal, CheckoutCustomer } from './CheckoutModal';
import { ArrowLeft, ArrowRight, Sparkles, Check, Music2, ShieldCheck, ChevronRight } from 'lucide-react';

interface CreationWizardProps {
  catalogPlans: PricingPlan[];
  initialStyleId?: string;
  initialPlanId?: string;
  onCancel: () => void;
  onSongCreated: (newSong: Song) => void;
  onOpenPricing: () => void;
  onOrderUpdated?: (orderId: string, updates: Partial<Order>) => void;
  /**
   * Vuelta desde Stripe con el pago ya confirmado: se recupera el formulario
   * guardado antes del salto y se confirma el inicio de producción.
   */
  resumeAfterPayment?: {
    orderId: string;
    formData: Omit<CreationFormState, 'mediaFiles'>;
    customerName: string;
    customerEmail: string;
  } | null;
}

export const CreationWizard: React.FC<CreationWizardProps> = ({
  catalogPlans,
  initialStyleId = 'pop',
  initialPlanId = 'premium',
  onCancel,
  onSongCreated,
  onOpenPricing,
  onOrderUpdated,
  resumeAfterPayment = null,
}) => {
  const [currentStep, setCurrentStep] = useState<CreationStep>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showGenModal, setShowGenModal] = useState(false);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [customer, setCustomer] = useState<CheckoutCustomer>({ name: '', email: '' });
  // Id del pedido creado al confirmar el checkout; la ficha de producción lo reutiliza
  const createdOrderIdRef = useRef<string | null>(null);

  const [formData, setFormData] = useState<CreationFormState>({
    story: '',
    styleId: initialStyleId,
    voiceId: 'masc-1',
    forWhom: '',
    fromWhom: '',
    occasion: 'Aniversario (1 año)',
    dedicationMessage: '',
    songTitle: '',
    tags: ['Personalizado', 'Emocional'],
    planId: initialPlanId,
    mediaFiles: [],
  });

  // Libera las vistas previas (object URLs) de fotos/videos al salir del asistente
  const mediaFilesRef = useRef(formData.mediaFiles);
  mediaFilesRef.current = formData.mediaFiles;
  useEffect(() => {
    return () => {
      mediaFilesRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
    };
  }, []);

  const selectedStyle = STYLE_OPTIONS.find((s) => s.id === formData.styleId) || STYLE_OPTIONS[0];
  const selectedVoice = VOICE_OPTIONS.find((v) => v.id === formData.voiceId) || VOICE_OPTIONS[0];
  const selectedPlan = catalogPlans.find((p) => p.id === formData.planId) || catalogPlans[0] || PRICING_PLANS[1];

  const updateFormData = (updates: Partial<CreationFormState>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((prev) => (prev + 1) as CreationStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setShowCheckoutModal(true);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as CreationStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onCancel();
    }
  };

  const handleToggleStylePreview = (genreKey: string) => {
    if (isPlayingPreview) {
      audioEngine.stop();
      setIsPlayingPreview(false);
    } else {
      const style = STYLE_OPTIONS.find((s) => s.id === genreKey) || STYLE_OPTIONS[0];
      audioEngine.play(genreKey, style.bpmNumber || 110);
      setIsPlayingPreview(true);
    }
  };

  /**
   * Vuelta de Stripe con el pago ya confirmado por el servidor: se restaura el
   * formulario y se muestra la confirmación de producción (y con ella el confeti). Solo ocurre
   * aquí; sin pago confirmado, `resumeAfterPayment` llega a null.
   */
  const hasResumedRef = useRef(false);
  useEffect(() => {
    if (!resumeAfterPayment || hasResumedRef.current) return;
    hasResumedRef.current = true;

    console.log('[checkout] pago confirmado, retomando el pedido', resumeAfterPayment.orderId);

    setFormData((prev) => ({
      ...prev,
      ...resumeAfterPayment.formData,
      // Los archivos ya se subieron antes del salto a Stripe
      mediaFiles: [],
    }));
    setCustomer({
      name: resumeAfterPayment.customerName,
      email: resumeAfterPayment.customerEmail,
    });
    createdOrderIdRef.current = resumeAfterPayment.orderId;

    setShowCheckoutModal(false);
    setIsGenerating(true);
    setShowGenModal(true);
  }, [resumeAfterPayment]);

  const handleOpenCheckout = () => {
    setShowCheckoutModal(true);
  };

  /**
   * Confirmación del checkout: da de alta el pedido como 'pending', deja
   * enlazadas las imágenes al order_id y lleva al cliente a Stripe.
   *
   * Aquí NO hay éxito ni confeti: el pago todavía no ha ocurrido. Si algo
   * falla, se lanza y el modal de checkout muestra el error.
   */
  const handleConfirmPaymentAndStart = async (checkoutCustomer: CheckoutCustomer) => {
    setCustomer(checkoutCustomer);

    const attachments = formData.mediaFiles;
    const mediaMeta: MediaAssetMeta[] = attachments.map(toMediaAssetMeta);

    // 1. Pedido en public.orders con status 'pending' + Checkout Session.
    //    El importe lo decide el servidor a partir del plan.
    const { orderId, sessionId, url } = await createCheckoutSession({
      customerName: checkoutCustomer.name,
      customerEmail: checkoutCustomer.email,
      story: formData.story,
      styleId: formData.styleId,
      voiceId: formData.voiceId,
      planId: formData.planId,
      catalogProductId: formData.catalogProductId || selectedPlan.catalogProductId,
      catalogPriceId: formData.catalogPriceId || selectedPlan.catalogPriceId,
      mediaFiles: mediaMeta.length > 0 ? mediaMeta : undefined,
    });

    createdOrderIdRef.current = orderId;

    // 2. Imágenes y vídeos: se guardan y se suben ANTES de salir de la página,
    //    ya con el order_id definitivo (carpeta <order_id>/ del bucket privado).
    if (attachments.length > 0) {
      try {
        await persistOrderMedia(orderId, attachments, new Date().toISOString());
        const result = await uploadOrderMediaToSupabase(orderId, attachments);
        onOrderUpdated && onOrderUpdated(orderId, { mediaFiles: result.files });
        await updateOrderInSupabase(orderId, { mediaFiles: result.files });
      } catch (err) {
        // El pago puede seguir: los archivos se reintentan desde el panel de Pedidos
        console.error('[checkout] error subiendo los archivos del videoclip', err);
      }
    }

    // 3. El formulario se guarda para poder retomar el pedido al volver
    const { mediaFiles: _omitted, ...serializableForm } = formData;
    savePendingCheckout({
      orderId,
      sessionId,
      customer: checkoutCustomer,
      formData: serializableForm,
    });

    // 4. A la pasarela alojada de Stripe
    console.log('[checkout] redirigiendo a Stripe:', url);
    window.location.href = url;
  };

  const handleGenerationFinished = () => {
    setIsGenerating(false);
    setShowGenModal(false);

    // El pedido ya se creó al confirmar el checkout: la canción reutiliza su id
    const orderId = createdOrderIdRef.current || `order-${Date.now()}`;
    const mediaFiles: MediaAssetMeta[] = getOrderMedia(orderId);

    // Create realistic new song object
    const createdTitle = formData.songTitle || (formData.forWhom ? `Para ${formData.forWhom}` : 'Melodía Inolvidable');
    const newSong: Song = {
      id: orderId,
      title: createdTitle,
      subtitle: formData.forWhom ? `Dedicada a ${formData.forWhom} · En producción` : 'Pedido personalizado · En producción',
      author: 'Melody AI Studio',
      genre: selectedStyle.name,
      genreVibe: `${selectedStyle.vibe} ${selectedStyle.subVibe}`,
      voiceName: selectedVoice.name,
      duration: 195,
      bpm: selectedStyle.bpmNumber || 120,
      story: formData.story || 'Una historia personalizada de amor, superación y hermosos recuerdos compartidos.',
      dedication: {
        to: formData.forWhom || 'Alguien Especial',
        from: formData.fromWhom || 'Autor',
        occasion: formData.occasion || 'Ocasión Especial',
        message: formData.dedicationMessage || 'Con todo mi cariño para siempre.',
      },
      lyrics: 'La letra se añadirá durante la producción.',
      coverUrl: selectedStyle.imageUrl,
      createdAt: 'Ahora mismo',
      planId: formData.planId,
      status: 'generating',
      revisionsLeft: selectedPlan.id === 'esencial' ? 1 : selectedPlan.id === 'premium' ? 3 : 5,
      isFavorite: true,
      tags: [selectedStyle.name, formData.occasion || 'Especial'],
      audioKey: formData.styleId,
      mediaFiles: mediaFiles.length > 0 ? mediaFiles : undefined,
    };

    onSongCreated(newSong);
  };

  const stepsList = [
    { num: 1, label: 'Historia' },
    { num: 2, label: 'Estilo' },
    { num: 3, label: 'Voz' },
    { num: 4, label: 'Dedicatoria' },
    { num: 5, label: 'Revisión' },
  ];

  return (
    <div className="melody-workspace min-h-screen pt-20 pb-32 bg-[#111014] text-[#f7f1e7]">
      
      {/* Top Header Sticky Step Bar matching Vibrant Palette Design */}
      <div className="sticky top-20 z-30 bg-[#0F172A]/90 backdrop-blur-xl border-b border-slate-800 shadow-md">
        <div className="max-w-[1440px] mx-auto px-4 lg:px-12 h-16 flex items-center justify-between">
          
          {/* Breadcrumb Steps */}
          <div className="flex items-center gap-2 sm:gap-4 overflow-x-auto py-2 no-scrollbar">
            {stepsList.map((step, idx) => {
              const isCurrent = currentStep === step.num;
              const isCompleted = currentStep > step.num;

              return (
                <React.Fragment key={step.num}>
                  <button
                    onClick={() => setCurrentStep(step.num as CreationStep)}
                    className={`flex items-center gap-2 text-xs sm:text-sm font-semibold transition-all cursor-pointer flex-shrink-0 ${
                      isCurrent
                        ? 'text-white'
                        : isCompleted
                        ? 'text-slate-300 hover:text-white'
                        : 'text-slate-500 hover:text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                        isCurrent
                          ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20 shadow-md shadow-indigo-600/30'
                          : isCompleted
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : step.num}
                    </div>
                    <span>{step.label}</span>
                  </button>

                  {idx < stepsList.length - 1 && (
                    <div className="w-4 sm:w-8 h-[1px] bg-slate-700 flex-shrink-0"></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Action Buttons in Header */}
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
            <button
              onClick={handleBack}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              Volver
            </button>
            <button
              onClick={handleNext}
              className="px-5 sm:px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs sm:text-sm font-bold rounded-full transition-all shadow-lg shadow-indigo-600/20 hover:scale-105 active:scale-95 flex items-center gap-1.5 cursor-pointer"
            >
              <span>{currentStep === 5 ? 'Revisar mi encargo' : 'Continuar'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>

      {/* Main Content Grid (8 cols main + 4 cols order summary) */}
      <main className="max-w-[1440px] mx-auto px-4 lg:px-12 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Current Step Content (8 cols) */}
          <div className="lg:col-span-8">
            {currentStep === 1 && (
              <StoryStep formData={formData} onChange={updateFormData} />
            )}
            {currentStep === 2 && (
              <StyleStep
                formData={formData}
                onChange={updateFormData}
                isPlayingPreview={isPlayingPreview}
                onTogglePreview={handleToggleStylePreview}
              />
            )}
            {currentStep === 3 && (
              <VoiceStep formData={formData} onChange={updateFormData} />
            )}
            {currentStep === 4 && (
              <DedicationStep formData={formData} onChange={updateFormData} />
            )}
            {currentStep === 5 && (
              <ReviewStep
                formData={formData}
                catalogPlans={catalogPlans}
                onChange={updateFormData}
                onGenerateSong={handleOpenCheckout}
                isGenerating={isGenerating}
              />
            )}

            {/* Bottom step navigation bar */}
            <div className="mt-12 pt-6 border-t border-slate-800 flex items-center justify-between">
              <button
                onClick={handleBack}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-sm font-semibold transition-all border border-slate-700 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>{currentStep === 1 ? 'Cancelar y volver' : 'Paso anterior'}</span>
              </button>

              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-7 py-3 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold shadow-lg shadow-indigo-600/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
              >
                <span>{currentStep === 5 ? 'Finalizar y Pagar' : 'Continuar al siguiente paso'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right Column: Order Summary Card (4 cols) matching Vibrant Palette Design */}
          <div className="lg:col-span-4">
            <div className="bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 sticky top-40 shadow-xl space-y-6">
              
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center justify-between">
                <span>Resumen del pedido</span>
                <span className="text-xs font-mono text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded">
                  Paso {currentStep}/5
                </span>
              </h3>

              {/* Dynamic steps summary items */}
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center py-2 border-b border-slate-700/60">
                  <span className="text-slate-400">Historia:</span>
                  <span className="text-white font-medium truncate max-w-[160px]">
                    {formData.story ? formData.story.slice(0, 22) + '...' : 'Escribiendo...'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-700/60">
                  <span className="text-slate-400">Estilo:</span>
                  <span className="text-white font-medium flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-indigo-400"></span>
                    <span>{selectedStyle.name}</span>
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-700/60">
                  <span className="text-slate-400">Voz:</span>
                  <span className="text-white font-medium">{selectedVoice.name}</span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-slate-700/60">
                  <span className="text-slate-400">Para:</span>
                  <span className="text-white font-medium truncate max-w-[160px]">
                    {formData.forWhom || 'No especificado'}
                  </span>
                </div>
              </div>

              {/* Selected Plan Box matching Vibrant Palette HTML */}
              <div className="border-t border-slate-700 pt-4">
                <div className="bg-indigo-600/10 border border-indigo-500/30 rounded-2xl p-4 relative overflow-hidden">
                  {selectedPlan.recommended && (
                    <div className="absolute top-0 right-0 bg-indigo-500 text-[10px] font-bold text-white px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                      Recomendado
                    </div>
                  )}
                  <p className="text-xs text-indigo-400 uppercase tracking-widest font-bold mb-1">
                    {selectedPlan.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-white">{selectedPlan.price}</span>
                    <span className="text-xs text-slate-400">/ canción</span>
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    Incluye: calidad y extras según el producto configurado en el catálogo.
                  </p>
                </div>
              </div>

              {/* Total and Guarantee */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between items-baseline font-bold text-white text-lg">
                  <span>Total</span>
                  <span className="text-2xl font-black text-indigo-400">{selectedPlan.price}</span>
                </div>
                <p className="text-[10px] text-slate-400 text-center italic">
                  IVA incluido • La letra se prepara tras confirmar el pago; el audio se entrega cuando termina la producción
                </p>
              </div>

              {/* Action Button */}
              <button
                onClick={handleNext}
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-xl shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{currentStep === 5 ? 'Finalizar y Pagar' : 'Continuar al siguiente'}</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>

            </div>
          </div>

        </div>
      </main>

      {/* Checkout Payment Modal */}
      <CheckoutModal
        isOpen={showCheckoutModal}
        formData={formData}
        catalogPlans={catalogPlans}
        onClose={() => setShowCheckoutModal(false)}
        onConfirmPayment={handleConfirmPaymentAndStart}
      />

      {/* Confirmación del pedido y comienzo de producción */}
      <GenerationModal
        isOpen={showGenModal}
        songTitle={formData.songTitle || (formData.forWhom ? `Para ${formData.forWhom}` : 'Mi Canción')}
        onCancel={() => {
          setShowGenModal(false);
          setIsGenerating(false);
        }}
        onComplete={handleGenerationFinished}
      />

    </div>
  );
};
