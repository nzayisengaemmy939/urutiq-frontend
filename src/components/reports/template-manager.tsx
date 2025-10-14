import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Plus, 
  Eye, 
  FolderOpen, 
  FileText, 
  BarChart3, 
  TrendingUp, 
  Activity, 
  PieChart 
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
}

interface TemplateManagerProps {
  templates: ReportTemplate[];
  onCreateTemplate: () => void;
  onUseTemplate: (templateId: string) => void;
  onViewTemplate: (templateId: string) => void;
}

export function TemplateManager({ 
  templates, 
  onCreateTemplate, 
  onUseTemplate, 
  onViewTemplate 
}: TemplateManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'balance_sheet':
        return <BarChart3 className="h-4 w-4" />;
      case 'income_statement':
        return <TrendingUp className="h-4 w-4" />;
      case 'cash_flow':
        return <Activity className="h-4 w-4" />;
      case 'equity':
        return <PieChart className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
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
        return 'Equity';
      default:
        return 'Custom';
    }
  };

  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(template => template.category === selectedCategory);

  const categories = ['all', ...new Set(templates.map(t => t.category))];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Report Templates</h3>
          <p className="text-sm text-muted-foreground">
            Pre-built templates to quickly create reports
          </p>
        </div>
        <Button onClick={onCreateTemplate}>
          <Plus className="h-4 w-4 mr-2" />
          Create Template
        </Button>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category)}
          >
            {category === 'all' ? 'All Categories' : category}
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getReportTypeIcon(template.type)}
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                </div>
                <Badge variant={template.isPublic ? "default" : "secondary"}>
                  {template.category}
                </Badge>
              </div>
              <CardDescription>
                {template.description || `${getReportTypeLabel(template.type)} template`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Type:</span>
                  <span className="font-medium">{getReportTypeLabel(template.type)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Created by:</span>
                  <span className="font-medium">{template.createdByUser.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Visibility:</span>
                  <span className="font-medium">
                    {template.isPublic ? 'Public' : 'Private'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-4">
                <Button 
                  size="sm" 
                  className="flex-1"
                  onClick={() => onUseTemplate(template.id)}
                >
                  <FolderOpen className="h-4 w-4 mr-2" />
                  Use Template
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => onViewTemplate(template.id)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No templates found</h3>
          <p className="text-muted-foreground mb-4">
            {selectedCategory === 'all' 
              ? "Create your first template to get started"
              : `No templates found in the ${selectedCategory} category`
            }
          </p>
          <Button onClick={onCreateTemplate}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      )}
    </div>
  );
}
