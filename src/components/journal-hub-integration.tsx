import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  BookOpen, 
  ArrowRight, 
  Plus, 
  Eye, 
  Edit, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  BarChart3,
  FileText,
  Zap,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiService from '../lib/api';
import { useAuth } from '../contexts/auth-context';
import { getCompanyId } from '../lib/config';

interface JournalHubIntegrationProps {
  companyId?: string;
  onNavigate?: (path: string) => void;
  showQuickActions?: boolean;
  showRecentEntries?: boolean;
  showSummary?: boolean;
}

interface RecentEntry {
  id: string;
  date: string;
  reference: string;
  memo?: string;
  status: 'DRAFT' | 'POSTED' | 'REVERSED' | 'PENDING_APPROVAL';
  entryType?: {
    name: string;
    category: string;
  };
  totalAmount: number;
}

interface QuickStats {
  totalEntries: number;
  pendingApprovals: number;
  draftEntries: number;
  postedToday: number;
}

export function JournalHubIntegration({ 
  companyId, 
  onNavigate,
  showQuickActions = true,
  showRecentEntries = true,
  showSummary = true 
}: JournalHubIntegrationProps) {
  const { isAuthenticated } = useAuth();
  const currentCompanyId = companyId || getCompanyId();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch journal hub summary
  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ['journal-hub-summary', currentCompanyId],
    queryFn: () => apiService.getJournalSummary({ companyId: currentCompanyId }),
    enabled: !!currentCompanyId && isAuthenticated
  });

  // Fetch recent entries
  const { data: recentEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ['journal-recent-entries', currentCompanyId],
    queryFn: () => apiService.getJournalEntries({
      pageSize: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc'
    }),
    enabled: !!currentCompanyId && isAuthenticated && showRecentEntries
  });

  // Fetch pending approvals
  const { data: pendingApprovals, isLoading: approvalsLoading } = useQuery({
    queryKey: ['journal-pending-approvals', currentCompanyId],
    queryFn: () => apiService.getPendingApprovals(),
    enabled: !!currentCompanyId && isAuthenticated
  });

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'POSTED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'DRAFT':
        return <Edit className="w-4 h-4 text-blue-500" />;
      case 'PENDING_APPROVAL':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'REVERSED':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'POSTED':
        return 'bg-green-100 text-green-800';
      case 'DRAFT':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING_APPROVAL':
        return 'bg-yellow-100 text-yellow-800';
      case 'REVERSED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      {showSummary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold">
                    {summaryLoading ? '...' : summaryData?.totalEntries || 0}
                  </p>
                </div>
                <BookOpen className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {approvalsLoading ? '...' : pendingApprovals?.pendingApprovals?.length || 0}
                  </p>
                </div>
                <Clock className="w-8 h-8 text-yellow-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Draft Entries</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {summaryLoading ? '...' : summaryData?.draftEntries || 0}
                  </p>
                </div>
                <Edit className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Posted Today</p>
                  <p className="text-2xl font-bold text-green-600">
                    {summaryLoading ? '...' : summaryData?.postedToday || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="recent">Recent Entries</TabsTrigger>
          <TabsTrigger value="approvals">Approvals</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Quick Actions */}
            {showQuickActions && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    onClick={() => handleNavigate('/dashboard/journal-hub')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create New Entry
                  </Button>
                  <Button 
                    onClick={() => handleNavigate('/dashboard/journal-hub?tab=templates')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Use Template
                  </Button>
                  <Button 
                    onClick={() => handleNavigate('/dashboard/enhanced-journal-management')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <BookOpen className="w-4 h-4 mr-2" />
                    Smart Journal Management
                  </Button>
                  <Button 
                    onClick={() => handleNavigate('/dashboard/journal-hub?tab=reports')}
                    className="w-full justify-start"
                    variant="outline"
                  >
                    <BarChart3 className="w-4 h-4 mr-2" />
                    View Reports
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Entry Types Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Entry Types
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summaryLoading ? (
                  <div className="flex items-center justify-center py-4">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2">
                    {summaryData?.entryTypes?.map((type: any) => (
                      <div key={type.id} className="flex items-center justify-between">
                        <span className="text-sm font-medium">{type.name}</span>
                        <Badge variant="secondary">{type.count}</Badge>
                      </div>
                    )) || (
                      <p className="text-sm text-gray-500">No entry types found</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Recent Journal Entries
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleNavigate('/dashboard/journal-hub')}
                >
                  View All
                  <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {recentEntries?.entries?.map((entry: RecentEntry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(entry.status)}
                        <div>
                          <p className="font-medium text-sm">{entry.reference}</p>
                          <p className="text-xs text-gray-500">{entry.memo}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(entry.date).toLocaleDateString()}
                            {entry.entryType && ` • ${entry.entryType.name}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(entry.status)}>
                          {entry.status.replace('_', ' ')}
                        </Badge>
                        <span className="text-sm font-medium">
                          ${entry.totalAmount.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500 text-center py-4">No recent entries found</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approvals" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Pending Approvals
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleNavigate('/dashboard/journal-hub?tab=approvals')}
                >
                  View All
                  <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {approvalsLoading ? (
                <div className="flex items-center justify-center py-4">
                  <RefreshCw className="w-4 h-4 animate-spin" />
                </div>
              ) : (
                <div className="space-y-3">
                  {(pendingApprovals?.pendingApprovals || [])?.map((approval: any) => (
                    <div key={approval.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-3">
                        <Clock className="w-4 h-4 text-yellow-500" />
                        <div>
                          <p className="font-medium text-sm">{approval.entry?.reference}</p>
                          <p className="text-xs text-gray-500">{approval.entry?.memo}</p>
                          <p className="text-xs text-gray-400">
                            Requested by {approval.requestedBy?.name}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-yellow-100 text-yellow-800">
                          Pending
                        </Badge>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )) || (
                    <p className="text-sm text-gray-500 text-center py-4">No pending approvals</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
