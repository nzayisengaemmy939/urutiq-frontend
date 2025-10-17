/**
 * Environment configuration for the application
 * This centralizes all environment variables and provides fallbacks
 */

// Get environment variables with smart fallbacks
const getEnvVar = (key: string, fallback?: string): string => {
  // @ts-ignore - Vite's import.meta.env
  const value = import.meta.env[key];
  if (!value) {
    if (fallback) {
      console.warn(`⚠️ Environment variable ${key} not set, using fallback: ${fallback}`);
      return fallback;
    }
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  return value;
};

// Hardcoded API URL - Change this manually when needed
const getApiBaseUrl = (): string => {
  // 🔧 HARDCODED API URL - Change this manually:
  const API_URL = 'https://urutiq-backend-enhanced-bco4.onrender.com';
  
  console.log('🔧 Using hardcoded API URL:', API_URL);
  
  return API_URL;
};

// Debug configuration
console.log('🔧 Hardcoded Configuration:');
console.log('API URL:', getApiBaseUrl());
console.log('Hostname:', window.location.hostname);

// Get the API URL for logging
const apiUrl = getApiBaseUrl();
console.log('🚀 API URL being used:', apiUrl);

export const config = {
  // API Configuration
  api: {
    baseUrl: apiUrl,
    baseUrlWithoutApi: apiUrl,
    timeout: 30000,
  },

  // Authentication
  auth: {
    jwtSecret: import.meta.env.VITE_JWT_SECRET || 'dev-secret',
  },

  // Demo Configuration
  demo: {
    tenantId: import.meta.env.VITE_DEMO_TENANT_ID || 'tenant_demo',
    companyId: import.meta.env.VITE_DEMO_COMPANY_ID || 'seed-company-1',
  },

  // App Configuration
  app: {
    name: 'UrutiIQ',
    version: '1.0.0',
    environment: getEnvVar('MODE', 'development'),
  },
} as const;

// Debug final config
console.log('🔧 Final Config:', config);

// Helper functions for common configurations
export const getApiUrl = (endpoint: string = '') => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  const fullUrl = cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl;
  console.log('🔗 getApiUrl called:', { endpoint, baseUrl, fullUrl });
  return fullUrl;
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
    
    // During login process, use a default tenant ID
    // This prevents the chicken-and-egg problem during authentication
    console.warn('⚠️ No tenant ID found in localStorage or auth token. Using default tenant for login process.');
    return 'tenant_demo';
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
