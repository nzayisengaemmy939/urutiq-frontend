"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { 
  CreditCard, 
  ExternalLink, 
  RefreshCw, 
  CheckCircle, 
  AlertCircle,
  Copy,
  Eye
} from "lucide-react"
import apiService from '@/lib/api'

interface PaymentButtonProps {
  invoiceId: string
  amount: number
  currency: string
  customerEmail?: string
  customerName?: string
  description?: string
  variant?: 'default' | 'outline' | 'secondary'
  size?: 'sm' | 'default' | 'lg'
  showAmount?: boolean
  onPaymentSuccess?: () => void
  onPaymentError?: (error: string) => void
}

export function PaymentButton({
  invoiceId,
  amount,
  currency,
  customerEmail,
  customerName,
  description,
  variant = 'default',
  size = 'default',
  showAmount = true,
  onPaymentSuccess,
  onPaymentError
}: PaymentButtonProps) {
  const [loading, setLoading] = useState(false)
  const [paymentLink, setPaymentLink] = useState<string | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const handleCreatePaymentLink = async () => {
    try {
      setLoading(true)
      setError(null)

      const paymentData = await apiService.createPaymentLink(invoiceId, {
        customerEmail,
        customerName,
        description: description || `Payment for Invoice ${invoiceId}`,
        expiresInMinutes: 1440 // 24 hours
      })

      setPaymentLink(paymentData.url)
      setShowDialog(true)
    } catch (err) {
      console.error('Error creating payment link:', err)
      const errorMessage = 'Failed to create payment link'
      setError(errorMessage)
      onPaymentError?.(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  const handleDirectPayment = () => {
    if (paymentLink) {
      window.open(paymentLink, '_blank')
    }
  }

  const copyPaymentLink = async () => {
    if (paymentLink) {
      try {
        await navigator.clipboard.writeText(paymentLink)
        // Could add a toast notification here
      } catch (err) {
        console.error('Failed to copy link:', err)
      }
    }
  }

  const getButtonText = () => {
    if (loading) {
      return 'Creating Payment...'
    }
    if (showAmount) {
      return `Pay ${formatCurrency(amount, currency)}`
    }
    return 'Pay Now'
  }

  const getButtonIcon = () => {
    if (loading) {
      return <RefreshCw className="w-4 h-4 animate-spin" />
    }
    return <CreditCard className="w-4 h-4" />
  }

  return (
    <>
      <Button
        onClick={handleCreatePaymentLink}
        disabled={loading}
        variant={variant}
        size={size}
        className="min-w-[120px]"
      >
        {getButtonIcon()}
        <span className="ml-2">{getButtonText()}</span>
      </Button>

      {/* Payment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Secure Payment
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {error ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Payment Error</span>
                </div>
                <p className="text-red-700 mt-1">{error}</p>
              </div>
            ) : paymentLink ? (
              <>
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">Payment Link Ready</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    Click below to complete your payment securely.
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium">Amount Due</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {formatCurrency(amount, currency)}
                      </div>
                    </div>
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      Secure Payment
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <Button 
                      onClick={handleDirectPayment}
                      className="w-full"
                      size="lg"
                    >
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Pay Now - {formatCurrency(amount, currency)}
                    </Button>
                    
                    <Button 
                      onClick={copyPaymentLink}
                      variant="outline"
                      className="w-full"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Payment Link
                    </Button>
                  </div>

                  <div className="text-xs text-gray-500 text-center">
                    Payment link expires in 24 hours
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600">Creating secure payment link...</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Compact version for inline use
export function PaymentButtonCompact({
  invoiceId,
  amount,
  currency,
  customerEmail,
  customerName,
  description,
  onPaymentSuccess,
  onPaymentError
}: Omit<PaymentButtonProps, 'variant' | 'size' | 'showAmount'>) {
  return (
    <PaymentButton
      invoiceId={invoiceId}
      amount={amount}
      currency={currency}
      customerEmail={customerEmail}
      customerName={customerName}
      description={description}
      variant="outline"
      size="sm"
      showAmount={false}
      onPaymentSuccess={onPaymentSuccess}
      onPaymentError={onPaymentError}
    />
  )
}

// Large prominent version
export function PaymentButtonProminent({
  invoiceId,
  amount,
  currency,
  customerEmail,
  customerName,
  description,
  onPaymentSuccess,
  onPaymentError
}: Omit<PaymentButtonProps, 'variant' | 'size' | 'showAmount'>) {
  return (
    <PaymentButton
      invoiceId={invoiceId}
      amount={amount}
      currency={currency}
      customerEmail={customerEmail}
      customerName={customerName}
      description={description}
      variant="default"
      size="lg"
      showAmount={true}
      onPaymentSuccess={onPaymentSuccess}
      onPaymentError={onPaymentError}
    />
  )
}
