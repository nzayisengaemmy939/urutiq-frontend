import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, DollarSign, Users, FileText, AlertCircle } from "lucide-react"

const metrics = [
  {
    title: "Total Revenue",
    value: "$2,847,392",
    change: "+12.5%",
    trend: "up",
    icon: DollarSign,
    color: "text-chart-1",
  },
  {
    title: "Active Clients",
    value: "47",
    change: "+3",
    trend: "up",
    icon: Users,
    color: "text-chart-2",
  },
  {
    title: "Pending Invoices",
    value: "$184,293",
    change: "-8.2%",
    trend: "down",
    icon: FileText,
    color: "text-chart-4",
  },
  {
    title: "AI Anomalies",
    value: "12",
    change: "+4",
    trend: "up",
    icon: AlertCircle,
    color: "text-chart-3",
  },
]

export function FinancialMetrics() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <Card key={metric.title} className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">{metric.title}</CardTitle>
            <metric.icon className={`w-4 h-4 ${metric.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{metric.value}</div>
            <div className="flex items-center gap-1 text-xs">
              {metric.trend === "up" ? (
                <TrendingUp className="w-3 h-3 text-green-500" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500" />
              )}
              <span className={metric.trend === "up" ? "text-green-500" : "text-red-500"}>{metric.change}</span>
              <span className="text-muted-foreground">from last month</span>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
