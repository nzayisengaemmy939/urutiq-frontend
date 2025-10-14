"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

interface SummaryProps { revenue: number; expenses: number; profit: number; netIncome: number; }

export function FinancialSummary({ summary }: { summary?: SummaryProps }) {
  const d = summary || { revenue: 45230, expenses: 32890, profit: 12340, netIncome: 12340 };
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  return (
    <Card>
      <CardHeader>
        <CardTitle>Financial Summary</CardTitle>
        <CardDescription>Key financial metrics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Revenue</span><span className="text-sm font-medium">{fmt(d.revenue)}</span></div>
        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Total Expenses</span><span className="text-sm font-medium">{fmt(d.expenses)}</span></div>
        <div className="flex justify-between"><span className="text-sm text-muted-foreground">Gross Profit</span><span className="text-sm font-medium text-green-600">{fmt(d.profit)}</span></div>
        <div className="h-px bg-border" />
        <div className="flex justify-between"><span className="text-sm font-medium">Net Income</span><span className="text-sm font-medium text-green-600">{fmt(d.netIncome)}</span></div>
      </CardContent>
    </Card>
  );
}
