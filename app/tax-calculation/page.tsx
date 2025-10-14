'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar, Calculator, FileText, Clock, TrendingUp, AlertCircle, CheckCircle, DollarSign, MapPin, Building, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'

interface Company {
  id: string
  name: string
  currency: string
}

interface TaxJurisdiction {
  id: string
  name: string
  country: string
  state?: string
  city?: string
  taxType: 'INCOME' | 'SALES' | 'PAYROLL' | 'PROPERTY' | 'EXCISE'
  rate: number
  minimumThreshold: number
  maximumThreshold?: number
  exemptions: string[]
  effectiveDate: string
  endDate?: string
}

interface TaxCalculation {
  jurisdiction: string
  taxType: string
  taxableAmount: number
  taxRate: number
  calculatedTax: number
  exemptions: number
  netTax: number
  effectiveRate: number
}

interface TaxForm {
  formId: string
  formName: string
  jurisdiction: string
  taxType: string
  period: string
  dueDate: string
  status: 'DRAFT' | 'READY' | 'FILED' | 'ACCEPTED' | 'REJECTED'
  fields: TaxFormField[]
  calculatedAmounts: Record<string, number>
  generatedAt: string
}

interface TaxFormField {
  fieldId: string
  fieldName: string
  fieldType: 'TEXT' | 'NUMBER' | 'CURRENCY' | 'DATE' | 'SELECT' | 'CALCULATED'
  value?: string | number
  required: boolean
  calculated: boolean
  formula?: string
  options?: string[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

interface TaxReturn {
  id: string
  companyId: string
  formId: string
  period: string
  status: 'DRAFT' | 'READY' | 'FILED' | 'ACCEPTED' | 'REJECTED'
  data: Record<string, any>
  calculatedTax: number
  paidAmount: number
  balance: number
  dueDate: string
  filedDate?: string
  acceptedDate?: string
  rejectionReason?: string
  createdAt: string
  updatedAt: string
}

export default function TaxCalculationPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [jurisdictions, setJurisdictions] = useState<TaxJurisdiction[]>([])
  const [taxForms, setTaxForms] = useState<TaxForm[]>([])
  const [taxReturns, setTaxReturns] = useState<TaxReturn[]>([])
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('calculator')
  
  // Calculator state
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('')
  const [taxableAmount, setTaxableAmount] = useState<string>('')
  const [selectedExemptions, setSelectedExemptions] = useState<string[]>([])
  const [calculationResult, setCalculationResult] = useState<TaxCalculation | null>(null)
  
  // Multi-jurisdiction calculator state
  const [multiCalculations, setMultiCalculations] = useState<Array<{
    jurisdictionId: string
    taxableAmount: number
    exemptions: string[]
  }>>([])
  const [multiResults, setMultiResults] = useState<TaxCalculation[]>([])
  
  // Form generation state
  const [selectedForm, setSelectedForm] = useState<string>('')
  const [formPeriod, setFormPeriod] = useState<string>('')
  const [generatedForm, setGeneratedForm] = useState<TaxForm | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const API = process.env.NEXT_PUBLIC_API_URL || ''
        const response = await fetch(`${API}/companies`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
            'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
          }
        })
        const data = await response.json()
        setCompanies(data.data || [])
        if (data.data?.length > 0) {
          setSelectedCompany(data.data[0].id)
        }
      } catch (error) {
        console.error('Error loading companies:', error)
        toast.error('Failed to load companies')
      }
    }
    loadCompanies()
  }, [])

  // Load jurisdictions when company changes
  useEffect(() => {
    if (selectedCompany) {
      loadJurisdictions()
    }
  }, [selectedCompany])

  const loadJurisdictions = async () => {
    if (!selectedCompany) return
    
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await fetch(`${API}/api/tax-calculation/${selectedCompany}/jurisdictions`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        }
      })
      const data = await response.json()
      setJurisdictions(data.data || [])
    } catch (error) {
      console.error('Error loading jurisdictions:', error)
      toast.error('Failed to load tax jurisdictions')
    }
  }

  const loadTaxForms = async () => {
    if (!selectedCompany) return
    
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await fetch(`${API}/api/tax-calculation/${selectedCompany}/forms`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        }
      })
      const data = await response.json()
      setTaxForms(data.data || [])
    } catch (error) {
      console.error('Error loading tax forms:', error)
      toast.error('Failed to load tax forms')
    }
  }

  const loadTaxReturns = async () => {
    if (!selectedCompany) return
    
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await fetch(`${API}/api/tax-calculation/${selectedCompany}/returns`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        }
      })
      const data = await response.json()
      setTaxReturns(data.data || [])
    } catch (error) {
      console.error('Error loading tax returns:', error)
      toast.error('Failed to load tax returns')
    }
  }

  const calculateTax = async () => {
    if (!selectedCompany || !selectedJurisdiction || !taxableAmount) return

    setLoading(true)
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await fetch(`${API}/api/tax-calculation/${selectedCompany}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        },
        body: JSON.stringify({
          jurisdictionId: selectedJurisdiction,
          taxableAmount: parseFloat(taxableAmount),
          exemptions: selectedExemptions
        })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate tax')
      }

      const data = await response.json()
      setCalculationResult(data.data)
      toast.success('Tax calculation completed')
    } catch (error) {
      console.error('Error calculating tax:', error)
      toast.error('Failed to calculate tax')
    } finally {
      setLoading(false)
    }
  }

  const calculateMultiJurisdiction = async () => {
    if (!selectedCompany || multiCalculations.length === 0) return

    setLoading(true)
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await fetch(`${API}/api/tax-calculation/${selectedCompany}/calculate-multi`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        },
        body: JSON.stringify({
          calculations: multiCalculations
        })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate multi-jurisdiction tax')
      }

      const data = await response.json()
      setMultiResults(data.data)
      toast.success('Multi-jurisdiction tax calculation completed')
    } catch (error) {
      console.error('Error calculating multi-jurisdiction tax:', error)
      toast.error('Failed to calculate multi-jurisdiction tax')
    } finally {
      setLoading(false)
    }
  }

  const generateTaxForm = async () => {
    if (!selectedCompany || !selectedForm || !formPeriod) return

    setLoading(true)
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await fetch(`${API}/api/tax-calculation/${selectedCompany}/forms/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        },
        body: JSON.stringify({
          formId: selectedForm,
          period: formPeriod,
          data: formData
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate tax form')
      }

      const data = await response.json()
      setGeneratedForm(data.data)
      toast.success('Tax form generated successfully')
    } catch (error) {
      console.error('Error generating tax form:', error)
      toast.error('Failed to generate tax form')
    } finally {
      setLoading(false)
    }
  }

  const addMultiCalculation = () => {
    setMultiCalculations([...multiCalculations, {
      jurisdictionId: '',
      taxableAmount: 0,
      exemptions: []
    }])
  }

  const updateMultiCalculation = (index: number, field: string, value: any) => {
    const updated = [...multiCalculations]
    updated[index] = { ...updated[index], [field]: value }
    setMultiCalculations(updated)
  }

  const removeMultiCalculation = (index: number) => {
    setMultiCalculations(multiCalculations.filter((_, i) => i !== index))
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(2)}%`
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
      case 'READY': return 'bg-blue-100 text-blue-800'
      case 'FILED': return 'bg-green-100 text-green-800'
      case 'ACCEPTED': return 'bg-green-100 text-green-800'
      case 'REJECTED': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTaxTypeIcon = (taxType: string) => {
    switch (taxType) {
      case 'INCOME': return <TrendingUp className="h-4 w-4" />
      case 'SALES': return <DollarSign className="h-4 w-4" />
      case 'PAYROLL': return <Building className="h-4 w-4" />
      case 'PROPERTY': return <MapPin className="h-4 w-4" />
      default: return <Calculator className="h-4 w-4" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tax Calculation Engine</h1>
          <p className="text-muted-foreground">Calculate taxes, generate forms, and manage compliance</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadTaxForms}>
            <FileText className="h-4 w-4 mr-2" />
            Load Forms
          </Button>
          <Button variant="outline" onClick={loadTaxReturns}>
            <Clock className="h-4 w-4 mr-2" />
            Load Returns
          </Button>
        </div>
      </div>

      {/* Company Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Company Selection</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company</Label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={loadJurisdictions} disabled={!selectedCompany}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Load Jurisdictions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculator">Tax Calculator</TabsTrigger>
          <TabsTrigger value="multi-calculator">Multi-Jurisdiction</TabsTrigger>
          <TabsTrigger value="forms">Tax Forms</TabsTrigger>
          <TabsTrigger value="returns">Tax Returns</TabsTrigger>
        </TabsList>

        {/* Tax Calculator Tab */}
        <TabsContent value="calculator" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Tax Calculator</CardTitle>
                <CardDescription>Calculate tax for a single jurisdiction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="jurisdiction">Jurisdiction</Label>
                  <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select jurisdiction" />
                    </SelectTrigger>
                    <SelectContent>
                      {jurisdictions.map((jurisdiction) => (
                        <SelectItem key={jurisdiction.id} value={jurisdiction.id}>
                          <div className="flex items-center gap-2">
                            {getTaxTypeIcon(jurisdiction.taxType)}
                            <span>{jurisdiction.name}</span>
                            <Badge variant="outline">{formatPercent(jurisdiction.rate)}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="taxable-amount">Taxable Amount</Label>
                  <Input
                    id="taxable-amount"
                    type="number"
                    value={taxableAmount}
                    onChange={(e) => setTaxableAmount(e.target.value)}
                    placeholder="Enter taxable amount"
                  />
                </div>

                <div>
                  <Label>Exemptions</Label>
                  <div className="space-y-2">
                    {selectedJurisdiction && jurisdictions.find(j => j.id === selectedJurisdiction)?.exemptions.map((exemption) => (
                      <div key={exemption} className="flex items-center space-x-2">
                        <Checkbox
                          id={exemption}
                          checked={selectedExemptions.includes(exemption)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedExemptions([...selectedExemptions, exemption])
                            } else {
                              setSelectedExemptions(selectedExemptions.filter(e => e !== exemption))
                            }
                          }}
                        />
                        <Label htmlFor={exemption} className="text-sm">
                          {exemption.replace(/_/g, ' ').toUpperCase()}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button onClick={calculateTax} disabled={loading || !selectedJurisdiction || !taxableAmount}>
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calculator className="h-4 w-4 mr-2" />
                  )}
                  Calculate Tax
                </Button>
              </CardContent>
            </Card>

            {/* Calculation Result */}
            <Card>
              <CardHeader>
                <CardTitle>Calculation Result</CardTitle>
              </CardHeader>
              <CardContent>
                {calculationResult ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Jurisdiction</Label>
                        <p className="font-medium">{calculationResult.jurisdiction}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Tax Type</Label>
                        <p className="font-medium">{calculationResult.taxType}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Taxable Amount</Label>
                        <p className="font-medium">{formatCurrency(calculationResult.taxableAmount)}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Tax Rate</Label>
                        <p className="font-medium">{formatPercent(calculationResult.taxRate)}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm text-muted-foreground">Calculated Tax</Label>
                        <p className="font-medium">{formatCurrency(calculationResult.calculatedTax)}</p>
                      </div>
                      <div>
                        <Label className="text-sm text-muted-foreground">Exemptions</Label>
                        <p className="font-medium">{formatCurrency(calculationResult.exemptions)}</p>
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <Label className="text-lg font-semibold">Net Tax</Label>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(calculationResult.netTax)}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <Label className="text-sm text-muted-foreground">Effective Rate</Label>
                        <p className="text-sm font-medium">{formatPercent(calculationResult.effectiveRate)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Calculator className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No calculation result yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Multi-Jurisdiction Calculator Tab */}
        <TabsContent value="multi-calculator" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Jurisdiction Tax Calculator</CardTitle>
              <CardDescription>Calculate taxes across multiple jurisdictions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Calculations</h3>
                <Button onClick={addMultiCalculation} size="sm">
                  Add Jurisdiction
                </Button>
              </div>

              <div className="space-y-4">
                {multiCalculations.map((calc, index) => (
                  <Card key={index}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <Label>Jurisdiction</Label>
                          <Select 
                            value={calc.jurisdictionId} 
                            onValueChange={(value) => updateMultiCalculation(index, 'jurisdictionId', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select jurisdiction" />
                            </SelectTrigger>
                            <SelectContent>
                              {jurisdictions.map((jurisdiction) => (
                                <SelectItem key={jurisdiction.id} value={jurisdiction.id}>
                                  {jurisdiction.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Taxable Amount</Label>
                          <Input
                            type="number"
                            value={calc.taxableAmount}
                            onChange={(e) => updateMultiCalculation(index, 'taxableAmount', parseFloat(e.target.value) || 0)}
                            placeholder="Enter amount"
                          />
                        </div>
                        <div>
                          <Label>Exemptions</Label>
                          <Input
                            placeholder="Comma-separated"
                            onChange={(e) => updateMultiCalculation(index, 'exemptions', e.target.value.split(',').map(s => s.trim()))}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => removeMultiCalculation(index)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {multiCalculations.length > 0 && (
                <Button onClick={calculateMultiJurisdiction} disabled={loading} className="w-full">
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Calculator className="h-4 w-4 mr-2" />
                  )}
                  Calculate All Jurisdictions
                </Button>
              )}

              {/* Multi-Jurisdiction Results */}
              {multiResults.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Multi-Jurisdiction Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {multiResults.map((result, index) => (
                        <div key={index} className="flex justify-between items-center p-4 border rounded-lg">
                          <div>
                            <p className="font-medium">{result.jurisdiction}</p>
                            <p className="text-sm text-muted-foreground">{result.taxType}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(result.netTax)}</p>
                            <p className="text-sm text-muted-foreground">{formatPercent(result.effectiveRate)}</p>
                          </div>
                        </div>
                      ))}
                      <div className="border-t pt-4">
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-semibold">Total Tax</p>
                          <p className="text-2xl font-bold text-primary">
                            {formatCurrency(multiResults.reduce((sum, result) => sum + result.netTax, 0))}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tax Forms Tab */}
        <TabsContent value="forms" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Generate Tax Form</CardTitle>
                <CardDescription>Generate and fill tax forms automatically</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="form">Tax Form</Label>
                  <Select value={selectedForm} onValueChange={setSelectedForm}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select tax form" />
                    </SelectTrigger>
                    <SelectContent>
                      {taxForms.map((form) => (
                        <SelectItem key={form.formId} value={form.formId}>
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{form.formName}</span>
                            <Badge variant="outline">{form.jurisdiction}</Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="period">Period</Label>
                  <Input
                    id="period"
                    type="month"
                    value={formPeriod}
                    onChange={(e) => setFormPeriod(e.target.value)}
                    placeholder="Select period"
                  />
                </div>

                <Button onClick={generateTaxForm} disabled={loading || !selectedForm || !formPeriod}>
                  {loading ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Generate Form
                </Button>
              </CardContent>
            </Card>

            {/* Generated Form */}
            <Card>
              <CardHeader>
                <CardTitle>Generated Form</CardTitle>
              </CardHeader>
              <CardContent>
                {generatedForm ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">{generatedForm.formName}</h3>
                      <Badge className={getStatusColor(generatedForm.status)}>
                        {generatedForm.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Period: {generatedForm.period} | Due: {new Date(generatedForm.dueDate).toLocaleDateString()}
                    </p>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium">Form Fields</h4>
                      {generatedForm.fields.map((field) => (
                        <div key={field.fieldId} className="flex justify-between items-center p-2 border rounded">
                          <span className="text-sm">{field.fieldName}</span>
                          <span className="font-medium">
                            {field.calculated && generatedForm.calculatedAmounts[field.fieldId] !== undefined
                              ? formatCurrency(generatedForm.calculatedAmounts[field.fieldId])
                              : field.value || 'N/A'
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No form generated yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tax Returns Tab */}
        <TabsContent value="returns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tax Returns</CardTitle>
              <CardDescription>Manage and track tax returns</CardDescription>
            </CardHeader>
            <CardContent>
              {taxReturns.length > 0 ? (
                <div className="space-y-4">
                  {taxReturns.map((taxReturn) => (
                    <div key={taxReturn.id} className="flex justify-between items-center p-4 border rounded-lg">
                      <div>
                        <p className="font-medium">{taxReturn.formId}</p>
                        <p className="text-sm text-muted-foreground">
                          Period: {taxReturn.period} | Due: {new Date(taxReturn.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-semibold">{formatCurrency(taxReturn.calculatedTax)}</p>
                          <p className="text-sm text-muted-foreground">
                            Balance: {formatCurrency(taxReturn.balance)}
                          </p>
                        </div>
                        <Badge className={getStatusColor(taxReturn.status)}>
                          {taxReturn.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No tax returns found</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
