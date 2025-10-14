import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Badge } from '../ui/badge';
import { 
  Save, 
  Eye, 
  X,
  FileText,
  BarChart3,
  TrendingUp,
  Activity,
  PieChart,
  Plus,
  Trash2
} from 'lucide-react';

interface TemplateItem {
  id: string;
  type: 'account' | 'calculation' | 'section' | 'text';
  name: string;
  accountId?: string;
  calculation?: string;
}

interface TemplateCreatorProps {
  onSaveTemplate: (templateData: any) => void;
  onCancel: () => void;
}

export function TemplateCreator({ onSaveTemplate, onCancel }: TemplateCreatorProps) {
  const [templateName, setTemplateName] = useState('');
  const [templateType, setTemplateType] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [templateItems, setTemplateItems] = useState<TemplateItem[]>([]);
  const [selectedItemType, setSelectedItemType] = useState<string>('');

  const templateTypes = [
    { value: 'balance_sheet', label: 'Balance Sheet', icon: BarChart3 },
    { value: 'income_statement', label: 'Income Statement', icon: TrendingUp },
    { value: 'cash_flow', label: 'Cash Flow', icon: Activity },
    { value: 'equity', label: 'Equity', icon: PieChart },
    { value: 'custom', label: 'Custom Template', icon: FileText }
  ];

  const categories = [
    'Standard',
    'Custom',
    'Industry Specific',
    'Management',
    'Compliance',
    'Tax'
  ];

  const itemTypes = [
    { value: 'account', label: 'Account', icon: FileText },
    { value: 'calculation', label: 'Calculation', icon: BarChart3 },
    { value: 'section', label: 'Section Header', icon: BarChart3 },
    { value: 'text', label: 'Text/Description', icon: FileText }
  ];

  const handleAddItem = () => {
    if (!selectedItemType) return;

    const newItem: TemplateItem = {
      id: `item-${Date.now()}`,
      type: selectedItemType as TemplateItem['type'],
      name: `New ${selectedItemType}`
    };

    setTemplateItems([...templateItems, newItem]);
    setSelectedItemType('');
  };

  const handleRemoveItem = (itemId: string) => {
    setTemplateItems(templateItems.filter(item => item.id !== itemId));
  };

  const handleSaveTemplate = () => {
    if (!templateName || !templateType || !category) {
      alert('Please fill in template name, type, and category');
      return;
    }

    const templateData = {
      name: templateName,
      type: templateType,
      category,
      description,
      isPublic,
      items: templateItems,
      createdAt: new Date().toISOString()
    };

    onSaveTemplate(templateData);
  };

  const getTemplateTypeIcon = (type: string) => {
    const templateType = templateTypes.find(tt => tt.value === type);
    return templateType ? <templateType.icon className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  const getItemTypeIcon = (type: string) => {
    const itemType = itemTypes.find(it => it.value === type);
    return itemType ? <itemType.icon className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Create Template</CardTitle>
              <CardDescription>
                Create a reusable report template
              </CardDescription>
            </div>
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            {/* Template Configuration */}
            <div className="space-y-4">
              <h4 className="font-semibold">Template Configuration</h4>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Template Name</label>
                  <Input 
                    placeholder="Enter template name" 
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Template Type</label>
                  <Select value={templateType} onValueChange={setTemplateType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template type" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateTypes.map((type) => (
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
                  <label className="text-sm font-medium">Category</label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
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
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium">
                    Make this template public
                  </label>
                </div>
              </div>
            </div>

            {/* Template Items */}
            <div className="space-y-4">
              <h4 className="font-semibold">Template Items</h4>
              <div className="border rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
                {templateItems.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Add items to build your template
                  </p>
                ) : (
                  <div className="space-y-2">
                    {templateItems.map((item, index) => (
                      <div 
                        key={item.id} 
                        className="flex items-center justify-between p-2 border rounded bg-gray-50"
                      >
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">{index + 1}.</span>
                          {getItemTypeIcon(item.type)}
                          <span className="text-sm font-medium">{item.name}</span>
                          <Badge variant="outline" className="text-xs">
                            {item.type}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveItem(item.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
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
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSaveTemplate}>
              <Save className="h-4 w-4 mr-2" />
              Save Template
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Template Preview */}
      {templateItems.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getTemplateTypeIcon(templateType)}
              <span>Template Preview</span>
            </CardTitle>
            <CardDescription>
              Preview of your template structure
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {templateItems.map((item, index) => (
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
