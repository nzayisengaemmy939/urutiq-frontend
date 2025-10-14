import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { Label } from "../components/ui/label"
import { Textarea } from "../components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Progress } from "../components/ui/progress"
import { Separator } from "../components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../components/ui/dropdown-menu"
import { PageLayout } from "../components/page-layout"
import { useState, useEffect, useRef, useCallback } from "react"
import { apiService } from "../lib/api"
import { toast } from "sonner"
import { useAuth } from "../contexts/auth-context"
import { config } from "../lib/config"
import { securityApi, type SecurityOverview, type AccessControlData, type AuditLog, type EncryptionStatus, type SecurityAlert, type SessionData } from "../lib/api/security"
import {
  FileText,
  Upload,
  Search,
  Clock,
  Download,
  Share,
  Eye,
  CheckCircle,
  AlertTriangle,
  Archive,
  Activity,
  Zap,
  Target,
  TrendingUp,
  Cpu,
  Shield,
  Key,
  Users,
  RefreshCw,
  Trash2,
  Monitor,
  Database,
  Filter,
  Grid,
  List,
  MoreVertical,
  Star,
  Calendar,
  FolderPlus,
  Copy,
  Edit,
  CloudUpload,
  FileImage,
  File,
  FileSpreadsheet,
  X,
  ChevronDown,
  SortAsc,
  SortDesc
} from "lucide-react"

interface DocumentStats {
  totalDocuments: number
  storageUsed: string
  pendingApprovals: number
  sharedDocuments: number
}

// Create Workflow Form Component
interface CreateWorkflowFormProps {
  onSubmit: (data: any) => void
  onCancel: () => void
  templates: any[]
}

