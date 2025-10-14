import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
;
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calculator, Shield, FileText, Globe, TrendingUp, AlertTriangle, CheckCircle, Clock, Calendar, Plus, Settings, RefreshCw, Zap } from 'lucide-react';
// API Functions
const api = {
    // Tax Calculation
    calculateTax: async (request) => {
        const response = await fetch('/api/enhanced-compliance-tax/tax/calculate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        return response.json();
    },
    getTaxCalculations: async (companyId, params) => {
        const queryParams = new URLSearchParams();
        if (params?.jurisdiction)
            queryParams.append('jurisdiction', params.jurisdiction);
        if (params?.startDate)
            queryParams.append('startDate', params.startDate);
        if (params?.endDate)
            queryParams.append('endDate', params.endDate);
        if (params?.taxType)
            queryParams.append('taxType', params.taxType);
        const response = await fetch(`/api/enhanced-compliance-tax/tax/calculations/${companyId}?${queryParams}`);
        return response.json();
    },
    getTaxCalculation: async (companyId, calculationId) => {
        const response = await fetch(`/api/enhanced-compliance-tax/tax/calculations/${companyId}/${calculationId}`);
        return response.json();
    },
    // Compliance Monitoring
    checkCompliance: async (companyId, period) => {
        const response = await fetch('/api/enhanced-compliance-tax/compliance/check', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ companyId, period })
        });
        return response.json();
    },
    getComplianceChecks: async (companyId, params) => {
        const queryParams = new URLSearchParams();
        if (params?.startDate)
            queryParams.append('startDate', params.startDate);
        if (params?.endDate)
            queryParams.append('endDate', params.endDate);
        if (params?.status)
            queryParams.append('status', params.status);
        const response = await fetch(`/api/enhanced-compliance-tax/compliance/checks/${companyId}?${queryParams}`);
        return response.json();
    },
    getComplianceSummary: async (companyId, period) => {
        const queryParams = new URLSearchParams();
        if (period)
            queryParams.append('period', period);
        const response = await fetch(`/api/enhanced-compliance-tax/compliance/summary/${companyId}?${queryParams}`);
        return response.json();
    },
    // Tax Filing
    prepareTaxFiling: async (request) => {
        const response = await fetch('/api/enhanced-compliance-tax/tax/filing/prepare', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(request)
        });
        return response.json();
    },
    getTaxFilings: async (companyId, params) => {
        const queryParams = new URLSearchParams();
        if (params?.jurisdiction)
            queryParams.append('jurisdiction', params.jurisdiction);
        if (params?.startDate)
            queryParams.append('startDate', params.startDate);
        if (params?.endDate)
            queryParams.append('endDate', params.endDate);
        if (params?.status)
            queryParams.append('status', params.status);
        const response = await fetch(`/api/enhanced-compliance-tax/tax/filings/${companyId}?${queryParams}`);
        return response.json();
    },
    submitTaxFiling: async (filingId, submitDate) => {
        const response = await fetch(`/api/enhanced-compliance-tax/tax/filings/${filingId}/submit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ submitDate })
        });
        return response.json();
    },
    // Multi-Jurisdiction Support
    getJurisdictions: async (companyId) => {
        const response = await fetch(`/api/enhanced-compliance-tax/jurisdictions/${companyId}`);
        return response.json();
    },
    // Currency Conversion
    convertCurrency: async (amount, fromCurrency, toCurrency, date) => {
        const response = await fetch('/api/enhanced-compliance-tax/currency/convert', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount, fromCurrency, toCurrency, date })
        });
        return response.json();
    },
    // Tax Optimization
    getTaxOptimization: async (companyId, startDate, endDate) => {
        const queryParams = new URLSearchParams();
        if (startDate)
            queryParams.append('startDate', startDate);
        if (endDate)
            queryParams.append('endDate', endDate);
        const response = await fetch(`/api/enhanced-compliance-tax/tax/optimization/${companyId}?${queryParams}`);
        return response.json();
    },
    // Tax Rates
    getTaxRates: async (jurisdiction, taxType, effectiveDate) => {
        const queryParams = new URLSearchParams();
        if (taxType)
            queryParams.append('taxType', taxType);
        if (effectiveDate)
            queryParams.append('effectiveDate', effectiveDate);
        const response = await fetch(`/api/enhanced-compliance-tax/tax/rates/${jurisdiction}?${queryParams}`);
        return response.json();
    },
    // Filing Deadlines
    getFilingDeadlines: async (companyId, jurisdiction, taxType) => {
        const queryParams = new URLSearchParams();
        if (jurisdiction)
            queryParams.append('jurisdiction', jurisdiction);
        if (taxType)
            queryParams.append('taxType', taxType);
        const response = await fetch(`/api/enhanced-compliance-tax/filing/deadlines/${companyId}?${queryParams}`);
        return response.json();
    },
    // Audit Trail
    getAuditTrail: async (companyId, startDate, endDate, type) => {
        const queryParams = new URLSearchParams();
        if (startDate)
            queryParams.append('startDate', startDate);
        if (endDate)
            queryParams.append('endDate', endDate);
        if (type)
            queryParams.append('type', type);
        const response = await fetch(`/api/enhanced-compliance-tax/audit/trail/${companyId}?${queryParams}`);
        return response.json();
    },
    // Compliance Rules
    getComplianceRules: async (companyId, jurisdiction, standard, severity) => {
        const queryParams = new URLSearchParams();
        if (jurisdiction)
            queryParams.append('jurisdiction', jurisdiction);
        if (standard)
            queryParams.append('standard', standard);
        if (severity)
            queryParams.append('severity', severity);
        const response = await fetch(`/api/enhanced-compliance-tax/compliance/rules/${companyId}?${queryParams}`);
        return response.json();
    }
};
// Enhanced Compliance & Tax Component
export const EnhancedComplianceTax = ({ companyId }) => {
    const [activeTab, setActiveTab] = useState('tax');
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
        mutationFn: ({ period }) => api.checkCompliance(companyId, period),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['complianceChecks', companyId] });
            queryClient.invalidateQueries({ queryKey: ['complianceSummary', companyId] });
        }
    });
    const prepareTaxFilingMutation = useMutation({
        mutationFn: (request) => api.prepareTaxFiling(request),
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
    return (_jsxs("div", { className: "min-h-screen bg-gray-50", children: [_jsx("div", { className: "bg-white shadow-sm border-b", children: _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8", children: [_jsxs("div", { className: "flex justify-between items-center py-6", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-2xl font-bold text-gray-900", children: "AI-Powered Compliance & Tax Management" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Intelligent tax calculation, compliance monitoring, and multi-jurisdiction support" })] }), _jsx("div", { className: "flex items-center space-x-3", children: _jsxs("div", { className: "flex items-center space-x-2 text-sm text-gray-500", children: [_jsx(Zap, { className: "w-4 h-4" }), _jsx("span", { children: "AI Enhanced" })] }) })] }), _jsx("div", { className: "flex space-x-8", children: tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (_jsxs("button", { onClick: () => setActiveTab(tab.id), className: `flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.id
                                        ? 'border-teal-500 text-teal-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`, children: [_jsx(Icon, { className: "w-4 h-4" }), _jsx("span", { children: tab.label })] }, tab.id));
                            }) })] }) }), _jsxs("div", { className: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8", children: [activeTab === 'tax' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Tax Calculation Engine" }), _jsxs("div", { className: "flex items-center space-x-4", children: [_jsxs("select", { value: selectedJurisdiction, onChange: (e) => setSelectedJurisdiction(e.target.value), className: "border border-gray-300 rounded-md px-3 py-1 text-sm", children: [_jsx("option", { value: "UK", children: "United Kingdom" }), _jsx("option", { value: "US", children: "United States" }), _jsx("option", { value: "CA", children: "Canada" }), _jsx("option", { value: "AU", children: "Australia" })] }), _jsxs("select", { value: selectedTaxType, onChange: (e) => setSelectedTaxType(e.target.value), className: "border border-gray-300 rounded-md px-3 py-1 text-sm", children: [_jsx("option", { value: "VAT", children: "VAT" }), _jsx("option", { value: "GST", children: "GST" }), _jsx("option", { value: "SalesTax", children: "Sales Tax" }), _jsx("option", { value: "CorporateTax", children: "Corporate Tax" })] }), _jsxs("button", { className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: [_jsx(Calculator, { className: "w-4 h-4 inline mr-2" }), "Calculate Tax"] })] })] }), taxRates?.data && (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-md font-medium text-gray-900 mb-3", children: "Current Tax Rates" }), _jsx("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: Object.entries(taxRates.data.taxRates).map(([taxType, rates]) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h4", { className: "font-medium text-gray-900 mb-2", children: taxType }), _jsx("div", { className: "space-y-2", children: rates.map((rate, index) => (_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: rate.description }), _jsxs("span", { className: "font-medium", children: [rate.rate, "%"] })] }, index))) })] }, taxType))) })] })), _jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("h3", { className: "text-md font-medium text-gray-900 mb-3", children: "Calculate Tax Liability" }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Period Start" }), _jsx("input", { type: "date", className: "w-full border border-gray-300 rounded-md px-3 py-2", defaultValue: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] })] }), _jsxs("div", { children: [_jsx("label", { className: "block text-sm font-medium text-gray-700 mb-1", children: "Period End" }), _jsx("input", { type: "date", className: "w-full border border-gray-300 rounded-md px-3 py-2", defaultValue: new Date().toISOString().split('T')[0] })] })] }), _jsx("div", { className: "mt-4", children: _jsx("button", { className: "w-full bg-teal-600 text-white py-2 px-4 rounded-md hover:bg-teal-700", children: "Calculate Tax Liability" }) })] })] }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Recent Tax Calculations" }) }), _jsx("div", { className: "p-6", children: taxCalculationsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading tax calculations..." })] })) : taxCalculations?.data?.length > 0 ? (_jsx("div", { className: "space-y-4", children: taxCalculations.data.map((calculation) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-gray-900", children: [calculation.taxType, " - ", calculation.jurisdiction] }), _jsxs("p", { className: "text-sm text-gray-500", children: [new Date(calculation.periodStart).toLocaleDateString(), " - ", new Date(calculation.periodEnd).toLocaleDateString()] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-lg font-bold text-gray-900", children: ["$", calculation.netTaxLiability?.toFixed(2) || '0.00'] }), _jsx("div", { className: "text-sm text-gray-500", children: calculation.currency })] })] }), _jsxs("div", { className: "grid grid-cols-3 gap-4 text-sm", children: [_jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Sales:" }), _jsxs("span", { className: "ml-2 font-medium", children: ["$", calculation.totalSales?.toFixed(2) || '0.00'] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Purchases:" }), _jsxs("span", { className: "ml-2 font-medium", children: ["$", calculation.totalPurchases?.toFixed(2) || '0.00'] })] }), _jsxs("div", { children: [_jsx("span", { className: "text-gray-500", children: "Status:" }), _jsx("span", { className: `ml-2 px-2 py-1 rounded text-xs ${calculation.status === 'calculated' ? 'bg-green-100 text-green-800' :
                                                                            calculation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                                                'bg-gray-100 text-gray-800'}`, children: calculation.status })] })] })] }, calculation.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Calculator, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No tax calculations yet" })] })) })] })] })), activeTab === 'compliance' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-green-100 rounded-lg", children: _jsx(CheckCircle, { className: "w-6 h-6 text-green-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Compliance Rate" }), _jsxs("p", { className: "text-2xl font-bold text-gray-900", children: [complianceSummary?.data?.complianceRate?.toFixed(1) || '100', "%"] })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-blue-100 rounded-lg", children: _jsx(Shield, { className: "w-6 h-6 text-blue-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Total Checks" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: complianceSummary?.data?.totalChecks || 0 })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-red-100 rounded-lg", children: _jsx(AlertTriangle, { className: "w-6 h-6 text-red-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Failed Checks" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: complianceSummary?.data?.failed || 0 })] })] }) }), _jsx("div", { className: "bg-white rounded-lg shadow p-6", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "p-2 bg-yellow-100 rounded-lg", children: _jsx(Clock, { className: "w-6 h-6 text-yellow-600" }) }), _jsxs("div", { className: "ml-4", children: [_jsx("p", { className: "text-sm font-medium text-gray-500", children: "Warnings" }), _jsx("p", { className: "text-2xl font-bold text-gray-900", children: complianceSummary?.data?.warnings || 0 })] })] }) })] }), _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Compliance Monitoring" }), _jsxs("button", { onClick: () => checkComplianceMutation.mutate({
                                                    period: {
                                                        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                                                        end: new Date()
                                                    }
                                                }), disabled: checkComplianceMutation.isPending, className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700 disabled:opacity-50", children: [checkComplianceMutation.isPending ? (_jsx(RefreshCw, { className: "w-4 h-4 animate-spin inline mr-2" })) : (_jsx(Shield, { className: "w-4 h-4 inline mr-2" })), "Run Compliance Check"] })] }), complianceSummary?.data?.recentIssues?.length > 0 && (_jsxs("div", { className: "mb-6", children: [_jsx("h3", { className: "text-md font-medium text-gray-900 mb-3", children: "Recent Issues" }), _jsx("div", { className: "space-y-2", children: complianceSummary.data.recentIssues.map((issue, index) => (_jsxs("div", { className: "flex items-center justify-between p-3 bg-red-50 rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-red-800", children: issue.ruleId }), _jsx("p", { className: "text-xs text-red-600", children: issue.details })] }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${issue.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`, children: issue.status })] }, index))) })] }))] }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Compliance Checks" }) }), _jsx("div", { className: "p-6", children: complianceChecksLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading compliance checks..." })] })) : complianceChecks?.data?.length > 0 ? (_jsx("div", { className: "space-y-4", children: complianceChecks.data.map((check) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-gray-900", children: ["Rule ", check.ruleId] }), _jsx("p", { className: "text-sm text-gray-500", children: new Date(check.checkDate).toLocaleDateString() })] }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${check.status === 'passed' ? 'bg-green-100 text-green-800' :
                                                                    check.status === 'failed' ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'}`, children: check.status })] }), _jsx("p", { className: "text-sm text-gray-600 mb-2", children: check.details }), check.recommendations?.length > 0 && (_jsxs("div", { children: [_jsx("p", { className: "text-xs font-medium text-gray-700 mb-1", children: "Recommendations:" }), _jsx("ul", { className: "text-xs text-gray-600 space-y-1", children: check.recommendations.map((rec, index) => (_jsxs("li", { className: "flex items-start", children: [_jsx("span", { className: "text-teal-500 mr-1", children: "\u2022" }), rec] }, index))) })] }))] }, check.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Shield, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No compliance checks yet" })] })) })] })] })), activeTab === 'filing' && (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Filing Deadlines" }), _jsxs("select", { value: selectedJurisdiction, onChange: (e) => setSelectedJurisdiction(e.target.value), className: "border border-gray-300 rounded-md px-3 py-1 text-sm", children: [_jsx("option", { value: "UK", children: "United Kingdom" }), _jsx("option", { value: "US", children: "United States" }), _jsx("option", { value: "CA", children: "Canada" }), _jsx("option", { value: "AU", children: "Australia" })] })] }), filingDeadlines?.data?.length > 0 ? (_jsx("div", { className: "space-y-4", children: filingDeadlines.data.map((deadline) => (_jsx("div", { className: "border rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-gray-900", children: [deadline.taxType, " - ", deadline.period] }), _jsxs("p", { className: "text-sm text-gray-500", children: ["Due: ", new Date(deadline.dueDate).toLocaleDateString()] })] }), _jsxs("div", { className: "text-right", children: [_jsx("span", { className: `text-xs px-2 py-1 rounded ${deadline.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                                                    deadline.status === 'upcoming' ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-green-100 text-green-800'}`, children: deadline.status }), _jsx("div", { className: "text-sm text-gray-500 mt-1", children: deadline.daysRemaining > 0 ? `${deadline.daysRemaining} days remaining` :
                                                                    `${Math.abs(deadline.daysRemaining)} days overdue` })] })] }) }, deadline.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Calendar, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No filing deadlines" })] }))] }), _jsxs("div", { className: "bg-white rounded-lg shadow", children: [_jsx("div", { className: "px-6 py-4 border-b border-gray-200", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "text-lg font-semibold text-gray-900", children: "Tax Filings" }), _jsxs("button", { className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: [_jsx(Plus, { className: "w-4 h-4 inline mr-2" }), "Prepare Filing"] })] }) }), _jsx("div", { className: "p-6", children: taxFilingsLoading ? (_jsxs("div", { className: "text-center py-8", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "Loading tax filings..." })] })) : taxFilings?.data?.length > 0 ? (_jsx("div", { className: "space-y-4", children: taxFilings.data.map((filing) => (_jsx("div", { className: "border rounded-lg p-4", children: _jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsxs("div", { children: [_jsxs("h4", { className: "font-medium text-gray-900", children: [filing.taxType, " - ", filing.jurisdiction] }), _jsxs("p", { className: "text-sm text-gray-500", children: [new Date(filing.periodStart).toLocaleDateString(), " - ", new Date(filing.periodEnd).toLocaleDateString()] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { className: "text-lg font-bold text-gray-900", children: ["$", filing.amount?.toFixed(2) || '0.00'] }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${filing.status === 'filed' ? 'bg-green-100 text-green-800' :
                                                                        filing.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                                                                            filing.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                                                'bg-yellow-100 text-yellow-800'}`, children: filing.status })] })] }) }, filing.id))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(FileText, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No tax filings yet" })] })) })] })] })), activeTab === 'jurisdictions' && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Multi-Jurisdiction Configuration" }), _jsxs("button", { className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: [_jsx(Settings, { className: "w-4 h-4 inline mr-2" }), "Configure Jurisdictions"] })] }), jurisdictions?.data?.jurisdictions?.length > 0 ? (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4", children: jurisdictions.data.jurisdictions.map((jurisdiction) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: "font-medium text-gray-900", children: jurisdiction.name }), _jsx("span", { className: `text-xs px-2 py-1 rounded ${jurisdiction.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`, children: jurisdiction.isActive ? 'Active' : 'Inactive' })] }), _jsxs("div", { className: "text-sm text-gray-600 space-y-1", children: [_jsxs("div", { children: ["Currency: ", jurisdiction.currency] }), _jsxs("div", { children: ["Tax Types: ", jurisdiction.taxTypes.length] }), _jsxs("div", { children: ["Compliance Rules: ", jurisdiction.complianceRules.length] })] })] }, jurisdiction.code))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(Globe, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No jurisdictions configured" })] }))] }) })), activeTab === 'optimization' && (_jsx("div", { className: "space-y-6", children: _jsxs("div", { className: "bg-white rounded-lg shadow p-6", children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsx("h2", { className: "text-lg font-semibold text-gray-900", children: "Tax Optimization Recommendations" }), _jsxs("button", { className: "bg-teal-600 text-white px-4 py-2 rounded-md hover:bg-teal-700", children: [_jsx(RefreshCw, { className: "w-4 h-4 inline mr-2" }), "Refresh Analysis"] })] }), taxOptimization?.data?.recommendations?.length > 0 ? (_jsx("div", { className: "space-y-4", children: taxOptimization.data.recommendations.map((rec, index) => (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { children: [_jsx("h4", { className: "font-medium text-gray-900", children: rec.title }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: rec.description })] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsxs("span", { className: "text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded", children: [Math.round(rec.confidence * 100), "% confidence"] }), _jsxs("span", { className: `text-xs px-2 py-1 rounded ${rec.riskScore > 0.5 ? 'bg-red-100 text-red-800' :
                                                                    rec.riskScore > 0.2 ? 'bg-yellow-100 text-yellow-800' :
                                                                        'bg-green-100 text-green-800'}`, children: ["Risk: ", Math.round(rec.riskScore * 100), "%"] })] })] }), _jsxs("div", { className: "mt-3", children: [_jsx("h5", { className: "text-sm font-medium text-gray-700 mb-2", children: "Recommendations:" }), _jsx("ul", { className: "space-y-1", children: rec.recommendations.map((rec, recIndex) => (_jsxs("li", { className: "text-sm text-gray-600 flex items-start", children: [_jsx("span", { className: "text-teal-500 mr-2 mt-1", children: "\u2022" }), rec] }, recIndex))) })] })] }, index))) })) : (_jsxs("div", { className: "text-center py-8", children: [_jsx(TrendingUp, { className: "mx-auto h-12 w-12 text-gray-400" }), _jsx("p", { className: "mt-2 text-sm text-gray-500", children: "No optimization recommendations available" })] }))] }) }))] })] }));
};
