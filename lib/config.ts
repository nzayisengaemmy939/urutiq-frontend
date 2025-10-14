/**
 * Environment configuration for the application
 * This centralizes all environment variables and provides fallbacks
 */

// Get environment variables with fallbacks
const getEnvVar = (key: string, fallback: string): string => {
  // @ts-ignore - Vite's import.meta.env
  return import.meta.env[key] || fallback;
};

export const config = {
  // API Configuration
  api: {
    baseUrl: getEnvVar('VITE_API_URL', 'https://urutiq-backend-clean-11.onrender.com'),
    timeout: 30000,
  },

  // Authentication
  auth: {
    jwtSecret: getEnvVar('VITE_JWT_SECRET', 'dev-secret'),
  },

  // Demo Configuration
  demo: {
    tenantId: getEnvVar('VITE_DEMO_TENANT_ID', 'tenant_demo'),
    companyId: getEnvVar('VITE_DEMO_COMPANY_ID', 'seed-company-1'),
  },

  // App Configuration
  app: {
    name: 'UrutiIQ',
    version: '1.0.0',
    environment: getEnvVar('MODE', 'development'),
  },
} as const;

// Helper functions for common configurations
export const getApiUrl = (endpoint: string = '') => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  return `${baseUrl}/${cleanEndpoint}`;
};

export const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'x-tenant-id': config.demo.tenantId,
});

export const getCompanyId = (): string => {
  if (typeof window !== 'undefined') {
    return (
      localStorage.getItem('company_id') ||
      localStorage.getItem('companyId') ||
      localStorage.getItem('company') ||
      config.demo.companyId
    );
  }
  console.log(  config.demo.companyId,'config.demo.compay id')
  return config.demo.companyId;
};

export const getTenantId = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('tenant_id') || config.demo.tenantId;
  }
  return config.demo.tenantId;
};
