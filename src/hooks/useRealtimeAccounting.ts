import { useEffect, useCallback } from 'react'
import { useAccountingStore } from '@/stores/accountingStore'

interface Account {
  id: string
  name: string
  code: string
  accountType: string
  debitBalance: number
  creditBalance: number
}

interface UseRealtimeAccountingProps {
  tenantId: string
  companyId?: string
}

export const useRealtimeAccounting = ({ tenantId, companyId }: UseRealtimeAccountingProps) => {
  const { setAccounts, setAccountsError } = useAccountingStore()

  const handleAccountingUpdate = useCallback((event: MessageEvent) => {
    try {
      const data = JSON.parse(event.data)
      
      switch (data.type) {
        case 'ACCOUNT_UPDATED':
          // Update specific account in store
          break
        case 'JOURNAL_ENTRY_POSTED':
          // Refresh affected accounts
          break
        case 'TRANSACTION_CREATED':
          // Update relevant data
          break
        default:
          break
      }
    } catch (error) {
      console.error('Error processing real-time update:', error)
    }
  }, [setAccounts])

  useEffect(() => {
    if (!tenantId) return

    // Setup WebSocket connection
    const wsUrl = `${process.env.NEXT_PUBLIC_WS_URL}/accounting?tenantId=${tenantId}&companyId=${companyId || ''}`
    const ws = new WebSocket(wsUrl)

    ws.onopen = () => {
      console.log('Connected to accounting real-time updates')
    }

    ws.onmessage = handleAccountingUpdate

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setAccountsError('Connection error')
    }

    ws.onclose = () => {
      console.log('Disconnected from accounting real-time updates')
    }

    return () => {
      ws.close()
    }
  }, [tenantId, companyId, handleAccountingUpdate, setAccountsError])
}

// Optimistic updates hook
export const useOptimisticUpdates = () => {
  const { accounts, setAccounts } = useAccountingStore()

  const optimisticUpdateAccount = useCallback(async (
    accountId: string,
    updates: Partial<Account>,
    apiCall: () => Promise<Account>
  ) => {
    // Apply optimistic update
    const optimisticAccounts = accounts.map((acc: Account) => 
      acc.id === accountId ? { ...acc, ...updates } : acc
    )
    setAccounts(optimisticAccounts)

    try {
      // Make API call
      const updatedAccount = await apiCall()
      
      // Apply real update
      const realAccounts = accounts.map((acc: Account) => 
        acc.id === accountId ? updatedAccount : acc
      )
      setAccounts(realAccounts)
    } catch (error) {
      // Revert optimistic update
      setAccounts(accounts)
      throw error
    }
  }, [accounts, setAccounts])

  return { optimisticUpdateAccount }
}
