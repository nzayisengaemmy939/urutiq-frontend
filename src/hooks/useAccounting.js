import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { accountingApi } from "../lib/api/accounting";
// Helper to normalize possibly mixed API shapes
function extractArrayOrObject(value, key) {
    if (key && value && typeof value === "object" && key in value)
        return value[key];
    return value;
}
// Trial Balance
export function useTrialBalance(params, options) {
    const { asOf, companyId, page, pageSize } = params;
    return useQuery({
        queryKey: ["trial-balance", { asOf, companyId, page, pageSize }],
        queryFn: async () => {
            return await accountingApi.trialBalanceApi.getTrialBalance(asOf, companyId, page, pageSize);
        },
        staleTime: 60000,
        ...options,
    });
}
// Chart of Accounts
export function useAccounts(params, options) {
    const { companyId, includeInactive, page, pageSize } = params;
    return useQuery({
        queryKey: ["accounts", { companyId, includeInactive, page, pageSize }],
        queryFn: async () => {
            const res = await accountingApi.chartOfAccountsApi.getAll(companyId, !!includeInactive, page, pageSize);
            return res.accounts;
        },
        staleTime: 60000,
        ...options,
    });
}
// Journal entries (recent)
export function useJournalEntries(params, options) {
    const { companyId, page, pageSize } = params;
    return useQuery({
        queryKey: ["journal-entries", { companyId, page, pageSize }],
        queryFn: async () => {
            return await accountingApi.journalEntriesApi.getAll(companyId, page, pageSize);
        },
        staleTime: 30000,
        ...options,
    });
}
// General Ledger
export function useGeneralLedger(params, options) {
    const key = useMemo(() => ({
        companyId: params.companyId,
        startDate: params.startDate,
        endDate: params.endDate,
        accountId: params.accountId || undefined,
        page: params.page || 1,
        pageSize: params.pageSize || 10,
    }), [params.companyId, params.startDate, params.endDate, params.accountId, params.page, params.pageSize]);
    return useQuery({
        queryKey: ["general-ledger", key],
        queryFn: async () => {
            return await accountingApi.generalLedgerApi.getGeneralLedger(key);
        },
        staleTime: 30000,
        placeholderData: (previousData) => previousData,
        ...options,
    });
}
// Journal Hub specific hooks
export function useJournalHubSummary(params, options) {
    const { companyId } = params;
    return useQuery({
        queryKey: ["journal-hub-summary", companyId],
        queryFn: async () => {
            const response = await fetch(`/journal-hub/summary?companyId=${companyId}`);
            if (!response.ok)
                throw new Error('Failed to fetch journal hub summary');
            return response.json();
        },
        staleTime: 30000,
        ...options,
    });
}
export function useJournalEntryTypes(params, options) {
    const { companyId } = params;
    return useQuery({
        queryKey: ["journal-entry-types", companyId],
        queryFn: async () => {
            const response = await fetch(`/journal-hub/entry-types?companyId=${companyId}`);
            if (!response.ok)
                throw new Error('Failed to fetch journal entry types');
            return response.json();
        },
        staleTime: 60000,
        ...options,
    });
}
export function useJournalTemplates(params, options) {
    const { companyId } = params;
    return useQuery({
        queryKey: ["journal-templates", companyId],
        queryFn: async () => {
            const response = await fetch(`/journal-hub/templates?companyId=${companyId}`);
            if (!response.ok)
                throw new Error('Failed to fetch journal templates');
            return response.json();
        },
        staleTime: 60000,
        ...options,
    });
}
export function usePendingApprovals(params, options) {
    const { companyId } = params;
    return useQuery({
        queryKey: ["journal-pending-approvals", companyId],
        queryFn: async () => {
            const response = await fetch(`/journal-hub/approvals/pending?companyId=${companyId}`);
            if (!response.ok)
                throw new Error('Failed to fetch pending approvals');
            return response.json();
        },
        staleTime: 30000,
        ...options,
    });
}
