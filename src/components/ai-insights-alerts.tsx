import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { AlertTriangle, Brain, TrendingUp, DollarSign, Zap, Eye, RefreshCw } from "lucide-react";
import { useAIInsightsList, ParsedInsight } from "../hooks/useAIInsightsList";
import { useState } from "react";

interface AIInsightsAlertsProps {
  maxItems?: number;
  showHeader?: boolean;
  compact?: boolean;
}

export function AIInsightsAlerts({ maxItems = 5, showHeader = true, compact = false }: AIInsightsAlertsProps) {
  const { insights, loading, error, refetch } = useAIInsightsList();
  const [expandedInsight, setExpandedInsight] = useState<string | null>(null);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'revenue':
        return <TrendingUp className="h-4 w-4" />;
      case 'cash_flow':
        return <DollarSign className="h-4 w-4" />;
      case 'expenses':
        return <Zap className="h-4 w-4" />;
      case 'risk':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Brain className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact?.toLowerCase()) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-amber-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <Card>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Insights
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            <span className="text-sm text-muted-foreground">Loading AI insights...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        {showHeader && (
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Insights
            </CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="flex items-center justify-center py-8 text-red-600">
            <AlertTriangle className="h-4 w-4 mr-2" />
            <span className="text-sm">Error loading insights</span>
            <Button variant="ghost" size="sm" onClick={refetch} className="ml-2">
              <RefreshCw className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const displayInsights = insights.slice(0, maxItems);

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI Insights
              <Badge variant="secondary" className="ml-2">
                {insights.length}
              </Badge>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={refetch}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            AI-powered financial insights and recommendations
          </CardDescription>
        </CardHeader>
      )}
      <CardContent className="space-y-3">
        {displayInsights.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No AI insights available</p>
            <p className="text-xs">AI is analyzing your financial data</p>
          </div>
        ) : (
          displayInsights.map((insight) => (
            <div
              key={insight.id}
              className={`p-3 rounded-lg border transition-all hover:shadow-sm ${
                insight.priority === 'high' 
                  ? 'border-red-200 bg-red-50' 
                  : insight.priority === 'medium'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-blue-200 bg-blue-50'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-1 rounded-full ${getPriorityColor(insight.priority)}`}>
                  {getCategoryIcon(insight.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="text-xs">
                      {insight.category.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getPriorityColor(insight.priority)}`}
                    >
                      {insight.priority.toUpperCase()}
                    </Badge>
                    {insight.confidence && (
                      <span className="text-xs text-muted-foreground">
                        {Math.round(insight.confidence * 100)}% confidence
                      </span>
                    )}
                  </div>
                  
                  <p className={`text-sm font-medium mb-1 ${
                    compact ? 'line-clamp-2' : 'line-clamp-3'
                  }`}>
                    {insight.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(insight.generatedAt)}</span>
                    {insight.impact && (
                      <span className={`font-medium ${getImpactColor(insight.impact)}`}>
                        {insight.impact.toUpperCase()} IMPACT
                      </span>
                    )}
                  </div>
                  
                  {!compact && insight.description.length > 100 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-2 h-6 px-2 text-xs"
                      onClick={() => setExpandedInsight(
                        expandedInsight === insight.id ? null : insight.id
                      )}
                    >
                      {expandedInsight === insight.id ? 'Show less' : 'Show more'}
                    </Button>
                  )}
                  
                  {expandedInsight === insight.id && (
                    <div className="mt-2 p-2 bg-white/50 rounded border text-xs">
                      <p className="text-muted-foreground">
                        <strong>Type:</strong> {insight.type}<br/>
                        <strong>Confidence:</strong> {Math.round(insight.confidence * 100)}%<br/>
                        <strong>Impact:</strong> {insight.impact}
                      </p>
                    </div>
                  )}
                </div>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                  <Eye className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))
        )}
        
        {insights.length > maxItems && (
          <div className="pt-2 border-t">
            <Button variant="ghost" size="sm" className="w-full text-xs">
              View all {insights.length} insights
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
