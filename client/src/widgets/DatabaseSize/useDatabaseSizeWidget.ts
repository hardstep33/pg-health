import { useWidgetData } from '../../hooks/useWidgetData';
import { getDbSizeAll } from '../../api/postgresApi';
import DatabaseSize from './DatabaseSize';
import React from 'react';

export function useDatabaseSizeWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getDbSizeAll);
    const errorTooltip = error ? `Ошибка получения размера БД:\n${error}` : undefined;
    const component = React.createElement(DatabaseSize, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}