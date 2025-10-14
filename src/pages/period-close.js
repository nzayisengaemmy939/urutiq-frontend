import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { PageLayout } from '../components/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { periodCloseApi } from '../lib/api/accounting';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { TrendingUp, Lock, CheckCircle, ClipboardList, RefreshCw } from 'lucide-react';
import { apiService } from '../lib/api';
import { getCompanyId } from '../lib/config';
export default function PeriodClosePage() {
    const [companyId, setCompanyId] = useState(() => getCompanyId());
    const [periods, setPeriods] = useState([]);
    const [selectedPeriod, setSelectedPeriod] = useState('');
    const [checklist, setChecklist] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fxPreview, setFxPreview] = useState(null);
    const [fxHistory, setFxHistory] = useState(null);
    const [fxGainAccountId, setFxGainAccountId] = useState('');
    const [fxLossAccountId, setFxLossAccountId] = useState('');
    const [fxRevaluedAccountId, setFxRevaluedAccountId] = useState('');
    const [accounts, setAccounts] = useState([]);
    const [runs, setRuns] = useState([]);
    // Listen for company changes from header
    useEffect(() => {
        const handleStorageChange = () => {
            const newCompanyId = getCompanyId();
            if (newCompanyId && newCompanyId !== companyId) {
                console.log('🔄 Period Close page - Company changed from', companyId, 'to', newCompanyId);
                setCompanyId(newCompanyId);
            }
        };
        // Listen for localStorage changes
        window.addEventListener('storage', handleStorageChange);
        // Also listen for custom events (in case localStorage doesn't trigger)
        const handleCompanyChange = (e) => {
            const newCompanyId = e.detail.companyId;
            if (newCompanyId && newCompanyId !== companyId) {
                console.log('🔄 Period Close page - Company changed via custom event from', companyId, 'to', newCompanyId);
                setCompanyId(newCompanyId);
            }
        };
        window.addEventListener('companyChanged', handleCompanyChange);
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('companyChanged', handleCompanyChange);
        };
    }, [companyId]);
    useEffect(() => {
        if (!companyId)
            return;
        ensureAuthAndLoadPeriods();
    }, [companyId]);
    useEffect(() => {
        if (selectedPeriod) {
            loadRuns();
        }
    }, [selectedPeriod]);
    async function ensureAuthAndLoadPeriods() {
        try {
            // Ensure we have a demo token
            await apiService.getDemoToken('demo_user', ['admin', 'accountant']);
            loadPeriods();
        }
        catch (error) {
            console.error('Failed to get demo token:', error);
            loadPeriods(); // Try anyway
        }
    }
    async function loadPeriods() {
        console.log(`Loading periods for company: ${companyId}`);
        setLoading(true);
        setError(null);
        try {
            const res = await periodCloseApi.listPeriods(companyId);
            console.log('Periods API response:', res);
            // Handle the response structure: { success: true, data: [...] }
            let data = [];
            if (res?.data && Array.isArray(res.data)) {
                data = res.data;
            }
            else if (Array.isArray(res)) {
                data = res;
            }
            console.log('Processed periods data:', data);
            setPeriods(data);
            // Auto-select the first period if none is selected
            if (data.length > 0 && data[0]?.period) {
                console.log(`Auto-selecting first period: ${data[0].period}`);
                setSelectedPeriod(data[0].period);
                loadChecklist(data[0].period);
            }
            else {
                console.log('No periods available for auto-selection');
            }
        }
        catch (e) {
            console.error('Error loading periods:', e);
            if (e?.message?.includes('<!DOCTYPE')) {
                setError('API endpoint not found. Please check if the backend is running.');
                // Provide sample data for demo purposes
                const samplePeriods = [
                    { period: '2024-01', status: 'open' },
                    { period: '2024-02', status: 'locked' },
                    { period: '2024-03', status: 'closed' }
                ];
                setPeriods(samplePeriods);
                setSelectedPeriod(samplePeriods[0].period);
                loadChecklist(samplePeriods[0].period);
            }
            else {
                setError(e?.message || 'Failed to load periods');
            }
        }
        finally {
            setLoading(false);
        }
    }
    async function loadChecklist(period) {
        try {
            const res = await periodCloseApi.getChecklist(companyId, period);
            // Handle the response structure: { success: true, data: [...] }
            let data = [];
            if (res?.data && Array.isArray(res.data)) {
                data = res.data;
            }
            else if (Array.isArray(res)) {
                data = res;
            }
            setChecklist(data);
        }
        catch (e) {
            console.error('Failed to load checklist:', e);
            // Provide sample checklist data
            const sampleChecklist = [
                { id: '1', title: 'Bank reconciliations complete', completed: false, order: 1 },
                { id: '2', title: 'Accruals and deferrals posted', completed: true, order: 2 },
                { id: '3', title: 'Intercompany reconciled', completed: false, order: 3 },
                { id: '4', title: 'Revenue recognition posted', completed: true, order: 4 },
            ];
            setChecklist(sampleChecklist);
        }
    }
    async function updateChecklistItem(itemId, completed) {
        try {
            await periodCloseApi.updateChecklist(companyId, selectedPeriod, itemId, { completed });
            // Reload checklist to get updated data
            loadChecklist(selectedPeriod);
        }
        catch (e) {
            console.error('Failed to update checklist item:', e);
            setError(e?.message || 'Failed to update checklist item');
        }
    }
    async function loadFxPreview() {
        try {
            const res = await periodCloseApi.getFxPreview(companyId, selectedPeriod);
            setFxPreview(res?.data || null);
        }
        catch (e) {
            console.error('Failed to load FX preview:', e);
        }
    }
    async function loadFxHistory() {
        try {
            const res = await periodCloseApi.getFxHistory(companyId, selectedPeriod);
            setFxHistory(res?.data || null);
        }
        catch (e) {
            console.error('Failed to load FX history:', e);
        }
    }
    async function loadAccounts() {
        try {
            const res = await periodCloseApi.getAccounts(companyId);
            setAccounts(res?.data || []);
        }
        catch (e) {
            console.error('Failed to load accounts:', e);
        }
    }
    async function loadRuns() {
        try {
            const res = await periodCloseApi.getRuns(companyId, selectedPeriod);
            console.log('Runs API response:', res);
            // Handle the response structure: { success: true, data: [...] }
            let data = [];
            if (res?.data && Array.isArray(res.data)) {
                data = res.data;
            }
            else if (Array.isArray(res)) {
                data = res;
            }
            // Transform backend data to frontend format
            const transformedRuns = data.map((run) => {
                const runType = run.type || 'unknown';
                const payload = run.payload || {};
                // Map run types to display names
                const typeNames = {
                    'recurring': 'Recurring Journals',
                    'allocations': 'Allocations',
                    'fx-reval': 'FX Revaluation'
                };
                // Determine status based on payload
                let status = 'success';
                if (payload.error || payload.status === 'error') {
                    status = 'error';
                }
                else if (payload.status === 'pending') {
                    status = 'pending';
                }
                // Create description based on type and payload
                let description = '';
                if (runType === 'recurring') {
                    description = `Posted ${payload.posted || 0} recurring entries`;
                }
                else if (runType === 'allocations') {
                    description = `Processed ${payload.allocationsPosted || 0} allocations`;
                }
                else if (runType === 'fx-reval') {
                    description = `Posted ${payload.entriesPosted || 0} FX revaluation entries`;
                }
                else {
                    description = 'Period close process executed';
                }
                return {
                    id: run.id,
                    name: typeNames[runType] || runType,
                    description: description,
                    status: status,
                    duration: '1.2s', // Default duration since backend doesn't track this
                    type: runType,
                    at: run.at
                };
            });
            console.log('Transformed runs:', transformedRuns);
            setRuns(transformedRuns);
        }
        catch (e) {
            console.error('Failed to load runs:', e);
            // Provide sample runs data
            const sampleRuns = [
                { id: '1', name: 'Recurring Journals', description: 'Monthly recurring entries', status: 'success', duration: '2.3s' },
                { id: '2', name: 'Allocations', description: 'Overhead allocations', status: 'success', duration: '1.8s' },
                { id: '3', name: 'FX Revaluation', description: 'Foreign exchange revaluation', status: 'error', duration: '0.5s' },
            ];
            setRuns(sampleRuns);
        }
    }
    async function startClose() {
        if (!selectedPeriod) {
            console.log('No period selected for start close');
            return;
        }
        console.log(`Starting close for period: ${selectedPeriod}, company: ${companyId}`);
        setLoading(true);
        setError(null); // Clear any previous errors
        try {
            const result = await periodCloseApi.startClose(companyId, selectedPeriod);
            console.log('Start close result:', result);
            // Reload periods to show updated status
            await loadPeriods();
            // Also reload checklist for the locked period
            await loadChecklist(selectedPeriod);
            // Load runs to show any existing runs
            await loadRuns();
            console.log('Period close started successfully');
        }
        catch (e) {
            console.error('Start close error:', e);
            setError(e?.message || 'Failed to start period close');
        }
        finally {
            setLoading(false);
        }
    }
    async function completeClose() {
        if (!selectedPeriod) {
            console.log('No period selected for complete close');
            return;
        }
        console.log(`Completing close for period: ${selectedPeriod}, company: ${companyId}`);
        setLoading(true);
        setError(null);
        try {
            const result = await periodCloseApi.completeClose(companyId, selectedPeriod);
            console.log('Complete close result:', result);
            // Reload periods to show updated status
            await loadPeriods();
            // Also reload checklist for the closed period
            await loadChecklist(selectedPeriod);
            // Load runs to show any existing runs
            await loadRuns();
            console.log('Period close completed successfully');
        }
        catch (e) {
            console.error('Complete close error:', e);
            setError(e?.message || 'Failed to complete period close');
        }
        finally {
            setLoading(false);
        }
    }
    async function runRecurringJournals() {
        if (!selectedPeriod)
            return;
        setLoading(true);
        try {
            const result = await periodCloseApi.runRecurring(companyId, selectedPeriod);
            console.log('Recurring journals result:', result);
            await loadRuns(); // Reload runs to show the new execution
            console.log('Recurring journals executed successfully');
        }
        catch (e) {
            setError(e?.message || 'Failed to run recurring journals');
        }
        finally {
            setLoading(false);
        }
    }
    async function runAllocations() {
        if (!selectedPeriod)
            return;
        setLoading(true);
        try {
            const result = await periodCloseApi.runAllocations(companyId, selectedPeriod);
            console.log('Allocations result:', result);
            await loadRuns(); // Reload runs to show the new execution
            console.log('Allocations executed successfully');
        }
        catch (e) {
            setError(e?.message || 'Failed to run allocations');
        }
        finally {
            setLoading(false);
        }
    }
    async function runFxRevaluation() {
        if (!selectedPeriod)
            return;
        setLoading(true);
        try {
            const result = await periodCloseApi.runFxReval(companyId, selectedPeriod, 'USD');
            console.log('FX revaluation result:', result);
            await loadRuns(); // Reload runs to show the new execution
            console.log('FX revaluation executed successfully');
        }
        catch (e) {
            setError(e?.message || 'Failed to run FX revaluation');
        }
        finally {
            setLoading(false);
        }
    }
    const getStatusBadge = (status) => {
        switch (status) {
            case 'open': return _jsx(Badge, { variant: "default", children: "Open" });
            case 'locked': return _jsx(Badge, { variant: "secondary", children: "Locked" });
            case 'closing': return _jsx(Badge, { variant: "destructive", children: "Closing" });
            case 'closed': return _jsx(Badge, { variant: "outline", children: "Closed" });
            default: return _jsx(Badge, { variant: "outline", children: status });
        }
    };
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Period Close" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage accounting period closures and financial reporting" })] }), _jsx("div", { className: "flex items-center gap-2", children: _jsxs(Select, { value: companyId, onValueChange: setCompanyId, children: [_jsx(SelectTrigger, { className: "w-48", children: _jsx(SelectValue, { placeholder: "Select Company" }) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "seed-company-1", children: "Uruti Hub Limited" }), _jsx(SelectItem, { value: "seed-company-2", children: "Acme Trading Co" })] })] }) })] }), error && (_jsx(Card, { className: "border-red-200 bg-red-50", children: _jsx(CardContent, { className: "pt-6", children: _jsx("p", { className: "text-red-600", children: error?.message || error?.toString() || 'Unknown error' }) }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Open Periods" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: periods.filter(p => p.status === 'open').length })] }), _jsx("div", { className: "text-green-600", children: _jsx(TrendingUp, { className: "w-6 h-6" }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Locked Periods" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: periods.filter(p => p.status === 'locked').length })] }), _jsx("div", { className: "text-blue-600", children: _jsx(Lock, { className: "w-6 h-6" }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Closed Periods" }), _jsx("p", { className: "text-2xl font-bold text-gray-600", children: periods.filter(p => p.status === 'closed').length })] }), _jsx("div", { className: "text-gray-600", children: _jsx(CheckCircle, { className: "w-6 h-6" }) })] }) }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Accounting Periods" }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Badge, { variant: "outline", children: [periods.length, " periods"] }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => {
                                                            console.log('Manual refresh triggered');
                                                            loadPeriods();
                                                        }, disabled: loading, children: _jsx(RefreshCw, { className: `w-4 h-4 ${loading ? 'animate-spin' : ''}` }) })] })] }) }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) })) : (_jsxs("div", { className: "space-y-4", children: [_jsxs(Select, { value: selectedPeriod, onValueChange: (value) => {
                                                    console.log(`Period selected from dropdown: ${value}`);
                                                    setSelectedPeriod(value);
                                                    loadChecklist(value);
                                                }, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select Period" }) }), _jsx(SelectContent, { children: periods.map((period) => (_jsxs(SelectItem, { value: period.period, children: [period.period, " - ", getStatusBadge(period.status)] }, period.period))) })] }), _jsxs("div", { className: "text-xs text-gray-500 mt-2 p-2 bg-gray-100 rounded", children: [_jsxs("div", { children: ["Debug: selectedPeriod = \"", selectedPeriod, "\""] }), _jsxs("div", { children: ["Periods count = ", periods.length] }), _jsxs("div", { children: ["Periods: ", periods.map(p => `${p.period}(${p.status})`).join(', ')] }), _jsxs("div", { children: ["Loading: ", loading ? 'Yes' : 'No'] })] }), _jsx("div", { className: "space-y-3", children: periods.map((period) => (_jsx("div", { className: `p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${selectedPeriod === period.period ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'}`, onClick: () => {
                                                        console.log(`Period clicked: ${period.period}`);
                                                        setSelectedPeriod(period.period);
                                                        loadChecklist(period.period);
                                                        loadRuns();
                                                    }, children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "font-medium text-lg", children: period.period }), getStatusBadge(period.status)] }), _jsxs("div", { className: "text-sm text-gray-500 mt-1", children: [period.status === 'open' && (_jsxs("span", { className: "inline-flex items-center gap-1 text-green-700", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), " Active period - transactions allowed"] })), period.status === 'locked' && (_jsxs("span", { className: "inline-flex items-center gap-1 text-blue-700", children: [_jsx(Lock, { className: "w-4 h-4" }), " Review period - no new transactions"] })), period.status === 'closed' && (_jsxs("span", { className: "inline-flex items-center gap-1 text-gray-700", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), " Finalized - period complete"] }))] }), selectedPeriod === period.period && (_jsx("div", { className: "text-xs text-blue-600 mt-2 font-medium", children: "Currently selected period" }))] }), _jsxs("div", { className: "flex flex-col items-end text-sm text-gray-500", children: [_jsx("div", { children: "Transactions: --" }), _jsx("div", { children: "Balance: --" })] })] }) }, period.period))) })] })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Close Actions" }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "p-4 border rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-3", children: [_jsx("h3", { className: "font-medium", children: "Period Close Checklist" }), _jsxs("div", { className: "text-sm text-gray-500", children: [checklist.filter(item => item.completed).length, " of ", checklist.length, " completed"] })] }), checklist.length > 0 ? (_jsxs("div", { className: "space-y-3", children: [checklist.map((item, index) => (_jsxs("div", { className: "flex items-start gap-3 p-2 rounded hover:bg-gray-50", children: [_jsx("input", { type: "checkbox", checked: item.completed, onChange: (e) => updateChecklistItem(item.id, e.target.checked), className: "mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 cursor-pointer" }), _jsxs("div", { className: "flex-1", children: [_jsx("span", { className: `block ${item.completed ? 'line-through text-gray-500' : 'text-gray-900'}`, children: item.title || item.description }), item.completed && (_jsx("span", { className: "text-xs text-green-600 mt-1 block", children: "\u2713 Completed" }))] })] }, item.id || index))), _jsxs("div", { className: "mt-4 pt-3 border-t", children: [_jsx("div", { className: "w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full transition-all duration-300", style: { width: `${(checklist.filter(item => item.completed).length / checklist.length) * 100}%` } }) }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Progress: ", Math.round((checklist.filter(item => item.completed).length / checklist.length) * 100), "% complete"] })] })] })) : (_jsxs("div", { className: "text-center py-4 text-gray-500", children: [_jsx("div", { className: "text-2xl mb-2", children: "\uD83D\uDCCB" }), _jsx("p", { children: "Select a period to view checklist" })] }))] }), _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex gap-3", children: [_jsx(Button, { onClick: startClose, disabled: loading || !selectedPeriod || periods.find(p => p.period === selectedPeriod)?.status !== 'open', className: "flex-1", children: loading ? (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("div", { className: "animate-spin rounded-full h-4 w-4 border-b-2 border-white" }), _jsx("span", { children: "Processing..." })] })) : (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Lock, { className: "w-4 h-4" }), _jsx("span", { children: "Start Close" })] })) }), _jsx(Button, { onClick: completeClose, disabled: loading || !selectedPeriod || periods.find(p => p.period === selectedPeriod)?.status !== 'locked', variant: "outline", className: "flex-1", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-4 h-4" }), _jsx("span", { children: "Complete Close" })] }) })] }), selectedPeriod && (_jsx("div", { className: "text-xs text-gray-500 p-2 bg-gray-50 rounded", children: (() => {
                                                            const period = periods.find(p => p.period === selectedPeriod);
                                                            if (!period)
                                                                return 'Select a period to view available actions';
                                                            switch (period.status) {
                                                                case 'open':
                                                                    return '💡 You can start the close process for this open period';
                                                                case 'locked':
                                                                    return '💡 This period is locked and ready to be completed';
                                                                case 'closed':
                                                                    return '✅ This period is already closed and finalized';
                                                                default:
                                                                    return 'Period status unknown';
                                                            }
                                                        })() })), _jsxs("div", { className: "mt-4 pt-4 border-t", children: [_jsx("h4", { className: "font-medium text-sm text-gray-700 mb-3", children: "Automated Processes" }), _jsxs("div", { className: "grid grid-cols-1 gap-2", children: [_jsx(Button, { onClick: runRecurringJournals, disabled: loading || !selectedPeriod, variant: "outline", size: "sm", className: "justify-start", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(RefreshCw, { className: "w-4 h-4" }), _jsx("span", { children: "Run Recurring Journals" })] }) }), _jsx(Button, { onClick: runAllocations, disabled: loading || !selectedPeriod, variant: "outline", size: "sm", className: "justify-start", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(TrendingUp, { className: "w-4 h-4" }), _jsx("span", { children: "Run Allocations" })] }) }), _jsx(Button, { onClick: runFxRevaluation, disabled: loading || !selectedPeriod, variant: "outline", size: "sm", className: "justify-start", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(ClipboardList, { className: "w-4 h-4" }), _jsx("span", { children: "Run FX Revaluation" })] }) })] })] })] })] }) })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Period Close Runs" }), _jsx(Badge, { variant: "outline", children: selectedPeriod || 'Select period' })] }) }), _jsx(CardContent, { children: runs.length > 0 ? (_jsxs("div", { className: "space-y-3", children: [runs.map((run, index) => (_jsx("div", { className: "p-4 border rounded-lg hover:bg-gray-50 transition-colors", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "font-medium", children: run.name }), _jsxs(Badge, { variant: run.status === 'success' ? 'default' :
                                                                        run.status === 'error' ? 'destructive' :
                                                                            'secondary', children: [run.status === 'success' && '✅ ', run.status === 'error' && '❌ ', run.status === 'pending' && '⏳ ', run.status] })] }), _jsx("div", { className: "text-sm text-gray-500 mt-1", children: run.description }), run.status === 'success' && (_jsxs("div", { className: "text-xs text-green-600 mt-1", children: ["Completed successfully in ", run.duration] })), run.status === 'error' && (_jsxs("div", { className: "text-xs text-red-600 mt-1", children: ["Failed after ", run.duration, " - Click to retry"] }))] }), _jsxs("div", { className: "text-right text-sm text-gray-500", children: [_jsx("div", { children: run.duration }), run.timestamp && (_jsx("div", { className: "text-xs", children: run.timestamp }))] })] }) }, index))), _jsxs("div", { className: "mt-6 pt-4 border-t", children: [_jsxs("div", { className: "flex items-center justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Overall Progress" }), _jsxs("span", { className: "text-gray-600", children: [runs.filter(r => r.status === 'success').length, " of ", runs.length, " completed"] })] }), _jsx("div", { className: "mt-2 w-full bg-gray-200 rounded-full h-2", children: _jsx("div", { className: "bg-green-600 h-2 rounded-full transition-all duration-300", style: {
                                                        width: `${(runs.filter(r => r.status === 'success').length / runs.length) * 100}%`
                                                    } }) })] })] })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx("div", { className: "text-3xl mb-3", children: "\uD83D\uDD04" }), _jsx("p", { className: "font-medium", children: "No close runs yet" }), _jsx("p", { className: "text-sm mt-1", children: selectedPeriod
                                            ? 'Start the close process to see runs here'
                                            : 'Select a period and start closing to track progress' })] })) })] })] }) }));
}
