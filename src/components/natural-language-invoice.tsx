import { useState, useEffect, useRef, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Textarea } from "../components/ui/textarea"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { 
  MessageSquare, 
  Sparkles, 
  CheckCircle, 
  AlertTriangle, 
  Lightbulb,
  Send,
  Eye,
  Edit,
  Save,
  X,
  Loader2,
  Bot,
  User
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiService from '@/lib/api'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/auth-context'

interface NaturalLanguageInvoiceProps {
  onInvoiceCreated?: (invoice: any) => void
}

interface ParsedData {
  customer: {
    name: string
    email?: string
    phone?: string
    address?: string
  }
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    lineTotal: number
    category?: string
  }>
  dates: {
    issueDate: Date
    dueDate: Date
  }
  amounts: {
    subtotal: number
    taxRate: number
    taxAmount: number
    totalAmount: number
  }
  metadata: {
    confidence: number
    extractedEntities: string[]
    suggestedTerms: string
    suggestedNotes: string
  }
  rawAnalysis: {
    intent: string
    entities: Array<{
      type: 'customer' | 'item' | 'amount' | 'date' | 'quantity'
      value: string
      confidence: number
    }>
    relationships: Array<{
      from: string
      to: string
      relationship: string
    }>
  }
}

interface Suggestion {
  suggestion: string
  confidence: number
  type: 'customer' | 'item' | 'amount' | 'template'
  context: string
}

