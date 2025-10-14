import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
;
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';
export function DebugReport() {
    const [debugInfo, setDebugInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const testAPI = async () => {
        setLoading(true);
        try {
            console.log('Testing API connection...');
            // Test the health endpoint first
            const healthData = await apiClient.get('/health');
            console.log('Health check:', healthData);
            // Test the accounting reports test endpoint
            const testData = await apiClient.get('/api/accounting-reports/test');
            console.log('Test endpoint response:', testData);
            // Test the accounting reports endpoint
            const data = await apiClient.get('/api/accounting-reports/trial-balance', {
                startDate: '2024-01-01',
                endDate: '2024-12-31'
            });
            console.log('API Response:', data);
            setDebugInfo({
                error: false,
                health: healthData,
                test: testData,
                trialBalance: data
            });
        }
        catch (error) {
            console.error('Fetch error:', error);
            setDebugInfo({
                error: true,
                message: error instanceof Error ? error.message : 'Unknown error'
            });
        }
        finally {
            setLoading(false);
        }
    };
    return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Debug Report" }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsx(Button, { onClick: testAPI, disabled: loading, children: loading ? 'Testing...' : 'Test API Connection' }), debugInfo && (_jsxs("div", { className: "mt-4", children: [_jsx("h3", { className: "font-semibold mb-2", children: "Debug Information:" }), _jsx("pre", { className: "bg-gray-100 p-4 rounded text-sm overflow-auto", children: JSON.stringify(debugInfo, null, 2) })] }))] })] }));
}
