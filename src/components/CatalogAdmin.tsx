import React, { useEffect, useState } from 'react';
import type { CatalogProduct } from '../lib/catalog';
import {
  createCatalogPrice,
  createCatalogProduct,
  fetchAdminCatalog,
  syncCatalogProduct,
  updateCatalogPrice,
  updateCatalogProduct,
} from '../lib/catalog';
import { CreditCard, Loader2, Package, Plus, RefreshCw, ToggleLeft, ToggleRight } from 'lucide-react';

interface CatalogAdminProps {
  accessToken: string;
  adminEmail?: string;
  onShowToast?: (message: string) => void;
}

const money = (cents: number, currency: string) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: currency.toUpperCase() }).format(cents / 100);

export const CatalogAdmin: React.FC<CatalogAdminProps> = ({ accessToken, adminEmail, onShowToast }) => {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({ slug: '', name: '', description: '', productType: 'song' });
  const [productDrafts, setProductDrafts] = useState<Record<string, { name: string; description: string; productType: string; sortOrder: string }>>({});
  const [newPrices, setNewPrices] = useState<Record<string, { amount: string; nickname: string }>>({});

  const notify = (message: string) => onShowToast?.(message);

  const load = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const nextProducts = await fetchAdminCatalog(accessToken);
      setProducts(nextProducts);
      setProductDrafts((previous) => Object.fromEntries(nextProducts.map((product) => [
        product.id,
        previous[product.id] || {
          name: product.name,
          description: product.description,
          productType: product.productType,
          sortOrder: String(product.sortOrder),
        },
      ])));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el catálogo.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [accessToken]);

  const run = async (id: string, action: () => Promise<void>) => {
    setBusyId(id);
    try {
      await action();
      await load();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'No se pudo completar la operación.');
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateProduct = async (event: React.FormEvent) => {
    event.preventDefault();
    await run('new-product', async () => {
      await createCatalogProduct(accessToken, newProduct);
      setNewProduct({ slug: '', name: '', description: '', productType: 'song' });
      notify('Producto creado y conectado con Stripe.');
    });
  };

  const handleCreatePrice = async (product: CatalogProduct) => {
    const form = newPrices[product.id] || { amount: '', nickname: '' };
    const amount = Number(form.amount.replace(',', '.'));
    if (!Number.isFinite(amount) || amount <= 0) {
      notify('Escribe un importe válido, por ejemplo 34,90.');
      return;
    }
    await run(`price-${product.id}`, async () => {
      await createCatalogPrice(accessToken, product.id, {
        amountCents: Math.round(amount * 100),
        currency: 'eur',
        nickname: form.nickname,
      });
      setNewPrices((prev) => ({ ...prev, [product.id]: { amount: '', nickname: '' } }));
      notify('Nuevo precio creado en Stripe. El anterior quedó archivado.');
    });
  };

  return (
    <div className="melody-workspace pt-24 pb-32 min-h-screen bg-[#111014] text-[#f7f1e7]">
      <div className="max-w-[1360px] mx-auto px-5 lg:px-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Package className="w-3.5 h-3.5" /> Catálogo conectado
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-white">Productos y precios</h1>
            <p className="text-slate-400 text-sm mt-1">{adminEmail || 'Panel de administración'} · Stripe Checkout usa el precio activo.</p>
          </div>
          <button onClick={() => void load()} className="px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 text-sm font-semibold hover:bg-slate-700 inline-flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> Actualizar
          </button>
        </div>

        <form onSubmit={handleCreateProduct} className="bg-slate-800 border border-slate-700 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
          <label className="text-xs text-slate-400">Slug<input value={newProduct.slug} onChange={(e) => setNewProduct({ ...newProduct, slug: e.target.value })} placeholder="videoclip-premium" className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" /></label>
          <label className="text-xs text-slate-400">Nombre<input value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} placeholder="Videoclip Premium" className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" /></label>
          <label className="text-xs text-slate-400 md:col-span-2">Descripción<input value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })} placeholder="Producto digital personalizado" className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" /></label>
          <label className="text-xs text-slate-400">Tipo<select value={newProduct.productType} onChange={(e) => setNewProduct({ ...newProduct, productType: e.target.value })} className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"><option value="song">Canción</option><option value="videoclip">Videoclip</option><option value="stems">Stems</option><option value="service">Servicio</option></select></label>
          <button type="submit" disabled={busyId === 'new-product'} className="h-10 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-bold inline-flex items-center justify-center gap-2"><Plus className="w-4 h-4" /> Nuevo producto</button>
        </form>

        {isLoading && <div className="py-16 text-center text-slate-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Cargando catálogo…</div>}
        {!isLoading && error && <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-5 text-rose-200">{error}</div>}

        {!isLoading && !error && products.length === 0 && <div className="rounded-2xl border border-slate-700 bg-slate-800 p-8 text-center text-slate-400">No hay productos. Ejecuta <code>supabase/catalog.sql</code> o crea el primero arriba.</div>}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {products.map((product) => {
            const priceForm = newPrices[product.id] || { amount: '', nickname: '' };
            const draft = productDrafts[product.id] || { name: product.name, description: product.description, productType: product.productType, sortOrder: String(product.sortOrder) };
            const busy = busyId === product.id || busyId === `price-${product.id}`;
            const activePrice = product.prices.find((price) => price.active);
            return (
              <article key={product.id} className={`bg-slate-800 border rounded-2xl p-5 ${product.active ? 'border-slate-700' : 'border-slate-700/50 opacity-70'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2"><h2 className="text-xl font-bold text-white truncate">{product.name}</h2>{product.active ? <span className="text-[10px] uppercase font-bold text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded-full">Activo</span> : <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-700 px-2 py-1 rounded-full">Oculto</span>}</div>
                    <p className="text-xs text-indigo-300 mt-1 font-mono">{product.slug} · {product.productType}</p>
                    <p className="text-sm text-slate-300 mt-3">{product.description || 'Sin descripción'}</p>
                  </div>
                  <button disabled={busy} onClick={() => void run(product.id, async () => { await updateCatalogProduct(accessToken, product.id, { active: !product.active }); notify(product.active ? 'Producto ocultado.' : 'Producto publicado.'); })} className="text-slate-400 hover:text-white" title={product.active ? 'Ocultar producto' : 'Publicar producto'}>{product.active ? <ToggleRight className="w-7 h-7 text-emerald-400" /> : <ToggleLeft className="w-7 h-7" />}</button>
                </div>

                <form onSubmit={(event) => { event.preventDefault(); void run(product.id, async () => { await updateCatalogProduct(accessToken, product.id, { name: draft.name, description: draft.description, productType: draft.productType, sortOrder: Number(draft.sortOrder) || 0 }); notify('Producto actualizado.'); }); }} className="mt-4 grid grid-cols-1 sm:grid-cols-[1.2fr_1.8fr_auto_auto] gap-2 items-end">
                  <label className="text-[10px] uppercase tracking-wider text-slate-500">Nombre<input value={draft.name} onChange={(e) => setProductDrafts((prev) => ({ ...prev, [product.id]: { ...draft, name: e.target.value } }))} className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white" /></label>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500">Descripción<input value={draft.description} onChange={(e) => setProductDrafts((prev) => ({ ...prev, [product.id]: { ...draft, description: e.target.value } }))} className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white" /></label>
                  <label className="text-[10px] uppercase tracking-wider text-slate-500">Tipo<select value={draft.productType} onChange={(e) => setProductDrafts((prev) => ({ ...prev, [product.id]: { ...draft, productType: e.target.value } }))} className="mt-1 w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-2 text-xs text-white"><option value="song">Canción</option><option value="videoclip">Videoclip</option><option value="stems">Stems</option><option value="service">Servicio</option></select></label>
                  <button type="submit" disabled={busy} className="h-8 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 px-3 text-xs font-bold text-white">Guardar</button>
                </form>

                <div className="mt-5 pt-4 border-t border-slate-700/80">
                  <div className="flex items-center justify-between mb-3"><h3 className="text-xs uppercase tracking-wider font-bold text-slate-400">Precio activo</h3><span className="text-xs text-slate-500">{product.stripeProductId ? 'Stripe conectado' : 'Pendiente de sincronizar'}</span></div>
                  {activePrice ? <div className="flex items-center justify-between bg-slate-900/70 rounded-xl px-3 py-3"><div><p className="font-bold text-white">{money(activePrice.amountCents, activePrice.currency)}</p><p className="text-xs text-slate-400">{activePrice.nickname || 'Precio actual'} {activePrice.stripePriceId ? '· Stripe Price' : '· sin Stripe Price'}</p></div><button disabled={busy} onClick={() => void run(activePrice.id, async () => { await updateCatalogPrice(accessToken, activePrice.id, { active: false }); notify('Precio archivado.'); })} className="text-xs text-rose-300 hover:text-rose-200">Archivar</button></div> : <p className="text-sm text-slate-500">Sin precio activo.</p>}
                  <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mt-3"><input value={priceForm.amount} onChange={(e) => setNewPrices((prev) => ({ ...prev, [product.id]: { ...priceForm, amount: e.target.value } }))} placeholder="34,90" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" /><input value={priceForm.nickname} onChange={(e) => setNewPrices((prev) => ({ ...prev, [product.id]: { ...priceForm, nickname: e.target.value } }))} placeholder="Precio lanzamiento" className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white" /><button disabled={busy} onClick={() => void handleCreatePrice(product)} className="px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white"><Plus className="w-4 h-4" /></button></div>
                  <button disabled={busy} onClick={() => void run(product.id, async () => { await syncCatalogProduct(accessToken, product.id); notify('Producto y precios sincronizados con Stripe.'); })} className="mt-3 w-full py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-bold text-slate-200 inline-flex items-center justify-center gap-2"><CreditCard className="w-3.5 h-3.5" /> Sincronizar con Stripe</button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
};
