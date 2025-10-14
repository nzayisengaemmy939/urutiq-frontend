"use client";

import React, { useEffect, useState } from "react";
import { PageLayout } from "@/components/page-layout";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SegmentedTabs } from "@/components/ui/segmented-tabs";
import { DollarSign, Calculator } from "lucide-react";
import { apiService } from "@/lib/api";

export default function TaxPage() {
  const [rates, setRates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [companyId, setCompanyId] = useState<string>("");

  // Create rate form
  const [rateName, setRateName] = useState("");
  const [rateValue, setRateValue] = useState(0.15);
  const [appliesTo, setAppliesTo] = useState<'products'|'services'|'all'>("all");

  // Calculator form
  const [calcLines, setCalcLines] = useState<Array<{ id?: string; description?: string; type: 'product'|'service'; amount: number; taxExclusive: boolean; manualRate?: number }>>([
    { description: 'Sample item', type: 'product', amount: 100, taxExclusive: true }
  ]);
  const [calcResult, setCalcResult] = useState<any>(null);

  const refreshRates = async () => {
    setLoading(true);
    try {
      const resp: any = await apiService.listTaxRates({ companyId: companyId || undefined, limit: 50 });
      const data = (resp?.data ?? resp);
      setRates(data?.rates ?? data ?? []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshRates();
  }, []);

  const createRate = async () => {
    if (!rateName) return;
    try {
      const cid = companyId || 'company_demo';
      await apiService.createTaxRate({ companyId: cid, taxName: rateName, rate: rateValue, appliesTo });
      setRateName("");
      await refreshRates();
    } catch (e) {
      console.error(e);
    }
  };

  const addCalcLine = () => {
    setCalcLines(prev => [...prev, { type: 'product', amount: 0, taxExclusive: true }]);
  };

  const runCalculation = async () => {
    try {
      const cid = companyId || 'company_demo';
      const resp: any = await apiService.calculateTax({ companyId: cid, currency: 'USD', lines: calcLines });
      setCalcResult(resp?.data ?? resp);
    } catch (e) {
      console.error(e);
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
                  <Button onClick={createRate}>Create</Button>
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
                      <Label>Manual Rate (opt)</Label>
                      <Input type="number" step="0.01" value={l.manualRate ?? ''} onChange={e => setCalcLines(prev => prev.map((p,i)=> i===idx?{...p, manualRate: e.target.value===''? undefined : parseFloat(e.target.value)}:p))} />
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" checked={l.taxExclusive} onChange={e => setCalcLines(prev => prev.map((p,i)=> i===idx?{...p, taxExclusive: e.target.checked}:p))} />
                      <Label>Tax Exclusive</Label>
                    </div>
                  </div>
                ))}
                <div className="flex items-center space-x-2">
                  <Button variant="outline" onClick={addCalcLine}>Add Line</Button>
                  <Button onClick={runCalculation}>Calculate</Button>
                </div>
              </CardContent>
            </Card>

            {calcResult && (
              <Card>
                <CardHeader>
                  <CardTitle>Result</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">Currency: {calcResult.currency}</div>
                  <div className="mt-2">Total Tax: ${calcResult.totalTax?.toFixed?.(2) ?? calcResult.totalTax}</div>
                  <div>Total Amount: ${calcResult.totalAmount?.toFixed?.(2) ?? calcResult.totalAmount}</div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
