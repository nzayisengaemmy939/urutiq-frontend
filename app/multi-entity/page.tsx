"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import {
  Building2,
  Plus,
  Settings,
  BarChart3,
  DollarSign,
  FileText,
  Globe,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Target,
  Zap,
} from "lucide-react"

const companies = [
  {
    id: 1,
    name: "TechCorp Inc.",
    type: "Parent Company",
    currency: "USD",
    status: "Active",
    revenue: "$2.4M",
    employees: 45,
    lastSync: "2 minutes ago",
    compliance: 98,
    location: "New York, USA",
  },
  {
    id: 2,
    name: "TechCorp Europe Ltd.",
    type: "Subsidiary",
    currency: "EUR",
    status: "Active",
    revenue: "€1.8M",
    employees: 32,
    lastSync: "5 minutes ago",
    compliance: 95,
    location: "London, UK",
  },
  {
    id: 3,
    name: "TechCorp Asia Pte.",
    type: "Subsidiary",
    currency: "SGD",
    status: "Active",
    revenue: "S$1.2M",
    employees: 28,
    lastSync: "1 hour ago",
    compliance: 92,
    location: "Singapore",
  },
  {
    id: 4,
    name: "Innovation Labs LLC",
    type: "Joint Venture",
    currency: "USD",
    status: "Pending Setup",
    revenue: "$0",
    employees: 0,
    lastSync: "Never",
    compliance: 0,
    location: "San Francisco, USA",
  },
]

const consolidatedMetrics = [
  { label: "Total Revenue", value: "$5.4M", change: "+12.5%", trend: "up" },
  { label: "Combined Employees", value: "105", change: "+8", trend: "up" },
  { label: "Active Entities", value: "3", change: "0", trend: "neutral" },
  { label: "Avg Compliance", value: "95%", change: "+2%", trend: "up" },
]

const interCompanyTransactions = [
  {
    id: 1,
    from: "TechCorp Inc.",
    to: "TechCorp Europe Ltd.",
    type: "Service Fee",
    amount: "$45,000",
    currency: "USD",
    status: "Completed",
    date: "2024-01-15",
  },
  {
    id: 2,
    from: "TechCorp Europe Ltd.",
    to: "TechCorp Asia Pte.",
    type: "License Fee",
    amount: "€25,000",
    currency: "EUR",
    status: "Pending",
    date: "2024-01-14",
  },
  {
    id: 3,
    from: "TechCorp Asia Pte.",
    to: "TechCorp Inc.",
    type: "Royalty Payment",
    amount: "S$30,000",
    currency: "SGD",
    status: "Processing",
    date: "2024-01-13",
  },
]

export default function MultiEntityPage() {
  const [selectedCompany, setSelectedCompany] = useState(companies[0])

  return (
    <div className="flex-1 space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multi-Entity Management</h1>
          <p className="text-muted-foreground">
            Manage multiple companies, consolidated reporting, and inter-company transactions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            Add Entity
          </Button>
        </div>
      </div>

      {/* Consolidated Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {consolidatedMetrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              {metric.trend === "up" ? (
                <ArrowUpRight className="h-4 w-4 text-green-600" />
              ) : metric.trend === "down" ? (
                <ArrowDownRight className="h-4 w-4 text-red-600" />
              ) : (
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              )}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span
                  className={
                    metric.trend === "up"
                      ? "text-green-600"
                      : metric.trend === "down"
                        ? "text-red-600"
                        : "text-muted-foreground"
                  }
                >
                  {metric.change}
                </span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="entities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="entities">Entity Overview</TabsTrigger>
          <TabsTrigger value="consolidated">Consolidated Reports</TabsTrigger>
          <TabsTrigger value="intercompany">Inter-Company</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="entities" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <Card key={company.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-cyan-600" />
                      <CardTitle className="text-lg">{company.name}</CardTitle>
                    </div>
                    <Badge variant={company.status === "Active" ? "default" : "secondary"}>{company.status}</Badge>
                  </div>
                  <CardDescription>{company.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Revenue</p>
                      <p className="font-semibold">{company.revenue}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Employees</p>
                      <p className="font-semibold">{company.employees}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Currency</p>
                      <p className="font-semibold">{company.currency}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Location</p>
                      <p className="font-semibold text-xs">{company.location}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Compliance Score</span>
                      <span className="font-semibold">{company.compliance}%</span>
                    </div>
                    <Progress value={company.compliance} className="h-2" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Last sync: {company.lastSync}</span>
                    {company.status === "Active" ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <Clock className="w-4 h-4 text-yellow-600" />
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="consolidated" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Consolidated P&L</CardTitle>
                <CardDescription>Combined profit and loss across all entities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Revenue</span>
                    <span className="font-semibold">$5,400,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Expenses</span>
                    <span className="font-semibold">$3,800,000</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Net Income</span>
                    <span className="font-semibold text-green-600">$1,600,000</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Full Report
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Consolidated Balance Sheet</CardTitle>
                <CardDescription>Combined assets and liabilities</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Total Assets</span>
                    <span className="font-semibold">$8,200,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Liabilities</span>
                    <span className="font-semibold">$2,100,000</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Equity</span>
                    <span className="font-semibold text-cyan-600">$6,100,000</span>
                  </div>
                </div>
                <Button variant="outline" className="w-full bg-transparent">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Details
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Currency Consolidation</CardTitle>
              <CardDescription>Multi-currency consolidation with real-time rates</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <div>
                      <p className="font-semibold">USD (Base Currency)</p>
                      <p className="text-sm text-muted-foreground">United States Dollar</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">$3,600,000</p>
                    <p className="text-sm text-muted-foreground">66.7%</p>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-semibold">EUR → USD</p>
                      <p className="text-sm text-muted-foreground">Rate: 1.08 (Live)</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">$1,944,000</p>
                    <p className="text-sm text-muted-foreground">36.0%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="intercompany" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Inter-Company Transactions</CardTitle>
              <CardDescription>Track and manage transactions between entities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {interCompanyTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-cyan-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-cyan-600" />
                      </div>
                      <div>
                        <p className="font-semibold">{transaction.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.from} → {transaction.to}
                        </p>
                        <p className="text-xs text-muted-foreground">{transaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{transaction.amount}</p>
                      <Badge
                        variant={
                          transaction.status === "Completed"
                            ? "default"
                            : transaction.status === "Pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {transaction.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4">
                <Plus className="w-4 h-4 mr-2" />
                Create Inter-Company Transaction
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Overview</CardTitle>
                <CardDescription>Multi-jurisdiction compliance status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>US GAAP</span>
                    </div>
                    <Badge variant="default">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>IFRS</span>
                    </div>
                    <Badge variant="default">Compliant</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span>Singapore FRS</span>
                    </div>
                    <Badge variant="secondary">Review Required</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>AI Compliance Insights</CardTitle>
                <CardDescription>Smart recommendations for compliance optimization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                    <Zap className="w-4 h-4 text-cyan-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-cyan-800">Automate inter-company eliminations</p>
                      <p className="text-xs text-cyan-600">Save 15 hours monthly with automated consolidation</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <Target className="w-4 h-4 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Update Singapore entity reporting</p>
                      <p className="text-xs text-yellow-600">New FRS requirements effective next quarter</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
