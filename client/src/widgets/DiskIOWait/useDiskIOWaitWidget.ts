import { useWidgetData } from '../../hooks/useWidgetData';
import { getOsDiskIOWait } from '../../api/postgresApi';
import DiskIOWait from './DiskIOWait';
import React from 'react';

export function useDiskIOWaitWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getOsDiskIOWait);
    const errorTooltip = error ? `Ошибка получения очереди ожидания IO:\n${error}` : undefined;
    const component = React.createElement(DiskIOWait, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}