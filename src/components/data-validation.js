import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { AlertTriangle, CheckCircle, RefreshCw, Eye, EyeOff } from "lucide-react";
import { useToast } from "./toast-provider";
const mockValidationIssues = [
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
];
const typeColors = {
    error: "bg-red-50 text-red-700 border-red-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    info: "bg-blue-50 text-blue-700 border-blue-200",
};
const severityColors = {
    high: "bg-red-100 text-red-800",
    medium: "bg-amber-100 text-amber-800",
    low: "bg-blue-100 text-blue-800",
};
export function DataValidation() {
    const [issues, setIssues] = useState(mockValidationIssues);
    const [isValidating, setIsValidating] = useState(false);
    const [showResolved, setShowResolved] = useState(false);
    const [resolvedIssues, setResolvedIssues] = useState([]);
    const { success, error } = useToast();
    const runValidation = async () => {
        setIsValidating(true);
        // Simulate validation process
        await new Promise((resolve) => setTimeout(resolve, 2000));
        // Simulate finding new issues or resolving existing ones
        const updatedIssues = [...mockValidationIssues];
        setIssues(updatedIssues);
        setIsValidating(false);
        success("Validation complete", `Found ${updatedIssues.length} issues to review`);
    };
    const handleAutoFix = async (issueId) => {
        const issue = issues.find((i) => i.id === issueId);
        if (!issue || !issue.autoFixable)
            return;
        try {
            // Simulate auto-fix process
            await new Promise((resolve) => setTimeout(resolve, 1500));
            setResolvedIssues((prev) => [...prev, issueId]);
            setIssues((prev) => prev.filter((i) => i.id !== issueId));
            success("Issue resolved", `${issue.title} has been automatically fixed`);
        }
        catch (err) {
            error("Auto-fix failed", "Please try manual resolution");
        }
    };
    const handleDismiss = (issueId) => {
        setResolvedIssues((prev) => [...prev, issueId]);
        setIssues((prev) => prev.filter((i) => i.id !== issueId));
    };
    const activeIssues = issues.filter((issue) => !resolvedIssues.includes(issue.id));
    const errorCount = activeIssues.filter((i) => i.type === "error").length;
    const warningCount = activeIssues.filter((i) => i.type === "warning").length;
    return (_jsxs(Card, { className: "bg-card border-border", children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center justify-between text-foreground", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-5 h-5 text-amber-600" }), "Data Validation", activeIssues.length > 0 && (_jsxs(Badge, { variant: "secondary", className: "bg-amber-100 text-amber-700", children: [activeIssues.length, " issues"] }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Button, { variant: "ghost", size: "sm", onClick: () => setShowResolved(!showResolved), className: "text-muted-foreground hover:text-foreground", children: showResolved ? _jsx(EyeOff, { className: "w-4 h-4" }) : _jsx(Eye, { className: "w-4 h-4" }) }), _jsxs(Button, { variant: "outline", size: "sm", onClick: runValidation, disabled: isValidating, className: "gap-2 bg-transparent", children: [isValidating ? _jsx(RefreshCw, { className: "w-4 h-4 animate-spin" }) : _jsx(RefreshCw, { className: "w-4 h-4" }), isValidating ? "Validating..." : "Run Validation"] })] })] }) }), _jsxs(CardContent, { className: "space-y-4", children: [activeIssues.length === 0 && !isValidating && (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx(CheckCircle, { className: "w-8 h-8 mx-auto mb-2 text-green-500" }), _jsx("p", { className: "text-sm", children: "No validation issues found" }), _jsx("p", { className: "text-xs mt-1", children: "Your data appears to be clean and consistent" })] })), isValidating && (_jsxs("div", { className: "text-center py-8", children: [_jsx(RefreshCw, { className: "w-8 h-8 mx-auto mb-2 animate-spin text-cyan-500" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Validating data integrity..." })] })), activeIssues.length > 0 && (_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: "text-center p-3 bg-red-50 rounded-lg border border-red-200", children: [_jsx("div", { className: "text-2xl font-bold text-red-700", children: errorCount }), _jsx("div", { className: "text-xs text-red-600", children: "Errors" })] }), _jsxs("div", { className: "text-center p-3 bg-amber-50 rounded-lg border border-amber-200", children: [_jsx("div", { className: "text-2xl font-bold text-amber-700", children: warningCount }), _jsx("div", { className: "text-xs text-amber-600", children: "Warnings" })] }), _jsxs("div", { className: "text-center p-3 bg-blue-50 rounded-lg border border-blue-200", children: [_jsx("div", { className: "text-2xl font-bold text-blue-700", children: activeIssues.filter((i) => i.autoFixable).length }), _jsx("div", { className: "text-xs text-blue-600", children: "Auto-fixable" })] })] })), activeIssues.map((issue) => (_jsxs("div", { className: `p-4 rounded-lg border ${typeColors[issue.type]}`, children: [_jsxs("div", { className: "flex items-start justify-between mb-2", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(AlertTriangle, { className: "w-4 h-4 flex-shrink-0" }), _jsx("h4", { className: "text-sm font-medium", children: issue.title }), _jsx(Badge, { variant: "outline", className: severityColors[issue.severity], children: issue.severity })] }), _jsx(Badge, { variant: "secondary", className: "text-xs", children: issue.category })] }), _jsx("p", { className: "text-sm mb-3 opacity-90", children: issue.description }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-xs opacity-75", children: ["Affects ", issue.affectedRecords, " record", issue.affectedRecords !== 1 ? "s" : ""] }), _jsxs("div", { className: "flex items-center gap-2", children: [issue.autoFixable && (_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleAutoFix(issue.id), className: "h-6 text-xs px-2 bg-white/50", children: "Auto-fix" })), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => handleDismiss(issue.id), className: "h-6 text-xs px-2", children: "Dismiss" })] })] })] }, issue.id))), showResolved && resolvedIssues.length > 0 && (_jsxs("div", { className: "pt-4 border-t border-border", children: [_jsxs("h4", { className: "text-sm font-medium text-muted-foreground mb-2", children: ["Resolved Issues (", resolvedIssues.length, ")"] }), _jsx("div", { className: "space-y-2", children: resolvedIssues.map((issueId) => (_jsx("div", { className: "p-2 bg-green-50 rounded border border-green-200 text-green-700", children: _jsxs("div", { className: "flex items-center gap-2", children: [_jsx(CheckCircle, { className: "w-3 h-3" }), _jsxs("span", { className: "text-xs", children: ["Issue resolved: ", issueId] })] }) }, issueId))) })] }))] })] }));
}
