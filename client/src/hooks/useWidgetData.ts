import { useState, useEffect, useCallback, useRef } from 'react';

export function useWidgetData<T>(fetchFn: () => Promise<T>) {
    const [data, setData] = useState<T | null>(null);
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const mountedRef = useRef(true);

    const reload = useCallback(async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await fetchFn();
            if (mountedRef.current) {
                setData(result);
            }
        } catch (err: any) {
            if (mountedRef.current) {
                setError(err.message || String(err));
            }
        } finally {
            if (mountedRef.current) {
                setIsLoading(false);
            }
        }
    }, [fetchFn]);

    useEffect(() => {
        mountedRef.current = true;
        reload();
        return () => {
            mountedRef.current = false;
        };
    }, [reload]);

    return { data, error, isLoading, reload };
}