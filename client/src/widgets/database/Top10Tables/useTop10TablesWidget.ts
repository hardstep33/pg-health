import { useWidgetData } from '../../../hooks/useWidgetData';
import { getDbTop10Tables } from '../../../api/postgresApi';
import Top10Tables from './Top10Tables';
import React from 'react';

export function useTop10TablesWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getDbTop10Tables);
    const errorTooltip = error ? `Ошибка получения списка топ-10 таблиц:\n${error}` : undefined;
    const component = React.createElement(Top10Tables, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}