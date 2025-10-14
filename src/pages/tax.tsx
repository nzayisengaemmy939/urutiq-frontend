import React, { useEffect, useState } from "react";
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
  const [rates, setRates] = useState<any[]>([]);
  const [jurisdictions, setJurisdictions] = useState<any[]>([]);
  const [taxForms, setTaxForms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [calculating, setCalculating] = useState(false);
  const [creatingJurisdiction, setCreatingJurisdiction] = useState(false);
  const [creatingForm, setCreatingForm] = useState(false);
  const [companyId, setCompanyId] = useState<string>("cmg7trbsf00097kb7rrpy9in1");

  // Create rate form
  const [rateName, setRateName] = useState("");
  const [rateValue, setRateValue] = useState(0.15);
  const [appliesTo, setAppliesTo] = useState<'products'|'services'|'all'>("all");

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
  const [calcLines, setCalcLines] = useState<Array<{ id?: string; description?: string; type: 'product'|'service'; amount: number; taxExclusive: boolean; manualRate?: number; selectedRateId?: string }>>([
    { description: 'Sample item', type: 'product', amount: 100, taxExclusive: true }
  ]);
  const [calcResult, setCalcResult] = useState<any>(null);

  const refreshRates = async () => {
    setLoading(true);
    try {
      console.log('Fetching tax rates for company:', companyId);
      const resp: any = await apiService.listTaxRates({ companyId: companyId || undefined, limit: 50 });
      console.log('Tax rates response:', resp);
      
      // Handle different response structures
      let ratesData = [];
      if (Array.isArray(resp)) {
        ratesData = resp;
      } else if (resp?.rates && Array.isArray(resp.rates)) {
        ratesData = resp.rates;
      } else if (resp?.data?.rates && Array.isArray(resp.data.rates)) {
        ratesData = resp.data.rates;
      } else if (resp?.data && Array.isArray(resp.data)) {
        ratesData = resp.data;
      }
      
      console.log('Processed rates data:', ratesData);
      setRates(ratesData);
    } catch (e) {
      console.error('Error fetching tax rates:', e);
    } finally {
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
    } catch (e) {
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
    } catch (e) {
      console.error('Error creating tax form:', e);
      
      const errorMessage = e instanceof Error ? e.message : 'Unknown error occurred';
      toast({
        title: "Error",
        description: `Failed to create tax form: ${errorMessage}`,
        variant: "destructive",
      });
    } finally {
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
    } catch (e) {
      console.error('Error creating tax rate:', e);
      
      // Show error notification
      toast({
        title: "Error",
        description: "Failed to create tax rate. Please try again.",
        variant: "destructive",
      });
    } finally {
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
    } catch (e) {
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
    } catch (e) {
      console.error('Error creating jurisdiction:', e);
      
      // Show error notification
      toast({
        title: "Error",
        description: "Failed to create jurisdiction. Please try again.",
        variant: "destructive",
      });
    } finally {
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
      const resp: any = await apiService.calculateTax({ companyId: cid, currency: 'USD', lines: calcLines });
      setCalcResult(resp?.data ?? resp);
      
      // Show success notification
      toast({
        title: "Calculation Complete",
        description: "Tax calculation completed successfully",
        variant: "default",
      });
    } catch (e) {
      console.error('Error calculating tax:', e);
      
      // Show error notification
      toast({
        title: "Calculation Error",
        description: "Failed to calculate tax. Please try again.",
        variant: "destructive",
      });
    } finally {
      setCalculating(false);
    }
  };

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tax</h1>
            <p className="text-muted-foreground">Manage tax rates and calculate tax for transactions</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Context</CardTitle>
            <CardDescription>Optionally provide a Company ID (blank uses demo)</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Company ID</Label>
              <Input value={companyId} onChange={e => setCompanyId(e.target.value)} placeholder="company id" />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={refreshRates} disabled={loading}>Refresh Rates</Button>
            </div>
          </CardContent>
        </Card>

        <SegmentedTabs
          tabs={[
            { id: 'rates', label: 'Rates' },
            { id: 'calculator', label: 'Calculator' },
          ]}
          value={'rates'}
          onChange={() => {}}
          className="mb-4"
        />
        <Tabs defaultValue="rates" className="space-y-4" variant="underline">
          <TabsList variant="underline">
            <TabsTrigger value="rates" icon={<DollarSign className="w-4 h-4" />} badge={rates.length}>Rates</TabsTrigger>
            <TabsTrigger value="jurisdictions" icon={<MapPin className="w-4 h-4" />} badge={jurisdictions.length}>Jurisdictions</TabsTrigger>
            <TabsTrigger value="forms" icon={<FileText className="w-4 h-4" />} badge={taxForms.length}>Forms</TabsTrigger>
            <TabsTrigger value="calculator" icon={<Calculator className="w-4 h-4" />}>Calculator</TabsTrigger>
          </TabsList>

          <TabsContent value="rates" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Rate</CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input value={rateName} onChange={e => setRateName(e.target.value)} placeholder="VAT 15%" />
                </div>
                <div className="space-y-2">
                  <Label>Rate (0-1)</Label>
                  <Input type="number" step="0.01" value={rateValue} onChange={e => setRateValue(parseFloat(e.target.value || '0'))} />
                </div>
                <div className="space-y-2">
                  <Label>Applies To</Label>
                  <select value={appliesTo} onChange={e => setAppliesTo(e.target.value as any)} className="w-full border rounded h-10 px-3">
                    <option value="all">All</option>
                    <option value="products">Products</option>
                    <option value="services">Services</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={createRate} disabled={creating}>
                    {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {creating ? 'Creating...' : 'Create'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Rates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {rates.length === 0 && <div className="text-sm text-muted-foreground">No rates</div>}
                {rates.map((r: any) => (
                  <div key={r.id} className="flex items-center justify-between border rounded p-3">
                    <div>
                      <div className="font-medium">{r.taxName}</div>
                      <div className="text-sm text-muted-foreground">{r.appliesTo} • {(r.rate * 100).toFixed(2)}%</div>
                    </div>
                    <Badge variant={r.isActive ? 'default' : 'secondary'}>{r.isActive ? 'Active' : 'Inactive'}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="jurisdictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Jurisdiction</CardTitle>
                <CardDescription>Add a new tax jurisdiction for your business</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Name *</Label>
                  <Input 
                    value={jurisdictionName} 
                    onChange={e => setJurisdictionName(e.target.value)} 
                    placeholder="e.g., California State Tax" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country *</Label>
                  <Input 
                    value={jurisdictionCountry} 
                    onChange={e => setJurisdictionCountry(e.target.value)} 
                    placeholder="e.g., United States" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>State/Province</Label>
                  <Input 
                    value={jurisdictionState} 
                    onChange={e => setJurisdictionState(e.target.value)} 
                    placeholder="e.g., California" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input 
                    value={jurisdictionCity} 
                    onChange={e => setJurisdictionCity(e.target.value)} 
                    placeholder="e.g., San Francisco" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tax Type *</Label>
                  <select 
                    value={jurisdictionTaxType} 
                    onChange={e => setJurisdictionTaxType(e.target.value)} 
                    className="w-full border rounded h-10 px-3"
                  >
                    <option value="VAT">VAT</option>
                    <option value="GST">GST</option>
                    <option value="SALES">Sales Tax</option>
                    <option value="INCOME">Income Tax</option>
                    <option value="PAYROLL">Payroll Tax</option>
                    <option value="PROPERTY">Property Tax</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button onClick={createJurisdiction} disabled={creatingJurisdiction}>
                    {creatingJurisdiction && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {creatingJurisdiction ? 'Creating...' : 'Create'}
                  </Button>
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label>Description</Label>
                  <Input 
                    value={jurisdictionDescription} 
                    onChange={e => setJurisdictionDescription(e.target.value)} 
                    placeholder="Optional description of this jurisdiction" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Jurisdictions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {jurisdictions.length === 0 && <div className="text-sm text-muted-foreground">No jurisdictions</div>}
                {jurisdictions.map((jurisdiction: any) => (
                  <div key={jurisdiction.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{jurisdiction.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {jurisdiction.country}
                        {jurisdiction.state && `, ${jurisdiction.state}`}
                        {jurisdiction.city && `, ${jurisdiction.city}`}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Type: {jurisdiction.taxType}
                        {jurisdiction.description && ` • ${jurisdiction.description}`}
                      </div>
                    </div>
                    <Badge variant={jurisdiction.isActive ? "default" : "secondary"}>
                      {jurisdiction.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="forms" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Create Tax Form</CardTitle>
                <CardDescription>Add a new tax form template for your business</CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Form Name *</Label>
                  <Input 
                    value={formName} 
                    onChange={e => setFormName(e.target.value)} 
                    placeholder="e.g., Form 1120 - Corporation Tax Return" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Form Code *</Label>
                  <Input 
                    value={formCode} 
                    onChange={e => setFormCode(e.target.value)} 
                    placeholder="e.g., 1120" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Jurisdiction *</Label>
                  <select 
                    value={formJurisdiction} 
                    onChange={e => setFormJurisdiction(e.target.value)} 
                    className="w-full border rounded h-10 px-3"
                  >
                    <option value="">Select jurisdiction</option>
                    {jurisdictions.map(jurisdiction => (
                      <option key={jurisdiction.id} value={jurisdiction.name}>
                        {jurisdiction.name} ({jurisdiction.country})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Tax Type *</Label>
                  <select 
                    value={formTaxType} 
                    onChange={e => setFormTaxType(e.target.value)} 
                    className="w-full border rounded h-10 px-3"
                  >
                    <option value="INCOME">Income Tax</option>
                    <option value="SALES">Sales Tax</option>
                    <option value="PAYROLL">Payroll Tax</option>
                    <option value="PROPERTY">Property Tax</option>
                    <option value="VAT">VAT</option>
                    <option value="GST">GST</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Period</Label>
                  <select 
                    value={formPeriod} 
                    onChange={e => setFormPeriod(e.target.value)} 
                    className="w-full border rounded h-10 px-3"
                  >
                    <option value="Annual">Annual</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Monthly">Monthly</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input 
                    type="date"
                    value={formDueDate} 
                    onChange={e => setFormDueDate(e.target.value)} 
                  />
                </div>
                <div className="md:col-span-3 space-y-2">
                  <Label>Description</Label>
                  <Input 
                    value={formDescription} 
                    onChange={e => setFormDescription(e.target.value)} 
                    placeholder="Optional description of this tax form" 
                  />
                </div>
                <div className="md:col-span-3 flex justify-start">
                  <Button onClick={createTaxForm} disabled={creatingForm}>
                    {creatingForm && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {creatingForm ? 'Creating...' : 'Create Form'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Existing Tax Forms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {taxForms.length === 0 && <div className="text-sm text-muted-foreground">No tax forms</div>}
                {taxForms.map((form: any) => (
                  <div key={form.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <div className="font-medium">{form.formName}</div>
                      <div className="text-sm text-muted-foreground">
                        Code: {form.formCode} • {form.jurisdiction} • {form.taxType}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Period: {form.period}
                        {form.dueDate && ` • Due: ${form.dueDate}`}
                        {form.description && ` • ${form.description}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={form.status === 'READY' ? "default" : form.status === 'DRAFT' ? "secondary" : "outline"}>
                        {form.status}
                      </Badge>
                      <Badge variant={form.isActive ? "default" : "secondary"}>
                        {form.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Lines</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {calcLines.map((l, idx) => (
                  <div key={idx} className="grid md:grid-cols-5 gap-2 items-end">
                    <div>
                      <Label>Description</Label>
                      <Input value={l.description || ''} onChange={e => {
                        const v = e.target.value; setCalcLines(prev => prev.map((p,i) => i===idx?{...p, description:v}:p))
                      }} />
                    </div>
                    <div>
                      <Label>Type</Label>
                      <select value={l.type} onChange={e => setCalcLines(prev => prev.map((p,i)=> i===idx?{...p, type: e.target.value as any}:p))} className="w-full border rounded h-10 px-3">
                        <option value="product">Product</option>
                        <option value="service">Service</option>
                      </select>
                    </div>
                    <div>
                      <Label>Amount</Label>
                      <Input type="number" step="0.01" value={l.amount} onChange={e => setCalcLines(prev => prev.map((p,i)=> i===idx?{...p, amount: parseFloat(e.target.value||'0')}:p))} />
                    </div>
                    <div>
                      <Label>Tax Rate</Label>
                      <select 
                        value={l.selectedRateId || 'auto'} 
                        onChange={e => {
                          const value = e.target.value;
                          if (value === 'auto') {
                            setCalcLines(prev => prev.map((p,i)=> i===idx?{...p, selectedRateId: undefined, manualRate: undefined}:p));
                          } else if (value === 'manual') {
                            setCalcLines(prev => prev.map((p,i)=> i===idx?{...p, selectedRateId: 'manual', manualRate: 0.15}:p));
                          } else {
                            const selectedRate = rates.find(r => r.id === value);
                            setCalcLines(prev => prev.map((p,i)=> i===idx?{...p, selectedRateId: value, manualRate: selectedRate?.rate}:p));
                          }
                        }} 
                        className="w-full border rounded h-10 px-3"
                      >
                        <option value="auto">Auto (Match by Type)</option>
                        {rates.map(rate => (
                          <option key={rate.id} value={rate.id}>
                            {rate.taxName} ({(rate.rate * 100).toFixed(1)}%) - {rate.appliesTo}
                          </option>
                        ))}
                        <option value="manual">Manual Rate</option>
                      </select>
                      {l.selectedRateId === 'manual' && (
                        <Input 
                          type="number" 
                          step="0.01" 
                          value={l.manualRate ?? ''} 
                          onChange={e => setCalcLines(prev => prev.map((p,i)=> i===idx?{...p, manualRate: e.target.value===''? undefined : parseFloat(e.target.value)}:p))} 
                          placeholder="Enter rate (0.15 = 15%)"
                          className="mt-1"
                        />
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked={l.taxExclusive} onChange={e => setCalcLines(prev => prev.map((p,i)=> i===idx?{...p, taxExclusive: e.target.checked}:p))} />
                      <Label>Tax Exclusive</Label>
                    </div>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={addCalcLine}>Add Line</Button>
                  <Button onClick={runCalculation} disabled={calculating}>
                    {calculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {calculating ? 'Calculating...' : 'Calculate'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {calcResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Calculation Result</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground">Currency: {calcResult.currency}</div>
                  
                  {/* Line Item Details */}
                  {calcResult.lines && calcResult.lines.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="font-medium">Line Items:</h4>
                      {calcResult.lines.map((line: any, idx: number) => (
                        <div key={idx} className="border rounded p-3 bg-gray-50">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{line.description}</div>
                              <div className="text-sm text-muted-foreground">
                                Type: {line.type} | Rate: {(line.taxRate * 100).toFixed(1)}%
                                {line.appliedRateName && (
                                  <span className="ml-2 text-blue-600">({line.appliedRateName})</span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div>Amount: ${line.amount?.toFixed?.(2) ?? line.amount}</div>
                              <div className="text-sm">Tax: ${line.taxAmount?.toFixed?.(2) ?? line.taxAmount}</div>
                              <div className="font-medium">Total: ${line.totalAmount?.toFixed?.(2) ?? line.totalAmount}</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Summary */}
                  <div className="border-t pt-4">
                    <div className="flex justify-between text-lg font-medium">
                      <span>Total Tax:</span>
                      <span>${calcResult.totalTax?.toFixed?.(2) ?? calcResult.totalTax}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold">
                      <span>Total Amount:</span>
                      <span>${calcResult.totalAmount?.toFixed?.(2) ?? calcResult.totalAmount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
      <Toaster />
    </PageLayout>
  );
}
