;

import React, { useState, useEffect } from 'react';

// Type definitions
interface TaxThreshold {
  id: string;
  name: string;
  minAmount: number;
  maxAmount?: number;
  rate: number;
  isActive: boolean;
}

interface TaxExemption {
  id: string;
  name: string;
  description: string;
  amount: number;
  isActive: boolean;
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Calculator,
  Shield,
  FileText,
  Globe,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Calendar,
  BarChart3,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Settings,
  RefreshCw,
  FileSpreadsheet,
  Users,
  Building2,
  MapPin,
  CreditCard,
  Receipt,
  PieChart,
  Activity,
  Target,
  Zap
} from 'lucide-react';

// Types
interface TaxCalculationRequest {
  companyId: string;
  jurisdiction: string;
  period: {
    start: Date;
    end: Date;
  };
  transactions: TaxableTransaction[];
  taxType: 'VAT' | 'GST' | 'SalesTax' | 'CorporateTax' | 'PayrollTax' | 'CustomDuty';
  currency: string;
  metadata?: any;
}

interface TaxableTransaction {
  id: string;
  date: Date;
  amount: number;
  description: string;
  category: string;
  isInput: boolean;
  taxRate: number;
  taxAmount: number;
  vendorId?: string;
  customerId?: string;
  metadata?: any;
}

interface TaxCalculationResult {
  id: string;
  companyId: string;
  jurisdiction: string;
  period: {
    start: Date;
    end: Date;
  };
  taxType: string;
  currency: string;
  summary: {
    totalSales: number;
    totalPurchases: number;
    netTaxLiability: number;
    inputTax: number;
    outputTax: number;
    taxPayable: number;
    taxRefundable: number;
  };
  breakdown: {
    byCategory: Record<string, TaxCategoryBreakdown>;
    byVendor: Record<string, TaxVendorBreakdown>;
    byCustomer: Record<string, TaxCustomerBreakdown>;
  };
  compliance: {
    isCompliant: boolean;
    warnings: string[];
    errors: string[];
    recommendations: string[];
  };
  metadata?: any;
}

interface TaxCategoryBreakdown {
  category: string;
  totalAmount: number;
  taxAmount: number;
  transactionCount: number;
  averageRate: number;
}

interface TaxVendorBreakdown {
  vendorId: string;
  vendorName: string;
  totalAmount: number;
  taxAmount: number;
  transactionCount: number;
  taxRate: number;
}

interface TaxCustomerBreakdown {
  customerId: string;
  customerName: string;
  totalAmount: number;
  taxAmount: number;
  transactionCount: number;
  taxRate: number;
}

interface ComplianceCheck {
  id: string;
  companyId: string;
  ruleId: string;
  checkDate: Date;
  status: 'passed' | 'failed' | 'warning';
  details: string;
  recommendations: string[];
  metadata?: any;
}

interface TaxFilingResult {
  id: string;
  companyId: string;
  jurisdiction: string;
  period: {
    start: Date;
    end: Date;
  };
  taxType: string;
  filingType: string;
  dueDate: Date;
  filedDate: Date;
  status: 'draft' | 'filed' | 'accepted' | 'rejected';
  amount: number;
  reference: string;
  documents: TaxFilingDocument[];
  metadata?: any;
}

interface TaxFilingDocument {
  id: string;
  name: string;
  type: 'return' | 'schedule' | 'attachment' | 'receipt';
  content: string;
  format: 'pdf' | 'xml' | 'json';
  metadata?: any;
}

interface JurisdictionConfig {
  code: string;
  name: string;
  taxTypes: TaxTypeConfig[];
  complianceRules: string[];
  filingRequirements: FilingRequirement[];
  currency: string;
  isActive: boolean;
  metadata?: any;
}

interface TaxTypeConfig {
  type: string;
  name: string;
  rates: TaxRate[];
  thresholds: TaxThreshold[];
  exemptions: TaxExemption[];
  isActive: boolean;
  metadata?: any;
}

interface TaxRate {
  rate: number;
  effectiveDate: Date;
  endDate?: Date;
  description: string;
  conditions?: string;
}

interface FilingRequirement {
  taxType: string;
  frequency: 'monthly' | 'quarterly' | 'annual';
  dueDay: number;
  extensions: number;
  penalties: PenaltyStructure[];
  isActive: boolean;
}

interface PenaltyStructure {
  daysLate: number;
  penaltyType: 'percentage' | 'fixed';
  penaltyAmount: number;
  description: string;
}

