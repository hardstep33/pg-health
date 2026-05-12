import React from 'react';
import { useSort } from '../../../hooks/useSort';

interface LongQuery {
    pid: number;
    state: string;
    wait_event_type: string | null;
    wait_event: string | null;
    query: string;
    query_start: string;
    duration_sec: number;
}

interface LongRunningQueriesProps {
    data: LongQuery[] | null;
    error: string;
    errorTooltip?: string;
}

const LongRunningQueries: React.FC<LongRunningQueriesProps> = ({ data, error, errorTooltip }) => {
    const { sortedData, requestSort, getSortIndicator } = useSort(data || []);

    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    if (!data || data.length === 0) return <p>Нет длительных запросов (&gt;30 сек)</p>;

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                <tr>
                    <th className="sortable" onClick={() => requestSort('pid')}>PID{getSortIndicator('pid')}</th>
                    <th className="sortable" onClick={() => requestSort('duration_sec')}>Длительность (сек){getSortIndicator('duration_sec')}</th>
                    <th className="sortable" onClick={() => requestSort('state')}>Состояние{getSortIndicator('state')}</th>
                    <th className="sortable" onClick={() => requestSort('wait_event_type')}>Тип ожидания{getSortIndicator('wait_event_type')}</th>
                    <th className="sortable" onClick={() => requestSort('wait_event')}>Событие{getSortIndicator('wait_event')}</th>
                    <th className="sortable" onClick={() => requestSort('query')}>Запрос{getSortIndicator('query')}</th>
                    <th className="sortable" onClick={() => requestSort('query_start')}>Начало{getSortIndicator('query_start')}</th>
                </tr>
                </thead>
                <tbody>
                {sortedData.map((q, idx) => (
                    <tr key={`${q.pid}-${idx}`} className={q.duration_sec > 300 ? 'row-warning' : ''}>
                        <td>{q.pid}</td>
                        <td>{q.duration_sec}</td>
                        <td>{q.state}</td>
                        <td>{q.wait_event_type || '—'}</td>
                        <td>{q.wait_event || '—'}</td>
                        <td className="query-text">{q.query}</td>
                        <td>{new Date(q.query_start).toLocaleString('ru-RU')}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default LongRunningQueries;