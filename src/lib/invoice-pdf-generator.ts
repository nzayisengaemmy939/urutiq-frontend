import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import QRCode from 'qrcode'

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: typeof autoTable
  }
}

interface InvoicePDFOptions {
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
    address?: string
    city?: string
    state?: string
    postalCode?: string
    email?: string
    phone?: string
    website?: string
    taxId?: string
    invoiceTerms?: string
    invoiceFooter?: string
  }
}

export class InvoicePDFGenerator {
  private doc: jsPDF
  private primaryColor: string
  private margin = 20
  private currentY = 20

  constructor(private options: InvoicePDFOptions) {
    this.doc = new jsPDF('p', 'mm', 'a4')
    this.primaryColor = options.company.primaryColor || '#1f2937'
  }

  private formatCurrency(amount: number, currency: string): string {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount)
    } catch {
      return `${currency} ${amount.toFixed(2)}`
    }
  }

  private setColor(color: string) {
    // Convert hex to RGB
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)
    this.doc.setTextColor(r, g, b)
  }

  private resetColor() {
    this.doc.setTextColor(0, 0, 0)
  }

  private addLine(y?: number) {
    const lineY = y || this.currentY
    this.doc.setDrawColor(200, 200, 200)
    this.doc.line(this.margin, lineY, 190, lineY)
  }

  private async generateQRCode(): Promise<string> {
    try {
      const qrData = this.options.invoice.paymentUrl || 
        `Invoice: ${this.options.invoice.invoiceNumber}\nAmount: ${this.formatCurrency(this.options.invoice.totalAmount, this.options.invoice.currency)}\nDue: ${this.options.invoice.dueDate || 'N/A'}`
      
      return await QRCode.toDataURL(qrData, {
        width: 400,
        margin: 1,
        color: {
          dark: this.primaryColor,
          light: '#FFFFFF'
        }
      })
    } catch (error) {
      console.error('Error generating QR code:', error)
      return ''
    }
  }

  private generateBarcode(): string {
    // Create a simple barcode-like pattern
    const canvas = document.createElement('canvas')
    canvas.width = 200
    canvas.height = 50
    const ctx = canvas.getContext('2d')
    
    if (ctx) {
      ctx.fillStyle = '#FFFFFF'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      
      ctx.fillStyle = this.primaryColor
      const barWidth = 2
      let x = 10
      
      // Generate bars based on invoice number
      const invoiceCode = this.options.invoice.invoiceNumber.replace(/[^0-9]/g, '') || '123456'
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
      
      // Add invoice number text
      ctx.fillStyle = '#374151'
      ctx.font = '10px monospace'
      ctx.textAlign = 'center'
      ctx.fillText(this.options.invoice.invoiceNumber, canvas.width / 2, 47)
    }
    
    return canvas.toDataURL()
  }

  private async addHeader() {
    const { company, invoice } = this.options
    
    // Company logo (if available)
    if (company.logoUrl) {
      try {
        this.doc.addImage(company.logoUrl, 'PNG', this.margin, this.currentY, 30, 30)
      } catch (error) {
        console.error('Error adding logo:', error)
      }
    }

    // Company name and details
    this.doc.setFontSize(24)
    this.setColor(this.primaryColor)
    this.doc.text(company.name, company.logoUrl ? this.margin + 35 : this.margin, this.currentY + 10)
    
    this.resetColor()
    this.doc.setFontSize(10)
    let detailsY = this.currentY + 15
    
    if (company.address) {
      this.doc.text(company.address, company.logoUrl ? this.margin + 35 : this.margin, detailsY)
      detailsY += 4
    }
    
    if (company.city || company.state || company.postalCode) {
      const location = [company.city, company.state, company.postalCode].filter(Boolean).join(', ')
      this.doc.text(location, company.logoUrl ? this.margin + 35 : this.margin, detailsY)
      detailsY += 4
    }
    
    if (company.email) {
      this.doc.text(`Email: ${company.email}`, company.logoUrl ? this.margin + 35 : this.margin, detailsY)
      detailsY += 4
    }
    
    if (company.phone) {
      this.doc.text(`Phone: ${company.phone}`, company.logoUrl ? this.margin + 35 : this.margin, detailsY)
      detailsY += 4
    }

    // Invoice header on the right
    this.doc.setFontSize(28)
    this.setColor(this.primaryColor)
    this.doc.text('INVOICE', 190 - this.doc.getTextWidth('INVOICE'), this.currentY + 10)
    
    this.resetColor()
    this.doc.setFontSize(16)
    this.doc.text(`#${invoice.invoiceNumber}`, 190 - this.doc.getTextWidth(`#${invoice.invoiceNumber}`), this.currentY + 20)
    
    // Status badge
    this.doc.setFontSize(10)
    const statusText = invoice.status.toUpperCase()
    const statusWidth = this.doc.getTextWidth(statusText) + 4
    
    // Status background
    this.doc.setFillColor(240, 240, 240)
    this.doc.rect(190 - statusWidth, this.currentY + 25, statusWidth, 6, 'F')
    
    this.doc.text(statusText, 190 - statusWidth + 2, this.currentY + 29)

    // Add QR Code and Barcode
    try {
      const qrCode = await this.generateQRCode()
      if (qrCode) {
        this.doc.addImage(qrCode, 'PNG', 160, this.currentY + 35, 25, 25)
        this.doc.setFontSize(8)
        this.doc.text('Scan to Pay', 172.5 - this.doc.getTextWidth('Scan to Pay') / 2, this.currentY + 65)
      }
    } catch (error) {
      console.error('Error adding QR code:', error)
    }

    try {
      const barcode = this.generateBarcode()
      if (barcode) {
        this.doc.addImage(barcode, 'PNG', 120, this.currentY + 40, 35, 12)
      }
    } catch (error) {
      console.error('Error adding barcode:', error)
    }

    this.currentY = Math.max(detailsY, this.currentY + 70)
    this.addLine(this.currentY)
    this.currentY += 10
  }

  private addInvoiceDetails() {
    const { invoice } = this.options
    
    // Bill To section
    this.doc.setFontSize(12)
    this.doc.setFont('helvetica', 'bold')
    this.doc.text('BILL TO', this.margin, this.currentY)
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(10)
    let billToY = this.currentY + 6
    
    if (invoice.customer?.name) {
      this.doc.setFont('helvetica', 'bold')
      this.doc.text(invoice.customer.name, this.margin, billToY)
      this.doc.setFont('helvetica', 'normal')
      billToY += 5
    }
    
    if (invoice.customer?.address) {
      this.doc.text(invoice.customer.address, this.margin, billToY)
      billToY += 4
    }
    
    if (invoice.customer?.email) {
      this.doc.text(invoice.customer.email, this.margin, billToY)
      billToY += 4
    }
    
    if (invoice.customer?.phone) {
      this.doc.text(invoice.customer.phone, this.margin, billToY)
      billToY += 4
    }

    // Invoice details on the right
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(12)
    this.doc.text('INVOICE DETAILS', 110, this.currentY)
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(10)
    let detailsY = this.currentY + 6
    
    const details = [
      ['Issue Date:', new Date(invoice.issueDate).toLocaleDateString()],
      ...(invoice.dueDate ? [['Due Date:', new Date(invoice.dueDate).toLocaleDateString()]] : []),
      ['Currency:', invoice.currency],
      ['Amount:', this.formatCurrency(invoice.totalAmount, invoice.currency)],
      ...(invoice.balanceDue > 0 ? [['Balance Due:', this.formatCurrency(invoice.balanceDue, invoice.currency)]] : [])
    ]
    
    details.forEach(([label, value]) => {
      this.doc.text(label, 110, detailsY)
      this.doc.text(value, 140, detailsY)
      detailsY += 4
    })

    this.currentY = Math.max(billToY, detailsY) + 10
  }

  private addLineItems() {
    const { invoice } = this.options
    
    if (!invoice.lines || invoice.lines.length === 0) return

    // Table headers
    const headers = [['Description', 'Qty', 'Rate', 'Amount']]
    
    // Add tax column if any line has tax
    const hasTax = invoice.lines.some(line => line.taxRate && line.taxRate > 0)
    if (hasTax) {
      headers[0].splice(3, 0, 'Tax')
    }

    // Table data
    const data = invoice.lines.map(line => {
      const row = [
        line.description,
        line.quantity.toString(),
        this.formatCurrency(line.unitPrice, invoice.currency),
        this.formatCurrency(line.lineTotal, invoice.currency)
      ]
      
      if (hasTax) {
        row.splice(3, 0, line.taxRate ? `${line.taxRate}%` : '—')
      }
      
      return row
    })

    // Generate table
    autoTable(this.doc, {
      head: headers,
      body: data,
      startY: this.currentY,
      margin: { left: this.margin, right: this.margin },
      styles: {
        fontSize: 10,
        cellPadding: 3
      },
      headStyles: {
        fillColor: [31, 41, 55], // primaryColor equivalent
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251]
      },
      columnStyles: {
        1: { halign: 'center' },
        2: { halign: 'right' },
        ...(hasTax ? { 3: { halign: 'center' }, 4: { halign: 'right' } } : { 3: { halign: 'right' } })
      }
    })

    this.currentY = (this.doc as any).lastAutoTable.finalY + 10
  }

  private addTotals() {
    const { invoice } = this.options
    
    const subtotal = invoice.subtotal || invoice.lines?.reduce((sum, line) => sum + line.lineTotal, 0) || 0
    const tax = invoice.taxAmount || 0
    const discount = invoice.discountAmount || 0
    
    const totalsX = 130
    const labelX = 110
    
    // Subtotal
    this.doc.setFontSize(10)
    this.doc.text('Subtotal:', labelX, this.currentY)
    this.doc.text(this.formatCurrency(subtotal, invoice.currency), totalsX, this.currentY)
    this.currentY += 5
    
    // Discount
    if (discount > 0) {
      this.doc.text('Discount:', labelX, this.currentY)
      this.doc.text(`-${this.formatCurrency(discount, invoice.currency)}`, totalsX, this.currentY)
      this.currentY += 5
    }
    
    // Tax
    if (tax > 0) {
      this.doc.text('Tax:', labelX, this.currentY)
      this.doc.text(this.formatCurrency(tax, invoice.currency), totalsX, this.currentY)
      this.currentY += 5
    }
    
    // Line above total
    this.doc.setDrawColor(100, 100, 100)
    this.doc.line(labelX, this.currentY + 2, 185, this.currentY + 2)
    this.currentY += 8
    
    // Total
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(12)
    this.setColor(this.primaryColor)
    this.doc.text('TOTAL:', labelX, this.currentY)
    this.doc.text(this.formatCurrency(invoice.totalAmount, invoice.currency), totalsX, this.currentY)
    
    this.resetColor()
    this.currentY += 10
    
    // Balance due
    if (invoice.balanceDue > 0) {
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(11)
      this.doc.setTextColor(220, 38, 38) // Red color
      this.doc.text('BALANCE DUE:', labelX, this.currentY)
      this.doc.text(this.formatCurrency(invoice.balanceDue, invoice.currency), totalsX, this.currentY)
      this.resetColor()
      this.currentY += 8
    }
  }

  private addNotes() {
    const { invoice } = this.options
    
    if (invoice.notes) {
      this.currentY += 5
      this.doc.setFont('helvetica', 'bold')
      this.doc.setFontSize(11)
      this.doc.text('NOTES:', this.margin, this.currentY)
      
      this.doc.setFont('helvetica', 'normal')
      this.doc.setFontSize(10)
      this.currentY += 6
      
      const lines = this.doc.splitTextToSize(invoice.notes, 170)
      this.doc.text(lines, this.margin, this.currentY)
      this.currentY += lines.length * 4 + 5
    }
  }

  private addFooter() {
    const { company } = this.options
    
    // Payment terms
    this.currentY += 10
    this.addLine(this.currentY)
    this.currentY += 8
    
    this.doc.setFont('helvetica', 'bold')
    this.doc.setFontSize(11)
    this.doc.text('PAYMENT TERMS', this.margin, this.currentY)
    
    this.doc.setFont('helvetica', 'normal')
    this.doc.setFontSize(9)
    this.currentY += 6
    
    const terms = company.invoiceTerms || 'Payment is due within 30 days of invoice date. Late payments may incur additional fees.'
    const termLines = this.doc.splitTextToSize(terms, 170)
    this.doc.text(termLines, this.margin, this.currentY)
    this.currentY += termLines.length * 3 + 5
    
    // Footer text
    if (company.invoiceFooter) {
      this.currentY += 5
      this.doc.setFontSize(8)
      this.doc.setTextColor(100, 100, 100)
      const footerLines = this.doc.splitTextToSize(company.invoiceFooter, 170)
      this.doc.text(footerLines, this.margin, this.currentY)
      this.currentY += footerLines.length * 3
    }
    
    // Generation timestamp
    this.currentY += 5
    this.doc.setFontSize(7)
    this.doc.setTextColor(150, 150, 150)
    const timestamp = `Generated on ${new Date().toLocaleString()} • Invoice #${this.options.invoice.invoiceNumber}`
    this.doc.text(timestamp, 105 - this.doc.getTextWidth(timestamp) / 2, this.currentY)
  }

  public async generate(): Promise<Blob> {
    await this.addHeader()
    this.addInvoiceDetails()
    this.addLineItems()
    this.addTotals()
    this.addNotes()
    this.addFooter()
    
    return this.doc.output('blob')
  }

  public async download(filename?: string): Promise<void> {
    await this.addHeader()
    this.addInvoiceDetails()
    this.addLineItems()
    this.addTotals()
    this.addNotes()
    this.addFooter()
    
    const defaultFilename = `invoice-${this.options.invoice.invoiceNumber}.pdf`
    this.doc.save(filename || defaultFilename)
  }
}