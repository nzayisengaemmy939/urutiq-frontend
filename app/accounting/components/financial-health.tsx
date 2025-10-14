"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, Clock } from "lucide-react";

interface HealthMetric { label: string; value: number; status: 'ok' | 'due' | 'warn'; description: string; }

export function FinancialHealth({ metrics }: { metrics?: HealthMetric[] }) {
  const data: HealthMetric[] = metrics || [
    { label: 'Account Reconciliation', value: 100, status: 'ok', description: 'All accounts are reconciled and balanced' },
    { label: 'Journal Entries', value: 95, status: 'ok', description: '156 entries posted, 8 pending review' },
    { label: 'Trial Balance', value: 100, status: 'ok', description: 'Total debits equal total credits' },
    { label: 'Financial Reports', value: 75, status: 'due', description: 'Monthly reports due in 5 days' }
  ];

  const badge = (m: HealthMetric) => {
    if (m.status === 'ok') return <Badge variant="default" className="bg-green-100 text-green-800"><CheckCircle className="mr-1 h-3 w-3" />Balanced</Badge>;
    if (m.status === 'due') return <Badge variant="secondary" className="bg-blue-100 text-blue-800"><Clock className="mr-1 h-3 w-3" />Due Soon</Badge>;
    return <Badge variant="destructive">Attention</Badge>;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Health Check</CardTitle>
        <CardDescription>Current financial status across all accounts</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {data.map(m => (
            <div key={m.label} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{m.label}</span>
                {badge(m)}
              </div>
              <Progress value={m.value} className="h-2" />
              <p className="text-xs text-muted-foreground">{m.description}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
