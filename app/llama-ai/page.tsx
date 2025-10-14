'use client';

import { LlamaAIDemo } from '@/components/llama-ai-demo';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { PageLayout } from '@/components/page-layout';
import { Brain, Zap, BarChart3, FileText, MessageSquare, TrendingUp } from 'lucide-react';

export default function LlamaAIPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <PageLayout 
        title="Llama AI-Powered Intelligence"
        description="Advanced conversational AI, document processing, and predictive analytics powered by Meta's Llama models"
        showBreadcrumbs={true}
      >
        <div className="space-y-6">
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-purple-900">Conversational AI</h3>
                  <p className="text-sm text-purple-700">Natural language queries with 10M token context</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Document Intelligence</h3>
                  <p className="text-sm text-blue-700">Multimodal processing of receipts, invoices, contracts</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-green-900">Predictive Analytics</h3>
                  <p className="text-sm text-green-700">Advanced forecasting with scenario analysis</p>
                </div>
              </div>
            </div>
          </div>

          {/* Llama Models Info */}
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Brain className="h-6 w-6 text-purple-600" />
              <h2 className="text-xl font-semibold text-gray-900">Llama Models in Use</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Llama 3.1 8B</h3>
                <p className="text-sm text-gray-600 mb-2">Efficient conversational AI for real-time interactions</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">Fast</span>
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">Efficient</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Llama 3.1 70B</h3>
                <p className="text-sm text-gray-600 mb-2">Advanced analysis for complex financial scenarios</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">Advanced</span>
                  <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">Comprehensive</span>
                </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">LLaVA 7B</h3>
                <p className="text-sm text-gray-600 mb-2">Vision model for document and image processing</p>
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">Multimodal</span>
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">OCR</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Demo Component */}
          <LlamaAIDemo companyId="default" />
        </div>
      </PageLayout>
    </ProtectedRoute>
  );
}
