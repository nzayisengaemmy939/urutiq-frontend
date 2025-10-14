"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Zap,
  Settings,
  Play,
  Plus,
  ArrowRight,
  Target,
  Clock,
  CheckCircle,
  BarChart3,
  FileText,
  Mail,
  DollarSign,
  Workflow,
  Bot,
  TrendingUp,
} from "lucide-react"

interface AutomationRule {
  id: string
  name: string
  description: string
  trigger: {
    type: "schedule" | "event" | "condition"
    value: string
    details: string
  }
  actions: {
    type: "categorize" | "notify" | "approve" | "reconcile" | "generate"
    value: string
    details: string
  }[]
  status: "active" | "paused" | "draft"
  performance: {
    executions: number
    successRate: number
    timeSaved: string
    accuracy: number
  }
  category: "invoicing" | "expenses" | "reconciliation" | "reporting" | "collections"
}

interface WorkflowTemplate {
  id: string
  name: string
  description: string
  category: string
  complexity: "simple" | "intermediate" | "advanced"
  estimatedSetup: string
  benefits: string[]
  rules: Partial<AutomationRule>[]
}

const mockAutomationRules: AutomationRule[] = [
  {
    id: "1",
    name: "Overdue Invoice Reminders",
    description: "Automatically send reminders for invoices past due",
    trigger: {
      type: "condition",
      value: "Invoice overdue > 30 days",
      details: "Check daily at 9:00 AM",
    },
    actions: [
      {
        type: "notify",
        value: "Send email reminder",
        details: "Email template: Overdue Invoice Reminder",
      },
      {
        type: "generate",
        value: "Create follow-up task",
        details: "Assign to collections team",
      },
    ],
    status: "active",
    performance: {
      executions: 45,
      successRate: 94,
      timeSaved: "3.2 hours/week",
      accuracy: 98,
    },
    category: "collections",
  },
  {
    id: "2",
    name: "Expense Categorization",
    description: "Smart categorization of expenses based on vendor and description",
    trigger: {
      type: "event",
      value: "New expense added",
      details: "Triggered on expense creation",
    },
    actions: [
      {
        type: "categorize",
        value: "Auto-assign category",
        details: "Based on ML model with 96% accuracy",
      },
    ],
    status: "active",
    performance: {
      executions: 234,
      successRate: 96,
      timeSaved: "5.1 hours/week",
      accuracy: 96,
    },
    category: "expenses",
  },
  {
    id: "3",
    name: "Bank Reconciliation",
    description: "Automatically match bank transactions with accounting records",
    trigger: {
      type: "schedule",
      value: "Daily at 6:00 AM",
      details: "Process overnight bank feeds",
    },
    actions: [
      {
        type: "reconcile",
        value: "Match transactions",
        details: "AI-powered matching with confidence scoring",
      },
      {
        type: "notify",
        value: "Flag discrepancies",
        details: "Alert for manual review",
      },
    ],
    status: "active",
    performance: {
      executions: 28,
      successRate: 89,
      timeSaved: "8.5 hours/week",
      accuracy: 92,
    },
    category: "reconciliation",
  },
]

const workflowTemplates: WorkflowTemplate[] = [
  {
    id: "1",
    name: "Invoice-to-Cash Automation",
    description: "Complete automation from invoice creation to payment collection",
    category: "invoicing",
    complexity: "advanced",
    estimatedSetup: "15 minutes",
    benefits: ["Reduce DSO by 25%", "Save 10+ hours/week", "Improve cash flow"],
    rules: [],
  },
  {
    id: "2",
    name: "Expense Management Workflow",
    description: "Automated expense categorization, approval, and reporting",
    category: "expenses",
    complexity: "intermediate",
    estimatedSetup: "10 minutes",
    benefits: ["95% auto-categorization", "Faster approvals", "Real-time reporting"],
    rules: [],
  },
  {
    id: "3",
    name: "Monthly Closing Automation",
    description: "Streamline month-end processes with automated reconciliation",
    category: "reporting",
    complexity: "advanced",
    estimatedSetup: "20 minutes",
    benefits: ["Close books 3 days faster", "Reduce errors by 80%", "Automated reports"],
    rules: [],
  },
]

