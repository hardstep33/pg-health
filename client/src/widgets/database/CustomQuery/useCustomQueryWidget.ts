import { useState } from 'react';
import { executeCustomQuery } from '../../../api/postgresApi';
import CustomQuery from './CustomQuery';
import React from 'react';

export function useCustomQueryWidget() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>('');

    const onExecute = async (query: string) => {
        setIsLoading(true);
        setError('');
        try {
            const response = await executeCustomQuery(query);
            if (response.error) {
                setError(response.error);
                return { error: response.error };
            }
            return response;
        } catch (err: any) {
            const msg = err.message || 'Ошибка выполнения запроса';
            setError(msg);
            return { error: msg };
        } finally {
            setIsLoading(false);
        }
    };

    const reload = () => {}; // не используется

    const component = React.createElement(CustomQuery, { onExecute, error, isLoading });
    return { component, reload, isLoading, error };
}