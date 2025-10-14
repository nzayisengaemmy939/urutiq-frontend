import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { Badge } from "../components/ui/badge"
import { AlertTriangle, CheckCircle, RefreshCw, Eye, EyeOff } from "lucide-react"
import { useToast } from "./toast-provider"

interface ValidationIssue {
  id: string
  type: "error" | "warning" | "info"
  category: string
  title: string
  description: string
  affectedRecords: number
  autoFixable: boolean
  severity: "high" | "medium" | "low"
}

const mockValidationIssues: ValidationIssue[] = [
  {
    id: "duplicate-transactions",
    type: "warning",
    category: "Transactions",
    title: "Potential Duplicate Transactions",
    description: "Found 3 transactions that may be duplicates based on amount, date, and description",
    affectedRecords: 3,
    autoFixable: true,
    severity: "medium",
  },
  {
    id: "missing-categories",
    type: "error",
    category: "Categorization",
    title: "Uncategorized Transactions",
    description: "12 transactions are missing category assignments",
    affectedRecords: 12,
    autoFixable: true,
    severity: "high",
  },
  {
    id: "invalid-amounts",
    type: "error",
    category: "Data Integrity",
    title: "Invalid Transaction Amounts",
    description: "2 transactions have amounts that appear to be incorrectly formatted",
    affectedRecords: 2,
    autoFixable: false,
    severity: "high",
  },
  {
    id: "missing-client-info",
    type: "info",
    category: "Client Data",
    title: "Incomplete Client Information",
    description: "5 clients are missing contact information or tax details",
    affectedRecords: 5,
    autoFixable: false,
    severity: "low",
  },
]

const typeColors = {
  error: "bg-red-50 text-red-700 border-red-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
}

const severityColors = {
  high: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-blue-100 text-blue-800",
}

export function DataValidation() {
  const [issues, setIssues] = useState<ValidationIssue[]>(mockValidationIssues)
  const [isValidating, setIsValidating] = useState(false)
  const [showResolved, setShowResolved] = useState(false)
  const [resolvedIssues, setResolvedIssues] = useState<string[]>([])
  const { success, error } = useToast()

  const runValidation = async () => {
    setIsValidating(true)

    // Simulate validation process
    await new Promise((resolve) => setTimeout(resolve, 2000))

    // Simulate finding new issues or resolving existing ones
    const updatedIssues = [...mockValidationIssues]
    setIssues(updatedIssues)
    setIsValidating(false)

    success("Validation complete", `Found ${updatedIssues.length} issues to review`)
  }

  const handleAutoFix = async (issueId: string) => {
    const issue = issues.find((i) => i.id === issueId)
    if (!issue || !issue.autoFixable) return

    try {
      // Simulate auto-fix process
      await new Promise((resolve) => setTimeout(resolve, 1500))

      setResolvedIssues((prev) => [...prev, issueId])
      setIssues((prev) => prev.filter((i) => i.id !== issueId))

      success("Issue resolved", `${issue.title} has been automatically fixed`)
    } catch (err) {
      error("Auto-fix failed", "Please try manual resolution")
    }
  }

  const handleDismiss = (issueId: string) => {
    setResolvedIssues((prev) => [...prev, issueId])
    setIssues((prev) => prev.filter((i) => i.id !== issueId))
  }

  const activeIssues = issues.filter((issue) => !resolvedIssues.includes(issue.id))
  const errorCount = activeIssues.filter((i) => i.type === "error").length
  const warningCount = activeIssues.filter((i) => i.type === "warning").length

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-foreground">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            Data Validation
            {activeIssues.length > 0 && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-700">
                {activeIssues.length} issues
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowResolved(!showResolved)}
              className="text-muted-foreground hover:text-foreground"
            >
              {showResolved ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={runValidation}
              disabled={isValidating}
              className="gap-2 bg-transparent"
            >
              {isValidating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              {isValidating ? "Validating..." : "Run Validation"}
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeIssues.length === 0 && !isValidating && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-green-500" />
            <p className="text-sm">No validation issues found</p>
            <p className="text-xs mt-1">Your data appears to be clean and consistent</p>
          </div>
        )}

        {isValidating && (
          <div className="text-center py-8">
            <RefreshCw className="w-8 h-8 mx-auto mb-2 animate-spin text-cyan-500" />
            <p className="text-sm text-muted-foreground">Validating data integrity...</p>
          </div>
        )}

        {activeIssues.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
              <div className="text-2xl font-bold text-red-700">{errorCount}</div>
              <div className="text-xs text-red-600">Errors</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="text-2xl font-bold text-amber-700">{warningCount}</div>
              <div className="text-xs text-amber-600">Warnings</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-2xl font-bold text-blue-700">{activeIssues.filter((i) => i.autoFixable).length}</div>
              <div className="text-xs text-blue-600">Auto-fixable</div>
            </div>
          </div>
        )}

        {activeIssues.map((issue) => (
          <div key={issue.id} className={`p-4 rounded-lg border ${typeColors[issue.type]}`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <h4 className="text-sm font-medium">{issue.title}</h4>
                <Badge variant="outline" className={severityColors[issue.severity]}>
                  {issue.severity}
                </Badge>
              </div>
              <Badge variant="secondary" className="text-xs">
                {issue.category}
              </Badge>
            </div>

            <p className="text-sm mb-3 opacity-90">{issue.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs opacity-75">
                Affects {issue.affectedRecords} record{issue.affectedRecords !== 1 ? "s" : ""}
              </span>

              <div className="flex items-center gap-2">
                {issue.autoFixable && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAutoFix(issue.id)}
                    className="h-6 text-xs px-2 bg-white/50"
                  >
                    Auto-fix
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={() => handleDismiss(issue.id)} className="h-6 text-xs px-2">
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        ))}

        {showResolved && resolvedIssues.length > 0 && (
          <div className="pt-4 border-t border-border">
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Resolved Issues ({resolvedIssues.length})
            </h4>
            <div className="space-y-2">
              {resolvedIssues.map((issueId) => (
                <div key={issueId} className="p-2 bg-green-50 rounded border border-green-200 text-green-700">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-3 h-3" />
                    <span className="text-xs">Issue resolved: {issueId}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
