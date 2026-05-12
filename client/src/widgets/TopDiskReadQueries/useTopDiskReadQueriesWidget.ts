import { useWidgetData } from '../../hooks/useWidgetData';
import { getDbTopDiskReadQuery } from '../../api/postgresApi';
import TopDiskReadQueries from './TopDiskReadQueries';
import React from 'react';

export function useTopDiskReadQueriesWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getDbTopDiskReadQuery);
    const errorTooltip = error ? `Ошибка получения списка тяжёлых запросов:\n${error}` : undefined;
    const component = React.createElement(TopDiskReadQueries, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}