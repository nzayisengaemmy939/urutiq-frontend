/**
 * Configuration for the application
 * All settings are hardcoded here for easy management
 */

// Hardcoded API URL
const getApiBaseUrl = (): string => {
  return 'https://urutiq-backend-enhanced-bco4.onrender.com';
};

// Get the API URL
const apiUrl = getApiBaseUrl();

export const config = {
  // API Configuration
  api: {
    baseUrl: apiUrl,
    baseUrlWithoutApi: apiUrl,
    timeout: 30000,
  },

  // Authentication
  auth: {
    jwtSecret: 'dev-secret',
  },

  // Demo Configuration
  demo: {
    tenantId: 'tenant_demo',
    companyId: 'seed-company-1',
  },

  // App Configuration
  app: {
    name: 'UrutiIQ',
    version: '1.0.0',
    environment: 'production',
  },
} as const;

// Helper functions for common configurations
export const getApiUrl = (endpoint: string = '') => {
  const baseUrl = config.api.baseUrl.replace(/\/$/, ''); // Remove trailing slash
  const cleanEndpoint = endpoint.replace(/^\//, ''); // Remove leading slash
  const fullUrl = cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl;
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
    const tenantId = localStorage.getItem('tenant_id');
    if (tenantId) {
      return tenantId;
    }
    
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        if (payload.tenantId) {
          localStorage.setItem('tenant_id', payload.tenantId);
          return payload.tenantId;
        }
      } catch (error) {
        // Silent fail
      }
    }
    
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
