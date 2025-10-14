import { Card, CardContent } from "../components/ui/card"
import { Badge } from "../components/ui/badge"
import { Button } from "../components/ui/button"
import { Download, Printer, Share2, Copy } from "lucide-react"
import { PaymentButtonProminent } from "../components/payment-button"
import { useEffect, useRef, useState } from "react"
import QRCode from "qrcode"
import { InvoicePDFGenerator } from "../lib/invoice-pdf-generator"
import { useToast } from "@/hooks/use-toast"

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
    subtotal?: number
    taxAmount?: number
    discountAmount?: number
    customer?: {
      name: string
      email?: string
      address?: string
      phone?: string
      taxId?: string
    }
    lines?: Array<{
      description: string
      quantity: number
      unitPrice: number
      lineTotal: number
      taxRate?: number
    }>
    notes?: string
    paymentUrl?: string
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
    taxId?: string
    invoiceTemplate?: string
    invoiceFooter?: string
    invoiceTerms?: string
    showLogo?: boolean
    showWebsite?: boolean
    showAddress?: boolean
    showQRCode?: boolean
    showBarcode?: boolean
  }
  onDownloadPDF?: () => void
  onPrint?: () => void
  onPaymentSuccess?: () => void
  onPaymentError?: (error: string) => void
}

