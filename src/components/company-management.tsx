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
  Upload,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { toast } from 'sonner'
import { apiService } from '@/lib/api'

interface Company {
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
  currency: string
  timezone: string
  logoUrl?: string
  description?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  userCount?: number
}

export function CompanyManagement() {
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [viewingCompany, setViewingCompany] = useState<Company | null>(null)
  const queryClient = useQueryClient()

  // Fetch companies
  const { data: companies, isLoading } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await apiService.getCompanies()
      return Array.isArray(response) ? response : (response?.data || [])
    }
  })

  // Create company mutation
  const createCompany = useMutation({
    mutationFn: async (companyData: Partial<Company>) => {
      return await apiService.createCompany(companyData)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setIsCreateOpen(false)
      toast.success('Company created successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create company')
    }
  })

  // Update company mutation
  const updateCompany = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Company> }) => {
      return await apiService.updateCompany(id, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setEditingCompany(null)
      toast.success('Company updated successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update company')
    }
  })

  // Delete company mutation
  const deleteCompany = useMutation({
    mutationFn: async (id: string) => {
      return await apiService.deleteCompany(id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      toast.success('Company deleted successfully')
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete company')
    }
  })

  const handleCreate = (data: Partial<Company>) => {
    createCompany.mutate(data)
  }

  const handleUpdate = (id: string, data: Partial<Company>) => {
    updateCompany.mutate({ id, data })
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this company? This action cannot be undone.')) {
      deleteCompany.mutate(id)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Company Management</h2>
          <p className="text-slate-600 mt-1">Manage your companies and organization settings</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Company
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Company</DialogTitle>
            </DialogHeader>
            <CompanyForm 
              onSubmit={handleCreate}
              onCancel={() => setIsCreateOpen(false)}
              isLoading={createCompany.isPending}
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
                <p className="text-sm text-muted-foreground">Total Companies</p>
                <p className="text-xl font-bold">{companies?.length || 0}</p>
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
                <p className="text-sm text-muted-foreground">Active Companies</p>
                <p className="text-xl font-bold">
                  {companies?.filter((c: Company) => c.isActive).length || 0}
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
                <p className="text-sm text-muted-foreground">Total Companies</p>
                <p className="text-xl font-bold">
                  {companies?.length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Inactive Companies</p>
                <p className="text-xl font-bold">
                  {companies?.filter((c: Company) => !c.isActive).length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Companies List */}
      <Card>
        <CardHeader>
          <CardTitle>Companies</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Loading companies...</div>
            </div>
          ) : companies?.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">No companies found</h3>
              <p className="text-muted-foreground mb-4">Get started by creating your first company.</p>
              <Button onClick={() => setIsCreateOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Company
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {companies?.map((company: any) => (
                <CompanyCard
                  key={company.id}
                  company={company}
                  onEdit={() => setEditingCompany(company)}
                  onView={() => setViewingCompany(company)}
                  onDelete={() => handleDelete(company.id)}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Company Dialog */}
      {editingCompany && (
        <Dialog open={!!editingCompany} onOpenChange={() => setEditingCompany(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Company</DialogTitle>
            </DialogHeader>
            <CompanyForm
              company={editingCompany}
              onSubmit={(data) => handleUpdate(editingCompany.id, data)}
              onCancel={() => setEditingCompany(null)}
              isLoading={updateCompany.isPending}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* View Company Dialog */}
      {viewingCompany && (
        <Dialog open={!!viewingCompany} onOpenChange={() => setViewingCompany(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Company Details</DialogTitle>
            </DialogHeader>
            <CompanyDetails company={viewingCompany} />
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function CompanyCard({ 
  company, 
  onEdit, 
  onView, 
  onDelete 
}: { 
  company: Company
  onEdit: () => void
  onView: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-slate-50 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="w-8 h-8 object-contain" />
          ) : (
            <Building2 className="w-6 h-6 text-slate-600" />
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-slate-900">{company.name}</h3>
            <Badge variant={company.isActive ? "default" : "secondary"}>
              {company.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-muted-foreground">{company.type}</p>
          <div className="flex items-center gap-4 mt-1">
            {company.email && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Mail className="w-3 h-3" />
                {company.email}
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Globe className="w-3 h-3" />
                {company.website}
              </div>
            )}
            {company.city && company.state && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                {company.city}, {company.state}
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

function CompanyForm({ 
  company, 
  onSubmit, 
  onCancel, 
  isLoading 
}: { 
  company?: Company | null
  onSubmit: (data: Partial<Company>) => void
  onCancel: () => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState<Partial<Company>>({
    name: company?.name || '',
    type: company?.type || 'Corporation',
    email: company?.email || '',
    phone: company?.phone || '',
    website: company?.website || '',
    address: company?.address || '',
    city: company?.city || '',
    state: company?.state || '',
    postalCode: company?.postalCode || '',
    country: company?.country || 'US',
    currency: company?.currency || 'USD',
    timezone: company?.timezone || 'UTC',
    description: company?.description || '',
    logoUrl: company?.logoUrl || '',
    isActive: company?.isActive ?? true
  })
  
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [logoPreview, setLogoPreview] = useState<string | null>(company?.logoUrl || null)

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setLogoFile(file)
      // Create preview URL
      const previewUrl = URL.createObjectURL(file)
      setLogoPreview(previewUrl)
      setFormData({ ...formData, logoUrl: previewUrl })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // If there's a logo file, upload it first
    if (logoFile) {
      try {
        const formDataWithLogo = new FormData()
        formDataWithLogo.append('logo', logoFile)
        formDataWithLogo.append('companyId', company?.id || '')
        
        // Upload logo to backend
        const response = await fetch(`/api/companies/${company?.id}/logo`, {
          method: 'POST',
          body: formDataWithLogo,
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
            'x-tenant-id': localStorage.getItem('tenant_id') || '',
            'x-company-id': localStorage.getItem('company_id') || ''
          }
        })
        
        if (response.ok) {
          const result = await response.json()
          // The backend returns the logo URL in the data object
          const logoUrl = result.data?.logoUrl || result.logoUrl
          if (logoUrl) {
            // Update formData with the uploaded logo URL
            const updatedFormData = { ...formData, logoUrl }
            onSubmit(updatedFormData)
          } else {
            console.error('No logo URL returned from server')
            onSubmit(formData)
          }
        } else {
          console.error('Failed to upload logo')
          // Submit without logo URL if upload fails
          onSubmit(formData)
        }
      } catch (error) {
        console.error('Logo upload error:', error)
        // Submit without logo URL if upload fails
        onSubmit(formData)
      }
    } else {
      // No logo file, submit as is
      onSubmit(formData)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Company Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Enter company name"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="logo">Company Logo</Label>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center overflow-hidden">
              {logoPreview ? (
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
              ) : (
                <Building2 className="w-8 h-8 text-slate-600" />
              )}
            </div>
            <div className="flex-1">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload a logo image (PNG, JPG, GIF). Max size: 2MB
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Company Type *</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Corporation">Corporation</SelectItem>
              <SelectItem value="LLC">LLC</SelectItem>
              <SelectItem value="Partnership">Partnership</SelectItem>
              <SelectItem value="Sole Proprietorship">Sole Proprietorship</SelectItem>
              <SelectItem value="Non-Profit">Non-Profit</SelectItem>
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
            placeholder="company@example.com"
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
          <Label htmlFor="currency">Currency</Label>
          <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="USD">USD - US Dollar</SelectItem>
              <SelectItem value="EUR">EUR - Euro</SelectItem>
              <SelectItem value="GBP">GBP - British Pound</SelectItem>
              <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
              <SelectItem value="AUD">AUD - Australian Dollar</SelectItem>
            </SelectContent>
          </Select>
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
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">Eastern Time</SelectItem>
              <SelectItem value="America/Chicago">Central Time</SelectItem>
              <SelectItem value="America/Denver">Mountain Time</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
              <SelectItem value="Europe/London">London</SelectItem>
              <SelectItem value="Europe/Paris">Paris</SelectItem>
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
          placeholder="Brief description of the company..."
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Active Company</Label>
      </div>

      <Separator />

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : company ? 'Update Company' : 'Create Company'}
        </Button>
      </div>
    </form>
  )
}

function CompanyDetails({ company }: { company: Company }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
          {company.logoUrl ? (
            <img src={company.logoUrl} alt={company.name} className="w-12 h-12 object-contain" />
          ) : (
            <Building2 className="w-8 h-8 text-slate-600" />
          )}
        </div>
        <div>
          <h3 className="text-xl font-bold text-slate-900">{company.name}</h3>
          <p className="text-slate-600">{company.type}</p>
          <Badge variant={company.isActive ? "default" : "secondary"}>
            {company.isActive ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Contact Information</h4>
          <div className="space-y-2">
            {company.email && (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-500" />
                <span className="text-sm">{company.email}</span>
              </div>
            )}
            {company.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-500" />
                <span className="text-sm">{company.phone}</span>
              </div>
            )}
            {company.website && (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-500" />
                <a href={company.website} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 hover:underline">
                  {company.website}
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
              {company.address && <div>{company.address}</div>}
              {(company.city || company.state || company.postalCode) && (
                <div>
                  {company.city && company.state ? `${company.city}, ${company.state}` : company.city || company.state}
                  {company.postalCode && ` ${company.postalCode}`}
                </div>
              )}
              {company.country && <div>{company.country}</div>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Settings</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Currency:</span>
              <span className="text-sm font-medium">{company.currency}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-500">Timezone:</span>
              <span className="text-sm font-medium">{company.timezone}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-slate-900">Timeline</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">Created:</span>
              <span className="text-sm">{new Date(company.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-500">Updated:</span>
              <span className="text-sm">{new Date(company.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {company.description && (
        <div className="space-y-2">
          <h4 className="font-medium text-slate-900">Description</h4>
          <p className="text-sm text-slate-600">{company.description}</p>
        </div>
      )}
    </div>
  )
}
