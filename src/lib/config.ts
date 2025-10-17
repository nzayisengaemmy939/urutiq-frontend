/**
 * Environment configuration for the application
 * This centralizes all environment variables and provides fallbacks
 */

// Get environment variables - no fallbacks, must be set
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
    baseUrlWithoutApi: getEnvVar('VITE_API_URL'),
    timeout: 30000,
  },

  // Authentication
  auth: {
    jwtSecret: getEnvVar('VITE_JWT_SECRET'),
  },

  // Demo Configuration - removed fallbacks
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
  'x-tenant-id': getTenantId(),
});

export const getCompanyId = (): string => {
  if (typeof window !== 'undefined') {
    const company_id = localStorage.getItem('company_id');
    const companyId = localStorage.getItem('companyId');
    const company = localStorage.getItem('company');
    
    const result = company_id || companyId || company;
    if (result) {
      return result;
    }
    
    throw new Error('Company ID not found in localStorage');
  }
  
  throw new Error('Company ID not available in server environment');
};

export const getTenantId = (): string => {
  if (typeof window !== 'undefined') {
    // Only use localStorage tenant_id
    const tenantId = localStorage.getItem('tenant_id');
    if (tenantId) {
      return tenantId;
    }
    
    // If no tenant_id in localStorage, try to extract from auth token
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload.tenantId) {
          // Store it in localStorage for future use
          localStorage.setItem('tenant_id', payload.tenantId);
          return payload.tenantId;
        }
      } catch (error) {
        // Silent fail - will throw error below
      }
    }
    
    throw new Error('Tenant ID not found in localStorage or auth token');
  }
  
  throw new Error('Tenant ID not available in server environment');
};

// Get headers for API requests
export const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
    'x-tenant-id': getTenantId(),
    'x-company-id': getCompanyId(),
  };
  
  return headers;
};
