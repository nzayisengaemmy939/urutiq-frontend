import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { 
  CreditCard, 
  DollarSign, 
  Users, 
  Settings,
  Plus,
  CheckCircle,
  TrendingUp,
  BarChart3,
  Zap
} from "lucide-react"
import bankingApi from '@/lib/api/banking'

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

interface PaymentProcessorManagerProps {
  companyId?: string
}

export function PaymentProcessorManager({ companyId }: PaymentProcessorManagerProps) {
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
    publishableKey: '',
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
    name: '',
    email: '',
    phone: '',
    taxNumber: '',
    address: '',
    currency: 'USD'
  })
  
  // Payment Method Form State
  const [isAddingPaymentMethod, setIsAddingPaymentMethod] = useState(false)
  const [paymentMethodForm, setPaymentMethodForm] = useState({
    customerId: '',
    type: 'card' as 'card' | 'bank_account',
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    bankAccountNumber: '',
    routingNumber: '',
    accountType: 'checking' as 'checking' | 'savings',
    isDefault: false
  })

  // Dialog states for quick actions
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false)
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false)
  const [isPaymentMethodDialogOpen, setIsPaymentMethodDialogOpen] = useState(false)
  const [isProcessorDialogOpen, setIsProcessorDialogOpen] = useState(false)

  // Helper functions for form management
  const resetPaymentForm = () => {
    setPaymentForm({
      amount: '',
      currency: 'USD',
      description: '',
      customerId: ''
    })
  }

  const resetCustomerForm = () => {
    setCustomerForm({
      name: '',
      email: '',
      phone: '',
      taxNumber: '',
      address: '',
      currency: 'USD'
    })
  }

  const resetPaymentMethodForm = () => {
    setPaymentMethodForm({
      customerId: '',
      type: 'card' as 'card' | 'bank_account',
      cardNumber: '',
      expiryMonth: '',
      expiryYear: '',
      cvc: '',
      bankAccountNumber: '',
      routingNumber: '',
      accountType: 'checking' as 'checking' | 'savings',
      isDefault: false
    })
  }

  const resetProcessorConfig = () => {
    setProcessorConfig({
      publishableKey: '',
      secretKey: '',
      clientId: '',
      clientSecret: '',
      applicationId: '',
      accessToken: '',
      environment: 'sandbox' as 'sandbox' | 'production'
    })
  }

  useEffect(() => {
    // Debug: Log the companyId being used
    console.log('PaymentProcessorManager companyId:', companyId)
    console.log('localStorage company_id:', localStorage.getItem('company_id'))
    console.log('localStorage companyId:', localStorage.getItem('companyId'))
    console.log('localStorage company:', localStorage.getItem('company'))
    
    if (!companyId) {
      console.warn("Company Not Selected - Please select a company to use the payment processor.")
      return
    }
    
    loadData()
  }, [companyId])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load stats
      const statsResponse = await bankingApi.getProcessorStats()
      setStats(statsResponse)

      // Load recent payment intents
      const intentsResponse = await bankingApi.getPaymentIntents({ limit: 10 })
      setPaymentIntents(intentsResponse.paymentIntents || [])

      // Load customers
      const customersResponse = await bankingApi.getPaymentCustomers({ limit: 10, companyId })
      setCustomers(customersResponse.customers || [])

      // Load payment methods
      console.log('Loading payment methods with companyId:', companyId)
      const methodsResponse = await bankingApi.getPaymentMethods({ limit: 10, companyId })
      console.log('Payment methods response:', methodsResponse)
      setPaymentMethods(methodsResponse.paymentMethods || [])
    } catch (err: any) {
      console.error('Error loading payment processor data:', err)
      // Set empty arrays on error instead of mock data
      setPaymentIntents([])
      setCustomers([])
      setPaymentMethods([])
      
      // Log warning for data loading issues
      console.warn("Data Loading Issue - Some payment processor data could not be loaded. Please check your connection and try refreshing.")
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

      await bankingApi.post('/api/payment-processors/initialize', {
        processorType,
        config
      })

      // Reset form
      setProcessorConfig({
        publishableKey: '',
        secretKey: '',
        clientId: '',
        clientSecret: '',
        applicationId: '',
        accessToken: '',
        environment: 'sandbox'
      })

      console.log(`${processorType.charAt(0).toUpperCase() + processorType.slice(1)} processor has been successfully configured and is ready to process payments.`)
      resetProcessorConfig()
      setIsProcessorDialogOpen(false)
      loadData()
    } catch (err: any) {
      console.error('Error initializing processor:', err)
      const errorMessage = err.message || 'Failed to initialize payment processor'
      console.error(`Initialization Failed - ${errorMessage}`)
    } finally {
      setIsInitializingProcessor(false)
    }
  }

  const createPaymentIntent = async () => {
    setIsCreatingPayment(true)
    try {
      await bankingApi.post('/api/payment-intents', {
        amount: Number(paymentForm.amount),
        currency: paymentForm.currency,
        description: paymentForm.description,
        customerId: paymentForm.customerId || undefined
      })

      console.log(`Payment intent for $${paymentForm.amount} ${paymentForm.currency} has been created successfully.`)
      resetPaymentForm()
      setIsPaymentDialogOpen(false)
      loadData()
    } catch (err: any) {
      console.error('Error creating payment intent:', err)
      const errorMessage = err.message || 'Failed to create payment intent'
      
      if (errorMessage.includes('No active payment processor configured')) {
        console.error("Payment Processor Not Configured - Please initialize a payment processor (Stripe, PayPal, or Square) before creating payment intents.")
      } else {
        console.error(`Payment Creation Failed - ${errorMessage}`)
      }
    } finally {
      setIsCreatingPayment(false)
    }
  }

  const addPaymentMethod = async () => {
    setIsAddingPaymentMethod(true)
    try {
      const paymentMethodData: any = {
        customerId: paymentMethodForm.customerId,
        type: paymentMethodForm.type,
        isDefault: paymentMethodForm.isDefault,
        companyId: companyId
      }

      if (paymentMethodForm.type === 'card') {
        paymentMethodData.card = {
          number: paymentMethodForm.cardNumber,
          expMonth: parseInt(paymentMethodForm.expiryMonth),
          expYear: parseInt(paymentMethodForm.expiryYear),
          cvc: paymentMethodForm.cvc
        }
      } else if (paymentMethodForm.type === 'bank_account') {
        paymentMethodData.bankAccount = {
          accountNumber: paymentMethodForm.bankAccountNumber,
          routingNumber: paymentMethodForm.routingNumber,
          accountType: paymentMethodForm.accountType
        }
      }

      console.log('Adding payment method with data:', paymentMethodData)
      
      const result = await bankingApi.addPaymentMethod(paymentMethodData)
      console.log('Payment method creation result:', result)
      
      console.log(`Payment method added successfully for customer`)
      
      resetPaymentMethodForm()
      setIsPaymentMethodDialogOpen(false)
      loadData()
    } catch (err: any) {
      console.error('Error adding payment method:', err)
      
      let errorMessage = 'Failed to add payment method'
      
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      console.error(`Payment Method Creation Failed - ${errorMessage}`)
    } finally {
      setIsAddingPaymentMethod(false)
    }
  }

  const createCustomer = async () => {
    setIsCreatingCustomer(true)
    console.log('Creating customer with data:', {
      companyId,
      name: customerForm.name,
      email: customerForm.email,
      phone: customerForm.phone,
      taxNumber: customerForm.taxNumber,
      address: customerForm.address,
      currency: customerForm.currency
    })
    
    try {
      console.log('=== CUSTOMER CREATION DEBUG ===')
      console.log('bankingApi object:', bankingApi)
      console.log('bankingApi.createCustomer:', bankingApi.createCustomer)
      console.log('companyId being used:', companyId)
      console.log('customerForm data:', customerForm)
      
      const requestData = {
        companyId,
        name: customerForm.name,
        email: customerForm.email,
        phone: customerForm.phone,
        taxNumber: customerForm.taxNumber,
        address: customerForm.address,
        currency: customerForm.currency
      }
      
      console.log('Request data being sent:', requestData)
      console.log('Request data JSON:', JSON.stringify(requestData, null, 2))
      
      const result = await bankingApi.createCustomer(requestData)

      console.log('Customer creation result:', result)
      
      console.log(`Customer ${customerForm.name || customerForm.email} has been created and is now available for both payments and invoicing.`)
      
      resetCustomerForm()
      setIsCustomerDialogOpen(false)
      loadData()
    } catch (err: any) {
      console.error('Error creating customer:', err)
      
      let errorMessage = 'Failed to create customer'
      
      // Handle API error responses
      if (err.response?.data?.message) {
        errorMessage = err.response.data.message
      } else if (err.message) {
        errorMessage = err.message
      }
      
      console.log('Showing error toast:', errorMessage)
      console.error(`Customer Creation Failed - ${errorMessage}`)
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

  // Calculate overview metrics

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Payment Processors</h2>
        <Dialog open={isProcessorDialogOpen} onOpenChange={setIsProcessorDialogOpen}>
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
                      value={processorConfig.publishableKey}
                      onChange={(e) => setProcessorConfig(prev => ({ ...prev, publishableKey: e.target.value }))}
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

      {/* Payment Processor Overview Dashboard */}
    

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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentIntents.length > 0 ? (
                  <div className="space-y-3">
                    {paymentIntents.slice(0, 5).map((intent) => (
                      <div key={intent.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getProcessorIcon(intent.processor)}
                          <div>
                            <div className="font-medium text-sm">{intent.description || 'Payment'}</div>
                            <div className="text-xs text-gray-500">
                              {new Date(intent.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${intent.amount.toFixed(2)}</div>
                          <Badge className={getStatusColor(intent.status)}>
                            {intent.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No recent payments</p>
                    <p className="text-sm">Create your first payment to see activity here</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setIsPaymentDialogOpen(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Create Payment Intent
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setIsCustomerDialogOpen(true)}
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Add Customer
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setIsPaymentMethodDialogOpen(true)}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                  <Button 
                    className="w-full justify-start" 
                    variant="outline"
                    onClick={() => setIsProcessorDialogOpen(true)}
                  >
                    <Settings className="w-4 h-4 mr-2" />
                    Configure Processor
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Processor Status */}
          <Card>
            <CardHeader>
              <CardTitle>Processor Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium">Stripe</div>
                      <div className="text-sm text-gray-500">Credit Cards</div>
                    </div>
                  </div>
                  <Badge variant="outline">Available</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">PayPal</div>
                      <div className="text-sm text-gray-500">Digital Wallet</div>
                    </div>
                  </div>
                  <Badge variant="outline">Available</Badge>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Zap className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <div className="font-medium">Square</div>
                      <div className="text-sm text-gray-500">Point of Sale</div>
                    </div>
                  </div>
                  <Badge variant="outline">Available</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Payments</h3>
            <Button 
              size="sm"
              onClick={() => setIsPaymentDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Payment
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {paymentIntents.length > 0 ? (
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payments yet</p>
                  <p className="text-sm">Create your first payment to see it here</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Customers</h3>
              <p className="text-sm text-gray-500">These are your real customers from the invoice system</p>
            </div>
            <Button 
              size="sm"
              onClick={() => setIsCustomerDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Customer
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {customers.length > 0 ? (
                <div className="space-y-3">
                  {customers.map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-4 border-b last:border-b-0">
                      <div className="flex items-center gap-3">
                        <Users className="w-5 h-5 text-blue-600" />
                        <div>
                          <div className="font-medium">{customer.name || 'Unnamed Customer'}</div>
                          <div className="text-sm text-muted-foreground">{customer.email}</div>
                          {customer.phone && (
                            <div className="text-xs text-gray-500">{customer.phone}</div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant="secondary" className="capitalize">
                          {customer.processor}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </div>
                        <div className="text-xs text-blue-600 mt-1">
                          Real Customer
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No customers found</p>
                  <p className="text-sm">Add customers here or create them in the Sales/Invoices section</p>
                  <p className="text-xs mt-2">Customers created here will be available for invoicing and payments</p>
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs text-blue-700">
                      💡 <strong>Tip:</strong> You can create customers even without setting up a payment processor first. 
                      They'll be available for invoicing immediately.
                    </p>
                    {companyId === 'cmg0lf1m1001289wp87nq08d8' && (
                      <p className="text-xs text-red-700 mt-2">
                        ⚠️ <strong>Note:</strong> Your company ID points to "personal" company. 
                        Using correct company ID for "mmcmc" instead.
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Payment Methods</h3>
            <Button 
              size="sm"
              onClick={() => setIsPaymentMethodDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Payment Method
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {paymentMethods.length > 0 ? (
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
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payment methods</p>
                  <p className="text-sm">Add a payment method to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
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

      {/* Customer Dialog */}
      <Dialog open={isCustomerDialogOpen} onOpenChange={setIsCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Customer</DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Customers created here will be available for both payments and invoicing.
            </p>
            <div className="text-xs text-blue-600 mt-1 flex items-center gap-2">
              <span>Company: {companyId}</span>
              {companyId === 'cmg0lf1m1001289wp87nq08d8' && (
                <span className="text-red-600 font-medium">
                  (Points to "personal" company)
                </span>
              )}
            </div>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input
                value={customerForm.name}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Customer Name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={customerForm.email}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="customer@example.com"
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
            <div className="space-y-2">
              <Label>Tax Number</Label>
              <Input
                value={customerForm.taxNumber}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, taxNumber: e.target.value }))}
                placeholder="Tax ID or VAT Number"
              />
            </div>
            <div className="space-y-2">
              <Label>Address</Label>
              <Input
                value={customerForm.address}
                onChange={(e) => setCustomerForm(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Customer Address"
              />
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Select value={customerForm.currency} onValueChange={(value) => setCustomerForm(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="KES">KES</SelectItem>
                  <SelectItem value="NGN">NGN</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={createCustomer} 
              disabled={isCreatingCustomer || !customerForm.name}
              className="w-full"
            >
              {isCreatingCustomer ? 'Creating...' : 'Create Customer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Method Dialog */}
      <Dialog open={isPaymentMethodDialogOpen} onOpenChange={setIsPaymentMethodDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment Method</DialogTitle>
            <p className="text-sm text-gray-600 mt-2">
              Add a payment method for a customer to enable payments.
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Customer *</Label>
              <Select 
                value={paymentMethodForm.customerId} 
                onValueChange={(value) => setPaymentMethodForm(prev => ({ ...prev, customerId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name || customer.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Payment Method Type *</Label>
              <Select 
                value={paymentMethodForm.type} 
                onValueChange={(value: 'card' | 'bank_account') => setPaymentMethodForm(prev => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="card">Credit/Debit Card</SelectItem>
                  <SelectItem value="bank_account">Bank Account</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethodForm.type === 'card' && (
              <>
                <div className="space-y-2">
                  <Label>Card Number *</Label>
                  <Input 
                    placeholder="1234 5678 9012 3456" 
                    value={paymentMethodForm.cardNumber}
                    onChange={(e) => setPaymentMethodForm(prev => ({ ...prev, cardNumber: e.target.value }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Month *</Label>
                    <Input 
                      placeholder="12" 
                      value={paymentMethodForm.expiryMonth}
                      onChange={(e) => setPaymentMethodForm(prev => ({ ...prev, expiryMonth: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Expiry Year *</Label>
                    <Input 
                      placeholder="2025" 
                      value={paymentMethodForm.expiryYear}
                      onChange={(e) => setPaymentMethodForm(prev => ({ ...prev, expiryYear: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>CVC *</Label>
                  <Input 
                    placeholder="123" 
                    value={paymentMethodForm.cvc}
                    onChange={(e) => setPaymentMethodForm(prev => ({ ...prev, cvc: e.target.value }))}
                  />
                </div>
              </>
            )}

            {paymentMethodForm.type === 'bank_account' && (
              <>
                <div className="space-y-2">
                  <Label>Account Number *</Label>
                  <Input 
                    placeholder="1234567890" 
                    value={paymentMethodForm.bankAccountNumber}
                    onChange={(e) => setPaymentMethodForm(prev => ({ ...prev, bankAccountNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Routing Number *</Label>
                  <Input 
                    placeholder="123456789" 
                    value={paymentMethodForm.routingNumber}
                    onChange={(e) => setPaymentMethodForm(prev => ({ ...prev, routingNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Type *</Label>
                  <Select 
                    value={paymentMethodForm.accountType} 
                    onValueChange={(value: 'checking' | 'savings') => setPaymentMethodForm(prev => ({ ...prev, accountType: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select account type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="savings">Savings</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={paymentMethodForm.isDefault}
                onChange={(e) => setPaymentMethodForm(prev => ({ ...prev, isDefault: e.target.checked }))}
                className="rounded"
              />
              <Label htmlFor="isDefault">Set as default payment method</Label>
            </div>

            <Button 
              onClick={addPaymentMethod}
              disabled={isAddingPaymentMethod || !paymentMethodForm.customerId}
              className="w-full"
            >
              {isAddingPaymentMethod ? 'Adding...' : 'Add Payment Method'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
