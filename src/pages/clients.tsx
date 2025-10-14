import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Textarea } from "../components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar"
import { Alert, AlertDescription } from "../components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { useState, useEffect } from "react"
import { apiService } from "../lib/api"
import { toast } from "sonner"
import {
  Users,
  MessageSquare,
  FileText,
  Phone,
  Mail,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Share,
  Download,
  Eye,
  Bell,
} from "lucide-react"

interface ClientStats {
  activeClients: number
  unreadMessages: number
  pendingApprovals: number
  portalLogins: number
}

interface Company {
  id: string
  companyId?: string
  name: string
  email?: string
  phone?: string
  businessName?: string
  contactPerson?: string
  industry?: string
  website?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  country?: string
  currency?: string
  paymentTerms?: string
  creditLimit?: number
  taxNumber?: string
  notes?: string
  source?: string
  assignedTo?: string
  hasPortalAccess?: boolean
  isActive?: boolean
  createdAt: string
  updatedAt?: string
  _count?: {
    invoices: number
    bills: number
    customers: number
    vendors: number
  }
}

interface Message {
  id: string
  messageText: string
  isRead: boolean
  createdAt: string
  sender: {
    id: string
    name: string
    email: string
  }
  receiver: {
    id: string
    name: string
    email: string
  }
  company: {
    name: string
  }
}

interface ClientAccess {
  id: string
  companyId: string
  userId: string
  permissions: string
  isActive: boolean
  company: {
    name: string
  }
  user: {
    name: string
    email: string
    role: string
  }
}

