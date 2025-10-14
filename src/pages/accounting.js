import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { PageLayout } from '../components/page-layout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../components/ui/tabs';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useTrialBalance, useAccounts, useJournalEntries, useGeneralLedger } from '../hooks/useAccounting';
import { useDemoAuth } from '../hooks/useDemoAuth';
import { config, getCompanyId, getTenantId } from '../lib/config';
import { Download, Plus, Eye, PieChart, Brain, Activity, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import apiService from '../lib/api';
import { ChartOfAccounts } from '../components/chart-of-accounts-enhanced';
import { EnhancedFinancialReports } from '../components/enhanced-financial-reports';
export default function AccountingPage() {
    const { ready: authReady } = useDemoAuth('accounting-page');
    const [searchParams, setSearchParams] = useSearchParams();
    const [error, setError] = useState(null);
    const [companyId, setCompanyId] = useState(getCompanyId());
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
        const handleCompanyChange = (e) => {
            const newCompanyId = e.detail.companyId;
            if (newCompanyId && newCompanyId !== companyId) {
                console.log('🔄 Accounting page - Company changed via custom event from', companyId, 'to', newCompanyId);
                setCompanyId(newCompanyId);
                // Invalidate React Query cache to force refetch with new company ID
                queryClient.invalidateQueries();
                console.log('✅ Accounting page - React Query cache invalidated');
            }
        };
        window.addEventListener('companyChanged', handleCompanyChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('companyChanged', handleCompanyChange);
        };
    }, [companyId, queryClient]);
    // Handle company ID change with proper event handling
    const handleCompanyIdChange = (e) => {
        setCompanyId(e.target.value);
    };
    // Handle date change with proper event handling
    const handleAsOfChange = (e) => {
        setAsOf(e.target.value);
    };
    // Handle general ledger start date change
    const handleGlStartChange = (e) => {
        setGlStart(e.target.value);
        setGlPage(1);
    };
    // Handle general ledger end date change
    const handleGlEndChange = (e) => {
        setGlEnd(e.target.value);
        setGlPage(1);
    };
    // Handle general ledger account change
    const handleGlAccountChange = (e) => {
        setGlAccountId(e.target.value);
        setGlPage(1);
    };
    const [journalPage, setJournalPage] = useState(1);
    const [asOf, setAsOf] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [glStart, setGlStart] = useState(() => {
        const date = new Date();
        date.setMonth(date.getMonth() - 3); // Default to last 3 months
        return date.toISOString().slice(0, 10);
    });
    const [glEnd, setGlEnd] = useState(() => new Date().toISOString().slice(0, 10));
    const [glAccountId, setGlAccountId] = useState('');
    const [glPage, setGlPage] = useState(1);
    const initializedFromUrl = useRef(false);
    const [density, setDensity] = useState('comfortable');
    // Reconciliation state
    const [bankAccountId, setBankAccountId] = useState('');
    const [reconStart, setReconStart] = useState('');
    const [reconEnd, setReconEnd] = useState('');
    const [reconStatus, setReconStatus] = useState(null);
    const [reconCandidates, setReconCandidates] = useState([]);
    const [reconLoading, setReconLoading] = useState(false);
    const [reconAccounts, setReconAccounts] = useState([]);
    const [reconAccLoading, setReconAccLoading] = useState(false);
    const formatAccountLabel = (a) => {
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
        if (!companyId)
            return;
        try {
            setReconAccLoading(true);
            const resp = await apiService.get(`/api/bank-accounts?companyId=${encodeURIComponent(companyId)}`);
            const rows = (resp?.items ?? resp?.data ?? resp);
            const normalized = Array.isArray(rows) ? rows : ((rows && rows.accounts) ? rows.accounts : []);
            setReconAccounts(normalized);
            // Keep current selection if still present; otherwise clear
            if (normalized.length && !normalized.find((a) => a.id === bankAccountId)) {
                setBankAccountId('');
            }
            if (normalized.length) {
                toast.success(`Loaded ${normalized.length} bank account${normalized.length > 1 ? 's' : ''}`);
            }
            else {
                toast.error('No bank accounts found for this company');
            }
        }
        catch (e) {
            console.error('Failed to load accounts', e);
            toast.error('Failed to load bank accounts');
        }
        finally {
            setReconAccLoading(false);
        }
    };
    // Overview data from new backend endpoint
    const [overviewData, setOverviewData] = useState(null);
    const [overviewLoading, setOverviewLoading] = useState(true);
    // Report generation state
    const [reportLoading, setReportLoading] = useState({});
    const [generatedReports, setGeneratedReports] = useState({});
    // Advanced analytics loading state
    const [finAnalyticsLoading, setFinAnalyticsLoading] = useState(false);
    const [finAnalytics, setFinAnalytics] = useState(null);
    const runFinancialAnalytics = async () => {
        try {
            setFinAnalyticsLoading(true);
            const end = new Date();
            const start = new Date();
            start.setMonth(end.getMonth() - 5); // last 6 months inclusive
            const startStr = start.toISOString().slice(0, 10);
            const endStr = end.toISOString().slice(0, 10);
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
                totalRevenue = monthlyTrend.reduce((sum, month) => sum + (month.revenue || 0), 0);
                totalExpenses = monthlyTrend.reduce((sum, month) => sum + Math.abs(month.expenses || 0), 0);
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
            }
            else {
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
        }
        catch (e) {
            console.error('Failed to compute financial analytics', e);
            toast.error('Failed to load financial analytics');
        }
        finally {
            setFinAnalyticsLoading(false);
        }
    };
    // AI Insights state (no UI change, used for API integration and toasts)
    const [aiLoading, setAiLoading] = useState(false);
    const [aiInsights, setAiInsights] = useState([]);
    const loadAiInsights = async () => {
        if (!companyId)
            return;
        setAiLoading(true);
        try {
            const data = await apiService.get(`/api/ai/insights?companyId=${encodeURIComponent(companyId)}`);
            const list = Array.isArray(data?.data) ? data.data : (Array.isArray(data) ? data : []);
            setAiInsights(list);
            toast.success(`Loaded ${list.length} AI insight${list.length === 1 ? '' : 's'}`);
            if (list.length > 0) {
                // Surface the first insight in console for quick inspection without UI changes
                // eslint-disable-next-line no-console
                console.info('AI Insights sample:', list[0]);
            }
        }
        catch (e) {
            console.error('Failed to load AI insights', e);
            toast.error('Failed to load AI insights');
        }
        finally {
            setAiLoading(false);
        }
    };
    const generateAiInsights = async () => {
        if (!companyId)
            return;
        setAiLoading(true);
        // Show progress toast
        const progressToast = toast.loading('Analyzing financial data with AI...', {
            duration: 30000 // 30 seconds max
        });
        try {
            const resp = await apiService.post('/api/llama-ai/analysis/financial-insights', { companyId });
            // Handle the response structure from Llama AI
            let insightsToSave = [];
            if (resp?.success && resp?.data) {
                const aiData = resp.data;
                // Extract insights from the AI response
                if (aiData.insights && Array.isArray(aiData.insights)) {
                    insightsToSave = aiData.insights.map((insight) => ({
                        category: insight.type || 'financial',
                        insightText: insight.description || aiData.message || '',
                        priority: insight.impact === 'high' ? 'high' : insight.impact === 'low' ? 'low' : 'medium',
                        confidence: insight.confidence || aiData.confidence || 0.8
                    }));
                }
                else {
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
                    aiData.suggestions.forEach((suggestion) => {
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
                        }
                        catch (saveError) {
                            console.warn('Failed to save insight:', saveError);
                        }
                    }
                }
                catch (saveError) {
                    console.warn('Failed to save insights:', saveError);
                }
            }
            // Reload from DB to show persisted insights
            await loadAiInsights();
        }
        catch (e) {
            console.error('Failed to generate AI insights', e);
            toast.dismiss(progressToast);
            toast.error('Failed to generate AI insights');
        }
        finally {
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
                    if (!cancelled)
                        setOverviewData(json);
                }
                else {
                    // Fallback to sample data
                    const sample = {
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
                    if (!cancelled)
                        setOverviewData(sample);
                }
            }
            catch (err) {
                if (!cancelled) {
                    console.error('Error fetching overview:', err);
                }
            }
            finally {
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
    const { data: trialBalance, isLoading: tbLoading } = useTrialBalance({ asOf: asOf || new Date().toISOString().slice(0, 10), companyId });
    const { data: accounts = [], isLoading: accLoading } = useAccounts({ companyId });
    const { data: journal } = useJournalEntries({ companyId, page: journalPage, pageSize: 10 });
    const { data: glData, isLoading: glLoading } = useGeneralLedger({
        companyId,
        startDate: glStart || new Date().toISOString().slice(0, 10),
        endDate: glEnd || new Date().toISOString().slice(0, 10),
        accountId: glAccountId || undefined,
        page: glPage,
        pageSize: 10,
    });
    // Debug General Ledger data
    console.log('General Ledger Debug:', {
        companyId,
        glStart,
        glEnd,
        glAccountId,
        glPage,
        glLoading,
        glData: glData ? {
            entries: glData?.entries?.length || 0,
            pagination: glData?.pagination,
            hasData: !!glData?.entries?.length
        } : null
    });
    const exportGlCsv = () => {
        const glEntries = glData?.entries || [];
        if (!glEntries.length)
            return;
        const headers = ['Date', 'Reference', 'Memo', 'Debit', 'Credit', 'Account'];
        const rows = glEntries.map((r) => [
            (r.date?.slice(0, 10) || ''),
            r.reference || '',
            r.description || '',
            String(r.debit ?? ''),
            String(r.credit ?? ''),
            `${r.account?.code || ''} ${r.account?.name || ''}`.trim()
        ]);
        const csv = [headers, ...rows]
            .map(line => line.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
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
        const entries = (glData?.entries || []);
        const d = entries.reduce((acc, r) => acc + Number(r.debit || 0), 0);
        const c = entries.reduce((acc, r) => acc + Number(r.credit || 0), 0);
        return { d, c, diff: d - c };
    }, [glData]);
    useEffect(() => {
        if (!authReady)
            return;
        setError(null);
    }, [authReady]);
    // GL data is handled by hook above
    const navigate = useNavigate();
    // Helper to update URL query params without full reload
    const replaceQuery = (updates) => {
        const current = new URLSearchParams(searchParams || '');
        Object.entries(updates).forEach(([k, v]) => {
            if (v === undefined || v === '')
                current.delete(k);
            else
                current.set(k, String(v));
        });
        setSearchParams(current);
    };
    // Auto-load accounts when company changes
    useEffect(() => {
        if (companyId) {
            loadAccounts();
        }
        else {
            setReconAccounts([]);
            setBankAccountId('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [companyId]);
    // Reconciliation handlers
    const loadReconStatus = async () => {
        if (!companyId || !bankAccountId)
            return;
        setReconLoading(true);
        try {
            // Fetch totals from backend for accuracy
            const qs = new URLSearchParams({ companyId, bankAccountId });
            if (reconStart)
                qs.set('startDate', reconStart);
            if (reconEnd)
                qs.set('endDate', reconEnd);
            const resp = await apiService.get(`/api/reconciliation/status?${qs.toString()}`);
            const data = resp?.data ?? resp ?? null;
            setReconStatus(data);
            if (data && typeof data.matchedCount === 'number') {
                toast.success(`Status loaded • Matched ${data.matchedCount}, Unmatched ${data.unmatchedBankCount}`);
            }
        }
        catch (e) {
            console.error('Failed to load reconciliation status', e);
            toast.error('Failed to load reconciliation status');
            setReconStatus(null);
        }
        finally {
            setReconLoading(false);
        }
    };
    const loadReconCandidates = async () => {
        if (!companyId || !bankAccountId)
            return;
        setReconLoading(true);
        try {
            // 1) Fetch recent bank transactions for this account (filter by date if provided)
            const params = new URLSearchParams({ companyId, bankAccountId, page: '1', pageSize: '20' });
            const listResp = await apiService.get(`/api/bank-transactions?${params.toString()}`);
            const listBody = listResp?.data ?? listResp ?? {};
            const bankTxns = (listBody.items || listBody.transactions || []);
            // 2) For each bank transaction, request matches
            const candidatesAgg = [];
            for (const t of bankTxns) {
                try {
                    const matchResp = await apiService.post(`/api/bank-transactions/${encodeURIComponent(t.id)}/find-matches?companyId=${encodeURIComponent(companyId)}`, {});
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
                }
                catch (err) {
                    // ignore match errors per transaction
                }
            }
            setReconCandidates(candidatesAgg);
            toast.success(`Found ${candidatesAgg.length} candidate${candidatesAgg.length === 1 ? '' : 's'}`);
        }
        catch (e) {
            console.error('Failed to load reconciliation candidates', e);
            toast.error('Failed to load candidates');
            setReconCandidates([]);
        }
        finally {
            setReconLoading(false);
        }
    };
    const doMatch = async (bankTxnId, ledgerTxnId) => {
        if (!companyId || !bankAccountId || !bankTxnId || !ledgerTxnId)
            return;
        setReconLoading(true);
        try {
            await apiService.post('/api/reconciliation/match', { companyId, bankAccountId, bankTxnId, ledgerTxnId });
            toast.success('Matched successfully');
            await Promise.all([loadReconStatus(), loadReconCandidates()]);
        }
        catch (e) {
            console.error('Match failed', e);
            toast.error('Match failed');
        }
        finally {
            setReconLoading(false);
        }
    };
    const doUnmatch = async (matchId) => {
        if (!companyId || !bankAccountId || !matchId)
            return;
        setReconLoading(true);
        try {
            await apiService.post('/api/reconciliation/unmatch', { companyId, bankAccountId, matchId });
            toast.success('Unmatched successfully');
            await Promise.all([loadReconStatus(), loadReconCandidates()]);
        }
        catch (e) {
            console.error('Unmatch failed', e);
            toast.error('Unmatch failed');
        }
        finally {
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
        if (!mounted || initializedFromUrl.current || !searchParams)
            return;
        const get = (k) => searchParams.get(k) || '';
        const cid = get('cid');
        if (cid)
            setCompanyId(cid);
        const a = get('asOf');
        if (a)
            setAsOf(a);
        const t = get('tab');
        if (t)
            setActiveTab(t);
        const s = get('glStart');
        if (s)
            setGlStart(s);
        const e = get('glEnd');
        if (e)
            setGlEnd(e);
        const acc = get('glAcc');
        if (acc)
            setGlAccountId(acc);
        const gp = get('glPage');
        if (gp)
            setGlPage(Number(gp) || 1);
        const jp = get('journalPage');
        if (jp)
            setJournalPage(Number(jp) || 1);
        initializedFromUrl.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mounted, searchParams]);
    // Reflect filters to URL when they change and sync with localStorage
    useEffect(() => {
        if (initializedFromUrl.current)
            replaceQuery({ cid: companyId });
        // Sync with localStorage
        if (typeof window !== 'undefined') {
            localStorage.setItem('company_id', companyId);
        }
    }, [companyId]);
    useEffect(() => { if (initializedFromUrl.current)
        replaceQuery({ asOf }); }, [asOf]);
    useEffect(() => { if (initializedFromUrl.current)
        replaceQuery({ tab: activeTab }); }, [activeTab]);
    useEffect(() => { if (initializedFromUrl.current)
        replaceQuery({ glStart }); }, [glStart]);
    useEffect(() => { if (initializedFromUrl.current)
        replaceQuery({ glEnd }); }, [glEnd]);
    useEffect(() => { if (initializedFromUrl.current)
        replaceQuery({ glAcc: glAccountId }); }, [glAccountId]);
    useEffect(() => { if (initializedFromUrl.current)
        replaceQuery({ glPage }); }, [glPage]);
    useEffect(() => { if (initializedFromUrl.current)
        replaceQuery({ journalPage }); }, [journalPage]);
    // Report generation functions
    const generateReport = async (reportType) => {
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
        }
        catch (error) {
            console.error(`Error generating ${reportType}:`, error);
            toast.error(`Failed to generate ${reportType.replace('-', ' ')}`);
        }
        finally {
            setReportLoading(prev => ({ ...prev, [reportType]: false }));
        }
    };
    if (!mounted) {
        return (_jsx(PageLayout, { children: _jsx("div", { className: "space-y-6", children: _jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: _jsx("div", { className: "text-center", children: _jsx("p", { className: "text-muted-foreground", children: "Loading\u2026" }) }) }) }) }));
    }
    const loading = tbLoading || accLoading || glLoading || overviewLoading;
    if (loading) {
        return (_jsx(PageLayout, { children: _jsx("div", { className: "space-y-6", children: _jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: _jsxs("div", { className: "text-center", children: [_jsx(Loader2, { className: "mx-auto h-8 w-8 animate-spin text-muted-foreground mb-4" }), _jsx("p", { className: "text-muted-foreground", children: "Loading accounting overview..." })] }) }) }) }));
    }
    if (error) {
        return (_jsx(PageLayout, { children: _jsx("div", { className: "space-y-6", children: _jsx("div", { className: "flex items-center justify-center min-h-[400px]", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "text-red-600 mb-4", children: "Failed to load accounting data" }), _jsx("p", { className: "text-sm text-muted-foreground mb-4", children: error || 'Unknown error' }), _jsx(Button, { onClick: () => window.location.reload(), variant: "outline", children: "Try Again" })] }) }) }) }));
    }
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold tracking-tight", children: "Financial Management" }), _jsx("p", { className: "text-muted-foreground", children: "Comprehensive accounting tools and financial insights for your business" })] }), _jsxs("div", { className: "flex space-x-2", children: [_jsxs(Button, { variant: "outline", onClick: () => navigate('/reports'), children: [_jsx(Download, { className: "mr-2 h-4 w-4" }), "Export Report"] }), _jsxs(Button, { onClick: () => navigate('/dashboard/journal/new'), children: [_jsx(Plus, { className: "mr-2 h-4 w-4" }), "New Entry"] })] })] }), _jsxs("div", { className: "flex flex-wrap items-center gap-2 -mt-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: "Company" }), _jsx("input", { className: "h-8 w-48 border rounded px-2 text-sm", value: companyId, onChange: handleCompanyIdChange, placeholder: "Enter company ID (e.g., seed-company-1)" }, "company-id-input")] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: "Date" }), _jsxs("div", { className: "inline-flex rounded-md border overflow-hidden", children: [_jsx("button", { className: "px-2 py-1 text-xs hover:bg-muted", onClick: () => setAsOf(new Date().toISOString().slice(0, 10)), children: "Today" }), _jsx("button", { className: "px-2 py-1 text-xs hover:bg-muted", onClick: () => setAsOf(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)), children: "7D" }), _jsx("button", { className: "px-2 py-1 text-xs hover:bg-muted", onClick: () => setAsOf(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)), children: "30D" })] }), _jsx("input", { type: "date", className: "h-8 w-40 border rounded px-2 text-sm", placeholder: "YYYY-MM-DD", value: asOf, onChange: handleAsOfChange }, "as-of-input")] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, className: "space-y-6", children: [_jsxs(TabsList, { className: "grid w-full grid-cols-6", children: [_jsx(TabsTrigger, { value: "overview", children: "Overview" }), _jsx(TabsTrigger, { value: "chart-of-accounts", children: "Chart of Accounts" }), _jsx(TabsTrigger, { value: "journal-entries", children: "Journal Entries" }), _jsx(TabsTrigger, { value: "reports", children: "Financial Reports" }), _jsx(TabsTrigger, { value: "reconciliation", children: "Reconciliation" }), _jsx(TabsTrigger, { value: "analytics", children: "Analytics" })] }), _jsxs(TabsContent, { value: "overview", className: "space-y-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "py-4", children: _jsxs("div", { className: "grid md:grid-cols-4 gap-3", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Company" }), _jsx("input", { className: "mt-1 w-full border rounded px-3 py-2", value: companyId, onChange: handleCompanyIdChange, placeholder: "Enter company ID (e.g., seed-company-1)" }, "company-id-input-2")] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "As of (YYYY-MM-DD)" }), _jsx("input", { type: "date", className: "mt-1 w-full border rounded px-3 py-2", value: asOf, onChange: handleAsOfChange, placeholder: "YYYY-MM-DD" }, "as-of-input-2")] }), _jsx("div", { className: "flex items-end", children: _jsx(Button, { variant: "outline", onClick: () => setJournalPage(1), disabled: loading, children: "Apply" }) })] }) }) }), _jsxs("div", { className: "grid gap-6 md:grid-cols-3", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Quick Stats" }), _jsx(CardDescription, { children: "Overview from trial balance" })] }), _jsxs(CardContent, { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Assets" }), _jsx("span", { className: "text-base font-semibold text-foreground", children: quickStats.assets.toLocaleString() })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Entries" }), _jsx("span", { className: "text-base font-semibold text-foreground", children: quickStats.entries })] }), _jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-muted-foreground", children: "Balanced" }), _jsx("span", { className: quickStats.balanceOk ? 'text-green-600 font-medium' : 'text-red-600 font-medium', children: quickStats.balanceOk ? 'Yes' : 'No' })] })] })] }), _jsxs(Card, { className: "md:col-span-2", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Trial Balance" }), _jsx(CardDescription, { children: "Debits and credits summary" })] }), _jsx(CardContent, { children: trialBalance ? (_jsxs("div", { className: "grid grid-cols-3 gap-3 text-sm", children: [_jsxs("div", { className: "p-3 rounded-md border bg-muted/30", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Total Debits" }), _jsx("div", { className: "text-lg font-semibold", children: trialBalance.totalDebits.toLocaleString() })] }), _jsxs("div", { className: "p-3 rounded-md border bg-muted/30", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Total Credits" }), _jsx("div", { className: "text-lg font-semibold", children: trialBalance.totalCredits.toLocaleString() })] }), _jsxs("div", { className: "p-3 rounded-md border bg-muted/30", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Difference" }), _jsx("div", { className: `text-lg font-semibold ${trialBalance.totalDebits - trialBalance.totalCredits === 0 ? 'text-green-600' : 'text-amber-600'}`, children: (trialBalance.totalDebits - trialBalance.totalCredits).toFixed(2) })] })] })) : (_jsx("div", { className: "text-sm text-muted-foreground", children: "No trial balance data" })) })] })] }), _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Journal Entries" }) }), _jsxs(CardContent, { children: [(journal?.entries?.length) ? (_jsx("ul", { className: "text-sm space-y-2", children: (journal.entries || []).slice(0, 5).map((e) => (_jsxs("li", { className: "flex justify-between", children: [_jsx("span", { children: e.date?.slice(0, 10) || '' }), _jsxs("span", { children: [e.lines?.length || 0, " lines"] })] }, e.id))) })) : (_jsx("div", { className: "text-sm text-muted-foreground", children: "No entries" })), _jsxs("div", { className: "flex justify-end gap-2 mt-3", children: [_jsx(Button, { variant: "outline", size: "sm", disabled: journalPage <= 1 || loading, onClick: () => setJournalPage(p => Math.max(1, p - 1)), children: "Prev" }), _jsx(Button, { variant: "outline", size: "sm", disabled: loading || (journal?.entries?.length ?? 0) < 10, onClick: () => setJournalPage(p => p + 1), children: "Next" })] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Accounts" }) }), _jsx(CardContent, { children: accounts?.length ? (_jsx("ul", { className: "text-sm max-h-48 overflow-auto space-y-1", children: accounts.slice(0, 10).map((a) => (_jsxs("li", { className: "flex justify-between", children: [_jsxs("button", { className: "text-left hover:underline", onClick: () => { setGlAccountId(a.id); setActiveTab('journal-entries'); }, children: [a.code, " ", a.name] }), _jsx("span", { className: "text-muted-foreground", children: a.isActive === false ? 'Inactive' : '' })] }, a.id))) })) : (_jsx("div", { className: "text-sm text-muted-foreground", children: "No accounts" })) })] })] })] }), _jsx(TabsContent, { value: "chart-of-accounts", className: "space-y-6", children: _jsx(Card, { children: _jsx(CardContent, { className: "py-4", children: _jsx(ChartOfAccounts, {}) }) }) }), _jsx(TabsContent, { value: "journal-entries", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "General Ledger" }), _jsx(CardDescription, { children: "Filter by date range and account; click accounts to deep-link" }), _jsxs("div", { className: "flex items-center gap-2 mt-2", children: [_jsx("span", { className: "text-xs text-muted-foreground", children: "Density" }), _jsxs("div", { className: "inline-flex rounded-md border", children: [_jsx("button", { className: `px-2 py-1 text-xs ${density === 'comfortable' ? 'bg-muted' : ''}`, onClick: () => setDensity('comfortable'), children: "Comfortable" }), _jsx("button", { className: `px-2 py-1 text-xs ${density === 'compact' ? 'bg-muted' : ''}`, onClick: () => setDensity('compact'), children: "Compact" })] })] })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid md:grid-cols-5 gap-3 mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Start Date" }), _jsx("input", { type: "date", className: "mt-1 w-full border rounded px-3 py-2", value: glStart, onChange: handleGlStartChange, placeholder: "YYYY-MM-DD" }, "gl-start-input")] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "End Date" }), _jsx("input", { type: "date", className: "mt-1 w-full border rounded px-3 py-2", value: glEnd, onChange: handleGlEndChange, placeholder: "YYYY-MM-DD" }, "gl-end-input")] }), _jsxs("div", { className: "md:col-span-2", children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Account" }), _jsxs("select", { className: "mt-1 w-full border rounded px-3 py-2", value: glAccountId, onChange: handleGlAccountChange, children: [_jsx("option", { value: "", children: "All Accounts" }), (accounts || []).map((a) => (_jsxs("option", { value: a.id, children: [a.code, " ", a.name] }, a.id)))] }, "gl-account-select")] }), _jsxs("div", { className: "flex items-end gap-2", children: [_jsxs("div", { className: "flex flex-wrap gap-1", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                            const end = new Date();
                                                                            const start = new Date();
                                                                            start.setDate(end.getDate() - 7);
                                                                            setGlStart(start.toISOString().slice(0, 10));
                                                                            setGlEnd(end.toISOString().slice(0, 10));
                                                                            setGlPage(1);
                                                                        }, children: "7D" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                            const end = new Date();
                                                                            const start = new Date();
                                                                            start.setMonth(end.getMonth() - 1);
                                                                            setGlStart(start.toISOString().slice(0, 10));
                                                                            setGlEnd(end.toISOString().slice(0, 10));
                                                                            setGlPage(1);
                                                                        }, children: "1M" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                            const end = new Date();
                                                                            const start = new Date();
                                                                            start.setFullYear(end.getFullYear() - 1);
                                                                            setGlStart(start.toISOString().slice(0, 10));
                                                                            setGlEnd(end.toISOString().slice(0, 10));
                                                                            setGlPage(1);
                                                                        }, children: "1Y" })] }), _jsx(Button, { variant: "outline", onClick: () => setGlPage(1), children: "Apply" })] })] }), (glData?.entries?.length) ? (_jsxs("div", { className: "overflow-auto max-h-[60vh] border rounded-md", children: [_jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-muted sticky top-0 z-10", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left p-2", children: "Date" }), _jsx("th", { className: "text-left p-2", children: "Reference" }), _jsx("th", { className: "text-left p-2", children: "Memo" }), _jsx("th", { className: "text-right p-2", children: "Debit" }), _jsx("th", { className: "text-right p-2", children: "Credit" }), _jsx("th", { className: "text-left p-2", children: "Account" })] }) }), _jsx("tbody", { children: (glData.entries || []).map((row) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: density === 'compact' ? 'px-2 py-1' : 'p-2', children: row.date?.slice(0, 10) || '' }), _jsx("td", { className: density === 'compact' ? 'px-2 py-1' : 'p-2', children: row.reference || '' }), _jsx("td", { className: density === 'compact' ? 'px-2 py-1' : 'p-2', children: row.description || '' }), _jsx("td", { className: `${density === 'compact' ? 'px-2 py-1' : 'p-2'} text-right`, children: row.debit }), _jsx("td", { className: `${density === 'compact' ? 'px-2 py-1' : 'p-2'} text-right`, children: row.credit }), _jsxs("td", { className: density === 'compact' ? 'px-2 py-1' : 'p-2', children: [row.accountCode, " ", row.accountName] })] }, row.id))) })] }), _jsx("div", { className: "sticky bottom-0 bg-background/95 backdrop-blur border-t", children: _jsxs("div", { className: "flex items-center justify-between gap-2 p-2", children: [_jsxs("div", { className: "flex flex-wrap items-center gap-2 text-xs", children: [_jsxs("span", { className: "px-2 py-1 rounded bg-slate-100", children: ["Debit: ", glTotals.d.toFixed(2)] }), _jsxs("span", { className: "px-2 py-1 rounded bg-slate-100", children: ["Credit: ", glTotals.c.toFixed(2)] }), _jsxs("span", { className: "px-2 py-1 rounded bg-slate-100", children: ["Diff: ", glTotals.diff.toFixed(2)] }), typeof glData?.runningBalance === 'number' && (_jsxs("span", { className: "px-2 py-1 rounded bg-slate-100", children: ["Running Balance: ", Number(glData.runningBalance).toFixed(2)] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: exportGlCsv, children: "Export CSV" }), _jsx(Button, { variant: "outline", size: "sm", disabled: glData?.pagination?.hasPrev === false, onClick: () => setGlPage(p => Math.max(1, p - 1)), children: "Prev" }), _jsx(Button, { variant: "outline", size: "sm", disabled: glData?.pagination?.hasNext === false, onClick: () => setGlPage(p => p + 1), children: "Next" })] })] }) })] })) : (_jsxs("div", { className: "text-sm text-muted-foreground flex flex-col items-center justify-center gap-2 py-8", children: [_jsx(FileText, { className: "h-12 w-12 text-gray-300" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "No ledger entries found" }), _jsx("p", { className: "text-sm mb-4 text-center max-w-md", children: "There are no journal entries with lines for the selected criteria. This could mean:" }), _jsxs("ul", { className: "text-sm text-left max-w-md mb-4 space-y-1", children: [_jsx("li", { children: "\u2022 No journal entries exist for this date range" }), _jsx("li", { children: "\u2022 Journal entries exist but have no lines" }), _jsx("li", { children: "\u2022 Entries are in a different status (not POSTED or DRAFT)" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                    setGlAccountId('');
                                                                    setGlStart('');
                                                                    setGlEnd('');
                                                                    setGlPage(1);
                                                                }, children: "Reset Filters" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                                    // Set a wide date range to show all entries
                                                                    const startDate = new Date();
                                                                    startDate.setFullYear(startDate.getFullYear() - 2); // 2 years ago
                                                                    setGlStart(startDate.toISOString().slice(0, 10));
                                                                    setGlEnd(new Date().toISOString().slice(0, 10));
                                                                    setGlAccountId('');
                                                                    setGlPage(1);
                                                                }, children: "Show All Entries" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => setActiveTab('overview'), children: "Go to Overview" })] })] }))] })] }) }), _jsxs(TabsContent, { value: "reports", className: "space-y-6", children: [_jsxs("div", { className: "grid gap-6 md:grid-cols-2 lg:grid-cols-3", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Income Statement" }), _jsx(CardDescription, { children: "Profit and loss report" })] }), _jsx(CardContent, { children: _jsx("div", { className: "text-center py-4", children: _jsx(Button, { variant: "outline", className: "w-full", onClick: () => generateReport('profit-loss'), disabled: reportLoading['profit-loss'], children: reportLoading['profit-loss'] ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Generating..."] })) : ('Generate Report') }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Balance Sheet" }), _jsx(CardDescription, { children: "Assets, liabilities, and equity" })] }), _jsx(CardContent, { children: _jsx("div", { className: "text-center py-4", children: _jsx(Button, { variant: "outline", className: "w-full", onClick: () => generateReport('balance-sheet'), disabled: reportLoading['balance-sheet'], children: reportLoading['balance-sheet'] ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Generating..."] })) : ('Generate Report') }) }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Cash Flow" }), _jsx(CardDescription, { children: "Cash flow statement" })] }), _jsx(CardContent, { children: _jsx("div", { className: "text-center py-4", children: _jsx(Button, { variant: "outline", className: "w-full", onClick: () => generateReport('cash-flow'), disabled: reportLoading['cash-flow'], children: reportLoading['cash-flow'] ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "w-4 h-4 mr-2 animate-spin" }), "Generating..."] })) : ('Generate Report') }) }) })] })] }), (generatedReports['profit-loss'] || generatedReports['balance-sheet'] || generatedReports['cash-flow']) && (_jsx("div", { id: "generated-reports-section", className: "mt-8", children: _jsx(EnhancedFinancialReports, { selectedCompany: companyId, defaultReportType: generatedReports['profit-loss'] ? 'profit-loss' :
                                            generatedReports['balance-sheet'] ? 'balance-sheet' :
                                                generatedReports['cash-flow'] ? 'cash-flow' : 'profit-loss', initialData: generatedReports }) }))] }), _jsx(TabsContent, { value: "reconciliation", className: "space-y-6", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Bank Reconciliation" }), _jsx(CardDescription, { children: "Match your records with bank statements" })] }), _jsxs(CardContent, { children: [_jsxs("div", { className: "grid md:grid-cols-4 gap-3 mb-4", children: [_jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Company" }), _jsx("input", { className: "mt-1 w-full border rounded px-3 py-2", value: companyId, onChange: (e) => setCompanyId(e.target.value), placeholder: "Enter company ID" })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Bank Account ID" }), _jsxs("select", { className: "mt-1 w-full border rounded px-3 py-2 text-sm disabled:opacity-50", value: bankAccountId, onChange: (e) => setBankAccountId(e.target.value), disabled: reconAccLoading, children: [_jsx("option", { value: "", children: reconAccLoading ? 'Loading accounts…' : 'Select account…' }), reconAccounts.map((a) => (_jsx("option", { value: a.id, children: formatAccountLabel(a) }, a.id)))] }), !reconAccounts.length && !reconAccLoading && (_jsxs("div", { className: "text-xs text-muted-foreground mt-1", children: ["No accounts found. ", _jsx("button", { className: "underline", onClick: loadAccounts, children: "Reload accounts" })] }))] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "Start Date" }), _jsx("div", { className: "flex gap-2", children: _jsx("input", { type: "date", className: "mt-1 w-full border rounded px-3 py-2", placeholder: "YYYY-MM-DD", value: reconStart, onChange: (e) => setReconStart(e.target.value) }) }), _jsxs("div", { className: "flex flex-wrap gap-1 mt-1", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => { const d = new Date(); d.setDate(d.getDate() - 7); setReconStart(d.toISOString().slice(0, 10)); }, children: "7D" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => { const d = new Date(); d.setDate(d.getDate() - 30); setReconStart(d.toISOString().slice(0, 10)); }, children: "30D" }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => { const d = new Date(); d.setDate(1); setReconStart(d.toISOString().slice(0, 10)); }, children: "This Mo" })] })] }), _jsxs("div", { children: [_jsx("p", { className: "text-xs text-muted-foreground", children: "End Date" }), _jsx("input", { type: "date", className: "mt-1 w-full border rounded px-3 py-2", placeholder: "YYYY-MM-DD", value: reconEnd, onChange: (e) => setReconEnd(e.target.value) }), _jsx("div", { className: "flex flex-wrap gap-1 mt-1", children: _jsx(Button, { variant: "outline", size: "sm", onClick: () => setReconEnd(new Date().toISOString().slice(0, 10)), children: "Today" }) })] })] }), _jsxs("div", { className: "flex gap-2 mb-4", children: [_jsx(Button, { variant: "outline", onClick: loadAccounts, disabled: !companyId || reconAccLoading, children: reconAccLoading ? 'Loading Accounts...' : 'Reload Accounts' }), _jsx(Button, { variant: "outline", onClick: loadReconStatus, disabled: !companyId || !bankAccountId || reconLoading, children: "Load Status" }), _jsx(Button, { onClick: loadReconCandidates, disabled: !companyId || !bankAccountId || reconLoading, children: "Find Candidates" }), _jsx(Button, { onClick: async () => {
                                                            if (!companyId || !bankAccountId)
                                                                return;
                                                            setReconLoading(true);
                                                            try {
                                                                await Promise.all([loadReconStatus(), loadReconCandidates()]);
                                                            }
                                                            finally {
                                                                setReconLoading(false);
                                                            }
                                                        }, disabled: !companyId || !bankAccountId || reconLoading, children: "Start Reconciliation" })] }), reconStatus && (_jsxs("div", { className: "grid md:grid-cols-3 gap-3 mb-4", children: [_jsxs("div", { className: "p-3 border rounded", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Matched" }), _jsx("div", { className: "text-lg font-semibold", children: reconStatus.matchedCount ?? reconStatus.matched ?? 0 })] }), _jsxs("div", { className: "p-3 border rounded", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Unmatched Bank" }), _jsx("div", { className: "text-lg font-semibold", children: reconStatus.unmatchedBankCount ?? reconStatus.unmatchedBank ?? 0 })] }), _jsxs("div", { className: "p-3 border rounded", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Unmatched Ledger" }), _jsx("div", { className: "text-lg font-semibold", children: reconStatus.unmatchedLedgerCount ?? reconStatus.unmatchedLedger ?? 0 })] })] })), _jsxs("div", { className: "border rounded", children: [_jsx("div", { className: "p-2 border-b text-sm font-medium", children: "Match Candidates" }), reconCandidates.length ? (_jsx("div", { className: "max-h-[60vh] overflow-auto", children: _jsxs("table", { className: "w-full text-sm", children: [_jsx("thead", { className: "bg-muted sticky top-0 z-10", children: _jsxs("tr", { children: [_jsx("th", { className: "text-left p-2", children: "Bank Date" }), _jsx("th", { className: "text-left p-2", children: "Bank Amount" }), _jsx("th", { className: "text-left p-2", children: "Ledger Date" }), _jsx("th", { className: "text-left p-2", children: "Ledger Amount" }), _jsx("th", { className: "text-left p-2", children: "Similarity" }), _jsx("th", { className: "text-right p-2", children: "Action" })] }) }), _jsx("tbody", { children: reconCandidates.map((c) => (_jsxs("tr", { className: "border-t", children: [_jsx("td", { className: "p-2", children: c.bankDate || c.bankTxn?.date || '' }), _jsx("td", { className: "p-2", children: c.bankAmount ?? c.bankTxn?.amount ?? '' }), _jsx("td", { className: "p-2", children: c.ledgerDate || c.ledgerTxn?.date || '' }), _jsx("td", { className: "p-2", children: c.ledgerAmount ?? c.ledgerTxn?.amount ?? '' }), _jsxs("td", { className: "p-2", children: [Math.round((c.score ?? c.similarity ?? 0) * 100), "%"] }), _jsx("td", { className: "p-2 text-right", children: c.matchId ? (_jsx(Button, { size: "sm", variant: "outline", onClick: () => doUnmatch(c.matchId), disabled: reconLoading, children: "Unmatch" })) : (_jsx(Button, { size: "sm", onClick: () => doMatch(c.bankTxnId || c.bankTxn?.id, c.ledgerTxnId || c.ledgerTxn?.id), disabled: reconLoading, children: "Match" })) })] }, c.id || `${c.bankTxnId}-${c.ledgerTxnId}`))) })] }) })) : (_jsx("div", { className: "text-sm text-muted-foreground p-4", children: "No candidates loaded" }))] })] })] }) }), _jsx(TabsContent, { value: "analytics", className: "space-y-6", children: _jsxs("div", { className: "grid gap-6 md:grid-cols-2", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Financial Analytics" }), _jsx(CardDescription, { children: "Advanced financial insights and trends" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx(PieChart, { className: "mx-auto h-12 w-12 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "Analytics Dashboard" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "View detailed financial analytics" }), _jsxs(Button, { onClick: runFinancialAnalytics, disabled: finAnalyticsLoading, children: [_jsx(Eye, { className: "mr-2 h-4 w-4" }), finAnalyticsLoading ? 'Computing…' : 'Run Analytics'] }), finAnalytics && (_jsxs("div", { className: "grid grid-cols-2 gap-3 mt-6 text-left max-w-xl mx-auto", children: [_jsxs("div", { className: "p-3 border rounded", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Period" }), _jsxs("div", { className: "text-sm font-medium", children: [finAnalytics.start, " \u2192 ", finAnalytics.end] })] }), _jsxs("div", { className: "p-3 border rounded", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Revenue" }), _jsx("div", { className: "text-sm font-medium", children: finAnalytics.totalRevenue.toLocaleString() })] }), _jsxs("div", { className: "p-3 border rounded", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Expenses" }), _jsx("div", { className: "text-sm font-medium", children: finAnalytics.totalExpenses.toLocaleString() })] }), _jsxs("div", { className: "p-3 border rounded", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Net Income" }), _jsx("div", { className: "text-sm font-medium", children: finAnalytics.netIncome.toLocaleString() })] }), _jsxs("div", { className: "p-3 border rounded", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Profit Margin" }), _jsxs("div", { className: "text-sm font-medium", children: [finAnalytics.profitMargin, "%"] })] }), _jsxs("div", { className: "p-3 border rounded", children: [_jsx("div", { className: "text-xs text-muted-foreground", children: "Net Cash Flow" }), _jsx("div", { className: `text-sm font-medium ${finAnalytics.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`, children: finAnalytics.netCashFlow.toLocaleString() })] })] }))] }) })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "AI Insights" }), _jsx(CardDescription, { children: "Intelligent financial recommendations" })] }), _jsx(CardContent, { children: _jsxs("div", { className: "text-center py-8", children: [_jsx(Brain, { className: "mx-auto h-12 w-12 text-muted-foreground mb-4" }), _jsx("h3", { className: "text-lg font-medium mb-2", children: "AI-Powered Insights" }), _jsx("p", { className: "text-muted-foreground mb-4", children: "Get intelligent financial recommendations" }), _jsxs("div", { className: "flex items-center justify-center gap-2", children: [_jsx(Button, { variant: "outline", onClick: loadAiInsights, disabled: aiLoading, children: aiLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "mr-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" }), "Loading..."] })) : ('Load Insights') }), _jsx(Button, { onClick: generateAiInsights, disabled: aiLoading, children: aiLoading ? (_jsxs(_Fragment, { children: [_jsx("div", { className: "mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-gray-400" }), "Generating..."] })) : (_jsxs(_Fragment, { children: [_jsx(Activity, { className: "mr-2 h-4 w-4" }), "Generate"] })) })] }), aiLoading && (_jsx("div", { className: "mt-6 text-center", children: _jsxs("div", { className: "inline-flex items-center px-4 py-2 bg-blue-50 text-blue-700 rounded-lg", children: [_jsx("div", { className: "mr-2 h-4 w-4 animate-spin rounded-full border-2 border-blue-300 border-t-blue-600" }), "AI is analyzing your financial data..."] }) })), aiInsights?.length ? (_jsx("div", { className: "mt-6 text-left max-w-2xl mx-auto border rounded divide-y", children: aiInsights.slice(0, 5).map((raw, idx) => {
                                                                const ins = { ...raw };
                                                                // Derive friendly fields
                                                                const category = (ins.category || ins.type || 'financial').toString().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
                                                                const priority = (ins.priority || ins.impact || 'medium').toString();
                                                                const confidence = typeof ins.confidence === 'number' ? Math.round(ins.confidence * 100) : undefined;
                                                                let text = ins.insightText || ins.description || ins.text || ins.summary || '';
                                                                if (typeof text !== 'string') {
                                                                    try {
                                                                        text = JSON.stringify(text);
                                                                    }
                                                                    catch {
                                                                        text = String(text);
                                                                    }
                                                                }
                                                                // If the backend returned a JSON object as string, try to pretty-pick common fields
                                                                if (text && text.trim().startsWith('{')) {
                                                                    try {
                                                                        const obj = JSON.parse(text);
                                                                        text = obj.description || obj.summary || Object.values(obj).join(' • ');
                                                                    }
                                                                    catch { }
                                                                }
                                                                const preview = (text || '—').toString().slice(0, 240);
                                                                const dateStr = ins.generatedAt ? new Date(ins.generatedAt).toLocaleString() : 'Just generated';
                                                                const badgeClass = priority === 'high' ? 'text-red-600 bg-red-50 border-red-200' : priority === 'low' ? 'text-muted-foreground bg-gray-50 border-gray-200' : 'text-amber-600 bg-amber-50 border-amber-200';
                                                                return (_jsxs("div", { className: "p-4 hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("div", { className: "text-sm font-medium text-gray-900", children: category }), _jsx("div", { className: `text-xs px-2 py-1 rounded-full border ${badgeClass}`, children: priority })] }), _jsx("div", { className: "text-sm text-gray-700 mb-2 leading-relaxed", children: preview }), _jsxs("div", { className: "flex items-center justify-between text-xs text-gray-500", children: [confidence !== undefined ? (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx("span", { children: "Confidence:" }), _jsxs("span", { className: "font-medium", children: [confidence, "%"] })] })) : _jsx("span", {}), _jsx("div", { children: dateStr })] })] }, ins.id || idx));
                                                            }) })) : (_jsxs("div", { className: "mt-6 text-center py-8 text-gray-500", children: [_jsx(Brain, { className: "mx-auto h-8 w-8 text-gray-300 mb-2" }), _jsx("p", { children: "No AI insights available yet" }), _jsx("p", { className: "text-sm", children: "Click \"Generate\" to analyze your financial data" })] }))] }) })] })] }) })] })] }) }));
}
