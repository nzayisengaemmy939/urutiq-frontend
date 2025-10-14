import apiService from '../api';

// ==================== TYPES ====================

export interface ApprovalWorkflow {
  id: string;
  name: string;
  description?: string;
  entityType: string;
  entitySubType?: string;
  isActive: boolean;
  steps: ApprovalStep[];
  conditions: ApprovalCondition[];
  autoApproval: boolean;
  escalationRules: EscalationRule[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApprovalStep {
  id: string;
  name: string;
  approverType: 'user' | 'role' | 'department' | 'amount_based';
  approverId?: string;
  role?: string;
  department?: string;
  amountThreshold?: number;
  isRequired: boolean;
  order: number;
  escalationHours?: number;
  autoApprove?: boolean;
  conditions?: ApprovalCondition[];
}

export interface ApprovalCondition {
  field: string;
  operator: 'equals' | 'greater_than' | 'less_than' | 'contains' | 'in';
  value: any;
  logicalOperator?: 'AND' | 'OR';
}

export interface EscalationRule {
  stepId: string;
  escalationHours: number;
  escalateTo: 'manager' | 'director' | 'ceo' | 'specific_user';
  escalateToUserId?: string;
  notificationChannels: ('email' | 'sms' | 'slack' | 'teams')[];
}

export interface ApprovalRequest {
  id: string;
  entityType: string;
  entityId: string;
  entitySubType?: string;
  workflowId: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'cancelled';
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  requestedBy: string;
  requestedAt: string;
  approvedAt?: string;
  rejectedAt?: string;
  comments?: string;
  metadata?: Record<string, any>;
  approvers: ApprovalAssignee[];
}

export interface ApprovalAssignee {
  id: string;
  userId: string;
  stepId: string;
  stepName: string;
  status: 'pending' | 'approved' | 'rejected' | 'escalated' | 'skipped';
  assignedAt: string;
  completedAt?: string;
  comments?: string;
  escalatedTo?: string;
  escalationReason?: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface ApprovalDashboard {
  summary: {
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
    rejectedRequests: number;
    escalatedRequests: number;
    approvalRate: number;
    avgProcessingTime: number;
  };
  byEntityType: Array<{ entityType: string; count: number }>;
  byStatus: Array<{ status: string; count: number }>;
  recentRequests: ApprovalRequest[];
}

// ==================== API FUNCTIONS ====================

export const unifiedApprovalsApi = {
  // Workflow Management
  getWorkflows: async (companyId: string, filters?: {
    entityType?: string;
    entitySubType?: string;
    isActive?: boolean;
  }) => {
    const params = new URLSearchParams({ companyId, ...filters });
    const response = await apiService.get(`/unified-approvals/approval-workflows?${params}`);
    return response.data || response || [];
  },

  getWorkflow: async (id: string) => {
    const response = await apiService.get(`/unified-approvals/approval-workflows/${id}`);
    return response.data || response;
  },

  createWorkflow: async (workflow: Omit<ApprovalWorkflow, 'id' | 'createdAt' | 'updatedAt'>) => {
    console.log('🔍 API - Creating workflow with data:', workflow);
    console.log('🔍 API - Workflow companyId:', workflow.companyId);
    console.log('🔍 API - Workflow companyId type:', typeof workflow.companyId);
    const response = await apiService.post('/unified-approvals/approval-workflows', workflow);
    return response.data || response;
  },

  updateWorkflow: async (id: string, workflow: Partial<ApprovalWorkflow>) => {
    const response = await apiService.put(`/unified-approvals/approval-workflows/${id}`, workflow);
    return response.data || response;
  },

  deleteWorkflow: async (id: string) => {
    const response = await apiService.delete(`/unified-approvals/approval-workflows/${id}`);
    return response.data || response;
  },

  // Approval Request Management
  getApprovalRequests: async (companyId: string, filters?: {
    entityType?: string;
    status?: string;
    requestedBy?: string;
    page?: number;
    pageSize?: number;
  }) => {
    const params = new URLSearchParams({ companyId, ...filters });
    const response = await apiService.get(`/unified-approvals/approval-requests?${params}`);
    return response.data || response || [];
  },

  getApprovalRequest: async (id: string) => {
    const response = await apiService.get(`/unified-approvals/approval-requests/${id}`);
    return response.data || response;
  },

  createApprovalRequest: async (request: {
    entityType: string;
    entityId: string;
    entitySubType?: string;
    metadata?: Record<string, any>;
  }) => {
    const response = await apiService.post('/unified-approvals/approval-requests', request);
    return response.data || response;
  },

  processApprovalAction: async (
    requestId: string, 
    assigneeId: string, 
    action: 'approve' | 'reject' | 'escalate',
    data?: {
      comments?: string;
      escalationReason?: string;
    }
  ) => {
    const response = await apiService.post(
      `/unified-approvals/approval-requests/${requestId}/actions/${assigneeId}`,
      { action, ...data }
    );
    return response.data || response;
  },

  // Dashboard & Analytics
  getDashboard: async (companyId: string, filters?: {
    dateFrom?: string;
    dateTo?: string;
  }) => {
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
  getTemplates: async (companyId: string, filters?: {
    entityType?: string;
  }) => {
    const params = new URLSearchParams({ companyId, ...filters });
    const response = await apiService.get(`/unified-approvals/approval-templates?${params}`);
    return response.data || response || [];
  },

  createTemplate: async (template: {
    name: string;
    description?: string;
    entityType: string;
    entitySubType?: string;
    templateData: any;
  }) => {
    const response = await apiService.post('/unified-approvals/approval-templates', template);
    return response.data || response;
  },
};
