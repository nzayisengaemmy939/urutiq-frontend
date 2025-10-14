'use client'

import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageLayout } from '@/components/page-layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface KpiResponse {
  totalSpend: number
  monthOverMonth: number
  pendingApprovals: number
  importLandedCost: number
}

export default function AnalyticsDashboardPage() {
  const period = 'last_12_months'
  const currency = 'USD'

  const { data: kpis } = useQuery<KpiResponse>({
    queryKey: ['analytics-kpis', period, currency],
    queryFn: async () => {
      const res = await fetch(`/api/analytics/kpis?period=${period}&currency=${currency}`)
      if (!res.ok) throw new Error('Failed to load KPIs')
      return res.json()
    }
  })

  return (
    <PageLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Analytics & Reporting</h1>
            <p className="text-gray-600 mt-1">Spend trends, category breakdowns, vendor analysis, budgets, and imports</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Spend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${kpis?.totalSpend?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  )
}
