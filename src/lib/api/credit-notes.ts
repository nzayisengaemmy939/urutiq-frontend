// Credit Notes API service
import { apiService } from '../api'
import { config } from '../config'

export interface CreditNote {
  id: string
  tenantId: string
  companyId: string
  creditNoteNumber: string
  invoiceId?: string
  customerId?: string
  issueDate: string
  dueDate?: string
  status: 'draft' | 'sent' | 'viewed' | 'approved' | 'rejected' | 'applied' | 'cancelled'
  totalAmount: number
  currency: string
  reason?: string
  notes?: string
  terms?: string
  subtotal: number
  taxAmount: number
  discountAmount: number
  exchangeRate?: number
  sentAt?: string
  viewedAt?: string
  lastViewedAt?: string
  reminderCount: number
  approvedAt?: string
  approvedBy?: string
  rejectedAt?: string
  rejectedBy?: string
  rejectionReason?: string
  appliedAt?: string
  appliedBy?: string
  appliedToInvoiceId?: string
  createdAt: string
  updatedAt: string
  customer?: {
    id: string
    name: string
    email?: string
  }
  invoice?: {
    id: string
    invoiceNumber: string
  }
  lines: CreditNoteLine[]
  company?: {
    id: string
    name: string
  }
}

export interface CreditNoteLine {
  id: string
  tenantId: string
  creditNoteId: string
  description: string
  quantity: number
  unitPrice: number
  totalAmount: number
  taxRate: number
  taxAmount: number
  discountRate: number
  discountAmount: number
  productId?: string
  serviceId?: string
  createdAt: string
  updatedAt: string
}

export interface CreateCreditNoteInput {
  invoiceId?: string
  customerId?: string
  reason: string
  notes?: string
  terms?: string
  lines: {
    description: string
    quantity: number
    unitPrice: number
    taxRate?: number
    discountRate?: number
    productId?: string
    serviceId?: string
  }[]
}

export interface UpdateCreditNoteInput {
  reason?: string
  notes?: string
  terms?: string
}

export interface CreditNotesListParams {
  companyId: string
  search?: string
  status?: string
  customerId?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  pageSize?: number
}

class CreditNotesApiService {
  private getHeaders() {
    return {
      'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
      'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
      'Content-Type': 'application/json'
    }
  }

  async getCreditNotes(params: CreditNotesListParams): Promise<{ data: CreditNote[] }> {
    const queryParams = new URLSearchParams()
    if (params.search) queryParams.set('q', params.search)
    if (params.status) queryParams.set('status', params.status)
    if (params.customerId) queryParams.set('customerId', params.customerId)
    if (params.dateFrom) queryParams.set('dateFrom', params.dateFrom)
    if (params.dateTo) queryParams.set('dateTo', params.dateTo)
    if (params.page) queryParams.set('page', params.page.toString())
    if (params.pageSize) queryParams.set('pageSize', params.pageSize.toString())

    const response = await fetch(
      `${config.api.baseUrl}/api/credit-notes/${params.companyId}?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch credit notes: ${response.statusText}`)
    }

    return response.json()
  }

  async getCreditNote(companyId: string, id: string): Promise<{ data: CreditNote }> {
    const response = await fetch(
      `${config.api.baseUrl}/api/credit-notes/${companyId}/${id}`,
      {
        method: 'GET',
        headers: this.getHeaders()
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch credit note: ${response.statusText}`)
    }

    return response.json()
  }

  async createCreditNote(companyId: string, data: CreateCreditNoteInput): Promise<{ data: CreditNote }> {
    const response = await fetch(
      `${config.api.baseUrl}/api/credit-notes/${companyId}`,
      {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to create credit note: ${response.statusText}`)
    }

    return response.json()
  }

  async updateCreditNote(companyId: string, id: string, data: UpdateCreditNoteInput): Promise<{ data: CreditNote }> {
    const response = await fetch(
      `${config.api.baseUrl}/api/credit-notes/${companyId}/${id}`,
      {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to update credit note: ${response.statusText}`)
    }

    return response.json()
  }

  async deleteCreditNote(companyId: string, id: string): Promise<{ message: string }> {
    const response = await fetch(
      `${config.api.baseUrl}/api/credit-notes/${companyId}/${id}`,
      {
        method: 'DELETE',
        headers: this.getHeaders()
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to delete credit note: ${response.statusText}`)
    }

    return response.json()
  }

  // Helper methods for status management
  async approveCreditNote(companyId: string, id: string): Promise<{ data: CreditNote }> {
    return this.updateCreditNote(companyId, id, { reason: 'Approved' })
  }

  async rejectCreditNote(companyId: string, id: string, reason: string): Promise<{ data: CreditNote }> {
    return this.updateCreditNote(companyId, id, { reason: `Rejected: ${reason}` })
  }

  async applyCreditNote(companyId: string, id: string, invoiceId: string): Promise<{ data: CreditNote }> {
    return this.updateCreditNote(companyId, id, { reason: `Applied to invoice ${invoiceId}` })
  }
}

export const creditNotesApi = new CreditNotesApiService()
