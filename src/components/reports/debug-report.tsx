;

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { apiClient } from '@/lib/api-client';

export function DebugReport() {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testAPI = async () => {
    setLoading(true);
    try {
      console.log('Testing API connection...');
      
      // Test the health endpoint first
      const healthData = await apiClient.get('/health');
      console.log('Health check:', healthData);

      // Test the accounting reports test endpoint
      const testData = await apiClient.get('/api/accounting-reports/test');
      console.log('Test endpoint response:', testData);

      // Test the accounting reports endpoint
      const data = await apiClient.get('/api/accounting-reports/trial-balance', {
        startDate: '2024-01-01',
        endDate: '2024-12-31'
      });

      console.log('API Response:', data);
      setDebugInfo({
        error: false,
        health: healthData,
        test: testData,
        trialBalance: data
      });
    } catch (error) {
      console.error('Fetch error:', error);
      setDebugInfo({
        error: true,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Debug Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={testAPI} disabled={loading}>
          {loading ? 'Testing...' : 'Test API Connection'}
        </Button>
        
        {debugInfo && (
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Debug Information:</h3>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugInfo, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
