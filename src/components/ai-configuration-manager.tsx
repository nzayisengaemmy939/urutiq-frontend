;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
import { Slider } from './ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { useToast } from '../hooks/use-toast';
import { Brain, Tag, Settings, Building2 } from 'lucide-react';
import { apiService } from '../lib/api';

interface AIConfiguration {
  prompts: any;
  behavior: any;
  categories: any;
}

interface IndustryConfig {
  name: string;
  code: string;
  description: string;
  defaultCategories: number;
}

export function AIConfigurationManager({ companyId }: { companyId: string }) {
  const [config, setConfig] = useState<AIConfiguration | null>(null);
  const [industries, setIndustries] = useState<IndustryConfig[]>([]);
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
    } catch (error) {
      console.error('Failed to load AI configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to load AI configuration',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const loadIndustries = async () => {
    try {
      const response = await apiService.request('/ai/config/industries');
      setIndustries(response.data);
    } catch (error) {
      console.error('Failed to load industries:', error);
    }
  };

  const saveConfiguration = async (configType: string, data: any) => {
    setSaving(true);
    try {
      await apiService.request(`/ai/config/${companyId}/${configType}`, { method: 'PUT', body: JSON.stringify(data) });
      toast({
        title: 'Success',
        description: `${configType} configuration saved successfully`,
      });
      await loadConfiguration();
    } catch (error) {
      console.error('Failed to save configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to save configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const applyIndustryConfig = async (industryCode: string) => {
    setSaving(true);
    try {
      await apiService.request(`/ai/config/${companyId}/industry/${industryCode}`, { method: 'POST' });
      toast({
        title: 'Success',
        description: `Industry configuration applied successfully`,
      });
      await loadConfiguration();
    } catch (error) {
      console.error('Failed to apply industry config:', error);
      toast({
        title: 'Error',
        description: 'Failed to apply industry configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetConfiguration = async (configType: string) => {
    setSaving(true);
    try {
      await apiService.request(`/ai/config/${companyId}/reset`, { method: 'POST', body: JSON.stringify({ configType }) });
      toast({
        title: 'Success',
        description: `Configuration reset to defaults`,
      });
      await loadConfiguration();
    } catch (error) {
      console.error('Failed to reset configuration:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset configuration',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!config) {
    return (
      <Alert>
        <AlertDescription>
          Failed to load AI configuration. Please try refreshing the page.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">AI Configuration Manager</h2>
          <p className="text-gray-600">Customize AI prompts, categories, and behavior settings</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => resetConfiguration('all')}
            disabled={saving}
          >
            Reset All
          </Button>
          <Button
            onClick={() => loadConfiguration()}
            disabled={saving}
          >
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} variant="default">
        <TabsList variant="default" className="grid w-full grid-cols-4">
          <TabsTrigger value="prompts" variant="default" icon={<Brain className="w-4 h-4" />}>
            Prompts
          </TabsTrigger>
          <TabsTrigger value="categories" variant="default" icon={<Tag className="w-4 h-4" />}>
            Categories
          </TabsTrigger>
          <TabsTrigger value="behavior" variant="default" icon={<Settings className="w-4 h-4" />}>
            Behavior
          </TabsTrigger>
          <TabsTrigger value="industries" variant="default" icon={<Building2 className="w-4 h-4" />} badge={industries.length}>
            Industries
          </TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Prompts Configuration</CardTitle>
              <p className="text-sm text-gray-600">
                Customize the prompts used by AI for different tasks
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Transaction Categorization */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Transaction Categorization</h3>
                <div className="space-y-4">
                  <div>
                    <Label>System Prompt</Label>
                    <Textarea
                      value={config.prompts.transactionCategorization.systemPrompt}
                      onChange={(e) => setConfig({
                        ...config,
                        prompts: {
                          ...config.prompts,
                          transactionCategorization: {
                            ...config.prompts.transactionCategorization,
                            systemPrompt: e.target.value
                          }
                        }
                      })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>User Prompt Template</Label>
                    <Textarea
                      value={config.prompts.transactionCategorization.userPromptTemplate}
                      onChange={(e) => setConfig({
                        ...config,
                        prompts: {
                          ...config.prompts,
                          transactionCategorization: {
                            ...config.prompts.transactionCategorization,
                            userPromptTemplate: e.target.value
                          }
                        }
                      })}
                      rows={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use {'{description}'}, {'{amount}'}, {'{transactionType}'}, {'{categories}'} as placeholders
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Anomaly Detection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Anomaly Detection</h3>
                <div className="space-y-4">
                  <div>
                    <Label>System Prompt</Label>
                    <Textarea
                      value={config.prompts.anomalyDetection.systemPrompt}
                      onChange={(e) => setConfig({
                        ...config,
                        prompts: {
                          ...config.prompts,
                          anomalyDetection: {
                            ...config.prompts.anomalyDetection,
                            systemPrompt: e.target.value
                          }
                        }
                      })}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>Duplicate Analysis Prompt</Label>
                    <Textarea
                      value={config.prompts.anomalyDetection.duplicateAnalysisPrompt}
                      onChange={(e) => setConfig({
                        ...config,
                        prompts: {
                          ...config.prompts,
                          anomalyDetection: {
                            ...config.prompts.anomalyDetection,
                            duplicateAnalysisPrompt: e.target.value
                          }
                        }
                      })}
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use {'{transactions}'} as placeholder
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => saveConfiguration('prompts', config.prompts)}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Prompts'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => resetConfiguration('prompts')}
                  disabled={saving}
                >
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Categories Configuration</CardTitle>
              <p className="text-sm text-gray-600">
                Manage categories used by AI for transaction categorization
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Expense Categories */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Expense Categories</h3>
                <div className="grid gap-4">
                  {config.categories.expenseCategories.map((category: any, index: number) => (
                    <div key={index} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          value={category.name}
                          onChange={(e) => {
                            const newCategories = [...config.categories.expenseCategories];
                            newCategories[index].name = e.target.value;
                            setConfig({
                              ...config,
                              categories: {
                                ...config.categories,
                                expenseCategories: newCategories
                              }
                            });
                          }}
                          placeholder="Category name"
                        />
                        <Input
                          value={category.confidence}
                          onChange={(e) => {
                            const newCategories = [...config.categories.expenseCategories];
                            newCategories[index].confidence = parseInt(e.target.value) || 0;
                            setConfig({
                              ...config,
                              categories: {
                                ...config.categories,
                                expenseCategories: newCategories
                              }
                            });
                          }}
                          type="number"
                          min="0"
                          max="100"
                          className="w-24"
                        />
                        <Switch
                          checked={category.isActive}
                          onCheckedChange={(checked) => {
                            const newCategories = [...config.categories.expenseCategories];
                            newCategories[index].isActive = checked;
                            setConfig({
                              ...config,
                              categories: {
                                ...config.categories,
                                expenseCategories: newCategories
                              }
                            });
                          }}
                        />
                      </div>
                      <Textarea
                        value={category.description}
                        onChange={(e) => {
                          const newCategories = [...config.categories.expenseCategories];
                          newCategories[index].description = e.target.value;
                          setConfig({
                            ...config,
                            categories: {
                              ...config.categories,
                              expenseCategories: newCategories
                            }
                          });
                        }}
                        placeholder="Category description"
                        rows={2}
                      />
                      <Input
                        value={category.keywords.join(', ')}
                        onChange={(e) => {
                          const newCategories = [...config.categories.expenseCategories];
                          newCategories[index].keywords = e.target.value.split(',').map(k => k.trim());
                          setConfig({
                            ...config,
                            categories: {
                              ...config.categories,
                              expenseCategories: newCategories
                            }
                          });
                        }}
                        placeholder="Keywords (comma-separated)"
                      />
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
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
                  }}
                >
                  Add Category
                </Button>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => saveConfiguration('categories', config.categories)}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Categories'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => resetConfiguration('categories')}
                  disabled={saving}
                >
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Behavior Configuration</CardTitle>
              <p className="text-sm text-gray-600">
                Configure AI behavior settings and thresholds
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Confidence Thresholds */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Confidence Thresholds</h3>
                <div className="space-y-4">
                  <div>
                    <Label>Categorization Threshold: {config.behavior.confidenceThresholds.categorization}%</Label>
                    <Slider
                      value={[config.behavior.confidenceThresholds.categorization]}
                      onValueChange={([value]) => setConfig({
                        ...config,
                        behavior: {
                          ...config.behavior,
                          confidenceThresholds: {
                            ...config.behavior.confidenceThresholds,
                            categorization: value
                          }
                        }
                      })}
                      max={100}
                      min={0}
                      step={5}
                    />
                  </div>
                  <div>
                    <Label>Anomaly Detection Threshold: {config.behavior.confidenceThresholds.anomalyDetection}%</Label>
                    <Slider
                      value={[config.behavior.confidenceThresholds.anomalyDetection]}
                      onValueChange={([value]) => setConfig({
                        ...config,
                        behavior: {
                          ...config.behavior,
                          confidenceThresholds: {
                            ...config.behavior.confidenceThresholds,
                            anomalyDetection: value
                          }
                        }
                      })}
                      max={100}
                      min={0}
                      step={5}
                    />
                  </div>
                  <div>
                    <Label>Fraud Detection Threshold: {config.behavior.confidenceThresholds.fraudDetection}%</Label>
                    <Slider
                      value={[config.behavior.confidenceThresholds.fraudDetection]}
                      onValueChange={([value]) => setConfig({
                        ...config,
                        behavior: {
                          ...config.behavior,
                          confidenceThresholds: {
                            ...config.behavior.confidenceThresholds,
                            fraudDetection: value
                          }
                        }
                      })}
                      max={100}
                      min={0}
                      step={5}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Auto Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Automatic Actions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Auto-categorize transactions</Label>
                    <Switch
                      checked={config.behavior.autoActions.autoCategorize}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        behavior: {
                          ...config.behavior,
                          autoActions: {
                            ...config.behavior.autoActions,
                            autoCategorize: checked
                          }
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Auto-flag anomalies</Label>
                    <Switch
                      checked={config.behavior.autoActions.autoFlagAnomalies}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        behavior: {
                          ...config.behavior,
                          autoActions: {
                            ...config.behavior.autoActions,
                            autoFlagAnomalies: checked
                          }
                        }
                      })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Require approval for AI actions</Label>
                    <Switch
                      checked={config.behavior.autoActions.requireApproval}
                      onCheckedChange={(checked) => setConfig({
                        ...config,
                        behavior: {
                          ...config.behavior,
                          autoActions: {
                            ...config.behavior.autoActions,
                            requireApproval: checked
                          }
                        }
                      })}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Model Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Model Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Temperature</Label>
                    <Input
                      type="number"
                      value={config.behavior.modelSettings.temperature}
                      onChange={(e) => setConfig({
                        ...config,
                        behavior: {
                          ...config.behavior,
                          modelSettings: {
                            ...config.behavior.modelSettings,
                            temperature: parseFloat(e.target.value)
                          }
                        }
                      })}
                      min="0"
                      max="2"
                      step="0.1"
                    />
                  </div>
                  <div>
                    <Label>Top P</Label>
                    <Input
                      type="number"
                      value={config.behavior.modelSettings.topP}
                      onChange={(e) => setConfig({
                        ...config,
                        behavior: {
                          ...config.behavior,
                          modelSettings: {
                            ...config.behavior.modelSettings,
                            topP: parseFloat(e.target.value)
                          }
                        }
                      })}
                      min="0"
                      max="1"
                      step="0.1"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => saveConfiguration('behavior', config.behavior)}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Behavior'}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => resetConfiguration('behavior')}
                  disabled={saving}
                >
                  Reset to Defaults
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="industries" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Industry-Specific Configurations</CardTitle>
              <p className="text-sm text-gray-600">
                Apply pre-configured settings for different industries
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                {industries.map((industry) => (
                  <div key={industry.code} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{industry.name}</h3>
                        <p className="text-sm text-gray-600">{industry.description}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {industry.defaultCategories} default categories
                        </p>
                      </div>
                      <Button
                        onClick={() => applyIndustryConfig(industry.code)}
                        disabled={saving}
                        size="sm"
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <Alert>
                <AlertDescription>
                  Applying an industry configuration will update prompts, categories, and behavior settings
                  to be optimized for that specific industry. This will override your current customizations.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
