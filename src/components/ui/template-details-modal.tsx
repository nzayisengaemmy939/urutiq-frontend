import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './dialog';
import { Button } from './button';
import { Badge } from './badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  PieChart, 
  User, 
  Calendar,
  Eye,
  X,
  Share2,
  Lock
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  type: string;
  category: string;
  description?: string;
  isPublic: boolean;
  createdByUser: {
    id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface TemplateDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: ReportTemplate | null;
}

export function TemplateDetailsModal({ isOpen, onClose, template }: TemplateDetailsModalProps) {
  if (!template) return null;

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'balance_sheet':
        return <BarChart3 className="h-5 w-5 text-blue-600" />;
      case 'income_statement':
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      case 'cash_flow':
        return <Activity className="h-5 w-5 text-purple-600" />;
      case 'equity':
        return <PieChart className="h-5 w-5 text-orange-600" />;
      case 'custom':
        return <FileText className="h-5 w-5 text-gray-600" />;
      default:
        return <FileText className="h-5 w-5 text-gray-600" />;
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'balance_sheet':
        return 'Balance Sheet';
      case 'income_statement':
        return 'Income Statement';
      case 'cash_flow':
        return 'Cash Flow';
      case 'equity':
        return 'Equity Report';
      case 'custom':
        return 'Custom Report';
      default:
        return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-3">
            {getReportTypeIcon(template.type)}
            <span>{template.name}</span>
          </DialogTitle>
          <DialogDescription>
            Template details and configuration
          </DialogDescription>
        </DialogHeader>
        
        <div className="relative flex-1 overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-400">
          {/* Template Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                  <div className="flex items-center gap-2 mt-1">
                    {getReportTypeIcon(template.type)}
                    <span className="font-medium">{getReportTypeLabel(template.type)}</span>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Category</label>
                  <div className="mt-1">
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1 text-sm text-muted-foreground">
                  {template.description || 'No description provided'}
                </p>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Visibility:</span>
                {template.isPublic ? (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Share2 className="h-3 w-3" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Private
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Creator Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Creator Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">{template.createdByUser.name}</p>
                  <p className="text-sm text-muted-foreground">{template.createdByUser.email}</p>
                </div>
              </div>
              
              {template.createdAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Created: {new Date(template.createdAt).toLocaleDateString()}</span>
                </div>
              )}
              
              {template.updatedAt && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Updated: {new Date(template.updatedAt).toLocaleDateString()}</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Template Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Template Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Template ID:</span>
                  <span className="text-sm font-mono">{template.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Report Type:</span>
                  <span className="text-sm">{getReportTypeLabel(template.type)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Category:</span>
                  <span className="text-sm">{template.category}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Visibility:</span>
                  <span className="text-sm">{template.isPublic ? 'Public' : 'Private'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
