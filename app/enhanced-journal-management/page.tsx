"use client";

import { EnhancedJournalManagement } from "@/components/enhanced-journal-management"
import { PageLayout } from "@/components/page-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function EnhancedJournalManagementPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <EnhancedJournalManagement />
      </PageLayout>
    </ProtectedRoute>
  )
}
