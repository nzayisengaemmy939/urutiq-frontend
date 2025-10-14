import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
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
  ExternalLink,
  Brain,
  Calculator,
  Target,
  Activity
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import apiService from '../lib/api';
import { useAuth } from '../contexts/auth-context';
import { getCompanyId } from '../lib/config';

interface JournalNavigationBridgeProps {
  companyId?: string;
  onNavigate?: (path: string) => void;
  showQuickStats?: boolean;
  showRecentActivity?: boolean;
  compact?: boolean;
}

interface QuickStats {
  totalEntries: number;
  pendingApprovals: number;
  draftEntries: number;
  postedToday: number;
  totalAmount: number;
}

interface RecentActivity {
  id: string;
  type: 'entry_created' | 'entry_posted' | 'approval_requested' | 'template_used';
  description: string;
  timestamp: string;
  amount?: number;
  status?: string;
}

export function JournalNavigationBridge({ 
  companyId, 
  onNavigate,
  showQuickStats = true,
  showRecentActivity = true,
  compact = false
}: JournalNavigationBridgeProps) {
  const { isAuthenticated } = useAuth();
  const currentCompanyId = companyId || getCompanyId();
  const [activeView, setActiveView] = useState('overview');

  // Fetch quick stats
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['journal-quick-stats', currentCompanyId],
    queryFn: () => apiService.getJournalSummary({ companyId: currentCompanyId }),
    enabled: !!currentCompanyId && isAuthenticated && showQuickStats
  });

  // Fetch recent activity
  const { data: activityData, isLoading: activityLoading } = useQuery({
    queryKey: ['journal-recent-activity', currentCompanyId],
    queryFn: async () => {
      const [entries, approvals] = await Promise.all([
        apiService.getJournalEntries({
          pageSize: 3,
          sortBy: 'createdAt',
          sortOrder: 'desc'
        }),
        apiService.getPendingApprovals()
      ]);
      
      return {
        entries: entries.entries || [],
        approvals: approvals || []
      };
    },
    enabled: !!currentCompanyId && isAuthenticated && showRecentActivity
  });

  const handleNavigate = (path: string) => {
    if (onNavigate) {
      onNavigate(path);
    } else {
      window.location.href = path;
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'entry_created':
        return <Plus className="w-4 h-4 text-blue-500" />;
      case 'entry_posted':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'approval_requested':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'template_used':
        return <FileText className="w-4 h-4 text-purple-500" />;
      default:
        return <Activity className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'entry_created':
        return 'bg-blue-100 text-blue-800';
      case 'entry_posted':
        return 'bg-green-100 text-green-800';
      case 'approval_requested':
        return 'bg-yellow-100 text-yellow-800';
      case 'template_used':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="w-5 h-5 text-blue-500" />
              <div>
                <p className="font-medium text-sm">Journal Entries Hub</p>
                <p className="text-xs text-gray-500">
                  {statsLoading ? 'Loading...' : `${statsData?.totalEntries || 0} entries`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {statsData?.pendingApprovals > 0 && (
                <Badge className="bg-yellow-100 text-yellow-800">
                  {statsData.pendingApprovals} pending
                </Badge>
              )}
              <Button 
                size="sm" 
                onClick={() => handleNavigate('/dashboard/journal-hub')}
              >
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats Grid */}
      {showQuickStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Entries</p>
                  <p className="text-2xl font-bold">
                    {statsLoading ? '...' : statsData?.totalEntries || 0}
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
                  <p className="text-sm font-medium text-gray-600">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {statsLoading ? '...' : statsData?.pendingApprovals || 0}
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
                  <p className="text-sm font-medium text-gray-600">Drafts</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {statsLoading ? '...' : statsData?.draftEntries || 0}
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
                    {statsLoading ? '...' : statsData?.postedToday || 0}
                  </p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Journal Hub Main */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleNavigate('/dashboard/journal-hub')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <BookOpen className="w-8 h-8 text-blue-500" />
              <div>
                <h3 className="font-semibold text-lg">Journal Entries Hub</h3>
                <p className="text-sm text-gray-600">Centralized journal management</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">Complete journal workflow</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Smart Journal Management */}
        <Card className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleNavigate('/dashboard/enhanced-journal-management')}>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Brain className="w-8 h-8 text-purple-500" />
              <div>
                <h3 className="font-semibold text-lg">Smart Journal</h3>
                <p className="text-sm text-gray-600">AI-powered journal creation</p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-500">AI assistance & automation</span>
              <ArrowRight className="w-4 h-4 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-8 h-8 text-orange-500" />
              <div>
                <h3 className="font-semibold text-lg">Quick Actions</h3>
                <p className="text-sm text-gray-600">Fast journal operations</p>
              </div>
            </div>
            <div className="space-y-2">
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleNavigate('/dashboard/journal-hub?action=create')}
              >
                <Plus className="w-4 h-4 mr-2" />
                New Entry
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => handleNavigate('/dashboard/journal-hub?tab=templates')}
              >
                <FileText className="w-4 h-4 mr-2" />
                Use Template
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      {showRecentActivity && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Recent Activity
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
            {activityLoading ? (
              <div className="flex items-center justify-center py-4">
                <RefreshCw className="w-4 h-4 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {activityData?.entries?.map((entry: any) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <Plus className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="font-medium text-sm">{entry.reference}</p>
                        <p className="text-xs text-gray-500">{entry.memo}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={entry.status === 'POSTED' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                        {entry.status}
                      </Badge>
                      <span className="text-sm font-medium">
                        ${entry.totalAmount?.toFixed(2) || '0.00'}
                      </span>
                    </div>
                  </div>
                )) || (
                  <p className="text-sm text-gray-500 text-center py-4">No recent activity</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
