import { useState, useEffect } from 'react';
import { getCompanyId, getTenantId, getApiUrl } from '../lib/config';

export interface AIInsight {
  id: string;
  tenantId: string;
  companyId: string;
  category: string;
  insightText: string;
  generatedAt: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ParsedInsight {
  id: string;
  category: string;
  priority: 'high' | 'medium' | 'low';
  type: string;
  description: string;
  confidence: number;
  impact: string;
  generatedAt: string;
}

export function useAIInsightsList() {
  const [insights, setInsights] = useState<ParsedInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const parseInsightText = (insightText: string): Partial<ParsedInsight> => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(insightText);
      return {
        type: parsed.type || 'general',
        description: parsed.description || insightText,
        confidence: parsed.confidence || 0.7,
        impact: parsed.impact || 'medium'
      };
    } catch {
      // If not JSON, return the raw text
      return {
        type: 'general',
        description: insightText,
        confidence: 0.7,
        impact: 'medium'
      };
    }
  };

  const fetchInsights = async () => {
    const companyId = getCompanyId();
    if (!companyId) {
      setError('Company ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(
        `${getApiUrl()}/api/ai/insights?companyId=${companyId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'x-tenant-id': getTenantId(),
            'x-company-id': companyId,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const rawInsights: AIInsight[] = await response.json();
      
      // Parse and filter insights
      const parsedInsights: ParsedInsight[] = rawInsights
        .map(insight => {
          const parsed = parseInsightText(insight.insightText);
          return {
            id: insight.id,
            category: insight.category,
            priority: insight.priority,
            generatedAt: insight.generatedAt,
            type: parsed.type || 'general',
            description: parsed.description || insight.insightText,
            confidence: parsed.confidence || 0.7,
            impact: parsed.impact || 'medium'
          };
        })
        .filter(insight => insight.description && insight.description.length > 10) // Filter out malformed insights
        .sort((a, b) => {
          // Sort by priority (high first) then by date (newest first)
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
            return priorityOrder[b.priority] - priorityOrder[a.priority];
          }
          return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
        })
        .slice(0, 10); // Limit to top 10 insights

      setInsights(parsedInsights);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI insights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  return {
    insights,
    loading,
    error,
    refetch: fetchInsights
  };
}
