import { useWidgetData } from '../../../hooks/useWidgetData';
import { getDbInvalidIndexes } from '../../../api/postgresApi';
import InvalidIndexes from './InvalidIndexes';
import React from 'react';

export function useInvalidIndexesWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getDbInvalidIndexes);
    const errorTooltip = error ? `Ошибка получения списка недействительных индексов:\n${error}` : undefined;
    const component = React.createElement(InvalidIndexes, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}