import apiService from '../api';
// ==================== API FUNCTIONS ====================
export const unifiedApprovalsApi = {
    // Workflow Management
    getWorkflows: async (companyId, filters) => {
        const params = new URLSearchParams({ companyId, ...filters });
        const response = await apiService.get(`/unified-approvals/approval-workflows?${params}`);
        return response.data || response || [];
    },
    getWorkflow: async (id) => {
        const response = await apiService.get(`/unified-approvals/approval-workflows/${id}`);
        return response.data || response;
    },
    createWorkflow: async (workflow) => {
        console.log('🔍 API - Creating workflow with data:', workflow);
        console.log('🔍 API - Workflow companyId:', workflow.companyId);
        console.log('🔍 API - Workflow companyId type:', typeof workflow.companyId);
        const response = await apiService.post('/unified-approvals/approval-workflows', workflow);
        return response.data || response;
    },
    updateWorkflow: async (id, workflow) => {
        const response = await apiService.put(`/unified-approvals/approval-workflows/${id}`, workflow);
        return response.data || response;
    },
    deleteWorkflow: async (id) => {
        const response = await apiService.delete(`/unified-approvals/approval-workflows/${id}`);
        return response.data || response;
    },
    // Approval Request Management
    getApprovalRequests: async (companyId, filters) => {
        const params = new URLSearchParams({ companyId, ...filters });
        const response = await apiService.get(`/unified-approvals/approval-requests?${params}`);
        return response.data || response || [];
    },
    getApprovalRequest: async (id) => {
        const response = await apiService.get(`/unified-approvals/approval-requests/${id}`);
        return response.data || response;
    },
    createApprovalRequest: async (request) => {
        const response = await apiService.post('/unified-approvals/approval-requests', request);
        return response.data || response;
    },
    processApprovalAction: async (requestId, assigneeId, action, data) => {
        const response = await apiService.post(`/unified-approvals/approval-requests/${requestId}/actions/${assigneeId}`, { action, ...data });
        return response.data || response;
    },
    // Dashboard & Analytics
    getDashboard: async (companyId, filters) => {
        const params = new URLSearchParams({ companyId, ...filters });
        const response = await apiService.get(`/unified-approvals/approval-dashboard?${params}`);
        // Ensure we always return a valid response structure
        if (!response) {
            return {
                summary: {
                    totalRequests: 0,
                    pendingRequests: 0,
                    approvedRequests: 0,
                    rejectedRequests: 0,
                    escalatedRequests: 0,
                    approvalRate: 0,
                    avgProcessingTime: 0
                },
                byEntityType: [],
                byStatus: [],
                recentRequests: []
            };
        }
        return response.data || response;
    },
    // Templates
    getTemplates: async (companyId, filters) => {
        const params = new URLSearchParams({ companyId, ...filters });
        const response = await apiService.get(`/unified-approvals/approval-templates?${params}`);
        return response.data || response || [];
    },
    createTemplate: async (template) => {
        const response = await apiService.post('/unified-approvals/approval-templates', template);
        return response.data || response;
    },
};