export function IntelligentAutomationStudio() {
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>(mockAutomationRules)
  const [selectedRule, setSelectedRule] = useState<AutomationRule | null>(null)
  const [isCreatingRule, setIsCreatingRule] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>("all")

  const toggleRuleStatus = (ruleId: string) => {
    setAutomationRules(
      automationRules.map((rule) =>
        rule.id === ruleId ? { ...rule, status: rule.status === "active" ? "paused" : "active" } : rule,
      ),
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-700"
      case "paused":
        return "bg-yellow-100 text-yellow-700"
      case "draft":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "invoicing":
        return <FileText className="h-4 w-4" />
      case "expenses":
        return <DollarSign className="h-4 w-4" />
      case "reconciliation":
        return <BarChart3 className="h-4 w-4" />
      case "reporting":
        return <FileText className="h-4 w-4" />
      case "collections":
        return <Mail className="h-4 w-4" />
      default:
        return <Workflow className="h-4 w-4" />
    }
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case "simple":
        return "bg-green-100 text-green-700"
      case "intermediate":
        return "bg-yellow-100 text-yellow-700"
      case "advanced":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const filteredRules = automationRules.filter((rule) => activeCategory === "all" || rule.category === activeCategory)

  const categories = ["all", ...Array.from(new Set(automationRules.map((r) => r.category)))]

  const totalExecutions = automationRules.reduce((sum, rule) => sum + rule.performance.executions, 0)
  const avgSuccessRate = Math.round(
    automationRules.reduce((sum, rule) => sum + rule.performance.successRate, 0) / automationRules.length,
  )

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-indigo-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-purple-600" />
            <CardTitle className="text-purple-900">Automation Studio</CardTitle>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700">
              {automationRules.filter((r) => r.status === "active").length} Active
            </Badge>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsCreatingRule(true)}
              className="border-purple-300 text-purple-700 bg-transparent"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Rule
            </Button>
            <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
              <Settings className="h-4 w-4 mr-1" />
              Settings
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rules" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="rules">Active Rules</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="builder">Rule Builder</TabsTrigger>
          </TabsList>

          <TabsContent value="rules" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {categories.map((category) => (
                  <Button
                    key={category}
                    variant={activeCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category)}
                    className="text-xs"
                  >
                    {category === "all" ? "All" : category}
                  </Button>
                ))}
              </div>
              <div className="text-sm text-gray-600">
                {filteredRules.length} rules • {totalExecutions} total executions
              </div>
            </div>

            <div className="space-y-3">
              {filteredRules.map((rule) => (
                <div key={rule.id} className="p-4 bg-white rounded-lg border border-purple-100">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-purple-100 rounded-lg">{getCategoryIcon(rule.category)}</div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{rule.name}</h4>
                          <Badge variant="outline" className={getStatusColor(rule.status)}>
                            {rule.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {rule.trigger.value}
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {rule.actions.length} actions
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={rule.status === "active"} onCheckedChange={() => toggleRuleStatus(rule.id)} />
                      <Button size="sm" variant="ghost" onClick={() => setSelectedRule(rule)}>
                        <Settings className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-900">{rule.performance.executions}</div>
                      <div className="text-xs text-gray-600">Executions</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">{rule.performance.successRate}%</div>
                      <div className="text-xs text-gray-600">Success Rate</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">{rule.performance.timeSaved}</div>
                      <div className="text-xs text-gray-600">Time Saved</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-purple-600">{rule.performance.accuracy}%</div>
                      <div className="text-xs text-gray-600">Accuracy</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {workflowTemplates.map((template) => (
                <div key={template.id} className="p-4 bg-white rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Workflow className="h-4 w-4 text-purple-600" />
                    <h4 className="font-medium text-gray-900">{template.name}</h4>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className={getComplexityColor(template.complexity)}>
                      {template.complexity}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {template.estimatedSetup}
                    </div>
                  </div>
                  <div className="space-y-1 mb-4">
                    {template.benefits.slice(0, 2).map((benefit, index) => (
                      <div key={index} className="flex items-center gap-1 text-xs text-gray-600">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        {benefit}
                      </div>
                    ))}
                  </div>
                  <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                    Use Template
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-900">Total Executions</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{totalExecutions}</div>
                  <div className="text-xs text-gray-600">This month</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-900">Success Rate</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{avgSuccessRate}%</div>
                  <div className="text-xs text-gray-600">Average across all rules</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-gray-900">Time Saved</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">16.8h</div>
                  <div className="text-xs text-gray-600">Per week</div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Rule Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {automationRules.map((rule) => (
                    <div key={rule.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded">{getCategoryIcon(rule.category)}</div>
                        <div>
                          <div className="font-medium text-sm text-gray-900">{rule.name}</div>
                          <div className="text-xs text-gray-600">{rule.performance.executions} executions</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">{rule.performance.successRate}%</div>
                          <Progress value={rule.performance.successRate} className="w-20 h-2" />
                        </div>
                        <Badge variant="outline" className={getStatusColor(rule.status)}>
                          {rule.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="builder" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Visual Rule Builder</CardTitle>
                <p className="text-sm text-gray-600">Create custom automation rules with drag-and-drop interface</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label htmlFor="rule-name">Rule Name</Label>
                    <Input id="rule-name" placeholder="Enter rule name..." className="mt-1" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-blue-100 rounded-full">
                          <Target className="h-6 w-6 text-blue-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">Trigger</h4>
                        <p className="text-sm text-gray-600">When should this rule run?</p>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select trigger" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="schedule">Schedule</SelectItem>
                            <SelectItem value="event">Event</SelectItem>
                            <SelectItem value="condition">Condition</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowRight className="h-6 w-6 text-gray-400" />
                    </div>

                    <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                      <div className="flex flex-col items-center gap-2">
                        <div className="p-3 bg-green-100 rounded-full">
                          <Zap className="h-6 w-6 text-green-600" />
                        </div>
                        <h4 className="font-medium text-gray-900">Action</h4>
                        <p className="text-sm text-gray-600">What should happen?</p>
                        <Select>
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select action" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="categorize">Categorize</SelectItem>
                            <SelectItem value="notify">Send Notification</SelectItem>
                            <SelectItem value="approve">Auto Approve</SelectItem>
                            <SelectItem value="reconcile">Reconcile</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-center gap-2">
                    <Button variant="outline">
                      <Play className="h-4 w-4 mr-1" />
                      Test Rule
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Save Rule
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
