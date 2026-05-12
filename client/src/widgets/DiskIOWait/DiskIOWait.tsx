import React from 'react';
import { formatInteger } from '../../utils/formatNumber';
import { useSort } from '../../hooks/useSort';

interface WaitQuery {
    pid: number | string;
    state: string;
    wait_event_type: string;
    wait_event: string;
    query: string;
    backend_start: string;
}

interface DiskIOWaitProps {
    data: WaitQuery[] | null;
    error: string;
    errorTooltip?: string;
}

const DiskIOWait: React.FC<DiskIOWaitProps> = ({ data, error, errorTooltip }) => {
    const { sortedData, requestSort, getSortIndicator } = useSort(data || []);

    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    if (!data || data.length === 0) return <p>Нет запросов, ожидающих диск</p>;

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                <tr>
                    <th className="sortable" onClick={() => requestSort('pid')}>
                        PID{getSortIndicator('pid')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('state')}>
                        Состояние{getSortIndicator('state')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('wait_event_type')}>
                        Тип ожидания{getSortIndicator('wait_event_type')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('wait_event')}>
                        Событие{getSortIndicator('wait_event')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('query')}>
                        Запрос{getSortIndicator('query')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('backend_start')}>
                        Запущен{getSortIndicator('backend_start')}
                    </th>
                </tr>
                </thead>
                <tbody>
                {sortedData.map(q => (
                    <tr key={q.pid}>
                        <td>{formatInteger(q.pid)}</td>
                        <td>{q.state}</td>
                        <td>{q.wait_event_type}</td>
                        <td>{q.wait_event}</td>
                        <td className="query-text">{q.query}</td>
                        <td>{new Date(q.backend_start).toLocaleString('ru-RU')}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
};

export default DiskIOWait;