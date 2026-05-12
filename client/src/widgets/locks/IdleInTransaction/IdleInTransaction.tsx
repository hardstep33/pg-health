import React from 'react';
import { useSort } from '../../../hooks/useSort';

interface IdleRow {
    pid: number;
    state: string;
    wait_event_type: string | null;
    wait_event: string | null;
    query: string;
    query_start: string | null;
    xact_start: string;
    idle_duration_sec: number;
    application_name: string;
}

interface IdleInTransactionProps {
    data: IdleRow[] | null;
    error: string;
    errorTooltip?: string;
}

const IdleInTransaction: React.FC<IdleInTransactionProps> = ({ data, error, errorTooltip }) => {
    const { sortedData, requestSort, getSortIndicator } = useSort(data || []);

    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    if (!data || data.length === 0) return <p>Нет транзакций в состоянии idle in transaction</p>;

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                <tr>
                    <th className="sortable" onClick={() => requestSort('pid')}>PID{getSortIndicator('pid')}</th>
                    <th className="sortable" onClick={() => requestSort('idle_duration_sec')}>Idle (сек){getSortIndicator('idle_duration_sec')}</th>
                    <th className="sortable" onClick={() => requestSort('query')}>Запрос{getSortIndicator('query')}</th>
                    <th className="sortable" onClick={() => requestSort('xact_start')}>Начало транзакции{getSortIndicator('xact_start')}</th>
                    <th className="sortable" onClick={() => requestSort('query_start')}>Последний запрос{getSortIndicator('query_start')}</th>
                    <th className="sortable" onClick={() => requestSort('application_name')}>Пользователь{getSortIndicator('query_start')}</th>
                </tr>
                </thead>
                <tbody>
                {sortedData.map((row, idx) => (
                    <tr key={`${row.pid}-${idx}`} className={row.idle_duration_sec > 600 ? 'row-warning' : ''}>
                        <td>{row.pid}</td>
                        <td>{row.idle_duration_sec}</td>
                        <td>{row.query}</td>
                        <td>{new Date(row.xact_start).toLocaleString('ru-RU')}</td>
                        <td>{row.query_start ? new Date(row.query_start).toLocaleString('ru-RU') : '—'}</td>
                        <td>{row.application_name}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default IdleInTransaction;