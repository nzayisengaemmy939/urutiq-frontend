import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Building2, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Globe, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  Users,
  Settings,
  CreditCard,
  Crown,
  Shield,
  CheckCircle,
  AlertCircle,
  Clock,
  DollarSign,
  UserPlus,
  UserMinus
} from "lucide-react"
import { toast } from 'sonner'
import { apiService } from '@/lib/api'

interface Organization {
  id: string
  name: string
  type: string
  email: string
  phone: string
  website: string
  address: string
  city: string
  state: string
  postalCode: string
  country: string
  description?: string
  status: 'active' | 'inactive' | 'trial' | 'suspended'
  subscription: 'Trial' | 'Standard' | 'Professional' | 'Enterprise'
  userCount: number
  maxUsers: number
  billingEmail: string
  billingCycle: 'monthly' | 'yearly'
  nextBillingDate: string
  createdAt: string
  updatedAt: string
  ownerId: string
  ownerName: string
}

export function OrganizationManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null)
  const [viewingOrg, setViewingOrg] = useState<Organization | null>(null)
  const queryClient = useQueryClient()

  // Fetch organizations (using companies API for now)
  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const response = await apiService.getCompanies()
      const companies = Array.isArray(response) ? response : (response?.data || [])
      
      // Transform companies to organizations with additional fields
      return companies.map((company: any) => ({
        ...company,
        status: company.isActive ? 'active' : 'inactive',
        subscription: 'Professional', // Default subscription
        userCount: Math.floor(Math.random() * 20) + 1, // Mock user count
        maxUsers: 50, // Default max users
        billingEmail: company.email || '',
        billingCycle: 'monthly' as const,
        nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        ownerId: 'owner-1',
        ownerName: 'John Doe'
      }))
    }
  })

  // Create organization mutation
  const createOrganization = useMutation({
    mutationFn: async (orgData: Partial<Organization>) => {
      return await apiService.createCompany(orgData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      setIsCreateOpen(false)
      toast.success('Organization created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create organization')
    }
  })

  // Update organization mutation
  const updateOrganization = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Organization> }) => {
      return await apiService.updateCompany(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      setEditingOrg(null)
      toast.success('Organization updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update organization')
    }
  })

  // Delete organization mutation
  const deleteOrganization = useMutation({
    mutationFn: async (id: string) => {
      return await apiService.deleteCompany(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] })
      toast.success('Organization deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete organization')
    }
  })

  const handleCreate = (data: Partial<Organization>) => {
    createOrganization.mutate(data)
  }

  const handleUpdate = (id: string, data: Partial<Organization>) => {
    updateOrganization.mutate({ id, data })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      deleteOrganization.mutate(id)
    }
  }

  const getSubscriptionColor = (subscription: string) => {
    switch (subscription) {
      case 'Enterprise': return 'bg-purple-100 text-purple-800'
      case 'Professional': return 'bg-blue-100 text-blue-800'
      case 'Standard': return 'bg-green-100 text-green-800'
      case 'Trial': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'trial': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'suspended': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Organization Management</h2>
          <p className="text-slate-600 mt-1">Manage organizations, subscriptions, and user access</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Organization
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Organization</DialogTitle>
            </DialogHeader>
            <OrganizationForm 
              onSubmit={handleCreate}
              onCancel={() => setIsCreateOpen(false)}
              isLoading={createOrganization.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Building2 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Organizations</p>
                <p className="text-xl font-bold">{organizations?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Organizations</p>
                <p className="text-xl font-bold">
                  {organizations?.filter((org: Organization) => org.status === 'active').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Users</p>
                <p className="text-xl font-bold">
                  {organizations?.reduce((sum: number, org: Organization) => sum + org.userCount, 0) || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trial Organizations</p>
                <p className="text-xl font-bold">
                  {organizations?.filter((org: Organization) => org.status === 'trial').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Organizations List */}
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading organizations...</div>
            </div>
          ) : organizations?.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No organizations found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first organization.</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Organization
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {organizations?.map((org: Organization) => (
                <OrganizationCard
                  key={org.id}
                  organization={org}
                  onEdit={() => setEditingOrg(org)}
                  onView={() => setViewingOrg(org)}
                  onDelete={() => handleDelete(org.id)}
                  getSubscriptionColor={getSubscriptionColor}
                  getStatusColor={getStatusColor}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Organization Dialog */}
      {editingOrg && (
        <Dialog open={!!editingOrg} onOpenChange={() => setEditingOrg(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Organization</DialogTitle>
            </DialogHeader>
            <OrganizationForm
              organization={editingOrg}
              onSubmit={(data) => handleUpdate(editingOrg.id, data)}
              onCancel={() => setEditingOrg(null)}
              isLoading={updateOrganization.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Organization Dialog */}
      {viewingOrg && (
        <Dialog open={!!viewingOrg} onOpenChange={() => setViewingOrg(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Organization Details</DialogTitle>
            </DialogHeader>
            <OrganizationDetails organization={viewingOrg} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function OrganizationCard({ 
  organization, 
  onEdit, 
  onView, 
  onDelete,
  getSubscriptionColor,
  getStatusColor
}: { 
  organization: Organization
  onEdit: () => void
  onView: () => void
  onDelete: () => void
  getSubscriptionColor: (subscription: string) => string
  getStatusColor: (status: string) => string
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-6 h-6 text-slate-600" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-900">{organization.name}</h3>
            <Badge className={getStatusColor(organization.status)}>
              {organization.status.charAt(0).toUpperCase() + organization.status.slice(1)}
            </Badge>
            <Badge className={getSubscriptionColor(organization.subscription)}>
              {organization.subscription}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{organization.type}</p>
          <div className="flex items-center gap-4 mt-1">
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="w-3 h-3" />
              {organization.userCount}/{organization.maxUsers} users
            </div>
            {organization.email && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="w-3 h-3" />
                {organization.email}
              </div>
            )}
            {organization.website && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="w-3 h-3" />
                {organization.website}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={onView}>
          <Eye className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Edit className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete} className="text-red-600 hover:text-red-700">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  )
}

function OrganizationForm({ 
  organization, 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  organization?: Organization | null
  onSubmit: (data: Partial<Organization>) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState<Partial<Organization>>({
    name: organization?.name || '',
    type: organization?.type || 'Corporation',
    email: organization?.email || '',
    phone: organization?.phone || '',
    website: organization?.website || '',
    address: organization?.address || '',
    city: organization?.city || '',
    state: organization?.state || '',
    postalCode: organization?.postalCode || '',
    country: organization?.country || 'US',
    description: organization?.description || '',
    status: organization?.status || 'active',
    subscription: organization?.subscription || 'Standard',
    maxUsers: organization?.maxUsers || 50,
    billingEmail: organization?.billingEmail || '',
    billingCycle: organization?.billingCycle || 'monthly'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter organization name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Organization Type *</Label>
              <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Corporation">Corporation</SelectItem>
                  <SelectItem value="LLC">LLC</SelectItem>
                  <SelectItem value="Partnership">Partnership</SelectItem>
                  <SelectItem value="Non-Profit">Non-Profit</SelectItem>
                  <SelectItem value="Government">Government</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="organization@example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State/Province</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                placeholder="NY"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="postalCode">Postal Code</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                placeholder="10001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={formData.country} onValueChange={(value) => setFormData({ ...formData, country: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CA">Canada</SelectItem>
                  <SelectItem value="GB">United Kingdom</SelectItem>
                  <SelectItem value="AU">Australia</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of the organization..."
              rows={3}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="status"
              checked={formData.status === 'active'}
              onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? 'active' : 'inactive' })}
            />
            <Label htmlFor="status">Active Organization</Label>
          </div>
        </TabsContent>

        <TabsContent value="subscription" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subscription">Subscription Plan *</Label>
              <Select value={formData.subscription} onValueChange={(value) => setFormData({ ...formData, subscription: value as any })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Trial">Trial (Free)</SelectItem>
                  <SelectItem value="Standard">Standard ($29/month)</SelectItem>
                  <SelectItem value="Professional">Professional ($79/month)</SelectItem>
                  <SelectItem value="Enterprise">Enterprise ($199/month)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxUsers">Maximum Users</Label>
              <Input
                id="maxUsers"
                type="number"
                value={formData.maxUsers}
                onChange={(e) => setFormData({ ...formData, maxUsers: parseInt(e.target.value) || 0 })}
                placeholder="50"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Plan Features</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Standard Plan</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Up to 10 users</li>
                  <li>• Basic reporting</li>
                  <li>• Email support</li>
                  <li>• 5GB storage</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="text-sm font-medium">Professional Plan</h5>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>• Up to 50 users</li>
                  <li>• Advanced reporting</li>
                  <li>• Priority support</li>
                  <li>• 50GB storage</li>
                </ul>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="billingEmail">Billing Email *</Label>
              <Input
                id="billingEmail"
                type="email"
                value={formData.billingEmail}
                onChange={(e) => setFormData({ ...formData, billingEmail: e.target.value })}
                placeholder="billing@example.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="billingCycle">Billing Cycle</Label>
              <Select value={formData.billingCycle} onValueChange={(value) => setFormData({ ...formData, billingCycle: value as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly (20% discount)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-medium text-slate-900">Billing Information</h4>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-4 h-4 text-slate-600" />
                <span className="text-sm font-medium">Payment Method</span>
              </div>
              <p className="text-sm text-muted-foreground">No payment method on file</p>
              <Button variant="outline" size="sm" className="mt-2">
                Add Payment Method
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : organization ? 'Update Organization' : 'Create Organization'}
        </Button>
      </div>
    </form>
  )
}

function OrganizationDetails({ organization }: { organization: Organization }) {
  const getSubscriptionIcon = (subscription: string) => {
    switch (subscription) {
      case 'Enterprise': return <Crown className="w-4 h-4" />
      case 'Professional': return <Shield className="w-4 h-4" />
      case 'Standard': return <CheckCircle className="w-4 h-4" />
      case 'Trial': return <Clock className="w-4 h-4" />
      default: return <Building2 className="w-4 h-4" />
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
          <Building2 className="w-8 h-8 text-slate-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">{organization.name}</h3>
          <p className="text-slate-600">{organization.type}</p>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline">{organization.status}</Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              {getSubscriptionIcon(organization.subscription)}
              {organization.subscription}
            </Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Contact Information</h4>
              <div className="space-y-2">
                {organization.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{organization.email}</span>
                  </div>
                )}
                {organization.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span className="text-sm">{organization.phone}</span>
                  </div>
                )}
                {organization.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-500" />
                    <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                      {organization.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Address</h4>
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-slate-500 mt-0.5" />
                <div className="text-sm">
                  {organization.address && <div>{organization.address}</div>}
                  {(organization.city || organization.state || organization.postalCode) && (
                    <div>
                      {organization.city && organization.state ? `${organization.city}, ${organization.state}` : organization.city || organization.state}
                      {organization.postalCode && ` ${organization.postalCode}`}
                    </div>
                  )}
                  {organization.country && <div>{organization.country}</div>}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Subscription Details</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Plan:</span>
                  <span className="text-sm font-medium">{organization.subscription}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Users:</span>
                  <span className="text-sm font-medium">{organization.userCount}/{organization.maxUsers}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Billing:</span>
                  <span className="text-sm font-medium capitalize">{organization.billingCycle}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-500">Next Billing:</span>
                  <span className="text-sm">{new Date(organization.nextBillingDate).toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-medium text-slate-900">Timeline</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-500">Created:</span>
                  <span className="text-sm">{new Date(organization.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-500">Updated:</span>
                  <span className="text-sm">{new Date(organization.updatedAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span className="text-sm text-slate-500">Owner:</span>
                  <span className="text-sm">{organization.ownerName}</span>
                </div>
              </div>
            </div>
          </div>

          {organization.description && (
            <div className="space-y-2">
              <h4 className="font-medium text-slate-900">Description</h4>
              <p className="text-sm text-slate-600">{organization.description}</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-slate-900">Organization Users</h4>
            <Button size="sm">
              <UserPlus className="w-4 h-4 mr-2" />
              Invite User
            </Button>
          </div>
          <div className="text-center py-8 text-muted-foreground">
            User management features coming soon...
          </div>
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <h4 className="font-medium text-slate-900">Billing Information</h4>
          <div className="text-center py-8 text-muted-foreground">
            Billing management features coming soon...
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <h4 className="font-medium text-slate-900">Organization Settings</h4>
          <div className="text-center py-8 text-muted-foreground">
            Advanced settings coming soon...
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
