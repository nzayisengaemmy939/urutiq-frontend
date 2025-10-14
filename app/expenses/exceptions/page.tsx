"use client"

import React from "react"
import { PageLayout } from "@/components/page-layout"
import { CardExceptionsDashboard } from "@/components/card-exceptions-dashboard"

export default function ExceptionsPage() {
  return (
    <PageLayout>
      <div className="space-y-6">
        <CardExceptionsDashboard />
      </div>
    </PageLayout>
  )
}


