/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** auth-service base URL (proxied to :8081 in dev). */
  readonly VITE_AUTH_API_URL?: string;
  readonly VITE_BOOKING_API_URL?: string;
  readonly VITE_PAYMENT_API_URL?: string;
  readonly VITE_CATALOG_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
