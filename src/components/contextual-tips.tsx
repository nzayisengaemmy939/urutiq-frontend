import { useState } from "react"
import { X, Lightbulb, AlertTriangle, TrendingUp } from "lucide-react"
import { Card, CardContent } from "../components/ui/card"
import { Button } from "../components/ui/button"

const contextualTips = [
  {
    id: 1,
    type: "duplicate",
    icon: AlertTriangle,
    title: "Potential Duplicate Detected",
    message: "Office supplies expense for $45.99 looks similar to yesterday's entry. Review?",
    action: "Review",
    color: "text-cyan-700 bg-cyan-50 border-cyan-200",
  },
  {
    id: 2,
    type: "insight",
    icon: TrendingUp,
    title: "Revenue Opportunity",
    message: "Acme Corp's payment is 5 days overdue. Send automated reminder?",
    action: "Send Reminder",
    color: "text-cyan-700 bg-cyan-50 border-cyan-200",
  },
  {
    id: 3,
    type: "suggestion",
    icon: Lightbulb,
    title: "Smart Categorization",
    message: "AI suggests categorizing 'Zoom Pro' as 'Software Subscriptions' instead of 'Office Expenses'",
    action: "Apply",
    color: "text-cyan-700 bg-cyan-50 border-cyan-200",
  },
]

export function ContextualTips() {
  const [tips, setTips] = useState(contextualTips)

  const dismissTip = (id: number) => {
    setTips(tips.filter((tip) => tip.id !== id))
  }

  if (tips.length === 0) return null

  return (
    <div className="space-y-2">
      {tips.map((tip) => (
        <Card key={tip.id} className={`border ${tip.color}`}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <tip.icon className={`h-5 w-5 mt-0.5 ${tip.color.split(" ")[0]}`} />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{tip.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{tip.message}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" className="h-8 text-xs bg-transparent">
                  {tip.action}
                </Button>
                <Button size="sm" variant="ghost" className="h-8 w-8 p-0" onClick={() => dismissTip(tip.id)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
