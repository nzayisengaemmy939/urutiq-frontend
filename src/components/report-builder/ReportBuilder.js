import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
;
import { useState, useCallback } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Trash2, Move, Settings, Eye, Download, Calendar, BarChart3, FileText, Image, Type, Calculator } from 'lucide-react';
const ReportBuilder = () => {
    const [template, setTemplate] = useState({
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
    const [selectedSection, setSelectedSection] = useState(null);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const addSection = useCallback((type) => {
        const newSection = {
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
    const updateSection = useCallback((sectionId, updates) => {
        setTemplate(prev => ({
            ...prev,
            layout: {
                ...prev.layout,
                sections: prev.layout.sections.map(section => section.id === sectionId ? { ...section, ...updates } : section)
            }
        }));
    }, []);
    const deleteSection = useCallback((sectionId) => {
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
    const addDataField = useCallback((sectionId, field) => {
        updateSection(sectionId, {
            dataFields: [...template.layout.sections.find(s => s.id === sectionId)?.dataFields || [], field]
        });
    }, [template.layout.sections, updateSection]);
    const updateDataField = useCallback((sectionId, fieldId, updates) => {
        updateSection(sectionId, {
            dataFields: template.layout.sections
                .find(s => s.id === sectionId)
                ?.dataFields.map(field => field.id === fieldId ? { ...field, ...updates } : field) || []
        });
    }, [template.layout.sections, updateSection]);
    const deleteDataField = useCallback((sectionId, fieldId) => {
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
            }
            else {
                console.error('Failed to save template');
            }
        }
        catch (error) {
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
            }
            else {
                console.error('Failed to execute report');
            }
        }
        catch (error) {
            console.error('Error executing report:', error);
        }
    };
    return (_jsx(DndProvider, { backend: HTML5Backend, children: _jsxs("div", { className: "flex h-screen bg-gray-50", children: [_jsx("div", { className: "w-80 bg-white border-r border-gray-200 p-4", children: _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "template-name", children: "Template Name" }), _jsx(Input, { id: "template-name", value: template.name, onChange: (e) => setTemplate(prev => ({ ...prev, name: e.target.value })), placeholder: "Enter template name" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "template-description", children: "Description" }), _jsx(Textarea, { id: "template-description", value: template.description, onChange: (e) => setTemplate(prev => ({ ...prev, description: e.target.value })), placeholder: "Enter template description", rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "data-source", children: "Data Source" }), _jsxs(Select, { value: template.dataSource.type, onValueChange: (value) => setTemplate(prev => ({
                                            ...prev,
                                            dataSource: { ...prev.dataSource, type: value }
                                        })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "accounts", children: "Accounts" }), _jsx(SelectItem, { value: "transactions", children: "Transactions" }), _jsx(SelectItem, { value: "journal_entries", children: "Journal Entries" }), _jsx(SelectItem, { value: "custom_query", children: "Custom Query" })] })] })] }), _jsx(Separator, {}), _jsxs("div", { children: [_jsx("h3", { className: "text-sm font-medium mb-2", children: "Add Sections" }), _jsxs("div", { className: "grid grid-cols-2 gap-2", children: [_jsxs(Button, { variant: "outline", size: "sm", onClick: () => addSection('header'), className: "flex items-center gap-2", children: [_jsx(Type, { className: "h-4 w-4" }), "Header"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => addSection('data'), className: "flex items-center gap-2", children: [_jsx(FileText, { className: "h-4 w-4" }), "Data"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => addSection('summary'), className: "flex items-center gap-2", children: [_jsx(Calculator, { className: "h-4 w-4" }), "Summary"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => addSection('chart'), className: "flex items-center gap-2", children: [_jsx(BarChart3, { className: "h-4 w-4" }), "Chart"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => addSection('text'), className: "flex items-center gap-2", children: [_jsx(Type, { className: "h-4 w-4" }), "Text"] }), _jsxs(Button, { variant: "outline", size: "sm", onClick: () => addSection('image'), className: "flex items-center gap-2", children: [_jsx(Image, { className: "h-4 w-4" }), "Image"] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-2", children: [_jsx(Button, { onClick: saveTemplate, className: "w-full", children: "Save Template" }), _jsx(Button, { onClick: executeReport, variant: "outline", className: "w-full", children: "Execute Report" })] })] }) }), _jsxs("div", { className: "flex-1 flex flex-col", children: [_jsx("div", { className: "bg-white border-b border-gray-200 p-4", children: _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-4", children: [_jsxs(Button, { variant: isPreviewMode ? "outline" : "default", onClick: () => setIsPreviewMode(!isPreviewMode), children: [_jsx(Eye, { className: "h-4 w-4 mr-2" }), isPreviewMode ? 'Edit Mode' : 'Preview Mode'] }), _jsxs(Button, { variant: "outline", children: [_jsx(Download, { className: "h-4 w-4 mr-2" }), "Export"] }), _jsxs(Button, { variant: "outline", children: [_jsx(Calendar, { className: "h-4 w-4 mr-2" }), "Schedule"] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs(Select, { value: template.layout.pageSize, onValueChange: (value) => setTemplate(prev => ({
                                                    ...prev,
                                                    layout: { ...prev.layout, pageSize: value }
                                                })), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "A4", children: "A4" }), _jsx(SelectItem, { value: "Letter", children: "Letter" }), _jsx(SelectItem, { value: "Legal", children: "Legal" })] })] }), _jsxs(Select, { value: template.layout.orientation, onValueChange: (value) => setTemplate(prev => ({
                                                    ...prev,
                                                    layout: { ...prev.layout, orientation: value }
                                                })), children: [_jsx(SelectTrigger, { className: "w-32", children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "portrait", children: "Portrait" }), _jsx(SelectItem, { value: "landscape", children: "Landscape" })] })] })] })] }) }), _jsx("div", { className: "flex-1 p-4 overflow-auto", children: _jsx("div", { className: "max-w-4xl mx-auto", children: _jsxs("div", { className: "bg-white shadow-lg rounded-lg p-8 min-h-[800px]", children: [template.layout.sections.map((section) => (_jsx(ReportSectionComponent, { section: section, isSelected: selectedSection === section.id, onSelect: () => setSelectedSection(section.id), onUpdate: (updates) => updateSection(section.id, updates), onDelete: () => deleteSection(section.id), onAddField: (field) => addDataField(section.id, field), onUpdateField: (fieldId, updates) => updateDataField(section.id, fieldId, updates), onDeleteField: (fieldId) => deleteDataField(section.id, fieldId), isPreviewMode: isPreviewMode }, section.id))), template.layout.sections.length === 0 && (_jsxs("div", { className: "text-center text-gray-500 py-20", children: [_jsx(FileText, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { children: "No sections added yet. Use the sidebar to add sections to your report." })] }))] }) }) })] }), selectedSection && (_jsx("div", { className: "w-80 bg-white border-l border-gray-200 p-4", children: _jsx(SectionPropertiesPanel, { section: template.layout.sections.find(s => s.id === selectedSection), onUpdate: (updates) => updateSection(selectedSection, updates), onClose: () => setSelectedSection(null) }) }))] }) }));
};
// Report Section Component
const ReportSectionComponent = ({ section, isSelected, onSelect, onUpdate, onDelete, onAddField, onUpdateField, onDeleteField, isPreviewMode }) => {
    const [{ isDragging }, drag] = useDrag({
        type: 'section',
        item: { id: section.id },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });
    const [{ isOver }, drop] = useDrop({
        accept: 'field',
        drop: (item) => {
            onAddField(item.field);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    });
    return (_jsxs("div", { ref: (node) => {
            drag(drop(node));
        }, className: `border-2 border-dashed rounded-lg p-4 mb-4 cursor-pointer transition-all ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'} ${isDragging ? 'opacity-50' : ''} ${isOver ? 'border-green-500 bg-green-50' : ''}`, onClick: onSelect, children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("h3", { className: "font-medium", children: section.title }), !isPreviewMode && (_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Move, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Settings, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onDelete, children: _jsx(Trash2, { className: "h-4 w-4" }) })] }))] }), _jsxs("div", { className: "space-y-2", children: [section.dataFields.map((field) => (_jsxs("div", { className: "flex items-center justify-between p-2 bg-gray-50 rounded", children: [_jsx("span", { className: "text-sm", children: field.name }), !isPreviewMode && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Button, { variant: "ghost", size: "sm", children: _jsx(Settings, { className: "h-3 w-3" }) }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => onDeleteField(field.id), children: _jsx(Trash2, { className: "h-3 w-3" }) })] }))] }, field.id))), section.dataFields.length === 0 && (_jsx("div", { className: "text-center text-gray-500 py-4 text-sm", children: "Drop data fields here" }))] })] }));
};
// Section Properties Panel
const SectionPropertiesPanel = ({ section, onUpdate, onClose }) => {
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("h3", { className: "font-medium", children: "Section Properties" }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, children: "\u00D7" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "section-title", children: "Title" }), _jsx(Input, { id: "section-title", value: section.title || '', onChange: (e) => onUpdate({ title: e.target.value }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "section-type", children: "Type" }), _jsxs(Select, { value: section.type, onValueChange: (value) => onUpdate({ type: value }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "header", children: "Header" }), _jsx(SelectItem, { value: "data", children: "Data" }), _jsx(SelectItem, { value: "summary", children: "Summary" }), _jsx(SelectItem, { value: "chart", children: "Chart" }), _jsx(SelectItem, { value: "text", children: "Text" }), _jsx(SelectItem, { value: "image", children: "Image" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "font-size", children: "Font Size" }), _jsx(Input, { id: "font-size", type: "number", value: section.styling.fontSize || 12, onChange: (e) => onUpdate({
                            styling: { ...section.styling, fontSize: parseInt(e.target.value) }
                        }) })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "text-align", children: "Text Align" }), _jsxs(Select, { value: section.styling.textAlign || 'left', onValueChange: (value) => onUpdate({
                            styling: { ...section.styling, textAlign: value }
                        }), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "left", children: "Left" }), _jsx(SelectItem, { value: "center", children: "Center" }), _jsx(SelectItem, { value: "right", children: "Right" })] })] })] })] }));
};
export default ReportBuilder;
