"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { PageLayout } from "@/components/page-layout"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { 
  Calculator, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Zap, 
  Target,
  Activity,
  BarChart3,
  Clock,
  DollarSign,
  FileText,
  Settings
} from "lucide-react"

export default function AutoBookkeeperPage() {
  const [activeTab, setActiveTab] = useState('overview')

  return (
    <ProtectedRoute>
      <PageLayout>
        <div className="flex-1 space-y-6 p-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">Auto-Bookkeeper Dashboard</h1>
              <p className="text-muted-foreground">AI-powered automated bookkeeping and transaction processing</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
              <Button>
                <Brain className="w-4 h-4 mr-2" />
                Train AI
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Auto-Processed</p>
                    <p className="text-xl font-bold">1,247</p>
                    <p className="text-xs text-green-600">+12% this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Brain className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">AI Accuracy</p>
                    <p className="text-xl font-bold">94.2%</p>
                    <p className="text-xs text-blue-600">+2.1% improvement</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Review</p>
                    <p className="text-xl font-bold">23</p>
                    <p className="text-xs text-amber-600">Requires attention</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Saved</p>
                    <p className="text-xl font-bold">47h</p>
                    <p className="text-xs text-purple-600">This month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="processing">Auto-Processing</TabsTrigger>
              <TabsTrigger value="learning">AI Learning</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Processing Status */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5" />
                      Processing Status
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Receipt Processing</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          Active
                        </Badge>
                      </div>
                      <Progress value={85} className="h-2" />
                      <p className="text-xs text-muted-foreground">85% of receipts auto-categorized</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Invoice Matching</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          Learning
                        </Badge>
                      </div>
                      <Progress value={72} className="h-2" />
                      <p className="text-xs text-muted-foreground">72% accuracy in invoice matching</p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Expense Categorization</span>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          Optimizing
                        </Badge>
                      </div>
                      <Progress value={91} className="h-2" />
                      <p className="text-xs text-muted-foreground">91% accuracy in expense categorization</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Clock className="w-5 h-5" />
                      Recent Activity
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Auto-processed 15 receipts</p>
                          <p className="text-xs text-muted-foreground">2 minutes ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Brain className="w-4 h-4 text-blue-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">AI learned new vendor pattern</p>
                          <p className="text-xs text-muted-foreground">15 minutes ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-lg">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">3 transactions need review</p>
                          <p className="text-xs text-muted-foreground">1 hour ago</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <TrendingUp className="w-4 h-4 text-purple-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium">Accuracy improved to 94.2%</p>
                          <p className="text-xs text-muted-foreground">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="processing" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="w-5 h-5" />
                    Auto-Processing Rules
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Receipt Processing</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Automatically extract data from receipts and categorize expenses
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                          <span className="text-xs text-muted-foreground">85% accuracy</span>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Invoice Matching</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Match incoming invoices with purchase orders automatically
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-blue-50 text-blue-700">Learning</Badge>
                          <span className="text-xs text-muted-foreground">72% accuracy</span>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Bank Reconciliation</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Automatically reconcile bank transactions with accounting records
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-purple-50 text-purple-700">Optimizing</Badge>
                          <span className="text-xs text-muted-foreground">91% accuracy</span>
                        </div>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-medium mb-2">Tax Categorization</h4>
                        <p className="text-sm text-muted-foreground mb-3">
                          Automatically categorize transactions for tax purposes
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                          <span className="text-xs text-muted-foreground">88% accuracy</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="learning" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5" />
                    AI Learning Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Model Performance</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-green-600">94.2%</div>
                          <div className="text-sm text-muted-foreground">Overall Accuracy</div>
                          <div className="text-xs text-green-600 mt-1">+2.1% this month</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">1,247</div>
                          <div className="text-sm text-muted-foreground">Transactions Processed</div>
                          <div className="text-xs text-blue-600 mt-1">+156 this week</div>
                        </div>
                        <div className="text-center p-4 border rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">47h</div>
                          <div className="text-sm text-muted-foreground">Time Saved</div>
                          <div className="text-xs text-purple-600 mt-1">This month</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">Learning Insights</h4>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm font-medium text-blue-900">New Vendor Pattern Detected</p>
                          <p className="text-xs text-blue-700">AI identified recurring expense pattern for "Office Supplies Co."</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                          <p className="text-sm font-medium text-green-900">Accuracy Improvement</p>
                          <p className="text-xs text-green-700">Receipt categorization accuracy improved by 3.2% this week</p>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <p className="text-sm font-medium text-purple-900">New Category Learned</p>
                          <p className="text-xs text-purple-700">AI learned to categorize "Software Subscriptions" automatically</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Auto-Bookkeeper Settings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h4 className="font-medium">Processing Rules</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Auto-categorize receipts</p>
                            <p className="text-sm text-muted-foreground">Automatically categorize receipts based on vendor and amount</p>
                          </div>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Auto-match invoices</p>
                            <p className="text-sm text-muted-foreground">Match incoming invoices with purchase orders</p>
                          </div>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Auto-reconcile bank</p>
                            <p className="text-sm text-muted-foreground">Automatically reconcile bank transactions</p>
                          </div>
                          <Button variant="outline" size="sm">Configure</Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="font-medium">AI Learning</h4>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Continuous learning</p>
                            <p className="text-sm text-muted-foreground">AI learns from your corrections and feedback</p>
                          </div>
                          <Button variant="outline" size="sm">Enable</Button>
                        </div>
                        
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Confidence threshold</p>
                            <p className="text-sm text-muted-foreground">Minimum confidence level for auto-processing</p>
                          </div>
                          <Button variant="outline" size="sm">Set to 85%</Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </PageLayout>
    </ProtectedRoute>
  )
}
