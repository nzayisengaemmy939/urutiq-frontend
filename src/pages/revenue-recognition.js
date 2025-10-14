import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { PageLayout } from '../components/page-layout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { FileText, CalendarDays, DollarSign } from 'lucide-react';
import { revenueRecognitionApi } from '../lib/api/accounting';
import { getCompanyId } from '../lib/config';
import { apiService } from '../lib/api';
export default function RevenueRecognitionPage() {
    const [contracts, setContracts] = useState([]);
    const [schedules, setSchedules] = useState([]);
    const [loading, setLoading] = useState(true);
    const [seeding, setSeeding] = useState(false);
    const [error, setError] = useState(null);
    const companyId = getCompanyId();
    useEffect(() => {
        ensureAuthAndLoadData();
    }, []);
    async function ensureAuthAndLoadData() {
        try {
            // Ensure we have a demo token
            await apiService.getDemoToken('demo_user', ['admin', 'accountant']);
            loadData();
        }
        catch (error) {
            console.error('Failed to get demo token:', error);
            loadData(); // Try anyway
        }
    }
    async function loadData() {
        setLoading(true);
        setError(null);
        try {
            const [schedulesData, contractsData] = await Promise.all([
                revenueRecognitionApi.getSchedules(companyId),
                revenueRecognitionApi.getContracts(companyId)
            ]);
            setSchedules(schedulesData);
            setContracts(contractsData);
            // Auto-seed demo data once per company if empty
        }
        catch (e) {
            console.error('Error loading revenue recognition data:', e);
            if (e?.message?.includes('<!DOCTYPE')) {
                setError('API endpoint not found. Please check if the backend is running.');
            }
            else {
                setError(e?.message || 'Failed to load data');
            }
        }
        finally {
            setLoading(false);
        }
    }
    async function seedDemoData() {
        setSeeding(true);
        try {
            // Create some demo revenue recognition contracts
            const demoContracts = [
                {
                    id: 'contract-1',
                    name: 'Software License - Annual',
                    customer: 'Acme Corp',
                    totalValue: 120000,
                    currency: 'USD',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: 'active',
                    recognitionMethod: 'straight_line'
                },
                {
                    id: 'contract-2',
                    name: 'Consulting Services',
                    customer: 'Beta Inc',
                    totalValue: 50000,
                    currency: 'USD',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: 'active',
                    recognitionMethod: 'milestone'
                }
            ];
            // Create demo recognition schedules
            const demoSchedules = [
                {
                    id: 'schedule-1',
                    contractId: 'contract-1',
                    period: '2024-01',
                    recognizedAmount: 10000,
                    currency: 'USD',
                    status: 'recognized'
                },
                {
                    id: 'schedule-2',
                    contractId: 'contract-1',
                    period: '2024-02',
                    recognizedAmount: 10000,
                    currency: 'USD',
                    status: 'recognized'
                }
            ];
            // In a real implementation, these would be saved to the backend
            setContracts(demoContracts);
            setSchedules(demoSchedules);
            console.log('Demo data seeded successfully');
        }
        catch (error) {
            console.error('Error seeding demo data:', error);
            setError('Failed to seed demo data');
        }
        finally {
            setSeeding(false);
        }
    }
    async function seedMoreDemoData() {
        setSeeding(true);
        try {
            // Add more demo data
            const additionalContracts = [
                {
                    id: 'contract-3',
                    name: 'Maintenance Contract',
                    customer: 'Gamma LLC',
                    totalValue: 25000,
                    currency: 'USD',
                    startDate: new Date().toISOString().split('T')[0],
                    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    status: 'active',
                    recognitionMethod: 'straight_line'
                }
            ];
            setContracts(prev => [...prev, ...additionalContracts]);
            console.log('Additional demo data seeded successfully');
        }
        catch (error) {
            console.error('Error seeding additional demo data:', error);
            setError('Failed to seed additional demo data');
        }
        finally {
            setSeeding(false);
        }
    }
    const formatCurrency = (amount, currency = 'USD') => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency,
        }).format(amount);
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };
    return (_jsx(PageLayout, { children: _jsxs("div", { className: "space-y-6", children: [_jsx("div", { className: "flex items-center justify-between", children: _jsxs("div", { children: [_jsx("h1", { className: "text-3xl font-bold text-gray-900", children: "Revenue Recognition" }), _jsx("p", { className: "text-gray-600 mt-1", children: "Manage revenue contracts and recognition schedules" })] }) }), error && (_jsx(Card, { className: "border-red-200 bg-red-50", children: _jsx(CardContent, { className: "pt-6", children: _jsx("p", { className: "text-red-600", children: error?.message || error?.toString() || 'Unknown error' }) }) })), _jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4", children: [_jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Contracts" }), _jsx("p", { className: "text-2xl font-bold text-blue-600", children: contracts.length })] }), _jsx("div", { className: "text-blue-600", children: _jsx(FileText, { className: "w-6 h-6" }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Active Schedules" }), _jsx("p", { className: "text-2xl font-bold text-green-600", children: schedules.length })] }), _jsx("div", { className: "text-green-600", children: _jsx(CalendarDays, { className: "w-6 h-6" }) })] }) }) }), _jsx(Card, { children: _jsx(CardContent, { className: "pt-6", children: _jsxs("div", { className: "flex items-center", children: [_jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-gray-600", children: "Total Revenue" }), _jsx("p", { className: "text-2xl font-bold text-purple-600", children: formatCurrency(schedules.reduce((sum, s) => sum + (s.amount || 0), 0)) })] }), _jsx("div", { className: "text-purple-600", children: _jsx(DollarSign, { className: "w-6 h-6" }) })] }) }) })] }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-2 gap-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Revenue Contracts" }), _jsxs(Badge, { variant: "outline", children: [contracts.length, " contracts"] })] }) }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) })) : contracts.length > 0 ? (_jsx("div", { className: "space-y-3", children: contracts.map((contract, index) => (_jsx("div", { className: "p-3 border rounded-lg hover:bg-gray-50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("div", { className: "font-medium", children: contract.name }), _jsxs("div", { className: "text-sm text-gray-500", children: ["ID: ", contract.id] })] }), _jsx(Badge, { variant: "default", children: "Active" })] }) }, contract.id || index))) })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(FileText, { className: "w-10 h-10 mx-auto mb-3 text-gray-400" }), _jsx("p", { className: "font-medium", children: "No contracts found" }), _jsx("p", { className: "text-sm mt-1", children: "This data comes from the backend API - currently empty" }), _jsx("div", { className: "mt-4", children: _jsxs("div", { className: "flex items-center gap-2 justify-center", children: [_jsx(Button, { onClick: seedDemoData, disabled: seeding, children: seeding ? 'Seeding…' : 'Seed Demo Data' }), _jsx(Button, { onClick: seedMoreDemoData, variant: "outline", disabled: seeding, children: seeding ? 'Seeding…' : 'Seed More' })] }) })] })) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Recognition Schedules" }), _jsxs(Badge, { variant: "outline", children: [schedules.length, " schedules"] })] }) }), _jsx(CardContent, { children: loading ? (_jsx("div", { className: "flex items-center justify-center py-8", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" }) })) : schedules.length > 0 ? (_jsx("div", { className: "space-y-3", children: schedules.map((schedule, index) => (_jsx("div", { className: "p-3 border rounded-lg hover:bg-gray-50", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex-1", children: [_jsx("div", { className: "font-medium", children: schedule.name }), _jsxs("div", { className: "text-sm text-gray-500", children: [formatDate(schedule.startDate), " - ", formatDate(schedule.endDate)] }), _jsxs("div", { className: "text-sm text-gray-500", children: ["Method: ", schedule.method?.replace('_', ' ')] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "font-medium", children: formatCurrency(schedule.amount, schedule.currency) }), _jsx(Badge, { variant: "secondary", children: schedule.method })] })] }) }, schedule.id || index))) })) : (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(CalendarDays, { className: "w-10 h-10 mx-auto mb-3 text-gray-400" }), _jsx("p", { className: "font-medium", children: "No schedules found" }), _jsx("p", { className: "text-sm mt-1", children: "This data comes from the backend API - currently empty" }), _jsx("div", { className: "mt-4", children: _jsxs("div", { className: "flex items-center gap-2 justify-center", children: [_jsx(Button, { onClick: seedDemoData, disabled: seeding, children: seeding ? 'Seeding…' : 'Seed Demo Data' }), _jsx(Button, { onClick: seedMoreDemoData, variant: "outline", disabled: seeding, children: seeding ? 'Seeding…' : 'Seed More' })] }) })] })) })] })] })] }) }));
}
