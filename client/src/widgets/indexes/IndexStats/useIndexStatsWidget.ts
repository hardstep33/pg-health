import { useWidgetData } from '../../../hooks/useWidgetData';
import { getIndexStats } from '../../../api/postgresApi';
import IndexStats from './IndexStats';
import React from 'react';

export function useIndexStatsWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getIndexStats);
    const errorTooltip = error ? `Ошибка получения статистики индексов:\n${error}` : undefined;
    const component = React.createElement(IndexStats, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}