import React, { forwardRef } from 'react'
import { formatCurrency } from '../lib/utils'

export interface ReceiptData {
  invoiceNumber: string
  date: string
  customer?: {
    name: string
    email?: string
    phone?: string
  }
  items: Array<{
    name: string
    quantity: number
    unitPrice: number
    total: number
  }>
  subtotal: number
  taxAmount: number
  discountAmount?: number
  total: number
  paymentMethod: string
  cashReceived?: number
  change?: number
  companyInfo: {
    name: string
    address?: string
    phone?: string
    email?: string
    website?: string
  }
}

interface ReceiptProps {
  data: ReceiptData
  className?: string
}

export const Receipt = forwardRef<HTMLDivElement, ReceiptProps>(({ data, className = '' }, ref) => {
  return (
    <div 
      ref={ref}
      className={`bg-white p-6 max-w-sm mx-auto text-sm font-mono ${className}`}
      style={{ width: '300px' }} // Standard thermal receipt width
    >
      {/* Company Header */}
      <div className="text-center border-b border-gray-300 pb-4 mb-4">
        <h1 className="text-lg font-bold text-gray-900">{data.companyInfo.name}</h1>
        {data.companyInfo.address && (
          <p className="text-xs text-gray-600 mt-1">{data.companyInfo.address}</p>
        )}
        <div className="text-xs text-gray-600 mt-1">
          {data.companyInfo.phone && <p>Tel: {data.companyInfo.phone}</p>}
          {data.companyInfo.email && <p>Email: {data.companyInfo.email}</p>}
          {data.companyInfo.website && <p>Web: {data.companyInfo.website}</p>}
        </div>
      </div>

      {/* Transaction Info */}
      <div className="border-b border-gray-300 pb-2 mb-4">
        <div className="flex justify-between">
          <span>Receipt #:</span>
          <span>{data.invoiceNumber}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{data.date}</span>
        </div>
        {data.customer && (
          <div className="mt-2">
            <div className="flex justify-between">
              <span>Customer:</span>
              <span>{data.customer.name}</span>
            </div>
            {data.customer.phone && (
              <div className="flex justify-between">
                <span>Phone:</span>
                <span>{data.customer.phone}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Items */}
      <div className="border-b border-gray-300 pb-2 mb-4">
        <div className="space-y-2">
          {data.items.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between">
                <span className="truncate pr-2">{item.name}</span>
                <span>{formatCurrency(item.total)}</span>
              </div>
              <div className="text-xs text-gray-600 ml-2">
                {item.quantity} × {formatCurrency(item.unitPrice)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span>{formatCurrency(data.subtotal)}</span>
        </div>
        {data.discountAmount && data.discountAmount > 0 && (
          <div className="flex justify-between text-red-600">
            <span>Discount:</span>
            <span>-{formatCurrency(data.discountAmount)}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span>Tax:</span>
          <span>{formatCurrency(data.taxAmount)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-1">
          <span>TOTAL:</span>
          <span>{formatCurrency(data.total)}</span>
        </div>
      </div>

      {/* Payment Info */}
      <div className="border-t border-gray-300 pt-2 mb-4">
        <div className="flex justify-between">
          <span>Payment:</span>
          <span className="capitalize">{data.paymentMethod}</span>
        </div>
        {data.paymentMethod === 'cash' && data.cashReceived && (
          <>
            <div className="flex justify-between">
              <span>Cash Received:</span>
              <span>{formatCurrency(data.cashReceived)}</span>
            </div>
            {data.change && data.change > 0 && (
              <div className="flex justify-between font-bold">
                <span>Change:</span>
                <span>{formatCurrency(data.change)}</span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-gray-600 border-t border-gray-300 pt-4">
        <p>Thank you for your business!</p>
        <p className="mt-2">Keep your receipt for returns</p>
        <p className="mt-2">Powered by UrutiIQ POS</p>
      </div>

      {/* QR Code Placeholder */}
      <div className="text-center mt-4">
        <div className="inline-block bg-gray-200 p-2">
          <div className="w-16 h-16 bg-black bg-opacity-10 flex items-center justify-center text-xs">
            QR Code
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-1">Scan for digital receipt</p>
      </div>
    </div>
  )
})

Receipt.displayName = 'Receipt'