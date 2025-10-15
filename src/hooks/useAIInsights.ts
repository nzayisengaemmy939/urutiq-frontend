import { useState, useEffect } from 'react';
import { getCompanyId, getTenantId } from '../lib/config';

export interface HealthScore {
  score: number;
  paymentRate: number;
  profitMargin: number;
  revenueGrowth: number;
  overduePercentage: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
}

export interface AIMetrics {
  predictionAccuracy: number;
  anomaliesDetected: number;
  activeRecommendations: number;
  goalsOnTrack: string;
  transactionsAnalyzed: number;
}

export interface RevenuePrediction {
  amount: number;
  confidence: number;
  change?: number;
}

export interface RevenuePredictions {
  nextMonth: RevenuePrediction;
  nextQuarter: RevenuePrediction;
  nextYear: RevenuePrediction;
  seasonalTrends: {
    peakSeason: string;
    lowSeason: string;
    peakIncrease: number;
    lowDecrease: number;
  };
}

export interface CashFlowPrediction {
  currentPosition: number;
  expectedInflows: number;
  expectedOutflows: number;
  netCashFlow: number;
  status: string;
}

export interface Anomaly {
  id: string;
  type: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  date: string;
  amount: string;
  suggestion: string;
  confidence: number;
}

export interface Recommendation {
  category: string;
  title: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  effort: 'High' | 'Medium' | 'Low';
  savings: string;
}

export interface TaxStrategy {
  strategy: string;
  description: string;
  impact: 'High' | 'Medium' | 'Low';
  savings: number;
  deadline: string;
}

export interface TaxOptimization {
  currentTaxRate: number;
  potentialSavings: number;
  strategies: TaxStrategy[];
}

export interface PerformanceInsights {
  profitMargin: number;
  customerAcquisitionCost: string;
  averageCollectionPeriod: string;
  inventoryTurnover: string;
  industryGrowthRate: number;
  yourGrowthRate: number;
  competitivePosition: string;
}

export interface AIInsightsData {
  healthScore: HealthScore;
  aiMetrics: AIMetrics;
  revenuePredictions: RevenuePredictions;
  cashFlowPredictions: CashFlowPrediction;
  anomalies: Anomaly[];
  recommendations: Recommendation[];
  taxOptimization: TaxOptimization;
  performanceInsights: PerformanceInsights;
  generatedAt: string;
}

export function useAIInsights() {
  const [data, setData] = useState<AIInsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
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
        `${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/ai-insights/dashboard?companyId=${companyId}`,
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

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch AI insights data');
    } finally {
      setLoading(false);
    }
  };

  const generateInsights = async (insightType: string) => {
    const companyId = getCompanyId();
    if (!companyId) {
      throw new Error('Company ID is required');
    }

    const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    const response = await fetch(
      `${import.meta.env.VITE_API_URL || 'https://urutiq-backend-clean-af6v.onrender.com'}/api/ai/insights/generate`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'x-tenant-id': getTenantId(),
          'x-company-id': companyId,
        },
        body: JSON.stringify({
          companyId,
          insightType
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    generateInsights
  };
}
