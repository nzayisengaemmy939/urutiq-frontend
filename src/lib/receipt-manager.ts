import { ReceiptData } from '../components/Receipt'

// WebUSB API type definitions
declare global {
  interface Navigator {
    usb?: USB
  }
  
  interface USB {
    requestDevice(options: USBDeviceRequestOptions): Promise<USBDevice>
    getDevices(): Promise<USBDevice[]>
  }
  
  interface USBDevice {
    vendorId: number
    productId: number
    configuration: USBConfiguration | null
    open(): Promise<void>
    close(): Promise<void>
    selectConfiguration(configurationValue: number): Promise<void>
    claimInterface(interfaceNumber: number): Promise<void>
    releaseInterface(interfaceNumber: number): Promise<void>
    transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>
  }
  
  interface USBConfiguration {
    configurationValue: number
  }
  
  interface USBDeviceRequestOptions {
    filters: USBDeviceFilter[]
  }
  
  interface USBDeviceFilter {
    vendorId?: number
    productId?: number
  }
  
  interface USBOutTransferResult {
    status: 'ok' | 'stall' | 'babble'
    bytesWritten: number
  }
}

export interface PrintOptions {
  printerName?: string
  copies?: number
  paperSize?: 'thermal_80mm' | 'thermal_58mm' | 'a4' | 'letter'
}

export interface EmailOptions {
  to: string
  subject?: string
  message?: string
}

export class ReceiptManager {
  /**
   * Print receipt using browser's print API or connected thermal printer
   */
  static async printReceipt(receiptElement: HTMLElement, options: PrintOptions = {}): Promise<boolean> {
    try {
      // Check if we're in a browser environment that supports printing
      if (!window.print) {
        throw new Error('Printing not supported in this environment')
      }

      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=300,height=600')
      if (!printWindow) {
        throw new Error('Unable to open print window')
      }

      // Clone the receipt content
      const receiptClone = receiptElement.cloneNode(true) as HTMLElement

      // Create print-specific HTML
      const printHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Receipt</title>
          <style>
            body { 
              margin: 0; 
              padding: 10px; 
              font-family: 'Courier New', monospace;
              font-size: 12px;
              line-height: 1.4;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
              @page { 
                margin: 0; 
                size: ${options.paperSize === 'thermal_58mm' ? '58mm auto' : 
                       options.paperSize === 'thermal_80mm' ? '80mm auto' : 'auto'};
              }
            }
            /* Thermal printer optimizations */
            ${options.paperSize?.includes('thermal') ? `
              .thermal-optimized {
                max-width: ${options.paperSize === 'thermal_58mm' ? '58mm' : '80mm'};
                font-size: 11px;
                line-height: 1.2;
              }
            ` : ''}
          </style>
        </head>
        <body>
          <div class="${options.paperSize?.includes('thermal') ? 'thermal-optimized' : ''}">
            ${receiptClone.outerHTML}
          </div>
        </body>
        </html>
      `

      printWindow.document.write(printHTML)
      printWindow.document.close()

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.focus()
        printWindow.print()
        
        // Close the print window after printing
        setTimeout(() => {
          printWindow.close()
        }, 1000)
      }

      return true
    } catch (error) {
      console.error('Print error:', error)
      return false
    }
  }

  /**
   * Generate PDF version of receipt for email or download
   */
  static async generateReceiptPDF(receiptData: ReceiptData): Promise<Blob> {
    try {
      // Import html2canvas and jsPDF dynamically to reduce bundle size
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf')
      ])

      // Create a temporary receipt element
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '-9999px'
      tempDiv.innerHTML = this.generateReceiptHTML(receiptData)
      document.body.appendChild(tempDiv)

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: '#ffffff',
        scale: 2, // Higher resolution
        useCORS: true
      })

      // Remove temporary element
      document.body.removeChild(tempDiv)

      // Create PDF
      const imgWidth = 80 // 80mm width for thermal receipt
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [imgWidth, imgHeight]
      })

      const imgData = canvas.toDataURL('image/png')
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

      return pdf.output('blob')
    } catch (error) {
      console.error('PDF generation error:', error)
      throw error
    }
  }

  /**
   * Email receipt to customer
   */
  static async emailReceipt(receiptData: ReceiptData, options: EmailOptions): Promise<boolean> {
    try {
      const pdfBlob = await this.generateReceiptPDF(receiptData)
      
      // Create form data for API request
      const formData = new FormData()
      formData.append('to', options.to)
      formData.append('subject', options.subject || `Receipt ${receiptData.invoiceNumber}`)
      formData.append('message', options.message || 'Thank you for your purchase. Please find your receipt attached.')
      formData.append('receipt', pdfBlob, `receipt-${receiptData.invoiceNumber}.pdf`)

      // Send email via API
      const response = await fetch('/api/pos/email-receipt', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'x-tenant-id': localStorage.getItem('tenant_id') || '',
          'x-company-id': localStorage.getItem('company_id') || ''
        }
      })

      if (!response.ok) {
        throw new Error(`Email failed: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('Email receipt error:', error)
      return false
    }
  }

