/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONVERT_API: string;
  readonly VITE_STRIPE_KEY: string;
  // adicione outras variáveis que estiver usando
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
