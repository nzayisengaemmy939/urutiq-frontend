"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Task { label: string; count: number; variant?: 'secondary' | 'destructive' | 'outline'; }

export function PendingTasks({ tasks }: { tasks?: Task[] }) {
  const data: Task[] = tasks || [
    { label: 'Review journal entries', count: 8, variant: 'secondary' },
    { label: 'Bank reconciliations', count: 2, variant: 'secondary' },
    { label: 'Month-end closing', count: 1, variant: 'destructive' },
    { label: 'Audit preparation', count: 3, variant: 'outline' }
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Tasks</CardTitle>
        <CardDescription>Items requiring attention</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {data.map(t => (
          <div key={t.label} className="flex items-center justify-between">
            <span className="text-sm">{t.label}</span>
            <Badge variant={t.variant || 'secondary'}>{t.count}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
