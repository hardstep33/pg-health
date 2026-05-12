import { useWidgetData } from '../../../hooks/useWidgetData';
import { getConnectionStats } from '../../../api/postgresApi';
import ConnectionStats from './ConnectionStats';
import React from 'react';

export function useConnectionStatsWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getConnectionStats);
    const errorTooltip = error ? `Ошибка получения статистики подключений:\n${error}` : undefined;
    const component = React.createElement(ConnectionStats, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}