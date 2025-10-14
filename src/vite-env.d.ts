/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly NEXT_PUBLIC_JWT_SECRET: string
  readonly NEXT_PUBLIC_DEMO_TENANT_ID: string
  readonly NEXT_PUBLIC_DEMO_COMPANY_ID: string
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
