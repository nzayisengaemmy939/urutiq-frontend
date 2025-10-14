"use client";

import { EnhancedConversationalAI } from "@/components/enhanced-conversational-ai"
import { PageLayout } from "@/components/page-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function EnhancedConversationalAIPage() {
  return (
    <ProtectedRoute>
      <PageLayout>
        <EnhancedConversationalAI />
      </PageLayout>
    </ProtectedRoute>
  )
}