  /**
   * Generate HTML string for receipt (used by PDF generator)
   */
  private static generateReceiptHTML(data: ReceiptData): string {
    return `
      <div style="background: white; padding: 20px; max-width: 300px; font-family: 'Courier New', monospace; font-size: 12px; line-height: 1.4;">
        <!-- Company Header -->
        <div style="text-align: center; border-bottom: 1px solid #333; padding-bottom: 10px; margin-bottom: 10px;">
          <h1 style="margin: 0; font-size: 16px; font-weight: bold;">${data.companyInfo.name}</h1>
          ${data.companyInfo.address ? `<p style="margin: 2px 0; font-size: 10px;">${data.companyInfo.address}</p>` : ''}
          ${data.companyInfo.phone ? `<p style="margin: 2px 0; font-size: 10px;">Tel: ${data.companyInfo.phone}</p>` : ''}
          ${data.companyInfo.email ? `<p style="margin: 2px 0; font-size: 10px;">Email: ${data.companyInfo.email}</p>` : ''}
        </div>

        <!-- Transaction Info -->
        <div style="border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Receipt #:</span>
            <span>${data.invoiceNumber}</span>
          </div>
          <div style="display: flex; justify-content: space-between;">
            <span>Date:</span>
            <span>${data.date}</span>
          </div>
          ${data.customer ? `
            <div style="margin-top: 5px;">
              <div style="display: flex; justify-content: space-between;">
                <span>Customer:</span>
                <span>${data.customer.name}</span>
              </div>
            </div>
          ` : ''}
        </div>

        <!-- Items -->
        <div style="border-bottom: 1px solid #333; padding-bottom: 8px; margin-bottom: 10px;">
          ${data.items.map(item => `
            <div style="margin-bottom: 5px;">
              <div style="display: flex; justify-content: space-between;">
                <span style="flex: 1; margin-right: 10px;">${item.name}</span>
                <span>$${Number(item.total).toFixed(2)}</span>
              </div>
              <div style="font-size: 10px; color: #666; margin-left: 10px;">
                ${item.quantity} × $${Number(item.unitPrice).toFixed(2)}
              </div>
            </div>
          `).join('')}
        </div>

        <!-- Totals -->
        <div style="margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Subtotal:</span>
            <span>$${Number(data.subtotal).toFixed(2)}</span>
          </div>
          ${data.discountAmount && data.discountAmount > 0 ? `
            <div style="display: flex; justify-content: space-between; color: red;">
              <span>Discount:</span>
              <span>-$${Number(data.discountAmount).toFixed(2)}</span>
            </div>
          ` : ''}
          <div style="display: flex; justify-content: space-between;">
            <span>Tax:</span>
            <span>$${Number(data.taxAmount).toFixed(2)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 14px; border-top: 1px solid #333; padding-top: 5px;">
            <span>TOTAL:</span>
            <span>$${Number(data.total).toFixed(2)}</span>
          </div>
        </div>

        <!-- Payment Info -->
        <div style="border-top: 1px solid #333; padding-top: 8px; margin-bottom: 10px;">
          <div style="display: flex; justify-content: space-between;">
            <span>Payment:</span>
            <span style="text-transform: capitalize;">${data.paymentMethod}</span>
          </div>
          ${data.paymentMethod === 'cash' && data.cashReceived ? `
            <div style="display: flex; justify-content: space-between;">
              <span>Cash Received:</span>
              <span>$${Number(data.cashReceived).toFixed(2)}</span>
            </div>
            ${data.change && data.change > 0 ? `
              <div style="display: flex; justify-content: space-between; font-weight: bold;">
                <span>Change:</span>
                <span>$${Number(data.change).toFixed(2)}</span>
              </div>
            ` : ''}
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="text-align: center; font-size: 10px; color: #666; border-top: 1px solid #333; padding-top: 8px;">
          <p>Thank you for your business!</p>
          <p style="margin-top: 5px;">Keep your receipt for returns</p>
          <p style="margin-top: 5px;">Powered by UrutiIQ POS</p>
        </div>
      </div>
    `
  }

  /**
   * Check if thermal printer is available
   */
  static async checkPrinterAvailability(): Promise<boolean> {
    try {
      // Check for WebUSB support (for modern thermal printers)
      if ('usb' in navigator) {
        return true
      }
      
      // Check for WebSerial support (for serial thermal printers)
      if ('serial' in navigator) {
        return true
      }
      
      // Fallback to browser printing
      return 'print' in window
    } catch (error) {
      console.error('Printer availability check failed:', error)
      return false
    }
  }

  /**
   * Connect to thermal printer via WebUSB
   */
  static async connectThermalPrinter(): Promise<USBDevice | null> {
    try {
      if (!('usb' in navigator)) {
        throw new Error('WebUSB not supported')
      }

      // Common thermal printer vendor IDs
      const filters = [
        { vendorId: 0x04b8 }, // Epson
        { vendorId: 0x154f }, // Wintec
        { vendorId: 0x0fe6 }, // ICS Advent
        { vendorId: 0x0519 }  // Star Micronics
      ]

      const device = await navigator.usb!.requestDevice({ filters })
      await device.open()
      
      if (device.configuration === null) {
        await device.selectConfiguration(1)
      }
      
      await device.claimInterface(0)
      
      return device
    } catch (error) {
      console.error('Thermal printer connection failed:', error)
      return null
    }
  }

  /**
   * Send ESC/POS commands to thermal printer
   */
  static async printToThermalPrinter(device: USBDevice, receiptData: ReceiptData): Promise<boolean> {
    try {
      // ESC/POS command builder
      const commands: number[] = []
      
      // Initialize printer
      commands.push(0x1B, 0x40) // ESC @
      
      // Set character set to UTF-8
      commands.push(0x1B, 0x74, 0x06)
      
      // Center align
      commands.push(0x1B, 0x61, 0x01)
      
      // Company name (bold, double size)
      commands.push(0x1B, 0x45, 0x01) // Bold on
      commands.push(0x1D, 0x21, 0x11) // Double size
      commands.push(...this.stringToBytes(receiptData.companyInfo.name))
      commands.push(0x0A, 0x0A) // Line feeds
      
      // Reset formatting
      commands.push(0x1B, 0x45, 0x00) // Bold off
      commands.push(0x1D, 0x21, 0x00) // Normal size
      
      // Company details
      if (receiptData.companyInfo.address) {
        commands.push(...this.stringToBytes(receiptData.companyInfo.address))
        commands.push(0x0A)
      }
      
      // Line separator
      commands.push(...this.stringToBytes('--------------------------------'))
      commands.push(0x0A, 0x0A)
      
      // Left align for content
      commands.push(0x1B, 0x61, 0x00)
      
      // Receipt info
      commands.push(...this.stringToBytes(`Receipt #: ${receiptData.invoiceNumber}`))
      commands.push(0x0A)
      commands.push(...this.stringToBytes(`Date: ${receiptData.date}`))
      commands.push(0x0A, 0x0A)
      
      // Items
      for (const item of receiptData.items) {
        commands.push(...this.stringToBytes(`${item.name}`))
        commands.push(0x0A)
        commands.push(...this.stringToBytes(`  ${item.quantity} x $${Number(item.unitPrice).toFixed(2)} = $${Number(item.total).toFixed(2)}`))
        commands.push(0x0A)
      }
      
      commands.push(0x0A)
      commands.push(...this.stringToBytes('--------------------------------'))
      commands.push(0x0A)
      
      // Totals
      commands.push(...this.stringToBytes(`Subtotal: $${Number(receiptData.subtotal).toFixed(2)}`))
      commands.push(0x0A)
      commands.push(...this.stringToBytes(`Tax: $${Number(receiptData.taxAmount).toFixed(2)}`))
      commands.push(0x0A)
      
      // Total (bold)
      commands.push(0x1B, 0x45, 0x01) // Bold on
      commands.push(...this.stringToBytes(`TOTAL: $${Number(receiptData.total).toFixed(2)}`))
      commands.push(0x1B, 0x45, 0x00) // Bold off
      commands.push(0x0A, 0x0A)
      
      // Payment method
      commands.push(...this.stringToBytes(`Payment: ${receiptData.paymentMethod}`))
      commands.push(0x0A, 0x0A)
      
      // Footer
      commands.push(0x1B, 0x61, 0x01) // Center align
      commands.push(...this.stringToBytes('Thank you for your business!'))
      commands.push(0x0A, 0x0A)
      
      // Cut paper
      commands.push(0x1D, 0x56, 0x41, 0x10) // Partial cut
      
      // Send commands to printer
      const data = new Uint8Array(commands)
      await device.transferOut(1, data) // Endpoint 1 is typically the print endpoint
      
      return true
    } catch (error) {
      console.error('Thermal printing failed:', error)
      return false
    }
  }

  /**
   * Convert string to byte array for thermal printer
   */
  private static stringToBytes(str: string): number[] {
    const bytes: number[] = []
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i)
      if (charCode < 128) {
        bytes.push(charCode)
      } else {
        // Handle UTF-8 encoding for non-ASCII characters
        const utf8Bytes = new TextEncoder().encode(str.charAt(i))
        bytes.push(...Array.from(utf8Bytes))
      }
    }
    return bytes
  }
}

// Utility function to format currency consistently
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}
