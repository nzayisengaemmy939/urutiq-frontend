
"use client";

import React, { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageLayout } from '../../src/components/page-layout';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../src/components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../src/components/ui/card';
import { Button } from '../../src/components/ui/button';
import nextDynamic from 'next/dynamic';
import { accountingApi, type TrialBalanceData, type Account, type GeneralLedgerData, type LedgerEntry, type PaginationInfo, type JournalEntry } from '../../src/lib/api/accounting';
import { useTrialBalance, useAccounts, useJournalEntries, useGeneralLedger } from '../../src/hooks/useAccounting'
import { useDemoAuth } from '../../src/hooks/useDemoAuth';
import { config, getCompanyId } from '../../src/lib/config';
import { Building, FileText, Calculator, Download, Plus, Eye, PieChart, Brain, Activity, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '../../src/lib/api';

import { ChartOfAccounts } from '../../src/components/chart-of-accounts-enhanced'

interface OverviewResponse {
  metrics: {
    assets: number;
    netIncome: number;
    journalEntries: number;
    balanceOk: boolean;
  };
  health: Array<{
    label: string;
    value: number;
    status: 'ok' | 'due' | 'warn';
    description: string;
  }>;
  summary: {
    revenue: number;
    expenses: number;
    profit: number;
    netIncome: number;
  };
  activity: Array<{
    id: string;
    icon: 'approved' | 'reconciliation' | 'review' | 'report';
    title: string;
    detail: string;
    minutesAgo: number;
  }>;
  tasks: Array<{
    label: string;
    count: number;
    variant?: 'secondary' | 'destructive' | 'outline';
  }>;
  generatedAt: string;
}


export default function AccountingPage() {
  const { ready: authReady } = useDemoAuth('accounting-page');
  const searchParams = useSearchParams()
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>(getCompanyId());

  
  // Handle company ID change with proper event handling
  const handleCompanyIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCompanyId(e.target.value);
  };
  
  // Handle date change with proper event handling
  const handleAsOfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAsOf(e.target.value);
  };
  
  // Handle general ledger start date change
  const handleGlStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlStart(e.target.value);
    setGlPage(1);
  };
  
  // Handle general ledger end date change
  const handleGlEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setGlEnd(e.target.value);
    setGlPage(1);
  };
  
  // Handle general ledger account change
  const handleGlAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGlAccountId(e.target.value);
    setGlPage(1);
  };
  const [journalPage, setJournalPage] = useState(1);
  const [asOf, setAsOf] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [glStart, setGlStart] = useState<string>('');
  const [glEnd, setGlEnd] = useState<string>('');
  const [glAccountId, setGlAccountId] = useState<string>('');
  const [glPage, setGlPage] = useState<number>(1);
  const initializedFromUrl = useRef(false)
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  
  // Overview data from new backend endpoint
  const [overviewData, setOverviewData] = useState<OverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  
  // Report generation state
  const [reportLoading, setReportLoading] = useState<{[key: string]: boolean}>({});
  const [generatedReports, setGeneratedReports] = useState<{[key: string]: any}>({});
  // Reconciliation state
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [reconStart, setReconStart] = useState<string>('');
  const [reconEnd, setReconEnd] = useState<string>('');
  const [reconStatus, setReconStatus] = useState<any | null>(null);
  const [reconCandidates, setReconCandidates] = useState<any[]>([]);
  const [reconLoading, setReconLoading] = useState<boolean>(false);
  const [reconAccounts, setReconAccounts] = useState<any[]>([]);
  const [reconAccLoading, setReconAccLoading] = useState<boolean>(false);
  
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchOverview = async () => {
      try {
        setOverviewLoading(true);
        const response = await fetch(`${config.api.baseUrl}/api/accounting/overview?companyId=${companyId}`, { 
          signal: controller.signal,
          headers: {
            'x-tenant-id': 'tenant_demo',
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
          }
        });

        if (response.ok) {
          const json = await response.json();
          if (!cancelled) setOverviewData(json);
        } else {
          // Fallback to sample data
          const sample: OverviewResponse = {
            metrics: { assets: 0, netIncome: 0, journalEntries: 0, balanceOk: true },
            health: [
              { label: 'AR Aging', value: 0, status: 'ok', description: 'No data available' },
              { label: 'AP Aging', value: 0, status: 'ok', description: 'No data available' },
              { label: 'Cash Runway', value: 0, status: 'warn', description: 'No data available' }
            ],
            summary: { revenue: 0, expenses: 0, profit: 0, netIncome: 0 },
            activity: [],
            tasks: [
              { label: 'No tasks', count: 0, variant: 'outline' }
            ],
            generatedAt: new Date().toISOString()
          };
          if (!cancelled) setOverviewData(sample);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error fetching overview:', err);
        }
      } finally {
        if (!cancelled) {
          setOverviewLoading(false);
        }
      }
    };

    fetchOverview();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [companyId]);

  // Data hooks
  const { data: trialBalance, isLoading: tbLoading } = useTrialBalance({ asOf: asOf || new Date().toISOString().slice(0,10), companyId })
  const { data: accounts = [], isLoading: accLoading } = useAccounts({ companyId })
  const { data: journal } = useJournalEntries({ companyId, page: journalPage, pageSize: 10 })
  const { data: glData, isLoading: glLoading } = useGeneralLedger({
    companyId,
    startDate: glStart || new Date().toISOString().slice(0,10),
    endDate: glEnd || new Date().toISOString().slice(0,10),
    accountId: glAccountId || undefined,
    page: glPage,
    pageSize: 10,
  })
  const exportGlCsv = () => {
    const glEntries = (glData as any)?.entries || [];
    if (!glEntries.length) return;
    const headers = ['Date','Reference','Memo','Debit','Credit','Account'];
    const rows = glEntries.map((r: LedgerEntry) => [
      (r.date?.slice(0,10) || ''),
      r.reference || '',
      r.description || '',
      String(r.debit ?? ''),
      String(r.credit ?? ''),
      `${r.account?.code || ''} ${r.account?.name || ''}`.trim()
    ]);
    const csv = [headers, ...rows]
      .map(line => line.map((v: any) => `"${String(v).replaceAll('"','""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'general-ledger.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // Reconciliation handlers
  const loadReconStatus = async () => {
    if (!companyId || !bankAccountId) return;
    try {
      setReconLoading(true);
      const status = await apiService.getReconciliationStatus({ companyId, bankAccountId });
      setReconStatus(status);
    } catch (e) {
      console.error('Reconciliation status failed', e);
      setReconStatus(null);
    } finally {
      setReconLoading(false);
    }
  };

  const loadReconCandidates = async () => {
    if (!companyId || !bankAccountId) return;
    try {
      setReconLoading(true);
      const list = await apiService.getReconciliationCandidates({ companyId, bankAccountId, startDate: reconStart || undefined, endDate: reconEnd || undefined });
      const items = (list?.items ?? list?.candidates ?? list) as any[];
      setReconCandidates(Array.isArray(items) ? items : []);
    } catch (e) {
      console.error('Reconciliation candidates failed', e);
      setReconCandidates([]);
    } finally {
      setReconLoading(false);
    }
  };

  const doMatch = async (bankTxnId: string, ledgerTxnId: string) => {
    try {
      setReconLoading(true);
      await apiService.reconciliationMatch({ companyId, bankAccountId, bankTxnId, ledgerTxnId });
      await Promise.all([loadReconStatus(), loadReconCandidates()]);
    } catch (e) {
      console.error('Match failed', e);
    } finally {
      setReconLoading(false);
    }
  };

  const doUnmatch = async (matchId: string) => {
    try {
      setReconLoading(true);
      await apiService.reconciliationUnmatch({ companyId, bankAccountId, matchId });
      await Promise.all([loadReconStatus(), loadReconCandidates()]);
    } catch (e) {
      console.error('Unmatch failed', e);
    } finally {
      setReconLoading(false);
    }
  };
  const glTotals = useMemo(() => {
    const entries = ((glData as any)?.entries || []) as LedgerEntry[];
    const d = entries.reduce((acc: number, r) => acc + Number(r.debit || 0), 0);
    const c = entries.reduce((acc: number, r) => acc + Number(r.credit || 0), 0);
    return { d, c, diff: d - c };
  }, [glData]);

  useEffect(() => {
    if (!authReady) return
    setError(null)
  }, [authReady])

  // GL data is handled by hook above
  const router = useRouter();

  // Helper to update URL query params without full reload
  const replaceQuery = (updates: Record<string, string | number | undefined>) => {
    const current = new URLSearchParams(searchParams?.toString() || '')
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '') current.delete(k)
      else current.set(k, String(v))
    })
    const qs = current.toString()
    router.replace(`/accounting${qs ? `?${qs}` : ''}`)
  }

  const quickStats = useMemo(() => {
    if (overviewData) {
      return {
        assets: overviewData.metrics.assets,
        netIncome: overviewData.metrics.netIncome,
        entries: overviewData.metrics.journalEntries,
        balanceOk: overviewData.metrics.balanceOk
      };
    }
    // Fallback to calculated values if overview data not available
    const totalDebits = trialBalance?.totalDebits ?? 0;
    const totalCredits = trialBalance?.totalCredits ?? 0;
    return {
      assets: Math.max(totalDebits - totalCredits, 0),
      netIncome: 0,
      entries: journal?.pagination?.totalCount ?? (journal?.entries?.length || 0),
      balanceOk: Math.round((totalDebits - totalCredits) * 100) === 0
    };
  }, [overviewData, trialBalance, journal]);

  // Prevent hydration mismatch by rendering a stable shell until mounted
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  // Restore persisted filters once on mount
  // Initialize from URL query on first mount
  useEffect(() => {
    if (!mounted || initializedFromUrl.current) return
    const get = (k: string) => searchParams?.get(k) || ''
    const cid = get('cid'); if (cid) setCompanyId(cid)
    const a = get('asOf'); if (a) setAsOf(a)
    const t = get('tab'); if (t) setActiveTab(t)
    const s = get('glStart'); if (s) setGlStart(s)
    const e = get('glEnd'); if (e) setGlEnd(e)
    const acc = get('glAcc'); if (acc) setGlAccountId(acc)
    const gp = get('glPage'); if (gp) setGlPage(Number(gp) || 1)
    const jp = get('journalPage'); if (jp) setJournalPage(Number(jp) || 1)
    initializedFromUrl.current = true
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mounted, searchParams])
  // Reflect filters to URL when they change and sync with localStorage
  useEffect(() => { 
    if (initializedFromUrl.current) replaceQuery({ cid: companyId })
    // Sync with localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('company_id', companyId)
    }
  }, [companyId])
  useEffect(() => { if (initializedFromUrl.current) replaceQuery({ asOf }) }, [asOf])
  useEffect(() => { if (initializedFromUrl.current) replaceQuery({ tab: activeTab }) }, [activeTab])
  useEffect(() => { if (initializedFromUrl.current) replaceQuery({ glStart }) }, [glStart])
  useEffect(() => { if (initializedFromUrl.current) replaceQuery({ glEnd }) }, [glEnd])
  useEffect(() => { if (initializedFromUrl.current) replaceQuery({ glAcc: glAccountId }) }, [glAccountId])
  useEffect(() => { if (initializedFromUrl.current) replaceQuery({ glPage }) }, [glPage])
  useEffect(() => { if (initializedFromUrl.current) replaceQuery({ journalPage }) }, [journalPage])
  
  // Report generation functions
  const generateReport = async (reportType: 'balance-sheet' | 'profit-loss' | 'cash-flow') => {
    setReportLoading(prev => ({ ...prev, [reportType]: true }));
    
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      let endpoint = '';
      
      switch (reportType) {
        case 'balance-sheet':
          endpoint = `/enhanced-financial-reports/balance-sheet?companyId=${companyId}&asOfDate=${currentDate}`;
          break;
        case 'profit-loss':
          const startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          endpoint = `/enhanced-financial-reports/profit-loss?companyId=${companyId}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${currentDate}`;
          break;
        case 'cash-flow':
          const cashStartDate = new Date();
          cashStartDate.setMonth(cashStartDate.getMonth() - 1);
          endpoint = `/enhanced-financial-reports/cash-flow?companyId=${companyId}&startDate=${cashStartDate.toISOString().split('T')[0]}&endDate=${currentDate}`;
          break;
      }
      
              const data = await apiService.get(endpoint);
              setGeneratedReports(prev => ({ ...prev, [reportType]: data?.data || data }));
      
      toast.success(`${reportType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} generated successfully!`);
      
      // Open the financial reports page with the generated report
      window.open(`/financial-reports?companyId=${companyId}&report=${reportType}`, '_blank');
      
    } catch (error) {
      console.error(`Error generating ${reportType}:`, error);
      toast.error(`Failed to generate ${reportType.replace('-', ' ')}`);
    } finally {
      setReportLoading(prev => ({ ...prev, [reportType]: false }));
    }
  };
  
  if (!mounted) {
    return (
      <PageLayout>
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <p className="text-muted-foreground">Loading…</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  const loading = tbLoading || accLoading || glLoading || overviewLoading
  if (loading) {
    return (
      <PageLayout>
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Loading accounting overview...</p>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  if (error) {
    return (
      <PageLayout>
        <div className="flex-1 space-y-6 p-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-600 mb-4">Failed to load accounting data</div>
              <p className="text-sm text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
            <p className="text-muted-foreground">Comprehensive accounting tools and financial insights for your business</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.push('/reports')}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={() => router.push('/journal/new')}>
              <Plus className="mr-2 h-4 w-4" />
              New Entry
            </Button>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 -mt-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Company</span>
            <input 
              key="company-id-input"
              className="h-8 w-48 border rounded px-2 text-sm" 
              value={companyId} 
              onChange={handleCompanyIdChange} 
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Date</span>
            <div className="inline-flex rounded-md border overflow-hidden">
              <button className="px-2 py-1 text-xs hover:bg-muted" onClick={() => setAsOf(new Date().toISOString().slice(0,10))}>Today</button>
              <button className="px-2 py-1 text-xs hover:bg-muted" onClick={() => setAsOf(new Date(Date.now()-7*24*60*60*1000).toISOString().slice(0,10))}>7D</button>
              <button className="px-2 py-1 text-xs hover:bg-muted" onClick={() => setAsOf(new Date(Date.now()-30*24*60*60*1000).toISOString().slice(0,10))}>30D</button>
            </div>
            <input 
              key="as-of-input"
              className="h-8 w-40 border rounded px-2 text-sm" 
              placeholder="YYYY-MM-DD" 
              value={asOf} 
              onChange={handleAsOfChange} 
            />
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="chart-of-accounts">Chart of Accounts</TabsTrigger>
            <TabsTrigger value="journal-entries">Journal Entries</TabsTrigger>
            <TabsTrigger value="reports">Financial Reports</TabsTrigger>
            <TabsTrigger value="reconciliation">Reconciliation</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardContent className="py-4">
                <div className="grid md:grid-cols-4 gap-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <input 
                      key="company-id-input-2"
                      className="mt-1 w-full border rounded px-3 py-2" 
                      value={companyId} 
                      onChange={handleCompanyIdChange} 
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">As of (YYYY-MM-DD)</p>
                    <input 
                      key="as-of-input-2"
                      className="mt-1 w-full border rounded px-3 py-2" 
                      value={asOf} 
                      onChange={handleAsOfChange} 
                    />
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" onClick={() => setJournalPage(1)} disabled={loading}>Apply</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
                <div className="grid gap-6 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                  <CardTitle>Quick Stats</CardTitle>
                  <CardDescription>Overview from trial balance</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Assets</span>
                    <span className="text-base font-semibold text-foreground">{quickStats.assets.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Entries</span>
                    <span className="text-base font-semibold text-foreground">{quickStats.entries}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Balanced</span>
                    <span className={quickStats.balanceOk ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>{quickStats.balanceOk ? 'Yes' : 'No'}</span>
                  </div>
                </CardContent>
              </Card>
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Trial Balance</CardTitle>
                  <CardDescription>Debits and credits summary</CardDescription>
                    </CardHeader>
                <CardContent>
                  {trialBalance ? (
                    <div className="grid grid-cols-3 gap-3 text-sm">
                      <div className="p-3 rounded-md border bg-muted/30">
                        <div className="text-xs text-muted-foreground">Total Debits</div>
                        <div className="text-lg font-semibold">{trialBalance.totalDebits.toLocaleString()}</div>
                      </div>
                      <div className="p-3 rounded-md border bg-muted/30">
                        <div className="text-xs text-muted-foreground">Total Credits</div>
                        <div className="text-lg font-semibold">{trialBalance.totalCredits.toLocaleString()}</div>
                      </div>
                      <div className="p-3 rounded-md border bg-muted/30">
                        <div className="text-xs text-muted-foreground">Difference</div>
                        <div className={`text-lg font-semibold ${trialBalance.totalDebits - trialBalance.totalCredits === 0 ? 'text-green-600' : 'text-amber-600'}`}>{(trialBalance.totalDebits - trialBalance.totalCredits).toFixed(2)}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">No trial balance data</div>
                  )}
                    </CardContent>
                  </Card>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Journal Entries</CardTitle>
                </CardHeader>
                <CardContent>
                  {((journal as any)?.entries?.length) ? (
                    <ul className="text-sm space-y-2">
                      {((journal as any).entries || []).slice(0, 5).map((e: any) => (
                        <li key={e.id} className="flex justify-between">
                          <span>{e.date?.slice(0,10) || ''}</span>
                          <span>{e.lines?.length || 0} lines</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-muted-foreground">No entries</div>
                  )}
                  <div className="flex justify-end gap-2 mt-3">
                    <Button variant="outline" size="sm" disabled={journalPage <= 1 || loading} onClick={() => setJournalPage(p => Math.max(1, p - 1))}>Prev</Button>
                    <Button variant="outline" size="sm" disabled={loading || ((journal as any)?.entries?.length ?? 0) < 10} onClick={() => setJournalPage(p => p + 1)}>Next</Button>
                </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Accounts</CardTitle>
                </CardHeader>
                <CardContent>
                  {accounts?.length ? (
                    <ul className="text-sm max-h-48 overflow-auto space-y-1">
                      {accounts.slice(0, 10).map((a: any) => (
                        <li key={a.id} className="flex justify-between">
                          <button className="text-left hover:underline" onClick={() => { setGlAccountId(a.id); setActiveTab('journal-entries'); }}>
                            {a.code} {a.name}
                          </button>
                          <span className="text-muted-foreground">{a.isActive === false ? 'Inactive' : ''}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="text-sm text-muted-foreground">No accounts</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="chart-of-accounts" className="space-y-6">
              <Card>
              <CardContent className="py-4">
                <ChartOfAccounts />
                </CardContent>
              </Card>
          </TabsContent>

          <TabsContent value="journal-entries" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>General Ledger</CardTitle>
                <CardDescription>Filter by date range and account; click accounts to deep-link</CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs text-muted-foreground">Density</span>
                  <div className="inline-flex rounded-md border">
                    <button
                      className={`px-2 py-1 text-xs ${density === 'comfortable' ? 'bg-muted' : ''}`}
                      onClick={() => setDensity('comfortable')}
                    >Comfortable</button>
                    <button
                      className={`px-2 py-1 text-xs ${density === 'compact' ? 'bg-muted' : ''}`}
                      onClick={() => setDensity('compact')}
                    >Compact</button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-5 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <input 
                      key="gl-start-input"
                      className="mt-1 w-full border rounded px-3 py-2" 
                      value={glStart} 
                      onChange={handleGlStartChange} 
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <input 
                      key="gl-end-input"
                      className="mt-1 w-full border rounded px-3 py-2" 
                      value={glEnd} 
                      onChange={handleGlEndChange} 
                    />
                  </div>
                  <div className="md:col-span-2">
                    <p className="text-xs text-muted-foreground">Account</p>
                    <select 
                      key="gl-account-select"
                      className="mt-1 w-full border rounded px-3 py-2" 
                      value={glAccountId} 
                      onChange={handleGlAccountChange}
                    >
                      <option value="">All Accounts</option>
                      {(accounts || []).map((a) => (
                        <option key={a.id} value={a.id}>{a.code} {a.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" onClick={() => setGlPage(1)}>Apply</Button>
                  </div>
                </div>
                {((glData as any)?.entries?.length) ? (
                  <div className="overflow-auto max-h-[60vh] border rounded-md">
                    <table className="w-full text-sm">
                      <thead className="bg-muted sticky top-0 z-10">
                        <tr>
                          <th className="text-left p-2">Date</th>
                          <th className="text-left p-2">Reference</th>
                          <th className="text-left p-2">Memo</th>
                          <th className="text-right p-2">Debit</th>
                          <th className="text-right p-2">Credit</th>
                          <th className="text-left p-2">Account</th>
                        </tr>
                      </thead>
                      <tbody>
                        {((glData as any).entries || []).map((row: any) => (
                          <tr key={row.id} className="border-t">
                            <td className={density === 'compact' ? 'px-2 py-1' : 'p-2'}>{row.date?.slice(0,10) || ''}</td>
                            <td className={density === 'compact' ? 'px-2 py-1' : 'p-2'}>{row.reference || ''}</td>
                            <td className={density === 'compact' ? 'px-2 py-1' : 'p-2'}>{row.description || ''}</td>
                            <td className={`${density === 'compact' ? 'px-2 py-1' : 'p-2'} text-right`}>{row.debit}</td>
                            <td className={`${density === 'compact' ? 'px-2 py-1' : 'p-2'} text-right`}>{row.credit}</td>
                            <td className={density === 'compact' ? 'px-2 py-1' : 'p-2'}>{row.account?.code} {row.account?.name}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t">
                      <div className="flex items-center justify-between gap-2 p-2">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2 py-1 rounded bg-slate-100">Debit: {glTotals.d.toFixed(2)}</span>
                          <span className="px-2 py-1 rounded bg-slate-100">Credit: {glTotals.c.toFixed(2)}</span>
                          <span className="px-2 py-1 rounded bg-slate-100">Diff: {glTotals.diff.toFixed(2)}</span>
                          {typeof (glData as any)?.runningBalance === 'number' && (
                            <span className="px-2 py-1 rounded bg-slate-100">Running Balance: {Number((glData as any).runningBalance).toFixed(2)}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" onClick={exportGlCsv}>Export CSV</Button>
                          <Button variant="outline" size="sm" disabled={(glData as any)?.pagination?.hasPrev === false} onClick={() => setGlPage(p => Math.max(1, p - 1))}>Prev</Button>
                          <Button variant="outline" size="sm" disabled={(glData as any)?.pagination?.hasNext === false} onClick={() => setGlPage(p => p + 1)}>Next</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground flex flex-col items-center justify-center gap-2 py-8">
                    <span>No ledger entries for selected filters</span>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { setGlAccountId(''); setGlStart(''); setGlEnd(''); }}>Reset Filters</Button>
                      <Button variant="outline" size="sm" onClick={() => setActiveTab('overview')}>Go to Overview</Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle>Income Statement </CardTitle>
                  <CardDescription>Profit and loss report</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => generateReport('profit-loss')}
                      disabled={reportLoading['profit-loss']}
                    >
                      {reportLoading['profit-loss'] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Report'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Balance Sheet</CardTitle>
                  <CardDescription>Assets, liabilities, and equity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => generateReport('balance-sheet')}
                      disabled={reportLoading['balance-sheet']}
                    >
                      {reportLoading['balance-sheet'] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Report'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Cash Flow</CardTitle>
                  <CardDescription>Cash flow statement</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => generateReport('cash-flow')}
                      disabled={reportLoading['cash-flow']}
                    >
                      {reportLoading['cash-flow'] ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        'Generate Report'
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="reconciliation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bank Reconciliation</CardTitle>
                <CardDescription>Match your records with bank statements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3 mb-4 bg-blue-600">
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <input className="mt-1 w-full border rounded px-3 py-2" value={companyId} onChange={(e)=>setCompanyId(e.target.value)} />
                  </div>
                  <div >
                    <p className="text-xs text-muted-foreground">Bank Account ID</p>
                    <input className="mt-1 w-full border rounded px-3 py-2" placeholder="Enter bank account ID" value={bankAccountId} onChange={(e)=>setBankAccountId(e.target.value)} />
                    {reconAccounts.length > 0 && (
                      <select className="mt-2 w-full border rounded px-3 py-2 text-sm" value={bankAccountId} onChange={(e)=>setBankAccountId(e.target.value)}>
                        <option value="">Select account...</option>
                        {reconAccounts.map((a:any)=> (
                          <option key={a.id} value={a.id}>{a.bankName || 'Bank'} • {a.accountNumber || a.id}</option>
                        ))}
                      </select>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <input className="mt-1 w-full border rounded px-3 py-2" placeholder="YYYY-MM-DD" value={reconStart} onChange={(e)=>setReconStart(e.target.value)} />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <input className="mt-1 w-full border rounded px-3 py-2" placeholder="YYYY-MM-DD" value={reconEnd} onChange={(e)=>setReconEnd(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" onClick={async ()=>{
                    if(!companyId) return;
                    try { setReconAccLoading(true); const resp:any = await apiService.get(`/api/banking/accounts?companyId=${encodeURIComponent(companyId)}`); const rows = (resp?.items ?? resp?.data ?? resp) as any[]; const normalized = Array.isArray(rows) ? rows : ((rows && (rows as any).accounts) ? (rows as any).accounts : []); setReconAccounts(normalized); } finally { setReconAccLoading(false); }
                  }} disabled={!companyId || reconAccLoading}>{reconAccLoading ? 'Loading Accounts...' : 'Load Accounts'}</Button>
                  <Button variant="outline" onClick={loadReconStatus} disabled={!companyId || !bankAccountId || reconLoading}>Load Status</Button>
                  <Button onClick={loadReconCandidates} disabled={!companyId || !bankAccountId || reconLoading}>Find Candidates</Button>
                  <Button onClick={async ()=>{ if(!companyId||!bankAccountId) return; setReconLoading(true); try{ await Promise.all([loadReconStatus(), loadReconCandidates()]); } finally { setReconLoading(false); } }} disabled={!companyId || !bankAccountId || reconLoading}>
                    Start Reconciliation
                  </Button>
                </div>

                {/* Status */}
                <div className="grid md:grid-cols-3 gap-3 mb-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Status</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs whitespace-pre-wrap break-words">{reconStatus ? JSON.stringify(reconStatus, null, 2) : '—'}</pre>
                    </CardContent>
                  </Card>
                </div>

                {/* Candidates */}
                <div className="space-y-3">
                  {reconCandidates.map((c: any) => (
                    <div key={c.id || `${c.bankTxnId}-${c.ledgerTxnId}`} className="flex items-center justify-between p-3 border rounded">
                      <div className="text-sm">
                        <div className="font-medium">Bank Txn: {c.bankTxnId || c.bankTransactionId || '—'} → Ledger Txn: {c.ledgerTxnId || c.ledgerTransactionId || '—'}</div>
                        <div className="text-muted-foreground">Amount: {c.amount ?? c.bankAmount ?? '—'} | Date: {c.date || c.bankDate || '—'}</div>
                      </div>
                      <div className="flex gap-2">
                        {(c.matchId || c.id) ? (
                          <Button variant="outline" size="sm" disabled={reconLoading} onClick={() => doUnmatch(c.matchId || c.id)}>Unmatch</Button>
                        ) : (
                          <Button size="sm" disabled={reconLoading || !(c.bankTxnId || c.bankTransactionId) || !(c.ledgerTxnId || c.ledgerTransactionId)} onClick={() => doMatch(c.bankTxnId || c.bankTransactionId, c.ledgerTxnId || c.ledgerTransactionId)}>Match</Button>
                        )}
                      </div>
                    </div>
                  ))}
                  {reconCandidates.length === 0 && (
                    <div className="text-sm text-muted-foreground">No candidates loaded</div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Financial Analytics</CardTitle>
                  <CardDescription>Advanced financial insights and trends</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <PieChart className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                    <p className="text-muted-foreground mb-4">View detailed financial analytics</p>
                    <Button>
                      <Eye className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>AI Insights</CardTitle>
                  <CardDescription>Intelligent financial recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <Brain className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">AI-Powered Insights</h3>
                    <p className="text-muted-foreground mb-4">Get intelligent financial recommendations</p>
                    <Button>
                      <Activity className="mr-2 h-4 w-4" />
                      View Insights
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
