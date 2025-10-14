import { config } from './config';

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = config.api.baseUrl) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders = {
      'Content-Type': 'application/json',
      'x-tenant-id': 'tenant_demo',
      'x-company-id': 'seed-company-1',
    };

    const config: RequestInit = {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    };

    const response = await fetch(url, config);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}`;
      let errorDetails = null;
      
      try {
        const errorData = await response.json();
        
        if (errorData.error) {
          errorMessage = errorData.error.message || errorMessage;
          errorDetails = errorData.error.details;
        } else if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (parseError) {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).details = errorDetails;
      throw error;
    }

    const data = await response.json();
    return data;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    const url = new URL(endpoint, this.baseUrl);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return this.request<T>(url.pathname + url.search);
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
    });
  }
}

export const apiClient = new ApiClient();