export function NaturalLanguageInvoice({ onInvoiceCreated }: NaturalLanguageInvoiceProps) {
  const [text, setText] = useState('')
  const [parsedData, setParsedData] = useState<ParsedData | null>(null)
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [editingData, setEditingData] = useState(false)
  const [selectedCompanyId, setSelectedCompanyId] = useState('')
  const [autoCreateCustomer, setAutoCreateCustomer] = useState(true)
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const queryClient = useQueryClient()
  const { user } = useAuth()

  // Get user's companies
  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: () => apiService.getCompanies(),
    enabled: !!user
  })

  const companiesList = useMemo(() => {
    if (!companies) return []
    const maybe: any = companies
    if (Array.isArray(maybe)) return maybe
    if (maybe && Array.isArray(maybe.data)) return maybe.data
    if (maybe && Array.isArray(maybe.companies)) return maybe.companies
    return []
  }, [companies])

  useEffect(() => {
    try {
      const stored = localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company')
      if (stored) setSelectedCompanyId(stored)
    } catch {}
  }, [])

  // Get suggestions when text changes
  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    if (text.length > 3 && selectedCompanyId) {
      const timer = setTimeout(() => {
        getSuggestions()
      }, 500)
      setDebounceTimer(timer)
    }

    return () => {
      if (debounceTimer) {
        clearTimeout(debounceTimer)
      }
    }
  }, [text, selectedCompanyId])

  // Parse text mutation
  const parseTextMutation = useMutation({
    mutationFn: (data: { text: string; companyId: string }) => 
      apiService.parseInvoiceText({ ...data, context: {} }),
    onSuccess: (response) => {
      setParsedData(response.parsedData)
      setShowPreview(true)
      toast.success('Text parsed successfully!')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to parse text')
    }
  })

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: (data: { text: string; companyId: string; autoCreateCustomer: boolean }) =>
      apiService.createInvoiceFromText({ ...data, validateData: true }),
    onSuccess: (response) => {
      if (response.success && response.invoice) {
        toast.success('Invoice created successfully!')
        queryClient.invalidateQueries({ queryKey: ['invoices'] })
        onInvoiceCreated?.(response.invoice)
        setText('')
        setParsedData(null)
        setShowPreview(false)
      } else {
        toast.error(response.message || 'Failed to create invoice')
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create invoice')
    }
  })

  const getSuggestions = async () => {
    if (!selectedCompanyId) return

    try {
      const response = await apiService.getInvoiceSuggestions(selectedCompanyId, text)
      setSuggestions(response.suggestions)
    } catch (error) {
      console.error('Error getting suggestions:', error)
    }
  }

  const handleParseText = () => {
    if (!text.trim() || !selectedCompanyId) {
      toast.error('Please enter text and select a company')
      return
    }

    setIsProcessing(true)
    parseTextMutation.mutate({
      text: text.trim(),
      companyId: selectedCompanyId
    }).finally(() => {
      setIsProcessing(false)
    })
  }

  const handleCreateInvoice = () => {
    if (!text.trim() || !selectedCompanyId) {
      toast.error('Please enter text and select a company')
      return
    }

    createInvoiceMutation.mutate({
      text: text.trim(),
      companyId: selectedCompanyId,
      autoCreateCustomer
    })
  }

  const handleSuggestionClick = (suggestion: string) => {
    setText(suggestion)
    textareaRef.current?.focus()
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800'
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'High Confidence'
    if (confidence >= 0.6) return 'Medium Confidence'
    return 'Low Confidence'
  }

  return (
    <div className="space-y-6">
      {/* Main Input Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Natural Language Invoice Creation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Company Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="company">Company *</Label>
              <Select value={selectedCompanyId} onValueChange={(val) => {
                setSelectedCompanyId(val)
                try { localStorage.setItem('company_id', val) } catch {}
              }}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  {companiesList?.map((company: any) => (
                    <SelectItem key={company.id} value={company.id}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoCreateCustomer"
                checked={autoCreateCustomer}
                onChange={(e) => setAutoCreateCustomer(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="autoCreateCustomer" className="text-sm">
                Auto-create customers if not found
              </Label>
            </div>
          </div>

          {/* Text Input */}
          <div>
            <Label htmlFor="invoiceText">Describe your invoice in natural language *</Label>
            <Textarea
              ref={textareaRef}
              id="invoiceText"
              placeholder="Example: Create an invoice for Acme Corp for 10 hours of consulting at $150 per hour, due in 30 days"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="min-h-[120px] mt-2"
            />
            <div className="flex items-center justify-between mt-2">
              <div className="text-sm text-gray-500">
                {text.length} characters
              </div>
              <Button
                onClick={handleParseText}
                disabled={!text.trim() || !selectedCompanyId || isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isProcessing ? 'Processing...' : 'Parse & Preview'}
              </Button>
            </div>
          </div>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div>
              <Label className="text-sm font-medium flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                Suggestions
              </Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestionClick(suggestion.suggestion)}
                    className="justify-start text-left h-auto p-3"
                  >
                    <div>
                      <div className="font-medium">{suggestion.suggestion}</div>
                      <div className="text-xs text-gray-500 mt-1">
                        {suggestion.context} • {Math.round(suggestion.confidence * 100)}% confidence
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Invoice Preview
              {parsedData && (
                <Badge className={getConfidenceColor(parsedData.metadata.confidence)}>
                  {getConfidenceText(parsedData.metadata.confidence)}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {parsedData && (
            <div className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Customer Information</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Customer Name</Label>
                      <Input value={parsedData.customer.name} readOnly />
                    </div>
                    <div>
                      <Label>Email</Label>
                      <Input value={parsedData.customer.email || ''} readOnly />
                    </div>
                    <div>
                      <Label>Phone</Label>
                      <Input value={parsedData.customer.phone || ''} readOnly />
                    </div>
                    <div>
                      <Label>Address</Label>
                      <Input value={parsedData.customer.address || ''} readOnly />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Items */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invoice Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {parsedData.items.map((item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <div className="font-medium">{item.description}</div>
                          <div className="text-sm text-gray-500">
                            {item.quantity} × ${item.unitPrice.toFixed(2)}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${item.lineTotal.toFixed(2)}</div>
                          {item.category && (
                            <div className="text-xs text-gray-500">{item.category}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Invoice Totals */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Invoice Totals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>${parsedData.amounts.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({parsedData.amounts.taxRate}%):</span>
                      <span>${parsedData.amounts.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total:</span>
                      <span>${parsedData.amounts.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Dates */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Dates</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Issue Date</Label>
                      <Input 
                        value={new Date(parsedData.dates.issueDate).toLocaleDateString()} 
                        readOnly 
                      />
                    </div>
                    <div>
                      <Label>Due Date</Label>
                      <Input 
                        value={new Date(parsedData.dates.dueDate).toLocaleDateString()} 
                        readOnly 
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* AI Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bot className="w-5 h-5" />
                    AI Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Intent</Label>
                      <Input value={parsedData.rawAnalysis.intent} readOnly />
                    </div>
                    <div>
                      <Label>Extracted Entities</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {parsedData.metadata.extractedEntities.map((entity, index) => (
                          <Badge key={index} variant="outline">
                            {entity}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Suggested Terms</Label>
                      <Input value={parsedData.metadata.suggestedTerms} readOnly />
                    </div>
                    <div>
                      <Label>Suggested Notes</Label>
                      <Textarea value={parsedData.metadata.suggestedNotes} readOnly />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowPreview(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateInvoice}
                  disabled={createInvoiceMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {createInvoiceMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {createInvoiceMutation.isPending ? 'Creating...' : 'Create Invoice'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
