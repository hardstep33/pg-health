import { useWidgetData } from '../../hooks/useWidgetData';
import { getTablesCount } from '../../api/postgresApi';
import TablesCount from './TablesCount';
import React from 'react';

export function useTablesCountWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getTablesCount);
    const errorTooltip = error ? `Ошибка получения количества таблиц:\n${error}` : undefined;
    const component = React.createElement(TablesCount, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}