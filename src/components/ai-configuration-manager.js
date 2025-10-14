import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
;
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import { Brain, Tag, Settings, Building2 } from 'lucide-react';
import { apiService } from '../lib/api';
export function AIConfigurationManager({ companyId }) {
    const [config, setConfig] = useState(null);
    const [industries, setIndustries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('prompts');
    const { toast } = useToast();
    // Load configuration on mount
    useEffect(() => {
        loadConfiguration();
        loadIndustries();
    }, [companyId]);
    const loadConfiguration = async () => {
        try {
            const response = await apiService.request(`/ai/config/${companyId}`);
            setConfig(response.data);
        }
        catch (error) {
            console.error('Failed to load AI configuration:', error);
            toast({
                title: 'Error',
                description: 'Failed to load AI configuration',
                variant: 'destructive',
            });
        }
        finally {
            setLoading(false);
        }
    };
    const loadIndustries = async () => {
        try {
            const response = await apiService.request('/ai/config/industries');
            setIndustries(response.data);
        }
        catch (error) {
            console.error('Failed to load industries:', error);
        }
    };
    const saveConfiguration = async (configType, data) => {
        setSaving(true);
        try {
            await apiService.request(`/ai/config/${companyId}/${configType}`, { method: 'PUT', body: JSON.stringify(data) });
            toast({
                title: 'Success',
                description: `${configType} configuration saved successfully`,
            });
            await loadConfiguration();
        }
        catch (error) {
            console.error('Failed to save configuration:', error);
            toast({
                title: 'Error',
                description: 'Failed to save configuration',
                variant: 'destructive',
            });
        }
        finally {
            setSaving(false);
        }
    };
    const applyIndustryConfig = async (industryCode) => {
        setSaving(true);
        try {
            await apiService.request(`/ai/config/${companyId}/industry/${industryCode}`, { method: 'POST' });
            toast({
                title: 'Success',
                description: `Industry configuration applied successfully`,
            });
            await loadConfiguration();
        }
        catch (error) {
            console.error('Failed to apply industry config:', error);
            toast({
                title: 'Error',
                description: 'Failed to apply industry configuration',
                variant: 'destructive',
            });
        }
        finally {
            setSaving(false);
        }
    };
    const resetConfiguration = async (configType) => {
        setSaving(true);
        try {
            await apiService.request(`/ai/config/${companyId}/reset`, { method: 'POST', body: JSON.stringify({ configType }) });
            toast({
                title: 'Success',
                description: `Configuration reset to defaults`,
            });
            await loadConfiguration();
        }
        catch (error) {
            console.error('Failed to reset configuration:', error);
            toast({
                title: 'Error',
                description: 'Failed to reset configuration',
                variant: 'destructive',
            });
        }
        finally {
            setSaving(false);
        }
    };
    if (loading) {
        return (_jsx("div", { className: "space-y-4", children: _jsx(Card, { children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "animate-pulse space-y-4", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-1/4" }), _jsx("div", { className: "h-32 bg-gray-200 rounded" })] }) }) }) }));
    }
    if (!config) {
        return (_jsx(Alert, { children: _jsx(AlertDescription, { children: "Failed to load AI configuration. Please try refreshing the page." }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsxs("div", { children: [_jsx("h2", { className: "text-2xl font-bold", children: "AI Configuration Manager" }), _jsx("p", { className: "text-gray-600", children: "Customize AI prompts, categories, and behavior settings" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { variant: "outline", onClick: () => resetConfiguration('all'), disabled: saving, children: "Reset All" }), _jsx(Button, { onClick: () => loadConfiguration(), disabled: saving, children: "Refresh" })] })] }), _jsxs(Tabs, { value: activeTab, onValueChange: setActiveTab, variant: "default", children: [_jsxs(TabsList, { variant: "default", className: "grid w-full grid-cols-4", children: [_jsx(TabsTrigger, { value: "prompts", variant: "default", icon: _jsx(Brain, { className: "w-4 h-4" }), children: "Prompts" }), _jsx(TabsTrigger, { value: "categories", variant: "default", icon: _jsx(Tag, { className: "w-4 h-4" }), children: "Categories" }), _jsx(TabsTrigger, { value: "behavior", variant: "default", icon: _jsx(Settings, { className: "w-4 h-4" }), children: "Behavior" }), _jsx(TabsTrigger, { value: "industries", variant: "default", icon: _jsx(Building2, { className: "w-4 h-4" }), badge: industries.length, children: "Industries" })] }), _jsx(TabsContent, { value: "prompts", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "AI Prompts Configuration" }), _jsx("p", { className: "text-sm text-gray-600", children: "Customize the prompts used by AI for different tasks" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Transaction Categorization" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "System Prompt" }), _jsx(Textarea, { value: config.prompts.transactionCategorization.systemPrompt, onChange: (e) => setConfig({
                                                                        ...config,
                                                                        prompts: {
                                                                            ...config.prompts,
                                                                            transactionCategorization: {
                                                                                ...config.prompts.transactionCategorization,
                                                                                systemPrompt: e.target.value
                                                                            }
                                                                        }
                                                                    }), rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { children: "User Prompt Template" }), _jsx(Textarea, { value: config.prompts.transactionCategorization.userPromptTemplate, onChange: (e) => setConfig({
                                                                        ...config,
                                                                        prompts: {
                                                                            ...config.prompts,
                                                                            transactionCategorization: {
                                                                                ...config.prompts.transactionCategorization,
                                                                                userPromptTemplate: e.target.value
                                                                            }
                                                                        }
                                                                    }), rows: 6 }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Use ", '{description}', ", ", '{amount}', ", ", '{transactionType}', ", ", '{categories}', " as placeholders"] })] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Anomaly Detection" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "System Prompt" }), _jsx(Textarea, { value: config.prompts.anomalyDetection.systemPrompt, onChange: (e) => setConfig({
                                                                        ...config,
                                                                        prompts: {
                                                                            ...config.prompts,
                                                                            anomalyDetection: {
                                                                                ...config.prompts.anomalyDetection,
                                                                                systemPrompt: e.target.value
                                                                            }
                                                                        }
                                                                    }), rows: 3 })] }), _jsxs("div", { children: [_jsx(Label, { children: "Duplicate Analysis Prompt" }), _jsx(Textarea, { value: config.prompts.anomalyDetection.duplicateAnalysisPrompt, onChange: (e) => setConfig({
                                                                        ...config,
                                                                        prompts: {
                                                                            ...config.prompts,
                                                                            anomalyDetection: {
                                                                                ...config.prompts.anomalyDetection,
                                                                                duplicateAnalysisPrompt: e.target.value
                                                                            }
                                                                        }
                                                                    }), rows: 4 }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: ["Use ", '{transactions}', " as placeholder"] })] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => saveConfiguration('prompts', config.prompts), disabled: saving, children: saving ? 'Saving...' : 'Save Prompts' }), _jsx(Button, { variant: "outline", onClick: () => resetConfiguration('prompts'), disabled: saving, children: "Reset to Defaults" })] })] })] }) }), _jsx(TabsContent, { value: "categories", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "AI Categories Configuration" }), _jsx("p", { className: "text-sm text-gray-600", children: "Manage categories used by AI for transaction categorization" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Expense Categories" }), _jsx("div", { className: "grid gap-4", children: config.categories.expenseCategories.map((category, index) => (_jsxs("div", { className: "border rounded-lg p-4 space-y-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Input, { value: category.name, onChange: (e) => {
                                                                            const newCategories = [...config.categories.expenseCategories];
                                                                            newCategories[index].name = e.target.value;
                                                                            setConfig({
                                                                                ...config,
                                                                                categories: {
                                                                                    ...config.categories,
                                                                                    expenseCategories: newCategories
                                                                                }
                                                                            });
                                                                        }, placeholder: "Category name" }), _jsx(Input, { value: category.confidence, onChange: (e) => {
                                                                            const newCategories = [...config.categories.expenseCategories];
                                                                            newCategories[index].confidence = parseInt(e.target.value) || 0;
                                                                            setConfig({
                                                                                ...config,
                                                                                categories: {
                                                                                    ...config.categories,
                                                                                    expenseCategories: newCategories
                                                                                }
                                                                            });
                                                                        }, type: "number", min: "0", max: "100", className: "w-24" }), _jsx(Switch, { checked: category.isActive, onCheckedChange: (checked) => {
                                                                            const newCategories = [...config.categories.expenseCategories];
                                                                            newCategories[index].isActive = checked;
                                                                            setConfig({
                                                                                ...config,
                                                                                categories: {
                                                                                    ...config.categories,
                                                                                    expenseCategories: newCategories
                                                                                }
                                                                            });
                                                                        } })] }), _jsx(Textarea, { value: category.description, onChange: (e) => {
                                                                    const newCategories = [...config.categories.expenseCategories];
                                                                    newCategories[index].description = e.target.value;
                                                                    setConfig({
                                                                        ...config,
                                                                        categories: {
                                                                            ...config.categories,
                                                                            expenseCategories: newCategories
                                                                        }
                                                                    });
                                                                }, placeholder: "Category description", rows: 2 }), _jsx(Input, { value: category.keywords.join(', '), onChange: (e) => {
                                                                    const newCategories = [...config.categories.expenseCategories];
                                                                    newCategories[index].keywords = e.target.value.split(',').map(k => k.trim());
                                                                    setConfig({
                                                                        ...config,
                                                                        categories: {
                                                                            ...config.categories,
                                                                            expenseCategories: newCategories
                                                                        }
                                                                    });
                                                                }, placeholder: "Keywords (comma-separated)" })] }, index))) }), _jsx(Button, { variant: "outline", onClick: () => {
                                                        const newCategory = {
                                                            name: '',
                                                            description: '',
                                                            keywords: [],
                                                            confidence: 70,
                                                            isActive: true
                                                        };
                                                        setConfig({
                                                            ...config,
                                                            categories: {
                                                                ...config.categories,
                                                                expenseCategories: [...config.categories.expenseCategories, newCategory]
                                                            }
                                                        });
                                                    }, children: "Add Category" })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => saveConfiguration('categories', config.categories), disabled: saving, children: saving ? 'Saving...' : 'Save Categories' }), _jsx(Button, { variant: "outline", onClick: () => resetConfiguration('categories'), disabled: saving, children: "Reset to Defaults" })] })] })] }) }), _jsx(TabsContent, { value: "behavior", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "AI Behavior Configuration" }), _jsx("p", { className: "text-sm text-gray-600", children: "Configure AI behavior settings and thresholds" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Confidence Thresholds" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { children: [_jsxs(Label, { children: ["Categorization Threshold: ", config.behavior.confidenceThresholds.categorization, "%"] }), _jsx(Slider, { value: [config.behavior.confidenceThresholds.categorization], onValueChange: ([value]) => setConfig({
                                                                        ...config,
                                                                        behavior: {
                                                                            ...config.behavior,
                                                                            confidenceThresholds: {
                                                                                ...config.behavior.confidenceThresholds,
                                                                                categorization: value
                                                                            }
                                                                        }
                                                                    }), max: 100, min: 0, step: 5 })] }), _jsxs("div", { children: [_jsxs(Label, { children: ["Anomaly Detection Threshold: ", config.behavior.confidenceThresholds.anomalyDetection, "%"] }), _jsx(Slider, { value: [config.behavior.confidenceThresholds.anomalyDetection], onValueChange: ([value]) => setConfig({
                                                                        ...config,
                                                                        behavior: {
                                                                            ...config.behavior,
                                                                            confidenceThresholds: {
                                                                                ...config.behavior.confidenceThresholds,
                                                                                anomalyDetection: value
                                                                            }
                                                                        }
                                                                    }), max: 100, min: 0, step: 5 })] }), _jsxs("div", { children: [_jsxs(Label, { children: ["Fraud Detection Threshold: ", config.behavior.confidenceThresholds.fraudDetection, "%"] }), _jsx(Slider, { value: [config.behavior.confidenceThresholds.fraudDetection], onValueChange: ([value]) => setConfig({
                                                                        ...config,
                                                                        behavior: {
                                                                            ...config.behavior,
                                                                            confidenceThresholds: {
                                                                                ...config.behavior.confidenceThresholds,
                                                                                fraudDetection: value
                                                                            }
                                                                        }
                                                                    }), max: 100, min: 0, step: 5 })] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Automatic Actions" }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Auto-categorize transactions" }), _jsx(Switch, { checked: config.behavior.autoActions.autoCategorize, onCheckedChange: (checked) => setConfig({
                                                                        ...config,
                                                                        behavior: {
                                                                            ...config.behavior,
                                                                            autoActions: {
                                                                                ...config.behavior.autoActions,
                                                                                autoCategorize: checked
                                                                            }
                                                                        }
                                                                    }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Auto-flag anomalies" }), _jsx(Switch, { checked: config.behavior.autoActions.autoFlagAnomalies, onCheckedChange: (checked) => setConfig({
                                                                        ...config,
                                                                        behavior: {
                                                                            ...config.behavior,
                                                                            autoActions: {
                                                                                ...config.behavior.autoActions,
                                                                                autoFlagAnomalies: checked
                                                                            }
                                                                        }
                                                                    }) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx(Label, { children: "Require approval for AI actions" }), _jsx(Switch, { checked: config.behavior.autoActions.requireApproval, onCheckedChange: (checked) => setConfig({
                                                                        ...config,
                                                                        behavior: {
                                                                            ...config.behavior,
                                                                            autoActions: {
                                                                                ...config.behavior.autoActions,
                                                                                requireApproval: checked
                                                                            }
                                                                        }
                                                                    }) })] })] })] }), _jsx(Separator, {}), _jsxs("div", { className: "space-y-4", children: [_jsx("h3", { className: "text-lg font-semibold", children: "Model Settings" }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { children: "Temperature" }), _jsx(Input, { type: "number", value: config.behavior.modelSettings.temperature, onChange: (e) => setConfig({
                                                                        ...config,
                                                                        behavior: {
                                                                            ...config.behavior,
                                                                            modelSettings: {
                                                                                ...config.behavior.modelSettings,
                                                                                temperature: parseFloat(e.target.value)
                                                                            }
                                                                        }
                                                                    }), min: "0", max: "2", step: "0.1" })] }), _jsxs("div", { children: [_jsx(Label, { children: "Top P" }), _jsx(Input, { type: "number", value: config.behavior.modelSettings.topP, onChange: (e) => setConfig({
                                                                        ...config,
                                                                        behavior: {
                                                                            ...config.behavior,
                                                                            modelSettings: {
                                                                                ...config.behavior.modelSettings,
                                                                                topP: parseFloat(e.target.value)
                                                                            }
                                                                        }
                                                                    }), min: "0", max: "1", step: "0.1" })] })] })] }), _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: () => saveConfiguration('behavior', config.behavior), disabled: saving, children: saving ? 'Saving...' : 'Save Behavior' }), _jsx(Button, { variant: "outline", onClick: () => resetConfiguration('behavior'), disabled: saving, children: "Reset to Defaults" })] })] })] }) }), _jsx(TabsContent, { value: "industries", className: "space-y-4", children: _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Industry-Specific Configurations" }), _jsx("p", { className: "text-sm text-gray-600", children: "Apply pre-configured settings for different industries" })] }), _jsxs(CardContent, { className: "space-y-6", children: [_jsx("div", { className: "grid gap-4", children: industries.map((industry) => (_jsx("div", { className: "border rounded-lg p-4", children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-semibold", children: industry.name }), _jsx("p", { className: "text-sm text-gray-600", children: industry.description }), _jsxs("p", { className: "text-xs text-gray-500 mt-1", children: [industry.defaultCategories, " default categories"] })] }), _jsx(Button, { onClick: () => applyIndustryConfig(industry.code), disabled: saving, size: "sm", children: "Apply" })] }) }, industry.code))) }), _jsx(Alert, { children: _jsx(AlertDescription, { children: "Applying an industry configuration will update prompts, categories, and behavior settings to be optimized for that specific industry. This will override your current customizations." }) })] })] }) })] })] }));
}
