/// <reference types="vite/client" />

// Typed environment variables. Only VITE_ prefixed values reach the client bundle.
interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  readonly VITE_APP_NAME?: string;
  readonly VITE_APP_ENVIRONMENT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
