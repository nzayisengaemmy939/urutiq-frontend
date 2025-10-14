import { useMemo } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
export const useVirtualizedTable = ({ data, containerRef, estimateSize = 50 }) => {
    const virtualizer = useVirtualizer({
        count: data.length,
        getScrollElement: () => containerRef.current,
        estimateSize: () => estimateSize,
        overscan: 10
    });
    const virtualItems = virtualizer.getVirtualItems();
    return {
        virtualizer,
        virtualItems,
        totalSize: virtualizer.getTotalSize()
    };
};
// Memoized currency formatter
export const useCurrencyFormatter = (currency = 'USD', locale = 'en-US') => {
    return useMemo(() => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency
        });
    }, [currency, locale]);
};
// Optimized account tree builder
export const useAccountTree = (accounts) => {
    return useMemo(() => {
        const accountMap = new Map(accounts.map(acc => [acc.id, { ...acc, children: [] }]));
        const rootAccounts = [];
        accounts.forEach(account => {
            const accountNode = accountMap.get(account.id);
            if (account.parentId && accountMap.has(account.parentId)) {
                accountMap.get(account.parentId).children.push(accountNode);
            }
            else {
                rootAccounts.push(accountNode);
            }
        });
        return rootAccounts;
    }, [accounts]);
};
