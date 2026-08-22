import type { MediaAssetMeta } from '../types';

/**
 * Cliente del backend de pagos.
 *
 * El navegador nunca ve la clave secreta de Stripe ni calcula el importe: solo
 * manda el id del plan y el servidor decide cuánto se cobra.
 */

/** Clave publicable (segura en el frontend). Solo se usa para saber si estamos en modo test. */
export const STRIPE_PUBLISHABLE_KEY = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

/** true cuando la clave publicable es de test (pk_test_...). */
export const isStripeTestMode = STRIPE_PUBLISHABLE_KEY.startsWith('pk_test_');

/**
 * Este proyecto usa Stripe-hosted Checkout: el backend crea la sesión y el
 * navegador solo recibe la URL. Por eso la clave publicable es opcional; solo
 * se conserva para mostrar si estamos en modo test y para futuras interfaces
 * embebidas.
 */
export const isStripeConfigured = Boolean(STRIPE_PUBLISHABLE_KEY);

export interface CreateCheckoutSessionInput {
  customerName: string;
  customerEmail: string;
  story: string;
  styleId: string;
  voiceId: string;
  planId: string;
  catalogProductId?: string;
  catalogPriceId?: string;
  mediaFiles?: MediaAssetMeta[];
}

export interface CreateCheckoutSessionResult {
  /** uuid del pedido ya guardado en public.orders con status 'pending' */
  orderId: string;
  sessionId: string;
  /** URL alojada de Stripe a la que hay que redirigir */
  url: string;
}

export interface OrderProductionStatus {
  status: string;
  generationStatus: string;
}

/**
 * Da de alta el pedido (status 'pending') y crea la Checkout Session.
 * Lanza excepción con un mensaje legible si el backend responde error.
 */
export async function createCheckoutSession(
  input: CreateCheckoutSessionInput
): Promise<CreateCheckoutSessionResult> {
  let response: Response;
  try {
    response = await fetch('/api/checkout/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
  } catch (err) {
    console.error('[checkout] no se pudo contactar con el servidor de pagos:', err);
    throw new Error(
      'No se pudo contactar con el servidor de pagos. Comprueba que está arrancado (npm run server).'
    );
  }

  let payload: { orderId?: string; sessionId?: string; url?: string; error?: string } = {};
  try {
    payload = await response.json();
  } catch {
    /* respuesta sin JSON */
  }

  if (!response.ok) {
    const message = payload.error || `El servidor de pagos respondió ${response.status}.`;
    console.error('[checkout] error del servidor de pagos:', message);
    throw new Error(message);
  }

  if (!payload.orderId || !payload.url || !payload.sessionId) {
    throw new Error('El servidor de pagos devolvió una respuesta incompleta.');
  }

  return { orderId: payload.orderId, sessionId: payload.sessionId, url: payload.url };
}

/** Consulta solo el estado operativo, sin devolver datos personales del pedido. */
export async function fetchOrderProductionStatus(orderId: string): Promise<OrderProductionStatus> {
  const response = await fetch(`/api/checkout/order-status?order_id=${encodeURIComponent(orderId)}`);
  const payload = (await response.json().catch(() => ({}))) as OrderProductionStatus & { error?: string };
  if (!response.ok) throw new Error(payload.error || 'No se pudo consultar el estado del pedido.');
  return { status: payload.status, generationStatus: payload.generationStatus };
}

export interface CheckoutSessionStatus {
  paid: boolean;
  orderId: string | null;
  paymentStatus: string;
  status: string;
  amountTotal: number | null;
  currency: string | null;
  customerEmail: string | null;
}

/**
 * Estado real del pago, consultado a Stripe desde el servidor.
 * Es lo único que autoriza a mostrar el confeti: no basta con la URL de vuelta.
 */
export async function fetchCheckoutStatus(sessionId: string): Promise<CheckoutSessionStatus> {
  const response = await fetch(`/api/checkout/session?session_id=${encodeURIComponent(sessionId)}`);

  let payload: Partial<CheckoutSessionStatus> & { error?: string } = {};
  try {
    payload = await response.json();
  } catch {
    /* respuesta sin JSON */
  }

  if (!response.ok) {
    throw new Error(payload.error || `No se pudo comprobar el pago (${response.status}).`);
  }

  return {
    paid: Boolean(payload.paid),
    orderId: payload.orderId ?? null,
    paymentStatus: payload.paymentStatus || 'unknown',
    status: payload.status || 'unknown',
    amountTotal: payload.amountTotal ?? null,
    currency: payload.currency ?? null,
    customerEmail: payload.customerEmail ?? null,
  };
}
