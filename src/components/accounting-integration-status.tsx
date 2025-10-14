import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react';
import { apiService } from '../lib/api';

interface AccountingIntegrationStatusProps {
  invoiceId: string;
  invoiceNumber: string;
}

interface AccountingData {
  journalEntries: any[];
  inventoryMovements: any[];
}

export function AccountingIntegrationStatus({ invoiceId, invoiceNumber }: AccountingIntegrationStatusProps) {
  const [accountingData, setAccountingData] = useState<AccountingData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAccountingData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [journalEntries, inventoryMovements] = await Promise.all([
        apiService.getInvoiceAccountingEntries(invoiceId),
        apiService.getInvoiceInventoryMovements(invoiceId)
      ]);

      setAccountingData({
        journalEntries,
        inventoryMovements
      });
    } catch (err: any) {
      setError(err.message || 'Failed to fetch accounting data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountingData();
  }, [invoiceId]);

  const hasAccountingData = accountingData && (
    accountingData.journalEntries.length > 0 || 
    accountingData.inventoryMovements.length > 0
  );

  const getStatusIcon = () => {
    if (loading) return <RefreshCw className="w-4 h-4 animate-spin" />;
    if (error) return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (hasAccountingData) return <CheckCircle className="w-4 h-4 text-green-500" />;
    return <Clock className="w-4 h-4 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (loading) return 'Loading...';
    if (error) return 'Error loading data';
    if (hasAccountingData) return 'Accounting integrated';
    return 'No accounting data';
  };

  const getStatusVariant = () => {
    if (loading) return 'secondary';
    if (error) return 'destructive';
    if (hasAccountingData) return 'default';
    return 'secondary';
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Accounting Integration</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchAccountingData}
            disabled={loading}
            className="h-6 w-6 p-0"
          >
            <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant={getStatusVariant() as any}>
              {getStatusText()}
            </Badge>
          </div>

          {accountingData && (
            <div className="space-y-2 text-xs text-muted-foreground">
              {accountingData.journalEntries.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>{accountingData.journalEntries.length} journal entries created</span>
                </div>
              )}
              
              {accountingData.inventoryMovements.length > 0 && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3 h-3 text-green-500" />
                  <span>{accountingData.inventoryMovements.length} inventory movements recorded</span>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="text-xs text-red-500">
              {error?.message || error?.toString() || 'Unknown error'}
            </div>
          )}

          {!hasAccountingData && !loading && !error && (
            <div className="text-xs text-muted-foreground">
              Mark invoice as paid to create accounting entries
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
