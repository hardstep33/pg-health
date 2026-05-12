import { useWidgetData } from '../../../hooks/useWidgetData';
import { getQPS } from '../../../api/postgresApi';
import QpsWidget from './QpsWidget';
import React from 'react';

export function useQpsWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getQPS);
    const errorTooltip = error ? `Ошибка получения QPS:\n${error}` : undefined;
    const component = React.createElement(QpsWidget, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}