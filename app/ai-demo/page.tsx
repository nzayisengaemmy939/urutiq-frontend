"use client"

import React, { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Brain,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  FileText,
  BarChart3,
  LineChart,
  Settings,
  CheckCircle,
  Lightbulb,
  Database,
  Shield,
  Clock,
} from "lucide-react"
import { AITransactionCategorization } from "@/components/ai-transaction-categorization"
import { AINaturalLanguageReports } from "@/components/ai-natural-language-reports"
import { AICashFlowForecasting } from "@/components/ai-cash-flow-forecasting"
import { AIAssistantEnhanced } from "@/components/ai-assistant-enhanced"
import { AIConfigurationManager } from "@/components/ai-configuration-manager"
import { ConversationalParser } from "@/components/conversational-parser"
import { AIInsights } from "@/components/ai-insights"

export default function AIDemoPage() {
  const [activeTab, setActiveTab] = useState("overview")

  const features = [
    {
      id: "categorization",
      title: "AI Transaction Categorization",
      description: "Automatically categorize bank transactions using AI",
      icon: Database,
      status: "active",
      examples: [
        "Payment to Airtel 45,000 RWF → Telecom Expense",
        "Office supplies from Stationery Plus → Office Supplies",
        "Fuel payment at Total station → Fuel Expense"
      ]
    },
    {
      id: "anomaly",
      title: "Anomaly Detection & Fraud Alerts",
      description: "AI scans ledgers for unusual activity and potential fraud",
      icon: Shield,
      status: "active",
      examples: [
        "Duplicate payments detection",
        "Unusual transaction amounts",
        "Suspicious timing patterns"
      ]
    },
    {
      id: "reports",
      title: "Natural Language Reports",
      description: "Ask questions in plain English and get instant reports",
      icon: FileText,
      status: "active",
      examples: [
        "Show me a cash flow report for August 2025",
        "What is my revenue breakdown by customer?",
        "Find transactions over $1000"
      ]
    },
    {
      id: "forecasting",
      title: "Smart Insights & Forecasting",
      description: "AI predicts cash flow and provides actionable insights",
      icon: TrendingUp,
      status: "active",
      examples: [
        "Cash flow predictions for next 3 months",
        "Revenue trend analysis",
        "Cash shortage alerts"
      ]
    },
         {
       id: "assistant",
       title: "AI Assistant for Accountants",
       description: "Chat-like interface for accounting tasks and queries",
       icon: MessageSquare,
       status: "active",
       examples: [
         "Summarize financial health for Q2 2025",
         "Categorize my recent transactions",
         "Generate expense analysis report"
       ]
     },
     {
       id: "parser",
       title: "Conversational Transaction Parser",
       description: "Convert natural language into structured journal entries",
       icon: MessageSquare,
       status: "active",
       examples: [
         "I paid electricity bill 30,000 RWF",
         "Received payment from client ABC Corp 500,000 RWF",
         "Bought office supplies for 15,000 RWF"
       ]
     }
  ]

  const stats = [
    { label: "AI Models", value: "Llama 3.1", icon: Brain },
    { label: "Processing Speed", value: "< 2s", icon: Zap },
    { label: "Accuracy", value: "95%+", icon: Target },
         { label: "Features", value: "6 Core", icon: CheckCircle },
  ]

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-8 h-8 text-cyan-600" />
          <h1 className="text-3xl font-bold text-foreground">AI-Powered Accounting Platform</h1>
          <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
            <Sparkles className="w-4 h-4 mr-1" />
            Powered by Llama 3.1
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Experience the future of accounting with AI that matches or exceeds QuickBooks & Xero capabilities. 
          From transaction categorization to predictive insights, our AI handles it all.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="text-center">
            <CardContent className="p-4">
              <stat.icon className="w-6 h-6 mx-auto mb-2 text-cyan-600" />
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-cyan-600" />
            Core AI Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature) => (
              <div key={feature.id} className="p-4 border rounded-lg hover:border-cyan-300 transition-colors">
                <div className="flex items-center gap-2 mb-3">
                  <feature.icon className="w-5 h-5 text-cyan-600" />
                  <h3 className="font-medium">{feature.title}</h3>
                  <Badge variant="outline" className="text-xs">
                    {feature.status}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{feature.description}</p>
                <div className="space-y-1">
                  {feature.examples.map((example, index) => (
                    <div key={index} className="text-xs text-cyan-600">
                      • {example}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Interactive Demo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                 <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="categorization">Categorization</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="forecasting">Forecasting</TabsTrigger>
          <TabsTrigger value="assistant">Assistant</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
                     <TabsTrigger value="configuration">Configuration</TabsTrigger>
           <TabsTrigger value="parser">Parser</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-cyan-600" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                      1
                    </div>
                    <div>
                      <h4 className="font-medium">Upload Data</h4>
                      <p className="text-sm text-muted-foreground">
                        Import bank transactions, invoices, and financial data
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                      2
                    </div>
                    <div>
                      <h4 className="font-medium">AI Processing</h4>
                      <p className="text-sm text-muted-foreground">
                        Llama 3.1 analyzes and categorizes transactions automatically
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-cyan-600 flex items-center justify-center text-white text-xs font-bold">
                      3
                    </div>
                    <div>
                      <h4 className="font-medium">Get Insights</h4>
                      <p className="text-sm text-muted-foreground">
                        Receive reports, predictions, and actionable recommendations
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-cyan-600" />
                  Key Benefits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">90% reduction in manual categorization time</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Real-time fraud detection and alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Natural language queries for instant reports</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Predictive insights for better decision making</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span className="text-sm">24/7 AI assistant for accounting tasks</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="categorization">
          <AITransactionCategorization />
        </TabsContent>

        <TabsContent value="reports">
          <AINaturalLanguageReports />
        </TabsContent>

        <TabsContent value="forecasting">
          <AICashFlowForecasting />
        </TabsContent>

        <TabsContent value="assistant">
          <AIAssistantEnhanced />
        </TabsContent>

        <TabsContent value="insights">
          <AIInsights />
        </TabsContent>

                 <TabsContent value="configuration">
           <AIConfigurationManager companyId="seed-company-1" />
         </TabsContent>

         <TabsContent value="parser">
           <ConversationalParser companyId="seed-company-1" />
         </TabsContent>
      </Tabs>

      {/* Technology Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-cyan-600" />
            Technology Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h4 className="font-medium">AI Models</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm">Llama 3.1 (8B parameters)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm">Ollama Runtime</span>
                </div>
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm">Custom Fine-tuning</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Backend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm">PostgreSQL</span>
                </div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm">Prisma ORM</span>
                </div>
                <div className="flex items-center gap-2">
                  <LineChart className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm">Express.js API</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Frontend</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm">React + TypeScript</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm">Tailwind CSS v4</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-cyan-600" />
                  <span className="text-sm">React Query</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r from-cyan-50 to-blue-50 border-cyan-200">
        <CardContent className="p-6 text-center">
          <h3 className="text-xl font-bold text-foreground mb-2">
            Ready to Transform Your Accounting?
          </h3>
          <p className="text-muted-foreground mb-4">
            Experience the power of AI-driven accounting that matches or exceeds industry leaders.
          </p>
          <div className="flex gap-3 justify-center">
            <Button size="lg" className="bg-cyan-600 hover:bg-cyan-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg">
              <MessageSquare className="w-4 h-4 mr-2" />
              Schedule Demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
