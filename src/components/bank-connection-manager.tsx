import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Badge } from "../components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { 
  Building2, 
  Plus, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  Search,
  Link,
  Unlink,
  BarChart3,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react"
import { bankingApiV2 as bankingApi } from '@/lib/api/banking-v2'
import { toast } from 'sonner'

interface Institution {
  id: string
  name: string
  logo?: string
  primaryColor?: string
  url?: string
  country: string
  supportsAch: boolean
  supportsWire: boolean
  supportsOauth: boolean
  products: string[]
}

interface BankConnection {
  id: string
  provider: 'plaid' | 'yodlee' | 'manual'
  bankName: string
  accountName: string
  accountType: string
  accountNumber: string
  status: 'active' | 'inactive' | 'error' | 'pending'
  lastSyncAt?: string
  errorMessage?: string
  createdAt: string
}

interface ConnectionStats {
  totalConnections: number
  activeConnections: number
  inactiveConnections: number
  errorConnections: number
  totalAccounts: number
  totalTransactions: number
  lastSyncAt?: string
}

interface BankConnectionManagerProps {
  companyId?: string
}

export function BankConnectionManager({ companyId }: BankConnectionManagerProps) {
  const [institutions, setInstitutions] = useState<Institution[]>([])
  const [connections, setConnections] = useState<BankConnection[]>([])
  const [stats, setStats] = useState<ConnectionStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedProvider, setSelectedProvider] = useState<'plaid' | 'yodlee'>('plaid')
  const [selectedInstitution, setSelectedInstitution] = useState<string>('')
  const [isCreatingConnection, setIsCreatingConnection] = useState(false)
  const [isConnectionDialogOpen, setIsConnectionDialogOpen] = useState(false)

  // Connection form state
  const [connectionForm, setConnectionForm] = useState({
    accountName: '',
    accountType: 'checking',
    accountNumber: '',
    routingNumber: '',
    username: '',
    password: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const resetConnectionForm = () => {
    setConnectionForm({
      accountName: '',
      accountType: 'checking',
      accountNumber: '',
      routingNumber: '',
      username: '',
      password: ''
    })
    setSelectedInstitution('')
    setSearchTerm('')
  }

  const handleDialogClose = (open: boolean) => {
    setIsConnectionDialogOpen(open)
    if (!open) {
      resetConnectionForm()
    }
  }

  const loadData = async () => {
    setLoading(true)
    try {
      // Load institutions
      const institutionsResponse = await bankingApi.get('/api/institutions')
      setInstitutions(institutionsResponse.institutions || [])

      // Load connections
      const connectionsUrl = companyId ? `/api/connections?companyId=${companyId}` : '/api/connections'
      const connectionsResponse = await bankingApi.get(connectionsUrl)
      setConnections(connectionsResponse.connections || [])

      // Load stats
      const statsUrl = companyId ? `/api/connections/stats?companyId=${companyId}` : '/api/connections/stats'
      const statsResponse = await bankingApi.get(statsUrl)
      setStats(statsResponse)
    } catch (error) {
      console.error('Error loading bank connection data:', error)
    } finally {
      setLoading(false)
    }
  }

  const createConnection = async () => {
    if (!selectedInstitution) {
      toast.error('Please select a bank', {
        description: 'You need to choose a financial institution before creating a connection.'
      })
      return
    }

    setIsCreatingConnection(true)
    try {
      const response = await bankingApi.post('/api/connections', {
        provider: selectedProvider,
        institutionId: selectedInstitution,
        companyId: companyId || 'cmg0qxjh9003nao3ftbaz1oc1', // Use prop or fallback
        credentials: {
          accountName: connectionForm.accountName,
          accountType: connectionForm.accountType,
          accountNumber: connectionForm.accountNumber,
          routingNumber: connectionForm.routingNumber,
          username: connectionForm.username,
          password: connectionForm.password
        }
      })

      toast.success('Bank connection created successfully!', {
        description: 'Your bank account connection has been established and is being synced.'
      })
      
      resetConnectionForm()
      setIsConnectionDialogOpen(false) // Close the dialog
      loadData()
    } catch (error) {
      console.error('Error creating connection:', error)
      toast.error('Failed to create bank connection', {
        description: 'There was an error establishing the connection. Please try again.'
      })
    } finally {
      setIsCreatingConnection(false)
    }
  }

  const syncConnection = async (connectionId: string) => {
    try {
      await bankingApi.post(`/api/connections/${connectionId}/sync`)
      toast.success('Connection synced successfully!', {
        description: 'Your bank account data has been updated with the latest information.'
      })
      loadData()
    } catch (error) {
      console.error('Error syncing connection:', error)
      toast.error('Failed to sync connection', {
        description: 'There was an error syncing your bank account. Please try again.'
      })
    }
  }

  const disconnectConnection = async (connectionId: string) => {
    if (!confirm('Are you sure you want to disconnect this bank connection?')) {
      return
    }

    try {
      await bankingApi.post(`/api/connections/${connectionId}/disconnect`)
      toast.success('Connection disconnected successfully!', {
        description: 'Your bank account connection has been removed.'
      })
      loadData()
    } catch (error) {
      console.error('Error disconnecting connection:', error)
      toast.error('Failed to disconnect connection', {
        description: 'There was an error disconnecting your bank account. Please try again.'
      })
    }
  }

  const reconnectConnection = async (connectionId: string) => {
    try {
      await bankingApi.post(`/api/connections/${connectionId}/reconnect`)
      toast.success('Connection reconnected successfully!', {
        description: 'Your bank account connection has been restored.'
      })
      loadData()
    } catch (error) {
      console.error('Error reconnecting connection:', error)
      toast.error('Failed to reconnect connection', {
        description: 'There was an error reconnecting your bank account. Please try again.'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100'
      case 'pending': return 'text-yellow-600 bg-yellow-100'
      case 'error': return 'text-red-600 bg-red-100'
      case 'inactive': return 'text-gray-600 bg-gray-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'pending': return <Clock className="w-4 h-4 text-yellow-600" />
      case 'error': return <AlertCircle className="w-4 h-4 text-red-600" />
      case 'inactive': return <Unlink className="w-4 h-4 text-gray-600" />
      default: return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const filteredInstitutions = institutions.filter(inst => 
    inst.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
        <h2 className="text-2xl font-bold">Bank Connections</h2>
        <Button onClick={() => setIsConnectionDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Connect Bank
        </Button>
      </div>

      {/* Connection Dialog */}
      <Dialog open={isConnectionDialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Connect Your Bank Account</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
              {/* Provider Selection */}
              <div className="space-y-2">
                <Label>Connection Provider</Label>
                <Select value={selectedProvider} onValueChange={(value: any) => setSelectedProvider(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="plaid">Plaid (Recommended)</SelectItem>
                    <SelectItem value="yodlee">Yodlee</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Bank Selection */}
              <div className="space-y-2">
                <Label>Select Your Bank</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search for your bank..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <div className="max-h-60 overflow-y-auto border rounded-lg">
                  {filteredInstitutions.length > 0 ? (
                    filteredInstitutions.map((institution) => (
                      <div
                        key={institution.id}
                        className={`p-3 cursor-pointer hover:bg-gray-50 border-b last:border-b-0 ${
                          selectedInstitution === institution.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                        onClick={() => setSelectedInstitution(institution.id)}
                      >
                        <div className="flex items-center gap-3">
                          {institution.logo && (
                            <img src={institution.logo} alt={institution.name} className="w-8 h-8" />
                          )}
                          <div>
                            <div className="font-medium">{institution.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {institution.country} • {institution.products.join(', ')}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center">
                      <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Banks Available</h3>
                      <p className="text-gray-500 mb-4">
                        Bank integration requires actual Plaid or Yodlee API keys to be configured.
                      </p>
                      <p className="text-sm text-gray-400">
                        Contact your administrator to set up bank connections.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Connection Form */}
              {selectedInstitution && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Account Name</Label>
                      <Input
                        value={connectionForm.accountName}
                        onChange={(e) => setConnectionForm(prev => ({ ...prev, accountName: e.target.value }))}
                        placeholder="Business Checking"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Account Type</Label>
                      <Select value={connectionForm.accountType} onValueChange={(value) => 
                        setConnectionForm(prev => ({ ...prev, accountType: value }))
                      }>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="checking">Checking</SelectItem>
                          <SelectItem value="savings">Savings</SelectItem>
                          <SelectItem value="business_checking">Business Checking</SelectItem>
                          <SelectItem value="business_savings">Business Savings</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Account Number</Label>
                      <Input
                        value={connectionForm.accountNumber}
                        onChange={(e) => setConnectionForm(prev => ({ ...prev, accountNumber: e.target.value }))}
                        placeholder="1234567890"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Routing Number</Label>
                      <Input
                        value={connectionForm.routingNumber}
                        onChange={(e) => setConnectionForm(prev => ({ ...prev, routingNumber: e.target.value }))}
                        placeholder="021000021"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Username</Label>
                      <Input
                        value={connectionForm.username}
                        onChange={(e) => setConnectionForm(prev => ({ ...prev, username: e.target.value }))}
                        placeholder="Your bank username"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input
                        type="password"
                        value={connectionForm.password}
                        onChange={(e) => setConnectionForm(prev => ({ ...prev, password: e.target.value }))}
                        placeholder="Your bank password"
                      />
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={createConnection} 
                disabled={isCreatingConnection || !selectedInstitution}
                className="w-full"
              >
                {isCreatingConnection ? 'Connecting...' : 'Connect Bank Account'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium">Total Connections</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {stats.totalConnections}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.activeConnections} active
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium">Active Connections</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeConnections}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stats.errorConnections} errors
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium">Total Accounts</span>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {stats.totalAccounts}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Connected accounts
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-orange-600" />
                <span className="text-sm font-medium">Transactions</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {stats.totalTransactions}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Synced transactions
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Connections List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link className="w-5 h-5 text-blue-600" />
            Bank Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {connections.length === 0 ? (
              <div className="text-center py-8">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Bank Connections</h3>
                <p className="text-gray-500 mb-4">Connect your bank accounts to start syncing transactions automatically.</p>
                <Button onClick={() => setIsConnectionDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Connect Your First Bank
                </Button>
              </div>
            ) : (
              connections.map((connection) => (
                <div key={connection.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{connection.bankName}</div>
                      <div className="text-sm text-muted-foreground">
                        {connection.accountName} • {connection.accountType} • ****{connection.accountNumber.slice(-4)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(connection.status)}
                        <Badge className={getStatusColor(connection.status)}>
                          {connection.status}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {connection.lastSyncAt ? 
                          `Last sync: ${new Date(connection.lastSyncAt).toLocaleDateString()}` :
                          'Never synced'
                        }
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {connection.status === 'active' && (
                        <Button size="sm" variant="outline" onClick={() => syncConnection(connection.id)}>
                          <RefreshCw className="w-4 h-4" />
                        </Button>
                      )}
                      {connection.status === 'error' && (
                        <Button size="sm" variant="outline" onClick={() => reconnectConnection(connection.id)}>
                          <Link className="w-4 h-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="outline" onClick={() => disconnectConnection(connection.id)}>
                        <Unlink className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Available Banks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-green-600" />
            Supported Banks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {institutions.length > 0 ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {institutions.slice(0, 8).map((institution) => (
                  <div key={institution.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    {institution.logo && (
                      <img src={institution.logo} alt={institution.name} className="w-8 h-8" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{institution.name}</div>
                      <div className="text-xs text-muted-foreground">{institution.country}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <p className="text-sm text-muted-foreground">
                  And 10,000+ more banks worldwide through Plaid and Yodlee
                </p>
              </div>
            </>
          ) : (
            <div className="text-center py-8">
              <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Bank Integration Not Configured</h3>
              <p className="text-gray-500 mb-4">
                To connect bank accounts, your administrator needs to configure Plaid or Yodlee API keys.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                <h4 className="font-medium text-blue-900 mb-2">Required Setup:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Obtain Plaid or Yodlee API credentials</li>
                  <li>• Configure environment variables (PLAID_CLIENT_ID, PLAID_SECRET, etc.)</li>
                  <li>• Set up webhook endpoints for real-time updates</li>
                  <li>• Test connections in sandbox environment</li>
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
