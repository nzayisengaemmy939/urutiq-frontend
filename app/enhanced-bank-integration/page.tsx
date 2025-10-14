"use client";

import EnhancedBankIntegration from "@/components/enhanced-bank-integration"
import { PageLayout } from "@/components/page-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function EnhancedBankIntegrationPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <EnhancedBankIntegration />
      </PageLayout>
    </ProtectedRoute>
  )
}
