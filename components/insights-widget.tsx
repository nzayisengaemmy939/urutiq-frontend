"use client"

import { useState } from "react"
import { useInsights, useGenerateInsights } from "@/hooks/useParser"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function InsightsWidget({ companyId }: { companyId?: string }) {
  const [category, setCategory] = useState<string | undefined>(undefined)
  const [priority, setPriority] = useState<string | undefined>(undefined)
  const { data, refetch, isLoading } = useInsights(companyId, { category, priority })
  const generate = useGenerateInsights()

  const rows = Array.isArray(data) ? data : (data as any)?.data || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>AI Insights</CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>Refresh</Button>
          <Button size="sm" onClick={() => generate.mutate(companyId, { onSuccess: () => refetch() })} disabled={generate.isPending}>Generate</Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {rows?.length ? rows.map((ins: any) => (
            <div key={ins.id} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between">
                <p className="font-medium">{ins.category || 'Insight'}</p>
                <Badge variant={ins.priority === 'high' ? 'destructive' : ins.priority === 'medium' ? 'secondary' : 'outline'}>
                  {ins.priority || 'medium'}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mt-1">{ins.insightText}</p>
            </div>
          )) : (
            <p className="text-sm text-gray-500">No insights available.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}


