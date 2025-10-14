"use client";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { CheckCircle, FileText, AlertTriangle, BarChart3 } from "lucide-react";

interface ActivityItem { id: string; icon: 'approved' | 'reconciliation' | 'review' | 'report'; title: string; detail: string; minutesAgo: number; }

const iconMap: Record<ActivityItem['icon'], JSX.Element> = {
  approved: <CheckCircle className="h-5 w-5 text-green-600" />,
  reconciliation: <FileText className="h-5 w-5 text-blue-600" />,
  review: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
  report: <BarChart3 className="h-5 w-5 text-purple-600" />
};

export function RecentActivity({ items }: { items?: ActivityItem[] }) {
  const data: ActivityItem[] = items || [
    { id: '1', icon: 'approved', title: 'Journal Entry Approved', detail: 'Entry #JE-2024-0045 - Office supplies purchase', minutesAgo: 2 },
    { id: '2', icon: 'reconciliation', title: 'Bank Reconciliation', detail: 'Chase Business Account - March 2024', minutesAgo: 60 },
    { id: '3', icon: 'review', title: 'Review Required', detail: 'Expense account variance detected', minutesAgo: 180 },
    { id: '4', icon: 'report', title: 'Report Generated', detail: 'P&L Statement for Q1 2024', minutesAgo: 1440 }
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Financial Activity</CardTitle>
        <CardDescription>Latest transactions and accounting activities</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {data.map(item => (
            <div key={item.id} className="flex items-center space-x-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                {iconMap[item.icon]}
              </div>
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">{item.detail}</p>
              </div>
              <div className="text-xs text-muted-foreground">{item.minutesAgo < 60 ? `${item.minutesAgo}m` : item.minutesAgo < 1440 ? `${Math.floor(item.minutesAgo/60)}h` : `${Math.floor(item.minutesAgo/1440)}d`} ago</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
