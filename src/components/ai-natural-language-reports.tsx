import React, { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Textarea } from "../components/ui/textarea"
import {
  Brain,
  Search,
  FileText,
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  Loader2,
  Copy,
  Download,
  MessageSquare,
  Lightbulb,
  BarChart3,
  PieChart,
  Activity,
} from "lucide-react"
import { useToast } from "../hooks/use-toast"

interface ReportTemplate {
  id: string
  name: string
  description: string
  examples: string[]
}

interface ReportResult {
  query: string
  sqlQuery: string
  results: any[]
  summary: string
  generatedAt: string
}

export function AINaturalLanguageReports() {
  const [query, setQuery] = useState("")
  const [selectedCompany, setSelectedCompany] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [reportHistory, setReportHistory] = useState<ReportResult[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState("")
  const [dateRange, setDateRange] = useState({ start: "", end: "" })
  const { toast } = useToast()

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'cash-flow',
      name: 'Cash Flow Report',
      description: 'Show me a cash flow report for [period]',
      examples: [
        'Show me a cash flow report for August 2025',
        'What is my cash flow for Q2 2025?',
        'Generate cash flow analysis for this month'
      ]
    },
    {
      id: 'revenue-analysis',
      name: 'Revenue Analysis',
      description: 'Show me revenue trends for [period]',
      examples: [
        'Show me revenue trends for the last 6 months',
        'What is my revenue breakdown by customer?',
        'Compare revenue between Q1 and Q2 2025'
      ]
    },
    {
      id: 'expense-breakdown',
      name: 'Expense Breakdown',
      description: 'Show me expense breakdown for [period]',
      examples: [
        'Show me expense breakdown for this quarter',
        'What are my top 10 expenses this month?',
        'Compare expenses between departments'
      ]
    },
    {
      id: 'anomaly-report',
      name: 'Anomaly Report',
      description: 'Show me unusual transactions for [period]',
      examples: [
        'Show me unusual transactions for this month',
        'Find transactions over $1000',
        'Identify potential duplicate payments'
      ]
    }
  ]

  const generateReport = async () => {
    if (!selectedCompany || !query.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select a company and enter a query",
        variant: "destructive"
      })
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch('/api/ai/reports/natural-language', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': 'tenant_demo',
          'x-company-id': selectedCompany
        },
        body: JSON.stringify({
          companyId: selectedCompany,
          query: query.trim(),
          dateRange: dateRange.start && dateRange.end ? {
            start: dateRange.start,
            end: dateRange.end
          } : undefined
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate report')
      }

      const result = await response.json()
      const newReport: ReportResult = {
        query: query.trim(),
        sqlQuery: result.report.sqlQuery || '',
        results: result.report.results || [],
        summary: result.report.summary || result.report.fallback || 'Report generated successfully',
        generatedAt: new Date().toISOString()
      }

      setReportHistory(prev => [newReport, ...prev])
      setQuery("")
      
      toast({
        title: "Report Generated",
        description: "Your natural language report has been created",
      })
    } catch (error) {
      console.error('Report generation error:', error)
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleTemplateSelect = (templateId: string) => {
    const template = reportTemplates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setQuery(template.examples[0])
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied",
      description: "Text copied to clipboard",
    })
  }

  const exportReport = (report: ReportResult) => {
    const data = {
      query: report.query,
      summary: report.summary,
      results: report.results,
      generatedAt: report.generatedAt
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `report-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast({
      title: "Report Exported",
      description: "Report has been downloaded",
    })
  }

  const getChartIcon = (query: string) => {
    const lowerQuery = query.toLowerCase()
    if (lowerQuery.includes('trend') || lowerQuery.includes('over time')) return <TrendingUp className="w-4 h-4" />
    if (lowerQuery.includes('breakdown') || lowerQuery.includes('by')) return <PieChart className="w-4 h-4" />
    if (lowerQuery.includes('cash flow') || lowerQuery.includes('flow')) return <Activity className="w-4 h-4" />
    return <BarChart3 className="w-4 h-4" />
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-cyan-600" />
            Natural Language Reports
            <Badge variant="secondary" className="bg-cyan-100 text-cyan-700">
              <Sparkles className="w-3 h-3 mr-1" />
              AI-Powered
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Query Input */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Company</label>
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger>
                  <SelectValue placeholder="Select company" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="company_1">Demo Company 1</SelectItem>
                  <SelectItem value="company_2">Demo Company 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium text-muted-foreground">Date Range (Optional)</label>
              <div className="flex gap-2">
                <Input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                  placeholder="Start date"
                  className="text-xs"
                />
                <Input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                  placeholder="End date"
                  className="text-xs"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button
                onClick={generateReport}
                disabled={isGenerating || !query.trim() || !selectedCompany}
                className="w-full"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Search className="w-4 h-4 mr-2" />
                )}
                Generate Report
              </Button>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Ask your question</label>
            <Textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g., Show me a cash flow report for August 2025"
              className="min-h-[80px]"
            />
          </div>
        </div>

        {/* Report Templates */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Report Templates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                  selectedTemplate === template.id
                    ? 'border-cyan-500 bg-cyan-50'
                    : 'border-border hover:border-cyan-300'
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-sm font-medium">{template.name}</h4>
                  <Badge variant="outline" className="text-xs">
                    Template
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">{template.description}</p>
                <div className="space-y-1">
                  {template.examples.slice(0, 2).map((example, index) => (
                    <div
                      key={index}
                      className="text-xs text-cyan-600 cursor-pointer hover:text-cyan-700"
                      onClick={(e) => {
                        e.stopPropagation()
                        setQuery(example)
                      }}
                    >
                      • {example}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Report History */}
        {reportHistory.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Recent Reports</h3>
            {reportHistory.map((report, index) => (
              <div key={index} className="p-4 bg-muted/30 rounded-lg border border-border">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getChartIcon(report.query)}
                    <h4 className="text-sm font-medium">Report #{index + 1}</h4>
                    <Badge variant="outline" className="text-xs">
                      {new Date(report.generatedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(report.summary)}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => exportReport(report)}
                      className="h-6 w-6 p-0"
                    >
                      <Download className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Query:</span>
                    <p className="text-sm mt-1">{report.query}</p>
                  </div>

                  <div>
                    <span className="text-xs font-medium text-muted-foreground">Summary:</span>
                    <p className="text-sm mt-1 bg-background/50 p-2 rounded">{report.summary}</p>
                  </div>

                  {report.results && report.results.length > 0 && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Results:</span>
                      <div className="mt-2 max-h-40 overflow-y-auto">
                        <pre className="text-xs bg-background/50 p-2 rounded overflow-x-auto">
                          {JSON.stringify(report.results, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}

                  {report.sqlQuery && (
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">Generated SQL:</span>
                      <div className="mt-2">
                        <pre className="text-xs bg-background/50 p-2 rounded overflow-x-auto">
                          {report.sqlQuery}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {reportHistory.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No reports generated yet</p>
            <p className="text-xs mt-1">Ask a question in natural language to generate your first report</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
