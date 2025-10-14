import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  Save, 
  Eye, 
  Trash2, 
  GripVertical,
  BarChart3,
  TrendingUp,
  Activity,
  PieChart,
  FileText,
  Calculator
} from 'lucide-react';

interface ReportItem {
  id: string;
  type: 'account' | 'calculation' | 'section' | 'text';
  name: string;
  accountId?: string;
  calculation?: string;
  order: number;
}

interface ReportBuilderProps {
  onCreateReport: (reportData: any) => void;
  onSaveAsDraft: (reportData: any) => void;
}

export function ReportBuilder({ onCreateReport, onSaveAsDraft }: ReportBuilderProps) {
  const [reportName, setReportName] = useState('');
  const [reportType, setReportType] = useState('');
  const [description, setDescription] = useState('');
  const [reportItems, setReportItems] = useState<ReportItem[]>([]);
  const [selectedItemType, setSelectedItemType] = useState<string>('');

  const reportTypes = [
    { value: 'balance_sheet', label: 'Balance Sheet', icon: BarChart3 },
    { value: 'income_statement', label: 'Income Statement', icon: TrendingUp },
    { value: 'cash_flow', label: 'Cash Flow', icon: Activity },
    { value: 'equity', label: 'Equity', icon: PieChart },
    { value: 'custom', label: 'Custom Report', icon: FileText }
  ];

  const itemTypes = [
    { value: 'account', label: 'Account', icon: FileText },
    { value: 'calculation', label: 'Calculation', icon: Calculator },
    { value: 'section', label: 'Section Header', icon: BarChart3 },
    { value: 'text', label: 'Text/Description', icon: FileText }
  ];

  const handleAddItem = () => {
    if (!selectedItemType) return;

    const newItem: ReportItem = {
      id: `item-${Date.now()}`,
      type: selectedItemType as ReportItem['type'],
      name: `New ${selectedItemType}`,
      order: reportItems.length
    };

    setReportItems([...reportItems, newItem]);
    setSelectedItemType('');
  };

  const handleRemoveItem = (itemId: string) => {
    setReportItems(reportItems.filter(item => item.id !== itemId));
  };

  const handleMoveItem = (itemId: string, direction: 'up' | 'down') => {
    const itemIndex = reportItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    const newItems = [...reportItems];
    const targetIndex = direction === 'up' ? itemIndex - 1 : itemIndex + 1;

    if (targetIndex >= 0 && targetIndex < newItems.length) {
      [newItems[itemIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[itemIndex]];
      setReportItems(newItems);
    }
  };

  const handleCreateReport = () => {
    if (!reportName || !reportType) {
      alert('Please fill in report name and type');
      return;
    }

    const reportData = {
      name: reportName,
      type: reportType,
      description,
      items: reportItems,
      createdAt: new Date().toISOString()
    };

    onCreateReport(reportData);
  };

  const handleSaveDraft = () => {
    const reportData = {
      name: reportName || 'Untitled Report',
      type: reportType || 'custom',
      description,
      items: reportItems,
      status: 'draft',
      createdAt: new Date().toISOString()
    };

    onSaveAsDraft(reportData);
  };

  const getReportTypeIcon = (type: string) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    return reportType ? <reportType.icon className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  const getItemTypeIcon = (type: string) => {
    const itemType = itemTypes.find(it => it.value === type);
    return itemType ? <itemType.icon className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Report Builder</CardTitle>
          <CardDescription>
            Create custom financial reports with drag-and-drop interface
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Report Configuration */}
            <div className="space-y-4">
              <h4 className="font-semibold">Report Configuration</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Report Name</label>
                  <Input 
                    placeholder="Enter report name" 
                    value={reportName}
                    onChange={(e) => setReportName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Report Type</label>
                  <Select value={reportType} onValueChange={setReportType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select report type" />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center space-x-2">
                            <type.icon className="h-4 w-4" />
                            <span>{type.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Input 
                    placeholder="Enter description" 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Report Items */}
            <div className="space-y-4">
              <h4 className="font-semibold">Report Items</h4>
              <div className="border rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                {reportItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Drag and drop items here to build your report
                  </p>
                ) : (
                  <div className="space-y-2">
                    {reportItems.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-2 border rounded bg-gray-50"
                      >
                        <div className="flex items-center space-x-2">
                          <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                          {getItemTypeIcon(item.type)}
                          <span className="text-sm font-medium">{item.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveItem(item.id, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleMoveItem(item.id, 'down')}
                            disabled={index === reportItems.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Add Item */}
              <div className="flex space-x-2">
                <Select value={selectedItemType} onValueChange={setSelectedItemType}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select item type" />
                  </SelectTrigger>
                  <SelectContent>
                    {itemTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center space-x-2">
                          <type.icon className="h-4 w-4" />
                          <span>{type.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={handleAddItem} disabled={!selectedItemType}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Item
                </Button>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleSaveDraft}>
              <Save className="h-4 w-4 mr-2" />
              Save as Draft
            </Button>
            <Button onClick={handleCreateReport}>
              <Eye className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Report Preview */}
      {reportItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getReportTypeIcon(reportType)}
              <span>Report Preview</span>
            </CardTitle>
            <CardDescription>
              Preview of your report structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {reportItems.map((item, index) => (
                <div key={item.id} className="flex items-center space-x-2 text-sm">
                  <span className="text-muted-foreground">{index + 1}.</span>
                  {getItemTypeIcon(item.type)}
                  <span>{item.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {item.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
