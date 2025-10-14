'use client'

import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiService from '@/lib/api'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  User,
  Users,
  Settings,
  Workflow,
  FileText,
  DollarSign,
  Calendar,
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Send,
  History
} from 'lucide-react'
import { format } from 'date-fns'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'

// Types
interface ApprovalWorkflow {
  id: string
  name: string
  description?: string
  entityType: 'purchase_order' | 'expense' | 'bill' | 'invoice'
  steps: string // JSON string
  conditions?: string // JSON string
  autoApproval: boolean
  escalationRules?: string // JSON string
  isActive: boolean
  approvals: Approval[]
  createdAt: string
  updatedAt: string
}

interface Approval {
  id: string
  entityType: 'purchase_order' | 'expense' | 'bill' | 'invoice'
  entityId: string
  stepNumber: number
  approverId: string
  status: 'pending' | 'approved' | 'rejected' | 'escalated'
  comments?: string
  approvedAt?: string
  rejectedAt?: string
  escalationReason?: string
  workflow: { id: string; name: string }
  approver: { id: string; name: string; email: string }
  entity: {
    id: string
    number?: string
    amount?: number
    description?: string
  }
  createdAt: string
  updatedAt: string
}

interface AppUser {
  id: string
  name: string
  email: string
  role: string
}

// Validation schemas
const workflowSchema = z.object({
  companyId: z.string().min(1, 'Company is required'),
  name: z.string().min(1, 'Workflow name is required'),
  description: z.string().optional(),
  entityType: z.enum(['purchase_order', 'expense', 'bill', 'invoice']),
  steps: z.string().min(1, 'Steps are required'),
  conditions: z.string().optional(),
  autoApproval: z.boolean().default(false),
  escalationRules: z.string().optional()
})

const approvalActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'escalate']),
  comments: z.string().optional(),
  escalationReason: z.string().optional()
})

