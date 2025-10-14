import { NextResponse } from 'next/server';

// Aggregated accounting overview endpoint (placeholder values)
// Replace with real backend aggregation (call internal API services) later.
export async function GET() {
  // Simulated latency
  await new Promise(r => setTimeout(r, 120));
  return NextResponse.json({
    metrics: {
      assets: 89450,
      netIncome: 12340,
      journalEntries: 156,
      balanceOk: true
    },
    health: [
      { label: 'Account Reconciliation', value: 100, status: 'ok', description: 'All accounts are reconciled and balanced' },
      { label: 'Journal Entries', value: 95, status: 'ok', description: '156 entries posted, 8 pending review' },
      { label: 'Trial Balance', value: 100, status: 'ok', description: 'Total debits equal total credits' },
      { label: 'Financial Reports', value: 75, status: 'due', description: 'Monthly reports due in 5 days' }
    ],
    summary: { revenue: 45230, expenses: 32890, profit: 12340, netIncome: 12340 },
    activity: [
      { id: '1', icon: 'approved', title: 'Journal Entry Approved', detail: 'Entry #JE-2024-0045 - Office supplies purchase', minutesAgo: 2 },
      { id: '2', icon: 'reconciliation', title: 'Bank Reconciliation', detail: 'Chase Business Account - March 2024', minutesAgo: 60 },
      { id: '3', icon: 'review', title: 'Review Required', detail: 'Expense account variance detected', minutesAgo: 180 },
      { id: '4', icon: 'report', title: 'Report Generated', detail: 'P&L Statement for Q1 2024', minutesAgo: 1440 }
    ],
    tasks: [
      { label: 'Review journal entries', count: 8, variant: 'secondary' },
      { label: 'Bank reconciliations', count: 2, variant: 'secondary' },
      { label: 'Month-end closing', count: 1, variant: 'destructive' },
      { label: 'Audit preparation', count: 3, variant: 'outline' }
    ],
    generatedAt: new Date().toISOString()
  });
}
