;

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar,
  Calculator,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Building,
  Globe
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// API client setup
const api = {
  get: async (url: string) => {
    const response = await fetch(`/api${url}`);
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  post: async (url: string, data: any) => {
    const response = await fetch(`/api${url}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  },
  put: async (url: string, data: any) => {
    const response = await fetch(`/api${url}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!response.ok) throw new Error('Network response was not ok');
    return response.json();
  }
};

interface TaxJurisdiction {
  id: string;
  name: string;
  code: string;
  country: string;
  level: string;
  isActive: boolean;
}

interface TaxRate {
  id: string;
  taxName: string;
  taxType: string;
  rate: number;
  appliesTo: string;
  jurisdiction: TaxJurisdiction;
  effectiveFrom: string;
  effectiveTo?: string;
}

interface TaxForm {
  id: string;
  formCode: string;
  formName: string;
  taxYear: number;
  status: string;
  dueDate?: string;
  createdAt: string;
}

interface TaxEvent {
  id: string;
  title: string;
  eventType: string;
  dueDate: string;
  priority: string;
  status: string;
  formCodes: string[];
}

interface ComplianceData {
  overallCompliance: number;
  status: string;
  forms: {
    total: number;
    submitted: number;
    overdue: number;
  };
  events: {
    total: number;
    completed: number;
    overdue: number;
  };
}

interface TaxCalculationResult {
  baseAmount: number;
  totalTaxAmount: number;
  totalAmount: number;
  effectiveRate: number;
}

const TaxManagementDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCompany, setSelectedCompany] = useState('');
  const queryClient = useQueryClient();

  // Queries
  const { data: complianceData } = useQuery<ComplianceData>({
    queryKey: ['tax-compliance'],
    queryFn: () => api.get('/tax/reports/compliance-status')
  });

  const { data: jurisdictions } = useQuery<TaxJurisdiction[]>({
    queryKey: ['tax-jurisdictions'],
    queryFn: () => api.get('/tax/jurisdictions')
  });

  const { data: taxRates } = useQuery<TaxRate[]>({
    queryKey: ['tax-rates'],
    queryFn: () => api.get('/tax/rates/advanced')
  });

  const { data: taxForms } = useQuery<TaxForm[]>({
    queryKey: ['tax-forms'],
    queryFn: () => api.get('/tax/forms')
  });

  const { data: upcomingEvents } = useQuery<TaxEvent[]>({
    queryKey: ['tax-events-upcoming'],
    queryFn: () => api.get('/tax/calendar/upcoming?days=30')
  });

  const { data: overdueEvents } = useQuery<TaxEvent[]>({
    queryKey: ['tax-events-overdue'],
    queryFn: () => api.get('/tax/calendar/overdue')
  });

  const { data: formTemplates } = useQuery({
    queryKey: ['tax-form-templates'],
    queryFn: () => api.get('/tax/forms/templates')
  });

  // Mutations
  const createJurisdictionMutation = useMutation({
    mutationFn: (data: any) => api.post('/tax/jurisdictions', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-jurisdictions'] });
    }
  });

  const createTaxRateMutation = useMutation({
    mutationFn: (data: any) => api.post('/tax/rates/advanced', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-rates'] });
    }
  });

  const generateFormMutation = useMutation({
    mutationFn: (data: any) => api.post('/tax/forms/generate', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tax-forms'] });
    }
  });

  const calculateTaxMutation = useMutation<TaxCalculationResult, Error, { baseAmount: number; taxRateIds: string[] }>({
    mutationFn: (data: { baseAmount: number; taxRateIds: string[] }) => api.post('/tax/calculate/advanced', data),
    onSuccess: (data: TaxCalculationResult) => {
      console.log('Tax calculation result:', data);
    }
  });

  // State for forms
  const [newJurisdiction, setNewJurisdiction] = useState({
    name: '',
    code: '',
    country: '',
    level: 'federal' as const,
    companyId: ''
  });

  const [newTaxRate, setNewTaxRate] = useState({
    jurisdictionId: '',
    taxName: '',
    taxType: 'sales',
    rate: 0,
    appliesTo: 'all',
    effectiveFrom: new Date().toISOString().split('T')[0],
    companyId: ''
  });

  const [taxCalculator, setTaxCalculator] = useState({
    baseAmount: 0,
    taxRateIds: [] as string[],
    transactionDate: new Date().toISOString().split('T')[0],
    companyId: ''
  });

  const [formGenerator, setFormGenerator] = useState({
    formCode: '',
    taxYear: new Date().getFullYear(),
    jurisdictionId: '',
    companyId: ''
  });

  // Event handlers
  const handleCreateJurisdiction = () => {
    createJurisdictionMutation.mutate(newJurisdiction);
  };

  const handleCreateTaxRate = () => {
    createTaxRateMutation.mutate(newTaxRate);
  };

  const handleCalculateTax = () => {
    calculateTaxMutation.mutate({
      baseAmount: taxCalculator.baseAmount,
      taxRateIds: taxCalculator.taxRateIds
    });
  };

  const handleGenerateForm = () => {
    generateFormMutation.mutate(formGenerator);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'fair': return 'text-yellow-600';
      case 'poor': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-100 text-green-800';
      case 'ready': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Management</h1>
          <p className="text-gray-600">Comprehensive tax compliance and management system</p>
        </div>
        <div className="flex items-center space-x-4">
          <Select value={selectedCompany} onValueChange={setSelectedCompany}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Company" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Companies</SelectItem>
              <SelectItem value="company1">Company 1</SelectItem>
              <SelectItem value="company2">Company 2</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="calendar">Calendar</TabsTrigger>
          <TabsTrigger value="forms">Forms</TabsTrigger>
          <TabsTrigger value="rates">Tax Rates</TabsTrigger>
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Compliance Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceData?.overallCompliance || 0}%</div>
                <Progress value={complianceData?.overallCompliance || 0} className="mt-2" />
                <p className={`text-xs mt-2 ${getStatusColor(complianceData?.status || '')}`}>
                  {complianceData?.status || 'Unknown'} status
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Forms Status</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceData?.forms.submitted || 0}</div>
                <p className="text-xs text-muted-foreground">
                  of {complianceData?.forms.total || 0} submitted
                </p>
                {(complianceData?.forms.overdue || 0) > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {complianceData?.forms.overdue} overdue
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Calendar Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{complianceData?.events.completed || 0}</div>
                <p className="text-xs text-muted-foreground">
                  of {complianceData?.events.total || 0} completed
                </p>
                {(complianceData?.events.overdue || 0) > 0 && (
                  <p className="text-xs text-red-600 mt-1">
                    {complianceData?.events.overdue} overdue
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jurisdictions</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jurisdictions?.length || 0}</div>
                <p className="text-xs text-muted-foreground">tax jurisdictions</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity & Alerts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Next 30 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {upcomingEvents?.slice(0, 5).map((event) => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-600">
                          Due: {new Date(event.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <Badge className={getPriorityColor(event.priority)}>
                        {event.priority}
                      </Badge>
                    </div>
                  ))}
                  {(!upcomingEvents || upcomingEvents.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No upcoming deadlines</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Overdue Items</CardTitle>
                <CardDescription>Requires immediate attention</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {overdueEvents?.slice(0, 5).map((event) => (
                    <Alert key={event.id}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{event.title}</strong><br />
                        Overdue since: {new Date(event.dueDate).toLocaleDateString()}
                      </AlertDescription>
                    </Alert>
                  ))}
                  {(!overdueEvents || overdueEvents.length === 0) && (
                    <div className="flex items-center justify-center py-4">
                      <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                      <p className="text-green-600">All items up to date!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Calendar</CardTitle>
              <CardDescription>Manage tax deadlines and compliance events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-4">
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    Initialize Calendar
                  </Button>
                  <Button variant="outline">Add Event</Button>
                </div>

                <div className="space-y-2">
                  <h3 className="font-semibold">Upcoming Events</h3>
                  {upcomingEvents?.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-gray-600">
                          {event.eventType} • Due: {new Date(event.dueDate).toLocaleDateString()}
                        </p>
                        {event.formCodes.length > 0 && (
                          <p className="text-xs text-gray-500">
                            Forms: {event.formCodes.join(', ')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getPriorityColor(event.priority)}>
                          {event.priority}
                        </Badge>
                        <Button variant="outline" size="sm">
                          {event.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <Clock className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="forms" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate New Form</CardTitle>
                <CardDescription>Create tax forms from templates</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="formCode">Form Type</Label>
                  <Select 
                    value={formGenerator.formCode} 
                    onValueChange={(value: string) => setFormGenerator(prev => ({ ...prev, formCode: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select form type" />
                    </SelectTrigger>
                    <SelectContent>
                      {formTemplates?.map((template: any) => (
                        <SelectItem key={template.formCode} value={template.formCode}>
                          {template.formCode} - {template.formName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="taxYear">Tax Year</Label>
                  <Input
                    id="taxYear"
                    type="number"
                    value={formGenerator.taxYear}
                    onChange={(e) => setFormGenerator(prev => ({ 
                      ...prev, 
                      taxYear: parseInt(e.target.value) 
                    }))}
                  />
                </div>

                <Button onClick={handleGenerateForm} className="w-full">
                  Generate Form
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Forms</CardTitle>
                <CardDescription>Manage existing tax forms</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {taxForms?.slice(0, 5).map((form) => (
                    <div key={form.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{form.formCode} - {form.formName}</p>
                        <p className="text-sm text-gray-600">Tax Year: {form.taxYear}</p>
                      </div>
                      <Badge className={getFormStatusColor(form.status)}>
                        {form.status}
                      </Badge>
                    </div>
                  ))}
                  {(!taxForms || taxForms.length === 0) && (
                    <p className="text-gray-500 text-center py-4">No forms found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Rates Management</CardTitle>
              <CardDescription>Manage tax rates and jurisdictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={handleCreateJurisdiction}>
                  <Building className="mr-2 h-4 w-4" />
                  Add Jurisdiction
                </Button>
                
                <div className="space-y-3">
                  {taxRates?.slice(0, 5).map((rate) => (
                    <div key={rate.id} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <p className="font-medium">{rate.taxName}</p>
                        <p className="text-sm text-gray-600">
                          {rate.jurisdiction.name} • {(rate.rate * 100).toFixed(2)}%
                        </p>
                      </div>
                      <Badge variant="outline">{rate.jurisdiction.level}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tax Calculator</CardTitle>
              <CardDescription>Calculate taxes for transactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="baseAmount">Base Amount</Label>
                <Input
                  id="baseAmount"
                  type="number"
                  step="0.01"
                  value={taxCalculator.baseAmount}
                  onChange={(e) => setTaxCalculator(prev => ({ 
                    ...prev, 
                    baseAmount: parseFloat(e.target.value) || 0 
                  }))}
                />
              </div>

              <Button onClick={handleCalculateTax} className="w-full">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Tax
              </Button>

              {calculateTaxMutation.data && (
                <div className="mt-4 p-4 bg-gray-50 rounded">
                  <h3 className="font-semibold mb-2">Calculation Result</h3>
                  <div className="space-y-1 text-sm">
                    <p>Base Amount: ${calculateTaxMutation.data.baseAmount?.toFixed(2)}</p>
                    <p>Total Tax: ${calculateTaxMutation.data.totalTaxAmount?.toFixed(2)}</p>
                    <p className="font-semibold">
                      Total Amount: ${calculateTaxMutation.data.totalAmount?.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Dashboard</CardTitle>
              <CardDescription>Monitor tax compliance status and requirements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{complianceData?.overallCompliance || 0}%</div>
                  <div className="text-gray-600">Overall Compliance</div>
                  <Progress value={complianceData?.overallCompliance || 0} className="mt-2" />
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{complianceData?.forms.submitted || 0}</div>
                  <div className="text-gray-600">Forms Submitted</div>
                  <div className="text-sm text-gray-500 mt-1">
                    of {complianceData?.forms.total || 0} total
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-3xl font-bold mb-2">{complianceData?.events.completed || 0}</div>
                  <div className="text-gray-600">Events Completed</div>
                  <div className="text-sm text-gray-500 mt-1">
                    of {complianceData?.events.total || 0} total
                  </div>
                </div>
              </div>

              {((complianceData?.forms.overdue || 0) > 0 || (complianceData?.events.overdue || 0) > 0) && (
                <Alert className="mt-6">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Attention Required:</strong> You have {complianceData?.forms.overdue || 0} overdue forms 
                    and {complianceData?.events.overdue || 0} overdue events that need immediate attention.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};


