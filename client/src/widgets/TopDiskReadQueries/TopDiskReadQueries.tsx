import React from 'react';
import { formatInteger, formatPercent } from '../../utils/formatNumber';
import { useSort } from '../../hooks/useSort';

interface HeavyQuery {
    query: string;
    shared_blks_read: number | string;
    shared_blks_hit: number | string;
    disk_percent: number | string;
    calls: number | string;
}

interface TopDiskReadQueriesProps {
    data: HeavyQuery[] | null;
    error: string;
    errorTooltip?: string;
}

const TopDiskReadQueries: React.FC<TopDiskReadQueriesProps> = ({ data, error, errorTooltip }) => {
    const { sortedData, requestSort, getSortIndicator } = useSort(data || []);

    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    if (!data) return null;

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                <tr>
                    <th className="sortable" onClick={() => requestSort('query')}>
                        Запрос{getSortIndicator('query')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('shared_blks_read')}>
                        Блоков прочитано с диска{getSortIndicator('shared_blks_read')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('shared_blks_hit')}>
                        Блоков в кэше{getSortIndicator('shared_blks_hit')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('disk_percent')}>
                        % дискового чтения{getSortIndicator('disk_percent')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('calls')}>
                        Вызовов{getSortIndicator('calls')}
                    </th>
                </tr>
                </thead>
                <tbody>
                {sortedData.map((q, idx) => {
                    const diskPercentNum = typeof q.disk_percent === 'string'
                        ? parseFloat(q.disk_percent)
                        : q.disk_percent;
                    const isHighDiskRead = diskPercentNum > 100;

                    return (
                        <tr key={idx} className={isHighDiskRead ? 'row-warning' : ''}>
                            <td className="query-text query-text-wrap">{q.query}</td>
                            <td>{formatInteger(q.shared_blks_read)}</td>
                            <td>{formatInteger(q.shared_blks_hit)}</td>
                            <td>{formatPercent(q.disk_percent)}</td>
                            <td>{formatInteger(q.calls)}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default TopDiskReadQueries;