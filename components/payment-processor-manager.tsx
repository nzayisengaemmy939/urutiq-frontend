"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  Settings,
  Plus,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  BarChart3,
  Zap
} from "lucide-react"
import { bankingApiV2 as bankingApi } from '@/lib/api/banking-v2'

interface PaymentProcessorStats {
  totalPayments: number
  successfulPayments: number
  failedPayments: number
  totalAmount: number
  averageAmount: number
  processorBreakdown: Record<string, { count: number; amount: number }>
}

interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  description?: string
  processor: string
  createdAt: string
}

interface Customer {
  id: string
  email: string
  name?: string
  phone?: string
  processor: string
  createdAt: string
}

interface PaymentMethod {
  id: string
  type: 'card' | 'bank_account' | 'paypal'
  last4?: string
  brand?: string
  expMonth?: number
  expYear?: number
  bankName?: string
  isDefault: boolean
  processor: string
}

export function PaymentProcessorManager() {
  const [stats, setStats] = useState<PaymentProcessorStats | null>(null)
  const [paymentIntents, setPaymentIntents] = useState<PaymentIntent[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  // Form states
  const [isInitializingProcessor, setIsInitializingProcessor] = useState(false)
  const [processorType, setProcessorType] = useState<'stripe' | 'paypal' | 'square'>('stripe')
  const [processorConfig, setProcessorConfig] = useState({
    apiKey: '',
    secretKey: '',
    clientId: '',
    clientSecret: '',
    applicationId: '',
    accessToken: '',
    environment: 'sandbox' as 'sandbox' | 'production'
  })

  const [isCreatingPayment, setIsCreatingPayment] = useState(false)
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    currency: 'USD',
    description: '',
    customerId: ''
  })

  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const [customerForm, setCustomerForm] = useState({
    email: '',
    name: '',
    phone: '',
    address: {
      line1: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US'
    }
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load stats
      const statsResponse = await bankingApi.get('/payment-processors/stats')
      setStats(statsResponse)

      // Load recent payment intents (mock data for demo)
      setPaymentIntents([
        {
          id: 'pi_1',
          amount: 150.00,
          currency: 'USD',
          status: 'succeeded',
          description: 'Invoice #INV-001',
          processor: 'stripe',
          createdAt: new Date().toISOString()
        },
        {
          id: 'pi_2',
          amount: 75.50,
          currency: 'USD',
          status: 'pending',
          description: 'Subscription Payment',
          processor: 'paypal',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        }
      ])

      // Load customers (mock data for demo)
      setCustomers([
        {
          id: 'cus_1',
          email: 'customer@example.com',
          name: 'John Doe',
          phone: '+1-555-0123',
          processor: 'stripe',
          createdAt: new Date().toISOString()
        }
      ])

      // Load payment methods (mock data for demo)
      setPaymentMethods([
        {
          id: 'pm_1',
          type: 'card',
          last4: '4242',
          brand: 'visa',
          expMonth: 12,
          expYear: 2025,
          isDefault: true,
          processor: 'stripe'
        }
      ])
    } catch (error) {
      console.error('Error loading payment processor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const initializeProcessor = async () => {
    setIsInitializingProcessor(true)
    try {
      const config = {
        ...processorConfig,
        environment: processorConfig.environment
      }

      await bankingApi.post('/payment-processors/initialize', {
        processorType,
        config
      })

      // Reset form
      setProcessorConfig({
        apiKey: '',
        secretKey: '',
        clientId: '',
        clientSecret: '',
        applicationId: '',
        accessToken: '',
        environment: 'sandbox'
      })

      alert('Payment processor initialized successfully!')
    } catch (error) {
      console.error('Error initializing processor:', error)
      alert('Failed to initialize payment processor')
    } finally {
      setIsInitializingProcessor(false)
    }
  }

  const createPaymentIntent = async () => {
    setIsCreatingPayment(true)
    try {
      const response = await bankingApi.post('/payment-intents', {
        amount: Number(paymentForm.amount),
        currency: paymentForm.currency,
        description: paymentForm.description,
        customerId: paymentForm.customerId || undefined
      })

      alert('Payment intent created successfully!')
      setPaymentForm({ amount: '', currency: 'USD', description: '', customerId: '' })
      loadData()
    } catch (error) {
      console.error('Error creating payment intent:', error)
      alert('Failed to create payment intent')
    } finally {
      setIsCreatingPayment(false)
    }
  }

  const createCustomer = async () => {
    setIsCreatingCustomer(true)
    try {
      const response = await bankingApi.post('/customers', {
        email: customerForm.email,
        name: customerForm.name,
        phone: customerForm.phone,
        address: customerForm.address
      })

      alert('Customer created successfully!')
      setCustomerForm({
        email: '',
        name: '',
        phone: '',
        address: { line1: '', city: '', state: '', postalCode: '', country: 'US' }
      })
      loadData()
    } catch (error) {
      console.error('Error creating customer:', error)
      alert('Failed to create customer')
    } finally {
      setIsCreatingCustomer(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'succeeded': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'failed': return 'text-red-600 bg-red-100'
      case 'canceled': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getProcessorIcon = (processor: string) => {
    switch (processor) {
      case 'stripe': return <CreditCard className="w-4 h-4 text-purple-600" />
      case 'paypal': return <DollarSign className="w-4 h-4 text-blue-600" />
      case 'square': return <Zap className="w-4 h-4 text-green-600" />
      default: return <CreditCard className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Processors</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Initialize Processor
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Initialize Payment Processor</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Processor Type</Label>
                <Select value={processorType} onValueChange={(value: any) => setProcessorType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="stripe">Stripe</SelectItem>
                    <SelectItem value="paypal">PayPal</SelectItem>
                    <SelectItem value="square">Square</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Environment</Label>
                <Select value={processorConfig.environment} onValueChange={(value: any) => 
                  setProcessorConfig(prev => ({ ...prev, environment: value }))
                }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sandbox">Sandbox</SelectItem>
                    <SelectItem value="production">Production</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {processorType === 'stripe' && (
                <>
                  <div className="space-y-2">
                    <Label>Publishable Key</Label>
                    <Input
                      value={processorConfig.apiKey}
                      onChange={(e) => setProcessorConfig(prev => ({ ...prev, apiKey: e.target.value }))}
                      placeholder="pk_test_..."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Secret Key</Label>
                    <Input
                      type="password"
                      value={processorConfig.secretKey}
                      onChange={(e) => setProcessorConfig(prev => ({ ...prev, secretKey: e.target.value }))}
                      placeholder="sk_test_..."
                    />
                  </div>
                </>
              )}

              {processorType === 'paypal' && (
                <>
                  <div className="space-y-2">
                    <Label>Client ID</Label>
                    <Input
                      value={processorConfig.clientId}
                      onChange={(e) => setProcessorConfig(prev => ({ ...prev, clientId: e.target.value }))}
                      placeholder="Client ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Client Secret</Label>
                    <Input
                      type="password"
                      value={processorConfig.clientSecret}
                      onChange={(e) => setProcessorConfig(prev => ({ ...prev, clientSecret: e.target.value }))}
                      placeholder="Client Secret"
                    />
                  </div>
                </>
              )}

              {processorType === 'square' && (
                <>
                  <div className="space-y-2">
                    <Label>Application ID</Label>
                    <Input
                      value={processorConfig.applicationId}
                      onChange={(e) => setProcessorConfig(prev => ({ ...prev, applicationId: e.target.value }))}
                      placeholder="Application ID"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Access Token</Label>
                    <Input
                      type="password"
                      value={processorConfig.accessToken}
                      onChange={(e) => setProcessorConfig(prev => ({ ...prev, accessToken: e.target.value }))}
                      placeholder="Access Token"
                    />
                  </div>
                </>
              )}

              <Button 
                onClick={initializeProcessor} 
                disabled={isInitializingProcessor}
                className="w-full"
              >
                {isInitializingProcessor ? 'Initializing...' : 'Initialize Processor'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Total Payments</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.totalPayments}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                ${stats.totalAmount.toFixed(2)} total volume
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Success Rate</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalPayments > 0 ? Math.round((stats.successfulPayments / stats.totalPayments) * 100) : 0}%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.successfulPayments} successful
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Average Amount</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                ${stats.averageAmount.toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Per transaction
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Processors</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {Object.keys(stats.processorBreakdown).length}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Active integrations
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payments">Payments</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="methods">Payment Methods</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Processor Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {stats && Object.entries(stats.processorBreakdown).map(([processor, data]) => (
                <div key={processor} className="flex items-center justify-between p-4 border rounded-lg mb-2">
                  <div className="flex items-center gap-3">
                    {getProcessorIcon(processor)}
                    <div>
                      <div className="font-medium capitalize">{processor}</div>
                      <div className="text-sm text-muted-foreground">
                        {data.count} transactions
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${data.amount.toFixed(2)}</div>
                    <div className="text-sm text-muted-foreground">
                      {Math.round((data.count / stats.totalPayments) * 100)}% of total
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Payments</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Payment
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Payment Intent</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Amount</Label>
                    <Input
                      type="number"
                      value={paymentForm.amount}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, amount: e.target.value }))}
                      placeholder="0.00"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Currency</Label>
                    <Select value={paymentForm.currency} onValueChange={(value) => 
                      setPaymentForm(prev => ({ ...prev, currency: value }))
                    }>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USD">USD</SelectItem>
                        <SelectItem value="EUR">EUR</SelectItem>
                        <SelectItem value="GBP">GBP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Input
                      value={paymentForm.description}
                      onChange={(e) => setPaymentForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Payment description"
                    />
                  </div>
                  <Button 
                    onClick={createPaymentIntent} 
                    disabled={isCreatingPayment || !paymentForm.amount}
                    className="w-full"
                  >
                    {isCreatingPayment ? 'Creating...' : 'Create Payment Intent'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="space-y-3">
                {paymentIntents.map((payment) => (
                  <div key={payment.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      {getProcessorIcon(payment.processor)}
                      <div>
                        <div className="font-medium">${payment.amount.toFixed(2)} {payment.currency}</div>
                        <div className="text-sm text-muted-foreground">
                          {payment.description || 'Payment'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(payment.status)}>
                        {payment.status}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Customers</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Customer</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="customer@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Customer Name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+1-555-0123"
                    />
                  </div>
                  <Button 
                    onClick={createCustomer} 
                    disabled={isCreatingCustomer || !customerForm.email}
                    className="w-full"
                  >
                    {isCreatingCustomer ? 'Creating...' : 'Create Customer'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="space-y-3">
                {customers.map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-medium">{customer.name || 'Unnamed Customer'}</div>
                        <div className="text-sm text-muted-foreground">{customer.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="secondary" className="capitalize">
                        {customer.processor}
                      </Badge>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(customer.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <h3 className="text-lg font-semibold">Payment Methods</h3>
          <Card>
            <CardContent className="p-0">
              <div className="space-y-3">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                      <div>
                        <div className="font-medium capitalize">
                          {method.type} {method.last4 && `****${method.last4}`}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {method.brand && method.brand.toUpperCase()}
                          {method.expMonth && method.expYear && ` • ${method.expMonth}/${method.expYear}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {method.isDefault && (
                        <Badge variant="default">Default</Badge>
                      )}
                      <div className="text-xs text-muted-foreground mt-1 capitalize">
                        {method.processor}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
