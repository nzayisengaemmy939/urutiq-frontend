'use client';

import { EnhancedTransactionProcessing } from '@/components/enhanced-transaction-processing';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageLayout } from '@/components/page-layout';
import { Zap, Brain, FileText, Users, Building2, TrendingUp } from 'lucide-react';

export default function EnhancedTransactionProcessingPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <PageLayout 
        title="AI-Powered Transaction Processing"
        description="Intelligent receipt processing, invoice generation, and transaction analysis with advanced AI capabilities"
        showBreadcrumbs={true}
      >
        <div className="space-y-6">
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">OCR Receipt Processing</h3>
                  <p className="text-sm text-blue-700">AI-powered text extraction and categorization</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <FileText className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Smart Invoice Generation</h3>
                  <p className="text-sm text-green-700">Template-based automated invoice creation</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Brain className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">Transaction Intelligence</h3>
                  <p className="text-sm text-purple-700">Pattern analysis and AI recommendations</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Component */}
          <EnhancedTransactionProcessing companyId="default" />
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
