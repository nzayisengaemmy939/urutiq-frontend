import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
;
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar, Calculator, FileText, AlertTriangle, CheckCircle, Clock, TrendingUp, Building, Globe } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
// API client setup
const api = {
    get: async (url) => {
        const response = await fetch(`/api${url}`);
        if (!response.ok)
            throw new Error('Network response was not ok');
        return response.json();
    },
    post: async (url, data) => {
        const response = await fetch(`/api${url}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok)
            throw new Error('Network response was not ok');
        return response.json();
    },
    put: async (url, data) => {
        const response = await fetch(`/api${url}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok)
            throw new Error('Network response was not ok');
        return response.json();
    }
};
const TaxManagementDashboard = () => {
    const [activeTab, setActiveTab] = useState('overview');
    const [selectedCompany, setSelectedCompany] = useState('');
    const queryClient = useQueryClient();
    // Queries
    const { data: complianceData } = useQuery({
        queryKey: ['tax-compliance'],
        queryFn: () => api.get('/tax/reports/compliance-status')
    });
    const { data: jurisdictions } = useQuery({
        queryKey: ['tax-jurisdictions'],
        queryFn: () => api.get('/tax/jurisdictions')
    });
    const { data: taxRates } = useQuery({
        queryKey: ['tax-rates'],
        queryFn: () => api.get('/tax/rates/advanced')
    });
    const { data: taxForms } = useQuery({
        queryKey: ['tax-forms'],
        queryFn: () => api.get('/tax/forms')
    });
    const { data: upcomingEvents } = useQuery({
        queryKey: ['tax-events-upcoming'],
        queryFn: () => api.get('/tax/calendar/upcoming?days=30')
    });
    const { data: overdueEvents } = useQuery({
        queryKey: ['tax-events-overdue'],
        queryFn: () => api.get('/tax/calendar/overdue')
    });
    const { data: formTemplates } = useQuery({
        queryKey: ['tax-form-templates'],
        queryFn: () => api.get('/tax/forms/templates')
    });
    // Mutations
    const createJurisdictionMutation = useMutation({
        mutationFn: (data) => api.post('/tax/jurisdictions', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-jurisdictions'] });
        }
    });
    const createTaxRateMutation = useMutation({
        mutationFn: (data) => api.post('/tax/rates/advanced', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-rates'] });
        }
    });
    const generateFormMutation = useMutation({
        mutationFn: (data) => api.post('/tax/forms/generate', data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tax-forms'] });
        }
    });
    const calculateTaxMutation = useMutation({
        mutationFn: (data) => api.post('/tax/calculate/advanced', data),
        onSuccess: (data) => {
            console.log('Tax calculation result:', data);
        }
    });
    // State for forms
    const [newJurisdiction, setNewJurisdiction] = useState({
        name: '',
        code: '',
        country: '',
        level: 'federal',
        companyId: ''
    });
    const [newTaxRate, setNewTaxRate] = useState({
        jurisdictionId: '',
        taxName: '',
        taxType: 'sales',
        rate: 0,
        appliesTo: 'all',
        effectiveFrom: new Date().toISOString().split('T')[0],
        companyId: ''
    });
    const [taxCalculator, setTaxCalculator] = useState({
        baseAmount: 0,
        taxRateIds: [],
        transactionDate: new Date().toISOString().split('T')[0],
        companyId: ''
    });
    const [formGenerator, setFormGenerator] = useState({
        formCode: '',
        taxYear: new Date().getFullYear(),
        jurisdictionId: '',
        companyId: ''
    });
    // Event handlers
    const handleCreateJurisdiction = () => {
        createJurisdictionMutation.mutate(newJurisdiction);
    };
    const handleCreateTaxRate = () => {
        createTaxRateMutation.mutate(newTaxRate);
    };
    const handleCalculateTax = () => {
        calculateTaxMutation.mutate({
            baseAmount: taxCalculator.baseAmount,
            taxRateIds: taxCalculator.taxRateIds
        });
    };
    const handleGenerateForm = () => {
        generateFormMutation.mutate(formGenerator);
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'excellent': return 'text-green-600';
            case 'good': return 'text-blue-600';
            case 'fair': return 'text-yellow-600';
            case 'poor': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };
    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'critical': return 'bg-red-100 text-red-800';
            case 'high': return 'bg-orange-100 text-orange-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'low': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getFormStatusColor = (status) => {
        switch (status) {
            case 'submitted': return 'bg-green-100 text-green-800';
            case 'ready': return 'bg-blue-100 text-blue-800';
            case 'draft': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    return (_jsxs("div", { className: "p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Tax Management" }), _jsx("p", { className: "text-gray-600", children: "Comprehensive tax compliance and management system" })] }), _jsx("div", { className: "flex items-center space-x-4", children: _jsxs(Select, { value: selectedCompany, onValueChange: setSelectedCompany, children: [_jsx(SelectTrigger, { className: "w-[200px]", children: _jsx(SelectValue, { placeholder: "Select Company" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "all", children: "All Companies" }), _jsx(SelectItem, { value: "company1", children: "Company 1" }), _jsx(SelectItem, { value: "company2", children: "Company 2" })] })] }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-6", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "calendar", children: "Calendar" }), _jsx(TabsTrigger, { value: "forms", children: "Forms" }), _jsx(TabsTrigger, { value: "rates", children: "Tax Rates" }), _jsx(TabsTrigger, { value: "calculator", children: "Calculator" }), _jsx(TabsTrigger, { value: "compliance", children: "Compliance" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Overall Compliance" }), _jsx(TrendingUp, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "text-2xl font-bold", children: [complianceData?.overallCompliance || 0, "%"] }), _jsx(Progress, { value: complianceData?.overallCompliance || 0, className: "mt-2" }), _jsxs("p", { className: `text-xs mt-2 ${getStatusColor(complianceData?.status || '')}`, children: [complianceData?.status || 'Unknown', " status"] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Forms Status" }), _jsx(FileText, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: complianceData?.forms.submitted || 0 }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["of ", complianceData?.forms.total || 0, " submitted"] }), (complianceData?.forms.overdue || 0) > 0 && (_jsxs("p", { className: "text-xs text-red-600 mt-1", children: [complianceData?.forms.overdue, " overdue"] }))] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Calendar Events" }), _jsx(Calendar, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: complianceData?.events.completed || 0 }), _jsxs("p", { className: "text-xs text-muted-foreground", children: ["of ", complianceData?.events.total || 0, " completed"] }), (complianceData?.events.overdue || 0) > 0 && (_jsxs("p", { className: "text-xs text-red-600 mt-1", children: [complianceData?.events.overdue, " overdue"] }))] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between space-y-0 pb-2", children: [_jsx(CardTitle, { className: "text-sm font-medium", children: "Active Jurisdictions" }), _jsx(Globe, { className: "h-4 w-4 text-muted-foreground" })] }), _jsxs(CardContent, { children: [_jsx("div", { className: "text-2xl font-bold", children: jurisdictions?.length || 0 }), _jsx("p", { className: "text-xs text-muted-foreground", children: "tax jurisdictions" })] })] })] }), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Upcoming Deadlines" }), _jsx(CardDescription, { children: "Next 30 days" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [upcomingEvents?.slice(0, 5).map((event) => (_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: event.title }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Due: ", new Date(event.dueDate).toLocaleDateString()] })] }), _jsx(Badge, { className: getPriorityColor(event.priority), children: event.priority })] }, event.id))), (!upcomingEvents || upcomingEvents.length === 0) && (_jsx("p", { className: "text-gray-500 text-center py-4", children: "No upcoming deadlines" }))] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Overdue Items" }), _jsx(CardDescription, { children: "Requires immediate attention" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [overdueEvents?.slice(0, 5).map((event) => (_jsxs(Alert, { children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: event.title }), _jsx("br", {}), "Overdue since: ", new Date(event.dueDate).toLocaleDateString()] })] }, event.id))), (!overdueEvents || overdueEvents.length === 0) && (_jsxs("div", { className: "flex items-center justify-center py-4", children: [_jsx(CheckCircle, { className: "h-5 w-5 text-green-600 mr-2" }), _jsx("p", { className: "text-green-600", children: "All items up to date!" })] }))] }) })] })] })] }), _jsx(TabsContent, { value: "calendar", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Tax Calendar" }), _jsx(CardDescription, { children: "Manage tax deadlines and compliance events" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex space-x-4", children: [_jsxs(Button, { children: [_jsx(Calendar, { className: "mr-2 h-4 w-4" }), "Initialize Calendar"] }), _jsx(Button, { variant: "outline", children: "Add Event" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h3", { className: "font-semibold", children: "Upcoming Events" }), upcomingEvents?.map((event) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: event.title }), _jsxs("p", { className: "text-sm text-gray-600", children: [event.eventType, " \u2022 Due: ", new Date(event.dueDate).toLocaleDateString()] }), event.formCodes.length > 0 && (_jsxs("p", { className: "text-xs text-gray-500", children: ["Forms: ", event.formCodes.join(', ')] }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Badge, { className: getPriorityColor(event.priority), children: event.priority }), _jsx(Button, { variant: "outline", size: "sm", children: event.status === 'completed' ? (_jsx(CheckCircle, { className: "h-4 w-4" })) : (_jsx(Clock, { className: "h-4 w-4" })) })] })] }, event.id)))] })] }) })] }) }), _jsx(TabsContent, { value: "forms", className: "space-y-6", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Generate New Form" }), _jsx(CardDescription, { children: "Create tax forms from templates" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "formCode", children: "Form Type" }), _jsxs(Select, { value: formGenerator.formCode, onValueChange: (value) => setFormGenerator(prev => ({ ...prev, formCode: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select form type" }) }), _jsx(SelectContent, { children: formTemplates?.map((template) => (_jsxs(SelectItem, { value: template.formCode, children: [template.formCode, " - ", template.formName] }, template.formCode))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "taxYear", children: "Tax Year" }), _jsx(Input, { id: "taxYear", type: "number", value: formGenerator.taxYear, onChange: (e) => setFormGenerator(prev => ({
                                                                ...prev,
                                                                taxYear: parseInt(e.target.value)
                                                            })) })] }), _jsx(Button, { onClick: handleGenerateForm, className: "w-full", children: "Generate Form" })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Recent Forms" }), _jsx(CardDescription, { children: "Manage existing tax forms" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [taxForms?.slice(0, 5).map((form) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { children: [_jsxs("p", { className: "font-medium", children: [form.formCode, " - ", form.formName] }), _jsxs("p", { className: "text-sm text-gray-600", children: ["Tax Year: ", form.taxYear] })] }), _jsx(Badge, { className: getFormStatusColor(form.status), children: form.status })] }, form.id))), (!taxForms || taxForms.length === 0) && (_jsx("p", { className: "text-gray-500 text-center py-4", children: "No forms found" }))] }) })] })] }) }), _jsx(TabsContent, { value: "rates", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Tax Rates Management" }), _jsx(CardDescription, { children: "Manage tax rates and jurisdictions" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs(Button, { onClick: handleCreateJurisdiction, children: [_jsx(Building, { className: "mr-2 h-4 w-4" }), "Add Jurisdiction"] }), _jsx("div", { className: "space-y-3", children: taxRates?.slice(0, 5).map((rate) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: rate.taxName }), _jsxs("p", { className: "text-sm text-gray-600", children: [rate.jurisdiction.name, " \u2022 ", (rate.rate * 100).toFixed(2), "%"] })] }), _jsx(Badge, { variant: "outline", children: rate.jurisdiction.level })] }, rate.id))) })] }) })] }) }), _jsx(TabsContent, { value: "calculator", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Tax Calculator" }), _jsx(CardDescription, { children: "Calculate taxes for transactions" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "baseAmount", children: "Base Amount" }), _jsx(Input, { id: "baseAmount", type: "number", step: "0.01", value: taxCalculator.baseAmount, onChange: (e) => setTaxCalculator(prev => ({
                                                        ...prev,
                                                        baseAmount: parseFloat(e.target.value) || 0
                                                    })) })] }), _jsxs(Button, { onClick: handleCalculateTax, className: "w-full", children: [_jsx(Calculator, { className: "mr-2 h-4 w-4" }), "Calculate Tax"] }), calculateTaxMutation.data && (_jsxs("div", { className: "mt-4 p-4 bg-gray-50 rounded", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Calculation Result" }), _jsxs("div", { className: "space-y-1 text-sm", children: [_jsxs("p", { children: ["Base Amount: $", calculateTaxMutation.data.baseAmount?.toFixed(2)] }), _jsxs("p", { children: ["Total Tax: $", calculateTaxMutation.data.totalTaxAmount?.toFixed(2)] }), _jsxs("p", { className: "font-semibold", children: ["Total Amount: $", calculateTaxMutation.data.totalAmount?.toFixed(2)] })] })] }))] })] }) }), _jsx(TabsContent, { value: "compliance", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Compliance Dashboard" }), _jsx(CardDescription, { children: "Monitor tax compliance status and requirements" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-6", children: [_jsxs("div", { className: "text-center", children: [_jsxs("div", { className: "text-3xl font-bold mb-2", children: [complianceData?.overallCompliance || 0, "%"] }), _jsx("div", { className: "text-gray-600", children: "Overall Compliance" }), _jsx(Progress, { value: complianceData?.overallCompliance || 0, className: "mt-2" })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold mb-2", children: complianceData?.forms.submitted || 0 }), _jsx("div", { className: "text-gray-600", children: "Forms Submitted" }), _jsxs("div", { className: "text-sm text-gray-500 mt-1", children: ["of ", complianceData?.forms.total || 0, " total"] })] }), _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-3xl font-bold mb-2", children: complianceData?.events.completed || 0 }), _jsx("div", { className: "text-gray-600", children: "Events Completed" }), _jsxs("div", { className: "text-sm text-gray-500 mt-1", children: ["of ", complianceData?.events.total || 0, " total"] })] })] }), ((complianceData?.forms.overdue || 0) > 0 || (complianceData?.events.overdue || 0) > 0) && (_jsxs(Alert, { className: "mt-6", children: [_jsx(AlertTriangle, { className: "h-4 w-4" }), _jsxs(AlertDescription, { children: [_jsx("strong", { children: "Attention Required:" }), " You have ", complianceData?.forms.overdue || 0, " overdue forms and ", complianceData?.events.overdue || 0, " overdue events that need immediate attention."] })] }))] })] }) })] })] }));
};
