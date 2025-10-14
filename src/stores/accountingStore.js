import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
export const useAccountingStore = create()(devtools((set, get) => ({
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
    setAccounts: (accounts) => set({ accounts }),
    setAccountsLoading: (accountsLoading) => set({ accountsLoading }),
    setAccountsError: (accountsError) => set({ accountsError }),
    setSelectedCompany: (selectedCompanyId) => set({ selectedCompanyId }),
    setCurrentPeriod: (currentPeriod) => set({ currentPeriod }),
    // Computed values
    getAccountsByType: (type) => {
        const { accounts } = get();
        return accounts.filter((account) => account.accountType === type);
    },
    getTotalAssets: () => {
        const { accounts } = get();
        return accounts
            .filter((account) => account.accountType === 'Asset')
            .reduce((total, account) => total + account.debitBalance - account.creditBalance, 0);
    },
    getTotalLiabilities: () => {
        const { accounts } = get();
        return accounts
            .filter((account) => account.accountType === 'Liability')
            .reduce((total, account) => total + account.creditBalance - account.debitBalance, 0);
    }
}), { name: 'accounting-store' }));