// API Functions
const api = {
  // Tax Calculation
  calculateTax: async (request: TaxCalculationRequest) => {
    const response = await fetch('/api/enhanced-compliance-tax/tax/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return response.json();
  },

  getTaxCalculations: async (companyId: string, params?: any) => {
    const queryParams = new URLSearchParams();
    if (params?.jurisdiction) queryParams.append('jurisdiction', params.jurisdiction);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.taxType) queryParams.append('taxType', params.taxType);

    const response = await fetch(`/api/enhanced-compliance-tax/tax/calculations/${companyId}?${queryParams}`);
    return response.json();
  },

  getTaxCalculation: async (companyId: string, calculationId: string) => {
    const response = await fetch(`/api/enhanced-compliance-tax/tax/calculations/${companyId}/${calculationId}`);
    return response.json();
  },

  // Compliance Monitoring
  checkCompliance: async (companyId: string, period: { start: Date; end: Date }) => {
    const response = await fetch('/api/enhanced-compliance-tax/compliance/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId, period })
    });
    return response.json();
  },

  getComplianceChecks: async (companyId: string, params?: any) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.status) queryParams.append('status', params.status);

    const response = await fetch(`/api/enhanced-compliance-tax/compliance/checks/${companyId}?${queryParams}`);
    return response.json();
  },

  getComplianceSummary: async (companyId: string, period?: string) => {
    const queryParams = new URLSearchParams();
    if (period) queryParams.append('period', period);

    const response = await fetch(`/api/enhanced-compliance-tax/compliance/summary/${companyId}?${queryParams}`);
    return response.json();
  },

  // Tax Filing
  prepareTaxFiling: async (request: any) => {
    const response = await fetch('/api/enhanced-compliance-tax/tax/filing/prepare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request)
    });
    return response.json();
  },

  getTaxFilings: async (companyId: string, params?: any) => {
    const queryParams = new URLSearchParams();
    if (params?.jurisdiction) queryParams.append('jurisdiction', params.jurisdiction);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.status) queryParams.append('status', params.status);

    const response = await fetch(`/api/enhanced-compliance-tax/tax/filings/${companyId}?${queryParams}`);
    return response.json();
  },

  submitTaxFiling: async (filingId: string, submitDate?: Date) => {
    const response = await fetch(`/api/enhanced-compliance-tax/tax/filings/${filingId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submitDate })
    });
    return response.json();
  },

  // Multi-Jurisdiction Support
  getJurisdictions: async (companyId: string) => {
    const response = await fetch(`/api/enhanced-compliance-tax/jurisdictions/${companyId}`);
    return response.json();
  },

  // Currency Conversion
  convertCurrency: async (amount: number, fromCurrency: string, toCurrency: string, date?: Date) => {
    const response = await fetch('/api/enhanced-compliance-tax/currency/convert', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, fromCurrency, toCurrency, date })
    });
    return response.json();
  },

  // Tax Optimization
  getTaxOptimization: async (companyId: string, startDate?: string, endDate?: string) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    const response = await fetch(`/api/enhanced-compliance-tax/tax/optimization/${companyId}?${queryParams}`);
    return response.json();
  },

  // Tax Rates
  getTaxRates: async (jurisdiction: string, taxType?: string, effectiveDate?: string) => {
    const queryParams = new URLSearchParams();
    if (taxType) queryParams.append('taxType', taxType);
    if (effectiveDate) queryParams.append('effectiveDate', effectiveDate);

    const response = await fetch(`/api/enhanced-compliance-tax/tax/rates/${jurisdiction}?${queryParams}`);
    return response.json();
  },

  // Filing Deadlines
  getFilingDeadlines: async (companyId: string, jurisdiction?: string, taxType?: string) => {
    const queryParams = new URLSearchParams();
    if (jurisdiction) queryParams.append('jurisdiction', jurisdiction);
    if (taxType) queryParams.append('taxType', taxType);

    const response = await fetch(`/api/enhanced-compliance-tax/filing/deadlines/${companyId}?${queryParams}`);
    return response.json();
  },

  // Audit Trail
  getAuditTrail: async (companyId: string, startDate?: string, endDate?: string, type?: string) => {
    const queryParams = new URLSearchParams();
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);
    if (type) queryParams.append('type', type);

    const response = await fetch(`/api/enhanced-compliance-tax/audit/trail/${companyId}?${queryParams}`);
    return response.json();
  },

  // Compliance Rules
  getComplianceRules: async (companyId: string, jurisdiction?: string, standard?: string, severity?: string) => {
    const queryParams = new URLSearchParams();
    if (jurisdiction) queryParams.append('jurisdiction', jurisdiction);
    if (standard) queryParams.append('standard', standard);
    if (severity) queryParams.append('severity', severity);

    const response = await fetch(`/api/enhanced-compliance-tax/compliance/rules/${companyId}?${queryParams}`);
    return response.json();
  }
};

// Enhanced Compliance & Tax Component
export const EnhancedComplianceTax: React.FC<{ companyId: string }> = ({ companyId }) => {
  const [activeTab, setActiveTab] = useState<'tax' | 'compliance' | 'filing' | 'jurisdictions' | 'optimization'>('tax');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState('UK');
  const [selectedTaxType, setSelectedTaxType] = useState('VAT');
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');

  const queryClient = useQueryClient();

  // Queries
  const { data: taxCalculations, isLoading: taxCalculationsLoading } = useQuery({
    queryKey: ['taxCalculations', companyId, selectedJurisdiction, selectedTaxType],
    queryFn: () => api.getTaxCalculations(companyId, {
      jurisdiction: selectedJurisdiction,
      taxType: selectedTaxType
    }),
    enabled: activeTab === 'tax'
  });

  const { data: complianceSummary } = useQuery({
    queryKey: ['complianceSummary', companyId],
    queryFn: () => api.getComplianceSummary(companyId),
    enabled: activeTab === 'compliance'
  });

  const { data: complianceChecks, isLoading: complianceChecksLoading } = useQuery({
    queryKey: ['complianceChecks', companyId],
    queryFn: () => api.getComplianceChecks(companyId),
    enabled: activeTab === 'compliance'
  });

  const { data: taxFilings, isLoading: taxFilingsLoading } = useQuery({
    queryKey: ['taxFilings', companyId, selectedJurisdiction],
    queryFn: () => api.getTaxFilings(companyId, { jurisdiction: selectedJurisdiction }),
    enabled: activeTab === 'filing'
  });

  const { data: jurisdictions } = useQuery({
    queryKey: ['jurisdictions', companyId],
    queryFn: () => api.getJurisdictions(companyId),
    enabled: activeTab === 'jurisdictions'
  });

  const { data: filingDeadlines } = useQuery({
    queryKey: ['filingDeadlines', companyId, selectedJurisdiction],
    queryFn: () => api.getFilingDeadlines(companyId, selectedJurisdiction),
    enabled: activeTab === 'filing'
  });

  const { data: taxRates } = useQuery({
    queryKey: ['taxRates', selectedJurisdiction, selectedTaxType],
    queryFn: () => api.getTaxRates(selectedJurisdiction, selectedTaxType),
    enabled: activeTab === 'tax'
  });

  const { data: auditTrail } = useQuery({
    queryKey: ['auditTrail', companyId],
    queryFn: () => api.getAuditTrail(companyId),
    enabled: activeTab === 'compliance'
  });

  const { data: taxOptimization } = useQuery({
    queryKey: ['taxOptimization', companyId],
    queryFn: () => api.getTaxOptimization(companyId),
    enabled: activeTab === 'optimization'
  });

  // Mutations
  const checkComplianceMutation = useMutation({
    mutationFn: ({ period }: { period: { start: Date; end: Date } }) => 
      api.checkCompliance(companyId, period),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['complianceChecks', companyId] });
      queryClient.invalidateQueries({ queryKey: ['complianceSummary', companyId] });
    }
  });

  const prepareTaxFilingMutation = useMutation({
    mutationFn: (request: any) => api.prepareTaxFiling(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taxFilings', companyId] });
    }
  });

  // Tab Navigation
  const tabs = [
    { id: 'tax', label: 'Tax Calculation', icon: Calculator },
    { id: 'compliance', label: 'Compliance Monitoring', icon: Shield },
    { id: 'filing', label: 'Tax Filing', icon: FileText },
    { id: 'jurisdictions', label: 'Multi-Jurisdiction', icon: Globe },
    { id: 'optimization', label: 'Tax Optimization', icon: TrendingUp }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                AI-Powered Compliance & Tax Management
              </h1>
              <p className="text-gray-600 mt-1">
                Intelligent tax calculation, compliance monitoring, and multi-jurisdiction support
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <Zap className="w-4 h-4" />
                <span>AI Enhanced</span>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-teal-500 text-teal-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tax Calculation Tab */}
        {activeTab === 'tax' && (
          <div className="space-y-6">
            {/* Tax Calculation Engine */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Tax Calculation Engine</h2>
                <div className="flex items-center space-x-4">
                  <select
                    value={selectedJurisdiction}
                    onChange={(e) => setSelectedJurisdiction(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="UK">United Kingdom</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                  <select
                    value={selectedTaxType}
                    onChange={(e) => setSelectedTaxType(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                  >
                    <option value="VAT">VAT</option>
                    <option value="GST">GST</option>
                    <option value="SalesTax">Sales Tax</option>
                    <option value="CorporateTax">Corporate Tax</option>
                  </select>
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                    <Calculator className="w-4 h-4 inline mr-2" />
                    Calculate Tax
                  </button>
                </div>
              </div>

              {/* Tax Rates Display */}
              {taxRates?.data && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Current Tax Rates</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(taxRates.data.taxRates).map(([taxType, rates]: [string, any]) => (
                      <div key={taxType} className="border rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">{taxType}</h4>
                        <div className="space-y-2">
                          {rates.map((rate: any, index: number) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-600">{rate.description}</span>
                              <span className="font-medium">{rate.rate}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tax Calculation Form */}
              <div className="border rounded-lg p-4">
                <h3 className="text-md font-medium text-gray-900 mb-3">Calculate Tax Liability</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period Start</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      defaultValue={new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Period End</label>
                    <input
                      type="date"
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      defaultValue={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button className="w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700">
                    Calculate Tax Liability
                  </button>
                </div>
              </div>
            </div>

            {/* Recent Tax Calculations */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Tax Calculations</h3>
              </div>
              <div className="p-6">
                {taxCalculationsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading tax calculations...</p>
                  </div>
                ) : taxCalculations?.data?.length > 0 ? (
                  <div className="space-y-4">
                    {taxCalculations.data.map((calculation: any) => (
                      <div key={calculation.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {calculation.taxType} - {calculation.jurisdiction}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(calculation.periodStart).toLocaleDateString()} - {new Date(calculation.periodEnd).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ${calculation.netTaxLiability?.toFixed(2) || '0.00'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {calculation.currency}
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Sales:</span>
                            <span className="ml-2 font-medium">${calculation.totalSales?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Purchases:</span>
                            <span className="ml-2 font-medium">${calculation.totalPurchases?.toFixed(2) || '0.00'}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Status:</span>
                            <span className={`ml-2 px-2 py-1 rounded text-xs ${
                              calculation.status === 'calculated' ? 'bg-green-100 text-green-800' :
                              calculation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {calculation.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calculator className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No tax calculations yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Compliance Monitoring Tab */}
        {activeTab === 'compliance' && (
          <div className="space-y-6">
            {/* Compliance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Compliance Rate</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {complianceSummary?.data?.complianceRate?.toFixed(1) || '100'}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Total Checks</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {complianceSummary?.data?.totalChecks || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="w-6 h-6 text-red-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Failed Checks</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {complianceSummary?.data?.failed || 0}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="w-6 h-6 text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500">Warnings</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {complianceSummary?.data?.warnings || 0}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compliance Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Compliance Monitoring</h2>
                <button
                  onClick={() => checkComplianceMutation.mutate({
                    period: {
                      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                      end: new Date()
                    }
                  })}
                  disabled={checkComplianceMutation.isPending}
                  className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:opacity-50"
                >
                  {checkComplianceMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                  ) : (
                    <Shield className="w-4 h-4 inline mr-2" />
                  )}
                  Run Compliance Check
                </button>
              </div>

              {/* Recent Issues */}
              {complianceSummary?.data?.recentIssues?.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-3">Recent Issues</h3>
                  <div className="space-y-2">
                    {complianceSummary.data.recentIssues.map((issue: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-red-800">{issue.ruleId}</p>
                          <p className="text-xs text-red-600">{issue.details}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          issue.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {issue.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Compliance Checks */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Compliance Checks</h3>
              </div>
              <div className="p-6">
                {complianceChecksLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading compliance checks...</p>
                  </div>
                ) : complianceChecks?.data?.length > 0 ? (
                  <div className="space-y-4">
                    {complianceChecks.data.map((check: ComplianceCheck) => (
                      <div key={check.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">Rule {check.ruleId}</h4>
                            <p className="text-sm text-gray-500">
                              {new Date(check.checkDate).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            check.status === 'passed' ? 'bg-green-100 text-green-800' :
                            check.status === 'failed' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {check.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{check.details}</p>
                        {check.recommendations?.length > 0 && (
                          <div>
                            <p className="text-xs font-medium text-gray-700 mb-1">Recommendations:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {check.recommendations.map((rec, index) => (
                                <li key={index} className="flex items-start">
                                  <span className="text-teal-500 mr-1">•</span>
                                  {rec}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Shield className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No compliance checks yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tax Filing Tab */}
        {activeTab === 'filing' && (
          <div className="space-y-6">
            {/* Filing Deadlines */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filing Deadlines</h2>
                <select
                  value={selectedJurisdiction}
                  onChange={(e) => setSelectedJurisdiction(e.target.value)}
                  className="border border-gray-300 rounded-md px-3 py-1 text-sm"
                >
                  <option value="UK">United Kingdom</option>
                  <option value="US">United States</option>
                  <option value="CA">Canada</option>
                  <option value="AU">Australia</option>
                </select>
              </div>

              {filingDeadlines?.data?.length > 0 ? (
                <div className="space-y-4">
                  {filingDeadlines.data.map((deadline: any) => (
                    <div key={deadline.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            {deadline.taxType} - {deadline.period}
                          </h4>
                          <p className="text-sm text-gray-500">
                            Due: {new Date(deadline.dueDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-1 rounded ${
                            deadline.status === 'overdue' ? 'bg-red-100 text-red-800' :
                            deadline.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {deadline.status}
                          </span>
                          <div className="text-sm text-gray-500 mt-1">
                            {deadline.daysRemaining > 0 ? `${deadline.daysRemaining} days remaining` : 
                             `${Math.abs(deadline.daysRemaining)} days overdue`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No filing deadlines</p>
                </div>
              )}
            </div>

            {/* Tax Filings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">Tax Filings</h3>
                  <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                    <Plus className="w-4 h-4 inline mr-2" />
                    Prepare Filing
                  </button>
                </div>
              </div>
              <div className="p-6">
                {taxFilingsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
                    <p className="mt-2 text-sm text-gray-500">Loading tax filings...</p>
                  </div>
                ) : taxFilings?.data?.length > 0 ? (
                  <div className="space-y-4">
                    {taxFilings.data.map((filing: any) => (
                      <div key={filing.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-gray-900">
                              {filing.taxType} - {filing.jurisdiction}
                            </h4>
                            <p className="text-sm text-gray-500">
                              {new Date(filing.periodStart).toLocaleDateString()} - {new Date(filing.periodEnd).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              ${filing.amount?.toFixed(2) || '0.00'}
                            </div>
                            <span className={`text-xs px-2 py-1 rounded ${
                              filing.status === 'filed' ? 'bg-green-100 text-green-800' :
                              filing.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                              filing.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {filing.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-500">No tax filings yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Multi-Jurisdiction Tab */}
        {activeTab === 'jurisdictions' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Multi-Jurisdiction Configuration</h2>
                <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                  <Settings className="w-4 h-4 inline mr-2" />
                  Configure Jurisdictions
                </button>
              </div>

              {jurisdictions?.data?.jurisdictions?.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {jurisdictions.data.jurisdictions.map((jurisdiction: JurisdictionConfig) => (
                    <div key={jurisdiction.code} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900">{jurisdiction.name}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${
                          jurisdiction.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {jurisdiction.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div>Currency: {jurisdiction.currency}</div>
                        <div>Tax Types: {jurisdiction.taxTypes.length}</div>
                        <div>Compliance Rules: {jurisdiction.complianceRules.length}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Globe className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No jurisdictions configured</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tax Optimization Tab */}
        {activeTab === 'optimization' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Tax Optimization Recommendations</h2>
                <button className="bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700">
                  <RefreshCw className="w-4 h-4 inline mr-2" />
                  Refresh Analysis
                </button>
              </div>

              {taxOptimization?.data?.recommendations?.length > 0 ? (
                <div className="space-y-4">
                  {taxOptimization.data.recommendations.map((rec: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{rec.title}</h4>
                          <p className="text-sm text-gray-600 mt-1">{rec.description}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            {Math.round(rec.confidence * 100)}% confidence
                          </span>
                          <span className={`text-xs px-2 py-1 rounded ${
                            rec.riskScore > 0.5 ? 'bg-red-100 text-red-800' :
                            rec.riskScore > 0.2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            Risk: {Math.round(rec.riskScore * 100)}%
                          </span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <h5 className="text-sm font-medium text-gray-700 mb-2">Recommendations:</h5>
                        <ul className="space-y-1">
                          {rec.recommendations.map((rec: string, recIndex: number) => (
                            <li key={recIndex} className="text-sm text-gray-600 flex items-start">
                              <span className="text-teal-500 mr-2 mt-1">•</span>
                              {rec}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No optimization recommendations available</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
