import { useMemo } from "react"
import { useQuery, UseQueryOptions } from "@tanstack/react-query"
import { accountingApi, type TrialBalanceData, type Account, type GeneralLedgerData, type PaginationInfo, type JournalEntry } from "../lib/api/accounting"

// Helper to normalize possibly mixed API shapes
function extractArrayOrObject<T>(value: any, key?: string): T {
	if (key && value && typeof value === "object" && key in value) return value[key]
	return (value as T)
}

// Trial Balance
export function useTrialBalance(params: { asOf: string; companyId?: string; page?: number; pageSize?: number }, options?: UseQueryOptions<TrialBalanceData>) {
	const { asOf, companyId, page, pageSize } = params
	return useQuery<TrialBalanceData>({
		queryKey: ["trial-balance", { asOf, companyId, page, pageSize }],
		queryFn: async () => {
			return await accountingApi.trialBalanceApi.getTrialBalance(asOf, companyId, page, pageSize)
		},
		staleTime: 60_000,
		...options,
	})
}

// Chart of Accounts
export function useAccounts(params: { companyId?: string; includeInactive?: boolean; page?: number; pageSize?: number }, options?: UseQueryOptions<Account[]>) {
	const { companyId, includeInactive, page, pageSize } = params
	return useQuery<Account[]>({
		queryKey: ["accounts", { companyId, includeInactive, page, pageSize }],
		queryFn: async () => {
			const res = await accountingApi.chartOfAccountsApi.getAll(companyId, !!includeInactive, page, pageSize)
			return res.accounts
		},
		staleTime: 60_000,
		...options,
	})
}

// Journal entries (recent)
export function useJournalEntries(params: { companyId?: string; page?: number; pageSize?: number }, options?: UseQueryOptions<{ entries: JournalEntry[]; pagination: PaginationInfo }>) {
	const { companyId, page, pageSize } = params
	return useQuery<{ entries: JournalEntry[]; pagination: PaginationInfo }>({
		queryKey: ["journal-entries", { companyId, page, pageSize }],
		queryFn: async () => {
			return await accountingApi.journalEntriesApi.getAll(companyId, page, pageSize)
		},
		staleTime: 30_000,
		...options,
	})
}

// General Ledger
export function useGeneralLedger(params: { companyId: string; startDate: string; endDate: string; accountId?: string; page?: number; pageSize?: number }, options?: UseQueryOptions<GeneralLedgerData>) {
	const key = useMemo(() => ({
		companyId: params.companyId,
		startDate: params.startDate,
		endDate: params.endDate,
		accountId: params.accountId || undefined,
		page: params.page || 1,
		pageSize: params.pageSize || 10,
	}), [params.companyId, params.startDate, params.endDate, params.accountId, params.page, params.pageSize])

	return useQuery<GeneralLedgerData>({
		queryKey: ["general-ledger", key],
		queryFn: async () => {
			return await accountingApi.generalLedgerApi.getGeneralLedger(key)
		},
		staleTime: 30_000,
		placeholderData: (previousData) => previousData,
		...options,
	})
}

// Journal Hub specific hooks
export function useJournalHubSummary(params: { companyId?: string }, options?: UseQueryOptions<any>) {
	const { companyId } = params
	return useQuery({
		queryKey: ["journal-hub-summary", companyId],
		queryFn: async () => {
			const response = await fetch(`/journal-hub/summary?companyId=${companyId}`)
			if (!response.ok) throw new Error('Failed to fetch journal hub summary')
			return response.json()
		},
		staleTime: 30_000,
		...options,
	})
}

export function useJournalEntryTypes(params: { companyId?: string }, options?: UseQueryOptions<any[]>) {
	const { companyId } = params
	return useQuery({
		queryKey: ["journal-entry-types", companyId],
		queryFn: async () => {
			const response = await fetch(`/journal-hub/entry-types?companyId=${companyId}`)
			if (!response.ok) throw new Error('Failed to fetch journal entry types')
			return response.json()
		},
		staleTime: 60_000,
		...options,
	})
}

export function useJournalTemplates(params: { companyId?: string }, options?: UseQueryOptions<any[]>) {
	const { companyId } = params
	return useQuery({
		queryKey: ["journal-templates", companyId],
		queryFn: async () => {
			const response = await fetch(`/journal-hub/templates?companyId=${companyId}`)
			if (!response.ok) throw new Error('Failed to fetch journal templates')
			return response.json()
		},
		staleTime: 60_000,
		...options,
	})
}

export function usePendingApprovals(params: { companyId?: string }, options?: UseQueryOptions<any[]>) {
	const { companyId } = params
	return useQuery({
		queryKey: ["journal-pending-approvals", companyId],
		queryFn: async () => {
			const response = await fetch(`/journal-hub/approvals/pending?companyId=${companyId}`)
			if (!response.ok) throw new Error('Failed to fetch pending approvals')
			return response.json()
		},
		staleTime: 30_000,
		...options,
	})
}
