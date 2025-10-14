'use client';

import React, { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Move, 
  Settings, 
  Eye, 
  Download, 
  Calendar,
  BarChart3,
  FileText,
  Image,
  Type,
  Calculator
} from 'lucide-react';

interface ReportSection {
  id: string;
  type: 'header' | 'data' | 'summary' | 'chart' | 'text' | 'image';
  title?: string;
  position: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  dataFields: DataField[];
  styling: SectionStyling;
}

interface DataField {
  id: string;
  name: string;
  type: 'account' | 'calculation' | 'text' | 'date' | 'number' | 'currency';
  source: string;
  formula?: string;
  format?: FieldFormat;
  aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max';
}

interface FieldFormat {
  type: 'currency' | 'percentage' | 'number' | 'date' | 'text';
  currency?: string;
  decimalPlaces?: number;
  thousandSeparator?: boolean;
  dateFormat?: string;
}

interface SectionStyling {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: number;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right';
  padding?: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  layout: {
    sections: ReportSection[];
    pageSize: 'A4' | 'Letter' | 'Legal';
    orientation: 'portrait' | 'landscape';
    margins: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
  };
  dataSource: {
    type: 'accounts' | 'transactions' | 'journal_entries' | 'custom_query';
    dateRange: {
      startDate: string;
      endDate: string;
    };
  };
  filters: any[];
  calculations: any[];
  formatting: any;
}

