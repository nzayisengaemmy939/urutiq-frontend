"use client"

import { CustomerPortal } from "@/components/customer-portal"

interface CustomerPortalPageProps {
  params: {
    invoiceId: string
  }
}

export default function CustomerPortalPage({ params }: CustomerPortalPageProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <CustomerPortal 
        invoiceId={params.invoiceId}
        onPaymentSuccess={() => {
          // Could add success notification here
          console.log('Payment successful!')
        }}
      />
    </div>
  )
}
