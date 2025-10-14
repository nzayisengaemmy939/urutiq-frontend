import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  PieChart,
  Plus,
  X
} from 'lucide-react';

interface ReportCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateReport: (reportData: ReportFormData) => void;
  templateData?: any; // Optional template data to pre-fill the form
}

interface ReportFormData {
  name: string;
  type: string;
  description: string;
  companyId: string;
  isTemplate: boolean;
  isPublic: boolean;
  metadata?: string;
}

const reportTypes = [
  { value: 'balance_sheet', label: 'Balance Sheet', icon: BarChart3, description: 'Assets, liabilities, and equity' },
  { value: 'income_statement', label: 'Income Statement', icon: TrendingUp, description: 'Revenue, expenses, and net income' },
  { value: 'cash_flow', label: 'Cash Flow', icon: Activity, description: 'Operating, investing, and financing activities' },
  { value: 'equity', label: 'Equity', icon: PieChart, description: 'Changes in equity over time' },
  { value: 'custom', label: 'Custom Report', icon: FileText, description: 'User-defined custom report' }
];

export function ReportCreationModal({ isOpen, onClose, onCreateReport, templateData }: ReportCreationModalProps) {
  const [formData, setFormData] = useState<ReportFormData>({
    name: templateData?.name || '',
    type: templateData?.type || '',
    description: templateData?.description || '',
    companyId: 'seed-company-1', // Default company ID
    isTemplate: false,
    isPublic: false,
    metadata: templateData?.configuration ? JSON.stringify(templateData.configuration) : undefined
  });

  const [errors, setErrors] = useState<Partial<ReportFormData>>({});

  // Update form data when templateData changes (for editing)
  useEffect(() => {
    if (templateData) {
      setFormData({
        name: templateData.name || '',
        type: templateData.type || '',
        description: templateData.description || '',
        companyId: 'seed-company-1',
        isTemplate: templateData.isTemplate || false,
        isPublic: templateData.isPublic || false,
        metadata: templateData.configuration ? JSON.stringify(templateData.configuration) : undefined
      });
    } else {
      // Reset form for new report creation
      setFormData({
        name: '',
        type: '',
        description: '',
        companyId: 'seed-company-1',
        isTemplate: false,
        isPublic: false,
        metadata: undefined
      });
    }
    // Clear any existing errors
    setErrors({});
  }, [templateData]);

  const handleInputChange = (field: keyof ReportFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<ReportFormData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Report name is required';
    }

    if (!formData.type) {
      newErrors.type = 'Report type is required';
    }

    if (!formData.companyId.trim()) {
      newErrors.companyId = 'Company ID is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onCreateReport(formData);
    onClose();
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      type: '',
      description: '',
      companyId: 'seed-company-1',
      isTemplate: false,
      isPublic: false,
      metadata: undefined
    });
    setErrors({});
    onClose();
  };

  const selectedReportType = reportTypes.find(rt => rt.value === formData.type);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {templateData?.id ? 'Edit Report' : 'Create New Report'}
          </DialogTitle>
          <DialogDescription>
            {templateData?.id
              ? `Edit the details of: ${templateData.name}`
              : templateData 
                ? `Create a report from template: ${templateData.name}`
                : 'Fill in the details to create a new financial report'
            }
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Report Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Report Name *</Label>
            <Input
              id="name"
              placeholder="Enter report name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* Report Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Report Type *</Label>
            <Select value={formData.type} onValueChange={(value) => handleInputChange('type', value)}>
              <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-3">
                      <type.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.type && (
              <p className="text-sm text-red-500">{errors.type}</p>
            )}
          </div>

          {/* Report Type Description */}
          {selectedReportType && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <selectedReportType.icon className="h-4 w-4" />
                <span className="font-medium">{selectedReportType.label}</span>
              </div>
              <p className="text-sm text-muted-foreground">{selectedReportType.description}</p>
            </div>
          )}

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter report description (optional)"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
            />
          </div>

          {/* Company ID */}
          <div className="space-y-2">
            <Label htmlFor="companyId">Company ID *</Label>
            <Input
              id="companyId"
              placeholder="Enter company ID"
              value={formData.companyId}
              onChange={(e) => handleInputChange('companyId', e.target.value)}
              className={errors.companyId ? 'border-red-500' : ''}
            />
            {errors.companyId && (
              <p className="text-sm text-red-500">{errors.companyId}</p>
            )}
          </div>

          {/* Options */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isTemplate"
                checked={formData.isTemplate}
                onCheckedChange={(checked) => handleInputChange('isTemplate', checked as boolean)}
              />
              <Label htmlFor="isTemplate" className="text-sm">
                Save as template for future use
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="isPublic"
                checked={formData.isPublic}
                onCheckedChange={(checked) => handleInputChange('isPublic', checked as boolean)}
              />
              <Label htmlFor="isPublic" className="text-sm">
                Make this report public (visible to all users)
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">
              <Plus className="h-4 w-4 mr-2" />
              {templateData?.id ? 'Update Report' : 'Create Report'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
