import { useWidgetData } from '../../../hooks/useWidgetData';
import { getDbDeadTuples } from '../../../api/postgresApi';
import DeadTuples from './DeadTuples';
import React from 'react';

export function useDeadTuplesWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getDbDeadTuples);
    const errorTooltip = error ? `Ошибка получения статистики по мёртвым кортежам:\n${error}` : undefined;
    const component = React.createElement(DeadTuples, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}