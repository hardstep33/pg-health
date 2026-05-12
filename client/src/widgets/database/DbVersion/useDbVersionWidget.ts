import { useWidgetData } from '../../../hooks/useWidgetData';
import { getDbVersion } from '../../../api/postgresApi';
import DbVersion from './DBVersion';
import React from 'react';

export function useDbVersionWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getDbVersion);
    const errorTooltip = error ? `Ошибка получения версии PostgreSQL:\n${error}` : undefined;
    const component = React.createElement(DbVersion, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}