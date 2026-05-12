import { useState, useEffect, useCallback } from 'react';

export interface WidgetInfo {
    id: string;
    title: string;
    tooltip?: string;
    component: React.ReactNode;
    onReload?: () => void;
    isLoading?: boolean;
    fullWidth?: boolean;
}

interface LayoutStorage {
    order: string[];
    sizes: Record<string, { width: number; height: number }>;
}

const DEFAULT_ORDER: Record<string, string[]> = {
    'dashboard-db-state': [
        'os-version',
        'db-version',
        'ram-size',
        'cpu-size',
        'database-size',
        'qps-widget',
        'connection-stats',
        'dead-tuples',
        'disk-io-wait',
        'top-disk-read-queries',
        'tables-count',
        'top10-tables',
        'disk-read-percent',
        'database-io',
    ],
    'dashboard-postgres-params': [
        'params-ram-size',
        'params-cpu-size',
        'params-db-size',
        'params-comparison',
        'params-reference',
    ],
    'dashboard-locks-transactions': [
        'active-locks',
        'long-running-queries',
        'idle-in-transaction',
    ],
    'dashboard-indexes': [
        'index-stats',
        'invalid-indexes',
    ],
};

function loadLayout(storageKey: string): LayoutStorage {
    try {
        const raw = localStorage.getItem(storageKey);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.order && Array.isArray(parsed.order)) {
                return {
                    order: parsed.order,
                    sizes: parsed.sizes || {},
                };
            }
        }
    } catch (e) {
        console.warn('Failed to parse dashboard layout from localStorage', e);
    }
    return { order: DEFAULT_ORDER[storageKey] || [], sizes: {} };
}

function saveLayout(storageKey: string, layout: LayoutStorage) {
    localStorage.setItem(storageKey, JSON.stringify(layout));
}

export function useDashboardLayout(storageKey: string, widgets: WidgetInfo[]) {
    const [order, setOrder] = useState<string[]>(() => {
        const saved = loadLayout(storageKey).order;
        const knownIds = widgets.map(w => w.id);
        const filtered = saved.filter(id => knownIds.includes(id));
        const missing = knownIds.filter(id => !filtered.includes(id));
        return [...filtered, ...missing];
    });

    const [sizes, setSizes] = useState<Record<string, { width: number; height: number }>>(
        () => loadLayout(storageKey).sizes
    );

    useEffect(() => {
        saveLayout(storageKey, { order, sizes });
    }, [storageKey, order, sizes]);

    const moveWidget = useCallback((dragId: string, hoverId: string) => {
        setOrder(prev => {
            const dragIndex = prev.indexOf(dragId);
            const hoverIndex = prev.indexOf(hoverId);
            if (dragIndex === -1 || hoverIndex === -1) return prev;
            const newOrder = [...prev];
            newOrder.splice(dragIndex, 1);
            newOrder.splice(hoverIndex, 0, dragId);
            return newOrder;
        });
    }, []);

    const updateWidgetSize = useCallback((id: string, width: number, height: number) => {
        setSizes(prev => ({ ...prev, [id]: { width, height } }));
    }, []);

    return {
        order,
        sizes,
        moveWidget,
        updateWidgetSize,
    };
}