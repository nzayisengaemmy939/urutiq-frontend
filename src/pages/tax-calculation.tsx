import { useEffect, useState, useCallback } from 'react'
import { PageLayout } from '../components/page-layout'
import { Button } from '../components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'
import { Input } from '../components/ui/input'
import { Label } from '../components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs'
import { Badge } from '../components/ui/badge'
import { Textarea } from '../components/ui/textarea'
import { Checkbox } from '../components/ui/checkbox'
import { Calculator, FileText, Clock, TrendingUp, DollarSign, MapPin, Building, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { config } from '../lib/config'
import { apiService } from '../lib/api'

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
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [showCsvPaste, setShowCsvPaste] = useState(false)
  const [csvText, setCsvText] = useState('')
  
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
  const [formData] = useState<Record<string, any>>({})

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        await apiService.getDemoToken('tax-calculation', ['admin','accountant'])
        const API = config.api.baseUrlWithoutApi || ''
        const response = await fetch(`${API}/api/companies`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
            'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
          }
        })
        const data = await response.json()
        const list = data.data || []
        setCompanies(list)
        const savedCompany = localStorage.getItem('tax_company') || ''
        if (savedCompany && list.find((c: any) => c.id === savedCompany)) {
          setSelectedCompany(savedCompany)
        } else if (list.length > 0) {
          setSelectedCompany(list[0].id)
        }
      } catch (error) {
        console.error('Error loading companies:', error)
        toast.error('Failed to load companies')
      }
    }
    loadCompanies()
  }, [])


  const loadJurisdictions = useCallback(async () => {
    if (!selectedCompany) return
    
    try {
      console.log('Loading jurisdictions from tax management system...')
      
      // Load jurisdictions from the same system as the tax page
      const response = await fetch('/api/tax/jurisdictions', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'x-company-id': selectedCompany
        }
      });
      
      if (response.ok) {
        const data = await response.json()
        const jurisdictionsList = data?.jurisdictions || []
        
        // Convert jurisdiction format to match tax-calculation expectations
        const convertedJurisdictions = jurisdictionsList.map((j: any) => ({
          id: j.id,
          name: j.name,
          country: j.country,
          state: j.state,
          city: j.city,
          taxType: j.taxType === 'VAT' ? 'SALES' : j.taxType, // Convert VAT to SALES for compatibility
          rate: 0.15, // Default rate - in real system this would come from associated tax rates
          minimumThreshold: 0,
          maximumThreshold: undefined,
          exemptions: [],
          effectiveDate: j.createdAt?.substring(0, 10) || '2024-01-01',
          endDate: undefined
        }))
        
        console.log('Loaded jurisdictions:', convertedJurisdictions)
        setJurisdictions(convertedJurisdictions)
        
        if (convertedJurisdictions.length > 0) {
          toast.success(`Loaded ${convertedJurisdictions.length} jurisdictions from tax management`)
        } else {
          toast.info('No custom jurisdictions found, using defaults')
        }
      } else {
        throw new Error('Failed to load jurisdictions')
      }
    } catch (error) {
      console.error('Error loading jurisdictions:', error)
      
      // Fallback to demo jurisdictions
      const demoJurisdictions = [
        { id: 'us-federal', name: 'US Federal', country: 'United States', taxType: 'INCOME' as const, rate: 0.21, minimumThreshold: 0, exemptions: [], effectiveDate: '2024-01-01' },
        { id: 'us-california', name: 'California State', country: 'United States', state: 'CA', taxType: 'INCOME' as const, rate: 0.0884, minimumThreshold: 0, exemptions: [], effectiveDate: '2024-01-01' },
        { id: 'us-ny', name: 'New York State', country: 'United States', state: 'NY', taxType: 'INCOME' as const, rate: 0.08, minimumThreshold: 0, exemptions: [], effectiveDate: '2024-01-01' },
        { id: 'uk-corporate', name: 'UK Corporation Tax', country: 'United Kingdom', taxType: 'INCOME' as const, rate: 0.25, minimumThreshold: 0, exemptions: [], effectiveDate: '2024-01-01' },
        { id: 'canada-federal', name: 'Canada Federal', country: 'Canada', taxType: 'INCOME' as const, rate: 0.15, minimumThreshold: 0, exemptions: [], effectiveDate: '2024-01-01' }
      ]
      
      setJurisdictions(demoJurisdictions)
      toast.info('Using demo jurisdictions (failed to load custom ones)')
    }
    
    // Restore saved selections (after jurisdictions are loaded)
    setTimeout(() => {
      const savedJur = localStorage.getItem('tax_jurisdiction') || ''
      if (savedJur) {
        setSelectedJurisdiction(savedJur)
      }
      const savedAmt = localStorage.getItem('tax_amount') || ''
      if (savedAmt) setTaxableAmount(savedAmt)
      const savedEx = localStorage.getItem('tax_exemptions')
      if (savedEx) setSelectedExemptions(JSON.parse(savedEx))
      const savedMulti = localStorage.getItem('tax_multi')
      if (savedMulti) setMultiCalculations(JSON.parse(savedMulti))
    }, 100)
   }, [selectedCompany])

  // Load jurisdictions when company changes
  useEffect(() => {
    if (selectedCompany) {
      loadJurisdictions()
    }
    if (selectedCompany) localStorage.setItem('tax_company', selectedCompany)
  }, [selectedCompany, loadJurisdictions])

  const seedJurisdictions = async () => {
    if (!selectedCompany) return
    try {
      setLoading(true)
      const API = import.meta.env.VITE_API_URL || ''
      const response = await fetch(`${API}/api/tax-calculation/${selectedCompany}/jurisdictions/seed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        }
      })
      if (!response.ok) throw new Error('Seed endpoint unavailable')
      toast.success('Demo jurisdictions seeded')
      await loadJurisdictions()
    } catch (e) {
      toast.error('Failed to seed jurisdictions')
    } finally {
      setLoading(false)
    }
  }

  const loadTaxForms = async () => {
    if (!selectedCompany) return
    
    try {
      console.log('Loading tax forms from tax management system...')
      
      // Load tax forms from the same system as the tax page
      const response = await fetch('/api/tax/forms', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'x-company-id': selectedCompany
        }
      });
      
      if (response.ok) {
        const data = await response.json()
        const formsList = data?.forms || []
        
        // Convert form format to match tax-calculation expectations
        const convertedForms = formsList.map((f: any) => ({
          formId: f.formCode || f.id,
          formName: f.formName,
          jurisdiction: f.jurisdiction,
          taxType: f.taxType,
          period: f.period,
          dueDate: f.dueDate,
          status: f.status,
          fields: f.fields || [],
          calculatedAmounts: f.calculatedAmounts || {},
          generatedAt: f.createdAt?.substring(0, 10) || '2024-01-01'
        }))
        
        console.log('Loaded tax forms:', convertedForms)
        setTaxForms(convertedForms)
        
        if (convertedForms.length > 0) {
          toast.success(`Loaded ${convertedForms.length} tax forms from tax management`)
        } else {
          toast.info('No custom tax forms found, using defaults')
        }
      } else {
        throw new Error('Failed to load tax forms')
      }
    } catch (error) {
      console.error('Error loading tax forms:', error)
      
      // Fallback to demo forms
      const demoForms = [
        { formId: 'form-1120', formName: 'Form 1120 - US Corporation Tax Return', jurisdiction: 'US Federal', taxType: 'INCOME', period: 'Annual', dueDate: '2025-03-15', status: 'READY' as const, fields: [], calculatedAmounts: {}, generatedAt: '2024-01-01' },
        { formId: 'form-941', formName: 'Form 941 - Employer Quarterly Tax Return', jurisdiction: 'US Federal', taxType: 'PAYROLL', period: 'Quarterly', dueDate: '2025-01-31', status: 'READY' as const, fields: [], calculatedAmounts: {}, generatedAt: '2024-01-01' }
      ]
      
      setTaxForms(demoForms)
      toast.info('Using demo tax forms (failed to load custom ones)')
    }
  }

  const loadTaxReturns = async () => {
    if (!selectedCompany) return
    
    try {
      const API = config.api.baseUrlWithoutApi || ''
      const response = await fetch(`${API}/api/tax-calculation/${selectedCompany}/returns`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        }
      })
      if (response.ok) {
        const data = await response.json()
        setTaxReturns(data.data || [])
      } else {
        // Fallback: seed demo tax returns
        const demoReturns = [
          { id: 'return-2024-1', companyId: selectedCompany, formId: 'form-1120', period: '2024', status: 'DRAFT' as const, data: {}, calculatedTax: 15000, paidAmount: 0, balance: 15000, dueDate: '2025-03-15', filedAt: '', acceptedAt: '', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
          { id: 'return-2024-2', companyId: selectedCompany, formId: 'form-941', period: 'Q4-2024', status: 'FILED' as const, data: {}, calculatedTax: 2500, paidAmount: 2500, balance: 0, dueDate: '2025-01-31', filedAt: '2025-01-15', acceptedAt: '', createdAt: '2024-01-01', updatedAt: '2025-01-15' },
          { id: 'return-2023-1', companyId: selectedCompany, formId: 'form-1120', period: '2023', status: 'FILED' as const, data: {}, calculatedTax: 12000, paidAmount: 12000, balance: 0, dueDate: '2024-03-15', filedAt: '2024-03-10', acceptedAt: '2024-03-20', createdAt: '2023-01-01', updatedAt: '2024-03-20' }
        ]
        setTaxReturns(demoReturns)
        toast.info('Using demo tax returns')
      }
    } catch (error) {
      console.error('Error loading tax returns:', error)
      // Fallback: seed demo tax returns
      const demoReturns = [
        { id: 'return-2024-1', companyId: selectedCompany, formId: 'form-1120', period: '2024', status: 'DRAFT' as const, data: {}, calculatedTax: 15000, paidAmount: 0, balance: 15000, dueDate: '2025-03-15', filedAt: '', acceptedAt: '', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
        { id: 'return-2024-2', companyId: selectedCompany, formId: 'form-941', period: 'Q4-2024', status: 'FILED' as const, data: {}, calculatedTax: 2500, paidAmount: 2500, balance: 0, dueDate: '2025-01-31', filedAt: '2025-01-15', acceptedAt: '', createdAt: '2024-01-01', updatedAt: '2025-01-15' },
        { id: 'return-2023-1', companyId: selectedCompany, formId: 'form-1120', period: '2023', status: 'FILED' as const, data: {}, calculatedTax: 12000, paidAmount: 12000, balance: 0, dueDate: '2024-03-15', filedAt: '2024-03-10', acceptedAt: '2024-03-20', createdAt: '2023-01-01', updatedAt: '2024-03-20' }
      ]
      setTaxReturns(demoReturns)
      toast.info('Using demo tax returns')
    }
  }

  const calculateTax = async () => {
    if (!selectedCompany || !selectedJurisdiction || !taxableAmount) return

    setLoading(true)
    try {
      // Use the same tax calculation endpoint as Tax Management page
      const response = await fetch('/api/tax/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'x-company-id': selectedCompany
        },
        body: JSON.stringify({
          companyId: selectedCompany,
          currency: 'USD',
          lines: [{
            description: `Tax calculation for ${jurisdictions.find(j => j.id === selectedJurisdiction)?.name || 'jurisdiction'}`,
            type: 'service',
            amount: parseFloat(taxableAmount),
            taxExclusive: true,
            selectedRateId: 'auto' // Use auto-matching for jurisdiction-based calculation
          }]
        })
      })

      if (!response.ok) {
        throw new Error('Failed to calculate tax')
      }

      const data = await response.json()
      
      // Convert the Tax Management response format to Tax Calculation Engine format
      const calculationData = data.data || data
      const selectedJur = jurisdictions.find(j => j.id === selectedJurisdiction)
      
      const result = {
        jurisdiction: selectedJur?.name || 'Unknown',
        taxType: selectedJur?.taxType || 'INCOME',
        taxableAmount: parseFloat(taxableAmount),
        taxRate: calculationData.lines?.[0]?.taxRate || 0.15,
        calculatedTax: calculationData.totalTax || 0,
        exemptions: 0, // No exemptions in current implementation
        netTax: calculationData.totalTax || 0,
        effectiveRate: calculationData.lines?.[0]?.taxRate || 0.15
      }
      
      setCalculationResult(result)
      localStorage.setItem('tax_jurisdiction', selectedJurisdiction)
      localStorage.setItem('tax_amount', taxableAmount)
      localStorage.setItem('tax_exemptions', JSON.stringify(selectedExemptions))
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
      const API = config.api.baseUrlWithoutApi || ''
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
      localStorage.setItem('tax_multi', JSON.stringify(multiCalculations))
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
      const API = config.api.baseUrlWithoutApi || ''
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

  const importFromCsv = () => {
    const lines = csvText.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
    const parsed = lines.map(l => {
      const [jurisdictionId, amountStr, exStr] = l.split(',')
      return {
        jurisdictionId: jurisdictionId || '',
        taxableAmount: parseFloat(amountStr) || 0,
        exemptions: (exStr || '').split('|').map(s => s.trim()).filter(Boolean)
      }
    })
    setMultiCalculations(parsed)
    localStorage.setItem('tax_multi', JSON.stringify(parsed))
    setShowCsvPaste(false)
    setCsvText('')
  }

  const markReturnFiled = async (id: string) => {
    try {
      const API = import.meta.env.VITE_API_URL || ''
      const resp = await fetch(`${API}/api/tax-calculation/${selectedCompany}/returns/${id}/file`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        }
      })
      if (!resp.ok) throw new Error('Failed')
      toast.success('Return marked as filed')
      await loadTaxReturns()
    } catch (e) {
      toast.error('Failed to mark as filed')
    }
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
    <PageLayout>
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
              <div className="flex items-end gap-2">
                <Button onClick={loadJurisdictions} disabled={!selectedCompany}>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Load Jurisdictions
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => window.open('/dashboard/tax', '_blank')}
                  title="Open Tax Management page to create/manage jurisdictions (go to Jurisdictions tab)"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Manage Jurisdictions
                </Button>
                {jurisdictions.length === 0 && (
                  <Button variant="outline" onClick={seedJurisdictions} disabled={loading || !selectedCompany}>
                    Seed Demo Jurisdictions
                  </Button>
                )}
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
                  <div className="flex items-center gap-2">
                    <Button onClick={addMultiCalculation} size="sm">
                      Add Jurisdiction
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setShowCsvPaste(v => !v)}>
                      {showCsvPaste ? 'Hide CSV' : 'CSV Paste'}
                    </Button>
                  </div>
                </div>

              {showCsvPaste && (
                <div className="space-y-2">
                  <Label>CSV lines: jurisdictionId,amount,exempt1|exempt2</Label>
                  <Textarea value={csvText} onChange={e => setCsvText(e.target.value)} placeholder="JURIS-1,1000,small_business|startup\nJURIS-2,2500," />
                  <div className="flex justify-end">
                    <Button size="sm" onClick={importFromCsv}>Import</Button>
                  </div>
                </div>
              )}

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
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Label>Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ALL">All</SelectItem>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="READY">Ready</SelectItem>
                      <SelectItem value="FILED">Filed</SelectItem>
                      <SelectItem value="ACCEPTED">Accepted</SelectItem>
                      <SelectItem value="REJECTED">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" onClick={loadTaxReturns}><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
                </div>
              </div>
              {taxReturns.filter(r => statusFilter === 'ALL' || r.status === statusFilter).length > 0 ? (
                  <div className="space-y-4">
                  {taxReturns.filter(r => statusFilter === 'ALL' || r.status === statusFilter).map((taxReturn) => (
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
                        {taxReturn.status !== 'FILED' && (
                          <Button size="sm" onClick={() => markReturnFiled(taxReturn.id)}>Mark Filed</Button>
                        )}
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
    </PageLayout>
  )
}


