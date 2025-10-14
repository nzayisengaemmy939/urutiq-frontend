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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { 
  BarChart3, 
  Plus, 
  RefreshCw, 
  Eye, 
  Edit, 
  Download, 
  Share2, 
  Settings,
  FileText,
  PieChart,
  LineChart,
  Table as TableIcon,
  Filter,
  SortAsc,
  Group,
  Palette,
  Layout,
  Play,
  Calendar,
  Users,
  Database,
  Zap
} from 'lucide-react'
import { toast } from 'sonner'
import { useDemoAuth } from '@/hooks/useDemoAuth'

interface Company {
  id: string
  name: string
  currency: string
}

interface ReportTemplate {
  id: string
  name: string
  description: string
  category: 'FINANCIAL' | 'OPERATIONAL' | 'COMPLIANCE' | 'CUSTOM'
  isPublic: boolean
  createdBy: string
  createdAt: string
  updatedAt: string
}

interface DataSource {
  id: string
  name: string
  type: 'TABLE' | 'VIEW' | 'QUERY' | 'API'
  description: string
  fields: DataSourceField[]
  isActive: boolean
}

interface DataSourceField {
  name: string
  label: string
  dataType: 'TEXT' | 'NUMBER' | 'CURRENCY' | 'DATE' | 'BOOLEAN' | 'PERCENTAGE'
  isRequired: boolean
  isFilterable: boolean
  isGroupable: boolean
  isSortable: boolean
  description?: string
}

interface CustomReport {
  id: string
  companyId: string
  name: string
  description?: string
  templateId?: string
  isPublic: boolean
  isScheduled: boolean
  createdBy: string
  lastRunAt?: string
  createdAt: string
  updatedAt: string
}

interface ReportData {
  columns: string[]
  rows: any[]
  summary: {
    totalRows: number
    totalColumns: number
    generatedAt: string
    executionTime: number
  }
}

