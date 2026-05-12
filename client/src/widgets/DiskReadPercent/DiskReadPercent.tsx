import React from 'react';
import { formatInteger, formatPercent } from '../../utils/formatNumber';
import { useSort } from '../../hooks/useSort';

interface TableReadStat {
    table_name: string;
    heap_blks_read: number | string;
    heap_blks_hit: number | string;
    read_percent: number | string;
}

interface DiskReadPercentProps {
    data: TableReadStat[] | null;
    error: string;
    errorTooltip?: string;
}

const DiskReadPercent: React.FC<DiskReadPercentProps> = ({ data, error, errorTooltip }) => {
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
        <table className="data-table">
            <thead>
            <tr>
                <th className="sortable" onClick={() => requestSort('table_name')}>
                    Таблица{getSortIndicator('table_name')}
                </th>
                <th className="sortable" onClick={() => requestSort('heap_blks_read')}>
                    Прочитано с диска (блоков){getSortIndicator('heap_blks_read')}
                </th>
                <th className="sortable" onClick={() => requestSort('heap_blks_hit')}>
                    Попадания в кэш{getSortIndicator('heap_blks_hit')}
                </th>
                <th className="sortable" onClick={() => requestSort('read_percent')}>
                    % чтения с диска{getSortIndicator('read_percent')}
                </th>
            </tr>
            </thead>
            <tbody>
            {sortedData.map(row => {
                const readPercentNum = typeof row.read_percent === 'string'
                    ? parseFloat(row.read_percent)
                    : row.read_percent;
                const isHighRead = readPercentNum > 20;

                return (
                    <tr key={row.table_name} className={isHighRead ? 'row-warning' : ''}>
                        <td>{row.table_name}</td>
                        <td>{formatInteger(row.heap_blks_read)}</td>
                        <td>{formatInteger(row.heap_blks_hit)}</td>
                        <td>{formatPercent(row.read_percent)}</td>
                    </tr>
                );
            })}
            </tbody>
        </table>
    );
};

export default DiskReadPercent;