import { useWidgetData } from '../../../hooks/useWidgetData';
import { getActiveLocks } from '../../../api/postgresApi';
import ActiveLocks from './ActiveLocks';
import React from 'react';

export function useActiveLocksWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getActiveLocks);
    const errorTooltip = error ? `Ошибка получения блокировок:\n${error}` : undefined;
    const component = React.createElement(ActiveLocks, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}