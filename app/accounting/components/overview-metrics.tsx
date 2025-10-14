"use client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TrendingUp, DollarSign, FileText, BarChart3 } from "lucide-react";

interface MetricCardProps { title: string; value: string; sub?: string; icon: React.ReactNode; accentClass?: string; }

function MetricCard({ title, value, sub, icon, accentClass }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${accentClass || ''}`}>{value}</div>
        {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

export function OverviewMetrics({ data }: { data?: { assets: number; netIncome: number; journalEntries: number; balanceOk: boolean; } }) {
  // Placeholder static until wired to API
  const d = data || { assets: 89450, netIncome: 12340, journalEntries: 156, balanceOk: true };
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <MetricCard title="Total Assets" value={`$${d.assets.toLocaleString()}`} sub="+$2,340 this month" icon={<TrendingUp className="h-4 w-4" />} accentClass="text-green-600" />
      <MetricCard title="Net Income" value={`$${d.netIncome.toLocaleString()}`} sub="+$890 this month" icon={<DollarSign className="h-4 w-4" />} accentClass="text-blue-600" />
      <MetricCard title="Journal Entries" value={d.journalEntries.toLocaleString()} sub="+12 this month" icon={<FileText className="h-4 w-4" />} />
      <MetricCard title="Account Balance" value={d.balanceOk ? '100%' : 'Issue'} sub={d.balanceOk ? 'Debits equal credits' : 'Out of balance'} icon={<BarChart3 className="h-4 w-4" />} accentClass={d.balanceOk ? 'text-green-600' : 'text-red-600'} />
    </div>
  );
}
