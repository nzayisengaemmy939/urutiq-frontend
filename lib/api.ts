import { config } from './config';

const API_BASE = config.api.baseUrl;

export interface ApiResponse<T = any> {
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  page?: number;
  pageSize?: number;
  total?: number;
  totalPages?: number;
}

// Direct response types for endpoints that return data directly
export type DirectResponse<T> = T;

export interface Company {
  id: string;
  name: string;
  industry?: string;
  taxId?: string;
  country?: string;
  currency?: string;
  fiscalYearStart?: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    invoices: number;
    bills: number;
    customers: number;
    vendors: number;
    transactions: number;
    products: number;
  };
}

export interface Invoice {
  id: string;
  companyId: string;
  customerId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate?: string;
  status: string;
  totalAmount: number;
  balanceDue: number;
  
  // Enhanced Invoice Fields
  currency: string;
  exchangeRate?: number;
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  shippingAmount: number;
  notes?: string;
  terms?: string;
  footer?: string;
  
  // Payment and Collection
  paymentTerms?: string;
  lateFeeRate?: number;
  lateFeeAmount: number;
  collectionStatus?: string;
  
  // Delivery and Communication
  deliveryMethod?: string;
  sentAt?: string;
  viewedAt?: string;
  lastViewedAt?: string;
  reminderCount: number;
  
  // Approval and Workflow
  approvalStatus: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  
  // Estimates and Quotes
  estimateId?: string;
  estimate?: Estimate;
  
  // Recurring Invoice
  recurringInvoiceId?: string;
  recurringInvoice?: RecurringInvoice;
  
  // Credit Notes and Refunds
  creditNoteId?: string;
  refundAmount: number;
  refundStatus?: string;
  
  // Multi-currency Support
  customerCurrency?: string;
  customerExchangeRate?: number;
  
  // Tax Information
  taxInclusive: boolean;
  taxExemptionReason?: string;
  
  // Document Management
  pdfGenerated: boolean;
  pdfGeneratedAt?: string;
  pdfUrl?: string;
  
  // Activity Tracking
  createdBy?: string;
  lastModifiedBy?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations
  customer?: {
    id: string;
    name: string;
    email?: string;
    customerCode?: string;
  };
  lines?: InvoiceLine[];
  creator?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    activities: number;
    attachments: number;
    payments: number;
  };
}

export interface InvoiceLine {
  id: string;
  invoiceId: string;
  productId?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
  
  // Enhanced Line Fields
  lineNumber?: number;
  productCode?: string;
  unitOfMeasure?: string;
  
  // Pricing Details
  discountRate: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  
  // Tax Information
  taxCode?: string;
  taxExempt: boolean;
  taxExemptionReason?: string;
  
  // Additional Information
  notes?: string;
  deliveryDate?: string;
  warranty?: string;
  
  // Cost Tracking
  costPrice?: number;
  margin?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations
  product?: Product;
}

export interface InvoiceActivity {
  id: string;
  invoiceId: string;
  activityType: string;
  description?: string;
  performedBy?: string;
  metadata?: string;
  createdAt: string;
  
