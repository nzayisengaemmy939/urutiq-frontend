"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Download, ExternalLink } from "lucide-react"
import { PaymentButtonProminent } from "@/components/payment-button"

interface InvoiceTemplateProps {
  invoice: {
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
      address?: string
    }
    lines?: Array<{
      description: string
      quantity: number
      unitPrice: number
      lineTotal: number
    }>
  }
  company: {
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
  onDownloadPDF?: () => void
  onPaymentSuccess?: () => void
  onPaymentError?: (error: string) => void
}

export function InvoiceTemplate({ 
  invoice, 
  company, 
  onDownloadPDF, 
  onPaymentSuccess, 
  onPaymentError 
}: InvoiceTemplateProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return 'bg-green-100 text-green-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'overdue': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const templateStyle = company.invoiceTemplate || 'modern'
  const primaryColor = company.primaryColor || '#009688'
  const secondaryColor = company.secondaryColor || '#1565c0'
  const fontFamily = company.fontFamily || 'Inter'

  const renderModernTemplate = () => (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-8 border-b" style={{ backgroundColor: `${primaryColor}10` }}>
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              {company.logoUrl && company.showLogo && (
                <img 
                  src={company.logoUrl} 
                  alt="Company logo" 
                  className="w-16 h-16 object-contain"
                />
              )}
              <div>
                <h1 className="text-3xl font-bold" style={{ color: primaryColor, fontFamily }}>
                  {company.name}
                </h1>
                <div className="text-gray-600 mt-1">
                  {company.showWebsite && company.website && (
                    <div>{company.website}</div>
                  )}
                  {company.showAddress && company.address && (
                    <div>
                      {company.address}
                      {company.city && `, ${company.city}`}
                      {company.state && `, ${company.state}`}
                      {company.postalCode && ` ${company.postalCode}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold text-gray-900" style={{ fontFamily }}>INVOICE</h2>
              <div className="text-lg font-semibold mt-1" style={{ color: primaryColor }}>
                {invoice.invoiceNumber}
              </div>
              <Badge className={`mt-2 ${getStatusColor(invoice.status)}`}>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Invoice Details */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3" style={{ fontFamily }}>Bill To</h3>
              <div className="text-gray-700">
                <div className="font-medium">{invoice.customer?.name}</div>
                {invoice.customer?.email && <div>{invoice.customer.email}</div>}
                {invoice.customer?.address && <div>{invoice.customer.address}</div>}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3" style={{ fontFamily }}>Invoice Details</h3>
              <div className="space-y-1 text-gray-700">
                <div className="flex justify-between">
                  <span>Issue Date:</span>
                  <span>{new Date(invoice.issueDate).toLocaleDateString()}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between">
                    <span>Due Date:</span>
                    <span>{new Date(invoice.dueDate).toLocaleDateString()}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="capitalize">{invoice.status}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Line Items */}
          {invoice.lines && invoice.lines.length > 0 && (
            <div className="mb-8">
              <div className="overflow-hidden border border-gray-200 rounded-lg">
                <table className="w-full">
                  <thead style={{ backgroundColor: `${secondaryColor}10` }}>
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-900" style={{ fontFamily }}>Description</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-900" style={{ fontFamily }}>Qty</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900" style={{ fontFamily }}>Rate</th>
                      <th className="px-4 py-3 text-right font-semibold text-gray-900" style={{ fontFamily }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.lines.map((line, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-4 py-3 text-gray-700">{line.description}</td>
                        <td className="px-4 py-3 text-center text-gray-700">{line.quantity}</td>
                        <td className="px-4 py-3 text-right text-gray-700">{formatCurrency(line.unitPrice, invoice.currency)}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-900">{formatCurrency(line.lineTotal, invoice.currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between text-lg">
                <span className="font-semibold" style={{ fontFamily }}>Total</span>
                <span className="font-bold text-2xl" style={{ color: primaryColor }}>
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </span>
              </div>
              {invoice.balanceDue > 0 && (
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Balance Due:</span>
                  <span className="font-semibold">{formatCurrency(invoice.balanceDue, invoice.currency)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Payment Section */}
          {invoice.balanceDue > 0 && (
            <div className="mb-8 p-6 rounded-lg" style={{ backgroundColor: `${primaryColor}05`, border: `1px solid ${primaryColor}20` }}>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2" style={{ color: primaryColor, fontFamily }}>
                  Pay Online Securely
                </h3>
                <p className="text-gray-600 mb-4">
                  Complete your payment instantly using your credit card, debit card, or bank account.
                </p>
                <PaymentButtonProminent
                  invoiceId={invoice.id}
                  amount={invoice.balanceDue}
                  currency={invoice.currency}
                  customerEmail={invoice.customer?.email}
                  customerName={invoice.customer?.name}
                  description={`Payment for Invoice ${invoice.invoiceNumber}`}
                  onPaymentSuccess={onPaymentSuccess}
                  onPaymentError={onPaymentError}
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2" style={{ fontFamily }}>Contact Information</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  {company.email && <div>{company.email}</div>}
                  {company.phone && <div>{company.phone}</div>}
                  {company.showWebsite && company.website && <div>{company.website}</div>}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 mb-2" style={{ fontFamily }}>Payment Terms</h4>
                <div className="text-sm text-gray-600">
                  {company.invoiceTerms || 'Payment is due within 30 days of invoice date.'}
                </div>
              </div>
            </div>
            {company.invoiceFooter && (
              <div className="mt-6 text-center text-sm text-gray-500">
                {company.invoiceFooter}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderClassicTemplate = () => (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardContent className="p-0">
        {/* Header */}
        <div className="p-8 border-b-2" style={{ borderColor: primaryColor }}>
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              {company.logoUrl && company.showLogo && (
                <img 
                  src={company.logoUrl} 
                  alt="Company logo" 
                  className="w-12 h-12 object-contain"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily }}>
                  {company.name}
                </h1>
                <div className="text-sm text-gray-600">
                  {company.showAddress && company.address && (
                    <div>
                      {company.address}
                      {company.city && `, ${company.city}`}
                      {company.state && `, ${company.state}`}
                      {company.postalCode && ` ${company.postalCode}`}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold" style={{ color: primaryColor, fontFamily }}>
                INVOICE
              </div>
              <div className="text-lg font-semibold mt-1 text-gray-900">
                {invoice.invoiceNumber}
              </div>
            </div>
          </div>
        </div>

        {/* Content similar to modern but with classic styling */}
        <div className="p-8">
          {/* Rest of the content with classic styling */}
          <div className="text-center py-8">
            <p className="text-gray-500">Classic template content would go here</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderMinimalTemplate = () => (
    <Card className="max-w-3xl mx-auto shadow-sm">
      <CardContent className="p-8">
        {/* Minimal header */}
        <div className="text-center mb-8">
          {company.logoUrl && company.showLogo && (
            <img 
              src={company.logoUrl} 
              alt="Company logo" 
              className="w-16 h-16 object-contain mx-auto mb-4"
            />
          )}
          <h1 className="text-2xl font-light text-gray-900" style={{ fontFamily }}>
            {company.name}
          </h1>
          <div className="text-sm text-gray-500 mt-2">
            Invoice {invoice.invoiceNumber}
          </div>
        </div>

        {/* Minimal content */}
        <div className="text-center py-8">
          <p className="text-gray-500">Minimal template content would go here</p>
        </div>
      </CardContent>
    </Card>
  )

  const renderProfessionalTemplate = () => (
    <Card className="max-w-4xl mx-auto shadow-lg">
      <CardContent className="p-0">
        {/* Professional header with structured layout */}
        <div className="p-8 bg-gray-50 border-b">
          <div className="grid grid-cols-3 gap-8">
            <div className="col-span-2">
              {company.logoUrl && company.showLogo && (
                <img 
                  src={company.logoUrl} 
                  alt="Company logo" 
                  className="w-16 h-16 object-contain mb-4"
                />
              )}
              <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily }}>
                {company.name}
              </h1>
              <div className="text-sm text-gray-600 mt-2">
                {company.showAddress && company.address && (
                  <div>
                    {company.address}
                    {company.city && `, ${company.city}`}
                    {company.state && `, ${company.state}`}
                    {company.postalCode && ` ${company.postalCode}`}
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold" style={{ color: primaryColor, fontFamily }}>
                INVOICE
              </div>
              <div className="text-lg font-semibold mt-1 text-gray-900">
                {invoice.invoiceNumber}
              </div>
              <Badge className={`mt-2 ${getStatusColor(invoice.status)}`}>
                {invoice.status.toUpperCase()}
              </Badge>
            </div>
          </div>
        </div>

        {/* Professional content */}
        <div className="p-8">
          <div className="text-center py-8">
            <p className="text-gray-500">Professional template content would go here</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  const renderTemplate = () => {
    switch (templateStyle) {
      case 'classic':
        return renderClassicTemplate()
      case 'minimal':
        return renderMinimalTemplate()
      case 'professional':
        return renderProfessionalTemplate()
      default:
        return renderModernTemplate()
    }
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-blue-600 border-blue-600">
            {templateStyle.charAt(0).toUpperCase() + templateStyle.slice(1)} Template
          </Badge>
          <Badge className={getStatusColor(invoice.status)}>
            {invoice.status.toUpperCase()}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onDownloadPDF}>
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Share Link
          </Button>
        </div>
      </div>

      {/* Template */}
      {renderTemplate()}
    </div>
  )
}
