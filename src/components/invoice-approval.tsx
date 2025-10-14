import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Textarea } from "../components/ui/textarea"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog"
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  User, 
  Users,
  Workflow,
  Send,
  Eye,
  MessageSquare
} from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import apiService from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'
import { toast } from 'sonner'

interface InvoiceApprovalProps {
  invoiceId: string
  onApprovalComplete?: () => void
}

interface ApprovalData {
  id: string
  invoiceId: string
  invoiceNumber: string
  amount: number
  currency: string
  customerName: string
  dueDate: Date
  submittedAt: Date
  comments: string
}

interface ApprovalStatus {
  invoiceStatus: string
  approvals: Array<{
    id: string
    stepNumber: number
    approver: { id: string; name: string; email: string }
    status: string
    comments: string
    createdAt: Date
    processedAt?: Date
    workflow: { id: string; name: string }
  }>
}

export function InvoiceApproval({ invoiceId, onApprovalComplete }: InvoiceApprovalProps) {
  const [action, setAction] = useState<'approve' | 'reject' | 'escalate' | null>(null)
  const [comments, setComments] = useState('')
  const [escalationReason, setEscalationReason] = useState('')
  const [selectedApprovalId, setSelectedApprovalId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { isAuthenticated, ensureValidToken, handleAuthError } = useAuth()

  // Load pending approvals
  const { data: pendingApprovals, isLoading: loadingApprovals } = useQuery({
    queryKey: ['pending-approvals'],
    enabled: isAuthenticated && typeof window !== 'undefined' && !!localStorage.getItem('auth_token') && !!localStorage.getItem('tenant_id') && !!(localStorage.getItem('company_id') || localStorage.getItem('companyId') || localStorage.getItem('company')),
    queryFn: async () => {
      const ok = await ensureValidToken()
      if (!ok) throw new Error('Unauthorized')
      try {
        return await apiService.getPendingApprovals()
      } catch (err: any) {
        try {
          await handleAuthError()
        } catch {}
        // Gracefully degrade to empty data on persistent auth failure
        return { approvals: [] }
      }
    },
    refetchInterval: isAuthenticated ? 30000 : false,
  })

  // Load approval status for current invoice
  const { data: approvalStatus, isLoading: loadingStatus } = useQuery({
    queryKey: ['invoice-approval-status', invoiceId],
    queryFn: () => apiService.getInvoiceApprovalStatus(invoiceId),
    enabled: !!invoiceId
  })

  // Process approval action mutation
  const processApprovalMutation = useMutation({
    mutationFn: ({ approvalId, action, comments, escalationReason }: {
      approvalId: string
      action: 'approve' | 'reject' | 'escalate'
      comments?: string
      escalationReason?: string
    }) => apiService.processApprovalAction(approvalId, action, comments, escalationReason),
    onSuccess: () => {
      toast.success('Approval action processed successfully')
      queryClient.invalidateQueries({ queryKey: ['pending-approvals'] })
      queryClient.invalidateQueries({ queryKey: ['invoice-approval-status', invoiceId] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
      setAction(null)
      setComments('')
      setEscalationReason('')
      setSelectedApprovalId(null)
      onApprovalComplete?.()
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to process approval action')
    }
  })

  // Trigger approval workflow mutation
  const triggerApprovalMutation = useMutation({
    mutationFn: (workflowId?: string) => apiService.triggerInvoiceApproval(invoiceId, workflowId),
    onSuccess: () => {
      toast.success('Approval workflow triggered')
      queryClient.invalidateQueries({ queryKey: ['invoice-approval-status', invoiceId] })
      queryClient.invalidateQueries({ queryKey: ['invoices'] })
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to trigger approval workflow')
    }
  })

  const handleApprovalAction = () => {
    if (!selectedApprovalId || !action) return

    processApprovalMutation.mutate({
      approvalId: selectedApprovalId,
      action,
      comments: comments || undefined,
      escalationReason: action === 'escalate' ? escalationReason : undefined
    })
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'escalated': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved': return <CheckCircle className="w-4 h-4" />
      case 'rejected': return <XCircle className="w-4 h-4" />
      case 'pending': return <Clock className="w-4 h-4" />
      case 'escalated': return <AlertTriangle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  if (loadingApprovals || loadingStatus) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
    

      {/* Pending Approvals */}
      {pendingApprovals && pendingApprovals.approvals.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Pending Approvals ({pendingApprovals.approvals.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingApprovals.approvals.map((approval) => (
                <div key={approval.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{approval.invoiceNumber}</h4>
                      <div className="text-sm text-gray-600">
                        {approval.customerName} • {approval.currency} {approval.amount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">
                        Due: {new Date(approval.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      PENDING
                    </Badge>
                  </div>

                  {approval.comments && (
                    <div className="mb-3 p-2 bg-gray-50 rounded text-sm">
                      <strong>Comments:</strong> {approval.comments}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedApprovalId(approval.id)
                            setAction('approve')
                          }}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Approve Invoice</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Comments (Optional)</Label>
                            <Textarea
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                              placeholder="Add approval comments..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleApprovalAction}
                              disabled={processApprovalMutation.isPending}
                              className="flex-1"
                            >
                              {processApprovalMutation.isPending ? 'Processing...' : 'Approve'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setAction(null)
                                setComments('')
                                setSelectedApprovalId(null)
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedApprovalId(approval.id)
                            setAction('reject')
                          }}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Reject Invoice</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Reason for Rejection *</Label>
                            <Textarea
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                              placeholder="Please provide a reason for rejection..."
                              required
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              variant="destructive"
                              onClick={handleApprovalAction}
                              disabled={processApprovalMutation.isPending || !comments.trim()}
                              className="flex-1"
                            >
                              {processApprovalMutation.isPending ? 'Processing...' : 'Reject'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setAction(null)
                                setComments('')
                                setSelectedApprovalId(null)
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedApprovalId(approval.id)
                            setAction('escalate')
                          }}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Escalate
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Escalate Invoice</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div>
                            <Label>Escalation Reason *</Label>
                            <Textarea
                              value={escalationReason}
                              onChange={(e) => setEscalationReason(e.target.value)}
                              placeholder="Please provide a reason for escalation..."
                              required
                            />
                          </div>
                          <div>
                            <Label>Additional Comments</Label>
                            <Textarea
                              value={comments}
                              onChange={(e) => setComments(e.target.value)}
                              placeholder="Additional comments..."
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button 
                              onClick={handleApprovalAction}
                              disabled={processApprovalMutation.isPending || !escalationReason.trim()}
                              className="flex-1"
                            >
                              {processApprovalMutation.isPending ? 'Processing...' : 'Escalate'}
                            </Button>
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setAction(null)
                                setComments('')
                                setEscalationReason('')
                                setSelectedApprovalId(null)
                              }}
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Pending Approvals */}
      {pendingApprovals && pendingApprovals.approvals.length === 0 && (
        <Card>
          <CardContent className="p-6 text-center">
            <Clock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Approvals</h3>
            <p className="text-gray-600">You have no invoices waiting for your approval.</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