  // Relations
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InvoiceAttachment {
  id: string;
  invoiceId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  uploadedBy: string;
  description?: string;
  createdAt: string;
  
  // Relations
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

export interface InvoicePayment {
  id: string;
  invoiceId: string;
  paymentId: string;
  amount: number;
  paymentDate: string;
  paymentMethod: string;
  reference?: string;
  notes?: string;
  createdAt: string;
}

export interface InvoiceReminder {
  id: string;
  invoiceId: string;
  reminderType: string;
  sentAt: string;
  sentBy?: string;
  templateId?: string;
  status: string;
  response?: string;
  createdAt: string;
  
  // Relations
  sender?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Estimate {
  id: string;
  companyId: string;
  customerId: string;
  estimateNumber: string;
  issueDate: string;
  expiryDate?: string;
  status: string;
  totalAmount: number;
  currency: string;
  notes?: string;
  terms?: string;
  validUntil?: string;
  
  // Enhanced Estimate Fields
  subtotal: number;
  taxAmount: number;
  discountAmount: number;
  exchangeRate?: number;
  
  // Customer Communication
  sentAt?: string;
  viewedAt?: string;
  lastViewedAt?: string;
  reminderCount: number;
  
  // Conversion Tracking
  convertedToInvoiceId?: string;
  convertedAt?: string;
  conversionNotes?: string;
  
  // Approval and Workflow
  approvalStatus: string;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  
  // Customer Response
  customerResponse?: string;
  responseDate?: string;
  
  // Document Management
  pdfGenerated: boolean;
  pdfGeneratedAt?: string;
  pdfUrl?: string;
  
  // Activity Tracking
  createdBy?: string;
  lastModifiedBy?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations
  customer?: {
    name: string;
    email?: string;
  };
  lines?: EstimateLine[];
  activities?: EstimateActivity[];
  attachments?: EstimateAttachment[];
  reminders?: EstimateReminder[];
  convertedInvoice?: Invoice;
  creator?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EstimateLine {
  id: string;
  estimateId: string;
  productId?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
  
  // Enhanced Line Fields
  lineNumber?: number;
  productCode?: string;
  unitOfMeasure?: string;
  
  // Pricing Details
  discountRate: number;
  discountAmount: number;
  taxAmount: number;
  netAmount: number;
  
  // Tax Information
  taxCode?: string;
  taxExempt: boolean;
  taxExemptionReason?: string;
  
  // Additional Information
  notes?: string;
  deliveryDate?: string;
  warranty?: string;
  
  // Cost Tracking
  costPrice?: number;
  margin?: number;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  
  // Relations
  product?: Product;
}

export interface EstimateActivity {
  id: string;
  estimateId: string;
  activityType: string;
  description?: string;
  performedBy?: string;
  metadata?: string;
  createdAt: string;
  
  // Relations
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EstimateAttachment {
  id: string;
  estimateId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  fileUrl: string;
  uploadedBy: string;
  description?: string;
  createdAt: string;
  
  // Relations
  uploader: {
    id: string;
    name: string;
    email: string;
  };
}

export interface EstimateReminder {
  id: string;
  estimateId: string;
  reminderType: string;
  sentAt: string;
  sentBy?: string;
  templateId?: string;
  status: string;
  response?: string;
  createdAt: string;
  
  // Relations
  sender?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface RecurringInvoice {
  id: string;
  companyId: string;
  customerId: string;
  name: string;
  description?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
  interval: number;
  startDate: string;
  endDate?: string;
  nextRunDate: string;
  lastRunDate?: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  totalAmount: number;
  currency: string;
  notes?: string;
  terms?: string;
  dueDateOffset: number;
  autoSend: boolean;
  emailTemplate?: string;
  createdAt: string;
  updatedAt: string;
  customer?: {
    name: string;
    email?: string;
  };
  lines?: RecurringInvoiceLine[];
  generatedInvoices?: Invoice[];
  _count?: {
    generatedInvoices: number;
  };
}

export interface RecurringInvoiceLine {
  id: string;
  recurringInvoiceId: string;
  productId?: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  lineTotal: number;
}

export interface Bill {
  id: string;
  companyId: string;
  vendorId: string;
  billNumber: string;
  billDate: string;
  dueDate?: string;
  totalAmount: number;
  balanceDue: number;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  taxNumber?: string;
  address?: string;
  
  // Enhanced Customer Fields
  customerCode?: string;
  customerType: string;
  
  // Contact Information
  primaryContact?: string;
  billingEmail?: string;
  billingPhone?: string;
  
  // Address Details
  billingAddress?: string;
  shippingAddress?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  
  // Business Information
  businessName?: string;
  industry?: string;
  website?: string;
  registrationNumber?: string;
  
  // Financial Information
  creditLimit?: number;
  paymentTerms?: string;
  currency?: string;
  taxExempt: boolean;
  taxExemptionReason?: string;
  
  // Customer Status and Classification
  status: string;
  customerTier?: string;
  source?: string;
  assignedTo?: string;
  
  // Communication Preferences
  emailOptIn: boolean;
  smsOptIn: boolean;
  preferredContactMethod?: string;
  
  // Notes and Tags
  notes?: string;
  tags?: string;
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
  lastContactAt?: string;
  
  // Relations
  contacts?: CustomerContact[];
  addresses?: CustomerAddress[];
  activities?: CustomerActivity[];
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  };
  _count?: {
    invoices: number;
    estimates: number;
    recurringInvoices: number;
  };
}

export interface CustomerContact {
  id: string;
  customerId: string;
  name: string;
  title?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  isPrimary: boolean;
  department?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  customerId: string;
  addressType: string;
  address1: string;
  address2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country?: string;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerActivity {
  id: string;
  customerId: string;
  activityType: string;
  subject: string;
  description?: string;
  activityDate: string;
  performedBy?: string;
  duration?: number;
  outcome?: string;
  followUpRequired: boolean;
  followUpDate?: string;
  createdAt: string;
  
  // Relations
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface Product {
  id: string;
  companyId: string;
  name: string;
  sku: string;
  description?: string;
  type: string;
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

export interface Vendor {
  id: string;
  companyId: string;
  name: string;
  email?: string;
  phone?: string;
  taxNumber?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  companyId: string;
  transactionType: string;
  amount: number;
  currency: string;
  transactionDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIInsight {
  id: string;
  companyId: string;
  category: string;
  insightText: string;
  priority: string;
  generatedAt: string;
}

export interface AIAnomaly {
  id: string;
  companyId: string;
  anomalyType: string;
  confidenceScore: number;
  status: string;
  createdAt: string;
}

export interface AIRecommendation {
  id: string;
  companyId: string;
  recommendationType: string;
  recommendationText: string;
  status: string;
  createdAt: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
}

export interface RefreshResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
}

class ApiService {
  private baseUrl: string;
  private token?: string;
  private tenantId?: string;
  private refreshTokenValue?: string;

  constructor() {
    this.baseUrl = API_BASE;
  }

  setAuth(token: string, tenantId: string) {
    console.log('🔧 API Service setAuth called:', { token: token ? 'Present' : 'Missing', tenantId })
    this.token = token;
    this.tenantId = tenantId;
    console.log('🔧 API Service auth set:', { token: this.token ? 'Present' : 'Missing', tenantId: this.tenantId })
  }

  setRefreshToken(token: string) {
    this.refreshTokenValue = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    console.log("🔧 API Service request called:")
    console.log("🔧 Endpoint:", endpoint)
    console.log("🔧 Base URL:", this.baseUrl)
    console.log("🔧 Full URL:", url)
    
    // Best-effort hydrate auth from storage if missing
    try {
      if (typeof window !== 'undefined') {
        if (!this.token) {
          const t = localStorage.getItem('auth_token')
          if (t) this.token = t
        }
        if (!this.tenantId) {
          const tid = localStorage.getItem('tenant_id')
          if (tid) this.tenantId = tid
        }
        if (!this.refreshTokenValue) {
          const rt = localStorage.getItem('refresh_token')
          if (rt) this.refreshTokenValue = rt
        }
      }
    } catch {}

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    headers['x-tenant-id'] = this.tenantId || 'tenant_demo';
    try {
      if (typeof window !== 'undefined') {
        const companyId = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company')
        if (companyId) (headers as any)['x-company-id'] = companyId
      }
    } catch {}


    const doFetch = async (): Promise<Response> => {
      return fetch(url, { ...options, headers });
    };

    let response = await doFetch();
    

    // Attempt refresh once on 401; if unavailable or fails, fall back to demo token
    if (response.status === 401) {
      try {
        // Best-effort hydrate from storage
        if (!this.refreshTokenValue && typeof window !== 'undefined') {
          try {
            const rt = localStorage.getItem('refresh_token')
            if (rt) this.refreshTokenValue = rt
          } catch {}
        }
        if (!this.token && typeof window !== 'undefined') {
          try {
            const t = localStorage.getItem('auth_token')
            if (t) this.token = t
          } catch {}
        }

        let retried = false

        // Try refresh if we have a refresh token
        if (this.refreshTokenValue) {
          const refreshResp = await fetch(`${this.baseUrl}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.tenantId || 'tenant_demo' },
            body: JSON.stringify({ refreshToken: this.refreshTokenValue })
          });
          if (refreshResp.ok) {
            const refreshData = await refreshResp.json();
            const newAccess = (refreshData.data?.accessToken) || refreshData.accessToken;
            if (newAccess) {
              this.token = newAccess;
              try { localStorage.setItem('auth_token', newAccess); } catch {}
              (headers as any)['Authorization'] = `Bearer ${newAccess}`;
              response = await doFetch();
              retried = true
            }
          }
        }

        // If still unauthorized or no refresh available, obtain a demo token and retry once
        if (!retried && (response.status === 401)) {
          try {
            const demoResp = await fetch(`${this.baseUrl}/auth/demo-token`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.tenantId || 'tenant_demo' },
              body: JSON.stringify({ sub: 'demo_user', roles: ['admin','accountant'] })
            })
            if (demoResp.ok) {
              const { token } = await demoResp.json()
              if (token) {
                this.token = token
                try { localStorage.setItem('auth_token', token) } catch {}
                ;(headers as any)['Authorization'] = `Bearer ${token}`
                response = await doFetch()
              }
            }
          } catch {}
        }
      } catch {}
    }

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
        try {
          const errorText = await response.text();
          errorMessage = errorText || errorMessage;
        } catch (textError) {
          // Failed to parse error response
        }
      }
      
      const error = new Error(errorMessage);
      (error as any).status = response.status;
      (error as any).details = errorDetails;
      throw error;
    }

    // Some endpoints (for example logout) may return an empty body or a non-JSON payload.
    // Read the raw text first and only parse JSON when present to avoid "Unexpected end of JSON input" errors.
    const raw = await response.text();
    console.log("📄 Raw response text:", raw.substring(0, 500) + (raw.length > 500 ? "..." : ""))
    
    let data: any = {};
    if (raw && raw.length > 0) {
      try {
        data = JSON.parse(raw);
        console.log("✅ JSON parsed successfully:", data)
      } catch (err) {
        console.log("❌ JSON parsing failed:", err)
        // If parsing fails, fall back to returning the raw text under a `data` field so callers get something useful.
        data = raw;
      }
    } else {
      console.log("📄 Empty response body")
    }
    console.log(`API Response for ${endpoint}:`, data); // Debug log
    return data;
  }

  // Convenience HTTP helpers that return the typed data payload (not the ApiResponse wrapper)
  async get<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const resp = await this.request<T>(endpoint, { ...options, method: options.method || 'GET' });
    // Handle both wrapped responses (resp.data) and direct responses (resp)
    return (resp.data as T) ?? (resp as T) ?? ({} as T);
  }

  async post<T = any>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
    const resp = await this.request<T>(endpoint, { method: 'POST', body: body ? JSON.stringify(body) : options.body, ...options });
    return (resp.data as T) ?? ({} as T);
  }

  async put<T = any>(endpoint: string, body?: any, options: RequestInit = {}): Promise<T> {
    const resp = await this.request<T>(endpoint, { method: 'PUT', body: body ? JSON.stringify(body) : options.body, ...options });
    return (resp.data as T) ?? ({} as T);
  }

  async delete<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const resp = await this.request<T>(endpoint, { method: 'DELETE', ...options });
    return (resp.data as T) ?? ({} as T);
  }

  // Authentication
  async getDemoToken(sub: string, roles: string[] = ['admin']): Promise<{ token: string }> {
    const response = await this.request<{ token: string }>('/auth/demo-token', {
      method: 'POST',
      body: JSON.stringify({ sub, roles }),
    });
    const payload = (response as any).data ?? response;
    return (payload as any) || { token: '' };
  }

  async register(data: { email: string; password: string; name?: string; role?: string }): Promise<{ id: string; email: string }> {
    const response = await this.request<{ id: string; email: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const payload = (response as any).data ?? response;
    return (payload as any) || { id: '', email: '' };
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    console.log("🌐 API Service: Making login request")
    console.log("📝 Method: POST")
    console.log("🎯 Endpoint: /auth/login")
    console.log("📦 Body:", { email, password: "***" })
    console.log("🏢 Tenant ID:", this.tenantId || 'tenant_demo')
    
    const response = await this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    const payload = (response as any).data ?? response;
    return (payload as LoginResponse) || { accessToken: '', refreshToken: '', tokenType: 'Bearer', expiresIn: 3600 };
  }

  // MFA-aware login: returns either tokens or challenge
  async loginMfa(email: string, password: string): Promise<{ ok: true; tokens: LoginResponse } | { ok: false; challengeToken: string }> {
    const url = `${this.baseUrl}/auth/login`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.tenantId || 'tenant_demo' },
      body: JSON.stringify({ email, password })
    });
    const bodyText = await res.text();
    let body: any = {};
    try { body = bodyText ? JSON.parse(bodyText) : {}; } catch {}
    if (res.status === 200 && body) {
      const data = (body as any).data ?? body;
      return { ok: true, tokens: data as LoginResponse };
    }
    if (res.status === 401 && body && (body.challengeRequired || body.challengeToken)) {
      const data = (body as any).data ?? body;
      return { ok: false, challengeToken: data.challengeToken };
    }
    const message = (body && (body.error?.message || body.message)) || `HTTP ${res.status}`;
    throw new Error(message);
  }

  async verifyMfaLogin(challengeToken: string, code: string): Promise<LoginResponse> {
    const url = `${this.baseUrl}/auth/mfa/login/verify`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-tenant-id': this.tenantId || 'tenant_demo' },
      body: JSON.stringify({ challengeToken, code })
    });
    const text = await res.text();
    let body: any = {};
    try { body = text ? JSON.parse(text) : {}; } catch {}
    if (!res.ok) {
      const msg = (body && (body.error?.message || body.message)) || `HTTP ${res.status}`;
      throw new Error(msg);
    }
    const data = (body as any).data ?? body;
    return data as LoginResponse;
  }

  async refresh(refreshToken: string): Promise<RefreshResponse> {
    const response = await this.request<RefreshResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    const payload = (response as any).data ?? response;
    return (payload as RefreshResponse) || { accessToken: '', tokenType: 'Bearer', expiresIn: 3600 };
  }

  async logout(refreshToken: string): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    return;
  }

  // Companies
  async getCompanies(params?: {
    page?: number;
    pageSize?: number;
    country?: string;
    currency?: string;
    q?: string;
  }): Promise<ApiResponse<Company[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.country) searchParams.append('country', params.country);
    if (params?.currency) searchParams.append('currency', params.currency);
    if (params?.q) searchParams.append('q', params.q);

    return this.request(`/companies?${searchParams.toString()}`);
  }

  async getCompany(id: string): Promise<Company> {
    const response = await this.request<Company>(`/companies/${id}`);
    return response.data || { id: '', name: '', createdAt: '', updatedAt: '' };
  }

  async createCompany(data: Partial<Company>): Promise<Company> {
    const response = await this.request<Company>('/companies', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data || { id: '', name: '', createdAt: '', updatedAt: '' };
  }

  async updateCompany(id: string, data: Partial<Company>): Promise<Company> {
    const response = await this.request<Company>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data || { id: '', name: '', createdAt: '', updatedAt: '' };
  }

  async deleteCompany(id: string): Promise<void> {
    await this.request(`/companies/${id}`, {
      method: 'DELETE',
    });
    return;
  }

  // Invoices
  async getInvoices(params?: {
    page?: number;
    pageSize?: number;
    companyId?: string;
    status?: string;
    q?: string;
  }): Promise<ApiResponse<Invoice[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.companyId) searchParams.append('companyId', params.companyId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.q) searchParams.append('q', params.q);

    return this.request(`/invoices?${searchParams.toString()}`);
  }

  async createInvoice(data: any): Promise<Invoice> {
    const response = await this.request<Invoice>('/invoices', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data || { id: '', companyId: '', customerId: '', invoiceNumber: '', issueDate: '', totalAmount: 0, balanceDue: 0, status: '', createdAt: '', updatedAt: '' };
  }

  async postInvoice(id: string): Promise<Invoice> {
    const response = await this.request<Invoice>(`/invoices/${id}/post`, {
      method: 'POST',
    });
    return response.data || { id: '', companyId: '', customerId: '', invoiceNumber: '', issueDate: '', totalAmount: 0, balanceDue: 0, status: '', createdAt: '', updatedAt: '' };
  }

  async updateInvoice(id: string, data: Partial<Invoice>): Promise<Invoice> {
    const response = await this.request<Invoice>(`/invoices/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
    return response.data || { id: '', companyId: '', customerId: '', invoiceNumber: '', issueDate: '', totalAmount: 0, balanceDue: 0, status: '', createdAt: '', updatedAt: '' }
  }

  async getNextInvoiceNumber(companyId?: string): Promise<{ invoiceNumber: string }> {
    const sp = new URLSearchParams()
    if (companyId) sp.append('companyId', companyId)
    const response = await this.request<{ invoiceNumber: string }>(`/invoices/next-number?${sp.toString()}`)
    const payload = (response as any)?.data ?? response
    if (payload && (payload as any).invoiceNumber) return payload as any
    const fallback = `INV-${Date.now().toString().slice(-6)}`
    return { invoiceNumber: fallback }
  }

  async sendInvoiceEmail(id: string, opts: { to: string; subject?: string; message?: string; attachPdf?: boolean } ): Promise<{ ok: boolean }> {
    const response = await this.request<{ ok: boolean }>(`/invoices/${id}/send`, { method: 'POST', body: JSON.stringify(opts) })
    const payload = (response as any)?.data ?? response
    return (payload as any) || { ok: true }
  }

  async getInvoicePdf(id: string): Promise<Blob> {
    const headers: Record<string, string> = { 'x-tenant-id': (this as any).tenantId || 'tenant_demo' }
    if ((this as any).token) headers['Authorization'] = `Bearer ${(this as any).token}`
    const res = await fetch(`${this.baseUrl}/invoices/${id}/pdf`, { headers })
    if (!res.ok) throw new Error(`Failed to fetch PDF`)
    return await res.blob()
  }

  async createPaymentLink(id: string, opts?: { expiresInMinutes?: number; customerEmail?: string; customerName?: string; description?: string }): Promise<{ url: string; expiresAt: Date; amount: number; currency: string }> {
    const response = await this.request<{ url: string; expiresAt: Date; amount: number; currency: string }>(`/invoices/${id}/payment-link`, { method: 'POST', body: JSON.stringify(opts || {}) })
    const payload = (response as any)?.data ?? response
    if (payload && (payload as any).url) return payload as any
    return { url: `${this.baseUrl}/pay/${id}`, expiresAt: new Date(), amount: 0, currency: 'USD' }
  }

  async createPaymentIntent(id: string, opts?: { customerEmail?: string; customerName?: string; description?: string }): Promise<{ clientSecret: string; paymentIntentId: string; amount: number; currency: string }> {
    const response = await this.request<{ clientSecret: string; paymentIntentId: string; amount: number; currency: string }>(`/invoices/${id}/payment-intent`, { method: 'POST', body: JSON.stringify(opts || {}) })
    const payload = (response as any)?.data ?? response
    return payload as any
  }

  async getPaymentStatus(id: string): Promise<{
    invoiceId: string;
    status: string;
    balanceDue: number;
    totalAmount: number;
    hasPaymentLink: boolean;
    lastPaymentIntent?: string;
    paymentStatus: string;
    lastPaymentDate?: string;
    paymentMethod?: string;
  }> {
    const response = await this.request(`/invoices/${id}/payment-status`)
    const payload = (response as any)?.data ?? response
    return payload as any
  }

  async createCustomerPortalSession(customerEmail: string, returnUrl: string): Promise<{ url: string }> {
    const response = await this.request<{ url: string }>('/customer-portal', { method: 'POST', body: JSON.stringify({ customerEmail, returnUrl }) })
    const payload = (response as any)?.data ?? response
    return payload as any
  }

  async getExchangeRate(base: string, target: string): Promise<{ rate: number }> {
    try {
      const headers: Record<string, string> = { 'x-tenant-id': (this as any).tenantId || 'tenant_demo' }
      if ((this as any).token) headers['Authorization'] = `Bearer ${(this as any).token}`
      const res = await fetch(`${this.baseUrl}/fx/rate?base=${encodeURIComponent(base)}&target=${encodeURIComponent(target)}`, { headers })
      if (!res.ok) throw new Error('rate_error')
      const body = await res.json().catch(() => ({}))
      const data = (body as any).data ?? body
      if (data && typeof data.rate === 'number') return { rate: data.rate }
    } catch {}
    return { rate: 1 }
  }

  async getInvoiceActivity(id: string): Promise<InvoiceActivity[]> {
    return this.get<InvoiceActivity[]>(`/invoices/${id}/activity`);
  }

  async addInvoiceActivity(id: string, data: {
    activityType: string;
    description?: string;
    performedBy?: string;
    metadata?: any;
  }): Promise<InvoiceActivity> {
    return this.post<InvoiceActivity>(`/invoices/${id}/activity`, data);
  }

  async getInvoiceAttachments(id: string): Promise<InvoiceAttachment[]> {
    return this.get<InvoiceAttachment[]>(`/invoices/${id}/attachments`);
  }

  async addInvoiceAttachment(id: string, data: {
    fileName: string;
    fileSize: number;
    mimeType: string;
    fileUrl: string;
    uploadedBy: string;
    description?: string;
  }): Promise<InvoiceAttachment> {
    return this.post<InvoiceAttachment>(`/invoices/${id}/attachments`, data);
  }

  async getInvoicePayments(id: string): Promise<InvoicePayment[]> {
    return this.get<InvoicePayment[]>(`/invoices/${id}/payments`);
  }

  async addInvoicePayment(id: string, data: {
    paymentId: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    reference?: string;
    notes?: string;
  }): Promise<InvoicePayment> {
    return this.post<InvoicePayment>(`/invoices/${id}/payments`, data);
  }

  async getInvoiceReminders(id: string): Promise<InvoiceReminder[]> {
    return this.get<InvoiceReminder[]>(`/invoices/${id}/reminders`);
  }

  async sendInvoiceReminder(id: string, data: {
    reminderType: string;
    sentBy?: string;
    templateId?: string;
    response?: string;
  }): Promise<InvoiceReminder> {
    return this.post<InvoiceReminder>(`/invoices/${id}/reminders`, data);
  }

  // Estimates
  async getEstimates(params?: {
    page?: number;
    pageSize?: number;
    companyId?: string;
    status?: string;
    q?: string;
  }): Promise<ApiResponse<Estimate[]>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.companyId) searchParams.append('companyId', params.companyId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.q) searchParams.append('q', params.q);
    return this.request(`/estimates?${searchParams.toString()}`);
  }

  async createEstimate(data: any): Promise<Estimate> {
    const response = await this.request<Estimate>('/estimates', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data || { id: '', companyId: '', customerId: '', estimateNumber: '', issueDate: '', totalAmount: 0, currency: 'USD', status: '', createdAt: '', updatedAt: '' };
  }

  async updateEstimate(id: string, data: Partial<Estimate>): Promise<Estimate> {
    const response = await this.request<Estimate>(`/estimates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data || { id: '', companyId: '', customerId: '', estimateNumber: '', issueDate: '', totalAmount: 0, currency: 'USD', status: '', createdAt: '', updatedAt: '' };
  }

  async convertEstimateToInvoice(id: string): Promise<Invoice> {
    const response = await this.request<Invoice>(`/estimates/${id}/convert`, {
      method: 'POST',
    });
    return response.data || { id: '', companyId: '', customerId: '', invoiceNumber: '', issueDate: '', totalAmount: 0, balanceDue: 0, status: '', createdAt: '', updatedAt: '' };
  }

  async getNextEstimateNumber(companyId?: string): Promise<{ estimateNumber: string }> {
    const sp = new URLSearchParams();
    if (companyId) sp.append('companyId', companyId);
    const response = await this.request<{ estimateNumber: string }>(`/estimates/next-number?${sp.toString()}`);
    const payload = (response as any)?.data ?? response;
    if (payload && (payload as any).estimateNumber) return payload as any;
    const fallback = `EST-${Date.now().toString().slice(-6)}`;
    return { estimateNumber: fallback };
  }

  async getEstimatePdf(id: string): Promise<Blob> {
    const headers: Record<string, string> = { 'x-tenant-id': (this as any).tenantId || 'tenant_demo' };
    if ((this as any).token) headers['Authorization'] = `Bearer ${(this as any).token}`;
    const res = await fetch(`${this.baseUrl}/estimates/${id}/pdf`, { headers });
    if (!res.ok) throw new Error(`Failed to fetch PDF`);
    return await res.blob();
  }

  // Recurring Invoices
  async getRecurringInvoices(params?: {
    page?: number;
    pageSize?: number;
    companyId?: string;
    status?: string;
    q?: string;
  }): Promise<{
    items: RecurringInvoice[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.pageSize) searchParams.set('pageSize', params.pageSize.toString());
    if (params?.companyId) searchParams.set('companyId', params.companyId);
    if (params?.status) searchParams.set('status', params.status);
    if (params?.q) searchParams.set('q', params.q);
    
    return this.get(`/recurring-invoices?${searchParams.toString()}`);
  }

  async createRecurringInvoice(data: {
    companyId: string;
    customerId: string;
    name: string;
    description?: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    interval: number;
    startDate: string;
    endDate?: string;
    currency?: string;
    notes?: string;
    terms?: string;
    dueDateOffset?: number;
    autoSend?: boolean;
    emailTemplate?: string;
    lines: Array<{
      productId?: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
    }>;
  }): Promise<RecurringInvoice> {
    return this.post('/recurring-invoices', data);
  }

  async updateRecurringInvoice(id: string, data: {
    name?: string;
    description?: string;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';
    interval?: number;
    startDate?: string;
    endDate?: string;
    status?: 'active' | 'paused' | 'completed' | 'cancelled';
    currency?: string;
    notes?: string;
    terms?: string;
    dueDateOffset?: number;
    autoSend?: boolean;
    emailTemplate?: string;
    lines?: Array<{
      id?: string;
      productId?: string;
      description?: string;
      quantity: number;
      unitPrice: number;
      taxRate: number;
    }>;
  }): Promise<RecurringInvoice> {
    return this.put(`/recurring-invoices/${id}`, data);
  }

  async getRecurringInvoice(id: string): Promise<RecurringInvoice> {
    return this.get(`/recurring-invoices/${id}`);
  }

  async deleteRecurringInvoice(id: string): Promise<void> {
    return this.delete(`/recurring-invoices/${id}`);
  }

  async generateInvoiceFromRecurring(id: string, issueDate?: string): Promise<Invoice> {
    return this.post(`/recurring-invoices/${id}/generate`, { issueDate });
  }

  // Bills
  async getBills(params?: {
    page?: number;
    pageSize?: number;
    companyId?: string;
    status?: string;
    q?: string;
  }): Promise<{ items: Bill[]; page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.companyId) searchParams.append('companyId', params.companyId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.q) searchParams.append('q', params.q);
    return this.get<{ items: Bill[]; page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }>(`/bills?${searchParams.toString()}`);
  }

  async createBill(data: any): Promise<Bill> {
    return this.post<Bill>('/bills', data);
  }

  async postBill(id: string): Promise<Bill> {
    return this.post<Bill>(`/bills/${id}/post`);
  }

  // Customers
  async getCustomers(params?: {
    page?: number;
    pageSize?: number;
    companyId?: string;
    q?: string;
  }): Promise<{ items: Customer[]; page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.companyId) searchParams.append('companyId', params.companyId);
    if (params?.q) searchParams.append('q', params.q);
    return this.get<{ items: Customer[]; page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }>(`/customers?${searchParams.toString()}`);
  }

  async createCustomer(data: any): Promise<Customer> {
    return this.post<Customer>('/customers', data);
  }

  async getCustomer(id: string): Promise<Customer> {
    return this.get<Customer>(`/customers/${id}`);
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer> {
    return this.put<Customer>(`/customers/${id}`, data);
  }

  async getCustomerContacts(id: string): Promise<CustomerContact[]> {
    return this.get<CustomerContact[]>(`/customers/${id}/contacts`);
  }

  async addCustomerContact(id: string, data: {
    name: string;
    title?: string;
    email?: string;
    phone?: string;
    mobile?: string;
    isPrimary?: boolean;
    department?: string;
    notes?: string;
  }): Promise<CustomerContact> {
    return this.post<CustomerContact>(`/customers/${id}/contacts`, data);
  }

  async getCustomerAddresses(id: string): Promise<CustomerAddress[]> {
    return this.get<CustomerAddress[]>(`/customers/${id}/addresses`);
  }

  async addCustomerAddress(id: string, data: {
    addressType: string;
    address1: string;
    address2?: string;
    city: string;
    state?: string;
    postalCode?: string;
    country?: string;
    isDefault?: boolean;
  }): Promise<CustomerAddress> {
    return this.post<CustomerAddress>(`/customers/${id}/addresses`, data);
  }

  async getCustomerActivities(id: string): Promise<CustomerActivity[]> {
    return this.get<CustomerActivity[]>(`/customers/${id}/activities`);
  }

  async addCustomerActivity(id: string, data: {
    activityType: string;
    subject: string;
    description?: string;
    activityDate: string;
    performedBy?: string;
    duration?: number;
    outcome?: string;
    followUpRequired?: boolean;
    followUpDate?: string;
  }): Promise<CustomerActivity> {
    return this.post<CustomerActivity>(`/customers/${id}/activities`, data);
  }

  // Vendors
  async getVendors(params?: {
    page?: number;
    pageSize?: number;
    companyId?: string;
    q?: string;
  }): Promise<{ items: Vendor[]; page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.companyId) searchParams.append('companyId', params.companyId);
    if (params?.q) searchParams.append('q', params.q);
    return this.get<{ items: Vendor[]; page: number; pageSize: number; total: number; totalPages: number; hasNext: boolean; hasPrev: boolean }>(`/vendors?${searchParams.toString()}`);
  }

  async createVendor(data: any): Promise<Vendor> {
    return this.post<Vendor>('/vendors', data);
  }

  // Transactions
  async getTransactions(params?: {
    page?: number;
    pageSize?: number;
    companyId?: string;
    type?: string;
    status?: string;
    q?: string;
  }): Promise<Transaction[]> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.pageSize) searchParams.append('pageSize', params.pageSize.toString());
    if (params?.companyId) searchParams.append('companyId', params.companyId);
    if (params?.type) searchParams.append('type', params.type);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.q) searchParams.append('q', params.q);
    return this.get<Transaction[]>(`/transactions?${searchParams.toString()}`);
  }

  // AI Insights
  async getAIInsights(params?: {
    companyId?: string;
    category?: string;
    priority?: string;
  }): Promise<AIInsight[]> {
    const searchParams = new URLSearchParams();
    if (params?.companyId) searchParams.append('companyId', params.companyId);
    if (params?.category) searchParams.append('category', params.category);
    if (params?.priority) searchParams.append('priority', params.priority);
    return this.get<AIInsight[]>(`/ai/insights?${searchParams.toString()}`);
  }

  async generateAIInsights(companyId: string): Promise<{ generated: number; insights: AIInsight[] }> {
    return this.post<{ generated: number; insights: AIInsight[] }>('/ai/insights/generate', { companyId });
  }

  async getAIAnomalies(params?: {
    companyId?: string;
    status?: string;
  }): Promise<AIAnomaly[]> {
    const searchParams = new URLSearchParams();
    if (params?.companyId) searchParams.append('companyId', params.companyId);
    if (params?.status) searchParams.append('status', params.status);
    return this.get<AIAnomaly[]>(`/ai/anomalies?${searchParams.toString()}`);
  }

  async detectAIAnomalies(companyId: string): Promise<{ detected: number; anomalies: AIAnomaly[] }> {
    return this.post<{ detected: number; anomalies: AIAnomaly[] }>('/ai/anomalies/detect', { companyId });
  }

  async getAIRecommendations(params?: {
    companyId?: string;
    status?: string;
    type?: string;
  }): Promise<AIRecommendation[]> {
    const searchParams = new URLSearchParams();
    if (params?.companyId) searchParams.append('companyId', params.companyId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.type) searchParams.append('type', params.type);
    return this.get<AIRecommendation[]>(`/ai/recommendations?${searchParams.toString()}`);
  }

  async generateAIRecommendations(companyId: string): Promise<{ generated: number; recommendations: AIRecommendation[] }> {
    return this.post<{ generated: number; recommendations: AIRecommendation[] }>('/ai/recommendations/generate', { companyId });
  }

  // Health check
  async healthCheck(): Promise<{ ok: boolean; env: string; time: string }> {
  return this.get<{ ok: boolean; env: string; time: string }>('/health');
  }

  // Tax API
  async listTaxRates(params?: { companyId?: string; isActive?: boolean; taxName?: string; appliesTo?: 'products'|'services'|'all'; page?: number; limit?: number }): Promise<any> {
    const sp = new URLSearchParams();
    if (params?.companyId) sp.append('companyId', params.companyId);
    if (params?.isActive !== undefined) sp.append('isActive', String(params.isActive));
    if (params?.taxName) sp.append('taxName', params.taxName);
    if (params?.appliesTo) sp.append('appliesTo', params.appliesTo);
    if (params?.page) sp.append('page', String(params.page));
    if (params?.limit) sp.append('limit', String(params.limit));
    return this.request(`/tax/rates?${sp.toString()}`);
  }

  async createTaxRate(data: { companyId: string; taxName: string; rate: number; appliesTo?: 'products'|'services'|'all'; isActive?: boolean }): Promise<any> {
    return this.request('/tax/rates', { method: 'POST', body: JSON.stringify(data) });
  }

  async updateTaxRate(id: string, data: { taxName?: string; rate?: number; appliesTo?: 'products'|'services'|'all'; isActive?: boolean }): Promise<any> {
    return this.request(`/tax/rates/${id}`, { method: 'PUT', body: JSON.stringify(data) });
  }

  async deleteTaxRate(id: string): Promise<any> {
    return this.request(`/tax/rates/${id}`, { method: 'DELETE' });
  }

  async calculateTax(data: { companyId: string; currency?: string; applyCompound?: boolean; lines: Array<{ id?: string; description?: string; type?: 'product'|'service'|string; amount: number; taxExclusive?: boolean; manualRate?: number }> }): Promise<any> {
    return this.request('/tax/calculate', { method: 'POST', body: JSON.stringify(data) });
  }

  // Report Builder API
  async previewReportBuilder(data: {
    companyId: string;
    spec: {
      name: string;
      type: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'equity' | 'custom';
      description?: string;
      items: Array<{
        id?: string;
        name: string;
        type: 'account' | 'calculation' | 'text' | 'chart';
        order?: number;
        configuration?: any;
        formula?: string;
        accountIds?: string[];
      }>;
      parameters?: Record<string, any>;
    };
  }): Promise<any> {
    return this.request('/reports/builder/preview', { method: 'POST', body: JSON.stringify(data) });
  }

  async saveReportBuilderTemplate(data: {
    name: string;
    type: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'equity' | 'custom';
    category?: 'industry' | 'standard' | 'custom';
    description?: string;
    isPublic?: boolean;
    spec: {
      name: string;
      type: 'balance_sheet' | 'income_statement' | 'cash_flow' | 'equity' | 'custom';
      description?: string;
      items: Array<{
        id?: string;
        name: string;
        type: 'account' | 'calculation' | 'text' | 'chart';
        order?: number;
        configuration?: any;
        formula?: string;
        accountIds?: string[];
      }>;
      parameters?: Record<string, any>;
    };
  }): Promise<any> {
    return this.request('/reports/builder/templates', { method: 'POST', body: JSON.stringify({
      name: data.name,
      type: data.type,
      category: data.category ?? 'custom',
      description: data.description,
      isPublic: data.isPublic ?? false,
      spec: data.spec
    }) });
  }

  // Accounts API (for pickers)
  async getAccounts(companyId?: string, includeInactive = false): Promise<{ accounts: any[]; flat: any[]; total: number }> {
    const sp = new URLSearchParams();
    if (companyId) sp.append('companyId', companyId);
    if (includeInactive) sp.append('includeInactive', 'true');
    const resp = await this.request<{ accounts: any[]; flat: any[]; total: number }>(`/accounts?${sp.toString()}`);
    return (resp as any) ?? { accounts: [], flat: [], total: 0 };
  }

  async getAccountTypes(companyId?: string): Promise<any[]> {
    const sp = new URLSearchParams();
    if (companyId) sp.append('companyId', companyId);
    const resp = await this.request<any[]>(`/account-types?${sp.toString()}`);
    return (resp as any) ?? [];
  }

  // Products (for invoice/product pickers)
  async getProducts(params?: { companyId?: string; type?: string }): Promise<any[]> {
    const sp = new URLSearchParams();
    if (params?.companyId) sp.append('companyId', params.companyId);
    if (params?.type) sp.append('type', params.type);
    const resp = await this.request<any[]>(`/products?${sp.toString()}`);
    return (resp as any) ?? [];
  }

  // Journal/Reports for Accounting page
  async getTrialBalance(companyId: string, asOf?: string): Promise<any> {
    const sp = new URLSearchParams();
    sp.append('companyId', companyId);
    if (asOf) sp.append('asOf', asOf);
    return this.request(`/journal/trial-balance?${sp.toString()}`);
  }

  async getJournalEntries(companyId: string, page = 1, pageSize = 10): Promise<any> {
    const sp = new URLSearchParams();
    sp.append('companyId', companyId);
    sp.append('page', String(page));
    sp.append('pageSize', String(pageSize));
    return this.request(`/journal?${sp.toString()}`);
  }

  async getGeneralLedger(params: { companyId: string; startDate?: string; endDate?: string; accountId?: string; accountType?: string; page?: number; pageSize?: number }): Promise<any> {
    const sp = new URLSearchParams();
    sp.append('companyId', params.companyId);
    if (params.startDate) sp.append('startDate', params.startDate);
    if (params.endDate) sp.append('endDate', params.endDate);
    if (params.accountId) sp.append('accountId', params.accountId);
    if (params.accountType) sp.append('accountType', params.accountType);
    if (params.page) sp.append('page', String(params.page));
    if (params.pageSize) sp.append('pageSize', String(params.pageSize));
    return this.request(`/journal/general-ledger?${sp.toString()}`);
  }

  // Report schedules
  async listReportSchedules(reportId: string): Promise<any[]> {
    const resp = await this.request(`/reports/${reportId}/schedules`);
    return (resp as any)?.data ?? [];
  }

  async createReportSchedule(reportId: string, data: { name: string; frequency: 'daily'|'weekly'|'monthly'|'quarterly'|'yearly'; nextRun: string; recipients?: string; format: 'pdf'|'excel'|'csv'; isActive?: boolean }): Promise<any> {
    const resp = await this.request(`/reports/${reportId}/schedules`, { method: 'POST', body: JSON.stringify(data) });
    return (resp as any)?.data ?? resp;
  }

  async updateReportSchedule(reportId: string, scheduleId: string, data: Partial<{ name: string; frequency: 'daily'|'weekly'|'monthly'|'quarterly'|'yearly'; nextRun: string; recipients: string; format: 'pdf'|'excel'|'csv'; isActive: boolean }>): Promise<any> {
    const resp = await this.request(`/reports/${reportId}/schedules/${scheduleId}`, { method: 'PUT', body: JSON.stringify(data) });
    return (resp as any)?.data ?? resp;
  }

  async deleteReportSchedule(reportId: string, scheduleId: string): Promise<void> {
    await this.request(`/reports/${reportId}/schedules/${scheduleId}`, { method: 'DELETE' });
    return;
  }

  // Reports
  async listReports(params?: { type?: 'balance_sheet'|'income_statement'|'cash_flow'|'equity'|'custom'; isTemplate?: boolean; isPublic?: boolean; page?: number; limit?: number; search?: string }): Promise<{ reports: any[]; pagination: any }> {
    const sp = new URLSearchParams();
    if (params?.type) sp.append('type', params.type);
    if (params?.isTemplate !== undefined) sp.append('isTemplate', String(params.isTemplate));
    if (params?.isPublic !== undefined) sp.append('isPublic', String(params.isPublic));
    if (params?.page) sp.append('page', String(params.page));
    if (params?.limit) sp.append('limit', String(params.limit));
    if (params?.search) sp.append('search', params.search);
    const resp = await this.request(`/reports?${sp.toString()}`);
    return (resp as any) as { reports: any[]; pagination: any };
  }

  async createReportFromBuilder(spec: { name: string; type: 'balance_sheet'|'income_statement'|'cash_flow'|'equity'|'custom'; description?: string; items: Array<{ name: string; type: 'account'|'calculation'|'text'|'chart'; order?: number; configuration?: any; formula?: string; accountIds?: string[] }> }): Promise<any> {
    const payload = {
      name: spec.name,
      type: spec.type,
      description: spec.description,
      isTemplate: false,
      isPublic: false,
      items: spec.items.map((it, idx) => ({
        name: it.name,
        type: it.type,
        order: it.order ?? idx,
        configuration: it.configuration ? JSON.stringify(it.configuration) : undefined,
        formula: it.formula,
        accountIds: it.accountIds && it.accountIds.length ? it.accountIds.join(',') : undefined
      }))
    };
    const resp = await this.request('/reports', { method: 'POST', body: JSON.stringify(payload) });
    return (resp as any) ?? resp;
  }

  async deliverReport(reportId: string, opts: { format: 'pdf'|'excel'|'csv'|'json'; parameters?: any; channels?: { email?: { recipients: string[]; subject?: string; body?: string }; slack?: { webhookUrl: string }; webhook?: { url: string; headers?: Record<string,string> } } }): Promise<any> {
    const resp = await this.request(`/reports/${reportId}/deliver`, { method: 'POST', body: JSON.stringify(opts) });
    return (resp as any) ?? resp;
  }

  async getReportItemLineage(reportId: string, itemId: string): Promise<any> {
    return this.request(`/reports/${reportId}/items/${itemId}/lineage`);
  }

  async getReportItemAudit(reportId: string, itemId: string): Promise<any> {
    return this.request(`/reports/${reportId}/items/${itemId}/audit`);
  }

  // Journal API
  async postJournalEntry(data: { date?: string; memo?: string; reference?: string; companyId: string; lines: Array<{ accountId: string; debit?: number; credit?: number; memo?: string; department?: string; project?: string; location?: string }> }): Promise<any> {
    return this.request('/journal', { method: 'POST', body: JSON.stringify(data) });
  }

  // Notification methods
  async sendPaymentReminder(invoiceId: string, type: 'overdue' | 'due_soon' = 'overdue'): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/invoices/${invoiceId}/send-reminder`, { 
      method: 'POST', 
      body: JSON.stringify({ type }) 
    })
    return (response as any)?.data ?? response
  }

  async sendInvoiceNotification(invoiceId: string, type: 'created' | 'sent' | 'updated' = 'sent'): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/invoices/${invoiceId}/send-notification`, { 
      method: 'POST', 
      body: JSON.stringify({ type }) 
    })
    return (response as any)?.data ?? response
  }

  async sendPaymentConfirmation(invoiceId: string, paymentData: any): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/invoices/${invoiceId}/send-confirmation`, { 
      method: 'POST', 
      body: JSON.stringify({ paymentData }) 
    })
    return (response as any)?.data ?? response
  }

  async sendBulkReminders(invoiceIds: string[], type: 'overdue' | 'due_soon' = 'overdue'): Promise<{ success: boolean; message: string; successCount: number; errorCount: number }> {
    const response = await this.request<{ success: boolean; message: string; successCount: number; errorCount: number }>(`/invoices/send-bulk-reminders`, { 
      method: 'POST', 
      body: JSON.stringify({ invoiceIds, type }) 
    })
    return (response as any)?.data ?? response
  }

  async getNotificationTemplates(): Promise<{ templates: Array<{ id: string; name: string; type: string; description: string }> }> {
    const response = await this.request<{ templates: Array<{ id: string; name: string; type: string; description: string }> }>(`/notification-templates`)
    return (response as any)?.data ?? response
  }

  // Invoice Approval Workflow methods
  async createInvoiceApprovalWorkflow(data: {
    companyId: string;
    name: string;
    description?: string;
    steps: string;
    conditions?: string;
    autoApproval?: boolean;
    escalationRules?: string;
  }): Promise<{ workflow: any }> {
    const response = await this.request<{ workflow: any }>(`/approval-workflows`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return (response as any)?.data ?? response
  }

  async triggerInvoiceApproval(invoiceId: string, workflowId?: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/invoices/${invoiceId}/trigger-approval`, {
      method: 'POST',
      body: JSON.stringify({ workflowId })
    })
    return (response as any)?.data ?? response
  }

  async processApprovalAction(approvalId: string, action: 'approve' | 'reject' | 'escalate', comments?: string, escalationReason?: string): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/approvals/${approvalId}/action`, {
      method: 'POST',
      body: JSON.stringify({ action, comments, escalationReason })
    })
    return (response as any)?.data ?? response
  }

  async getPendingApprovals(): Promise<{ approvals: Array<{
    id: string;
    invoiceId: string;
    invoiceNumber: string;
    amount: number;
    currency: string;
    customerName: string;
    dueDate: Date;
    submittedAt: Date;
    comments: string;
  }> }> {
    const response = await this.request<{ approvals: Array<{
      id: string;
      invoiceId: string;
      invoiceNumber: string;
      amount: number;
      currency: string;
      customerName: string;
      dueDate: Date;
      submittedAt: Date;
      comments: string;
    }> }>(`/approvals/pending`)
    return (response as any)?.data ?? response
  }

  async getInvoiceApprovalStatus(invoiceId: string): Promise<{
    invoiceStatus: string;
    approvals: Array<{
      id: string;
      stepNumber: number;
      approver: { id: string; name: string; email: string };
      status: string;
      comments: string;
      createdAt: Date;
      processedAt?: Date;
      workflow: { id: string; name: string };
    }>;
  }> {
    const response = await this.request<{
      invoiceStatus: string;
      approvals: Array<{
        id: string;
        stepNumber: number;
        approver: { id: string; name: string; email: string };
        status: string;
        comments: string;
        createdAt: Date;
        processedAt?: Date;
        workflow: { id: string; name: string };
      }>;
    }>(`/invoices/${invoiceId}/approval-status`)
    return (response as any)?.data ?? response
  }

  // OCR Invoice Processing methods
  async processInvoiceDocument(fileData: string, fileName: string, mimeType: string): Promise<{
    success: boolean;
    result: {
      vendorName: string;
      invoiceNumber: string;
      date: Date;
      totalAmount: number;
      currency: string;
      lineItems: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
      }>;
      taxAmount: number;
      confidence: number;
      rawData: any;
    };
    message: string;
  }> {
    const response = await this.request<{
      success: boolean;
      result: any;
      message: string;
    }>(`/invoices/process-document`, {
      method: 'POST',
      body: JSON.stringify({ fileData, fileName, mimeType })
    })
    return (response as any)?.data ?? response
  }

  async createInvoiceFromOCR(data: {
    companyId: string;
    customerId: string;
    ocrResult: any;
    additionalData?: {
      dueDate?: Date;
      notes?: string;
      terms?: string;
    };
  }): Promise<{ success: boolean; invoice: any; message: string }> {
    const response = await this.request<{ success: boolean; invoice: any; message: string }>(`/invoices/create-from-ocr`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return (response as any)?.data ?? response
  }

  async matchExpensesToInvoice(invoiceId: string): Promise<{
    success: boolean;
    result: {
      matchedExpenses: Array<{
        expenseId: string;
        matchConfidence: number;
        suggestedAllocation: number;
        reason: string;
      }>;
      unmatchedExpenses: Array<{
        expenseId: string;
        reason: string;
        suggestedAction: string;
      }>;
    };
    message: string;
  }> {
    const response = await this.request<{
      success: boolean;
      result: any;
      message: string;
    }>(`/invoices/${invoiceId}/match-expenses`)
    return (response as any)?.data ?? response
  }

  async applyExpenseMatches(invoiceId: string, matches: Array<{
    expenseId: string;
    allocation: number;
  }>): Promise<{ success: boolean; message: string }> {
    const response = await this.request<{ success: boolean; message: string }>(`/invoices/${invoiceId}/apply-expense-matches`, {
      method: 'POST',
      body: JSON.stringify({ matches })
    })
    return (response as any)?.data ?? response
  }

  // Natural Language Invoice Creation methods
  async parseInvoiceText(data: {
    text: string;
    companyId: string;
    customerId?: string;
    context?: any;
  }): Promise<{
    success: boolean;
    parsedData: {
      customer: {
        name: string;
        email?: string;
        phone?: string;
        address?: string;
      };
      items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        lineTotal: number;
        category?: string;
      }>;
      dates: {
        issueDate: Date;
        dueDate: Date;
      };
      amounts: {
        subtotal: number;
        taxRate: number;
        taxAmount: number;
        totalAmount: number;
      };
      metadata: {
        confidence: number;
        extractedEntities: string[];
        suggestedTerms: string;
        suggestedNotes: string;
      };
      rawAnalysis: {
        intent: string;
        entities: Array<{
          type: 'customer' | 'item' | 'amount' | 'date' | 'quantity';
          value: string;
          confidence: number;
        }>;
        relationships: Array<{
          from: string;
          to: string;
          relationship: string;
        }>;
      };
    };
    message: string;
  }> {
    const response = await this.request<{
      success: boolean;
      parsedData: any;
      message: string;
    }>(`/invoices/parse-text`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return (response as any)?.data ?? response
  }

  async createInvoiceFromText(data: {
    text: string;
    companyId: string;
    customerId?: string;
    autoCreateCustomer?: boolean;
    validateData?: boolean;
  }): Promise<{
    success: boolean;
    invoice?: any;
    parsedData: any;
    suggestions: Array<{
      type: 'customer' | 'item' | 'amount' | 'date';
      suggestion: string;
      confidence: number;
      reason: string;
    }>;
    warnings: Array<{
      type: 'missing_data' | 'ambiguous_data' | 'validation_error';
      message: string;
      field: string;
      suggestion: string;
    }>;
    message: string;
  }> {
    const response = await this.request<{
      success: boolean;
      invoice?: any;
      parsedData: any;
      suggestions: any[];
      warnings: any[];
      message: string;
    }>(`/invoices/create-from-text`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return (response as any)?.data ?? response
  }

  async getInvoiceSuggestions(companyId: string, text?: string): Promise<{
    success: boolean;
    suggestions: Array<{
      suggestion: string;
      confidence: number;
      type: 'customer' | 'item' | 'amount' | 'template';
      context: string;
    }>;
    message: string;
  }> {
    const params = new URLSearchParams({ companyId })
    if (text) params.append('text', text)
    
    const response = await this.request<{
      success: boolean;
      suggestions: any[];
      message: string;
    }>(`/invoices/suggestions?${params}`)
    return (response as any)?.data ?? response
  }

  async validateParsedData(parsedData: any): Promise<{
    success: boolean;
    validation: {
      isValid: boolean;
      warnings: any[];
      suggestions: any[];
      confidence: number;
    };
    message: string;
  }> {
    const response = await this.request<{
      success: boolean;
      validation: any;
      message: string;
    }>(`/invoices/validate-parsed-data`, {
      method: 'POST',
      body: JSON.stringify({ parsedData })
    })
    return (response as any)?.data ?? response
  }

  // AI Conversational Accounting methods
  async sendChatMessage(data: {
    message: string;
    companyId: string;
    sessionId?: string;
    conversationHistory?: Array<{
      id: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
      timestamp: Date;
      metadata?: any;
    }>;
  }): Promise<{
    success: boolean;
    response: {
      message: string;
      action?: {
        type: 'create_invoice' | 'create_expense' | 'create_customer' | 'generate_report' | 'analyze_data';
        data: any;
        confidence: number;
      };
      suggestions: Array<{
        text: string;
        action: string;
        confidence: number;
      }>;
      followUpQuestions: string[];
      context: any;
    };
    message: string;
  }> {
    const response = await this.request<{
      success: boolean;
      response: any;
      message: string;
    }>(`/ai-chat/message`, {
      method: 'POST',
      body: JSON.stringify(data)
    })
    return (response as any)?.data ?? response
  }

  async executeChatAction(action: {
    type: 'create_invoice' | 'create_expense' | 'create_customer' | 'generate_report' | 'analyze_data';
    data: any;
  }): Promise<{
    success: boolean;
    result?: any;
    message: string;
  }> {
    const response = await this.request<{
      success: boolean;
      result?: any;
      message: string;
    }>(`/ai-chat/execute-action`, {
      method: 'POST',
      body: JSON.stringify({ action })
    })
    return (response as any)?.data ?? response
  }

  async getChatHistory(sessionId: string, limit?: number): Promise<{
    success: boolean;
    history: Array<{
      id: string;
      role: 'user' | 'assistant' | 'system';
      content: string;
      timestamp: Date;
      metadata?: any;
    }>;
    message: string;
  }> {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())
    
    const response = await this.request<{
      success: boolean;
      history: any[];
      message: string;
    }>(`/ai-chat/history/${sessionId}?${params}`)
    return (response as any)?.data ?? response
  }

  async getFinancialInsights(companyId: string): Promise<{
    success: boolean;
    insights: {
      financialSummary: {
        totalRevenue: number;
        totalExpenses: number;
        netIncome: number;
        profitMargin: number;
      };
      trends: {
        revenueGrowth: number;
        expenseGrowth: number;
        profitGrowth: number;
      };
      recommendations: string[];
    };
    message: string;
  }> {
    const response = await this.request<{
      success: boolean;
      insights: any;
      message: string;
    }>(`/ai-chat/insights/${companyId}`)
    return (response as any)?.data ?? response
  }

  async startChatSession(companyId: string): Promise<{
    success: boolean;
    sessionId: string;
    message: string;
  }> {
    const response = await this.request<{
      success: boolean;
      sessionId: string;
      message: string;
    }>(`/ai-chat/start-session`, {
      method: 'POST',
      body: JSON.stringify({ companyId })
    })
    return (response as any)?.data ?? response
  }
}

export const apiService = new ApiService();
export default apiService;