export default function CustomReportBuilderPage() {
  const { ready: authReady } = useDemoAuth('custom-report-builder-page')
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [templates, setTemplates] = useState<ReportTemplate[]>([])
  const [dataSources, setDataSources] = useState<DataSource[]>([])
  const [reports, setReports] = useState<CustomReport[]>([])
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('templates')
  
  // Dialog states
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [reportDialogOpen, setReportDialogOpen] = useState(false)
  const [builderDialogOpen, setBuilderDialogOpen] = useState(false)

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

  // Load data when company changes
  useEffect(() => {
    if (selectedCompany) {
      loadAllData()
    }
  }, [selectedCompany])

  const loadAllData = async () => {
    if (!selectedCompany) return
    
    setLoading(true)
    try {
      await Promise.all([
        loadTemplates(),
        loadDataSources(),
        loadReports()
      ])
    } catch (error) {
      console.error('Error loading data:', error)
      toast.error('Failed to load report builder data')
    } finally {
      setLoading(false)
    }
  }

  const loadTemplates = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/custom-report-builder/${selectedCompany}/templates`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setTemplates(data.data || [])
  }

  const loadDataSources = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/custom-report-builder/${selectedCompany}/data-sources`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setDataSources(data.data || [])
  }

  const loadReports = async () => {
    const API = process.env.NEXT_PUBLIC_API_URL || ''
    const response = await fetch(`${API}/api/custom-report-builder/${selectedCompany}/reports`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
        'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
      }
    })
    const data = await response.json()
    setReports(data.data || [])
  }

  const generateReport = async (reportId: string) => {
    setLoading(true)
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await fetch(`${API}/api/custom-report-builder/${selectedCompany}/reports/${reportId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        },
        body: JSON.stringify({ parameters: {} })
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const data = await response.json()
      setReportData(data.data)
      toast.success('Report generated successfully')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate report')
    } finally {
      setLoading(false)
    }
  }

  const exportReport = async (reportId: string, format: 'PDF' | 'EXCEL' | 'CSV' | 'HTML') => {
    try {
      const API = process.env.NEXT_PUBLIC_API_URL || ''
      const response = await fetch(`${API}/api/custom-report-builder/${selectedCompany}/reports/${reportId}/export`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo'
        },
        body: JSON.stringify({ format })
      })

      if (!response.ok) {
        throw new Error('Failed to export report')
      }

      const data = await response.json()
      toast.success(`Report exported as ${format}`)
      // In a real app, you'd handle the download URL
    } catch (error) {
      console.error('Error exporting report:', error)
      toast.error('Failed to export report')
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'FINANCIAL': return 'bg-blue-100 text-blue-800'
      case 'OPERATIONAL': return 'bg-green-100 text-green-800'
      case 'COMPLIANCE': return 'bg-red-100 text-red-800'
      case 'CUSTOM': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDataTypeIcon = (dataType: string) => {
    switch (dataType) {
      case 'TEXT': return <FileText className="h-4 w-4" />
      case 'NUMBER': return <BarChart3 className="h-4 w-4" />
      case 'CURRENCY': return <BarChart3 className="h-4 w-4" />
      case 'DATE': return <Calendar className="h-4 w-4" />
      case 'BOOLEAN': return <Zap className="h-4 w-4" />
      case 'PERCENTAGE': return <BarChart3 className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  if (!authReady) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">Loading custom report builder...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Custom Report Builder</h1>
          <p className="text-muted-foreground">Create, customize, and schedule custom reports</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAllData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Dialog open={builderDialogOpen} onOpenChange={setBuilderDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Report
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Report Builder</DialogTitle>
                <DialogDescription>
                  Create a new custom report with drag-and-drop interface
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input id="report-name" placeholder="Enter report name" />
                  </div>
                  <div>
                    <Label htmlFor="data-source">Data Source</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select data source" />
                      </SelectTrigger>
                      <SelectContent>
                        {dataSources.map((ds) => (
                          <SelectItem key={ds.id} value={ds.id}>
                            {ds.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="h-96 border rounded-lg bg-gray-50 flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-500">Drag and drop components here to build your report</p>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setBuilderDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => setBuilderDialogOpen(false)}>
                    Create Report
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
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
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="reports">My Reports</TabsTrigger>
          <TabsTrigger value="data-sources">Data Sources</TabsTrigger>
          <TabsTrigger value="builder">Report Builder</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Report Templates</h3>
            <Dialog open={templateDialogOpen} onOpenChange={setTemplateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Template
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Report Template</DialogTitle>
                  <DialogDescription>
                    Create a reusable report template
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input id="template-name" placeholder="Enter template name" />
                  </div>
                  <div>
                    <Label htmlFor="template-description">Description</Label>
                    <Textarea id="template-description" placeholder="Enter template description" />
                  </div>
                  <div>
                    <Label htmlFor="template-category">Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="FINANCIAL">Financial</SelectItem>
                        <SelectItem value="OPERATIONAL">Operational</SelectItem>
                        <SelectItem value="COMPLIANCE">Compliance</SelectItem>
                        <SelectItem value="CUSTOM">Custom</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setTemplateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setTemplateDialogOpen(false)}>
                      Create Template
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{template.name}</span>
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created by:</span>
                      <span className="text-sm font-medium">{template.createdBy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Public:</span>
                      <Badge variant={template.isPublic ? 'default' : 'secondary'}>
                        {template.isPublic ? 'Yes' : 'No'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Created:</span>
                      <span className="text-sm font-medium">
                        {new Date(template.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Eye className="h-4 w-4 mr-2" />
                      Preview
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Plus className="h-4 w-4 mr-2" />
                      Use
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Reports Tab */}
        <TabsContent value="reports" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">My Reports</h3>
            <Dialog open={reportDialogOpen} onOpenChange={setReportDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Report
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Custom Report</DialogTitle>
                  <DialogDescription>
                    Create a new custom report from scratch
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="report-name">Report Name</Label>
                    <Input id="report-name" placeholder="Enter report name" />
                  </div>
                  <div>
                    <Label htmlFor="report-description">Description</Label>
                    <Textarea id="report-description" placeholder="Enter report description" />
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setReportDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setReportDialogOpen(false)}>
                      Create Report
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report) => (
                    <TableRow key={report.id}>
                      <TableCell className="font-medium">{report.name}</TableCell>
                      <TableCell>{report.description || 'No description'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Badge variant={report.isPublic ? 'default' : 'secondary'}>
                            {report.isPublic ? 'Public' : 'Private'}
                          </Badge>
                          {report.isScheduled && (
                            <Badge variant="outline">
                              <Calendar className="h-3 w-3 mr-1" />
                              Scheduled
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {report.lastRunAt 
                          ? new Date(report.lastRunAt).toLocaleDateString()
                          : 'Never'
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" onClick={() => generateReport(report.id)}>
                            <Play className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => exportReport(report.id, 'PDF')}>
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm">
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Sources Tab */}
        <TabsContent value="data-sources" className="space-y-4">
          <h3 className="text-lg font-semibold">Data Sources</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dataSources.map((dataSource) => (
              <Card key={dataSource.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    {dataSource.name}
                  </CardTitle>
                  <CardDescription>{dataSource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Type:</span>
                      <span className="text-sm font-medium">{dataSource.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Fields:</span>
                      <span className="text-sm font-medium">{dataSource.fields.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant={dataSource.isActive ? 'default' : 'secondary'}>
                        {dataSource.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Available Fields</h4>
                    <div className="space-y-1 max-h-32 overflow-y-auto">
                      {dataSource.fields.map((field, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {getDataTypeIcon(field.dataType)}
                          <span>{field.label}</span>
                          <Badge variant="outline" className="text-xs">
                            {field.dataType}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Report Builder Tab */}
        <TabsContent value="builder" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Drag & Drop Report Builder</CardTitle>
              <CardDescription>Build custom reports with an intuitive drag-and-drop interface</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Components Palette */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Components</h4>
                  <div className="space-y-2">
                    <div className="p-3 border rounded-lg cursor-move hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <TableIcon className="h-4 w-4" />
                        <span className="text-sm">Data Table</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg cursor-move hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4" />
                        <span className="text-sm">Bar Chart</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg cursor-move hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <LineChart className="h-4 w-4" />
                        <span className="text-sm">Line Chart</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg cursor-move hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <PieChart className="h-4 w-4" />
                        <span className="text-sm">Pie Chart</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg cursor-move hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <span className="text-sm">Filter</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg cursor-move hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <SortAsc className="h-4 w-4" />
                        <span className="text-sm">Sort</span>
                      </div>
                    </div>
                    <div className="p-3 border rounded-lg cursor-move hover:bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Group className="h-4 w-4" />
                        <span className="text-sm">Group</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Report Canvas */}
                <div className="lg:col-span-2">
                  <h4 className="font-semibold mb-4">Report Canvas</h4>
                  <div className="h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 flex items-center justify-center">
                    <div className="text-center">
                      <Layout className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-500">Drag components here to build your report</p>
                    </div>
                  </div>
                </div>

                {/* Properties Panel */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Properties</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="report-title">Report Title</Label>
                      <Input id="report-title" placeholder="Enter title" />
                    </div>
                    <div>
                      <Label htmlFor="data-source">Data Source</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select data source" />
                        </SelectTrigger>
                        <SelectContent>
                          {dataSources.map((ds) => (
                            <SelectItem key={ds.id} value={ds.id}>
                              {ds.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="page-size">Page Size</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select page size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4</SelectItem>
                          <SelectItem value="LETTER">Letter</SelectItem>
                          <SelectItem value="LEGAL">Legal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="orientation">Orientation</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select orientation" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PORTRAIT">Portrait</SelectItem>
                          <SelectItem value="LANDSCAPE">Landscape</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Data Display */}
      {reportData && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Report Data</CardTitle>
            <CardDescription>
              Generated in {reportData.summary.executionTime}ms • {reportData.summary.totalRows} rows • {reportData.summary.totalColumns} columns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  {reportData.columns.map((column, index) => (
                    <TableHead key={index}>{column}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {reportData.rows.map((row, index) => (
                  <TableRow key={index}>
                    {reportData.columns.map((column, colIndex) => (
                      <TableCell key={colIndex}>
                        {column === 'amount' ? formatCurrency(row[column]) : row[column]}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
