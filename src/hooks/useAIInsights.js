import { useState, useEffect } from 'react';
import { getCompanyId, getTenantId } from '../lib/config';
export function useAIInsights() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const fetchData = async () => {
        const companyId = getCompanyId();
        if (!companyId) {
            setError('Company ID is required');
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/ai-insights/dashboard?companyId=${companyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'x-tenant-id': getTenantId(),
                    'x-company-id': companyId,
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            setData(result);
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch AI insights data');
        }
        finally {
            setLoading(false);
        }
    };
    const generateInsights = async (insightType) => {
        const companyId = getCompanyId();
        if (!companyId) {
            throw new Error('Company ID is required');
        }
        const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
        if (!token) {
            throw new Error('No authentication token found');
        }
        const response = await fetch(`${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-11.onrender.com'}/api/ai/insights/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'x-tenant-id': getTenantId(),
                'x-company-id': companyId,
            },
            body: JSON.stringify({
                companyId,
                insightType
            })
        });
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        return await response.json();
    };
    useEffect(() => {
        fetchData();
    }, []);
    return {
        data,
        loading,
        error,
        refetch: fetchData,
        generateInsights
    };
}
