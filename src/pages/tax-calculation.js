import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState, useCallback } from 'react';
import { PageLayout } from '../components/page-layout';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Checkbox } from '../components/ui/checkbox';
import { Calculator, FileText, Clock, TrendingUp, DollarSign, MapPin, Building, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { config } from '../lib/config';
import { apiService } from '../lib/api';
export default function TaxCalculationPage() {
    const [companies, setCompanies] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [jurisdictions, setJurisdictions] = useState([]);
    const [taxForms, setTaxForms] = useState([]);
    const [taxReturns, setTaxReturns] = useState([]);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('calculator');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [showCsvPaste, setShowCsvPaste] = useState(false);
    const [csvText, setCsvText] = useState('');
    // Calculator state
    const [selectedJurisdiction, setSelectedJurisdiction] = useState('');
    const [taxableAmount, setTaxableAmount] = useState('');
    const [selectedExemptions, setSelectedExemptions] = useState([]);
    const [calculationResult, setCalculationResult] = useState(null);
    // Multi-jurisdiction calculator state
    const [multiCalculations, setMultiCalculations] = useState([]);
    const [multiResults, setMultiResults] = useState([]);
    // Form generation state
    const [selectedForm, setSelectedForm] = useState('');
    const [formPeriod, setFormPeriod] = useState('');
    const [generatedForm, setGeneratedForm] = useState(null);
    const [formData] = useState({});
    // Load companies
    useEffect(() => {
        const loadCompanies = async () => {
            try {
                await apiService.getDemoToken('tax-calculation', ['admin', 'accountant']);
                const API = config.api.baseUrlWithoutApi || '';
                const response = await fetch(`${API}/api/companies`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
                    }
                });
                const data = await response.json();
                const list = data.data || [];
                setCompanies(list);
                const savedCompany = localStorage.getItem('tax_company') || '';
                if (savedCompany && list.find((c) => c.id === savedCompany)) {
                    setSelectedCompany(savedCompany);
                }
                else if (list.length > 0) {
                    setSelectedCompany(list[0].id);
                }
            }
            catch (error) {
                console.error('Error loading companies:', error);
                toast.error('Failed to load companies');
            }
        };
        loadCompanies();
    }, []);
    const loadJurisdictions = useCallback(async () => {
        if (!selectedCompany)
            return;
        try {
            console.log('Loading jurisdictions from tax management system...');
            // Load jurisdictions from the same system as the tax page
            const response = await fetch('/api/tax/jurisdictions', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                    'x-company-id': selectedCompany
                }
            });
            if (response.ok) {
                const data = await response.json();
                const jurisdictionsList = data?.jurisdictions || [];
                // Convert jurisdiction format to match tax-calculation expectations
                const convertedJurisdictions = jurisdictionsList.map((j) => ({
                    id: j.id,
                    name: j.name,
                    country: j.country,
                    state: j.state,
                    city: j.city,
                    taxType: j.taxType === 'VAT' ? 'SALES' : j.taxType, // Convert VAT to SALES for compatibility
                    rate: 0.15, // Default rate - in real system this would come from associated tax rates
                    minimumThreshold: 0,
                    maximumThreshold: undefined,
                    exemptions: [],
                    effectiveDate: j.createdAt?.substring(0, 10) || '2024-01-01',
                    endDate: undefined
                }));
                console.log('Loaded jurisdictions:', convertedJurisdictions);
                setJurisdictions(convertedJurisdictions);
                if (convertedJurisdictions.length > 0) {
                    toast.success(`Loaded ${convertedJurisdictions.length} jurisdictions from tax management`);
                }
                else {
                    toast.info('No custom jurisdictions found, using defaults');
                }
            }
            else {
                throw new Error('Failed to load jurisdictions');
            }
        }
        catch (error) {
            console.error('Error loading jurisdictions:', error);
            // Fallback to demo jurisdictions
            const demoJurisdictions = [
                { id: 'us-federal', name: 'US Federal', country: 'United States', taxType: 'INCOME', rate: 0.21, minimumThreshold: 0, exemptions: [], effectiveDate: '2024-01-01' },
                { id: 'us-california', name: 'California State', country: 'United States', state: 'CA', taxType: 'INCOME', rate: 0.0884, minimumThreshold: 0, exemptions: [], effectiveDate: '2024-01-01' },
                { id: 'us-ny', name: 'New York State', country: 'United States', state: 'NY', taxType: 'INCOME', rate: 0.08, minimumThreshold: 0, exemptions: [], effectiveDate: '2024-01-01' },
                { id: 'uk-corporate', name: 'UK Corporation Tax', country: 'United Kingdom', taxType: 'INCOME', rate: 0.25, minimumThreshold: 0, exemptions: [], effectiveDate: '2024-01-01' },
                { id: 'canada-federal', name: 'Canada Federal', country: 'Canada', taxType: 'INCOME', rate: 0.15, minimumThreshold: 0, exemptions: [], effectiveDate: '2024-01-01' }
            ];
            setJurisdictions(demoJurisdictions);
            toast.info('Using demo jurisdictions (failed to load custom ones)');
        }
        // Restore saved selections (after jurisdictions are loaded)
        setTimeout(() => {
            const savedJur = localStorage.getItem('tax_jurisdiction') || '';
            if (savedJur) {
                setSelectedJurisdiction(savedJur);
            }
            const savedAmt = localStorage.getItem('tax_amount') || '';
            if (savedAmt)
                setTaxableAmount(savedAmt);
            const savedEx = localStorage.getItem('tax_exemptions');
            if (savedEx)
                setSelectedExemptions(JSON.parse(savedEx));
            const savedMulti = localStorage.getItem('tax_multi');
            if (savedMulti)
                setMultiCalculations(JSON.parse(savedMulti));
        }, 100);
    }, [selectedCompany]);
    // Load jurisdictions when company changes
    useEffect(() => {
        if (selectedCompany) {
            loadJurisdictions();
        }
        if (selectedCompany)
            localStorage.setItem('tax_company', selectedCompany);
    }, [selectedCompany, loadJurisdictions]);
    const seedJurisdictions = async () => {
        if (!selectedCompany)
            return;
        try {
            setLoading(true);
            const API = import.meta.env.VITE_API_URL || '';
            const response = await fetch(`${API}/api/tax-calculation/${selectedCompany}/jurisdictions/seed`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
                }
            });
            if (!response.ok)
                throw new Error('Seed endpoint unavailable');
            toast.success('Demo jurisdictions seeded');
            await loadJurisdictions();
        }
        catch (e) {
            toast.error('Failed to seed jurisdictions');
        }
        finally {
            setLoading(false);
        }
    };
    const loadTaxForms = async () => {
        if (!selectedCompany)
            return;
        try {
            console.log('Loading tax forms from tax management system...');
            // Load tax forms from the same system as the tax page
            const response = await fetch('/api/tax/forms', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                    'x-company-id': selectedCompany
                }
            });
            if (response.ok) {
                const data = await response.json();
                const formsList = data?.forms || [];
                // Convert form format to match tax-calculation expectations
                const convertedForms = formsList.map((f) => ({
                    formId: f.formCode || f.id,
                    formName: f.formName,
                    jurisdiction: f.jurisdiction,
                    taxType: f.taxType,
                    period: f.period,
                    dueDate: f.dueDate,
                    status: f.status,
                    fields: f.fields || [],
                    calculatedAmounts: f.calculatedAmounts || {},
                    generatedAt: f.createdAt?.substring(0, 10) || '2024-01-01'
                }));
                console.log('Loaded tax forms:', convertedForms);
                setTaxForms(convertedForms);
                if (convertedForms.length > 0) {
                    toast.success(`Loaded ${convertedForms.length} tax forms from tax management`);
                }
                else {
                    toast.info('No custom tax forms found, using defaults');
                }
            }
            else {
                throw new Error('Failed to load tax forms');
            }
        }
        catch (error) {
            console.error('Error loading tax forms:', error);
            // Fallback to demo forms
            const demoForms = [
                { formId: 'form-1120', formName: 'Form 1120 - US Corporation Tax Return', jurisdiction: 'US Federal', taxType: 'INCOME', period: 'Annual', dueDate: '2025-03-15', status: 'READY', fields: [], calculatedAmounts: {}, generatedAt: '2024-01-01' },
                { formId: 'form-941', formName: 'Form 941 - Employer Quarterly Tax Return', jurisdiction: 'US Federal', taxType: 'PAYROLL', period: 'Quarterly', dueDate: '2025-01-31', status: 'READY', fields: [], calculatedAmounts: {}, generatedAt: '2024-01-01' }
            ];
            setTaxForms(demoForms);
            toast.info('Using demo tax forms (failed to load custom ones)');
        }
    };
    const loadTaxReturns = async () => {
        if (!selectedCompany)
            return;
        try {
            const API = config.api.baseUrlWithoutApi || '';
            const response = await fetch(`${API}/api/tax-calculation/${selectedCompany}/returns`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTaxReturns(data.data || []);
            }
            else {
                // Fallback: seed demo tax returns
                const demoReturns = [
                    { id: 'return-2024-1', companyId: selectedCompany, formId: 'form-1120', period: '2024', status: 'DRAFT', data: {}, calculatedTax: 15000, paidAmount: 0, balance: 15000, dueDate: '2025-03-15', filedAt: '', acceptedAt: '', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
                    { id: 'return-2024-2', companyId: selectedCompany, formId: 'form-941', period: 'Q4-2024', status: 'FILED', data: {}, calculatedTax: 2500, paidAmount: 2500, balance: 0, dueDate: '2025-01-31', filedAt: '2025-01-15', acceptedAt: '', createdAt: '2024-01-01', updatedAt: '2025-01-15' },
                    { id: 'return-2023-1', companyId: selectedCompany, formId: 'form-1120', period: '2023', status: 'FILED', data: {}, calculatedTax: 12000, paidAmount: 12000, balance: 0, dueDate: '2024-03-15', filedAt: '2024-03-10', acceptedAt: '2024-03-20', createdAt: '2023-01-01', updatedAt: '2024-03-20' }
                ];
                setTaxReturns(demoReturns);
                toast.info('Using demo tax returns');
            }
        }
        catch (error) {
            console.error('Error loading tax returns:', error);
            // Fallback: seed demo tax returns
            const demoReturns = [
                { id: 'return-2024-1', companyId: selectedCompany, formId: 'form-1120', period: '2024', status: 'DRAFT', data: {}, calculatedTax: 15000, paidAmount: 0, balance: 15000, dueDate: '2025-03-15', filedAt: '', acceptedAt: '', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
                { id: 'return-2024-2', companyId: selectedCompany, formId: 'form-941', period: 'Q4-2024', status: 'FILED', data: {}, calculatedTax: 2500, paidAmount: 2500, balance: 0, dueDate: '2025-01-31', filedAt: '2025-01-15', acceptedAt: '', createdAt: '2024-01-01', updatedAt: '2025-01-15' },
                { id: 'return-2023-1', companyId: selectedCompany, formId: 'form-1120', period: '2023', status: 'FILED', data: {}, calculatedTax: 12000, paidAmount: 12000, balance: 0, dueDate: '2024-03-15', filedAt: '2024-03-10', acceptedAt: '2024-03-20', createdAt: '2023-01-01', updatedAt: '2024-03-20' }
            ];
            setTaxReturns(demoReturns);
            toast.info('Using demo tax returns');
        }
    };
    const calculateTax = async () => {
        if (!selectedCompany || !selectedJurisdiction || !taxableAmount)
            return;
        setLoading(true);
        try {
            // Use the same tax calculation endpoint as Tax Management page
            const response = await fetch('/api/tax/calculate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                    'x-company-id': selectedCompany
                },
                body: JSON.stringify({
                    companyId: selectedCompany,
                    currency: 'USD',
                    lines: [{
                            description: `Tax calculation for ${jurisdictions.find(j => j.id === selectedJurisdiction)?.name || 'jurisdiction'}`,
                            type: 'service',
                            amount: parseFloat(taxableAmount),
                            taxExclusive: true,
                            selectedRateId: 'auto' // Use auto-matching for jurisdiction-based calculation
                        }]
                })
            });
            if (!response.ok) {
                throw new Error('Failed to calculate tax');
            }
            const data = await response.json();
            // Convert the Tax Management response format to Tax Calculation Engine format
            const calculationData = data.data || data;
            const selectedJur = jurisdictions.find(j => j.id === selectedJurisdiction);
            const result = {
                jurisdiction: selectedJur?.name || 'Unknown',
                taxType: selectedJur?.taxType || 'INCOME',
                taxableAmount: parseFloat(taxableAmount),
                taxRate: calculationData.lines?.[0]?.taxRate || 0.15,
                calculatedTax: calculationData.totalTax || 0,
                exemptions: 0, // No exemptions in current implementation
                netTax: calculationData.totalTax || 0,
                effectiveRate: calculationData.lines?.[0]?.taxRate || 0.15
            };
            setCalculationResult(result);
            localStorage.setItem('tax_jurisdiction', selectedJurisdiction);
            localStorage.setItem('tax_amount', taxableAmount);
            localStorage.setItem('tax_exemptions', JSON.stringify(selectedExemptions));
            toast.success('Tax calculation completed');
        }
        catch (error) {
            console.error('Error calculating tax:', error);
            toast.error('Failed to calculate tax');
        }
        finally {
            setLoading(false);
        }
    };
    const calculateMultiJurisdiction = async () => {
        if (!selectedCompany || multiCalculations.length === 0)
            return;
        setLoading(true);
        try {
            const API = config.api.baseUrlWithoutApi || '';
            const response = await fetch(`${API}/api/tax-calculation/${selectedCompany}/calculate-multi`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
                },
                body: JSON.stringify({
                    calculations: multiCalculations
                })
            });
            if (!response.ok) {
                throw new Error('Failed to calculate multi-jurisdiction tax');
            }
            const data = await response.json();
            setMultiResults(data.data);
            localStorage.setItem('tax_multi', JSON.stringify(multiCalculations));
            toast.success('Multi-jurisdiction tax calculation completed');
        }
        catch (error) {
            console.error('Error calculating multi-jurisdiction tax:', error);
            toast.error('Failed to calculate multi-jurisdiction tax');
        }
        finally {
            setLoading(false);
        }
    };
    const generateTaxForm = async () => {
        if (!selectedCompany || !selectedForm || !formPeriod)
            return;
        setLoading(true);
        try {
            const API = config.api.baseUrlWithoutApi || '';
            const response = await fetch(`${API}/api/tax-calculation/${selectedCompany}/forms/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
                },
                body: JSON.stringify({
                    formId: selectedForm,
                    period: formPeriod,
                    data: formData
                })
            });
            if (!response.ok) {
                throw new Error('Failed to generate tax form');
            }
            const data = await response.json();
            setGeneratedForm(data.data);
            toast.success('Tax form generated successfully');
        }
        catch (error) {
            console.error('Error generating tax form:', error);
            toast.error('Failed to generate tax form');
        }
        finally {
            setLoading(false);
        }
    };
    const addMultiCalculation = () => {
        setMultiCalculations([...multiCalculations, {
                jurisdictionId: '',
                taxableAmount: 0,
                exemptions: []
            }]);
    };
    const updateMultiCalculation = (index, field, value) => {
        const updated = [...multiCalculations];
        updated[index] = { ...updated[index], [field]: value };
        setMultiCalculations(updated);
    };
    const removeMultiCalculation = (index) => {
        setMultiCalculations(multiCalculations.filter((_, i) => i !== index));
    };
    const importFromCsv = () => {
        const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        const parsed = lines.map(l => {
            const [jurisdictionId, amountStr, exStr] = l.split(',');
            return {
                jurisdictionId: jurisdictionId || '',
                taxableAmount: parseFloat(amountStr) || 0,
                exemptions: (exStr || '').split('|').map(s => s.trim()).filter(Boolean)
            };
        });
        setMultiCalculations(parsed);
        localStorage.setItem('tax_multi', JSON.stringify(parsed));
        setShowCsvPaste(false);
        setCsvText('');
    };
    const markReturnFiled = async (id) => {
        try {
            const API = import.meta.env.VITE_API_URL || '';
            const resp = await fetch(`${API}/api/tax-calculation/${selectedCompany}/returns/${id}/file`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
                }
            });
            if (!resp.ok)
                throw new Error('Failed');
            toast.success('Return marked as filed');
            await loadTaxReturns();
        }
        catch (e) {
            toast.error('Failed to mark as filed');
        }
    };
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };
    const formatPercent = (value) => {
        return `${(value * 100).toFixed(2)}%`;
    };
    const getStatusColor = (status) => {
        switch (status) {
            case 'DRAFT': return 'bg-yellow-100 text-yellow-800';
            case 'READY': return 'bg-blue-100 text-blue-800';
            case 'FILED': return 'bg-green-100 text-green-800';
            case 'ACCEPTED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };
    const getTaxTypeIcon = (taxType) => {
        switch (taxType) {
            case 'INCOME': return _jsx(TrendingUp, { className: "h-4 w-4" });
            case 'SALES': return _jsx(DollarSign, { className: "h-4 w-4" });
            case 'PAYROLL': return _jsx(Building, { className: "h-4 w-4" });
            case 'PROPERTY': return _jsx(MapPin, { className: "h-4 w-4" });
            default: return _jsx(Calculator, { className: "h-4 w-4" });
        }
    };
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "container mx-auto p-6 space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold", children: "Tax Calculation Engine" }), _jsx("p", { className: "text-muted-foreground", children: "Calculate taxes, generate forms, and manage compliance" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsxs(Button, { variant: "outline", onClick: loadTaxForms, children: [_jsx(FileText, { className: "h-4 w-4 mr-2" }), "Load Forms"] }), _jsxs(Button, { variant: "outline", onClick: loadTaxReturns, children: [_jsx(Clock, { className: "h-4 w-4 mr-2" }), "Load Returns"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Company Selection" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "company", children: "Company" }), _jsxs(Select, { value: selectedCompany, onValueChange: setSelectedCompany, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select company" }) }), _jsx(SelectContent, { children: companies.map((company) => (_jsx(SelectItem, { value: company.id, children: company.name }, company.id))) })] })] }), _jsxs("div", { className: "flex items-end gap-2", children: [_jsxs(Button, { onClick: loadJurisdictions, disabled: !selectedCompany, children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Load Jurisdictions"] }), _jsxs(Button, { variant: "outline", onClick: () => window.open('/dashboard/tax', '_blank'), title: "Open Tax Management page to create/manage jurisdictions (go to Jurisdictions tab)", children: [_jsx(MapPin, { className: "h-4 w-4 mr-2" }), "Manage Jurisdictions"] }), jurisdictions.length === 0 && (_jsx(Button, { variant: "outline", onClick: seedJurisdictions, disabled: loading || !selectedCompany, children: "Seed Demo Jurisdictions" }))] })] }) })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, children: [_jsxs(TabsList, { className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "calculator", children: "Tax Calculator" }), _jsx(TabsTrigger, { value: "multi-calculator", children: "Multi-Jurisdiction" }), _jsx(TabsTrigger, { value: "forms", children: "Tax Forms" }), _jsx(TabsTrigger, { value: "returns", children: "Tax Returns" })] }), _jsx(TabsContent, { value: "calculator", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Tax Calculator" }), _jsx(CardDescription, { children: "Calculate tax for a single jurisdiction" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "jurisdiction", children: "Jurisdiction" }), _jsxs(Select, { value: selectedJurisdiction, onValueChange: setSelectedJurisdiction, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select jurisdiction" }) }), _jsx(SelectContent, { children: jurisdictions.map((jurisdiction) => (_jsx(SelectItem, { value: jurisdiction.id, children: _jsxs("div", { className: "flex items-center gap-2", children: [getTaxTypeIcon(jurisdiction.taxType), _jsx("span", { children: jurisdiction.name }), _jsx(Badge, { variant: "outline", children: formatPercent(jurisdiction.rate) })] }) }, jurisdiction.id))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "taxable-amount", children: "Taxable Amount" }), _jsx(Input, { id: "taxable-amount", type: "number", value: taxableAmount, onChange: (e) => setTaxableAmount(e.target.value), placeholder: "Enter taxable amount" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Exemptions" }), _jsx("div", { className: "space-y-2", children: selectedJurisdiction && jurisdictions.find(j => j.id === selectedJurisdiction)?.exemptions.map((exemption) => (_jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Checkbox, { id: exemption, checked: selectedExemptions.includes(exemption), onCheckedChange: (checked) => {
                                                                                if (checked) {
                                                                                    setSelectedExemptions([...selectedExemptions, exemption]);
                                                                                }
                                                                                else {
                                                                                    setSelectedExemptions(selectedExemptions.filter(e => e !== exemption));
                                                                                }
                                                                            } }), _jsx(Label, { htmlFor: exemption, className: "text-sm", children: exemption.replace(/_/g, ' ').toUpperCase() })] }, exemption))) })] }), _jsxs(Button, { onClick: calculateTax, disabled: loading || !selectedJurisdiction || !taxableAmount, children: [loading ? (_jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" })) : (_jsx(Calculator, { className: "h-4 w-4 mr-2" })), "Calculate Tax"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Calculation Result" }) }), _jsx(CardContent, { children: calculationResult ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm text-muted-foreground", children: "Jurisdiction" }), _jsx("p", { className: "font-medium", children: calculationResult.jurisdiction })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm text-muted-foreground", children: "Tax Type" }), _jsx("p", { className: "font-medium", children: calculationResult.taxType })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm text-muted-foreground", children: "Taxable Amount" }), _jsx("p", { className: "font-medium", children: formatCurrency(calculationResult.taxableAmount) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm text-muted-foreground", children: "Tax Rate" }), _jsx("p", { className: "font-medium", children: formatPercent(calculationResult.taxRate) })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { className: "text-sm text-muted-foreground", children: "Calculated Tax" }), _jsx("p", { className: "font-medium", children: formatCurrency(calculationResult.calculatedTax) })] }), _jsxs("div", { children: [_jsx(Label, { className: "text-sm text-muted-foreground", children: "Exemptions" }), _jsx("p", { className: "font-medium", children: formatCurrency(calculationResult.exemptions) })] })] }), _jsxs("div", { className: "border-t pt-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Label, { className: "text-lg font-semibold", children: "Net Tax" }), _jsx("p", { className: "text-2xl font-bold text-primary", children: formatCurrency(calculationResult.netTax) })] }), _jsxs("div", { className: "flex justify-between items-center", children: [_jsx(Label, { className: "text-sm text-muted-foreground", children: "Effective Rate" }), _jsx("p", { className: "text-sm font-medium", children: formatPercent(calculationResult.effectiveRate) })] })] })] })) : (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Calculator, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No calculation result yet" })] })) })] })] }) }), _jsx(TabsContent, { value: "multi-calculator", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Multi-Jurisdiction Tax Calculator" }), _jsx(CardDescription, { children: "Calculate taxes across multiple jurisdictions" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Calculations" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { onClick: addMultiCalculation, size: "sm", children: "Add Jurisdiction" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setShowCsvPaste(v => !v), children: showCsvPaste ? 'Hide CSV' : 'CSV Paste' })] })] }), showCsvPaste && (_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "CSV lines: jurisdictionId,amount,exempt1|exempt2" }), _jsx(Textarea, { value: csvText, onChange: e => setCsvText(e.target.value), placeholder: "JURIS-1,1000,small_business|startup\\nJURIS-2,2500," }), _jsx("div", { className: "flex justify-end", children: _jsx(Button, { size: "sm", onClick: importFromCsv, children: "Import" }) })] })), _jsx("div", { className: "space-y-4", children: multiCalculations.map((calc, index) => (_jsx(Card, { children: _jsx(CardContent, { className: "pt-4", children: _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-4 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Jurisdiction" }), _jsxs(Select, { value: calc.jurisdictionId, onValueChange: (value) => updateMultiCalculation(index, 'jurisdictionId', value), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select jurisdiction" }) }), _jsx(SelectContent, { children: jurisdictions.map((jurisdiction) => (_jsx(SelectItem, { value: jurisdiction.id, children: jurisdiction.name }, jurisdiction.id))) })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Taxable Amount" }), _jsx(Input, { type: "number", value: calc.taxableAmount, onChange: (e) => updateMultiCalculation(index, 'taxableAmount', parseFloat(e.target.value) || 0), placeholder: "Enter amount" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Exemptions" }), _jsx(Input, { placeholder: "Comma-separated", onChange: (e) => updateMultiCalculation(index, 'exemptions', e.target.value.split(',').map(s => s.trim())) })] }), _jsx("div", { className: "flex items-end", children: _jsx(Button, { variant: "outline", size: "sm", onClick: () => removeMultiCalculation(index), children: "Remove" }) })] }) }) }, index))) }), multiCalculations.length > 0 && (_jsxs(Button, { onClick: calculateMultiJurisdiction, disabled: loading, className: "w-full", children: [loading ? (_jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" })) : (_jsx(Calculator, { className: "h-4 w-4 mr-2" })), "Calculate All Jurisdictions"] })), multiResults.length > 0 && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Multi-Jurisdiction Results" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [multiResults.map((result, index) => (_jsxs("div", { className: "flex justify-between items-center p-4 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: result.jurisdiction }), _jsx("p", { className: "text-sm text-muted-foreground", children: result.taxType })] }), _jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold", children: formatCurrency(result.netTax) }), _jsx("p", { className: "text-sm text-muted-foreground", children: formatPercent(result.effectiveRate) })] })] }, index))), _jsx("div", { className: "border-t pt-4", children: _jsxs("div", { className: "flex justify-between items-center", children: [_jsx("p", { className: "text-lg font-semibold", children: "Total Tax" }), _jsx("p", { className: "text-2xl font-bold text-primary", children: formatCurrency(multiResults.reduce((sum, result) => sum + result.netTax, 0)) })] }) })] }) })] }))] })] }) }), _jsx(TabsContent, { value: "forms", className: "space-y-4", children: _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Generate Tax Form" }), _jsx(CardDescription, { children: "Generate and fill tax forms automatically" })] }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "form", children: "Tax Form" }), _jsxs(Select, { value: selectedForm, onValueChange: setSelectedForm, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select tax form" }) }), _jsx(SelectContent, { children: taxForms.map((form) => (_jsx(SelectItem, { value: form.formId, children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4" }), _jsx("span", { children: form.formName }), _jsx(Badge, { variant: "outline", children: form.jurisdiction })] }) }, form.formId))) })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "period", children: "Period" }), _jsx(Input, { id: "period", type: "month", value: formPeriod, onChange: (e) => setFormPeriod(e.target.value), placeholder: "Select period" })] }), _jsxs(Button, { onClick: generateTaxForm, disabled: loading || !selectedForm || !formPeriod, children: [loading ? (_jsx(RefreshCw, { className: "h-4 w-4 mr-2 animate-spin" })) : (_jsx(FileText, { className: "h-4 w-4 mr-2" })), "Generate Form"] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Generated Form" }) }), _jsx(CardContent, { children: generatedForm ? (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h3", { className: "font-semibold", children: generatedForm.formName }), _jsx(Badge, { className: getStatusColor(generatedForm.status), children: generatedForm.status })] }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Period: ", generatedForm.period, " | Due: ", new Date(generatedForm.dueDate).toLocaleDateString()] }), _jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium", children: "Form Fields" }), generatedForm.fields.map((field) => (_jsxs("div", { className: "flex justify-between items-center p-2 border rounded", children: [_jsx("span", { className: "text-sm", children: field.fieldName }), _jsx("span", { className: "font-medium", children: field.calculated && generatedForm.calculatedAmounts[field.fieldId] !== undefined
                                                                                ? formatCurrency(generatedForm.calculatedAmounts[field.fieldId])
                                                                                : field.value || 'N/A' })] }, field.fieldId)))] })] })) : (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(FileText, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No form generated yet" })] })) })] })] }) }), _jsx(TabsContent, { value: "returns", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Tax Returns" }), _jsx(CardDescription, { children: "Manage and track tax returns" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "flex items-center justify-between mb-4", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Label, { children: "Status" }), _jsxs(Select, { value: statusFilter, onValueChange: setStatusFilter, children: [_jsx(SelectTrigger, { className: "w-40", children: _jsx(SelectValue, { placeholder: "All" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "ALL", children: "All" }), _jsx(SelectItem, { value: "DRAFT", children: "Draft" }), _jsx(SelectItem, { value: "READY", children: "Ready" }), _jsx(SelectItem, { value: "FILED", children: "Filed" }), _jsx(SelectItem, { value: "ACCEPTED", children: "Accepted" }), _jsx(SelectItem, { value: "REJECTED", children: "Rejected" })] })] })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Button, { variant: "outline", onClick: loadTaxReturns, children: [_jsx(RefreshCw, { className: "h-4 w-4 mr-2" }), "Refresh"] }) })] }), taxReturns.filter(r => statusFilter === 'ALL' || r.status === statusFilter).length > 0 ? (_jsx("div", { className: "space-y-4", children: taxReturns.filter(r => statusFilter === 'ALL' || r.status === statusFilter).map((taxReturn) => (_jsxs("div", { className: "flex justify-between items-center p-4 border rounded-lg", children: [_jsxs("div", { children: [_jsx("p", { className: "font-medium", children: taxReturn.formId }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Period: ", taxReturn.period, " | Due: ", new Date(taxReturn.dueDate).toLocaleDateString()] })] }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsxs("div", { className: "text-right", children: [_jsx("p", { className: "font-semibold", children: formatCurrency(taxReturn.calculatedTax) }), _jsxs("p", { className: "text-sm text-muted-foreground", children: ["Balance: ", formatCurrency(taxReturn.balance)] })] }), _jsx(Badge, { className: getStatusColor(taxReturn.status), children: taxReturn.status }), taxReturn.status !== 'FILED' && (_jsx(Button, { size: "sm", onClick: () => markReturnFiled(taxReturn.id), children: "Mark Filed" }))] })] }, taxReturn.id))) })) : (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(Clock, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No tax returns found" })] }))] })] }) })] })] }) }));
}
