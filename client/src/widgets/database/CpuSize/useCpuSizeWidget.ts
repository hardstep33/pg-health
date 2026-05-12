import { useWidgetData } from '../../../hooks/useWidgetData';
import { getCpuSize } from '../../../api/postgresApi';
import CpuSize from './CpuSize';
import React from 'react';

export function useCpuSizeWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getCpuSize);
    const errorTooltip = error ? `Ошибка получения количества CPU:\n${error}` : undefined;
    const component = React.createElement(CpuSize, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}