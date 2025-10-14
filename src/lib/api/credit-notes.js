import { config } from '../config';
class CreditNotesApiService {
    getHeaders() {
        return {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
            'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
            'Content-Type': 'application/json'
        };
    }
    async getCreditNotes(params) {
        const queryParams = new URLSearchParams();
        if (params.search)
            queryParams.set('q', params.search);
        if (params.status)
            queryParams.set('status', params.status);
        if (params.customerId)
            queryParams.set('customerId', params.customerId);
        if (params.dateFrom)
            queryParams.set('dateFrom', params.dateFrom);
        if (params.dateTo)
            queryParams.set('dateTo', params.dateTo);
        if (params.page)
            queryParams.set('page', params.page.toString());
        if (params.pageSize)
            queryParams.set('pageSize', params.pageSize.toString());
        const response = await fetch(`${config.api.baseUrl}/api/credit-notes/${params.companyId}?${queryParams.toString()}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch credit notes: ${response.statusText}`);
        }
        return response.json();
    }
    async getCreditNote(companyId, id) {
        const response = await fetch(`${config.api.baseUrl}/api/credit-notes/${companyId}/${id}`, {
            method: 'GET',
            headers: this.getHeaders()
        });
        if (!response.ok) {
            throw new Error(`Failed to fetch credit note: ${response.statusText}`);
        }
        return response.json();
    }
    async createCreditNote(companyId, data) {
        const response = await fetch(`${config.api.baseUrl}/api/credit-notes/${companyId}`, {
            method: 'POST',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Failed to create credit note: ${response.statusText}`);
        }
        return response.json();
    }
    async updateCreditNote(companyId, id, data) {
        const response = await fetch(`${config.api.baseUrl}/api/credit-notes/${companyId}/${id}`, {
            method: 'PUT',
            headers: this.getHeaders(),
            body: JSON.stringify(data)
        });
        if (!response.ok) {
            throw new Error(`Failed to update credit note: ${response.statusText}`);
        }
        return response.json();
    }
    async deleteCreditNote(companyId, id) {
        const response = await fetch(`${config.api.baseUrl}/api/credit-notes/${companyId}/${id}`, {
            method: 'DELETE',
            headers: this.getHeaders()
        });
        if (!response.ok) {
            throw new Error(`Failed to delete credit note: ${response.statusText}`);
        }
        return response.json();
    }
    // Helper methods for status management
    async approveCreditNote(companyId, id) {
        return this.updateCreditNote(companyId, id, { reason: 'Approved' });
    }
    async rejectCreditNote(companyId, id, reason) {
        return this.updateCreditNote(companyId, id, { reason: `Rejected: ${reason}` });
    }
    async applyCreditNote(companyId, id, invoiceId) {
        return this.updateCreditNote(companyId, id, { reason: `Applied to invoice ${invoiceId}` });
    }
}
export const creditNotesApi = new CreditNotesApiService();
