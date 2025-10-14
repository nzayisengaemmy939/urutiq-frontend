"use client";

import { AIFinancialCoach } from "@/components/ai-financial-coach"
import { PageLayout } from "@/components/page-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function AIFinancialCoachPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <AIFinancialCoach companyId="demo-company" userId="demo-user" />
      </PageLayout>
    </ProtectedRoute>
  )
}