const ReportBuilder: React.FC = () => {
  const [template, setTemplate] = useState<ReportTemplate>({
    id: '',
    name: '',
    description: '',
    category: 'Custom',
    layout: {
      sections: [],
      pageSize: 'A4',
      orientation: 'portrait',
      margins: { top: 1, right: 1, bottom: 1, left: 1 }
    },
    dataSource: {
      type: 'accounts',
      dateRange: {
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      }
    },
    filters: [],
    calculations: [],
    formatting: {
      font: { family: 'Arial', size: 12, color: '#000000', weight: 'normal' },
      colors: { primary: '#009688', secondary: '#1565c0', accent: '#ff9800', background: '#ffffff' },
      borders: { enabled: true, style: 'solid', width: 1, color: '#000000' }
    }
  });

  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  const addSection = useCallback((type: ReportSection['type']) => {
    const newSection: ReportSection = {
      id: `section_${Date.now()}`,
      type,
      title: `${type.charAt(0).toUpperCase() + type.slice(1)} Section`,
      position: {
        x: 10,
        y: template.layout.sections.length * 20 + 10,
        width: 80,
        height: 15
      },
      dataFields: [],
      styling: {
        fontSize: 12,
        fontWeight: 'normal',
        textAlign: 'left',
        padding: { top: 5, right: 5, bottom: 5, left: 5 }
      }
    };

    setTemplate(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        sections: [...prev.layout.sections, newSection]
      }
    }));
  }, [template.layout.sections.length]);

  const updateSection = useCallback((sectionId: string, updates: Partial<ReportSection>) => {
    setTemplate(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        sections: prev.layout.sections.map(section =>
          section.id === sectionId ? { ...section, ...updates } : section
        )
      }
    }));
  }, []);

  const deleteSection = useCallback((sectionId: string) => {
    setTemplate(prev => ({
      ...prev,
      layout: {
        ...prev.layout,
        sections: prev.layout.sections.filter(section => section.id !== sectionId)
      }
    }));
    if (selectedSection === sectionId) {
      setSelectedSection(null);
    }
  }, [selectedSection]);

  const addDataField = useCallback((sectionId: string, field: DataField) => {
    updateSection(sectionId, {
      dataFields: [...template.layout.sections.find(s => s.id === sectionId)?.dataFields || [], field]
    });
  }, [template.layout.sections, updateSection]);

  const updateDataField = useCallback((sectionId: string, fieldId: string, updates: Partial<DataField>) => {
    updateSection(sectionId, {
      dataFields: template.layout.sections
        .find(s => s.id === sectionId)
        ?.dataFields.map(field =>
          field.id === fieldId ? { ...field, ...updates } : field
        ) || []
    });
  }, [template.layout.sections, updateSection]);

  const deleteDataField = useCallback((sectionId: string, fieldId: string) => {
    updateSection(sectionId, {
      dataFields: template.layout.sections
        .find(s => s.id === sectionId)
        ?.dataFields.filter(field => field.id !== fieldId) || []
    });
  }, [template.layout.sections, updateSection]);

  const saveTemplate = async () => {
    try {
      const response = await fetch('/api/reports/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default',
          'x-company-id': 'default'
        },
        body: JSON.stringify({
          companyId: 'default',
          ...template
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Template saved:', result);
        // Show success message
      } else {
        console.error('Failed to save template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
    }
  };

  const executeReport = async () => {
    try {
      const response = await fetch(`/api/reports/templates/${template.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'default',
          'x-company-id': 'default'
        },
        body: JSON.stringify({
          parameters: {}
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Report executed:', result);
        // Show report results
      } else {
        console.error('Failed to execute report');
      }
    } catch (error) {
      console.error('Error executing report:', error);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen bg-gray-50">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 p-4">
          <div className="space-y-4">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={template.name}
                onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
              />
            </div>

            <div>
              <Label htmlFor="template-description">Description</Label>
              <Textarea
                id="template-description"
                value={template.description}
                onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter template description"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="data-source">Data Source</Label>
              <Select
                value={template.dataSource.type}
                onValueChange={(value) => setTemplate(prev => ({
                  ...prev,
                  dataSource: { ...prev.dataSource, type: value as any }
                }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accounts">Accounts</SelectItem>
                  <SelectItem value="transactions">Transactions</SelectItem>
                  <SelectItem value="journal_entries">Journal Entries</SelectItem>
                  <SelectItem value="custom_query">Custom Query</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div>
              <h3 className="text-sm font-medium mb-2">Add Sections</h3>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSection('header')}
                  className="flex items-center gap-2"
                >
                  <Type className="h-4 w-4" />
                  Header
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSection('data')}
                  className="flex items-center gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Data
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSection('summary')}
                  className="flex items-center gap-2"
                >
                  <Calculator className="h-4 w-4" />
                  Summary
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSection('chart')}
                  className="flex items-center gap-2"
                >
                  <BarChart3 className="h-4 w-4" />
                  Chart
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSection('text')}
                  className="flex items-center gap-2"
                >
                  <Type className="h-4 w-4" />
                  Text
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addSection('image')}
                  className="flex items-center gap-2"
                >
                  <Image className="h-4 w-4" />
                  Image
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button onClick={saveTemplate} className="w-full">
                Save Template
              </Button>
              <Button onClick={executeReport} variant="outline" className="w-full">
                Execute Report
              </Button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant={isPreviewMode ? "outline" : "default"}
                  onClick={() => setIsPreviewMode(!isPreviewMode)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {isPreviewMode ? 'Edit Mode' : 'Preview Mode'}
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                <Button variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Select
                  value={template.layout.pageSize}
                  onValueChange={(value) => setTemplate(prev => ({
                    ...prev,
                    layout: { ...prev.layout, pageSize: value as any }
                  }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="A4">A4</SelectItem>
                    <SelectItem value="Letter">Letter</SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  value={template.layout.orientation}
                  onValueChange={(value) => setTemplate(prev => ({
                    ...prev,
                    layout: { ...prev.layout, orientation: value as any }
                  }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="portrait">Portrait</SelectItem>
                    <SelectItem value="landscape">Landscape</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Report Canvas */}
          <div className="flex-1 p-4 overflow-auto">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white shadow-lg rounded-lg p-8 min-h-[800px]">
                {template.layout.sections.map((section) => (
                  <ReportSectionComponent
                    key={section.id}
                    section={section}
                    isSelected={selectedSection === section.id}
                    onSelect={() => setSelectedSection(section.id)}
                    onUpdate={(updates) => updateSection(section.id, updates)}
                    onDelete={() => deleteSection(section.id)}
                    onAddField={(field) => addDataField(section.id, field)}
                    onUpdateField={(fieldId, updates) => updateDataField(section.id, fieldId, updates)}
                    onDeleteField={(fieldId) => deleteDataField(section.id, fieldId)}
                    isPreviewMode={isPreviewMode}
                  />
                ))}
                {template.layout.sections.length === 0 && (
                  <div className="text-center text-gray-500 py-20">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sections added yet. Use the sidebar to add sections to your report.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        {selectedSection && (
          <div className="w-80 bg-white border-l border-gray-200 p-4">
            <SectionPropertiesPanel
              section={template.layout.sections.find(s => s.id === selectedSection)!}
              onUpdate={(updates) => updateSection(selectedSection, updates)}
              onClose={() => setSelectedSection(null)}
            />
          </div>
        )}
      </div>
    </DndProvider>
  );
};

// Report Section Component
const ReportSectionComponent: React.FC<{
  section: ReportSection;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<ReportSection>) => void;
  onDelete: () => void;
  onAddField: (field: DataField) => void;
  onUpdateField: (fieldId: string, updates: Partial<DataField>) => void;
  onDeleteField: (fieldId: string) => void;
  isPreviewMode: boolean;
}> = ({ section, isSelected, onSelect, onUpdate, onDelete, onAddField, onUpdateField, onDeleteField, isPreviewMode }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'section',
    item: { id: section.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: 'field',
    drop: (item: { field: DataField }) => {
      onAddField(item.field);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={(node) => {
        drag(drop(node));
      }}
      className={`border-2 border-dashed rounded-lg p-4 mb-4 cursor-pointer transition-all ${
        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
      } ${isDragging ? 'opacity-50' : ''} ${isOver ? 'border-green-500 bg-green-50' : ''}`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-medium">{section.title}</h3>
        {!isPreviewMode && (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              <Move className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {section.dataFields.map((field) => (
          <div key={field.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
            <span className="text-sm">{field.name}</span>
            {!isPreviewMode && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm">
                  <Settings className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDeleteField(field.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        ))}
        
        {section.dataFields.length === 0 && (
          <div className="text-center text-gray-500 py-4 text-sm">
            Drop data fields here
          </div>
        )}
      </div>
    </div>
  );
};

// Section Properties Panel
const SectionPropertiesPanel: React.FC<{
  section: ReportSection;
  onUpdate: (updates: Partial<ReportSection>) => void;
  onClose: () => void;
}> = ({ section, onUpdate, onClose }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">Section Properties</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          ×
        </Button>
      </div>

      <div>
        <Label htmlFor="section-title">Title</Label>
        <Input
          id="section-title"
          value={section.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="section-type">Type</Label>
        <Select
          value={section.type}
          onValueChange={(value) => onUpdate({ type: value as any })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="header">Header</SelectItem>
            <SelectItem value="data">Data</SelectItem>
            <SelectItem value="summary">Summary</SelectItem>
            <SelectItem value="chart">Chart</SelectItem>
            <SelectItem value="text">Text</SelectItem>
            <SelectItem value="image">Image</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="font-size">Font Size</Label>
        <Input
          id="font-size"
          type="number"
          value={section.styling.fontSize || 12}
          onChange={(e) => onUpdate({
            styling: { ...section.styling, fontSize: parseInt(e.target.value) }
          })}
        />
      </div>

      <div>
        <Label htmlFor="text-align">Text Align</Label>
        <Select
          value={section.styling.textAlign || 'left'}
          onValueChange={(value) => onUpdate({
            styling: { ...section.styling, textAlign: value as any }
          })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Left</SelectItem>
            <SelectItem value="center">Center</SelectItem>
            <SelectItem value="right">Right</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default ReportBuilder;
