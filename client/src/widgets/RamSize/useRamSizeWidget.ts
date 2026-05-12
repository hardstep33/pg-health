import { useWidgetData } from '../../hooks/useWidgetData';
import { getRamSize } from '../../api/postgresApi';
import RamSize from './RamSize';
import React from 'react';

export function useRamSizeWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getRamSize);
    const errorTooltip = error ? `Ошибка получения объёма RAM:\n${error}` : undefined;
    const component = React.createElement(RamSize, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}