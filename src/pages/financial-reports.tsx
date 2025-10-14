import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageLayout } from '../components/page-layout';
import { EnhancedFinancialReports } from '../components/enhanced-financial-reports';
import { ProtectedRoute } from '../components/auth/protected-route';

export default function FinancialReportsPage() {
  const [searchParams] = useSearchParams();
  const [companyId, setCompanyId] = useState<string>('');
  const [reportType, setReportType] = useState<string>('');

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

  return (
    <ProtectedRoute>
      <PageLayout
      
        showBreadcrumbs={true}
      >
        <div className="space-y-6">

          <EnhancedFinancialReports 
            selectedCompany={companyId || ''} 
            defaultReportType={reportType || 'balance-sheet'}
          />
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
