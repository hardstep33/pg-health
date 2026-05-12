import { useWidgetData } from '../../hooks/useWidgetData';
import { getDBIOInfo } from '../../api/postgresApi';
import DatabaseIO from './DatabaseIO';
import React from 'react';

export function useDatabaseIOWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getDBIOInfo);
    const errorTooltip = error ? `Ошибка получения общей статистики IO:\n${error}` : undefined;
    const component = React.createElement(DatabaseIO, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}