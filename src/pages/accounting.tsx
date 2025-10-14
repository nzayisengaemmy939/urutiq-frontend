import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PageLayout } from '../components/page-layout';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { type LedgerEntry } from '../lib/api/accounting';
import { useTrialBalance, useAccounts, useJournalEntries, useGeneralLedger } from '../hooks/useAccounting'
import { useDemoAuth } from '../hooks/useDemoAuth';
import { config, getCompanyId, getTenantId } from '../lib/config';
import { Download, Plus, Eye, PieChart, Brain, Activity, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '../lib/api';

import { ChartOfAccounts } from '../components/chart-of-accounts-enhanced'
import { EnhancedFinancialReports } from '../components/enhanced-financial-reports'

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
  const [searchParams, setSearchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string>(getCompanyId());
  const queryClient = useQueryClient();

  // Listen for company changes from header
  useEffect(() => {
    const handleStorageChange = () => {
      const newCompanyId = getCompanyId();
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Accounting page - Company changed from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
        
        // Invalidate React Query cache to force refetch with new company ID
        queryClient.invalidateQueries();
        console.log('✅ Accounting page - React Query cache invalidated');
      }
    };

    // Listen for localStorage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom events (in case localStorage doesn't trigger)
    const handleCompanyChange = (e: CustomEvent) => {
      const newCompanyId = e.detail.companyId;
      if (newCompanyId && newCompanyId !== companyId) {
        console.log('🔄 Accounting page - Company changed via custom event from', companyId, 'to', newCompanyId);
        setCompanyId(newCompanyId);
        
        // Invalidate React Query cache to force refetch with new company ID
        queryClient.invalidateQueries();
        console.log('✅ Accounting page - React Query cache invalidated');
      }
    };
    
    window.addEventListener('companyChanged', handleCompanyChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('companyChanged', handleCompanyChange as EventListener);
    };
  }, [companyId, queryClient]);

  
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
  const [glStart, setGlStart] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 3); // Default to last 3 months
    return date.toISOString().slice(0,10);
  });
  const [glEnd, setGlEnd] = useState<string>(() => new Date().toISOString().slice(0,10));
  const [glAccountId, setGlAccountId] = useState<string>('');
  const [glPage, setGlPage] = useState<number>(1);
  const initializedFromUrl = useRef(false)
  const [density, setDensity] = useState<'comfortable' | 'compact'>('comfortable')
  // Reconciliation state
  const [bankAccountId, setBankAccountId] = useState<string>('');
  const [reconStart, setReconStart] = useState<string>('');
  const [reconEnd, setReconEnd] = useState<string>('');
  const [reconStatus, setReconStatus] = useState<any | null>(null);
  const [reconCandidates, setReconCandidates] = useState<any[]>([]);
  const [reconLoading, setReconLoading] = useState<boolean>(false);
  const [reconAccounts, setReconAccounts] = useState<any[]>([]);
  const [reconAccLoading, setReconAccLoading] = useState<boolean>(false);
  const formatAccountLabel = (a: any): string => {
    const bank = a.bankName || a.connection?.bankName || 'Bank';
    const rawAcc = a.accountNumber || a.maskedNumber || a.last4 || a.connection?.accountNumber || '';
    const last4 = typeof rawAcc === 'string' ? rawAcc.slice(-4) : String(rawAcc || '').slice(-4);
    const type = a.accountType || a.type || a.connection?.accountType || '';
    const currency = a.currency || a.connection?.currency || '';
    const shortId = (a.id || '').slice(0, 6);
    const parts = [
      bank + (type ? ` ${type}` : ''),
      `**** ${last4 || '????'}`,
      currency || undefined,
      shortId ? `#${shortId}` : undefined,
    ].filter(Boolean);
    return parts.join(' • ');
  };

  // Helper: load accounts for selected company
  const loadAccounts = async () => {
    if (!companyId) return;
    try {
      setReconAccLoading(true);
      const resp: any = await apiService.get(`/api/bank-accounts?companyId=${encodeURIComponent(companyId)}`);
      const rows = (resp?.items ?? resp?.data ?? resp) as any[];
      const normalized = Array.isArray(rows) ? rows : ((rows && (rows as any).accounts) ? (rows as any).accounts : []);
      setReconAccounts(normalized);
      // Keep current selection if still present; otherwise clear
      if (normalized.length && !normalized.find((a: any) => a.id === bankAccountId)) {
        setBankAccountId('');
      }
      if (normalized.length) {
        toast.success(`Loaded ${normalized.length} bank account${normalized.length > 1 ? 's' : ''}`);
      } else {
        toast.error('No bank accounts found for this company');
      }
    } catch (e) {
      console.error('Failed to load accounts', e);
      toast.error('Failed to load bank accounts');
    } finally {
      setReconAccLoading(false);
    }
  };
  
  // Overview data from new backend endpoint
  const [overviewData, setOverviewData] = useState<OverviewResponse | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);
  
  // Report generation state
  const [reportLoading, setReportLoading] = useState<{[key: string]: boolean}>({});
  const [generatedReports, setGeneratedReports] = useState<{[key: string]: any}>({});
  // Advanced analytics loading state
  const [finAnalyticsLoading, setFinAnalyticsLoading] = useState<boolean>(false);
  const [finAnalytics, setFinAnalytics] = useState<{
    start: string;
    end: string;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    profitMargin: number;
    netCashFlow: number;
  } | null>(null);

  const runFinancialAnalytics = async () => {
    try {
      setFinAnalyticsLoading(true);
      const end = new Date();
      const start = new Date();
      start.setMonth(end.getMonth() - 5); // last 6 months inclusive
      const startStr = start.toISOString().slice(0,10);
      const endStr = end.toISOString().slice(0,10);

      console.log('Fetching financial analytics for period:', { start: startStr, end: endStr, companyId });

      // Use the same endpoint as the dashboard for consistency
      const response = await apiService.get(`/api/dashboard?companyId=${encodeURIComponent(companyId)}&period=180`); // 6 months = ~180 days
      const dashboardData = response?.data || response || {};
      
      console.log('Dashboard API response:', dashboardData);

      // Extract metrics from dashboard response
      const metrics = dashboardData.metrics || {};
      const monthlyTrend = dashboardData.monthlyTrend || [];
      
      // Calculate totals from monthly trend if available, otherwise use metrics
      let totalRevenue = metrics.totalRevenue || 0;
      let totalExpenses = Math.abs(metrics.totalExpenses || 0);
      
      // If we have monthly data, sum it up for the period
      if (monthlyTrend.length > 0) {
        totalRevenue = monthlyTrend.reduce((sum: number, month: any) => sum + (month.revenue || 0), 0);
        totalExpenses = monthlyTrend.reduce((sum: number, month: any) => sum + Math.abs(month.expenses || 0), 0);
      }
      
      const netIncome = metrics.netProfit || (totalRevenue - totalExpenses);
      const profitMargin = totalRevenue > 0 ? Math.round(((netIncome / totalRevenue) * 100) * 10) / 10 : 0;
      
      // For cash flow, we'll use the net profit if available, or calculate it
      const netCashFlow = metrics.netProfit || netIncome;

      console.log('Calculated financial metrics:', { 
        totalRevenue, 
        totalExpenses, 
        netIncome, 
        profitMargin, 
        netCashFlow 
      });

      // Only show toast if we have meaningful data
      if (totalRevenue > 0 || totalExpenses > 0) {
        toast.success(`Analytics • Rev ${totalRevenue.toLocaleString()} • Exp ${totalExpenses.toLocaleString()} • Margin ${profitMargin}% • Cash ${netCashFlow.toLocaleString()}`);
      } else {
        toast.warning('No financial data found for the selected period');
      }

      setFinAnalytics({ 
        start: startStr, 
        end: endStr, 
        totalRevenue, 
        totalExpenses, 
        netIncome, 
        profitMargin, 
        netCashFlow 
      });
    } catch (e) {
      console.error('Failed to compute financial analytics', e);
      toast.error('Failed to load financial analytics');
    } finally {
      setFinAnalyticsLoading(false);
    }
  };
  // AI Insights state (no UI change, used for API integration and toasts)
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiInsights, setAiInsights] = useState<any[]>([]);

  const loadAiInsights = async () => {
    if (!companyId) return;
    setAiLoading(true);
    try {
      const data: any = await apiService.get(`/api/ai/insights?companyId=${encodeURIComponent(companyId)}`);
      const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
      setAiInsights(list);
      toast.success(`Loaded ${list.length} AI insight${list.length === 1 ? '' : 's'}`);
      if (list.length > 0) {
        // Surface the first insight in console for quick inspection without UI changes
        // eslint-disable-next-line no-console
        console.info('AI Insights sample:', list[0]);
      }
    } catch (e) {
      console.error('Failed to load AI insights', e);
      toast.error('Failed to load AI insights');
    } finally {
      setAiLoading(false);
    }
  };

  const generateAiInsights = async () => {
    if (!companyId) return;
    setAiLoading(true);
    
    // Show progress toast
    const progressToast = toast.loading('Analyzing financial data with AI...', {
      duration: 30000 // 30 seconds max
    });
    
    try {
      const resp: any = await apiService.post('/api/llama-ai/analysis/financial-insights', { companyId });
      
      // Handle the response structure from Llama AI
      let insightsToSave = [];
      
      if (resp?.success && resp?.data) {
        const aiData = resp.data;
        
        // Extract insights from the AI response
        if (aiData.insights && Array.isArray(aiData.insights)) {
          insightsToSave = aiData.insights.map((insight: any) => ({
            category: insight.type || 'financial',
            insightText: insight.description || aiData.message || '',
            priority: insight.impact === 'high' ? 'high' : insight.impact === 'low' ? 'low' : 'medium',
            confidence: insight.confidence || aiData.confidence || 0.8
          }));
        } else {
          // If no insights array, create one from the main message
          insightsToSave = [{
            category: 'financial',
            insightText: aiData.message || 'Financial analysis completed',
            priority: aiData.intent === 'urgent' ? 'high' : 'medium',
            confidence: aiData.confidence || 0.8
          }];
        }
        
        // Add suggestions as additional insights
        if (aiData.suggestions && Array.isArray(aiData.suggestions)) {
          aiData.suggestions.forEach((suggestion: string) => {
            insightsToSave.push({
              category: 'recommendation',
              insightText: suggestion,
              priority: 'medium',
              confidence: 0.7
            });
          });
        }
      }
      
      // Set insights in state for immediate display
      setAiInsights(insightsToSave);
      
      // Dismiss progress toast and show success
      toast.dismiss(progressToast);
      toast.success(`Generated ${insightsToSave.length} AI insights`);
      
      // Persist generated insights to database
      if (insightsToSave.length > 0) {
        try {
          const toSave = insightsToSave.slice(0, 5); // cap to avoid spam
          for (const it of toSave) {
            const payload = {
              companyId,
              category: it.category,
              insightText: it.insightText,
              priority: it.priority
            };
            try { 
              await apiService.post('/api/ai/insights', payload); 
            } catch (saveError) {
              console.warn('Failed to save insight:', saveError);
            }
          }
        } catch (saveError) {
          console.warn('Failed to save insights:', saveError);
        }
      }
      
      // Reload from DB to show persisted insights
      await loadAiInsights();
    } catch (e) {
      console.error('Failed to generate AI insights', e);
      toast.dismiss(progressToast);
      toast.error('Failed to generate AI insights');
    } finally {
      setAiLoading(false);
    }
  };
  
  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchOverview = async () => {
      try {
        setOverviewLoading(true);
        const response = await fetch(`${config.api.baseUrl}/api/accounting/overview?companyId=${companyId}`, { 
          signal: controller.signal,
          headers: {
            'x-tenant-id': getTenantId(),
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

  // Debug General Ledger data
  console.log('General Ledger Debug:', {
    companyId,
    glStart,
    glEnd,
    glAccountId,
    glPage,
    glLoading,
    glData: glData ? {
      entries: (glData as any)?.entries?.length || 0,
      pagination: (glData as any)?.pagination,
      hasData: !!(glData as any)?.entries?.length
    } : null
  });
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
      .map(line => line.map((v: any) => `"${String(v).replace(/"/g,'""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'general-ledger.csv';
    a.click();
    URL.revokeObjectURL(url);
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
  const navigate = useNavigate();

  // Helper to update URL query params without full reload
  const replaceQuery = (updates: Record<string, string | number | undefined>) => {
    const current = new URLSearchParams(searchParams || '')
    Object.entries(updates).forEach(([k, v]) => {
      if (v === undefined || v === '') current.delete(k)
      else current.set(k, String(v))
    })
    setSearchParams(current)
  }

  // Auto-load accounts when company changes
  useEffect(() => {
    if (companyId) {
      loadAccounts();
    } else {
      setReconAccounts([]);
      setBankAccountId('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [companyId]);

  // Reconciliation handlers
  const loadReconStatus = async () => {
    if (!companyId || !bankAccountId) return;
    setReconLoading(true);
    try {
      // Fetch totals from backend for accuracy
      const qs = new URLSearchParams({ companyId, bankAccountId });
      if (reconStart) qs.set('startDate', reconStart);
      if (reconEnd) qs.set('endDate', reconEnd);
      const resp: any = await apiService.get(`/api/reconciliation/status?${qs.toString()}`);
      const data = resp?.data ?? resp ?? null;
      setReconStatus(data);
      if (data && typeof data.matchedCount === 'number') {
        toast.success(`Status loaded • Matched ${data.matchedCount}, Unmatched ${data.unmatchedBankCount}`);
      }
    } catch (e) {
      console.error('Failed to load reconciliation status', e);
      toast.error('Failed to load reconciliation status');
      setReconStatus(null);
    } finally {
      setReconLoading(false);
    }
  };

  const loadReconCandidates = async () => {
    if (!companyId || !bankAccountId) return;
    setReconLoading(true);
    try {
      // 1) Fetch recent bank transactions for this account (filter by date if provided)
      const params = new URLSearchParams({ companyId, bankAccountId, page: '1', pageSize: '20' });
      const listResp: any = await apiService.get(`/api/bank-transactions?${params.toString()}`);
      const listBody = listResp?.data ?? listResp ?? {};
      const bankTxns: any[] = (listBody.items || listBody.transactions || []);
      // 2) For each bank transaction, request matches
      const candidatesAgg: any[] = [];
      for (const t of bankTxns) {
        try {
          const matchResp: any = await apiService.post(`/api/bank-transactions/${encodeURIComponent(t.id)}/find-matches?companyId=${encodeURIComponent(companyId)}`, {});
          const matches = matchResp?.matches ?? matchResp?.data?.matches ?? [];
          for (const m of matches) {
            candidatesAgg.push({
              id: `${t.id}-${m.ledgerTxnId}`,
              bankTxnId: t.id,
              bankDate: t.transactionDate || t.date,
              bankAmount: t.amount,
              ledgerTxnId: m.ledgerTxnId,
              ledgerDate: m.ledgerDate,
              ledgerAmount: m.amount,
              score: m.score,
            });
          }
        } catch (err) {
          // ignore match errors per transaction
        }
      }
      setReconCandidates(candidatesAgg);
      toast.success(`Found ${candidatesAgg.length} candidate${candidatesAgg.length === 1 ? '' : 's'}`);
    } catch (e) {
      console.error('Failed to load reconciliation candidates', e);
      toast.error('Failed to load candidates');
      setReconCandidates([]);
    } finally {
      setReconLoading(false);
    }
  };

  const doMatch = async (bankTxnId: string, ledgerTxnId: string) => {
    if (!companyId || !bankAccountId || !bankTxnId || !ledgerTxnId) return;
    setReconLoading(true);
    try {
      await apiService.post('/api/reconciliation/match', { companyId, bankAccountId, bankTxnId, ledgerTxnId });
      toast.success('Matched successfully');
      await Promise.all([loadReconStatus(), loadReconCandidates()]);
    } catch (e) {
      console.error('Match failed', e);
      toast.error('Match failed');
    } finally {
      setReconLoading(false);
    }
  };

  const doUnmatch = async (matchId: string) => {
    if (!companyId || !bankAccountId || !matchId) return;
    setReconLoading(true);
    try {
      await apiService.post('/api/reconciliation/unmatch', { companyId, bankAccountId, matchId });
      toast.success('Unmatched successfully');
      await Promise.all([loadReconStatus(), loadReconCandidates()]);
    } catch (e) {
      console.error('Unmatch failed', e);
      toast.error('Unmatch failed');
    } finally {
      setReconLoading(false);
    }
  };

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
    if (!mounted || initializedFromUrl.current || !searchParams) return
    const get = (k: string) => searchParams.get(k) || ''
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
          endpoint = `/api/enhanced-financial-reports/balance-sheet?companyId=${companyId}&asOfDate=${currentDate}`;
          break;
        case 'profit-loss':
          const startDate = new Date();
          startDate.setMonth(startDate.getMonth() - 1);
          endpoint = `/api/enhanced-financial-reports/profit-loss?companyId=${companyId}&startDate=${startDate.toISOString().split('T')[0]}&endDate=${currentDate}`;
          break;
        case 'cash-flow':
          const cashStartDate = new Date();
          cashStartDate.setMonth(cashStartDate.getMonth() - 1);
          endpoint = `/api/enhanced-financial-reports/cash-flow?companyId=${companyId}&startDate=${cashStartDate.toISOString().split('T')[0]}&endDate=${currentDate}`;
          break;
      }
      
      const data = await apiService.get(endpoint);
      setGeneratedReports(prev => ({ ...prev, [reportType]: data?.data || data }));
      
      toast.success(`${reportType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())} generated successfully!`);
      
      // Scroll to the generated report section
      setTimeout(() => {
        const reportSection = document.getElementById('generated-reports-section');
        if (reportSection) {
          reportSection.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      
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
        <div className="space-y-6">
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
        <div className="space-y-6">
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
        <div className="space-y-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="text-red-600 mb-4">Failed to load accounting data</div>
              <p className="text-sm text-muted-foreground mb-4">{error || 'Unknown error'}</p>
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Financial Management</h1>
            <p className="text-muted-foreground">Comprehensive accounting tools and financial insights for your business</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => navigate('/reports')}>
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
            <Button onClick={() => navigate('/dashboard/journal/new')}>
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
              placeholder="Enter company ID (e.g., seed-company-1)"
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
              type="date"
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
                      placeholder="Enter company ID (e.g., seed-company-1)"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">As of (YYYY-MM-DD)</p>
                    <input 
                      key="as-of-input-2"
                      type="date"
                      className="mt-1 w-full border rounded px-3 py-2" 
                      value={asOf} 
                      onChange={handleAsOfChange}
                      placeholder="YYYY-MM-DD"
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
                      type="date"
                      className="mt-1 w-full border rounded px-3 py-2" 
                      value={glStart} 
                      onChange={handleGlStartChange}
                      placeholder="YYYY-MM-DD"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <input 
                      key="gl-end-input"
                      type="date"
                      className="mt-1 w-full border rounded px-3 py-2" 
                      value={glEnd} 
                      onChange={handleGlEndChange}
                      placeholder="YYYY-MM-DD"
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
                  <div className="flex items-end gap-2">
                    <div className="flex flex-wrap gap-1">
                      <Button variant="outline" size="sm" onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setDate(end.getDate() - 7);
                        setGlStart(start.toISOString().slice(0,10));
                        setGlEnd(end.toISOString().slice(0,10));
                        setGlPage(1);
                      }}>7D</Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setMonth(end.getMonth() - 1);
                        setGlStart(start.toISOString().slice(0,10));
                        setGlEnd(end.toISOString().slice(0,10));
                        setGlPage(1);
                      }}>1M</Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        const end = new Date();
                        const start = new Date();
                        start.setFullYear(end.getFullYear() - 1);
                        setGlStart(start.toISOString().slice(0,10));
                        setGlEnd(end.toISOString().slice(0,10));
                        setGlPage(1);
                      }}>1Y</Button>
                    </div>
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
                            <td className={density === 'compact' ? 'px-2 py-1' : 'p-2'}>{row.accountCode} {row.accountName}</td>
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
                    <FileText className="h-12 w-12 text-gray-300" />
                    <h3 className="text-lg font-medium mb-2">No ledger entries found</h3>
                    <p className="text-sm mb-4 text-center max-w-md">
                      There are no journal entries with lines for the selected criteria. This could mean:
                    </p>
                    <ul className="text-sm text-left max-w-md mb-4 space-y-1">
                      <li>• No journal entries exist for this date range</li>
                      <li>• Journal entries exist but have no lines</li>
                      <li>• Entries are in a different status (not POSTED or DRAFT)</li>
                    </ul>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => { 
                        setGlAccountId(''); 
                        setGlStart(''); 
                        setGlEnd(''); 
                        setGlPage(1);
                      }}>Reset Filters</Button>
                      <Button variant="outline" size="sm" onClick={() => {
                        // Set a wide date range to show all entries
                        const startDate = new Date();
                        startDate.setFullYear(startDate.getFullYear() - 2); // 2 years ago
                        setGlStart(startDate.toISOString().slice(0,10));
                        setGlEnd(new Date().toISOString().slice(0,10));
                        setGlAccountId('');
                        setGlPage(1);
                      }}>Show All Entries</Button>
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
                  <CardTitle>Income Statement</CardTitle>
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

            {/* Generated Reports Section */}
            {(generatedReports['profit-loss'] || generatedReports['balance-sheet'] || generatedReports['cash-flow']) && (
              <div id="generated-reports-section" className="mt-8">
                <EnhancedFinancialReports 
                  selectedCompany={companyId}
                  defaultReportType={generatedReports['profit-loss'] ? 'profit-loss' : 
                                    generatedReports['balance-sheet'] ? 'balance-sheet' : 
                                    generatedReports['cash-flow'] ? 'cash-flow' : 'profit-loss'}
                  initialData={generatedReports}
                />
              </div>
            )}
          </TabsContent>

          <TabsContent value="reconciliation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Bank Reconciliation</CardTitle>
                <CardDescription>Match your records with bank statements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-3 mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Company</p>
                    <input 
                      className="mt-1 w-full border rounded px-3 py-2"
                      value={companyId}
                      onChange={(e) => setCompanyId(e.target.value)}
                      placeholder="Enter company ID"
                    />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Bank Account ID</p>
                    <select 
                      className="mt-1 w-full border rounded px-3 py-2 text-sm disabled:opacity-50"
                      value={bankAccountId}
                      onChange={(e) => setBankAccountId(e.target.value)}
                      disabled={reconAccLoading}
                    >
                      <option value="">{reconAccLoading ? 'Loading accounts…' : 'Select account…'}</option>
                      {reconAccounts.map((a: any) => (
                        <option key={a.id} value={a.id}>{formatAccountLabel(a)}</option>
                      ))}
                    </select>
                    {!reconAccounts.length && !reconAccLoading && (
                      <div className="text-xs text-muted-foreground mt-1">
                        No accounts found. <button className="underline" onClick={loadAccounts}>Reload accounts</button>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Start Date</p>
                    <div className="flex gap-2">
                      <input 
                        type="date"
                        className="mt-1 w-full border rounded px-3 py-2"
                        placeholder="YYYY-MM-DD"
                        value={reconStart}
                        onChange={(e) => setReconStart(e.target.value)}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Button variant="outline" size="sm" onClick={() => { const d=new Date(); d.setDate(d.getDate()-7); setReconStart(d.toISOString().slice(0,10)); }}>7D</Button>
                      <Button variant="outline" size="sm" onClick={() => { const d=new Date(); d.setDate(d.getDate()-30); setReconStart(d.toISOString().slice(0,10)); }}>30D</Button>
                      <Button variant="outline" size="sm" onClick={() => { const d=new Date(); d.setDate(1); setReconStart(d.toISOString().slice(0,10)); }}>This Mo</Button>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End Date</p>
                    <input 
                      type="date"
                      className="mt-1 w-full border rounded px-3 py-2"
                      placeholder="YYYY-MM-DD"
                      value={reconEnd}
                      onChange={(e) => setReconEnd(e.target.value)}
                    />
                    <div className="flex flex-wrap gap-1 mt-1">
                      <Button variant="outline" size="sm" onClick={() => setReconEnd(new Date().toISOString().slice(0,10))}>Today</Button>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mb-4">
                  <Button variant="outline" onClick={loadAccounts} disabled={!companyId || reconAccLoading}>{reconAccLoading ? 'Loading Accounts...' : 'Reload Accounts'}</Button>
                  <Button variant="outline" onClick={loadReconStatus} disabled={!companyId || !bankAccountId || reconLoading}>Load Status</Button>
                  <Button onClick={loadReconCandidates} disabled={!companyId || !bankAccountId || reconLoading}>Find Candidates</Button>
                  <Button 
                    onClick={async () => {
                      if (!companyId || !bankAccountId) return;
                      setReconLoading(true);
                      try {
                        await Promise.all([loadReconStatus(), loadReconCandidates()]);
                      } finally {
                        setReconLoading(false);
                      }
                    }}
                    disabled={!companyId || !bankAccountId || reconLoading}
                  >
                    Start Reconciliation
                  </Button>
                </div>

                {reconStatus && (
                  <div className="grid md:grid-cols-3 gap-3 mb-4">
                    <div className="p-3 border rounded">
                      <div className="text-xs text-muted-foreground">Matched</div>
                      <div className="text-lg font-semibold">{reconStatus.matchedCount ?? reconStatus.matched ?? 0}</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="text-xs text-muted-foreground">Unmatched Bank</div>
                      <div className="text-lg font-semibold">{reconStatus.unmatchedBankCount ?? reconStatus.unmatchedBank ?? 0}</div>
                    </div>
                    <div className="p-3 border rounded">
                      <div className="text-xs text-muted-foreground">Unmatched Ledger</div>
                      <div className="text-lg font-semibold">{reconStatus.unmatchedLedgerCount ?? reconStatus.unmatchedLedger ?? 0}</div>
                    </div>
                  </div>
                )}

                <div className="border rounded">
                  <div className="p-2 border-b text-sm font-medium">Match Candidates</div>
                  {reconCandidates.length ? (
                    <div className="max-h-[60vh] overflow-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-muted sticky top-0 z-10">
                          <tr>
                            <th className="text-left p-2">Bank Date</th>
                            <th className="text-left p-2">Bank Amount</th>
                            <th className="text-left p-2">Ledger Date</th>
                            <th className="text-left p-2">Ledger Amount</th>
                            <th className="text-left p-2">Similarity</th>
                            <th className="text-right p-2">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reconCandidates.map((c: any) => (
                            <tr key={c.id || `${c.bankTxnId}-${c.ledgerTxnId}`} className="border-t">
                              <td className="p-2">{c.bankDate || c.bankTxn?.date || ''}</td>
                              <td className="p-2">{c.bankAmount ?? c.bankTxn?.amount ?? ''}</td>
                              <td className="p-2">{c.ledgerDate || c.ledgerTxn?.date || ''}</td>
                              <td className="p-2">{c.ledgerAmount ?? c.ledgerTxn?.amount ?? ''}</td>
                              <td className="p-2">{Math.round((c.score ?? c.similarity ?? 0) * 100)}%</td>
                              <td className="p-2 text-right">
                                {c.matchId ? (
                                  <Button size="sm" variant="outline" onClick={() => doUnmatch(c.matchId)} disabled={reconLoading}>Unmatch</Button>
                                ) : (
                                  <Button size="sm" onClick={() => doMatch(c.bankTxnId || c.bankTxn?.id, c.ledgerTxnId || c.ledgerTxn?.id)} disabled={reconLoading}>Match</Button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground p-4">No candidates loaded</div>
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
                    <Button onClick={runFinancialAnalytics} disabled={finAnalyticsLoading}>
                      <Eye className="mr-2 h-4 w-4" />
                      {finAnalyticsLoading ? 'Computing…' : 'Run Analytics'}
                    </Button>
                    {finAnalytics && (
                      <div className="grid grid-cols-2 gap-3 mt-6 text-left max-w-xl mx-auto">
                        <div className="p-3 border rounded">
                          <div className="text-xs text-muted-foreground">Period</div>
                          <div className="text-sm font-medium">{finAnalytics.start} → {finAnalytics.end}</div>
                        </div>
                        <div className="p-3 border rounded">
                          <div className="text-xs text-muted-foreground">Revenue</div>
                          <div className="text-sm font-medium">{finAnalytics.totalRevenue.toLocaleString()}</div>
                        </div>
                        <div className="p-3 border rounded">
                          <div className="text-xs text-muted-foreground">Expenses</div>
                          <div className="text-sm font-medium">{finAnalytics.totalExpenses.toLocaleString()}</div>
                        </div>
                        <div className="p-3 border rounded">
                          <div className="text-xs text-muted-foreground">Net Income</div>
                          <div className="text-sm font-medium">{finAnalytics.netIncome.toLocaleString()}</div>
                        </div>
                        <div className="p-3 border rounded">
                          <div className="text-xs text-muted-foreground">Profit Margin</div>
                          <div className="text-sm font-medium">{finAnalytics.profitMargin}%</div>
                        </div>
                        <div className="p-3 border rounded">
                          <div className="text-xs text-muted-foreground">Net Cash Flow</div>
                          <div className={`text-sm font-medium ${finAnalytics.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>{finAnalytics.netCashFlow.toLocaleString()}</div>
                        </div>
                      </div>
                    )}
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
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="outline" onClick={loadAiInsights} disabled={aiLoading}>
                        {aiLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
                            Loading...
                          </>
                        ) : (
                          'Load Insights'
                        )}
                      </Button>
                      <Button onClick={generateAiInsights} disabled={aiLoading}>
                        {aiLoading ? (
                          <>
                            <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-gray-400"></div>
                            Generating...
                          </>
                        ) : (
                          <>
                            <Activity className="mr-2 h-4 w-4" />
                            Generate
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {aiLoading && (
                      <div className="mt-6 text-center">
                        <div className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg">
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600"></div>
                          AI is analyzing your financial data...
                        </div>
                      </div>
                    )}
                    
                    {aiInsights?.length ? (
                      <div className="mt-6 text-left max-w-2xl mx-auto border rounded divide-y">
                        {aiInsights.slice(0, 5).map((raw: any, idx: number) => {
                          const ins = { ...raw } as any;
                          // Derive friendly fields
                          const category = (ins.category || ins.type || 'financial').toString().replace(/_/g,' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
                          const priority = (ins.priority || ins.impact || 'medium').toString();
                          const confidence = typeof ins.confidence === 'number' ? Math.round(ins.confidence * 100) : undefined;
                          let text = ins.insightText || ins.description || ins.text || ins.summary || '';
                          if (typeof text !== 'string') {
                            try { text = JSON.stringify(text); } catch { text = String(text); }
                          }
                          // If the backend returned a JSON object as string, try to pretty-pick common fields
                          if (text && text.trim().startsWith('{')) {
                            try {
                              const obj = JSON.parse(text);
                              text = obj.description || obj.summary || Object.values(obj).join(' • ');
                            } catch {}
                          }
                          const preview = (text || '—').toString().slice(0, 240);
                          const dateStr = ins.generatedAt ? new Date(ins.generatedAt).toLocaleString() : 'Just generated';
                          const badgeClass = priority === 'high' ? 'text-red-600 bg-red-50 border-red-200' : priority === 'low' ? 'text-muted-foreground bg-gray-50 border-gray-200' : 'text-amber-600 bg-amber-50 border-amber-200';
                          return (
                            <div key={ins.id || idx} className="p-4 hover:bg-gray-50 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm font-medium text-gray-900">{category}</div>
                                <div className={`text-xs px-2 py-1 rounded-full border ${badgeClass}`}>{priority}</div>
                              </div>
                              <div className="text-sm text-gray-700 mb-2 leading-relaxed">{preview}</div>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                {confidence !== undefined ? (
                                  <div className="flex items-center gap-1">
                                    <span>Confidence:</span>
                                    <span className="font-medium">{confidence}%</span>
                                  </div>
                                ) : <span />}
                                <div>{dateStr}</div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-6 text-center py-8 text-gray-500">
                        <Brain className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                        <p>No AI insights available yet</p>
                        <p className="text-sm">Click "Generate" to analyze your financial data</p>
                      </div>
                    )}
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