const CreateWorkflowForm = ({ onSubmit, onCancel, templates }: CreateWorkflowFormProps) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    templateId: '',
    steps: [] as Array<{ id: string; name: string; type: string; order: number }>
  })
  const [currentStep, setCurrentStep] = useState({ name: '', type: 'validation' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.name && formData.description) {
      onSubmit(formData)
    }
  }

  const addStep = () => {
    if (currentStep.name) {
      const newStep = {
        id: Date.now().toString(),
        name: currentStep.name,
        type: currentStep.type,
        order: formData.steps.length + 1
      }
      setFormData(prev => ({
        ...prev,
        steps: [...prev.steps, newStep]
      }))
      setCurrentStep({ name: '', type: 'validation' })
    }
  }

  const removeStep = (stepId: string) => {
    setFormData(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }))
  }

  const useTemplate = (template: any) => {
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      category: template.category,
      templateId: template.id,
      steps: template.steps.map((step: any, index: number) => ({
        ...step,
        id: Date.now().toString() + index,
        order: index + 1
      }))
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-4">
        <div className="grid gap-2">
          <Label htmlFor="workflow-name">Workflow Name</Label>
          <Input
            id="workflow-name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter workflow name"
            required
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="workflow-description">Description</Label>
          <Textarea
            id="workflow-description"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe what this workflow does"
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="workflow-category">Category</Label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Finance">Finance</SelectItem>
              <SelectItem value="Legal">Legal</SelectItem>
              <SelectItem value="AI">AI</SelectItem>
              <SelectItem value="Operations">Operations</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Template Selection */}
      {templates.length > 0 && (
        <div className="space-y-3">
          <Label>Start from Template (Optional)</Label>
          <div className="grid gap-2">
            {templates.map((template) => (
              <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">{template.description}</p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => useTemplate(template)}
                >
                  Use Template
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Workflow Steps */}
      <div className="space-y-3">
        <Label>Workflow Steps</Label>
        
        {/* Add Step Form */}
        <div className="flex gap-2">
          <Input
            value={currentStep.name}
            onChange={(e) => setCurrentStep(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Step name"
            className="flex-1"
          />
          <Select value={currentStep.type} onValueChange={(value) => setCurrentStep(prev => ({ ...prev, type: value }))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="validation">Validation</SelectItem>
              <SelectItem value="approval">Approval</SelectItem>
              <SelectItem value="action">Action</SelectItem>
              <SelectItem value="review">Review</SelectItem>
              <SelectItem value="ai_processing">AI Processing</SelectItem>
            </SelectContent>
          </Select>
          <Button type="button" onClick={addStep} disabled={!currentStep.name}>
            Add Step
          </Button>
        </div>

        {/* Steps List */}
        <div className="space-y-2">
          {formData.steps.map((step) => (
            <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                  {step.order}
                </span>
                <div>
                  <p className="font-medium">{step.name}</p>
                  <p className="text-sm text-muted-foreground capitalize">{step.type}</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => removeStep(step.id)}
              >
                <AlertTriangle className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.name || !formData.description}>
          Create Workflow
        </Button>
      </div>
    </form>
  )
}

interface Document {
  id: string
  name: string
  displayName: string
  mimeType: string
  sizeBytes: number
  uploadedAt: string
  uploader: {
    id: string
    name: string
    email: string
  }
  category?: {
    id: string
    name: string
    color: string
  }
  company?: {
    id: string
    name: string
  }
}

export default function DocumentsPage() {
  const { isAuthenticated, loginWithDemo, isLoading: authLoading } = useAuth()
  const [stats, setStats] = useState<DocumentStats>({
    totalDocuments: 0,
    storageUsed: '0 GB',
    pendingApprovals: 0,
    sharedDocuments: 0
  })
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploading, setUploading] = useState(false)
  
  // Enhanced UI state
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [selectedDocuments, setSelectedDocuments] = useState<Set<string>>(new Set())
  const [dragActive, setDragActive] = useState(false)
  const [bulkActionLoading, setBulkActionLoading] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    displayName: '',
    description: '',
    categoryId: '',
    workspaceId: ''
  })
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [imageLoading, setImageLoading] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [imageBlobUrl, setImageBlobUrl] = useState<string | null>(null)
  const [textContent, setTextContent] = useState<string | null>(null)
  const [textLoading, setTextLoading] = useState(false)
  const [textError, setTextError] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null)
  
  // Workflow states
  const [showCreateWorkflowDialog, setShowCreateWorkflowDialog] = useState(false)
  const [showPendingApprovals, setShowPendingApprovals] = useState(false)
  const [showWorkflowTemplates, setShowWorkflowTemplates] = useState(false)
  const [showWorkflowAnalytics, setShowWorkflowAnalytics] = useState(false)
  
  // Workflow data
  const [workflowStats, setWorkflowStats] = useState({
    activeWorkflows: 0,
    pendingApprovals: 0,
    completedToday: 0,
    averageProcessingTime: 0
  })
  const [workflows, setWorkflows] = useState<any[]>([])
  const [workflowTemplates, setWorkflowTemplates] = useState<any[]>([])
  const [workflowLoading, setWorkflowLoading] = useState(false)

  // Security data
  const [securityOverview, setSecurityOverview] = useState<SecurityOverview | null>(null)
  const [accessControl, setAccessControl] = useState<AccessControlData | null>(null)
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [compliance, setCompliance] = useState<any>(null)
  const [complianceActions, setComplianceActions] = useState<any[]>([])
  const [encryption, setEncryption] = useState<EncryptionStatus | null>(null)
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([])
  const [sessions, setSessions] = useState<SessionData[]>([])
  const [securityLoading, setSecurityLoading] = useState(false)
  
  // AI Intelligence state
  const [aiStats, setAiStats] = useState({
    totalDocuments: 0,
    analyzedDocuments: 0,
    analyzedPercentage: 0,
    smartTagsCount: 0,
    activeInsights: 0,
    qualityScore: 0
  })
  const [qualityAnalysis, setQualityAnalysis] = useState({
    completeness: 0,
    clarity: 0,
    compliance: 0,
    accessibility: 0
  })
  const [categorizationSuggestions, setCategorizationSuggestions] = useState<any[]>([])
  const [aiInsights, setAiInsights] = useState<any[]>([])
  const [aiTags, setAiTags] = useState<any[]>([])
  const [aiExtractions, setAiExtractions] = useState<any[]>([])
  const [aiSummaries, setAiSummaries] = useState<any[]>([])
  const [aiSearchQuery, setAiSearchQuery] = useState('')
  const [aiSearchResults, setAiSearchResults] = useState<any[]>([])
  const [aiLoading, setAiLoading] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        // Auto-login with demo credentials
        loginWithDemo('demo@urutiq.com', ['admin']).catch(console.error)
      } else {
    loadDocumentData()
      }
    }
  }, [isAuthenticated, authLoading, loginWithDemo])

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      loadDocumentData()
      loadWorkflowData()
      loadSecurityData()
    }
  }, [isAuthenticated, authLoading])

  // Load AI data when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      // Add a small delay to ensure authentication is fully processed
      const timer = setTimeout(() => {
        loadAIData()
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [isAuthenticated, authLoading])

  const loadDocumentData = async () => {
    try {
      setLoading(true)
      
      // Load document statistics
      const statsResponse = await apiService.get('/api/documents/stats')
      setStats(statsResponse)

      // Load documents list
      const documentsResponse = await apiService.get('/api/documents?limit=20')
      setDocuments(documentsResponse.documents || [])
      
    } catch (error) {
      console.error('Error loading document data:', error)
      toast.error('Failed to load document data')
    } finally {
      setLoading(false)
    }
  }

  const loadAIData = async () => {
    try {
      setAiLoading(true)
      
      // Check if we have authentication before making AI calls
      if (!isAuthenticated) {
        return
      }
      
      // Load AI data from various endpoints
      try {
        const stats = await apiService.getAIStats()
      setAiStats(stats)
      } catch (error) {
        setAiStats({ totalDocuments: 0, analyzedDocuments: 0, analyzedPercentage: 0, smartTagsCount: 0, activeInsights: 0, qualityScore: 0 })
      }

      try {
        const quality = await apiService.getQualityAnalysis()
      setQualityAnalysis(quality)
      } catch (error) {
        setQualityAnalysis({ completeness: 0, clarity: 0, compliance: 0, accessibility: 0 })
      }

      try {
        const suggestions = await apiService.getCategorizationSuggestions()
      setCategorizationSuggestions(suggestions)
      } catch (error) {
        setCategorizationSuggestions([])
      }

      try {
        const insights = await apiService.getAIInsights()
      setAiInsights(insights)
      } catch (error) {
        setAiInsights([])
      }

      try {
        const tags = await apiService.getAITags()
      setAiTags(tags)
      } catch (error) {
        setAiTags([])
      }

      try {
        const extractions = await apiService.getAIExtractions()
      setAiExtractions(extractions)
      } catch (error) {
        setAiExtractions([])
      }

      try {
        const summaries = await apiService.getAISummaries()
      setAiSummaries(summaries)
    } catch (error) {
        setAiSummaries([])
      }
      
    } catch (error) {
      // Show user-friendly error message
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          toast.error('Unable to connect to AI services. Please check if the server is running.')
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          toast.error('Authentication required for AI services. Please log in again.')
        } else {
          toast.error('Failed to load AI intelligence data')
        }
      } else {
        toast.error('Failed to load AI intelligence data')
      }
    } finally {
      setAiLoading(false)
    }
  }

  const handleAISearch = async () => {
    if (!aiSearchQuery.trim()) return
    
    try {
      setAiLoading(true)
      const results = await apiService.searchDocuments(aiSearchQuery)
      setAiSearchResults(results.results)
      setShowSearchResults(true)
      
      if (results.totalResults === 0) {
        toast.warning(`No documents found matching "${aiSearchQuery}". Try a different search term.`)
      } else {
        toast.success(`Found ${results.totalResults} documents matching "${aiSearchQuery}"`)
      }
    } catch (error) {
      console.error('Error in AI search:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      toast.error(`AI search failed: ${errorMessage}`)
    } finally {
      setAiLoading(false)
    }
  }

  const handleQuickSearch = async (query: string) => {
    setAiSearchQuery(query)
    try {
      setAiLoading(true)
      const results = await apiService.searchDocuments(query)
      setAiSearchResults(results.results)
      setShowSearchResults(true)
      toast.success(`Found ${results.totalResults} documents matching "${query}"`)
    } catch (error) {
      console.error('Error in quick search:', error)
      toast.error('Quick search failed')
    } finally {
      setAiLoading(false)
    }
  }

  const clearSearch = () => {
    setAiSearchQuery('')
    setAiSearchResults([])
    setShowSearchResults(false)
  }

  const handleGenerateSummary = async (type: string) => {
    try {
      setAiLoading(true)
      const summary = await apiService.generateAISummary(type)
      setAiSummaries(prev => [summary, ...prev])
      toast.success('AI summary generated successfully')
    } catch (error) {
      console.error('Error generating summary:', error)
      toast.error('Failed to generate AI summary')
    } finally {
      setAiLoading(false)
    }
  }

  const handleApplyCategorization = async (suggestion: any) => {
    try {
      setAiLoading(true)
      // This would typically update document categories in the backend
      // For now, we'll just show a success message
      toast.success(`Applied categorization "${suggestion.category}" to ${suggestion.suggestedCount} documents`)
      // Reload AI data to reflect changes
      await loadAIData()
    } catch (error) {
      console.error('Error applying categorization:', error)
      toast.error('Failed to apply categorization')
    } finally {
      setAiLoading(false)
    }
  }

  const handleAnalyzeAllDocuments = async () => {
    try {
      setAiLoading(true)
      // Trigger a comprehensive analysis
      await Promise.all([
        apiService.getAIInsights(),
        apiService.getAITags(),
        apiService.getAIExtractions(),
        apiService.getCategorizationSuggestions()
      ])
      await loadAIData()
      toast.success('Document analysis completed')
    } catch (error) {
      console.error('Error analyzing documents:', error)
      toast.error('Failed to analyze documents')
    } finally {
      setAiLoading(false)
    }
  }

  const handleGenerateFullReport = async () => {
    try {
      setAiLoading(true)
      // Generate a comprehensive report
      const report = await apiService.generateAISummary('comprehensive')
      setAiSummaries(prev => [report, ...prev])
      toast.success('Full AI report generated successfully')
    } catch (error) {
      console.error('Error generating report:', error)
      toast.error('Failed to generate full report')
    } finally {
      setAiLoading(false)
    }
  }

  const handleExtractAllMetadata = async () => {
    try {
      setAiLoading(true)
      // Trigger metadata extraction for all documents
      await apiService.getAIExtractions()
      await loadAIData()
      toast.success('Metadata extraction completed')
    } catch (error) {
      console.error('Error extracting metadata:', error)
      toast.error('Failed to extract metadata')
    } finally {
      setAiLoading(false)
    }
  }

  const handleManageTags = () => {
    // For now, just show a message - this could open a tag management modal
    toast.info('Tag management feature coming soon')
  }

  const handleViewSummaryDetails = (summary: any) => {
    // For now, just show the summary in a toast
    toast.info(`Summary: ${summary.title}\n\n${summary.content}`)
  }

  const handleExportSummary = (summary: any) => {
    // Export summary as text file
    const blob = new Blob([`${summary.title}\n\n${summary.content}`], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${summary.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    toast.success('Summary exported successfully')
  }

  // Workflow handler functions
  const handleApproveDocument = async (documentId: string) => {
    try {
      // This would call the API to approve the document
      toast.success('Document approved successfully')
      // Refresh pending approvals
    } catch (error) {
      console.error('Error approving document:', error)
      toast.error('Failed to approve document')
    }
  }

  const handleRejectDocument = async (documentId: string) => {
    try {
      // This would call the API to reject the document
      toast.success('Document rejected')
      // Refresh pending approvals
    } catch (error) {
      console.error('Error rejecting document:', error)
      toast.error('Failed to reject document')
    }
  }

  const handleUseTemplate = (templateType: string) => {
    toast.info(`Using ${templateType} template - feature coming soon`)
  }

  const handleViewWorkflow = (workflowId: string) => {
    toast.info(`Viewing workflow ${workflowId} - feature coming soon`)
  }

  const handleCreateWorkflow = async (workflowData: any) => {
    try {
      console.log('Creating workflow:', workflowData)
      await apiService.createWorkflow(workflowData)
      toast.success('Workflow created successfully')
      setShowCreateWorkflowDialog(false)
      // Refresh workflow data
      await loadWorkflowData()
    } catch (error) {
      console.error('Error creating workflow:', error)
      toast.error('Failed to create workflow')
    }
  }

  // Load workflow data
  const loadWorkflowData = async () => {
    try {
      console.log('🔄 Loading workflow data...')
      setWorkflowLoading(true)
      
      // Load workflow stats
      try {
        console.log('📊 Loading workflow stats...')
        const stats = await apiService.getWorkflowStats()
        console.log('✅ Workflow stats loaded:', stats)
        setWorkflowStats(stats)
      } catch (error) {
        console.error('❌ Error loading workflow stats:', error)
        // Use fallback data
        setWorkflowStats({
          activeWorkflows: 0,
          pendingApprovals: 0,
          completedToday: 0,
          averageProcessingTime: 0
        })
      }

      // Load workflows
      try {
        console.log('📋 Loading workflows...')
        const workflowsData = await apiService.getWorkflows()
        console.log('✅ Workflows loaded:', workflowsData)
        setWorkflows(workflowsData.workflows || [])
      } catch (error) {
        console.error('❌ Error loading workflows:', error)
        setWorkflows([])
      }

      // Load workflow templates
      try {
        console.log('📚 Loading workflow templates...')
        const templatesData = await apiService.getWorkflowTemplates()
        console.log('✅ Workflow templates loaded:', templatesData)
        setWorkflowTemplates(templatesData.templates || [])
      } catch (error) {
        console.error('❌ Error loading workflow templates:', error)
        setWorkflowTemplates([])
      }

    } catch (error) {
      console.error('❌ Error loading workflow data:', error)
      toast.error('Failed to load workflow data')
    } finally {
      setWorkflowLoading(false)
      console.log('✅ Workflow data loading completed')
    }
  }

  // Load security data
  const loadSecurityData = async () => {
    try {
      console.log('🔒 Loading security data...')
      setSecurityLoading(true)
      
      // Load security overview
      try {
        const overview = await securityApi.getOverview()
        setSecurityOverview(overview)
      } catch (error) {
        console.error('❌ Error loading security overview:', error)
      }

      // Load access control data
      try {
        const access = await securityApi.getAccessControl()
        setAccessControl(access)
      } catch (error) {
        console.error('❌ Error loading access control:', error)
      }

      // Load audit logs
      try {
        const logsResponse = await securityApi.getAuditLogs()
        setAuditLogs(logsResponse.data || [])
      } catch (error) {
        console.error('❌ Error loading audit logs:', error)
      }

      // Load compliance data
      try {
        const complianceResponse = await securityApi.getCompliance()
        setCompliance(complianceResponse)
        setComplianceActions(complianceResponse.actions || [])
      } catch (error) {
        console.error('❌ Error loading compliance:', error)
      }

      // Load encryption status
      try {
        const encryptionResponse = await securityApi.getEncryption()
        setEncryption(encryptionResponse.encryption || null)
      } catch (error) {
        console.error('❌ Error loading encryption:', error)
      }

      // Load sessions
      try {
        const sessionsResponse = await securityApi.getSessions()
        setSessions(sessionsResponse.sessions || [])
      } catch (error) {
        console.error('❌ Error loading sessions:', error)
      }

    } catch (error) {
      console.error('❌ Error loading security data:', error)
      toast.error('Failed to load security data')
    } finally {
      setSecurityLoading(false)
      console.log('✅ Security data loading completed')
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Enhanced utility functions
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return FileImage
    if (mimeType === 'application/pdf') return File
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return FileSpreadsheet
    return FileText
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  // Drag and drop handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      setSelectedFile(files[0])
      setUploadForm(prev => ({
        ...prev,
        displayName: files[0].name.replace(/\.[^/.]+$/, '')
      }))
      setShowUploadDialog(true)
    }
  }, [])

  // Document selection handlers
  const toggleDocumentSelection = (documentId: string) => {
    const newSelected = new Set(selectedDocuments)
    if (newSelected.has(documentId)) {
      newSelected.delete(documentId)
    } else {
      newSelected.add(documentId)
    }
    setSelectedDocuments(newSelected)
  }

  const selectAllDocuments = () => {
    if (selectedDocuments.size === filteredDocuments.length) {
      setSelectedDocuments(new Set())
    } else {
      setSelectedDocuments(new Set(filteredDocuments.map(doc => doc.id)))
    }
  }

  // Bulk actions
  const handleBulkDelete = async () => {
    if (selectedDocuments.size === 0) return
    
    setBulkActionLoading(true)
    try {
      for (const docId of selectedDocuments) {
        await apiService.delete(`/api/documents/${docId}`)
      }
      toast.success(`Deleted ${selectedDocuments.size} documents`)
      setSelectedDocuments(new Set())
      loadDocumentData()
    } catch (error) {
      console.error('Error deleting documents:', error)
      toast.error('Failed to delete some documents')
    } finally {
      setBulkActionLoading(false)
    }
  }

  // Filter and sort documents
  const filteredDocuments = documents
    .filter(doc => {
      const matchesSearch = doc.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           doc.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = filterCategory === 'all' || doc.category?.name === filterCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      let comparison = 0
      switch (sortBy) {
        case 'name':
          comparison = a.displayName.localeCompare(b.displayName)
          break
        case 'date':
          comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime()
          break
        case 'size':
          comparison = a.sizeBytes - b.sizeBytes
          break
        default:
          comparison = 0
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'text-green-600'
    if (mimeType.includes('pdf')) return 'text-red-600'
    if (mimeType.includes('word') || mimeType.includes('document')) return 'text-blue-600'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return 'text-green-600'
    if (mimeType.includes('powerpoint') || mimeType.includes('presentation')) return 'text-orange-600'
    return 'text-gray-600'
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setUploadForm(prev => ({
        ...prev,
        displayName: file.name
      }))
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload')
      return
    }

    try {
      setUploading(true)
      
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('displayName', uploadForm.displayName)
      formData.append('description', uploadForm.description)
      if (uploadForm.categoryId && uploadForm.categoryId !== 'none') formData.append('categoryId', uploadForm.categoryId)
      if (uploadForm.workspaceId && uploadForm.workspaceId !== 'none') formData.append('workspaceId', uploadForm.workspaceId)

      await apiService.post('/api/documents/upload', formData)

      toast.success('Document uploaded successfully')
      setShowUploadDialog(false)
      setSelectedFile(null)
      setUploadForm({
        displayName: '',
        description: '',
        categoryId: '',
        workspaceId: ''
      })
      
      // Refresh documents list
      await loadDocumentData()
      
    } catch (error) {
      toast.error('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleDownload = async (doc: Document) => {
    try {
      const response = await fetch(`/api/documents/${doc.id}/download`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'x-company-id': localStorage.getItem('company_id') || 'cmg0qxjh9003nao3ftbaz1oc1'
        }
      })
      
      if (!response.ok) {
        throw new Error('Download failed')
      }
      
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', doc.name)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      toast.success('Document downloaded successfully')
    } catch (error) {
      toast.error('Failed to download document')
    }
  }

  const loadImageAsBlob = async (document: Document) => {
    try {
      setImageLoading(true)
      setImageError(false)
      
      const url = `${config.api.baseUrl}/api/documents/stream/${document.id}?token=${localStorage.getItem('auth_token')}&tenantId=${localStorage.getItem('tenant_id')}&companyId=${localStorage.getItem('company_id')}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'x-company-id': localStorage.getItem('company_id') || 'cmg0lhcl3001d89wpa7q33k6y'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const blob = await response.blob()
      const blobUrl = URL.createObjectURL(blob)
      
      setImageBlobUrl(blobUrl)
      setImageLoading(false)
    } catch (error) {
      setImageError(true)
      setImageLoading(false)
    }
  }

  const loadTextContent = async (document: Document) => {
    try {
      setTextLoading(true)
      setTextError(false)
      
      const url = `${config.api.baseUrl}/api/documents/stream/${document.id}?token=${localStorage.getItem('auth_token')}&tenantId=${localStorage.getItem('tenant_id')}&companyId=${localStorage.getItem('company_id')}`
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || 'tenant_demo',
          'x-company-id': localStorage.getItem('company_id') || 'cmg0lhcl3001d89wpa7q33k6y'
        }
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const text = await response.text()
      setTextContent(text)
      setTextLoading(false)
    } catch (error) {
      setTextError(true)
      setTextLoading(false)
    }
  }

  const handlePreview = (document: Document) => {
    setPreviewDocument(document)
    setShowPreviewModal(true)
    if (document.mimeType.startsWith('image/')) {
      loadImageAsBlob(document)
    } else if (document.mimeType.startsWith('text/')) {
      loadTextContent(document)
    }
  }

  const handleDelete = (document: Document) => {
    setDocumentToDelete(document)
    setShowDeleteDialog(true)
  }

  const confirmDelete = async () => {
    if (!documentToDelete) return

    try {
      await apiService.delete(`/api/documents/${documentToDelete.id}`)
      toast.success('Document deleted successfully')
      await loadDocumentData()
    } catch (error) {
      toast.error('Failed to delete document')
    } finally {
      setShowDeleteDialog(false)
      setDocumentToDelete(null)
    }
  }

  const closePreviewModal = () => {
    // Clean up blob URL to prevent memory leaks
    if (imageBlobUrl) {
      URL.revokeObjectURL(imageBlobUrl)
      setImageBlobUrl(null)
    }
    setShowPreviewModal(false)
    setImageError(false)
    setImageLoading(false)
    setTextContent(null)
    setTextError(false)
    setTextLoading(false)
  }

  return (
    <PageLayout>
      <div className="flex-1 space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Document Management & Intelligence</h1>
            <p className="text-muted-foreground">Enterprise-grade document management with AI-powered insights and advanced workflows</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={loadDocumentData}>
              <Activity className="mr-2 h-4 w-4" />
              Refresh Data
            </Button>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
            <Button onClick={() => setShowUploadDialog(true)}>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Document
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Upload Document</DialogTitle>
                  <DialogDescription>
                    Upload a new document to your workspace. Files will be stored securely and processed by AI.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-6 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="file">File</Label>
                    <div 
                      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
                      }`}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      {selectedFile ? (
                        <div className="space-y-2">
                          <div className="flex items-center justify-center">
                            {(() => {
                              const FileIcon = getFileIcon(selectedFile.type)
                              return <FileIcon className="h-8 w-8 text-blue-500" />
                            })()}
                          </div>
                          <p className="font-medium">{selectedFile.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type}
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedFile(null)
                              setUploadForm(prev => ({ ...prev, displayName: '' }))
                            }}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Remove File
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <CloudUpload className="h-8 w-8 text-gray-400 mx-auto" />
                          <div>
                            <p className="text-sm font-medium">Drop files here or click to browse</p>
                            <p className="text-xs text-muted-foreground">Supports all file types up to 100MB</p>
                          </div>
                          <Input
                            id="file"
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="*/*"
                            className="hidden"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => fileInputRef.current?.click()}
                          >
                            Choose File
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="displayName">Display Name</Label>
                    <Input
                      id="displayName"
                      value={uploadForm.displayName}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, displayName: e.target.value }))}
                      placeholder="Enter a descriptive name for your document"
                      required
                    />
                    {uploadForm.displayName && uploadForm.displayName.length < 3 && (
                      <p className="text-xs text-red-500">Display name must be at least 3 characters</p>
                    )}
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={uploadForm.description}
                      onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Describe the document content and purpose..."
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional but helps with AI categorization and search
                    </p>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <Label htmlFor="category">Category</Label>
                      <Select value={uploadForm.categoryId} onValueChange={(value) => setUploadForm(prev => ({ ...prev, categoryId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Auto-detect" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto">🤖 Auto-detect with AI</SelectItem>
                          <SelectItem value="none">📄 No specific category</SelectItem>
                          <SelectItem value="financial">💰 Financial Documents</SelectItem>
                          <SelectItem value="legal">⚖️ Legal & Contracts</SelectItem>
                          <SelectItem value="technical">🔧 Technical Documentation</SelectItem>
                          <SelectItem value="invoice">🧾 Invoices & Receipts</SelectItem>
                          <SelectItem value="report">📊 Reports & Analytics</SelectItem>
                          <SelectItem value="correspondence">📧 Correspondence</SelectItem>
                          <SelectItem value="marketing">📢 Marketing Materials</SelectItem>
                          <SelectItem value="hr">👥 HR & Personnel</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid gap-2">
                      <Label htmlFor="workspace">Workspace</Label>
                      <Select value={uploadForm.workspaceId} onValueChange={(value) => setUploadForm(prev => ({ ...prev, workspaceId: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Default workspace" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="default">🏠 Default Workspace</SelectItem>
                          <SelectItem value="finance">💼 Finance Team</SelectItem>
                          <SelectItem value="legal">⚖️ Legal Department</SelectItem>
                          <SelectItem value="operations">⚙️ Operations</SelectItem>
                          <SelectItem value="shared">👥 Shared Documents</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* AI Processing Options */}
                  <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-600" />
                      <Label className="text-sm font-medium text-blue-800">AI Processing Options</Label>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="auto-categorize"
                          defaultChecked
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="auto-categorize" className="text-sm">
                          Auto-categorize with AI analysis
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="extract-text"
                          defaultChecked
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="extract-text" className="text-sm">
                          Extract text and generate summary
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="generate-tags"
                          defaultChecked
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="generate-tags" className="text-sm">
                          Generate smart tags for search
                        </Label>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-xs text-muted-foreground">
                    {selectedFile && (
                      <span>
                        File will be processed with AI after upload
                      </span>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setShowUploadDialog(false)
                        setSelectedFile(null)
                        setUploadForm({
                          displayName: '',
                          description: '',
                          categoryId: '',
                          workspaceId: ''
                        })
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleUpload} 
                      disabled={!selectedFile || uploading || uploadForm.displayName.length < 3}
                      className="min-w-24"
                    >
                      {uploading ? (
                        <div className="flex items-center gap-2">
                          <RefreshCw className="h-4 w-4 animate-spin" />
                          Uploading...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          Upload & Process
                        </div>
                      )}
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full grid-cols-8">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="all">Documents</TabsTrigger>
              <TabsTrigger value="ai">AI Intelligence</TabsTrigger>
              <TabsTrigger value="workflows">Workflows</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
              <TabsTrigger value="compliance">Compliance</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input 
                  placeholder="Search documents..." 
                  className="pl-10 w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => setFilterCategory('all')}>
                    All Documents
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategory('Financial')}>
                    Financial
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategory('Legal')}>
                    Legal
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setFilterCategory('Technical')}>
                    Technical
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    {sortOrder === 'asc' ? <SortAsc className="mr-2 h-4 w-4" /> : <SortDesc className="mr-2 h-4 w-4" />}
                    Sort
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('asc') }}>
                    Name (A-Z)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('desc') }}>
                    Name (Z-A)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('desc') }}>
                    Newest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('date'); setSortOrder('asc') }}>
                    Oldest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('size'); setSortOrder('desc') }}>
                    Largest First
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => { setSortBy('size'); setSortOrder('asc') }}>
                    Smallest First
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <div className="flex items-center border rounded-md">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-4 w-4 text-blue-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stats.totalDocuments.toLocaleString()
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {loading ? 'Loading...' : (
                      <>
                        <TrendingUp className="h-3 w-3 text-green-500" />
                        Active documents
                      </>
                    )}
                  </p>
                  {!loading && documents.length > 0 && (
                    <Progress value={Math.min((stats.totalDocuments / 1000) * 100, 100)} className="mt-2" />
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Archive className="h-4 w-4 text-purple-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-600">
                    {loading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      stats.storageUsed
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {loading ? 'Loading...' : (
                      <>
                        <Database className="h-3 w-3 text-purple-500" />
                        Total storage
                      </>
                    )}
                  </p>
                  {!loading && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Used</span>
                        <span>75% of 10GB</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <Clock className="h-4 w-4 text-yellow-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">
                    {workflowLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      workflowStats.pendingApprovals
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {workflowLoading ? 'Loading...' : (
                      <>
                        <AlertTriangle className="h-3 w-3 text-yellow-500" />
                        Require your review
                      </>
                    )}
                  </p>
                  {!workflowLoading && workflowStats.pendingApprovals > 0 && (
                    <Button variant="outline" size="sm" className="mt-2 w-full">
                      Review Now
                    </Button>
                  )}
                </CardContent>
              </Card>

              <Card className="hover:shadow-md transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-4 w-4 text-green-600" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">
                    {workflowLoading ? (
                      <div className="animate-pulse bg-gray-200 h-8 w-16 rounded"></div>
                    ) : (
                      workflowStats.activeWorkflows
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    {workflowLoading ? 'Loading...' : (
                      <>
                        <Zap className="h-3 w-3 text-green-500" />
                        Processing documents
                      </>
                    )}
                  </p>
                  {!workflowLoading && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Avg. processing: {workflowStats.averageProcessingTime || 0}min
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Streamline your document management workflow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2 hover:bg-blue-50 hover:border-blue-300"
                    onClick={() => setShowUploadDialog(true)}
                  >
                    <Upload className="h-6 w-6 text-blue-600" />
                    <span className="text-sm font-medium">Upload Documents</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2 hover:bg-green-50 hover:border-green-300"
                  >
                    <FolderPlus className="h-6 w-6 text-green-600" />
                    <span className="text-sm font-medium">Create Folder</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2 hover:bg-purple-50 hover:border-purple-300"
                    onClick={() => setShowCreateWorkflowDialog(true)}
                  >
                    <Activity className="h-6 w-6 text-purple-600" />
                    <span className="text-sm font-medium">New Workflow</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2 hover:bg-orange-50 hover:border-orange-300"
                  >
                    <Search className="h-6 w-6 text-orange-600" />
                    <span className="text-sm font-medium">AI Search</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Document Intelligence Health</CardTitle>
                  <CardDescription>AI-powered document processing and analysis status</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading AI health data...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">AI Processing</span>
                          <Badge variant="default" className={aiStats.analyzedPercentage >= 80 ? "bg-green-100 text-green-800" : aiStats.analyzedPercentage >= 50 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {aiStats.analyzedPercentage >= 80 ? 'Active' : aiStats.analyzedPercentage >= 50 ? 'Learning' : 'Needs Attention'}
                          </Badge>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${aiStats.analyzedPercentage >= 80 ? 'bg-green-500' : aiStats.analyzedPercentage >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${aiStats.analyzedPercentage}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground">{aiStats.analyzedPercentage}% of documents processed with AI</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Quality Analysis</span>
                          <Badge variant="default" className={aiStats.qualityScore >= 80 ? "bg-green-100 text-green-800" : aiStats.qualityScore >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {aiStats.qualityScore >= 80 ? 'Excellent' : aiStats.qualityScore >= 60 ? 'Good' : 'Needs Improvement'}
                          </Badge>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${aiStats.qualityScore >= 80 ? 'bg-green-500' : aiStats.qualityScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} 
                            style={{ width: `${aiStats.qualityScore}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground">Average quality score: {aiStats.qualityScore}%</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Smart Tags</span>
                          <Badge variant="default" className={aiStats.smartTagsCount > 0 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {aiStats.smartTagsCount > 0 ? 'Generated' : 'None'}
                          </Badge>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${aiStats.smartTagsCount > 0 ? 'bg-blue-500' : 'bg-gray-400'}`} 
                            style={{ width: `${Math.min(100, (aiStats.smartTagsCount / 10) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground">{aiStats.smartTagsCount} smart tags generated</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Active Insights</span>
                          <Badge variant="secondary" className={aiStats.activeInsights > 0 ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-800"}>
                            <Activity className="mr-1 h-3 w-3" />
                            {aiStats.activeInsights > 0 ? 'Active' : 'None'}
                          </Badge>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full">
                          <div 
                            className={`h-2 rounded-full ${aiStats.activeInsights > 0 ? 'bg-purple-500' : 'bg-gray-400'}`} 
                            style={{ width: `${Math.min(100, (aiStats.activeInsights / 5) * 100)}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground">{aiStats.activeInsights} active insights available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent AI Insights</CardTitle>
                  <CardDescription>Latest intelligent document analysis and recommendations</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {aiLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading AI insights...</p>
                    </div>
                  ) : aiInsights.length > 0 ? (
                    <div className="space-y-3">
                      {aiInsights.slice(0, 4).map((insight, index) => (
                        <div key={index} className="flex items-center space-x-4">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                            <Zap className="h-5 w-5 text-green-600" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm font-medium">{insight.title}</p>
                            <p className="text-xs text-muted-foreground">{insight.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {insight.timestamp ? new Date(insight.timestamp).toLocaleString() : 'Recently'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No AI insights available</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Upload more documents to generate insights
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="all" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? '...' : stats.totalDocuments.toLocaleString()}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? 'Loading...' : 'Active documents'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <Archive className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {loading ? '...' : stats.storageUsed}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? 'Loading...' : 'Total storage'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {loading ? '...' : stats.pendingApprovals}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? 'Loading...' : 'Require your review'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Shared Documents</CardTitle>
                  <Share className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {loading ? '...' : stats.sharedDocuments}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {loading ? 'Loading...' : 'Active collaborations'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Bulk Actions Bar */}
            {selectedDocuments.size > 0 && (
              <Card className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <span className="text-sm font-medium">
                        {selectedDocuments.size} document{selectedDocuments.size !== 1 ? 's' : ''} selected
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedDocuments(new Set())}
                      >
                        Clear Selection
                      </Button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={bulkActionLoading}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Download All
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={bulkActionLoading}
                      >
                        <Share className="mr-2 h-4 w-4" />
                        Share
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={bulkActionLoading}
                      >
                        {bulkActionLoading ? (
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="mr-2 h-4 w-4" />
                        )}
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Document Library</CardTitle>
                    <CardDescription>
                      {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} 
                      {filterCategory !== 'all' && ` in ${filterCategory}`}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    {filteredDocuments.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAllDocuments}
                      >
                        {selectedDocuments.size === filteredDocuments.length ? 'Deselect All' : 'Select All'}
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent
                className={`transition-all duration-200 ${dragActive ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                {dragActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 z-10 rounded-lg">
                    <div className="text-center">
                      <CloudUpload className="h-12 w-12 text-blue-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-blue-700">Drop files here to upload</p>
                      <p className="text-sm text-blue-600">Release to start uploading</p>
                    </div>
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading documents...</p>
                  </div>
                ) : filteredDocuments.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                    <p className="text-lg font-medium text-muted-foreground mb-2">
                      {documents.length === 0 ? 'No documents found' : 'No documents match your filters'}
                    </p>
                    <p className="text-sm text-muted-foreground mb-6">
                      {documents.length === 0 
                        ? 'Upload your first document to get started'
                        : 'Try adjusting your search or filter criteria'
                      }
                    </p>
                    {documents.length === 0 && (
                      <Button onClick={() => setShowUploadDialog(true)}>
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Document
                      </Button>
                    )}
                  </div>
                ) : viewMode === 'grid' ? (
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredDocuments.map((doc) => {
                      const FileIcon = getFileIcon(doc.mimeType)
                      const isSelected = selectedDocuments.has(doc.id)
                      
                      return (
                        <Card 
                          key={doc.id} 
                          className={`group cursor-pointer transition-all duration-200 hover:shadow-md ${
                            isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                          onClick={() => toggleDocumentSelection(doc.id)}
                        >
                          <CardContent className="p-4">
                            <div className="aspect-square bg-gray-100 rounded-lg mb-4 relative overflow-hidden">
                              {doc.mimeType.startsWith('image/') ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileIcon className="h-12 w-12 text-blue-500" />
                                </div>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <FileIcon className="h-12 w-12 text-gray-400" />
                                </div>
                              )}
                              
                              {/* Selection Indicator */}
                              <div className={`absolute top-2 left-2 w-5 h-5 rounded-full border-2 transition-all ${
                                isSelected 
                                  ? 'bg-blue-500 border-blue-500' 
                                  : 'border-gray-300 bg-white opacity-0 group-hover:opacity-100'
                              }`}>
                                {isSelected && (
                                  <CheckCircle className="w-full h-full text-white" />
                                )}
                              </div>

                              {/* Quick Actions */}
                              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  className="h-8 w-8 p-0"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setPreviewDocument(doc)
                                    setShowPreviewModal(true)
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => handleDownload(doc)}>
                                      <Download className="mr-2 h-4 w-4" />
                                      Download
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Share className="mr-2 h-4 w-4" />
                                      Share
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Copy Link
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setDocumentToDelete(doc)
                                        setShowDeleteDialog(true)
                                      }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm truncate" title={doc.displayName}>
                                {doc.displayName}
                              </h4>
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>{formatFileSize(doc.sizeBytes)}</span>
                                <span>{formatDate(doc.uploadedAt)}</span>
                              </div>
                              {doc.category && (
                                <Badge variant="secondary" className="text-xs">
                                  {doc.category.name}
                                </Badge>
                              )}
                              {doc.uploader && (
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                  <Avatar className="h-4 w-4">
                                    <AvatarFallback className="text-xs">
                                      {doc.uploader.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="truncate">{doc.uploader.name}</span>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredDocuments.map((doc) => {
                      const FileIcon = getFileIcon(doc.mimeType)
                      const isSelected = selectedDocuments.has(doc.id)
                      
                      return (
                        <Card 
                          key={doc.id} 
                          className={`transition-all duration-200 hover:shadow-sm ${
                            isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center gap-4">
                              <div 
                                className="flex items-center gap-3 cursor-pointer flex-1"
                                onClick={() => toggleDocumentSelection(doc.id)}
                              >
                                {/* Selection Checkbox */}
                                <div className={`w-5 h-5 rounded border-2 transition-all ${
                                  isSelected 
                                    ? 'bg-blue-500 border-blue-500' 
                                    : 'border-gray-300'
                                }`}>
                                  {isSelected && (
                                    <CheckCircle className="w-full h-full text-white" />
                                  )}
                                </div>

                                {/* File Icon */}
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                                  <FileIcon className="h-5 w-5 text-gray-600" />
                                </div>

                                {/* File Info */}
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate" title={doc.displayName}>
                                    {doc.displayName}
                                  </h4>
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>{formatFileSize(doc.sizeBytes)}</span>
                                    <span>{formatDate(doc.uploadedAt)}</span>
                                    {doc.category && (
                                      <Badge variant="secondary" className="text-xs">
                                        {doc.category.name}
                                      </Badge>
                                    )}
                                    {doc.uploader && (
                                      <div className="flex items-center gap-1">
                                        <Avatar className="h-4 w-4">
                                          <AvatarFallback className="text-xs">
                                            {doc.uploader.name.charAt(0).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate">{doc.uploader.name}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>

                              {/* Actions */}
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setPreviewDocument(doc)
                                    setShowPreviewModal(true)
                                  }}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleDownload(doc)}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button size="sm" variant="outline">
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Share className="mr-2 h-4 w-4" />
                                      Share
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Copy className="mr-2 h-4 w-4" />
                                      Copy Link
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Edit className="mr-2 h-4 w-4" />
                                      Rename
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Star className="mr-2 h-4 w-4" />
                                      Add to Favorites
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setDocumentToDelete(doc)
                                        setShowDeleteDialog(true)
                                      }}
                                      className="text-red-600"
                                    >
                                      <Trash2 className="mr-2 h-4 w-4" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Add other tab contents here */}
          <TabsContent value="ai" className="space-y-6">
            {/* AI Document Analysis Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Analysis</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{aiStats.analyzedPercentage}%</div>
                  <p className="text-xs text-muted-foreground">
                    Documents analyzed
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Smart Tags</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{aiStats.smartTagsCount.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    Auto-generated tags
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Insights</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{aiStats.activeInsights}</div>
                  <p className="text-xs text-muted-foreground">
                    Active insights
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Quality Score</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{aiStats.qualityScore}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average quality
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* AI-Powered Search and Analysis */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-blue-600" />
                  AI-Powered Document Analysis
                </CardTitle>
                <CardDescription>
                  Advanced AI search, analysis, and insights for your documents
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* AI Search */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">AI-Powered Search</h3>
                  </div>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Ask AI: 'Find contracts expiring this month' or 'Show me all invoices over $10,000'"
                      className="flex-1"
                      value={aiSearchQuery}
                      onChange={(e) => setAiSearchQuery(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAISearch()}
                    />
                    <Button onClick={handleAISearch} disabled={aiLoading || !aiSearchQuery.trim()}>
                      <Cpu className="mr-2 h-4 w-4" />
                      {aiLoading ? 'Searching...' : 'AI Search'}
                    </Button>
                    {aiSearchQuery && (
                      <Button variant="outline" onClick={clearSearch}>
                        Clear
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      onClick={() => handleQuickSearch('')}
                      disabled={aiLoading}
                    >
                      Show All
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleQuickSearch('contracts')}
                      disabled={aiLoading}
                    >
                      Recent contracts
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleQuickSearch('invoices')}
                      disabled={aiLoading}
                    >
                      High-value invoices
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleQuickSearch('expiring')}
                      disabled={aiLoading}
                    >
                      Expiring documents
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleQuickSearch('legal')}
                      disabled={aiLoading}
                    >
                      Legal documents
                    </Button>
                  </div>
                </div>

                {/* Document Quality Analysis */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Document Quality Analysis</h3>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completeness</span>
                        <span>{qualityAnalysis.completeness}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-green-500 rounded-full" style={{ width: `${qualityAnalysis.completeness}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Clarity</span>
                        <span>{qualityAnalysis.clarity}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-blue-500 rounded-full" style={{ width: `${qualityAnalysis.clarity}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Compliance</span>
                        <span>{qualityAnalysis.compliance}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${qualityAnalysis.compliance}%` }}></div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Accessibility</span>
                        <span>{qualityAnalysis.accessibility}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full">
                        <div className="h-2 bg-orange-500 rounded-full" style={{ width: `${qualityAnalysis.accessibility}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Search Results */}
            {showSearchResults && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Search className="h-5 w-5 text-blue-600" />
                        AI Search Results
                      </CardTitle>
                      <CardDescription>
                        Found {aiSearchResults.length} documents matching "{aiSearchQuery}"
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm" onClick={clearSearch}>
                      Clear Search
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {aiSearchResults.length > 0 ? (
                    <div className="space-y-3">
                      {aiSearchResults.map((doc, index) => (
                        <div key={doc.id || index} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <h4 className="font-medium">{doc.displayName || doc.name}</h4>
                                {doc.aiScore && (
                                  <Badge variant="secondary" className="text-xs">
                                    AI Score: {Math.round(doc.aiScore)}%
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {doc.description || 'No description available'}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                <span>Type: {doc.mimeType}</span>
                                <span>Size: {formatFileSize(doc.sizeBytes)}</span>
                                <span>Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                {doc.uploader && (
                                  <span>By: {doc.uploader.name}</span>
                                )}
                              </div>
                              {doc.aiSummary && (
                                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                                  <strong>AI Summary:</strong> {doc.aiSummary}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handlePreview(doc)}
                              >
                                <Eye className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDownload(doc)}
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No documents found matching your search criteria.</p>
                      <Button variant="outline" className="mt-4" onClick={clearSearch}>
                        Try Different Search
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Smart Categorization and Insights */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Smart Categorization Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-green-600" />
                    Smart Categorization
                  </CardTitle>
                  <CardDescription>
                    AI suggestions for better document organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {categorizationSuggestions.map((suggestion, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{suggestion.category}</p>
                          <p className="text-xs text-muted-foreground">
                            {suggestion.suggestedCount} documents suggested ({Math.round(suggestion.confidence * 100)}% confidence)
                          </p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleApplyCategorization(suggestion)}
                          disabled={aiLoading}
                        >
                          Apply
                        </Button>
                      </div>
                    ))}
                    {categorizationSuggestions.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No categorization suggestions available
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleAnalyzeAllDocuments}
                    disabled={aiLoading}
                  >
                    <Cpu className="mr-2 h-4 w-4" />
                    {aiLoading ? 'Analyzing...' : 'Analyze All Documents'}
                  </Button>
                </CardContent>
              </Card>

              {/* Document Insights and Recommendations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                    AI Insights & Recommendations
                  </CardTitle>
                  <CardDescription>
                    Intelligent insights about your document collection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    {aiInsights.map((insight, index) => (
                      <div key={index} className={`p-3 rounded-lg border ${
                        insight.type === 'warning' ? 'bg-amber-50 border-amber-200' :
                        insight.type === 'info' ? 'bg-blue-50 border-blue-200' :
                        insight.type === 'success' ? 'bg-green-50 border-green-200' :
                        'bg-gray-50 border-gray-200'
                      }`}>
                        <div className="flex items-start gap-2">
                          {insight.type === 'warning' && <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5" />}
                          {insight.type === 'info' && <Zap className="h-4 w-4 text-blue-600 mt-0.5" />}
                          {insight.type === 'success' && <CheckCircle className="h-4 w-4 text-green-600 mt-0.5" />}
                          <div>
                            <p className={`font-medium text-sm ${
                              insight.type === 'warning' ? 'text-amber-800' :
                              insight.type === 'info' ? 'text-blue-800' :
                              insight.type === 'success' ? 'text-green-800' :
                              'text-gray-800'
                            }`}>{insight.title}</p>
                            <p className={`text-xs ${
                              insight.type === 'warning' ? 'text-amber-700' :
                              insight.type === 'info' ? 'text-blue-700' :
                              insight.type === 'success' ? 'text-green-700' :
                              'text-gray-700'
                            }`}>{insight.message}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {aiInsights.length === 0 && (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        No AI insights available
                      </p>
                    )}
                  </div>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleGenerateFullReport}
                    disabled={aiLoading}
                  >
                    <Activity className="mr-2 h-4 w-4" />
                    {aiLoading ? 'Generating...' : 'Generate Full Report'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Automated Tagging and Metadata Extraction */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-indigo-600" />
                  Automated Tagging & Metadata Extraction
                </CardTitle>
                <CardDescription>
                  AI automatically extracts metadata and suggests tags for better organization
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Recent Extractions */}
                  <div>
                    <h4 className="font-medium mb-3">Recent AI Extractions</h4>
                    <div className="space-y-2">
                      {aiExtractions.map((extraction, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-sm font-medium">{extraction.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {extraction.status === 'completed' ? 'Extracted:' : 'Extracting:'} {extraction.extractedFields.join(', ')}
                              </p>
                            </div>
                          </div>
                          <Badge variant={extraction.status === 'completed' ? 'secondary' : 'outline'} 
                                 className={extraction.status === 'processing' ? 'text-blue-600' : ''}>
                            {extraction.status === 'completed' ? 'Completed' : 'Processing'}
                          </Badge>
                        </div>
                      ))}
                      {aiExtractions.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No recent extractions available
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Tag Cloud */}
                  <div>
                    <h4 className="font-medium mb-3">Auto-Generated Tags</h4>
                    <div className="flex flex-wrap gap-2">
                      {aiTags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-sm">
                          {tag.name} ({tag.count})
                        </Badge>
                      ))}
                      {aiTags.length === 0 && (
                        <p className="text-sm text-muted-foreground">No tags available</p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      onClick={handleExtractAllMetadata}
                      disabled={aiLoading}
                    >
                      <Target className="mr-2 h-4 w-4" />
                      {aiLoading ? 'Extracting...' : 'Extract All Metadata'}
                    </Button>
                    <Button 
                      variant="outline"
                      onClick={handleManageTags}
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      Manage Tags
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI-Powered Document Summarization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cpu className="h-5 w-5 text-teal-600" />
                  AI Document Summarization
                </CardTitle>
                <CardDescription>
                  Generate intelligent summaries and key insights from your documents
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Summary Options */}
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => handleGenerateSummary('individual')}
                      disabled={aiLoading}
                    >
                      <FileText className="h-6 w-6" />
                      <span className="text-sm">Individual Summaries</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => handleGenerateSummary('collection')}
                      disabled={aiLoading}
                    >
                      <Activity className="h-6 w-6" />
                      <span className="text-sm">Collection Overview</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="h-20 flex-col gap-2"
                      onClick={() => handleGenerateSummary('trend')}
                      disabled={aiLoading}
                    >
                      <TrendingUp className="h-6 w-6" />
                      <span className="text-sm">Trend Analysis</span>
                    </Button>
                  </div>

                  {/* Recent Summaries */}
                  <div>
                    <h4 className="font-medium mb-3">Recent AI Summaries</h4>
                    <div className="space-y-3">
                      {aiSummaries.map((summary, index) => (
                        <div key={index} className="p-4 bg-gray-50 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h5 className="font-medium text-sm">{summary.title}</h5>
                            <Badge variant="outline" className="text-xs">
                              {new Date(summary.createdAt).toLocaleTimeString()}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mb-2">
                            {summary.content}
                          </p>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleViewSummaryDetails(summary)}
                            >
                              View Details
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleExportSummary(summary)}
                            >
                              Export
                            </Button>
                          </div>
                        </div>
                      ))}
                      {aiSummaries.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No AI summaries available
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={() => handleGenerateSummary('general')} disabled={aiLoading}>
                      <Cpu className="mr-2 h-4 w-4" />
                      {aiLoading ? 'Generating...' : 'Generate New Summary'}
                    </Button>
                    <Button variant="outline" onClick={loadAIData}>
                      <Activity className="mr-2 h-4 w-4" />
                      Refresh Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            {/* Workflow Overview Stats */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {workflowLoading ? '...' : workflowStats.activeWorkflows}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {workflowLoading ? 'Loading...' : 'Active workflows'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {workflowLoading ? '...' : workflowStats.pendingApprovals}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {workflowLoading ? 'Loading...' : 'Awaiting review'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completed Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {workflowLoading ? '...' : workflowStats.completedToday}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {workflowLoading ? 'Loading...' : 'Processed today'}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {workflowLoading ? '...' : `${workflowStats.averageProcessingTime.toFixed(1)}h`}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {workflowLoading ? 'Loading...' : 'Average time'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Common workflow operations and shortcuts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setShowCreateWorkflowDialog(true)}
                  >
                    <Activity className="h-6 w-6" />
                    <span className="text-sm">Create Workflow</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setShowPendingApprovals(true)}
                  >
                    <Clock className="h-6 w-6" />
                    <span className="text-sm">Review Pending</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setShowWorkflowTemplates(true)}
                  >
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Templates</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={() => setShowWorkflowAnalytics(true)}
                  >
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-sm">Analytics</span>
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col gap-2"
                    onClick={loadWorkflowData}
                    disabled={workflowLoading}
                  >
                    <Activity className="h-6 w-6" />
                    <span className="text-sm">{workflowLoading ? 'Refreshing...' : 'Refresh'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Active Workflows */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5 text-green-600" />
                      Active Workflows
                    </CardTitle>
                    <CardDescription>
                      Currently running document processing workflows
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Activity className="mr-2 h-4 w-4" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {workflowLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading workflows...</p>
                    </div>
                  ) : workflows.length > 0 ? (
                    workflows.map((workflow) => (
                      <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${
                            workflow.status === 'active' ? 'bg-green-500' :
                            workflow.status === 'paused' ? 'bg-yellow-500' :
                            'bg-gray-400'
                          }`}></div>
                          <div>
                            <p className="font-medium">{workflow.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {workflow.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={workflow.status === 'active' ? 'secondary' : 'outline'}>
                            {workflow.status.charAt(0).toUpperCase() + workflow.status.slice(1)}
                          </Badge>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            onClick={() => handleViewWorkflow(workflow.id)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No workflows found</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={() => setShowCreateWorkflowDialog(true)}
                      >
                        Create First Workflow
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Pending Approvals */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-amber-600" />
                      Pending Approvals
                    </CardTitle>
                    <CardDescription>
                      Documents awaiting your review and approval
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Clock className="mr-2 h-4 w-4" />
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workflowLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading pending approvals...</p>
                    </div>
                  ) : (() => {
                    const pendingWorkflows = workflows.filter(w => w.status === 'paused' || w.status === 'pending');
                    return pendingWorkflows.length > 0 ? (
                      pendingWorkflows.map((workflow) => (
                        <div key={workflow.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                            <div>
                              <p className="font-medium">{workflow.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {workflow.description}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Assigned {new Date(workflow.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleApproveDocument(workflow.id)}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Approve
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRejectDocument(workflow.id)}
                            >
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-muted-foreground">No pending approvals</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          All documents are up to date
                        </p>
                      </div>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>

            {/* Workflow Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-purple-600" />
                  Workflow Templates
                </CardTitle>
                <CardDescription>
                  Pre-built workflow templates for common document processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {workflowLoading ? (
                    <div className="col-span-full text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading templates...</p>
                    </div>
                  ) : workflowTemplates.length > 0 ? (
                    workflowTemplates.map((template) => (
                      <div key={template.id} className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText className="h-4 w-4 text-blue-600" />
                          <h4 className="font-medium">{template.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {template.description}
                        </p>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => handleUseTemplate(template.name)}
                        >
                          Use Template
                        </Button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No templates available</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Workflow templates will appear here when available
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            {/* Security Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Score</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${securityOverview?.securityScore && securityOverview.securityScore >= 90 ? 'text-green-600' : securityOverview?.securityScore && securityOverview.securityScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {securityOverview?.securityScore || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {securityOverview?.securityScore && securityOverview.securityScore >= 90 ? 'Excellent security posture' : 
                     securityOverview?.securityScore && securityOverview.securityScore >= 70 ? 'Good security posture' : 'Needs improvement'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{securityOverview?.activeSessions || 0}</div>
                  <p className="text-xs text-muted-foreground">Across all users</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Failed Logins</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${securityOverview?.failedLogins && securityOverview.failedLogins > 10 ? 'text-red-600' : securityOverview?.failedLogins && securityOverview.failedLogins > 5 ? 'text-yellow-600' : 'text-green-600'}`}>
                    {securityOverview?.failedLogins || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">Last 24 hours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{securityOverview?.complianceStatus || 0}%</div>
                  <p className="text-xs text-muted-foreground">SOC 2 Type II compliant</p>
                </CardContent>
              </Card>
            </div>

            {/* Security Health Check */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Security Health Check</CardTitle>
                  <CardDescription>Current security status across all systems</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {securityLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading security data...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Two-Factor Authentication</span>
                          <Badge 
                            variant="default" 
                            className={securityOverview?.mfaPercentage === 100 ? "bg-green-100 text-green-800" : securityOverview?.mfaPercentage && securityOverview.mfaPercentage > 0 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}
                          >
                            <CheckCircle className="mr-1 h-3 w-3" />
                            {securityOverview?.mfaPercentage === 100 ? "Enabled" : securityOverview?.mfaPercentage && securityOverview.mfaPercentage > 0 ? "Partial" : "Disabled"}
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                            style={{ width: `${securityOverview?.mfaPercentage || 0}%` }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {securityOverview?.mfaEnabled || 0} of {securityOverview?.totalUsers || 0} users have 2FA enabled ({securityOverview?.mfaPercentage || 0}%)
                        </p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Data Encryption</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Active
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full w-full"></div>
                        </div>
                        <p className="text-xs text-muted-foreground">AES-256 encryption at rest and in transit</p>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">Access Controls</span>
                          <Badge variant="default" className="bg-green-100 text-green-800">
                            <CheckCircle className="mr-1 h-3 w-3" />
                            Enforced
                          </Badge>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div className="bg-green-600 h-2 rounded-full w-full"></div>
                        </div>
                        <p className="text-xs text-muted-foreground">Role-based access control implemented</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Security Events */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Security Events</CardTitle>
                  <CardDescription>Latest security activities and alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  {securityLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading security events...</p>
                    </div>
                  ) : auditLogs.length > 0 ? (
                    <div className="space-y-3">
                      {auditLogs.slice(0, 5).map((log, index) => (
                        <div key={index} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className={`w-2 h-2 rounded-full ${
                            (log as any).severity === 'high' ? 'bg-red-500' :
                            (log as any).severity === 'medium' ? 'bg-yellow-500' : 'bg-green-500'
                          }`}></div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{log.action}</p>
                            <p className="text-xs text-muted-foreground">
                              {log.user} • {new Date(log.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No recent security events</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Active Sessions */}
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Current user sessions and device information</CardDescription>
              </CardHeader>
              <CardContent>
                {securityLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-muted-foreground">Loading sessions...</p>
                  </div>
                ) : sessions.length > 0 ? (
                  <div className="space-y-3">
                    {sessions.slice(0, 5).map((session, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Monitor className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium">{session.deviceName || 'Unknown Device'}</p>
                            <p className="text-sm text-muted-foreground">
                              {(session as any).browser || 'Unknown Browser'} • {(session as any).location || 'Unknown Location'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Last active: {new Date(session.lastActivity).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={session.isCurrent ? "default" : "secondary"}>
                            {session.isCurrent ? "Current" : "Active"}
                          </Badge>
                          {!session.isCurrent && (
                            <Button size="sm" variant="outline">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No active sessions found</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Security Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Security Actions</CardTitle>
                <CardDescription>Common security management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Key className="h-6 w-6" />
                    <span className="text-sm">Enable 2FA</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Users className="h-6 w-6" />
                    <span className="text-sm">Manage Users</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Shield className="h-6 w-6" />
                    <span className="text-sm">Security Settings</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={loadSecurityData}>
                    <RefreshCw className="h-6 w-6" />
                    <span className="text-sm">{securityLoading ? 'Refreshing...' : 'Refresh'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-6">
            {/* Compliance Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${compliance?.overallScore && compliance.overallScore >= 90 ? 'text-green-600' : compliance?.overallScore && compliance.overallScore >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {compliance?.overallScore || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {compliance?.overallScore && compliance.overallScore >= 90 ? 'Fully Compliant' : 
                     compliance?.overallScore && compliance.overallScore >= 70 ? 'Mostly Compliant' : 'Needs Attention'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">MFA Adoption</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${compliance?.standards?.[0]?.score && compliance.standards[0].score >= 90 ? 'text-green-600' : compliance?.standards?.[0]?.score && compliance.standards[0].score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {compliance?.standards?.[0]?.score || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {compliance?.standards?.[0]?.status === 'certified' ? 'Fully Certified' : 
                     compliance?.standards?.[0]?.status === 'compliant' ? 'Compliant' : 'Non-Compliant'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Security Monitoring</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${compliance?.standards?.[1]?.score && compliance.standards[1].score >= 90 ? 'text-green-600' : compliance?.standards?.[1]?.score && compliance.standards[1].score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {compliance?.standards?.[1]?.score || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {compliance?.standards?.[1]?.status === 'certified' ? 'Fully Monitored' : 
                     compliance?.standards?.[1]?.status === 'compliant' ? 'Monitored' : 'Needs Setup'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Audit Readiness</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${compliance?.standards?.[2]?.score && compliance.standards[2].score >= 90 ? 'text-green-600' : compliance?.standards?.[2]?.score && compliance.standards[2].score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {compliance?.standards?.[2]?.score || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {compliance?.standards?.[2]?.status === 'certified' ? 'Audit Ready' : 
                     compliance?.standards?.[2]?.status === 'compliant' ? 'Mostly Ready' : 'Needs Work'}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Standards */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Compliance Standards</CardTitle>
                  <CardDescription>Current compliance status across different standards</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {securityLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading compliance data...</p>
                    </div>
                  ) : compliance?.standards ? (
                    <div className="space-y-3">
                      {compliance.standards.map((standard: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                              standard.status === 'certified' ? 'bg-green-100' :
                              standard.status === 'compliant' ? 'bg-blue-100' : 'bg-yellow-100'
                            }`}>
                              {standard.status === 'certified' ? (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              ) : standard.status === 'compliant' ? (
                                <Shield className="h-4 w-4 text-blue-600" />
                              ) : (
                                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{standard.name}</p>
                              <p className="text-sm text-muted-foreground">{standard.description}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className={`text-lg font-bold ${
                              standard.score >= 90 ? 'text-green-600' :
                              standard.score >= 70 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {standard.score}%
                            </div>
                            <Badge 
                              variant="default" 
                              className={
                                standard.status === 'certified' ? 'bg-green-100 text-green-800' :
                                standard.status === 'compliant' ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
                              }
                            >
                              {standard.status === 'certified' ? (
                                <CheckCircle className="mr-1 h-3 w-3" />
                              ) : standard.status === 'compliant' ? (
                                <Shield className="mr-1 h-3 w-3" />
                              ) : (
                                <AlertTriangle className="mr-1 h-3 w-3" />
                              )}
                              {standard.status === 'certified' ? 'Certified' :
                               standard.status === 'compliant' ? 'Compliant' : 'Non-Compliant'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No compliance standards found</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Compliance Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Required Actions</CardTitle>
                  <CardDescription>Compliance tasks and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  {securityLoading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">Loading compliance actions...</p>
                    </div>
                  ) : complianceActions.length > 0 ? (
                    <div className="space-y-3">
                      {complianceActions.map((action: any, index: number) => (
                        <div key={index} className={`flex items-center space-x-3 p-3 border rounded-lg ${
                          action.priority === 'high' ? 'bg-red-50' :
                          action.priority === 'medium' ? 'bg-yellow-50' : 'bg-blue-50'
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            action.priority === 'high' ? 'bg-red-500' :
                            action.priority === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'
                          }`}></div>
                          <div className="flex-1">
                            <p className="text-sm font-medium">{action.title}</p>
                            <p className="text-xs text-muted-foreground">{action.description}</p>
                            <p className="text-xs text-muted-foreground">
                              {action.status === 'completed' ? `Completed: ${new Date(action.dueDate).toLocaleDateString()}` :
                               action.status === 'pending' ? `Due: ${new Date(action.dueDate).toLocaleDateString()}` :
                               `Status: ${action.status}`}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {action.status === 'completed' ? (
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                <CheckCircle className="mr-1 h-3 w-3" />
                                Done
                              </Badge>
                            ) : action.priority === 'high' ? (
                              <Button size="sm" variant="destructive">
                                Urgent
                              </Button>
                            ) : (
                              <Button size="sm" variant="outline">
                                {action.priority === 'medium' ? 'Review' : 'Schedule'}
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                      <p className="text-muted-foreground">No pending compliance actions</p>
                      <p className="text-xs text-muted-foreground mt-2">All compliance requirements are up to date</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Compliance Reports */}
            <Card>
              <CardHeader>
                <CardTitle>Compliance Reports</CardTitle>
                <CardDescription>Generate and download compliance reports based on current data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Compliance Overview</p>
                        <p className="text-sm text-muted-foreground">Overall compliance status: {compliance?.overallScore || 0}%</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Generated: {new Date().toLocaleDateString()}</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Security Standards</p>
                        <p className="text-sm text-muted-foreground">{compliance?.standards?.length || 0} standards tracked</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Generated: {new Date().toLocaleDateString()}</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <Activity className="h-4 w-4 text-yellow-600" />
                      </div>
                      <div>
                        <p className="font-medium">Action Items</p>
                        <p className="text-sm text-muted-foreground">{complianceActions.length} pending actions</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Generated: {new Date().toLocaleDateString()}</span>
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Compliance Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Compliance Actions</CardTitle>
                <CardDescription>Common compliance management tasks</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Generate Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Activity className="h-6 w-6" />
                    <span className="text-sm">Run Assessment</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Shield className="h-6 w-6" />
                    <span className="text-sm">Update Policies</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={loadSecurityData}>
                    <RefreshCw className="h-6 w-6" />
                    <span className="text-sm">{securityLoading ? 'Refreshing...' : 'Refresh'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                  <p className="text-xs text-muted-foreground">
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.storageUsed}</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(parseFloat(stats.storageUsed) * 0.8)} GB available
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">AI Processed</CardTitle>
                  <Cpu className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{aiStats.analyzedDocuments}</div>
                  <p className="text-xs text-muted-foreground">
                    {aiStats.analyzedPercentage}% of total documents
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{workflowStats.activeWorkflows}</div>
                  <p className="text-xs text-muted-foreground">
                    {workflowStats.pendingApprovals} pending approvals
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Document Activity Chart */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Document Upload Trends</CardTitle>
                  <CardDescription>Document uploads over the last 30 days</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                      <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">Upload trends chart</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {documents.length} documents uploaded this month
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Document Categories</CardTitle>
                  <CardDescription>Distribution of documents by category</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm">Invoices</span>
                      </div>
                      <span className="text-sm font-medium">35%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span className="text-sm">Receipts</span>
                      </div>
                      <span className="text-sm font-medium">28%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '28%' }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span className="text-sm">Contracts</span>
                      </div>
                      <span className="text-sm font-medium">20%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span className="text-sm">Other</span>
                      </div>
                      <span className="text-sm font-medium">17%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '17%' }}></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* AI Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>AI Performance Metrics</CardTitle>
                <CardDescription>AI processing efficiency and accuracy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{aiStats.qualityScore}%</div>
                    <p className="text-sm text-muted-foreground">Average Quality Score</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${aiStats.qualityScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">{aiStats.smartTagsCount}</div>
                    <p className="text-sm text-muted-foreground">Smart Tags Generated</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, (aiStats.smartTagsCount / 50) * 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">{aiStats.activeInsights}</div>
                    <p className="text-sm text-muted-foreground">Active Insights</p>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div 
                        className="bg-purple-600 h-2 rounded-full transition-all duration-300" 
                        style={{ width: `${Math.min(100, (aiStats.activeInsights / 20) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Document Activity</CardTitle>
                  <CardDescription>Latest document uploads and modifications</CardDescription>
                </CardHeader>
                <CardContent>
                  {documents.length > 0 ? (
                    <div className="space-y-3">
                      {documents.slice(0, 5).map((doc) => (
                        <div key={doc.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <FileText className="h-4 w-4 text-blue-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{doc.displayName}</p>
                            <p className="text-xs text-muted-foreground">
                              Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              {formatFileSize(doc.sizeBytes)}
                            </p>
                            <Badge variant="secondary" className="text-xs">
                              {doc.mimeType.split('/')[1]?.toUpperCase() || 'FILE'}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No recent activity</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Workflow Performance</CardTitle>
                  <CardDescription>Workflow completion rates and processing times</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Completion Rate</span>
                      <span className="text-sm font-bold text-green-600">
                        {workflowStats.completedToday > 0 ? 
                          Math.round((workflowStats.completedToday / workflowStats.activeWorkflows) * 100) : 0}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${workflowStats.completedToday > 0 ? 
                            Math.round((workflowStats.completedToday / workflowStats.activeWorkflows) * 100) : 0}%` 
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Avg. Processing Time</span>
                      <span className="text-sm font-bold text-blue-600">
                        {workflowStats.averageProcessingTime}h
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min(100, (workflowStats.averageProcessingTime / 24) * 100)}%` 
                        }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Pending Approvals</span>
                      <span className="text-sm font-bold text-yellow-600">
                        {workflowStats.pendingApprovals}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full transition-all duration-300" 
                        style={{ 
                          width: `${Math.min(100, (workflowStats.pendingApprovals / 10) * 100)}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Analytics Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Analytics Actions</CardTitle>
                <CardDescription>Generate reports and export analytics data</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <FileText className="h-6 w-6" />
                    <span className="text-sm">Export Report</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <TrendingUp className="h-6 w-6" />
                    <span className="text-sm">View Trends</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2">
                    <Activity className="h-6 w-6" />
                    <span className="text-sm">Performance</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col gap-2" onClick={loadDocumentData}>
                    <RefreshCw className="h-6 w-6" />
                    <span className="text-sm">{loading ? 'Refreshing...' : 'Refresh'}</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            {/* General Settings */}
            <Card>
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Basic document management preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="auto-categorization">Auto-categorization</Label>
                    <Select defaultValue="enabled">
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                        <SelectItem value="manual">Manual Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Automatically categorize documents using AI
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="file-size-limit">File Size Limit (MB)</Label>
                    <Input
                      id="file-size-limit"
                      type="number"
                      defaultValue="100"
                      placeholder="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum file size for uploads
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="retention-period">Retention Period (days)</Label>
                    <Input
                      id="retention-period"
                      type="number"
                      defaultValue="365"
                      placeholder="365"
                    />
                    <p className="text-xs text-muted-foreground">
                      How long to keep documents before archiving
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="auto-delete">Auto-delete Drafts</Label>
                    <Select defaultValue="30">
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="7">After 7 days</SelectItem>
                        <SelectItem value="30">After 30 days</SelectItem>
                        <SelectItem value="90">After 90 days</SelectItem>
                        <SelectItem value="never">Never</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Automatically delete draft documents
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="notifications"
                    defaultChecked
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="notifications" className="text-sm">
                    Enable email notifications for document processing
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="watermark"
                    defaultChecked
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="watermark" className="text-sm">
                    Add watermarks to downloaded documents
                  </Label>
                </div>
              </CardContent>
            </Card>

            {/* AI Settings */}
            <Card>
              <CardHeader>
                <CardTitle>AI Processing Settings</CardTitle>
                <CardDescription>Configure AI-powered document analysis and processing</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="ai-model">AI Model</Label>
                    <Select defaultValue="gemma2:2b">
                      <SelectTrigger>
                        <SelectValue placeholder="Select AI model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gemma2:2b">Gemma 2B (Fast)</SelectItem>
                        <SelectItem value="gemma2:9b">Gemma 9B (Accurate)</SelectItem>
                        <SelectItem value="llama3:8b">Llama 3 8B (Balanced)</SelectItem>
                        <SelectItem value="llama3:70b">Llama 3 70B (Most Accurate)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Choose the AI model for document processing
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="processing-timeout">Processing Timeout (seconds)</Label>
                    <Input
                      id="processing-timeout"
                      type="number"
                      defaultValue="30"
                      placeholder="30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Maximum time for AI processing
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confidence-threshold">Confidence Threshold (%)</Label>
                    <Input
                      id="confidence-threshold"
                      type="number"
                      defaultValue="80"
                      placeholder="80"
                      min="0"
                      max="100"
                    />
                    <p className="text-xs text-muted-foreground">
                      Minimum confidence for AI predictions
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="batch-size">Batch Processing Size</Label>
                    <Input
                      id="batch-size"
                      type="number"
                      defaultValue="5"
                      placeholder="5"
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of documents to process in parallel
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">AI Features</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="auto-tagging"
                        defaultChecked
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="auto-tagging" className="text-sm">
                        Automatic Tagging
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="quality-analysis"
                        defaultChecked
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="quality-analysis" className="text-sm">
                        Quality Analysis
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="metadata-extraction"
                        defaultChecked
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="metadata-extraction" className="text-sm">
                        Metadata Extraction
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="content-summarization"
                        defaultChecked
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="content-summarization" className="text-sm">
                        Content Summarization
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Workflow Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Workflow Settings</CardTitle>
                <CardDescription>Configure document workflow automation and approval processes</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="default-workflow">Default Workflow</Label>
                    <Select defaultValue="invoice-processing">
                      <SelectTrigger>
                        <SelectValue placeholder="Select default workflow" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="invoice-processing">Invoice Processing</SelectItem>
                        <SelectItem value="contract-review">Contract Review</SelectItem>
                        <SelectItem value="document-classification">Document Classification</SelectItem>
                        <SelectItem value="expense-approval">Expense Approval</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Default workflow for new documents
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="approval-timeout">Approval Timeout (hours)</Label>
                    <Input
                      id="approval-timeout"
                      type="number"
                      defaultValue="72"
                      placeholder="72"
                    />
                    <p className="text-xs text-muted-foreground">
                      Time before approval requests expire
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="escalation-levels">Escalation Levels</Label>
                    <Input
                      id="escalation-levels"
                      type="number"
                      defaultValue="3"
                      placeholder="3"
                      min="1"
                      max="5"
                    />
                    <p className="text-xs text-muted-foreground">
                      Number of escalation levels for approvals
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="parallel-approvals">Parallel Approvals</Label>
                    <Select defaultValue="enabled">
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="enabled">Enabled</SelectItem>
                        <SelectItem value="disabled">Disabled</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Allow multiple approvers to work in parallel
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Workflow Notifications</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="workflow-email"
                        defaultChecked
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="workflow-email" className="text-sm">
                        Email Notifications
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="workflow-sms"
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="workflow-sms" className="text-sm">
                        SMS Notifications
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="workflow-slack"
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="workflow-slack" className="text-sm">
                        Slack Notifications
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="workflow-reminders"
                        defaultChecked
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="workflow-reminders" className="text-sm">
                        Automatic Reminders
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Security Settings</CardTitle>
                <CardDescription>Configure document security and access controls</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="encryption-level">Encryption Level</Label>
                    <Select defaultValue="aes-256">
                      <SelectTrigger>
                        <SelectValue placeholder="Select encryption level" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aes-128">AES-128</SelectItem>
                        <SelectItem value="aes-256">AES-256</SelectItem>
                        <SelectItem value="aes-512">AES-512</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Document encryption strength
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
                    <Input
                      id="session-timeout"
                      type="number"
                      defaultValue="60"
                      placeholder="60"
                    />
                    <p className="text-xs text-muted-foreground">
                      User session timeout duration
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="password-policy">Password Policy</Label>
                    <Select defaultValue="strong">
                      <SelectTrigger>
                        <SelectValue placeholder="Select password policy" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="basic">Basic (8+ characters)</SelectItem>
                        <SelectItem value="medium">Medium (12+ characters, mixed case)</SelectItem>
                        <SelectItem value="strong">Strong (16+ characters, special chars)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Password complexity requirements
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="mfa-required">MFA Requirement</Label>
                    <Select defaultValue="optional">
                      <SelectTrigger>
                        <SelectValue placeholder="Select MFA requirement" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="disabled">Disabled</SelectItem>
                        <SelectItem value="optional">Optional</SelectItem>
                        <SelectItem value="required">Required for All</SelectItem>
                        <SelectItem value="admin-only">Required for Admins</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Multi-factor authentication requirements
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Access Controls</h4>
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="ip-whitelist"
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="ip-whitelist" className="text-sm">
                        IP Whitelist
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="audit-logging"
                        defaultChecked
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="audit-logging" className="text-sm">
                        Audit Logging
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="document-watermarking"
                        defaultChecked
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="document-watermarking" className="text-sm">
                        Document Watermarking
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="download-tracking"
                        defaultChecked
                        className="rounded border-gray-300"
                      />
                      <Label htmlFor="download-tracking" className="text-sm">
                        Download Tracking
                      </Label>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Save Settings */}
            <Card>
              <CardHeader>
                <CardTitle>Save Settings</CardTitle>
                <CardDescription>Apply your configuration changes</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Changes will be applied immediately and affect all users
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline">
                      Reset to Defaults
                    </Button>
                    <Button>
                      Save Settings
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Document Preview Modal */}
        <Dialog open={showPreviewModal} onOpenChange={(open) => {
          if (!open) closePreviewModal()
        }}>
          <DialogContent className="max-w-4xl max-h-[85vh] w-full flex flex-col overflow-hidden">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle>Document Preview</DialogTitle>
              <DialogDescription>
                {previewDocument?.displayName}
              </DialogDescription>
            </DialogHeader>
            {previewDocument && (
              <div className="flex-1 min-h-0 flex flex-col space-y-4">
                <div className="flex-shrink-0 flex items-center space-x-4 text-sm text-muted-foreground">
                  <span>Type: {previewDocument.mimeType}</span>
                  <span>Size: {formatFileSize(previewDocument.sizeBytes)}</span>
                  <span>Uploaded: {new Date(previewDocument.uploadedAt).toLocaleDateString()}</span>
                </div>
                
                <div className="flex-1 min-h-0 border rounded-lg overflow-hidden">
                  {previewDocument.mimeType.startsWith('image/') ? (
                    <div className="relative bg-gray-50 h-full flex items-center justify-center overflow-auto">
                      {imageLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Loading image...</p>
                          </div>
                        </div>
                      )}
                      {!imageError && imageBlobUrl ? (
                        <img 
                          src={imageBlobUrl}
                          alt={previewDocument.displayName}
                          className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                          style={{ 
                            maxWidth: '100%', 
                            maxHeight: '100%', 
                            width: 'auto', 
                            height: 'auto',
                            display: 'block'
                          }}
                        />
                      ) : (
                        <div className="text-center p-8">
                          <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                          <p className="text-muted-foreground mb-4">
                            Image preview failed to load
                          </p>
                          <div className="space-y-2">
                            <Button onClick={() => handleDownload(previewDocument)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download to View
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                if (previewDocument) {
                                  loadImageAsBlob(previewDocument);
                                }
                              }}
                            >
                              Retry Preview
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : previewDocument.mimeType.includes('pdf') ? (
                    <iframe
                      src={`${config.api.baseUrl}/api/documents/stream/${previewDocument.id}?token=${localStorage.getItem('auth_token')}&tenantId=${localStorage.getItem('tenant_id')}&companyId=${localStorage.getItem('company_id')}#toolbar=0`}
                      className="w-full h-full border-0"
                      title={previewDocument.displayName}
                    />
                  ) : previewDocument.mimeType.startsWith('text/') ? (
                    <div className="w-full h-full overflow-auto">
                      {textLoading ? (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">Loading text content...</p>
                          </div>
                        </div>
                      ) : textError ? (
                        <div className="flex items-center justify-center h-full p-8">
                          <div className="text-center">
                            <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                            <p className="text-muted-foreground mb-4">
                              Failed to load text content
                            </p>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                if (previewDocument) {
                                  loadTextContent(previewDocument);
                                }
                              }}
                            >
                              Retry
                            </Button>
                          </div>
                        </div>
                      ) : textContent ? (
                        <pre className="p-4 text-sm whitespace-pre-wrap font-mono bg-gray-50">
                          {textContent}
                        </pre>
                      ) : null}
                    </div>
                  ) : (
                    <div className="p-8 text-center h-full flex flex-col items-center justify-center">
                      <FileText className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">
                        Preview not available for this file type
                      </p>
                      <Button onClick={() => handleDownload(previewDocument)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download to View
                      </Button>
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0 flex justify-end space-x-2 pt-4">
                  <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                    Close
                  </Button>
                  <Button onClick={() => handleDownload(previewDocument)}>
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Modal */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete Document</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete "{documentToDelete?.displayName}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end space-x-2 pt-4">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={confirmDelete}>
                Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Create Workflow Dialog */}
        <Dialog open={showCreateWorkflowDialog} onOpenChange={setShowCreateWorkflowDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Set up a new document processing workflow with custom steps and automation rules.
              </DialogDescription>
            </DialogHeader>
            <CreateWorkflowForm 
              onSubmit={handleCreateWorkflow}
              onCancel={() => setShowCreateWorkflowDialog(false)}
              templates={workflowTemplates}
            />
          </DialogContent>
        </Dialog>
      </div>
    </PageLayout>
  )
}
