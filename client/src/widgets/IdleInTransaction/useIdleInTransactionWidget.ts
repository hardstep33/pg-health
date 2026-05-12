import { useWidgetData } from '../../hooks/useWidgetData';
import { getIdleInTransaction } from '../../api/postgresApi';
import IdleInTransaction from './IdleInTransaction';
import React from 'react';

export function useIdleInTransactionWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getIdleInTransaction);
    const errorTooltip = error ? `Ошибка получения idle транзакций:\n${error}` : undefined;
    const component = React.createElement(IdleInTransaction, { data, error, errorTooltip });
    return { component, reload, isLoading, error, errorTooltip };
}