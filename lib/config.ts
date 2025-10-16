/**
 * Environment configuration for the application
 * This centralizes all environment variables - no fallbacks
 */

// Get environment variables - throws error if not set
const getEnvVar = (key: string): string => {
  // @ts-ignore - Vite's import.meta.env
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

export const config = {
  // API Configuration
  api: {
    baseUrl: getEnvVar('VITE_API_URL'),
    timeout: 30000,
  },

  // Authentication
  auth: {
    jwtSecret: getEnvVar('VITE_JWT_SECRET'),
  },

  // Demo Configuration
  demo: {
    tenantId: getEnvVar('VITE_DEMO_TENANT_ID'),
    companyId: getEnvVar('VITE_DEMO_COMPANY_ID'),
  },

  // App Configuration
  app: {
    name: 'UrutiIQ',
    version: '1.0.0',
    environment: getEnvVar('MODE'),
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
  return config.demo.companyId;
};

export const getTenantId = (): string => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('tenant_id') || config.demo.tenantId;
  }
  return config.demo.tenantId;
};
