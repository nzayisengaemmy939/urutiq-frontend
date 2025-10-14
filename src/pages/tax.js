import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { PageLayout } from "../components/page-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { SegmentedTabs } from "../components/ui/segmented-tabs";
import { DollarSign, Calculator, Loader2, MapPin, FileText } from "lucide-react";
import { apiService } from "../lib/api";
import { toast } from "../components/ui/use-toast";
import { Toaster } from "../components/ui/toaster";
export default function TaxPage() {
    const [rates, setRates] = useState([]);
    const [jurisdictions, setJurisdictions] = useState([]);
    const [taxForms, setTaxForms] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [calculating, setCalculating] = useState(false);
    const [creatingJurisdiction, setCreatingJurisdiction] = useState(false);
    const [creatingForm, setCreatingForm] = useState(false);
    const [companyId, setCompanyId] = useState("cmg7trbsf00097kb7rrpy9in1");
    // Create rate form
    const [rateName, setRateName] = useState("");
    const [rateValue, setRateValue] = useState(0.15);
    const [appliesTo, setAppliesTo] = useState("all");
    // Jurisdiction form
    const [jurisdictionName, setJurisdictionName] = useState("");
    const [jurisdictionCountry, setJurisdictionCountry] = useState("");
    const [jurisdictionState, setJurisdictionState] = useState("");
    const [jurisdictionCity, setJurisdictionCity] = useState("");
    const [jurisdictionTaxType, setJurisdictionTaxType] = useState("VAT");
    const [jurisdictionDescription, setJurisdictionDescription] = useState("");
    // Tax form state
    const [formName, setFormName] = useState("");
    const [formCode, setFormCode] = useState("");
    const [formJurisdiction, setFormJurisdiction] = useState("");
    const [formTaxType, setFormTaxType] = useState("INCOME");
    const [formPeriod, setFormPeriod] = useState("Annual");
    const [formDueDate, setFormDueDate] = useState("");
    const [formDescription, setFormDescription] = useState("");
    // Calculator form
    const [calcLines, setCalcLines] = useState([
        { description: 'Sample item', type: 'product', amount: 100, taxExclusive: true }
    ]);
    const [calcResult, setCalcResult] = useState(null);
    const refreshRates = async () => {
        setLoading(true);
        try {
            console.log('Fetching tax rates for company:', companyId);
            const resp = await apiService.listTaxRates({ companyId: companyId || undefined, limit: 50 });
            console.log('Tax rates response:', resp);
            // Handle different response structures
            let ratesData = [];
            if (Array.isArray(resp)) {
                ratesData = resp;
            }
            else if (resp?.rates && Array.isArray(resp.rates)) {
                ratesData = resp.rates;
            }
            else if (resp?.data?.rates && Array.isArray(resp.data.rates)) {
                ratesData = resp.data.rates;
            }
            else if (resp?.data && Array.isArray(resp.data)) {
                ratesData = resp.data;
            }
            console.log('Processed rates data:', ratesData);
            setRates(ratesData);
        }
        catch (e) {
            console.error('Error fetching tax rates:', e);
        }
        finally {
            setLoading(false);
        }
    };
    const refreshTaxForms = async () => {
        try {
            console.log('Fetching tax forms for company:', companyId);
            const response = await fetch('/api/tax/forms', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                    'x-company-id': companyId || 'cmg7trbsf00097kb7rrpy9in1'
                }
            });
            const data = await response.json();
            console.log('Tax forms response:', data);
            setTaxForms(data?.forms || []);
        }
        catch (e) {
            console.error('Error fetching tax forms:', e);
        }
    };
    const createTaxForm = async () => {
        if (!formName || !formCode || !formJurisdiction || !formTaxType) {
            toast({
                title: "Validation Error",
                description: "Form name, code, jurisdiction, and tax type are required",
                variant: "destructive",
            });
            return;
        }
        setCreatingForm(true);
        try {
            const cid = companyId || 'company_demo';
            console.log('Creating tax form:', {
                companyId: cid,
                formName,
                formCode,
                jurisdiction: formJurisdiction,
                taxType: formTaxType,
                period: formPeriod,
                dueDate: formDueDate,
                description: formDescription
            });
            const response = await fetch('/api/tax/forms', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                    'x-company-id': cid
                },
                body: JSON.stringify({
                    companyId: cid,
                    formName,
                    formCode,
                    jurisdiction: formJurisdiction,
                    taxType: formTaxType,
                    period: formPeriod,
                    dueDate: formDueDate,
                    description: formDescription
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }
            const result = await response.json();
            console.log('Tax form created successfully:', result);
            toast({
                title: "Success!",
                description: `Tax form "${formName}" created successfully`,
                variant: "default",
            });
            // Reset form
            setFormName("");
            setFormCode("");
            setFormJurisdiction("");
            setFormTaxType("INCOME");
            setFormPeriod("Annual");
            setFormDueDate("");
            setFormDescription("");
            // Refresh forms list
            await refreshTaxForms();
        }
        catch (e) {
            console.error('Error creating tax form:', e);
            const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
            toast({
                title: "Error",
                description: `Failed to create tax form: ${errorMessage}`,
                variant: "destructive",
            });
        }
        finally {
            setCreatingForm(false);
        }
    };
    useEffect(() => {
        refreshRates();
        refreshJurisdictions();
        refreshTaxForms();
    }, []);
    const createRate = async () => {
        if (!rateName) {
            toast({
                title: "Validation Error",
                description: "Tax rate name is required",
                variant: "destructive",
            });
            return;
        }
        setCreating(true);
        try {
            const cid = companyId || 'company_demo';
            console.log('Creating tax rate:', { companyId: cid, taxName: rateName, rate: rateValue, appliesTo });
            const result = await apiService.createTaxRate({
                companyId: cid,
                taxName: rateName,
                rate: rateValue,
                appliesTo
            });
            console.log('Tax rate created successfully:', result);
            // Show success notification
            toast({
                title: "Success!",
                description: `Tax rate "${rateName}" created successfully`,
                variant: "default",
            });
            // Reset form
            setRateName("");
            setRateValue(0.15);
            setAppliesTo("all");
            // Refresh the rates list
            await refreshRates();
        }
        catch (e) {
            console.error('Error creating tax rate:', e);
            // Show error notification
            toast({
                title: "Error",
                description: "Failed to create tax rate. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setCreating(false);
        }
    };
    const refreshJurisdictions = async () => {
        try {
            console.log('Fetching jurisdictions for company:', companyId);
            // Use direct fetch since API methods are not available
            const response = await fetch('/api/tax/jurisdictions', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                    'x-company-id': companyId || 'cmg7trbsf00097kb7rrpy9in1'
                }
            });
            const data = await response.json();
            console.log('Jurisdictions response:', data);
            setJurisdictions(data?.jurisdictions || []);
        }
        catch (e) {
            console.error('Error fetching jurisdictions:', e);
        }
    };
    const createJurisdiction = async () => {
        if (!jurisdictionName || !jurisdictionCountry || !jurisdictionTaxType) {
            toast({
                title: "Validation Error",
                description: "Name, country, and tax type are required",
                variant: "destructive",
            });
            return;
        }
        setCreatingJurisdiction(true);
        try {
            const cid = companyId || 'company_demo';
            console.log('Creating jurisdiction:', {
                companyId: cid,
                name: jurisdictionName,
                country: jurisdictionCountry,
                state: jurisdictionState,
                city: jurisdictionCity,
                taxType: jurisdictionTaxType,
                description: jurisdictionDescription
            });
            const response = await fetch('/api/tax/jurisdictions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
                    'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
                    'x-company-id': cid
                },
                body: JSON.stringify({
                    companyId: cid,
                    name: jurisdictionName,
                    country: jurisdictionCountry,
                    state: jurisdictionState || undefined,
                    city: jurisdictionCity || undefined,
                    taxType: jurisdictionTaxType,
                    description: jurisdictionDescription
                })
            });
            const result = await response.json();
            console.log('Jurisdiction created successfully:', result);
            // Show success notification
            toast({
                title: "Success!",
                description: `Jurisdiction "${jurisdictionName}" created successfully`,
                variant: "default",
            });
            // Reset form
            setJurisdictionName("");
            setJurisdictionCountry("");
            setJurisdictionState("");
            setJurisdictionCity("");
            setJurisdictionTaxType("VAT");
            setJurisdictionDescription("");
            // Refresh jurisdictions list
            await refreshJurisdictions();
        }
        catch (e) {
            console.error('Error creating jurisdiction:', e);
            // Show error notification
            toast({
                title: "Error",
                description: "Failed to create jurisdiction. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setCreatingJurisdiction(false);
        }
    };
    const addCalcLine = () => {
        setCalcLines(prev => [...prev, { type: 'product', amount: 0, taxExclusive: true }]);
    };
    const runCalculation = async () => {
        setCalculating(true);
        try {
            const cid = companyId || 'company_demo';
            const resp = await apiService.calculateTax({ companyId: cid, currency: 'USD', lines: calcLines });
            setCalcResult(resp?.data ?? resp);
            // Show success notification
            toast({
                title: "Calculation Complete",
                description: "Tax calculation completed successfully",
                variant: "default",
            });
        }
        catch (e) {
            console.error('Error calculating tax:', e);
            // Show error notification
            toast({
                title: "Calculation Error",
                description: "Failed to calculate tax. Please try again.",
                variant: "destructive",
            });
        }
        finally {
            setCalculating(false);
        }
    };
    return (_jsxs(PageLayout, { children: [_jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Tax" }), _jsx("p", { className: "text-muted-foreground", children: "Manage tax rates and calculate tax for transactions" })] }) }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Context" }), _jsx(CardDescription, { children: "Optionally provide a Company ID (blank uses demo)" })] }), _jsxs(CardContent, { className: "grid md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Company ID" }), _jsx(Input, { value: companyId, onChange: e => setCompanyId(e.target.value), placeholder: "company id" })] }), _jsx("div", { className: "flex items-end", children: _jsx(Button, { variant: "outline", onClick: refreshRates, disabled: loading, children: "Refresh Rates" }) })] })] }), _jsx(SegmentedTabs, { tabs: [
                            { id: 'rates', label: 'Rates' },
                            { id: 'calculator', label: 'Calculator' },
                        ], value: 'rates', onChange: () => { }, className: "mb-4" }), _jsxs(Tabs, { defaultValue: "rates", className: "space-y-4", variant: "underline", children: [_jsxs(TabsList, { variant: "underline", children: [_jsx(TabsTrigger, { value: "rates", icon: _jsx(DollarSign, { className: "w-4 h-4" }), badge: rates.length, children: "Rates" }), _jsx(TabsTrigger, { value: "jurisdictions", icon: _jsx(MapPin, { className: "w-4 h-4" }), badge: jurisdictions.length, children: "Jurisdictions" }), _jsx(TabsTrigger, { value: "forms", icon: _jsx(FileText, { className: "w-4 h-4" }), badge: taxForms.length, children: "Forms" }), _jsx(TabsTrigger, { value: "calculator", icon: _jsx(Calculator, { className: "w-4 h-4" }), children: "Calculator" })] }), _jsxs(TabsContent, { value: "rates", className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Create Rate" }) }), _jsxs(CardContent, { className: "grid md:grid-cols-4 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Name" }), _jsx(Input, { value: rateName, onChange: e => setRateName(e.target.value), placeholder: "VAT 15%" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Rate (0-1)" }), _jsx(Input, { type: "number", step: "0.01", value: rateValue, onChange: e => setRateValue(parseFloat(e.target.value || '0')) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Applies To" }), _jsxs("select", { value: appliesTo, onChange: e => setAppliesTo(e.target.value), className: "w-full border rounded h-10 px-3", children: [_jsx("option", { value: "all", children: "All" }), _jsx("option", { value: "products", children: "Products" }), _jsx("option", { value: "services", children: "Services" })] })] }), _jsx("div", { className: "flex items-end", children: _jsxs(Button, { onClick: createRate, disabled: creating, children: [creating && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), creating ? 'Creating...' : 'Create'] }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Existing Rates" }) }), _jsxs(CardContent, { className: "space-y-2", children: [rates.length === 0 && _jsx("div", { className: "text-sm text-muted-foreground", children: "No rates" }), rates.map((r) => (_jsxs("div", { className: "flex items-center justify-between border rounded p-3", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: r.taxName }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [r.appliesTo, " \u2022 ", (r.rate * 100).toFixed(2), "%"] })] }), _jsx(Badge, { variant: r.isActive ? 'default' : 'secondary', children: r.isActive ? 'Active' : 'Inactive' })] }, r.id)))] })] })] }), _jsxs(TabsContent, { value: "jurisdictions", className: "space-y-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Create Jurisdiction" }), _jsx(CardDescription, { children: "Add a new tax jurisdiction for your business" })] }), _jsxs(CardContent, { className: "grid md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Name *" }), _jsx(Input, { value: jurisdictionName, onChange: e => setJurisdictionName(e.target.value), placeholder: "e.g., California State Tax" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Country *" }), _jsx(Input, { value: jurisdictionCountry, onChange: e => setJurisdictionCountry(e.target.value), placeholder: "e.g., United States" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "State/Province" }), _jsx(Input, { value: jurisdictionState, onChange: e => setJurisdictionState(e.target.value), placeholder: "e.g., California" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "City" }), _jsx(Input, { value: jurisdictionCity, onChange: e => setJurisdictionCity(e.target.value), placeholder: "e.g., San Francisco" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Tax Type *" }), _jsxs("select", { value: jurisdictionTaxType, onChange: e => setJurisdictionTaxType(e.target.value), className: "w-full border rounded h-10 px-3", children: [_jsx("option", { value: "VAT", children: "VAT" }), _jsx("option", { value: "GST", children: "GST" }), _jsx("option", { value: "SALES", children: "Sales Tax" }), _jsx("option", { value: "INCOME", children: "Income Tax" }), _jsx("option", { value: "PAYROLL", children: "Payroll Tax" }), _jsx("option", { value: "PROPERTY", children: "Property Tax" })] })] }), _jsx("div", { className: "flex items-end", children: _jsxs(Button, { onClick: createJurisdiction, disabled: creatingJurisdiction, children: [creatingJurisdiction && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), creatingJurisdiction ? 'Creating...' : 'Create'] }) }), _jsxs("div", { className: "md:col-span-3 space-y-2", children: [_jsx(Label, { children: "Description" }), _jsx(Input, { value: jurisdictionDescription, onChange: e => setJurisdictionDescription(e.target.value), placeholder: "Optional description of this jurisdiction" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Existing Jurisdictions" }) }), _jsxs(CardContent, { className: "space-y-2", children: [jurisdictions.length === 0 && _jsx("div", { className: "text-sm text-muted-foreground", children: "No jurisdictions" }), jurisdictions.map((jurisdiction) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: jurisdiction.name }), _jsxs("div", { className: "text-sm text-muted-foreground", children: [jurisdiction.country, jurisdiction.state && `, ${jurisdiction.state}`, jurisdiction.city && `, ${jurisdiction.city}`] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Type: ", jurisdiction.taxType, jurisdiction.description && ` • ${jurisdiction.description}`] })] }), _jsx(Badge, { variant: jurisdiction.isActive ? "default" : "secondary", children: jurisdiction.isActive ? "Active" : "Inactive" })] }, jurisdiction.id)))] })] })] }), _jsxs(TabsContent, { value: "forms", className: "space-y-4", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Create Tax Form" }), _jsx(CardDescription, { children: "Add a new tax form template for your business" })] }), _jsxs(CardContent, { className: "grid md:grid-cols-3 gap-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Form Name *" }), _jsx(Input, { value: formName, onChange: e => setFormName(e.target.value), placeholder: "e.g., Form 1120 - Corporation Tax Return" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Form Code *" }), _jsx(Input, { value: formCode, onChange: e => setFormCode(e.target.value), placeholder: "e.g., 1120" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Jurisdiction *" }), _jsxs("select", { value: formJurisdiction, onChange: e => setFormJurisdiction(e.target.value), className: "w-full border rounded h-10 px-3", children: [_jsx("option", { value: "", children: "Select jurisdiction" }), jurisdictions.map(jurisdiction => (_jsxs("option", { value: jurisdiction.name, children: [jurisdiction.name, " (", jurisdiction.country, ")"] }, jurisdiction.id)))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Tax Type *" }), _jsxs("select", { value: formTaxType, onChange: e => setFormTaxType(e.target.value), className: "w-full border rounded h-10 px-3", children: [_jsx("option", { value: "INCOME", children: "Income Tax" }), _jsx("option", { value: "SALES", children: "Sales Tax" }), _jsx("option", { value: "PAYROLL", children: "Payroll Tax" }), _jsx("option", { value: "PROPERTY", children: "Property Tax" }), _jsx("option", { value: "VAT", children: "VAT" }), _jsx("option", { value: "GST", children: "GST" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Period" }), _jsxs("select", { value: formPeriod, onChange: e => setFormPeriod(e.target.value), className: "w-full border rounded h-10 px-3", children: [_jsx("option", { value: "Annual", children: "Annual" }), _jsx("option", { value: "Quarterly", children: "Quarterly" }), _jsx("option", { value: "Monthly", children: "Monthly" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { children: "Due Date" }), _jsx(Input, { type: "date", value: formDueDate, onChange: e => setFormDueDate(e.target.value) })] }), _jsxs("div", { className: "md:col-span-3 space-y-2", children: [_jsx(Label, { children: "Description" }), _jsx(Input, { value: formDescription, onChange: e => setFormDescription(e.target.value), placeholder: "Optional description of this tax form" })] }), _jsx("div", { className: "md:col-span-3 flex justify-start", children: _jsxs(Button, { onClick: createTaxForm, disabled: creatingForm, children: [creatingForm && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), creatingForm ? 'Creating...' : 'Create Form'] }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Existing Tax Forms" }) }), _jsxs(CardContent, { className: "space-y-2", children: [taxForms.length === 0 && _jsx("div", { className: "text-sm text-muted-foreground", children: "No tax forms" }), taxForms.map((form) => (_jsxs("div", { className: "flex items-center justify-between p-3 border rounded", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: form.formName }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Code: ", form.formCode, " \u2022 ", form.jurisdiction, " \u2022 ", form.taxType] }), _jsxs("div", { className: "text-xs text-muted-foreground", children: ["Period: ", form.period, form.dueDate && ` • Due: ${form.dueDate}`, form.description && ` • ${form.description}`] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Badge, { variant: form.status === 'READY' ? "default" : form.status === 'DRAFT' ? "secondary" : "outline", children: form.status }), _jsx(Badge, { variant: form.isActive ? "default" : "secondary", children: form.isActive ? "Active" : "Inactive" })] })] }, form.id)))] })] })] }), _jsxs(TabsContent, { value: "calculator", className: "space-y-4", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Lines" }) }), _jsxs(CardContent, { className: "space-y-3", children: [calcLines.map((l, idx) => (_jsxs("div", { className: "grid md:grid-cols-5 gap-2 items-end", children: [_jsxs("div", { children: [_jsx(Label, { children: "Description" }), _jsx(Input, { value: l.description || '', onChange: e => {
                                                                            const v = e.target.value;
                                                                            setCalcLines(prev => prev.map((p, i) => i === idx ? { ...p, description: v } : p));
                                                                        } })] }), _jsxs("div", { children: [_jsx(Label, { children: "Type" }), _jsxs("select", { value: l.type, onChange: e => setCalcLines(prev => prev.map((p, i) => i === idx ? { ...p, type: e.target.value } : p)), className: "w-full border rounded h-10 px-3", children: [_jsx("option", { value: "product", children: "Product" }), _jsx("option", { value: "service", children: "Service" })] })] }), _jsxs("div", { children: [_jsx(Label, { children: "Amount" }), _jsx(Input, { type: "number", step: "0.01", value: l.amount, onChange: e => setCalcLines(prev => prev.map((p, i) => i === idx ? { ...p, amount: parseFloat(e.target.value || '0') } : p)) })] }), _jsxs("div", { children: [_jsx(Label, { children: "Tax Rate" }), _jsxs("select", { value: l.selectedRateId || 'auto', onChange: e => {
                                                                            const value = e.target.value;
                                                                            if (value === 'auto') {
                                                                                setCalcLines(prev => prev.map((p, i) => i === idx ? { ...p, selectedRateId: undefined, manualRate: undefined } : p));
                                                                            }
                                                                            else if (value === 'manual') {
                                                                                setCalcLines(prev => prev.map((p, i) => i === idx ? { ...p, selectedRateId: 'manual', manualRate: 0.15 } : p));
                                                                            }
                                                                            else {
                                                                                const selectedRate = rates.find(r => r.id === value);
                                                                                setCalcLines(prev => prev.map((p, i) => i === idx ? { ...p, selectedRateId: value, manualRate: selectedRate?.rate } : p));
                                                                            }
                                                                        }, className: "w-full border rounded h-10 px-3", children: [_jsx("option", { value: "auto", children: "Auto (Match by Type)" }), rates.map(rate => (_jsxs("option", { value: rate.id, children: [rate.taxName, " (", (rate.rate * 100).toFixed(1), "%) - ", rate.appliesTo] }, rate.id))), _jsx("option", { value: "manual", children: "Manual Rate" })] }), l.selectedRateId === 'manual' && (_jsx(Input, { type: "number", step: "0.01", value: l.manualRate ?? '', onChange: e => setCalcLines(prev => prev.map((p, i) => i === idx ? { ...p, manualRate: e.target.value === '' ? undefined : parseFloat(e.target.value) } : p)), placeholder: "Enter rate (0.15 = 15%)", className: "mt-1" }))] }), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx("input", { type: "checkbox", checked: l.taxExclusive, onChange: e => setCalcLines(prev => prev.map((p, i) => i === idx ? { ...p, taxExclusive: e.target.checked } : p)) }), _jsx(Label, { children: "Tax Exclusive" })] })] }, idx))), _jsxs("div", { className: "flex items-center space-x-2", children: [_jsx(Button, { variant: "outline", onClick: addCalcLine, children: "Add Line" }), _jsxs(Button, { onClick: runCalculation, disabled: calculating, children: [calculating && _jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), calculating ? 'Calculating...' : 'Calculate'] })] })] })] }), calcResult && (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Calculation Result" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "text-sm text-muted-foreground", children: ["Currency: ", calcResult.currency] }), calcResult.lines && calcResult.lines.length > 0 && (_jsxs("div", { className: "space-y-2", children: [_jsx("h4", { className: "font-medium", children: "Line Items:" }), calcResult.lines.map((line, idx) => (_jsx("div", { className: "border rounded p-3 bg-gray-50", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: line.description }), _jsxs("div", { className: "text-sm text-muted-foreground", children: ["Type: ", line.type, " | Rate: ", (line.taxRate * 100).toFixed(1), "%", line.appliedRateName && (_jsxs("span", { className: "ml-2 text-blue-600", children: ["(", line.appliedRateName, ")"] }))] })] }), _jsxs("div", { className: "text-right", children: [_jsxs("div", { children: ["Amount: $", line.amount?.toFixed?.(2) ?? line.amount] }), _jsxs("div", { className: "text-sm", children: ["Tax: $", line.taxAmount?.toFixed?.(2) ?? line.taxAmount] }), _jsxs("div", { className: "font-medium", children: ["Total: $", line.totalAmount?.toFixed?.(2) ?? line.totalAmount] })] })] }) }, idx)))] })), _jsxs("div", { className: "border-t pt-4", children: [_jsxs("div", { className: "flex justify-between text-lg font-medium", children: [_jsx("span", { children: "Total Tax:" }), _jsxs("span", { children: ["$", calcResult.totalTax?.toFixed?.(2) ?? calcResult.totalTax] })] }), _jsxs("div", { className: "flex justify-between text-xl font-bold", children: [_jsx("span", { children: "Total Amount:" }), _jsxs("span", { children: ["$", calcResult.totalAmount?.toFixed?.(2) ?? calcResult.totalAmount] })] })] })] })] }))] })] })] }), _jsx(Toaster, {})] }));
}
