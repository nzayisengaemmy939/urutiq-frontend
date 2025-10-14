import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/auth-context';
import { getTenantId } from '../lib/config';
export function useDashboardData(companyId, period = 30) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const fetchData = async () => {
        console.log('=== DASHBOARD DATA FETCH DEBUG ===');
        console.log('companyId received:', companyId);
        console.log('companyId type:', typeof companyId);
        console.log('companyId length:', companyId?.length);
        console.log('period:', period);
        if (!companyId) {
            console.log('❌ No companyId provided, aborting fetch');
            setError('Company ID is required');
            setLoading(false);
            return;
        }
        setLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('auth_token');
            const tenantId = getTenantId();
            console.log('Auth token exists:', !!token);
            console.log('Tenant ID:', tenantId);
            if (!token) {
                throw new Error('No authentication token found');
            }
            const apiUrl = `${import.meta.env.VITE_API_URL}/api/dashboard?companyId=${companyId}&period=${period}`;
            console.log('Making API call to:', apiUrl);
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'x-tenant-id': tenantId,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const dashboardData = await response.json();
            console.log('✅ Dashboard data received:', dashboardData);
            console.log('Revenue from API:', dashboardData?.metrics?.totalRevenue);
            setData(dashboardData);
        }
        catch (err) {
            console.error('❌ Error fetching dashboard data:', err);
            setError(err instanceof Error ? err.message : 'Failed to fetch dashboard data');
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchData();
    }, [companyId, period]);
    const refetch = () => {
        fetchData();
    };
    return {
        data,
        loading,
        error,
        refetch,
    };
}
