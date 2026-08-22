import type { PricingPlan } from '../types';

export interface CatalogPrice {
  id: string;
  nickname: string;
  amountCents: number;
  currency: string;
  active: boolean;
  stripePriceId?: string | null;
  createdAt?: string;
}

export interface CatalogProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  productType: string;
  active: boolean;
  sortOrder: number;
  metadata: Record<string, unknown>;
  stripeProductId?: string | null;
  prices: CatalogPrice[];
}

function asString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.trim() ? value : fallback;
}

function asBoolean(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function formatPrice(amountCents: number, currency: string): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amountCents / 100);
}

export function catalogToPricingPlans(products: CatalogProduct[]): PricingPlan[] {
  return products
    // Un producto sin precio activo puede existir mientras se configura desde
    // el panel, pero nunca debe aparecer como comprable en el checkout.
    .filter((product) => product.active && product.prices.some((item) => item.active))
    .map((product) => {
      const price = product.prices.find((item) => item.active) || product.prices[0];
      const metadata = product.metadata || {};
      const features = Array.isArray(metadata.features)
        ? metadata.features
            .filter((item): item is Record<string, unknown> => Boolean(item && typeof item === 'object'))
            .map((item) => ({
              text: asString(item.text, 'Producto personalizado'),
              included: asBoolean(item.included, true),
              highlight: asBoolean(item.highlight),
              icon: typeof item.icon === 'string' ? item.icon : undefined,
            }))
        : [
            { text: product.description || 'Producto personalizado', included: true },
            { text: 'Pago seguro con Stripe', included: true },
          ];

      return {
        id: product.slug,
        name: product.name,
        price: price ? formatPrice(price.amountCents, price.currency) : 'Consultar',
        priceNumber: price ? price.amountCents / 100 : 0,
        period: 'producto',
        description: product.description,
        recommended: asBoolean(metadata.recommended),
        popular: asBoolean(metadata.popular),
        durationText: asString(metadata.durationText, 'Entrega según producto'),
        revisionsText: asString(metadata.revisionsText, 'Incluidas según producto'),
        qualityText: asString(metadata.qualityText, 'Calidad de estudio'),
        deliveryText: asString(metadata.deliveryText, 'Entrega digital'),
        commercialRights: asBoolean(metadata.commercialRights),
        stems: asBoolean(metadata.stems),
        features,
        catalogProductId: product.id,
        catalogPriceId: price?.id,
        stripePriceId: price?.stripePriceId || undefined,
        priceCents: price?.amountCents,
      } satisfies PricingPlan;
    });
}

export async function fetchPublicCatalog(): Promise<CatalogProduct[]> {
  const response = await fetch('/api/catalog/public');
  const payload = (await response.json().catch(() => ({}))) as {
    products?: CatalogProduct[];
    error?: string;
  };
  if (!response.ok) throw new Error(payload.error || 'No se pudo cargar el catálogo.');
  return payload.products || [];
}

async function catalogAdminRequest<T>(accessToken: string, path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
      ...(init?.headers || {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as T & { error?: string };
  if (!response.ok) throw new Error(payload.error || 'No se pudo completar la operación del catálogo.');
  return payload;
}

export async function fetchAdminCatalog(accessToken: string): Promise<CatalogProduct[]> {
  const payload = await catalogAdminRequest<{ products: CatalogProduct[] }>(accessToken, '/api/catalog/admin');
  return payload.products || [];
}

export async function createCatalogProduct(
  accessToken: string,
  input: { slug: string; name: string; description: string; productType: string }
): Promise<CatalogProduct> {
  const payload = await catalogAdminRequest<{ product: CatalogProduct }>(accessToken, '/api/catalog/admin/products', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return payload.product;
}

export async function updateCatalogProduct(
  accessToken: string,
  productId: string,
  updates: Partial<Pick<CatalogProduct, 'name' | 'description' | 'active' | 'sortOrder' | 'productType'>>
): Promise<CatalogProduct> {
  const payload = await catalogAdminRequest<{ product: CatalogProduct }>(
    accessToken,
    `/api/catalog/admin/products/${encodeURIComponent(productId)}`,
    { method: 'PATCH', body: JSON.stringify(updates) }
  );
  return payload.product;
}

export async function syncCatalogProduct(accessToken: string, productId: string): Promise<CatalogProduct> {
  const payload = await catalogAdminRequest<{ product: CatalogProduct }>(
    accessToken,
    `/api/catalog/admin/products/${encodeURIComponent(productId)}/sync`,
    { method: 'POST', body: '{}' }
  );
  return payload.product;
}

export async function createCatalogPrice(
  accessToken: string,
  productId: string,
  input: { amountCents: number; currency: string; nickname: string }
): Promise<CatalogPrice> {
  const payload = await catalogAdminRequest<{ price: CatalogPrice }>(
    accessToken,
    `/api/catalog/admin/products/${encodeURIComponent(productId)}/prices`,
    { method: 'POST', body: JSON.stringify(input) }
  );
  return payload.price;
}

export async function updateCatalogPrice(
  accessToken: string,
  priceId: string,
  updates: { nickname?: string; active?: boolean }
): Promise<CatalogPrice> {
  const payload = await catalogAdminRequest<{ price: CatalogPrice }>(
    accessToken,
    `/api/catalog/admin/prices/${encodeURIComponent(priceId)}`,
    { method: 'PATCH', body: JSON.stringify(updates) }
  );
  return payload.price;
}
