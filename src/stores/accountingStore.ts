import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

interface Account {
  id: string
  name: string
  code: string
  accountType: string
  debitBalance: number
  creditBalance: number
}

interface AccountingState {
  // Chart of Accounts
  accounts: Account[]
  accountsLoading: boolean
  accountsError: string | null
  
  // Selected company
  selectedCompanyId: string | null
  
  // Current period
  currentPeriod: {
    startDate: string
    endDate: string
  }
  
  // Actions
  setAccounts: (accounts: Account[]) => void
  setAccountsLoading: (loading: boolean) => void
  setAccountsError: (error: string | null) => void
  setSelectedCompany: (companyId: string) => void
  setCurrentPeriod: (period: { startDate: string; endDate: string }) => void
  
  // Computed values
  getAccountsByType: (type: string) => Account[]
  getTotalAssets: () => number
  getTotalLiabilities: () => number
}

export const useAccountingStore = create<AccountingState>()(
  devtools(
    (set, get) => ({
      // Initial state
      accounts: [],
      accountsLoading: false,
      accountsError: null,
      selectedCompanyId: null,
      currentPeriod: {
        startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
      },
      
      // Actions
      setAccounts: (accounts: Account[]) => set({ accounts }),
      setAccountsLoading: (accountsLoading: boolean) => set({ accountsLoading }),
      setAccountsError: (accountsError: string | null) => set({ accountsError }),
      setSelectedCompany: (selectedCompanyId: string) => set({ selectedCompanyId }),
      setCurrentPeriod: (currentPeriod: { startDate: string; endDate: string }) => set({ currentPeriod }),
      
      // Computed values
      getAccountsByType: (type: string) => {
        const { accounts } = get()
        return accounts.filter((account: Account) => account.accountType === type)
      },
      
      getTotalAssets: () => {
        const { accounts } = get()
        return accounts
          .filter((account: Account) => account.accountType === 'Asset')
          .reduce((total: number, account: Account) => total + account.debitBalance - account.creditBalance, 0)
      },
      
      getTotalLiabilities: () => {
        const { accounts } = get()
        return accounts
          .filter((account: Account) => account.accountType === 'Liability')
          .reduce((total: number, account: Account) => total + account.creditBalance - account.debitBalance, 0)
      }
    }),
    { name: 'accounting-store' }
  )
)