export function InvoiceTemplate({ 
  invoice, 
  company, 
  onDownloadPDF,
  onPrint, 
  onPaymentSuccess, 
  onPaymentError 
}: InvoiceTemplateProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [barcodeUrl, setBarcodeUrl] = useState<string>('')
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const formatCurrency = (amount: number, currency: string) => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount)
    } catch {
      return `${currency} ${amount.toFixed(2)}`
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid': return { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' }
      case 'sent': return { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' }
      case 'draft': return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', dot: 'bg-gray-500' }
      case 'overdue': return { bg: 'bg-red-50 border-red-200', text: 'text-red-700', dot: 'bg-red-500' }
      case 'cancelled': return { bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' }
      default: return { bg: 'bg-gray-50 border-gray-200', text: 'text-gray-700', dot: 'bg-gray-500' }
    }
  }

  const templateStyle = company.invoiceTemplate || 'professional'
  const primaryColor = company.primaryColor || '#1f2937'
  const secondaryColor = company.secondaryColor || '#3b82f6'
  const fontFamily = company.fontFamily || 'Inter'

  // Generate QR code for payment URL or invoice details
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrData = invoice.paymentUrl || `Invoice: ${invoice.invoiceNumber}\nAmount: ${formatCurrency(invoice.totalAmount, invoice.currency)}\nDue: ${invoice.dueDate || 'N/A'}`
        const qrUrl = await QRCode.toDataURL(qrData, {
          width: 120,
          margin: 1,
          color: {
            dark: primaryColor,
            light: '#FFFFFF'
          }
        })
        setQrCodeUrl(qrUrl)
      } catch (error) {
        console.error('Error generating QR code:', error)
      }
    }

    if (company.showQRCode !== false) {
      generateQRCode()
    }
  }, [invoice, company.showQRCode, primaryColor])

  // Generate barcode for invoice number
  useEffect(() => {
    const generateBarcode = () => {
      try {
        if (canvasRef.current) {
          const canvas = canvasRef.current
          const ctx = canvas.getContext('2d')
          if (ctx) {
            // Simple barcode generation (Code 128 style)
            canvas.width = 200
            canvas.height = 50
            ctx.fillStyle = '#FFFFFF'
            ctx.fillRect(0, 0, canvas.width, canvas.height)
            
            ctx.fillStyle = primaryColor
            const barWidth = 2
            let x = 10
            
            // Generate bars based on invoice number
            const invoiceCode = invoice.invoiceNumber.replace(/[^0-9]/g, '') || '123456'
            for (let i = 0; i < invoiceCode.length; i++) {
              const digit = parseInt(invoiceCode[i])
              for (let j = 0; j < 5; j++) {
                if ((digit + j) % 2 === 0) {
                  ctx.fillRect(x, 5, barWidth, 35)
                }
                x += barWidth + 1
              }
              x += 3
            }
            
            // Add invoice number text below barcode
            ctx.fillStyle = '#374151'
            ctx.font = '10px monospace'
            ctx.textAlign = 'center'
            ctx.fillText(invoice.invoiceNumber, canvas.width / 2, 47)
            
            setBarcodeUrl(canvas.toDataURL())
          }
        }
      } catch (error) {
        console.error('Error generating barcode:', error)
      }
    }

    if (company.showBarcode !== false) {
      generateBarcode()
    }
  }, [invoice.invoiceNumber, company.showBarcode, primaryColor])

  const { toast } = useToast()

  const handlePrint = () => {
    if (onPrint) {
      onPrint()
    } else {
      window.print()
    }
  }

  const handleDownloadPDF = async () => {
    try {
      // Prioritize frontend generator for better templates
      const generator = new InvoicePDFGenerator({
        invoice: {
          ...invoice,
          subtotal: calculateSubtotal(),
          taxAmount: calculateTax()
        },
        company
      })
      
      await generator.download()
      toast({
        title: "PDF Downloaded",
        description: `Invoice ${invoice.invoiceNumber} has been downloaded successfully.`
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast({
        title: "Download Failed",
        description: "There was an error generating the PDF. Please try again.",
        variant: "destructive"
      })
      
      // Fallback to backend API if frontend generator fails
      if (onDownloadPDF) {
        onDownloadPDF()
      }
    }
  }

  const handleShareInvoice = async () => {
    try {
      const generator = new InvoicePDFGenerator({
        invoice: {
          ...invoice,
          subtotal: calculateSubtotal(),
          taxAmount: calculateTax()
        },
        company
      })
      
      const pdfBlob = await generator.generate()
      const pdfFile = new File([pdfBlob], `invoice-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' })
      
      if (navigator.share && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          title: `Invoice ${invoice.invoiceNumber}`,
          text: `Invoice for ${formatCurrency(invoice.totalAmount, invoice.currency)}`,
          files: [pdfFile]
        })
      } else {
        // Fallback: copy link
        const url = invoice.paymentUrl || window.location.href
        await navigator.clipboard.writeText(url)
        toast({
          title: "Link Copied",
          description: "Invoice link has been copied to clipboard."
        })
      }
    } catch (error) {
      console.error('Error sharing invoice:', error)
      toast({
        title: "Share Failed",
        description: "There was an error sharing the invoice.",
        variant: "destructive"
      })
    }
  }

  const calculateSubtotal = () => {
    return invoice.lines?.reduce((sum, line) => sum + line.lineTotal, 0) || invoice.subtotal || 0
  }

  const calculateTax = () => {
    return invoice.taxAmount || invoice.lines?.reduce((sum, line) => {
      const lineSubtotal = line.lineTotal
      const taxRate = line.taxRate || 0
      return sum + (lineSubtotal * taxRate / 100)
    }, 0) || 0
  }

  const renderProfessionalTemplate = () => {
    const statusStyle = getStatusColor(invoice.status)
    const subtotal = calculateSubtotal()
    const taxAmount = calculateTax()
    const discount = invoice.discountAmount || 0
    
    return (
      <div className="max-w-5xl mx-auto bg-white shadow-xl print:shadow-none print:max-w-none" style={{ fontFamily }}>
        {/* Hidden canvas for barcode generation */}
        <canvas ref={canvasRef} style={{ display: 'none' }} />
        
        {/* Professional Header */}
        <div className="relative bg-white border-b-2 print:border-b-1" style={{ borderColor: primaryColor }}>
          <div className="absolute inset-0 bg-gradient-to-r from-gray-50 to-white opacity-50"></div>
          <div className="relative px-8 py-6">
            <div className="flex justify-between items-start">
              {/* Company Information */}
              <div className="flex items-start space-x-6">
                {company.logoUrl && company.showLogo && (
                  <div className="flex-shrink-0">
                    <div className="w-20 h-20 bg-white rounded-lg shadow-md p-2 border">
                      <img 
                        src={company.logoUrl} 
                        alt={`${company.name} logo`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold text-gray-900" style={{ color: primaryColor }}>
                    {company.name}
                  </h1>
                  {(company.showAddress && company.address) && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <div>{company.address}</div>
                      {(company.city || company.state || company.postalCode) && (
                        <div>
                          {[company.city, company.state, company.postalCode].filter(Boolean).join(', ')}
                        </div>
                      )}
                    </div>
                  )}
                  <div className="text-sm text-gray-600 space-y-1">
                    {company.email && <div>Email: {company.email}</div>}
                    {company.phone && <div>Phone: {company.phone}</div>}
                    {company.showWebsite && company.website && <div>Web: {company.website}</div>}
                    {company.taxId && <div>Tax ID: {company.taxId}</div>}
                  </div>
                </div>
              </div>

              {/* Invoice Header */}
              <div className="text-right space-y-4">
                <div>
                  <h2 className="text-4xl font-bold text-gray-900 mb-2">INVOICE</h2>
                  <div className="text-2xl font-semibold text-gray-700">#{invoice.invoiceNumber}</div>
                </div>
                
                {/* Status Badge */}
                <div className={`inline-flex items-center px-4 py-2 rounded-full border ${statusStyle.bg} ${statusStyle.text}`}>
                  <div className={`w-2 h-2 rounded-full mr-2 ${statusStyle.dot}`}></div>
                  <span className="font-semibold text-sm uppercase tracking-wide">{invoice.status}</span>
                </div>

                {/* QR Code and Barcode */}
                <div className="flex flex-col items-end space-y-3 print:space-y-2">
                  {qrCodeUrl && company.showQRCode !== false && (
                    <div className="text-center">
                      <img src={qrCodeUrl} alt="Invoice QR Code" className="w-24 h-24 print:w-20 print:h-20" />
                      <div className="text-xs text-gray-500 mt-1">Scan to Pay</div>
                    </div>
                  )}
                  {barcodeUrl && company.showBarcode !== false && (
                    <div className="text-center">
                      <img src={barcodeUrl} alt="Invoice Barcode" className="h-12 print:h-10" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Invoice Details Section */}
        <div className="px-8 py-6 bg-gray-50 print:bg-white">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Bill To */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                Bill To
              </h3>
              <div className="space-y-2 text-sm">
                <div className="font-semibold text-gray-900 text-base">{invoice.customer?.name}</div>
                {invoice.customer?.address && <div className="text-gray-600">{invoice.customer.address}</div>}
                {invoice.customer?.email && <div className="text-gray-600">{invoice.customer.email}</div>}
                {invoice.customer?.phone && <div className="text-gray-600">{invoice.customer.phone}</div>}
                {invoice.customer?.taxId && <div className="text-gray-600">Tax ID: {invoice.customer.taxId}</div>}
              </div>
            </div>

            {/* Invoice Info */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                Invoice Details
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Issue Date:</span>
                  <span className="font-medium">{new Date(invoice.issueDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Due Date:</span>
                    <span className="font-medium">{new Date(invoice.dueDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Currency:</span>
                  <span className="font-medium">{invoice.currency}</span>
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-300 pb-2">
                Payment Summary
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-semibold">{formatCurrency(invoice.totalAmount, invoice.currency)}</span>
                </div>
                {invoice.balanceDue > 0 && (
                  <div className="flex justify-between text-red-600">
                    <span>Amount Due:</span>
                    <span className="font-bold">{formatCurrency(invoice.balanceDue, invoice.currency)}</span>
                  </div>
                )}
                {invoice.status === 'paid' && (
                  <div className="text-green-600 font-semibold text-center py-2 bg-green-50 rounded">
                    ✓ PAID IN FULL
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table */}
        {invoice.lines && invoice.lines.length > 0 && (
          <div className="px-8 py-6">
            <div className="overflow-hidden rounded-lg border border-gray-200">
              <table className="w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Qty
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Rate
                    </th>
                    {invoice.lines.some(line => line.taxRate && line.taxRate > 0) && (
                      <th className="px-6 py-4 text-center text-xs font-semibold text-gray-900 uppercase tracking-wider">
                        Tax
                      </th>
                    )}
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.lines.map((line, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {line.description}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-center">
                        {line.quantity}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-700 text-right">
                        {formatCurrency(line.unitPrice, invoice.currency)}
                      </td>
                      {invoice.lines?.some(l => l.taxRate && l.taxRate > 0) && (
                        <td className="px-6 py-4 text-sm text-gray-700 text-center">
                          {line.taxRate ? `${line.taxRate}%` : '—'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-sm text-gray-900 font-semibold text-right">
                        {formatCurrency(line.lineTotal, invoice.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Totals Section */}
        <div className="px-8 py-6 bg-gray-50 print:bg-white">
          <div className="flex justify-end">
            <div className="w-full max-w-sm space-y-3">
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span className="text-sm font-medium text-gray-600">Subtotal:</span>
                <span className="text-sm font-semibold text-gray-900">
                  {formatCurrency(subtotal, invoice.currency)}
                </span>
              </div>
              
              {discount > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="text-sm font-medium text-gray-600">Discount:</span>
                  <span className="text-sm font-semibold text-red-600">
                    -{formatCurrency(discount, invoice.currency)}
                  </span>
                </div>
              )}
              
              {taxAmount > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span className="text-sm font-medium text-gray-600">Tax:</span>
                  <span className="text-sm font-semibold text-gray-900">
                    {formatCurrency(taxAmount, invoice.currency)}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between py-3 border-t-2 border-gray-400">
                <span className="text-lg font-bold text-gray-900">Total:</span>
                <span className="text-lg font-bold" style={{ color: primaryColor }}>
                  {formatCurrency(invoice.totalAmount, invoice.currency)}
                </span>
              </div>
              
              {invoice.balanceDue > 0 && (
                <div className="flex justify-between py-2 bg-red-50 px-4 rounded border border-red-200">
                  <span className="text-sm font-bold text-red-700">Balance Due:</span>
                  <span className="text-sm font-bold text-red-700">
                    {formatCurrency(invoice.balanceDue, invoice.currency)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {invoice.notes && (
          <div className="px-8 py-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-900 mb-2">Notes:</h4>
            <p className="text-sm text-gray-600 whitespace-pre-wrap">{invoice.notes}</p>
          </div>
        )}

        {/* Payment Section */}
        {invoice.balanceDue > 0 && invoice.status !== 'paid' && (
          <div className="px-8 py-6 bg-blue-50 print:hidden border-t border-blue-200">
            <div className="text-center space-y-4">
              <h3 className="text-xl font-semibold text-blue-900">
                Pay This Invoice Online
              </h3>
              <p className="text-blue-700 text-sm">
                Secure payment processing • Credit cards, bank transfers, and digital wallets accepted
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
        <div className="px-8 py-6 bg-gray-100 print:bg-white border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Payment Terms</h4>
              <p className="text-gray-600">
                {company.invoiceTerms || 'Payment is due within 30 days of invoice date. Late payments may incur additional fees as per our terms of service.'}
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Questions?</h4>
              <p className="text-gray-600">
                Contact us at {company.email || 'billing@company.com'} or {company.phone || '+1 (555) 123-4567'} 
                for any questions about this invoice.
              </p>
            </div>
          </div>
          
          {company.invoiceFooter && (
            <div className="mt-6 pt-4 border-t border-gray-300 text-center">
              <p className="text-sm text-gray-500">{company.invoiceFooter}</p>
            </div>
          )}
          
          <div className="mt-4 text-center text-xs text-gray-400">
            Generated on {new Date().toLocaleString()} • Invoice #{invoice.invoiceNumber}
          </div>
        </div>
      </div>
    )
  }

  const renderModernTemplate = () => (
    <div className="max-w-5xl mx-auto bg-white shadow-2xl print:shadow-none" style={{ fontFamily }}>
      {/* Premium Header with Sophisticated Design */}
      <div className="premium-header relative overflow-hidden" style={{ 
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        color: 'white'
      }}>
        {/* Subtle Pattern Overlay */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, white 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, white 1px, transparent 1px)`,
            backgroundSize: '40px 40px, 20px 20px'
          }}></div>
        </div>
        
        <div className="relative p-10">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-8">
              {company.logoUrl && company.showLogo && (
                <div className="w-24 h-24 bg-white rounded-2xl p-3 shadow-xl">
                  <img 
                    src={company.logoUrl} 
                    alt="Company logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-5xl font-bold mb-3 tracking-tight" style={{ fontFamily }}>
                  {company.name}
                </h1>
                <div className="text-white/90 text-xl space-y-1">
                  {company.showWebsite && company.website && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="font-medium">{company.website}</span>
                    </div>
                  )}
                  {company.showAddress && company.address && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                      <span className="font-medium">
                        {company.address}
                        {company.city && `, ${company.city}`}
                        {company.state && `, ${company.state}`}
                        {company.postalCode && ` ${company.postalCode}`}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="bg-white/15 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <h2 className="text-4xl font-bold mb-3 tracking-wider" style={{ fontFamily }}>INVOICE</h2>
                <div className="text-3xl font-bold mb-4">
                  #{invoice.invoiceNumber}
                </div>
                <div className={`inline-block px-6 py-3 rounded-full text-sm font-bold ${
                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                  invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                  invoice.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {invoice.status.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Premium Invoice Details Section */}
      <div className="p-10">
        <div className="grid grid-cols-2 gap-16 mb-12">
          {/* Bill To Section */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${primaryColor}20` }}>
                <span className="text-xl font-bold" style={{ color: primaryColor }}>B</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily }}>Bill To</h3>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
              <div className="text-gray-900">
                <div className="text-2xl font-bold mb-3">{invoice.customer?.name}</div>
                {invoice.customer?.email && (
                  <div className="text-gray-600 mb-2 flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-lg font-medium">{invoice.customer.email}</span>
                  </div>
                )}
                {invoice.customer?.address && (
                  <div className="text-gray-600 flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-lg font-medium">{invoice.customer.address}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Invoice Details */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${secondaryColor}20` }}>
                <span className="text-xl font-bold" style={{ color: secondaryColor }}>I</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900" style={{ fontFamily }}>Invoice Details</h3>
            </div>
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-300">
                  <span className="font-semibold text-gray-600 text-lg">Issue Date:</span>
                  <span className="font-bold text-gray-900 text-lg">{new Date(invoice.issueDate).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}</span>
                </div>
                {invoice.dueDate && (
                  <div className="flex justify-between items-center py-3 border-b border-gray-300">
                    <span className="font-semibold text-gray-600 text-lg">Due Date:</span>
                    <span className="font-bold text-gray-900 text-lg">{new Date(invoice.dueDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3">
                  <span className="font-semibold text-gray-600 text-lg">Status:</span>
                  <span className="font-bold text-gray-900 text-lg capitalize">{invoice.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Line Items Table */}
        {invoice.lines && invoice.lines.length > 0 && (
          <div className="premium-table mb-12">
            <div className="overflow-hidden border-2 border-gray-200 rounded-2xl shadow-lg">
              <table className="w-full">
                <thead>
                  <tr style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}>
                    <th className="px-8 py-6 text-left font-bold text-white text-lg uppercase tracking-wider" style={{ fontFamily }}>
                      Description
                    </th>
                    <th className="px-8 py-6 text-center font-bold text-white text-lg uppercase tracking-wider" style={{ fontFamily }}>
                      Qty
                    </th>
                    <th className="px-8 py-6 text-right font-bold text-white text-lg uppercase tracking-wider" style={{ fontFamily }}>
                      Rate
                    </th>
                    <th className="px-8 py-6 text-right font-bold text-white text-lg uppercase tracking-wider" style={{ fontFamily }}>
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y-2 divide-gray-200">
                  {invoice.lines.map((line, index) => (
                    <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-8 py-6 text-gray-900 font-semibold text-lg">{line.description}</td>
                      <td className="px-8 py-6 text-center text-gray-700 text-lg">{line.quantity}</td>
                      <td className="px-8 py-6 text-right text-gray-700 text-lg">{formatCurrency(line.unitPrice, invoice.currency)}</td>
                      <td className="px-8 py-6 text-right font-bold text-gray-900 text-lg">{formatCurrency(line.lineTotal, invoice.currency)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Premium Totals Section */}
        <div className="premium-totals flex justify-end mb-12">
          <div className="w-96">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-4 border-b-2 border-gray-300">
                  <span className="text-xl font-bold text-gray-700" style={{ fontFamily }}>Subtotal</span>
                  <span className="text-xl font-bold text-gray-900">
                    {formatCurrency(invoice.totalAmount - (invoice.balanceDue > 0 ? invoice.balanceDue : 0), invoice.currency)}
                  </span>
                </div>
                {invoice.balanceDue > 0 && (
                  <div className="flex justify-between items-center py-4 border-b-2 border-gray-300">
                    <span className="text-xl font-bold text-gray-700" style={{ fontFamily }}>Balance Due</span>
                    <span className="text-xl font-bold text-gray-900">
                      {formatCurrency(invoice.balanceDue, invoice.currency)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between items-center py-6">
                  <span className="text-3xl font-bold text-gray-900" style={{ fontFamily }}>Total</span>
                  <span className="text-4xl font-bold" style={{ color: primaryColor }}>
                    {formatCurrency(invoice.totalAmount, invoice.currency)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Premium Payment Section */}
        {invoice.balanceDue > 0 && (
          <div className="mb-12 p-10 rounded-2xl border-3 border-dashed shadow-lg" style={{ 
            borderColor: `${primaryColor}40`,
            backgroundColor: `${primaryColor}08`
          }}>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center shadow-lg" style={{ backgroundColor: `${primaryColor}20` }}>
                <span className="text-3xl" style={{ color: primaryColor }}>💳</span>
              </div>
              <h3 className="text-3xl font-bold mb-4" style={{ color: primaryColor, fontFamily }}>
                Pay Online Securely
              </h3>
              <p className="text-gray-600 mb-8 text-xl leading-relaxed">
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

        {/* Premium Footer */}
        <div className="premium-footer border-t-4 border-gray-200 pt-10">
          <div className="grid grid-cols-2 gap-16">
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3" style={{ fontFamily }}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${primaryColor}20` }}>
                  <span className="text-sm font-bold" style={{ color: primaryColor }}>C</span>
                </span>
                Contact Information
              </h4>
              <div className="space-y-3 text-gray-600">
                {company.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-lg font-semibold">{company.email}</span>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-lg font-semibold">{company.phone}</span>
                  </div>
                )}
                {company.showWebsite && company.website && (
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    <span className="text-lg font-semibold">{company.website}</span>
                  </div>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3" style={{ fontFamily }}>
                <span className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg" style={{ backgroundColor: `${secondaryColor}20` }}>
                  <span className="text-sm font-bold" style={{ color: secondaryColor }}>T</span>
                </span>
                Payment Terms
              </h4>
              <div className="text-gray-600 leading-relaxed text-lg">
                {company.invoiceTerms || 'Payment is due within 30 days of invoice date. Late payments may incur additional fees.'}
              </div>
            </div>
          </div>
          {company.invoiceFooter && (
            <div className="mt-10 text-center">
              <div className="inline-block px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl shadow-lg">
                <p className="text-gray-600 font-bold text-lg" style={{ fontFamily }}>
                  {company.invoiceFooter}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
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

  const renderTemplate = () => {
    switch (templateStyle) {
      case 'modern':
        return renderModernTemplate()
      case 'classic':
        return renderClassicTemplate()
      case 'minimal':
        return renderMinimalTemplate()
      case 'professional':
      default:
        return renderProfessionalTemplate()
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Print Styles */}
      <style>{`
        @media print {
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\\:shadow-none { box-shadow: none !important; }
          .print\\:bg-white { background-color: white !important; }
          .print\\:text-black { color: black !important; }
          .print\\:border-b-1 { border-bottom-width: 1px !important; }
          .print\\:max-w-none { max-width: none !important; }
          .print\\:w-20 { width: 5rem !important; }
          .print\\:h-20 { height: 5rem !important; }
          .print\\:h-10 { height: 2.5rem !important; }
          .print\\:space-y-2 > * + * { margin-top: 0.5rem !important; }
          .print\\:hidden { display: none !important; }
          .no-print { display: none !important; }
          
          body { 
            margin: 0; padding: 0; 
            -webkit-print-color-adjust: exact; 
            print-color-adjust: exact; 
          }
          
          .invoice-container { 
            max-width: none !important; 
            margin: 0 !important; 
            padding: 0 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
          }
          
          .invoice-page {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          
          table { page-break-inside: avoid; }
          tr { page-break-inside: avoid; }
          .totals-section { page-break-inside: avoid; }
          .footer-section { page-break-inside: avoid; }
          
          /* Force colors in print */
          .bg-gray-50 { background-color: #f9fafb !important; }
          .bg-blue-50 { background-color: #eff6ff !important; }
          .text-blue-600 { color: #2563eb !important; }
          .border-gray-200 { border-color: #e5e7eb !important; }
        }
        
        @page {
          margin: 0.5in;
          size: A4;
        }
      `}</style>

      {/* Professional Action Bar - Hidden in Print */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 bg-white rounded-lg shadow-sm border no-print">
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="outline" className="text-blue-600 border-blue-600 px-3 py-1.5 font-medium">
            {templateStyle.charAt(0).toUpperCase() + templateStyle.slice(1)} Template
          </Badge>
          <div className={`inline-flex items-center px-3 py-1.5 rounded-full border text-sm font-medium ${getStatusColor(invoice.status).bg} ${getStatusColor(invoice.status).text}`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${getStatusColor(invoice.status).dot}`}></div>
            {invoice.status.toUpperCase()}
          </div>
          <Badge variant="secondary" className="px-3 py-1.5">
            {formatCurrency(invoice.totalAmount, invoice.currency)}
          </Badge>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint} className="px-4 py-2">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownloadPDF} className="px-4 py-2">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" size="sm" onClick={async () => {
            try {
              const url = invoice.paymentUrl || window.location.href
              await navigator.clipboard.writeText(url)
              toast({
                title: "Link Copied",
                description: "Invoice link has been copied to clipboard."
              })
            } catch (error) {
              console.error('Error copying link:', error)
            }
          }} className="px-4 py-2">
            <Copy className="w-4 h-4 mr-2" />
            Copy Link
          </Button>
          <Button variant="outline" size="sm" onClick={handleShareInvoice} className="px-4 py-2">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </div>

      {/* Professional Invoice Template */}
      <div className="invoice-container invoice-page">
        {renderTemplate()}
      </div>
    </div>
  )
}
