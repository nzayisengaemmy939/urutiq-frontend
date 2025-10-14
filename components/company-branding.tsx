"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { 
  Upload, 
  Palette, 
  Type, 
  Globe, 
  MapPin, 
  Phone, 
  Mail,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiService from '@/lib/api'

interface CompanyBrandingProps {
  companyId: string
  onSave?: () => void
}

interface CompanyData {
  id: string
  name: string
  logoUrl?: string
  primaryColor?: string
  secondaryColor?: string
  fontFamily?: string
  website?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  postalCode?: string
  invoiceTemplate?: string
  invoiceFooter?: string
  invoiceTerms?: string
  showLogo?: boolean
  showWebsite?: boolean
  showAddress?: boolean
}

const TEMPLATE_OPTIONS = [
  { value: 'modern', label: 'Modern', description: 'Clean, contemporary design with bold typography' },
  { value: 'classic', label: 'Classic', description: 'Traditional business layout with formal styling' },
  { value: 'minimal', label: 'Minimal', description: 'Simple, uncluttered design focusing on content' },
  { value: 'professional', label: 'Professional', description: 'Corporate-style layout with structured sections' }
]

const FONT_OPTIONS = [
  { value: 'Inter', label: 'Inter', description: 'Modern, clean sans-serif' },
  { value: 'Roboto', label: 'Roboto', description: 'Google font, highly readable' },
  { value: 'Open Sans', label: 'Open Sans', description: 'Friendly, approachable sans-serif' },
  { value: 'Lato', label: 'Lato', description: 'Humanist sans-serif with warmth' },
  { value: 'Montserrat', label: 'Montserrat', description: 'Geometric sans-serif, modern' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', description: 'Adobe font, professional' }
]

export function CompanyBranding({ companyId, onSave }: CompanyBrandingProps) {
  const [formData, setFormData] = useState<Partial<CompanyData>>({})
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const queryClient = useQueryClient()

  // Load company data
  const { data: company, isLoading } = useQuery({
    queryKey: ['company', companyId],
    queryFn: () => apiService.getCompany(companyId),
    enabled: !!companyId
  })

  // Update form data when company data loads
  useEffect(() => {
    if (company) {
      setFormData({
        name: company.name,
        logoUrl: company.logoUrl,
        primaryColor: company.primaryColor || '#009688',
        secondaryColor: company.secondaryColor || '#1565c0',
        fontFamily: company.fontFamily || 'Inter',
        website: company.website,
        email: company.email,
        phone: company.phone,
        address: company.address,
        city: company.city,
        state: company.state,
        postalCode: company.postalCode,
        invoiceTemplate: company.invoiceTemplate || 'modern',
        invoiceFooter: company.invoiceFooter,
        invoiceTerms: company.invoiceTerms,
        showLogo: company.showLogo !== false,
        showWebsite: company.showWebsite !== false,
        showAddress: company.showAddress !== false
      })
    }
  }, [company])

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)
      setSuccess(false)

      await apiService.updateCompany(companyId, formData)
      
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['company', companyId] })
      await queryClient.invalidateQueries({ queryKey: ['companies'] })
      
      setSuccess(true)
      onSave?.()
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save branding settings')
    } finally {
      setSaving(false)
    }
  }

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // In a real implementation, you would upload to a file storage service
    // For now, we'll simulate with a data URL
    const reader = new FileReader()
    reader.onload = (e) => {
      const result = e.target?.result as string
      setFormData(prev => ({ ...prev, logoUrl: result }))
    }
    reader.readAsDataURL(file)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Company Branding</h2>
          <p className="text-gray-600">Customize your company's visual identity and invoice templates</p>
        </div>
        <div className="flex items-center gap-2">
          {success && (
            <Badge variant="outline" className="text-green-600 border-green-600">
              <CheckCircle className="w-3 h-3 mr-1" />
              Saved
            </Badge>
          )}
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Identity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5" />
              Visual Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Logo Upload */}
            <div>
              <Label>Company Logo</Label>
              <div className="mt-2 space-y-3">
                {formData.logoUrl && (
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <img 
                      src={formData.logoUrl} 
                      alt="Company logo" 
                      className="w-12 h-12 object-contain"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">Current Logo</div>
                      <div className="text-xs text-gray-500">Click to change</div>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <Button variant="outline" asChild>
                    <label htmlFor="logo-upload" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      {formData.logoUrl ? 'Change Logo' : 'Upload Logo'}
                    </label>
                  </Button>
                  <Switch
                    checked={formData.showLogo}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showLogo: checked }))}
                  />
                  <Label className="text-sm">Show on invoices</Label>
                </div>
              </div>
            </div>

            {/* Color Scheme */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Primary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    className="w-10 h-10 rounded border"
                  />
                  <Input
                    value={formData.primaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                    placeholder="#009688"
                    className="flex-1"
                  />
                </div>
              </div>
              <div>
                <Label>Secondary Color</Label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    className="w-10 h-10 rounded border"
                  />
                  <Input
                    value={formData.secondaryColor}
                    onChange={(e) => setFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                    placeholder="#1565c0"
                    className="flex-1"
                  />
                </div>
              </div>
            </div>

            {/* Font Family */}
            <div>
              <Label>Font Family</Label>
              <Select 
                value={formData.fontFamily} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, fontFamily: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((font) => (
                    <SelectItem key={font.value} value={font.value}>
                      <div>
                        <div className="font-medium">{font.label}</div>
                        <div className="text-xs text-gray-500">{font.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Company Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Basic Info */}
            <div>
              <Label>Company Name</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Your Company Name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Website</Label>
                <Input
                  value={formData.website || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="https://yourcompany.com"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.showWebsite}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showWebsite: checked }))}
                />
                <Label className="text-sm">Show on invoices</Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Email</Label>
                <Input
                  value={formData.email || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="contact@yourcompany.com"
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={formData.phone || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <Label>Address</Label>
              <div className="space-y-2">
                <Input
                  value={formData.address || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Street Address"
                />
                <div className="grid grid-cols-3 gap-2">
                  <Input
                    value={formData.city || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                    placeholder="City"
                  />
                  <Input
                    value={formData.state || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                    placeholder="State"
                  />
                  <Input
                    value={formData.postalCode || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, postalCode: e.target.value }))}
                    placeholder="ZIP Code"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.showAddress}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, showAddress: checked }))}
                  />
                  <Label className="text-sm">Show address on invoices</Label>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Invoice Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5" />
              Invoice Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Template Style</Label>
              <Select 
                value={formData.invoiceTemplate} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, invoiceTemplate: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TEMPLATE_OPTIONS.map((template) => (
                    <SelectItem key={template.value} value={template.value}>
                      <div>
                        <div className="font-medium">{template.label}</div>
                        <div className="text-xs text-gray-500">{template.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Invoice Footer</Label>
              <Textarea
                value={formData.invoiceFooter || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceFooter: e.target.value }))}
                placeholder="Thank you for your business!"
                rows={3}
              />
            </div>

            <div>
              <Label>Payment Terms</Label>
              <Textarea
                value={formData.invoiceTerms || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, invoiceTerms: e.target.value }))}
                placeholder="Payment is due within 30 days of invoice date."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg p-4 bg-white">
              <div className="space-y-3">
                {/* Logo Preview */}
                {formData.logoUrl && formData.showLogo && (
                  <div className="flex items-center gap-3">
                    <img 
                      src={formData.logoUrl} 
                      alt="Logo preview" 
                      className="w-8 h-8 object-contain"
                    />
                    <div className="font-semibold" style={{ color: formData.primaryColor }}>
                      {formData.name || 'Your Company'}
                    </div>
                  </div>
                )}
                
                {/* Company Info Preview */}
                <div className="text-sm text-gray-600 space-y-1">
                  {formData.showWebsite && formData.website && (
                    <div>{formData.website}</div>
                  )}
                  {formData.showAddress && formData.address && (
                    <div>
                      {formData.address}
                      {formData.city && `, ${formData.city}`}
                      {formData.state && `, ${formData.state}`}
                      {formData.postalCode && ` ${formData.postalCode}`}
                    </div>
                  )}
                  {formData.email && <div>{formData.email}</div>}
                  {formData.phone && <div>{formData.phone}</div>}
                </div>

                {/* Template Preview */}
                <div className="pt-3 border-t">
                  <div className="text-xs text-gray-500 mb-2">Template: {formData.invoiceTemplate}</div>
                  <div className="text-sm" style={{ fontFamily: formData.fontFamily }}>
                    Sample invoice content with {formData.fontFamily} font
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
