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

// Get API URL from environment variables only
const getApiBaseUrl = (): string => {
  const apiUrl = import.meta.env.VITE_API_URL;
  if (!apiUrl) {
    throw new Error('VITE_API_URL environment variable is required but not set');
  }
  return apiUrl;
};

// Debug environment variables
console.log('🔧 Environment Variables Debug:');
console.log('VITE_API_URL:', import.meta.env.VITE_API_URL);
console.log('VITE_JWT_SECRET:', import.meta.env.VITE_JWT_SECRET);
console.log('VITE_DEMO_TENANT_ID:', import.meta.env.VITE_DEMO_TENANT_ID);
console.log('VITE_DEMO_COMPANY_ID:', import.meta.env.VITE_DEMO_COMPANY_ID);
console.log('MODE:', import.meta.env.MODE);
console.log('All env vars:', import.meta.env);

// Debug API URL selection
try {
  const selectedApiUrl = getApiBaseUrl();
  console.log('🎯 Selected API URL:', selectedApiUrl);
  console.log('🎯 Environment mode:', import.meta.env.MODE);
} catch (error) {
  console.error('❌ Error getting API URL:', error);
}

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
  const fullUrl = `${baseUrl}/${cleanEndpoint}`;
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
