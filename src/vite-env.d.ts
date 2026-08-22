/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  /** Alternativa histórica a VITE_SUPABASE_ANON_KEY */
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string;
  /** Clave PUBLICABLE de Stripe (pk_test_... en modo test). Segura en el frontend. */
  readonly VITE_STRIPE_PUBLISHABLE_KEY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
