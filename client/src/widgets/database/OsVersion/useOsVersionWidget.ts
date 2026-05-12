import { useWidgetData } from '../../../hooks/useWidgetData';
import { getOsVersion } from '../../../api/postgresApi';
import OsVersion from './OsVersion';
import React from 'react';

export function useOsVersionWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getOsVersion);
    const errorTooltip = error ? `Ошибка получения версии ОС:\n${error}` : undefined;
    const component = React.createElement(OsVersion, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}