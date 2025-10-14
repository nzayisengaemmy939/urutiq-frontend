import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react"

type ClientStatus = "healthy" | "attention" | "critical"
type ClientTrend = "up" | "down"

interface Client {
  name: string
  industry: string
  revenue: string
  status: ClientStatus
  trend: ClientTrend
  change: string
  alerts: number
}

const clients: Client[] = [
  {
    name: "Acme Corporation",
    industry: "Technology",
    revenue: "$1,247,392",
    status: "healthy",
    trend: "up",
    change: "+15.2%",
    alerts: 0,
  },
  {
    name: "TechStart Inc",
    industry: "Software",
    revenue: "$892,847",
    status: "attention",
    trend: "up",
    change: "+8.7%",
    alerts: 2,
  },
  {
    name: "Local Bakery Co",
    industry: "Food Service",
    revenue: "$156,293",
    status: "healthy",
    trend: "down",
    change: "-3.1%",
    alerts: 0,
  },
  {
    name: "Green Energy LLC",
    industry: "Energy",
    revenue: "$550,860",
    status: "critical",
    trend: "down",
    change: "-12.4%",
    alerts: 5,
  },
]

const statusColors: Record<ClientStatus, string> = {
  healthy: "bg-green-100 text-green-800 border-green-200",
  attention: "bg-yellow-100 text-yellow-800 border-yellow-200",
  critical: "bg-red-100 text-red-800 border-red-200",
}

export function ClientOverview() {
  const totalRevenue = clients.reduce((sum, client) => {
    const revenue = parseFloat(client.revenue.replace(/[$,]/g, ''))
    return sum + revenue
  }, 0)

  const totalAlerts = clients.reduce((sum, client) => sum + client.alerts, 0)

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Building2 className="w-5 h-5 text-primary" />
          Client Overview
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{clients.length} clients</span>
          <span>•</span>
          <span>${totalRevenue.toLocaleString()} total revenue</span>
          {totalAlerts > 0 && (
            <>
              <span>•</span>
              <span className="text-destructive">{totalAlerts} alerts</span>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {clients.map((client, index) => (
          <div 
            key={`${client.name}-${index}`} 
            className="p-4 bg-muted/50 rounded-lg border border-border hover:bg-muted/70 transition-colors"
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <h4 className="text-sm font-medium text-foreground">{client.name}</h4>
                <p className="text-xs text-muted-foreground">{client.industry}</p>
              </div>
              <div className="flex items-center gap-2">
                {client.alerts > 0 && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-destructive/10 rounded-full">
                    <AlertCircle className="w-3 h-3 text-destructive" />
                    <span className="text-xs text-destructive font-medium">{client.alerts}</span>
                  </div>
                )}
                <Badge variant="outline" className={statusColors[client.status]}>
                  {client.status}
                </Badge>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{client.revenue}</span>
              <div className="flex items-center gap-1">
                {client.trend === "up" ? (
                  <TrendingUp className="w-3 h-3 text-green-500" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-500" />
                )}
                <span className={`text-xs font-medium ${client.trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {client.change}
                </span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
