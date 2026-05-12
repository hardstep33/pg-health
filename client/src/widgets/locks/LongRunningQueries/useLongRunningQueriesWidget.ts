import { useWidgetData } from '../../../hooks/useWidgetData';
import { getLongRunningQueries } from '../../../api/postgresApi';
import LongRunningQueries from './LongRunningQueries';
import React, { useCallback } from 'react';

export function useLongRunningQueriesWidget() {
    const fetchFn = useCallback(() => getLongRunningQueries(30), []);
    const { data, error, isLoading, reload } = useWidgetData(fetchFn);
    const errorTooltip = error ? `Ошибка получения длительных запросов:\n${error}` : undefined;
    const component = React.createElement(LongRunningQueries, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}