import { useState, useMemo } from 'react';

export interface SortConfig {
    key: string | null;
    direction: 'asc' | 'desc' | 'none';
}

export function useSort<T>(data: T[]) {
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        key: null,
        direction: 'none',
    });

    const sortedData = useMemo(() => {
        if (!data || data.length === 0) return data;
        if (sortConfig.key === null || sortConfig.direction === 'none') return data;

        const sorted = [...data].sort((a: any, b: any) => {
            const aVal = a[sortConfig.key!];
            const bVal = b[sortConfig.key!];

            // null/undefined — в конец
            if (aVal == null && bVal == null) return 0;
            if (aVal == null) return 1;
            if (bVal == null) return -1;

            // Пробуем сравнить как числа
            const aNum = typeof aVal === 'number' ? aVal : parseFloat(String(aVal).replace(/[^\d.-]/g, ''));
            const bNum = typeof bVal === 'number' ? bVal : parseFloat(String(bVal).replace(/[^\d.-]/g, ''));

            if (!isNaN(aNum) && !isNaN(bNum)) {
                return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
            }

            // Строки
            const aStr = String(aVal).toLowerCase();
            const bStr = String(bVal).toLowerCase();
            if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
        return sorted;
    }, [data, sortConfig]);

    const requestSort = (key: string) => {
        setSortConfig(prev => {
            if (prev.key === key) {
                if (prev.direction === 'asc') return { key, direction: 'desc' };
                if (prev.direction === 'desc') return { key: null, direction: 'none' };
                return { key, direction: 'asc' };
            }
            return { key, direction: 'asc' };
        });
    };

    const getSortIndicator = (key: string): string => {
        if (sortConfig.key !== key) return '';
        if (sortConfig.direction === 'asc') return ' ▲';
        if (sortConfig.direction === 'desc') return ' ▼';
        return '';
    };

    return { sortedData, sortConfig, requestSort, getSortIndicator };
}