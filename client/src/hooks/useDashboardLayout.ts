import { useState, useEffect, useCallback } from 'react';

export interface WidgetInfo {
    id: string;
    title: string;
    tooltip?: string;
    component: React.ReactNode;
    onReload?: () => void;
    isLoading?: boolean;
    fullWidth?: boolean;
    order?: number;
}

interface LayoutStorage {
    order: string[];
    sizes: Record<string, { width: number; height: number }>;
}

function getDefaultOrder(widgets: WidgetInfo[]): string[] {
    return [...widgets]
        .map((w, i) => ({ id: w.id, order: w.order ?? i }))
        .sort((a, b) => a.order - b.order)
        .map(w => w.id);
}

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
    return { order: [], sizes: {} };
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
        const defaultOrder = getDefaultOrder(widgets);
        const sortedMissing = defaultOrder.filter(id => missing.includes(id));
        return [...filtered, ...sortedMissing];
    });

    const [sizes, setSizes] = useState<Record<string, { width: number; height: number }>>(
        () => loadLayout(storageKey).sizes
    );

    useEffect(() => {
        saveLayout(storageKey, { order, sizes });
    }, [storageKey, order, sizes]);

    const moveWidget = useCallback((dragId: string, targetId: string, position: 'before' | 'after' = 'before') => {
        setOrder(prev => {
            if (prev.indexOf(dragId) === -1 || prev.indexOf(targetId) === -1) return prev;
            const next = [...prev];
            next.splice(next.indexOf(dragId), 1);
            const insertAt = position === 'before' ? next.indexOf(targetId) : next.indexOf(targetId) + 1;
            next.splice(insertAt, 0, dragId);
            return next;
        });
    }, []);

    const moveUp = useCallback((id: string) => {
        setOrder(prev => {
            const idx = prev.indexOf(id);
            if (idx <= 0) return prev;
            const next = [...prev];
            [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
            return next;
        });
    }, []);

    const moveDown = useCallback((id: string) => {
        setOrder(prev => {
            const idx = prev.indexOf(id);
            if (idx === -1 || idx >= prev.length - 1) return prev;
            const next = [...prev];
            [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
            return next;
        });
    }, []);

    const updateWidgetSize = useCallback((id: string, width: number, height: number) => {
        setSizes(prev => ({ ...prev, [id]: { width, height } }));
    }, []);

    return {
        order,
        sizes,
        moveWidget,
        moveUp,
        moveDown,
        updateWidgetSize,
    };
}