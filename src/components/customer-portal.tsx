import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { 
  FileText, 
  CreditCard, 
  Download, 
  Eye, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  RefreshCw
} from "lucide-react"
import apiService from '@/lib/api'

interface CustomerPortalProps {
  invoiceId: string
  customerEmail?: string
  onPaymentSuccess?: () => void
}

interface InvoiceData {
  id: string
  invoiceNumber: string
  issueDate: string
  dueDate?: string
  status: string
  totalAmount: number
  balanceDue: number
  currency: string
  customer?: {
    name: string
    email?: string
  }
  lines?: Array<{
    description: string
    quantity: number
    unitPrice: number
    lineTotal: number
  }>
}

interface PaymentStatus {
  invoiceId: string
  status: string
  balanceDue: number
  totalAmount: number
  hasPaymentLink: boolean
  paymentStatus: string
  lastPaymentDate?: string
  paymentMethod?: string
}

export function CustomerPortal({ invoiceId, customerEmail, onPaymentSuccess }: CustomerPortalProps) {
  const [invoice, setInvoice] = useState<InvoiceData | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [paymentLoading, setPaymentLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentLink, setPaymentLink] = useState<string | null>(null)

  useEffect(() => {
    loadInvoiceData()
  }, [invoiceId])

  const loadInvoiceData = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load invoice details
      const invoiceData = await apiService.get(`/invoices/${invoiceId}`)
      setInvoice(invoiceData)

      // Load payment status
      const statusData = await apiService.getPaymentStatus(invoiceId)
      setPaymentStatus(statusData)

    } catch (err) {
      console.error('Error loading invoice:', err)
      setError('Failed to load invoice details')
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePaymentLink = async () => {
    try {
      setPaymentLoading(true)
      setError(null)

      const paymentData = await apiService.createPaymentLink(invoiceId, {
        customerEmail: customerEmail || invoice?.customer?.email,
        customerName: invoice?.customer?.name,
        description: `Payment for Invoice ${invoice?.invoiceNumber}`,
        expiresInMinutes: 1440 // 24 hours
      })

      setPaymentLink(paymentData.url)
    } catch (err) {
      console.error('Error creating payment link:', err)
      setError('Failed to create payment link')
    } finally {
      setPaymentLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    try {
      const blob = await apiService.getInvoicePdf(invoiceId)
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `invoice-${invoice?.invoiceNumber || invoiceId}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (err) {
      console.error('Error downloading PDF:', err)
      setError('Failed to download PDF')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'text-green-600 bg-green-100'
      case 'sent': return 'text-blue-600 bg-blue-100'
      case 'draft': return 'text-gray-600 bg-gray-100'
      case 'overdue': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'sent': return <Clock className="w-4 h-4 text-blue-600" />
      case 'draft': return <FileText className="w-4 h-4 text-gray-600" />
      case 'overdue': return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return <FileText className="w-4 h-4 text-gray-600" />
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="space-y-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          </div>
          <div className="animate-pulse">
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !invoice) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="p-6 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Invoice</h3>
            <p className="text-gray-600 mb-4">{error || 'Invoice not found'}</p>
            <Button onClick={loadInvoiceData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Invoice {invoice.invoiceNumber}</h1>
          <p className="text-gray-600 mt-1">
            Issued on {new Date(invoice.issueDate).toLocaleDateString()}
            {invoice.dueDate && (
              <span className="ml-2">
                • Due {new Date(invoice.dueDate).toLocaleDateString()}
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(invoice.status)}
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status}
          </Badge>
        </div>
      </div>

      {/* Payment Status */}
      {paymentStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Payment Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-500">Total Amount</Label>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(paymentStatus.totalAmount, invoice.currency)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Balance Due</Label>
                <div className={`text-2xl font-bold ${paymentStatus.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {formatCurrency(paymentStatus.balanceDue, invoice.currency)}
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-500">Payment Status</Label>
                <div className="text-lg font-semibold capitalize">
                  {paymentStatus.paymentStatus}
                </div>
                {paymentStatus.lastPaymentDate && (
                  <div className="text-sm text-gray-500">
                    Last payment: {new Date(paymentStatus.lastPaymentDate).toLocaleDateString()}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Actions */}
      {paymentStatus && paymentStatus.balanceDue > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pay Invoice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {paymentLink ? (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Payment Link Created</span>
                  </div>
                  <p className="text-green-700 mb-3">
                    Click the button below to complete your payment securely.
                  </p>
                  <Button 
                    onClick={() => window.open(paymentLink, '_blank')}
                    className="w-full"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Pay Now - {formatCurrency(paymentStatus.balanceDue, invoice.currency)}
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-gray-600">
                    Pay your invoice securely using your credit card, debit card, or bank account.
                  </p>
                  <Button 
                    onClick={handleCreatePaymentLink}
                    disabled={paymentLoading}
                    className="w-full"
                  >
                    {paymentLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Creating Payment Link...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4 mr-2" />
                        Pay {formatCurrency(paymentStatus.balanceDue, invoice.currency)}
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoice Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoice Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Customer Information */}
            {invoice.customer && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Bill To</Label>
                <div className="mt-1">
                  <div className="font-medium">{invoice.customer.name}</div>
                  {invoice.customer.email && (
                    <div className="text-gray-600">{invoice.customer.email}</div>
                  )}
                </div>
              </div>
            )}

            {/* Invoice Lines */}
            {invoice.lines && invoice.lines.length > 0 && (
              <div>
                <Label className="text-sm font-medium text-gray-500 mb-3 block">Items</Label>
                <div className="space-y-2">
                  {invoice.lines.map((line, index) => (
                    <div key={index} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <div className="flex-1">
                        <div className="font-medium">{line.description}</div>
                        <div className="text-sm text-gray-500">
                          {line.quantity} × {formatCurrency(line.unitPrice, invoice.currency)}
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(line.lineTotal, invoice.currency)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Total */}
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total</span>
                <span className="text-2xl font-bold">
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <Button variant="outline" onClick={handleDownloadPDF}>
          <Download className="w-4 h-4 mr-2" />
          Download PDF
        </Button>
        
        {paymentStatus && paymentStatus.balanceDue === 0 && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Invoice Paid</span>
          </div>
        )}
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
    </div>
  )
}
