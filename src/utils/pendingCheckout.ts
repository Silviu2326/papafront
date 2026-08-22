import type { CheckoutCustomer } from '../components/CreationWizard/CheckoutModal';
import type { CreationFormState } from '../types';

/**
 * Contexto del asistente guardado justo antes de saltar a Stripe.
 *
 * Ir a Stripe es una navegación completa: al volver, React arranca de cero y se
 * habría perdido la historia, el estilo, la voz y el plan que el cliente eligió.
 * Se guarda en sessionStorage (vive solo en esa pestaña y se borra al cerrarla),
 * y NO es una fuente de pedidos: el pedido real ya está en public.orders.
 */

export const PENDING_CHECKOUT_KEY = 'melody_ai_pending_checkout';

export interface PendingCheckout {
  orderId: string;
  sessionId: string;
  customer: CheckoutCustomer;
  /** Los archivos no son serializables: se guarda el resto del formulario */
  formData: Omit<CreationFormState, 'mediaFiles'>;
}

export function savePendingCheckout(pending: PendingCheckout): void {
  try {
    sessionStorage.setItem(PENDING_CHECKOUT_KEY, JSON.stringify(pending));
  } catch (err) {
    console.error('[checkout] no se pudo guardar el contexto del pedido', err);
  }
}

export function readPendingCheckout(): PendingCheckout | null {
  try {
    const raw = sessionStorage.getItem(PENDING_CHECKOUT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PendingCheckout;
    if (!parsed || typeof parsed.orderId !== 'string') return null;
    return parsed;
  } catch (err) {
    console.error('[checkout] contexto del pedido ilegible', err);
    return null;
  }
}

export function clearPendingCheckout(): void {
  try {
    sessionStorage.removeItem(PENDING_CHECKOUT_KEY);
  } catch {
    /* sin almacenamiento: nada que limpiar */
  }
}
