import React from 'react';
import { useSort } from '../../hooks/useSort';

interface LockRow {
    pid: number;
    locktype: string;
    mode: string;
    granted: boolean;
    relation: string | null;
    page: number | null;
    tuple: number | null;
    transactionid: string | null;
    state: string | null;
    query: string | null;
    query_start: string | null;
    wait_event_type: string | null;
    wait_event: string | null;
}

interface ActiveLocksProps {
    data: LockRow[] | null;
    error: string;
    errorTooltip?: string;
}

const ActiveLocks: React.FC<ActiveLocksProps> = ({ data, error, errorTooltip }) => {
    const { sortedData, requestSort, getSortIndicator } = useSort(data || []);

    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    if (!data || data.length === 0) return <p>Активных блокировок не обнаружено</p>;

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                <tr>
                    <th className="sortable" onClick={() => requestSort('pid')}>PID{getSortIndicator('pid')}</th>
                    <th className="sortable" onClick={() => requestSort('locktype')}>Тип{getSortIndicator('locktype')}</th>
                    <th className="sortable" onClick={() => requestSort('mode')}>Режим{getSortIndicator('mode')}</th>
                    <th className="sortable" onClick={() => requestSort('granted')}>Получена{getSortIndicator('granted')}</th>
                    <th className="sortable" onClick={() => requestSort('relation')}>Объект{getSortIndicator('relation')}</th>
                    <th className="sortable" onClick={() => requestSort('state')}>Состояние{getSortIndicator('state')}</th>
                    <th className="sortable" onClick={() => requestSort('query')}>Запрос{getSortIndicator('query')}</th>
                    <th className="sortable" onClick={() => requestSort('query_start')}>Начало запроса{getSortIndicator('query_start')}</th>
                </tr>
                </thead>
                <tbody>
                {sortedData.map((row, idx) => (
                    <tr key={`${row.pid}-${idx}`} className={!row.granted ? 'row-warning' : ''}>
                        <td>{row.pid}</td>
                        <td>{row.locktype}</td>
                        <td>{row.mode}</td>
                        <td>{row.granted ? '✓' : '⛔ Ожидает'}</td>
                        <td>{row.relation || row.transactionid || `page ${row.page}` || '—'}</td>
                        <td>{row.state || '—'}</td>
                        <td className="query-text">{row.query || '—'}</td>
                        <td>{row.query_start ? new Date(row.query_start).toLocaleString('ru-RU') : '—'}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default ActiveLocks;