export default function ApprovalsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('pending')
  const [isCreateWorkflowOpen, setIsCreateWorkflowOpen] = useState(false)
  const [isActionDialogOpen, setIsActionDialogOpen] = useState(false)
  const [selectedApproval, setSelectedApproval] = useState<Approval | null>(null)
  const [selectedWorkflow, setSelectedWorkflow] = useState<ApprovalWorkflow | null>(null)
  const [expandedWorkflows, setExpandedWorkflows] = useState<Set<string>>(new Set())
  
  const queryClient = useQueryClient()

  // Fetch data
  const { data: workflows, isLoading: workflowsLoading } = useQuery({
    queryKey: ['approval-workflows', searchTerm],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (searchTerm) params.append('q', searchTerm)
      
      const response = await fetch(`/api/approval-workflows?${params}`)
      if (!response.ok) throw new Error('Failed to fetch approval workflows')
      return response.json()
    }
  })

  const { data: approvals, isLoading: approvalsLoading } = useQuery({
    queryKey: ['approvals', activeTab],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (activeTab !== 'all') params.append('status', activeTab)
      
      const response = await fetch(`/api/approvals?${params}`)
      if (!response.ok) throw new Error('Failed to fetch approvals')
      return response.json()
    }
  })

  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json()
    }
  })

  const { data: companies } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await apiService.getCompanies()
      return res.data
    }
  })

  const { data: stats } = useQuery({
    queryKey: ['approval-stats'],
    queryFn: async () => {
      const response = await fetch('/api/approvals/stats')
      if (!response.ok) throw new Error('Failed to fetch approval statistics')
      return response.json()
    }
  })

  // Mutations
  const createWorkflow = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/approval-workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to create approval workflow')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approval-workflows'] })
      setIsCreateWorkflowOpen(false)
      toast.success('Approval workflow created successfully')
    },
    onError: (error) => {
      toast.error('Failed to create approval workflow')
    }
  })

  const updateApproval = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const response = await fetch(`/api/approvals/${id}/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Failed to update approval')
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['approvals'] })
      queryClient.invalidateQueries({ queryKey: ['approval-stats'] })
      setIsActionDialogOpen(false)
      toast.success('Approval action completed successfully')
    },
    onError: (error) => {
      toast.error('Failed to complete approval action')
    }
  })

  // Form setup
  const workflowForm = useForm({
    resolver: zodResolver(workflowSchema),
    defaultValues: {
      autoApproval: false
    }
  })

  const actionForm = useForm({
    resolver: zodResolver(approvalActionSchema),
    defaultValues: {
      action: 'approve' as const
    }
  })

  // Computed values
  const filteredWorkflows = useMemo(() => {
    if (!workflows?.items) return []
    return workflows.items
  }, [workflows])

  const filteredApprovals = useMemo(() => {
    if (!approvals?.items) return []
    return approvals.items
  }, [approvals])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'escalated': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'escalated': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const getEntityTypeIcon = (entityType: string) => {
    switch (entityType) {
      case 'purchase_order': return <FileText className="w-4 h-4" />
      case 'expense': return <DollarSign className="w-4 h-4" />
      case 'bill': return <FileText className="w-4 h-4" />
      case 'invoice': return <FileText className="w-4 h-4" />
      default: return <FileText className="w-4 h-4" />
    }
  }

  const getEntityTypeColor = (entityType: string) => {
    switch (entityType) {
      case 'purchase_order': return 'bg-blue-100 text-blue-800'
      case 'expense': return 'bg-green-100 text-green-800'
      case 'bill': return 'bg-purple-100 text-purple-800'
      case 'invoice': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const toggleWorkflowExpansion = (workflowId: string) => {
    const newExpanded = new Set(expandedWorkflows)
    if (newExpanded.has(workflowId)) {
      newExpanded.delete(workflowId)
    } else {
      newExpanded.add(workflowId)
    }
    setExpandedWorkflows(newExpanded)
  }

  const onSubmitWorkflow = (data: any) => {
    createWorkflow.mutate(data)
  }

  const onSubmitAction = (data: any) => {
    if (selectedApproval) {
      updateApproval.mutate({ id: selectedApproval.id, data })
    }
  }

  const handleAction = (approval: Approval) => {
    setSelectedApproval(approval)
    setIsActionDialogOpen(true)
  }

  const renderWorkflowSteps = (steps: string) => {
    try {
      const parsedSteps = JSON.parse(steps)
      return parsedSteps.map((step: any, index: number) => (
        <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
          <Badge variant="outline">Step {index + 1}</Badge>
          <span className="text-sm">{step.approverRole || step.approverId}</span>
          {step.conditions && (
            <span className="text-xs text-gray-500">({step.conditions})</span>
          )}
        </div>
      ))
    } catch (error) {
      return <span className="text-sm text-gray-500">Invalid steps format</span>
    }
  }

  return (
    <PageLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approval Management</h1>
            <p className="text-gray-600 mt-1">Manage approval workflows and pending approvals</p>
          </div>
        </div>

        {/* Analytics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.pendingCount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Approved Today</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.approvedToday}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Rejected Today</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.rejectedToday}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {Math.round(stats.averageResponseTime || 0)}h
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Approval Management</CardTitle>
              <div className="flex items-center space-x-2">
                <Dialog open={isCreateWorkflowOpen} onOpenChange={setIsCreateWorkflowOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      New Workflow
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Approval Workflow</DialogTitle>
                    </DialogHeader>
                    <Form {...workflowForm}>
                      <form onSubmit={workflowForm.handleSubmit(onSubmitWorkflow)} className="space-y-4">
                        <FormField
                          control={workflowForm.control}
                          name="companyId"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Company</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select company" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {companies?.items?.map((company: any) => (
                                    <SelectItem key={company.id} value={company.id}>
                                      {company.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={workflowForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Workflow Name</FormLabel>
                              <FormControl>
                                <Input placeholder="High Value Purchase Approval" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={workflowForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Textarea placeholder="Workflow description..." {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={workflowForm.control}
                          name="entityType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Entity Type</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select entity type" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="purchase_order">Purchase Order</SelectItem>
                                  <SelectItem value="expense">Expense</SelectItem>
                                  <SelectItem value="bill">Bill</SelectItem>
                                  <SelectItem value="invoice">Invoice</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={workflowForm.control}
                          name="steps"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Approval Steps (JSON)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder='[{"stepNumber": 1, "approverRole": "manager"}, {"stepNumber": 2, "approverRole": "director"}]' 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={workflowForm.control}
                          name="conditions"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Conditions (JSON)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder='{"amount": {"min": 1000}, "category": "restricted"}' 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={workflowForm.control}
                          name="escalationRules"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Escalation Rules (JSON)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder='{"timeout": 24, "escalateTo": "supervisor"}' 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <div className="flex justify-end space-x-2">
                          <Button type="button" variant="outline" onClick={() => setIsCreateWorkflowOpen(false)}>
                            Cancel
                          </Button>
                          <Button type="submit" disabled={createWorkflow.isPending}>
                            {createWorkflow.isPending ? 'Creating...' : 'Create Workflow'}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
                <TabsTrigger value="workflows">Workflows</TabsTrigger>
              </TabsList>
              
              <TabsContent value="pending" className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search approvals..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                {approvalsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Requester</TableHead>
                        <TableHead>Approver</TableHead>
                        <TableHead>Step</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApprovals.map((approval: Approval) => (
                        <TableRow key={approval.id}>
                          <TableCell className="font-medium">
                            {approval.entity.number || approval.entityId}
                          </TableCell>
                          <TableCell>
                            <Badge className={getEntityTypeColor(approval.entityType)}>
                              {getEntityTypeIcon(approval.entityType)}
                              <span className="ml-1">{approval.entityType.replace('_', ' ')}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {approval.entity.amount ? (
                              new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              }).format(approval.entity.amount)
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>{approval.approver.name}</TableCell>
                          <TableCell>{approval.approver.name}</TableCell>
                          <TableCell>
                            <Badge variant="outline">Step {approval.stepNumber}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusColor(approval.status)}>
                              {getStatusIcon(approval.status)}
                              <span className="ml-1">{approval.status}</span>
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(approval)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(approval)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAction(approval)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
              
              <TabsContent value="approved" className="space-y-4">
                {approvalsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Approver</TableHead>
                        <TableHead>Approved At</TableHead>
                        <TableHead>Comments</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApprovals.map((approval: Approval) => (
                        <TableRow key={approval.id}>
                          <TableCell className="font-medium">
                            {approval.entity.number || approval.entityId}
                          </TableCell>
                          <TableCell>
                            <Badge className={getEntityTypeColor(approval.entityType)}>
                              {approval.entityType.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {approval.entity.amount ? (
                              new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              }).format(approval.entity.amount)
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>{approval.approver.name}</TableCell>
                          <TableCell>
                            {approval.approvedAt ? (
                              format(new Date(approval.approvedAt), 'MMM dd, yyyy HH:mm')
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            {approval.comments || 'No comments'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
              
              <TabsContent value="rejected" className="space-y-4">
                {approvalsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Entity</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Rejected By</TableHead>
                        <TableHead>Rejected At</TableHead>
                        <TableHead>Reason</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredApprovals.map((approval: Approval) => (
                        <TableRow key={approval.id}>
                          <TableCell className="font-medium">
                            {approval.entity.number || approval.entityId}
                          </TableCell>
                          <TableCell>
                            <Badge className={getEntityTypeColor(approval.entityType)}>
                              {approval.entityType.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {approval.entity.amount ? (
                              new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD'
                              }).format(approval.entity.amount)
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>{approval.approver.name}</TableCell>
                          <TableCell>
                            {approval.rejectedAt ? (
                              format(new Date(approval.rejectedAt), 'MMM dd, yyyy HH:mm')
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>
                            {approval.comments || 'No reason provided'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </TabsContent>
              
              <TabsContent value="workflows" className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search workflows..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
                
                {workflowsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredWorkflows.map((workflow: ApprovalWorkflow) => (
                      <div key={workflow.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleWorkflowExpansion(workflow.id)}
                            >
                              {expandedWorkflows.has(workflow.id) ? (
                                <ChevronDown className="w-4 h-4" />
                              ) : (
                                <ChevronRight className="w-4 h-4" />
                              )}
                            </Button>
                            <div>
                              <h4 className="font-medium">{workflow.name}</h4>
                              {workflow.description && (
                                <p className="text-sm text-gray-600">{workflow.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getEntityTypeColor(workflow.entityType)}>
                              {workflow.entityType.replace('_', ' ')}
                            </Badge>
                            <Badge variant={workflow.isActive ? 'default' : 'secondary'}>
                              {workflow.isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <Badge variant={workflow.autoApproval ? 'outline' : 'secondary'}>
                              {workflow.autoApproval ? 'Auto' : 'Manual'}
                            </Badge>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {expandedWorkflows.has(workflow.id) && (
                          <div className="mt-4 space-y-4">
                            <div>
                              <h5 className="font-medium text-sm text-gray-700 mb-2">Approval Steps</h5>
                              <div className="space-y-2">
                                {renderWorkflowSteps(workflow.steps)}
                              </div>
                            </div>
                            
                            {workflow.conditions && (
                              <div>
                                <h5 className="font-medium text-sm text-gray-700 mb-2">Conditions</h5>
                                <div className="bg-gray-50 p-2 rounded text-sm">
                                  {workflow.conditions}
                                </div>
                              </div>
                            )}
                            
                            {workflow.escalationRules && (
                              <div>
                                <h5 className="font-medium text-sm text-gray-700 mb-2">Escalation Rules</h5>
                                <div className="bg-gray-50 p-2 rounded text-sm">
                                  {workflow.escalationRules}
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <span>Created: {format(new Date(workflow.createdAt), 'MMM dd, yyyy')}</span>
                              <span>{workflow.approvals.length} approvals</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Action Dialog */}
      <Dialog open={isActionDialogOpen} onOpenChange={setIsActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approval Action</DialogTitle>
          </DialogHeader>
          {selectedApproval && (
            <Form {...actionForm}>
              <form onSubmit={actionForm.handleSubmit(onSubmitAction)} className="space-y-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Entity Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <Badge className={`ml-2 ${getEntityTypeColor(selectedApproval.entityType)}`}>
                        {selectedApproval.entityType.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">ID:</span>
                      <span className="ml-2">{selectedApproval.entity.number || selectedApproval.entityId}</span>
                    </div>
                    {selectedApproval.entity.amount && (
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <span className="ml-2">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD'
                          }).format(selectedApproval.entity.amount)}
                        </span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-600">Step:</span>
                      <span className="ml-2">{selectedApproval.stepNumber}</span>
                    </div>
                  </div>
                </div>
                
                <Separator />
                
                <FormField
                  control={actionForm.control}
                  name="action"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Action</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="approve">Approve</SelectItem>
                          <SelectItem value="reject">Reject</SelectItem>
                          <SelectItem value="escalate">Escalate</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={actionForm.control}
                  name="comments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Comments</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Add your comments..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={actionForm.control}
                  name="escalationReason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Escalation Reason (if escalating)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Reason for escalation..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateApproval.isPending}>
                    {updateApproval.isPending ? 'Processing...' : 'Submit Action'}
                  </Button>
                </div>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  )
}
