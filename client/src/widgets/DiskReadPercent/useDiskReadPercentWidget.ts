import { useWidgetData } from '../../hooks/useWidgetData';
import { getDiskPercentRead } from '../../api/postgresApi';
import DiskReadPercent from './DiskReadPercent';
import React from 'react';

export function useDiskReadPercentWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getDiskPercentRead);
    const errorTooltip = error ? `Ошибка получения статистики чтения с диска:\n${error}` : undefined;
    const component = React.createElement(DiskReadPercent, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}