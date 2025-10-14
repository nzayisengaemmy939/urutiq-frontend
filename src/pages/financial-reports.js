import { jsx as _jsx } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/page-layout';
import { EnhancedFinancialReports } from '../components/enhanced-financial-reports';
import { ProtectedRoute } from '../components/auth/protected-route';
export default function FinancialReportsPage() {
    const [searchParams] = useSearchParams();
    const [companyId, setCompanyId] = useState('');
    const [reportType, setReportType] = useState('');
    useEffect(() => {
        const companyParam = searchParams.get('companyId');
        const reportParam = searchParams.get('report');
        if (companyParam) {
            setCompanyId(companyParam);
        }
        if (reportParam) {
            setReportType(reportParam);
        }
    }, [searchParams]);
    return (_jsx(ProtectedRoute, { children: _jsx(PageLayout, { showBreadcrumbs: true, children: _jsx("div", { className: "space-y-6", children: _jsx(EnhancedFinancialReports, { selectedCompany: companyId || '', defaultReportType: reportType || 'balance-sheet' }) }) }) }));
}
