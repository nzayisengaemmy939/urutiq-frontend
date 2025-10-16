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
    const company_id = localStorage.getItem('company_id');
    const companyId = localStorage.getItem('companyId');
    const company = localStorage.getItem('company');
    
    console.log('=== getCompanyId() DEBUG ===');
    console.log('localStorage company_id:', company_id);
    console.log('localStorage companyId:', companyId);
    console.log('localStorage company:', company);
    
    const result = company_id || companyId || company || config.demo.companyId;
    console.log('getCompanyId() returning:', result);
    console.log('getCompanyId() result length:', result.length);
    
    return result;
  }
  return config.demo.companyId;
};

export const getTenantId = (): string => {
  if (typeof window !== 'undefined') {
    // Use the tenant ID from localStorage to match the JWT token
    return localStorage.getItem('tenant_id') || config.demo.tenantId;
  }
  return config.demo.tenantId;
};

// Default company ID constant
export const DEFAULT_COMPANY_ID = config.demo.companyId;

// Get headers for API requests
export const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
    'x-tenant-id': getTenantId(),
    'x-company-id': getCompanyId() || DEFAULT_COMPANY_ID,
  };
  
  console.log('=== getHeaders() DEBUG ===');
  console.log('Headers being sent:', headers);
  console.log('Tenant ID:', getTenantId());
  console.log('Company ID:', getCompanyId() || DEFAULT_COMPANY_ID);
  console.log('Auth token exists:', !!localStorage.getItem('auth_token'));
  
  return headers;
};