export default function ClientsPage() {
  const [stats, setStats] = useState<ClientStats>({
    activeClients: 0,
    unreadMessages: 0,
    pendingApprovals: 0,
    portalLogins: 0
  })
  const [companies, setCompanies] = useState<Company[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [clientAccess, setClientAccess] = useState<ClientAccess[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [clientForm, setClientForm] = useState({
    name: '',
    email: '',
    phone: '',
    businessName: '',
    contactPerson: '',
    industry: '',
    website: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'US',
    currency: 'USD',
    paymentTerms: '',
    creditLimit: '',
    taxId: '',
    notes: '',
    source: ''
  })
  
  // Message composition state
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false)
  const [messageForm, setMessageForm] = useState({
    recipientId: '',
    subject: '',
    messageText: '',
    priority: 'normal' as 'low' | 'normal' | 'high'
  })

  // Document sharing state
  const [isShareDocumentDialogOpen, setIsShareDocumentDialogOpen] = useState(false)
  const [shareDocumentForm, setShareDocumentForm] = useState({
    clientId: '',
    documentId: '',
    message: '',
    expiresAt: ''
  })
  const [documents, setDocuments] = useState<any[]>([])
  const [loadingDocuments, setLoadingDocuments] = useState(false)
  const [sharedDocuments, setSharedDocuments] = useState<any[]>([])
  const [loadingSharedDocuments, setLoadingSharedDocuments] = useState(false)

  // Client details state
  const [viewingClient, setViewingClient] = useState<Company | null>(null)

  useEffect(() => {
    loadClientData()
  }, [])

  const loadClientData = async () => {
    try {
      setLoading(true)
      
      // Load clients from the new clients API
      const clientsResponse = await apiService.get('/api/clients')
      
      // Handle different response structures
      let clientsData = []
      if (Array.isArray(clientsResponse)) {
        // Direct array response
        clientsData = clientsResponse
      } else if (clientsResponse.clients && Array.isArray(clientsResponse.clients)) {
        // Wrapped in clients property (our new API format)
        clientsData = clientsResponse.clients
      } else if (clientsResponse.data && Array.isArray(clientsResponse.data)) {
        // Wrapped in data property
        clientsData = clientsResponse.data
      }
      setCompanies(clientsData)

      // Load messages
      const messagesResponse = await apiService.get('/api/messages')
      setMessages(messagesResponse || [])

      // Calculate statistics from real data
      const totalClients = clientsData.length
      
      // Update stats with real data
      setStats({
        activeClients: totalClients, // All clients are considered active for now
        unreadMessages: 0, // Will be updated later
        pendingApprovals: 0, // Will be updated later  
        portalLogins: 0 // Will be updated later
      })

      // Load client access
      const accessResponse = await apiService.get('/api/client-access')
      setClientAccess(accessResponse || [])

      // Load shared documents
      await loadSharedDocuments()

      // Load unread message count
      const unreadResponse = await apiService.get('/api/messages/unread-count')
      
      // Update stats with additional data (merge with existing stats)
      setStats(prevStats => ({
        ...prevStats,
        unreadMessages: unreadResponse.unreadCount || 0,
        pendingApprovals: 0, // TODO: Implement pending approvals API
        portalLogins: accessResponse?.length || 0 // Use actual portal access count
      }))
      
    } catch (error) {
      console.error('Error loading client data:', error)
      toast.error('Failed to load client data')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`
    if (diffInHours < 48) return '1 day ago'
    return `${Math.floor(diffInHours / 24)} days ago`
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  const resetClientForm = () => {
    setClientForm({
      name: '',
      email: '',
      phone: '',
      businessName: '',
      contactPerson: '',
      industry: '',
      website: '',
      address: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'US',
      currency: 'USD',
      paymentTerms: '',
      creditLimit: '',
      taxId: '',
      notes: '',
      source: ''
    })
  }

  const handleCreateClient = async () => {
    try {
      if (!clientForm.name?.trim()) {
        toast.error('Please enter a client name')
        return
      }

      if (!clientForm.email?.trim()) {
        toast.error('Please enter a client email')
        return
      }

      const clientData = {
        name: clientForm.name.trim(),
        email: clientForm.email.trim(),
        phone: clientForm.phone?.trim() || undefined,
        businessName: clientForm.businessName?.trim() || undefined,
        contactPerson: clientForm.contactPerson?.trim() || undefined,
        industry: clientForm.industry?.trim() || undefined,
        website: clientForm.website?.trim() || undefined,
        address: clientForm.address?.trim() || undefined,
        city: clientForm.city?.trim() || undefined,
        state: clientForm.state?.trim() || undefined,
        postalCode: clientForm.postalCode?.trim() || undefined,
        country: clientForm.country,
        currency: clientForm.currency,
        paymentTerms: clientForm.paymentTerms?.trim() || undefined,
        creditLimit: clientForm.creditLimit || undefined,
        taxNumber: clientForm.taxId?.trim() || undefined,
        notes: clientForm.notes?.trim() || undefined,
        source: clientForm.source?.trim() || undefined
      }

      const response = await apiService.post('/api/clients', clientData)
      
      toast.success('Client created successfully!')
      
      setIsCreateDialogOpen(false)
      resetClientForm()
      
      // Add a small delay before refreshing to ensure DB consistency
      setTimeout(async () => {
        await loadClientData()
      }, 500)
      
    } catch (error: any) {
      console.error('Error creating client:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to create client')
      }
    }
  }

  // Message composition helper functions
  const resetMessageForm = () => {
    setMessageForm({
      recipientId: '',
      subject: '',
      messageText: '',
      priority: 'normal'
    })
  }

  const openComposeDialog = (recipientId?: string) => {
    resetMessageForm()
    if (recipientId) {
      setMessageForm(prev => ({ ...prev, recipientId }))
    }
    setIsComposeDialogOpen(true)
  }

  // Document sharing helper functions
  const openShareDocumentDialog = (clientId?: string) => {
    setShareDocumentForm({
      clientId: clientId || '',
      documentId: '',
      message: '',
      expiresAt: ''
    })
    setIsShareDocumentDialogOpen(true)
    // Load documents when dialog opens
    loadDocuments()
  }

  const loadDocuments = async () => {
    try {
      setLoadingDocuments(true)
      const response = await apiService.get('/api/documents')
      setDocuments(response.documents || response.data || response || [])
    } catch (error) {
      console.error('Error loading documents:', error)
      toast.error('Failed to load documents')
    } finally {
      setLoadingDocuments(false)
    }
  }

  const loadSharedDocuments = async () => {
    try {
      setLoadingSharedDocuments(true)
      const allSharedDocs: any[] = []
      
      // Load shared documents for each client
      for (const client of companies) {
        try {
          const response = await apiService.get(`/api/clients/${client.id}/documents`)
          const clientDocs = response.documents || response.data || response || []
          
          // Add client info to each document
          const docsWithClient = clientDocs.map((doc: any) => ({
            ...doc,
            clientInfo: {
              id: client.id,
              name: client.name,
              email: client.email
            }
          }))
          
          allSharedDocs.push(...docsWithClient)
        } catch (error) {
          console.error(`Error loading documents for client ${client.name}:`, error)
        }
      }
      
      setSharedDocuments(allSharedDocs)
    } catch (error) {
      console.error('Error loading shared documents:', error)
      toast.error('Failed to load shared documents')
    } finally {
      setLoadingSharedDocuments(false)
    }
  }

  const handleShareDocument = async () => {
    try {
      if (!shareDocumentForm.clientId) {
        toast.error('Please select a client')
        return
      }
      if (!shareDocumentForm.documentId) {
        toast.error('Please select a document')
        return
      }

      const shareData = {
        documentId: shareDocumentForm.documentId,
        message: shareDocumentForm.message.trim() || undefined,
        expiresAt: shareDocumentForm.expiresAt || undefined
      }

      await apiService.post(`/api/clients/${shareDocumentForm.clientId}/share-document`, shareData)
      
      toast.success('Document shared successfully!')
      
      setIsShareDocumentDialogOpen(false)
      setShareDocumentForm({
        clientId: '',
        documentId: '',
        message: '',
        expiresAt: ''
      })
      
      // Refresh shared documents list
      await loadSharedDocuments()
      
    } catch (error: any) {
      console.error('Error sharing document:', error)
      if (error.response?.data?.error) {
        toast.error(error.response.data.error)
      } else {
        toast.error('Failed to share document')
      }
    }
  }

  const handleSendMessage = async () => {
    try {
      if (!messageForm.recipientId) {
        toast.error('Please select a recipient')
        return
      }
      if (!messageForm.subject.trim()) {
        toast.error('Please enter a subject')
        return
      }
      if (!messageForm.messageText.trim()) {
        toast.error('Please enter a message')
        return
      }

      // Get sender from localStorage (current authenticated user)
      const authToken = localStorage.getItem('auth_token')
      if (!authToken) {
        toast.error('Please log in to send messages')
        return
      }

      // Get receiver ID - for now use the current user as receiver
      // (In a real app, you'd get the actual user ID associated with the company)
      let receiverId = localStorage.getItem('user_id')
      if (!receiverId) {
        // Try to get from JWT token payload
        try {
          const tokenPayload = JSON.parse(atob(authToken.split('.')[1]))
          receiverId = tokenPayload.sub
        } catch (e) {
          // fallback
        }
      }

      // Find the selected client to get the company ID
      const selectedClient = companies.find(c => c.id === messageForm.recipientId);
      if (!selectedClient) {
        toast.error('Selected client not found');
        return;
      }

      const messageData = {
        companyId: selectedClient.companyId || 'default', // Use the client's company ID
        receiverId: selectedClient.assignedTo || receiverId, // Send to assigned user or fallback to current user
        messageText: `Subject: ${messageForm.subject.trim()}\n\nPriority: ${messageForm.priority.toUpperCase()}\n\n${messageForm.messageText.trim()}`
      }

      await apiService.post('/api/messages', messageData)
      
      toast.success('Message sent successfully!')
      
      setIsComposeDialogOpen(false)
      resetMessageForm()
      
      // Refresh messages after sending
      setTimeout(async () => {
        await loadClientData()
      }, 500)
      
    } catch (error: any) {
      console.error('Error sending message:', error)
      if (error.response?.data?.message) {
        toast.error(error.response.data.message)
      } else {
        toast.error('Failed to send message')
      }
    }
  }

  // Client details helper function
  const openClientDetails = (client: Company) => {
    setViewingClient(client)
  }

  const countries = [
    { code: 'US', name: 'United States' },
    { code: 'CA', name: 'Canada' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'DE', name: 'Germany' },
    { code: 'FR', name: 'France' },
    { code: 'AU', name: 'Australia' },
    { code: 'JP', name: 'Japan' },
    { code: 'RW', name: 'Rwanda' },
    { code: 'KE', name: 'Kenya' },
    { code: 'UG', name: 'Uganda' },
    { code: 'TZ', name: 'Tanzania' },
    { code: 'ZA', name: 'South Africa' }
  ]

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'CAD', name: 'Canadian Dollar' },
    { code: 'AUD', name: 'Australian Dollar' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'FRW', name: 'Rwandan Franc' },
    { code: 'KES', name: 'Kenyan Shilling' },
    { code: 'UGX', name: 'Ugandan Shilling' },
    { code: 'TZS', name: 'Tanzanian Shilling' },
    { code: 'ZAR', name: 'South African Rand' }
  ]
  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Client Portal & Communication </h1>
          <p className="text-muted-foreground">Manage client relationships and secure communications</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={loadClientData}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                resetClientForm()
                setIsCreateDialogOpen(true)
              }}>
                <Users className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
                <DialogDescription>
                  Create a new client company to manage their financial data and communications.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-name">Company Name *</Label>
                    <Input
                      id="client-name"
                      placeholder="Enter company name"
                      value={clientForm.name}
                      onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-email">Email *</Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="Enter email address"
                      value={clientForm.email}
                      onChange={(e) => setClientForm(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-phone">Phone</Label>
                    <Input
                      id="client-phone"
                      placeholder="Enter phone number"
                      value={clientForm.phone}
                      onChange={(e) => setClientForm(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-business-name">Business Name</Label>
                    <Input
                      id="client-business-name"
                      placeholder="Legal business name"
                      value={clientForm.businessName}
                      onChange={(e) => setClientForm(prev => ({ ...prev, businessName: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-contact-person">Contact Person</Label>
                    <Input
                      id="client-contact-person"
                      placeholder="Primary contact name"
                      value={clientForm.contactPerson}
                      onChange={(e) => setClientForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-industry">Industry</Label>
                    <Input
                      id="client-industry"
                      placeholder="e.g., Technology, Manufacturing"
                      value={clientForm.industry}
                      onChange={(e) => setClientForm(prev => ({ ...prev, industry: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-country">Country</Label>
                    <Select 
                      value={clientForm.country}
                      onValueChange={(value) => setClientForm(prev => ({ ...prev, country: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country.code} value={country.code}>
                            {country.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="client-currency">Currency</Label>
                    <Select 
                      value={clientForm.currency}
                      onValueChange={(value) => setClientForm(prev => ({ ...prev, currency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {currencies.map((currency) => (
                          <SelectItem key={currency.code} value={currency.code}>
                            {currency.code} - {currency.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-tax-id">Tax ID</Label>
                    <Input
                      id="client-tax-id"
                      placeholder="Enter tax identification number"
                      value={clientForm.taxId}
                      onChange={(e) => setClientForm(prev => ({ ...prev, taxId: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="client-fiscal-year">Fiscal Year Start</Label>
                    <Select 
                      value={clientForm.fiscalYearStart}
                      onValueChange={(value) => setClientForm(prev => ({ ...prev, fiscalYearStart: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select fiscal year start" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="01-01">January 1st</SelectItem>
                        <SelectItem value="04-01">April 1st</SelectItem>
                        <SelectItem value="07-01">July 1st</SelectItem>
                        <SelectItem value="10-01">October 1st</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setIsCreateDialogOpen(false)
                      resetClientForm()
                    }}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleCreateClient}
                    disabled={!clientForm.name.trim()}
                  >
                    Create Client
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
          <TabsTrigger value="documents">Shared Documents</TabsTrigger>
          <TabsTrigger value="portal">Portal Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Clients</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {loading ? '...' : stats.activeClients}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? 'Loading...' : 'Total companies'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Unread Messages</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {loading ? '...' : stats.unreadMessages}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? 'Loading...' : 'Require response'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {loading ? '...' : stats.pendingApprovals}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? 'Loading...' : 'Documents awaiting approval'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Portal Access</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {loading ? '...' : clientAccess.filter(access => access.isActive).length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {loading ? 'Loading...' : 'Active portal users'}
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Communications</CardTitle>
                <CardDescription>Latest messages and interactions with clients</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="text-muted-foreground">Loading messages...</div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-muted-foreground">No recent messages</div>
                    </div>
                  ) : (
                    messages.slice(0, 4).map((message) => (
                      <div key={message.id} className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarFallback>
                            {getInitials(message.sender.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">{message.company.name}</p>
                          <p className="text-xs text-muted-foreground">
                            "{message.messageText.length > 60 
                              ? message.messageText.substring(0, 60) + '...' 
                              : message.messageText}"
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(message.createdAt)}
                          </p>
                        </div>
                        <Badge 
                          variant={message.isRead ? "default" : "destructive"}
                          className={message.isRead 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                          }
                        >
                          {message.isRead ? (
                            <>
                              <CheckCircle className="mr-1 h-3 w-3" />
                              Read
                            </>
                          ) : (
                            'Unread'
                          )}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Client Portal Activity</CardTitle>
                <CardDescription>Recent client portal usage and document access</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-center py-4">
                      <div className="text-muted-foreground">Loading activity...</div>
                    </div>
                  ) : clientAccess.length === 0 ? (
                    <div className="text-center py-4">
                      <div className="text-muted-foreground">No portal activity</div>
                    </div>
                  ) : (
                    clientAccess.slice(0, 4).map((access) => (
                      <div key={access.id} className="flex items-center space-x-4">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                          access.isActive ? 'bg-green-100' : 'bg-gray-100'
                        }`}>
                          <Eye className={`h-5 w-5 ${
                            access.isActive ? 'text-green-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="text-sm font-medium">
                            {access.isActive ? 'Portal Access Active' : 'Portal Access Inactive'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {access.company.name} - {access.user.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Role: {access.user.role}
                          </p>
                        </div>
                        <Badge 
                          variant={access.isActive ? "default" : "secondary"}
                          className={access.isActive 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                          }
                        >
                          {access.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="clients" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Client Directory</h2>
            <div className="flex items-center space-x-2">
              <Input 
                placeholder="Search clients..." 
                className="w-64" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button onClick={() => {
                resetClientForm()
                setIsCreateDialogOpen(true)
              }}>
                Add Client
              </Button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {loading ? (
              <div className="col-span-full text-center py-8">
                <div className="text-muted-foreground">Loading clients...</div>
              </div>
            ) : companies.length === 0 ? (
              <div className="col-span-full text-center py-8">
                <div className="text-muted-foreground">No clients found</div>
                <Button 
                  className="mt-2"
                  onClick={() => {
                    resetClientForm()
                    setIsCreateDialogOpen(true)
                  }}
                >
                  Add First Client
                </Button>
              </div>
            ) : (
              companies
                .filter(company => 
                  !searchQuery || 
                  company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                  (company.industry && company.industry.toLowerCase().includes(searchQuery.toLowerCase()))
                )
                .map((company) => {
                  const hasAccess = clientAccess.some(access => 
                    access.companyId === company.id && access.isActive
                  )
                  
                  return (
                    <Card key={company.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarFallback>
                                {getInitials(company.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="text-lg">{company.name}</CardTitle>
                              <CardDescription>{company.industry || 'No industry specified'}</CardDescription>
                            </div>
                          </div>
                          <Badge 
                            variant={hasAccess ? "default" : "secondary"}
                            className={hasAccess 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                            }
                          >
                            {hasAccess ? 'Active' : 'Setup Required'}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center space-x-2 text-sm">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          <span>{company.email || 'No email provided'}</span>
                        </div>
                        <div className="flex items-center space-x-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span>{company.phone || 'No phone provided'}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Created</span>
                          <span className="font-medium">{formatDate(company.createdAt)}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Portal Access</span>
                          <Badge 
                            variant={hasAccess ? "default" : "outline"}
                            className={hasAccess 
                              ? "bg-green-100 text-green-800" 
                              : "bg-gray-100 text-gray-800"
                            }
                          >
                            {hasAccess ? 'Enabled' : 'Setup Required'}
                          </Badge>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Country</span>
                          <span className="font-medium">{company.country || 'Not specified'}</span>
                        </div>
                        <div className="flex space-x-2">
                          <Button 
                            size="sm" 
                            className="flex-1"
                            onClick={() => openComposeDialog(company.id)}
                          >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Message
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => openShareDocumentDialog(company.id)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Share Doc
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setViewingClient(company)}
                          >
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
            )}
          </div>
        </TabsContent>

        <TabsContent value="communications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Message Center</CardTitle>
              <CardDescription>Secure communications with clients</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  You have {stats.unreadMessages} unread messages from clients. 
                  {stats.unreadMessages > 0 ? ' Some may require immediate attention.' : ' All messages have been read.'}
                </AlertDescription>
              </Alert>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Recent Messages</h3>
                  <div className="space-y-3">
                    {loading ? (
                      <div className="text-center py-4">
                        <div className="text-muted-foreground">Loading messages...</div>
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="text-center py-4">
                        <div className="text-muted-foreground">No messages found</div>
                      </div>
                    ) : (
                      messages.slice(0, 6).map((message) => (
                        <div key={message.id} className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center space-x-3">
                              <Avatar className="h-8 w-8">
                                <AvatarFallback>
                                  {getInitials(message.sender.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">{message.company.name}</p>
                                <p className="text-sm text-muted-foreground">{message.sender.name}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge 
                                variant={message.isRead ? "default" : "destructive"}
                                className={message.isRead 
                                  ? "bg-green-100 text-green-800" 
                                  : "bg-red-100 text-red-800"
                                }
                              >
                                {message.isRead ? 'Read' : 'Unread'}
                              </Badge>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(message.createdAt)}
                              </p>
                            </div>
                          </div>
                          <p className="text-sm">
                            "{message.messageText.length > 100 
                              ? message.messageText.substring(0, 100) + '...' 
                              : message.messageText}"
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Quick Actions</h3>
                  <div className="space-y-3">
                    <Button 
                      className="w-full justify-start bg-transparent" 
                      variant="outline"
                      onClick={() => openComposeDialog()}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Compose New Message
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Meeting
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Share className="mr-2 h-4 w-4" />
                      Share Document
                    </Button>
                    <Button className="w-full justify-start bg-transparent" variant="outline">
                      <Bell className="mr-2 h-4 w-4" />
                      Send Notification
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-3">Message Templates</h4>
                    <div className="space-y-2">
                      <Button size="sm" variant="ghost" className="w-full justify-start text-sm">
                        Document Review Request
                      </Button>
                      <Button size="sm" variant="ghost" className="w-full justify-start text-sm">
                        Meeting Confirmation
                      </Button>
                      <Button size="sm" variant="ghost" className="w-full justify-start text-sm">
                        Payment Reminder
                      </Button>
                      <Button size="sm" variant="ghost" className="w-full justify-start text-sm">
                        Project Update
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shared Documents</CardTitle>
              <CardDescription>Documents shared with clients through the portal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {loadingSharedDocuments ? 'Loading...' : `${sharedDocuments.length} documents are currently shared with clients`}
                  </p>
                  <Button onClick={() => openShareDocumentDialog()}>
                    <Share className="mr-2 h-4 w-4" />
                    Share New Document
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground border-b pb-2">
                    <div className="col-span-4">Document</div>
                    <div className="col-span-2">Client</div>
                    <div className="col-span-2">Shared Date</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  <div className="space-y-2">
                    {loadingSharedDocuments ? (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground">Loading shared documents...</div>
                      </div>
                    ) : sharedDocuments.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground">No documents have been shared yet</div>
                        <Button 
                          className="mt-2"
                          onClick={() => openShareDocumentDialog()}
                        >
                          Share Your First Document
                        </Button>
                      </div>
                    ) : (
                      sharedDocuments.map((sharedDoc) => (
                        <div key={sharedDoc.id} className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                          <div className="col-span-4 flex items-center space-x-3">
                            <FileText className="h-5 w-5 text-blue-600" />
                            <div>
                              <p className="font-medium">{sharedDoc.document?.displayName || sharedDoc.document?.name || 'Unknown Document'}</p>
                              <p className="text-sm text-muted-foreground">
                                {sharedDoc.document?.sizeBytes ? `${(sharedDoc.document.sizeBytes / 1024 / 1024).toFixed(1)} MB` : 'Unknown size'}
                              </p>
                            </div>
                          </div>
                          <div className="col-span-2">
                            <div className="flex items-center space-x-2">
                              <Avatar className="h-6 w-6">
                                <AvatarFallback>
                                  {getInitials(sharedDoc.clientInfo?.name || 'Unknown')}
                                </AvatarFallback>
                              </Avatar>
                              <span className="text-sm">{sharedDoc.clientInfo?.name || 'Unknown Client'}</span>
                            </div>
                          </div>
                          <div className="col-span-2 text-sm text-muted-foreground">
                            {formatDate(sharedDoc.sharedAt || sharedDoc.createdAt)}
                          </div>
                          <div className="col-span-2">
                            <Badge 
                              variant={sharedDoc.status === 'active' ? 'default' : 'secondary'}
                              className={sharedDoc.status === 'active' 
                                ? "bg-green-100 text-green-800" 
                                : "bg-gray-100 text-gray-800"
                              }
                            >
                              {sharedDoc.expiresAt && new Date(sharedDoc.expiresAt) < new Date() ? (
                                <>
                                  <AlertTriangle className="mr-1 h-3 w-3" />
                                  Expired
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-1 h-3 w-3" />
                                  Active
                                </>
                              )}
                            </Badge>
                          </div>
                          <div className="col-span-2 flex items-center space-x-1">
                            <Button size="sm" variant="ghost" title="View Document">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              title="Message Client"
                              onClick={() => openComposeDialog(sharedDoc.clientInfo?.id)}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))
                    )}
                    <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg" style={{display: 'none'}}>
                      <div className="col-span-4 flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">Q4 Financial Report.pdf</p>
                          <p className="text-sm text-muted-foreground">2.4 MB</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="/professional-woman-diverse.png" />
                            <AvatarFallback>AC</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">ABC Corp</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">2 hours ago</div>
                      <div className="col-span-2">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Clock className="mr-1 h-3 w-3" />
                          Pending Review
                        </Badge>
                      </div>
                      <div className="col-span-2 flex items-center space-x-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                      <div className="col-span-4 flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">Tax Return 2024.pdf</p>
                          <p className="text-sm text-muted-foreground">1.8 MB</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="/professional-man.png" />
                            <AvatarFallback>XY</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">XYZ Ind</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">1 day ago</div>
                      <div className="col-span-2">
                        <Badge variant="default" className="bg-green-100 text-green-800">
                          <CheckCircle className="mr-1 h-3 w-3" />
                          Approved
                        </Badge>
                      </div>
                      <div className="col-span-2 flex items-center space-x-1">
                        <Button size="sm" variant="ghost">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Share className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-muted/50 rounded-lg">
                      <div className="col-span-4 flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">Contract Amendment.docx</p>
                          <p className="text-sm text-muted-foreground">456 KB</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="flex items-center space-x-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src="/professional-woman-2.png" />
                            <AvatarFallback>DE</AvatarFallback>
                          </Avatar>
                          <span className="text-sm">DEF Ent</span>
                        </div>
                      </div>
                      <div className="col-span-2 text-sm text-muted-foreground">3 days ago</div>
                      <div className="col-span-2">
                        <Badge variant="destructive">
                          <AlertTriangle className="mr-1 h-3 w-3" />
                          Rejected
                        </Badge>
                      </div>
                      <div className="col-span-2 flex items-center space-x-1">
                        <Button size="sm" variant="ghost">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost">
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="portal" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Portal Configuration</CardTitle>
                <CardDescription>Customize client portal settings and branding</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Custom Branding</p>
                      <p className="text-sm text-muted-foreground">Add your logo and brand colors</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Enabled
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-muted-foreground">Enhanced security for client access</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Required
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Document Watermarks</p>
                      <p className="text-sm text-muted-foreground">Add watermarks to shared documents</p>
                    </div>
                    <Badge variant="outline">Optional</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Email Notifications</p>
                      <p className="text-sm text-muted-foreground">Notify clients of new documents</p>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Enabled
                    </Badge>
                  </div>
                </div>

                <Button className="w-full">Configure Portal Settings</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Access Management</CardTitle>
                <CardDescription>Manage client permissions and access levels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Document Access</p>
                      <Badge variant="default" className="bg-blue-100 text-blue-800">
                        Full Access
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Clients can view, download, and approve documents</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Communication</p>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Enabled
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Secure messaging and meeting scheduling</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Financial Reports</p>
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                        View Only
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">Read-only access to financial statements</p>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium">Invoice Management</p>
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        Full Access
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">View, approve, and pay invoices online</p>
                  </div>
                </div>

                <Button className="w-full bg-transparent" variant="outline">
                  Manage Permissions
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Message Composition Dialog */}
      <Dialog open={isComposeDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsComposeDialogOpen(false)
          resetMessageForm()
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Compose New Message</DialogTitle>
            <DialogDescription>
              Send a secure message to one of your clients
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient">Recipient Company *</Label>
              <Select 
                value={messageForm.recipientId}
                onValueChange={(value) => setMessageForm(prev => ({ ...prev, recipientId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a client to message" />
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
            
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Input 
                id="subject" 
                placeholder="Enter message subject"
                value={messageForm.subject}
                onChange={(e) => setMessageForm(prev => ({ ...prev, subject: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="priority">Priority</Label>
              <Select 
                value={messageForm.priority}
                onValueChange={(value) => setMessageForm(prev => ({ ...prev, priority: value as 'low' | 'normal' | 'high' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="message">Message *</Label>
              <Textarea 
                id="message" 
                placeholder="Type your message here..."
                value={messageForm.messageText}
                onChange={(e) => setMessageForm(prev => ({ ...prev, messageText: e.target.value }))}
                rows={6}
                className="resize-none"
              />
              <div className="text-right mt-1">
                <span className="text-xs text-muted-foreground">
                  {messageForm.messageText.length} characters
                </span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsComposeDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSendMessage}
                disabled={!messageForm.recipientId || !messageForm.subject.trim() || !messageForm.messageText.trim()}
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Document Sharing Dialog */}
      <Dialog open={isShareDocumentDialogOpen} onOpenChange={setIsShareDocumentDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Share Document</DialogTitle>
            <DialogDescription>
              Share a document with the selected client
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="document-select">Select Document</Label>
              <Select 
                value={shareDocumentForm.documentId}
                onValueChange={(value) => setShareDocumentForm(prev => ({ ...prev, documentId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a document to share" />
                </SelectTrigger>
                <SelectContent>
                  {loadingDocuments ? (
                    <SelectItem value="loading" disabled>Loading documents...</SelectItem>
                  ) : documents.length === 0 ? (
                    <SelectItem value="none" disabled>No documents available</SelectItem>
                  ) : (
                    documents.map((doc) => (
                      <SelectItem key={doc.id} value={doc.id}>
                        <div className="flex items-center space-x-2">
                          <FileText className="h-4 w-4" />
                          <span>{doc.displayName || doc.name}</span>
                        </div>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="share-message">Message (Optional)</Label>
              <Textarea
                id="share-message"
                placeholder="Add a message for the client..."
                value={shareDocumentForm.message}
                onChange={(e) => setShareDocumentForm(prev => ({ ...prev, message: e.target.value }))}
                rows={3}
                className="resize-none"
              />
            </div>

            <div>
              <Label htmlFor="expires-at">Expiration Date (Optional)</Label>
              <Input
                id="expires-at"
                type="datetime-local"
                value={shareDocumentForm.expiresAt}
                onChange={(e) => setShareDocumentForm(prev => ({ ...prev, expiresAt: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setIsShareDocumentDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleShareDocument}
                disabled={!shareDocumentForm.documentId || !shareDocumentForm.clientId}
              >
                <Share className="w-4 h-4 mr-2" />
                Share Document
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Client Details Dialog */}
      <Dialog open={!!viewingClient} onOpenChange={(open) => {
        if (!open) setViewingClient(null)
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
            <DialogDescription>
              View detailed information about this client
            </DialogDescription>
          </DialogHeader>
          {viewingClient && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Company Name</Label>
                    <p className="text-lg font-semibold">{viewingClient.name}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Industry</Label>
                    <p className="text-sm">{viewingClient.industry || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                    <p className="text-sm">{viewingClient.country || 'Not specified'}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Currency</Label>
                    <p className="text-sm">{viewingClient.currency || 'Not specified'}</p>
                  </div>
                  {viewingClient.taxId && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Tax ID</Label>
                      <p className="text-sm">{viewingClient.taxId}</p>
                    </div>
                  )}
                  {viewingClient.fiscalYearStart && (
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Fiscal Year Start</Label>
                      <p className="text-sm">{viewingClient.fiscalYearStart}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{viewingClient.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{viewingClient.phone || 'No phone provided'}</span>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div>
                <h3 className="text-lg font-semibold mb-3">Account Status</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Client Since</Label>
                    <p className="text-sm">{formatDate(viewingClient.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Portal Access</Label>
                    <div className="mt-1">
                      <Badge 
                        variant={clientAccess.some(access => access.companyId === viewingClient.id && access.isActive) ? "default" : "outline"}
                        className={clientAccess.some(access => access.companyId === viewingClient.id && access.isActive)
                          ? "bg-green-100 text-green-800" 
                          : "bg-gray-100 text-gray-800"
                        }
                      >
                        {clientAccess.some(access => access.companyId === viewingClient.id && access.isActive) ? 'Enabled' : 'Setup Required'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setViewingClient(null)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setViewingClient(null)
                  openComposeDialog(viewingClient.id)
                }}>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
