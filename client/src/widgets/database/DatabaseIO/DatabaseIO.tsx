import React from 'react';
import { formatInteger, formatPercent } from '../../../utils/formatNumber';
import { useSort } from '../../../hooks/useSort';

interface DBIO {
    datname: string;
    blks_read: number | string;
    blks_hit: number | string;
    disk_read_percent: number | string;
}

interface DatabaseIOProps {
    data: DBIO[] | null;
    error: string;
    errorTooltip?: string;
}

const DatabaseIO: React.FC<DatabaseIOProps> = ({ data, error, errorTooltip }) => {
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
                <th className="sortable" onClick={() => requestSort('datname')}>
                    База данных{getSortIndicator('datname')}
                </th>
                <th className="sortable" onClick={() => requestSort('blks_read')}>
                    Прочитано блоков с диска{getSortIndicator('blks_read')}
                </th>
                <th className="sortable" onClick={() => requestSort('blks_hit')}>
                    Попаданий в кэш{getSortIndicator('blks_hit')}
                </th>
                <th className="sortable" onClick={() => requestSort('disk_read_percent')}>
                    % чтения с диска{getSortIndicator('disk_read_percent')}
                </th>
            </tr>
            </thead>
            <tbody>
            {sortedData.map(db => (
                <tr key={db.datname}>
                    <td>{db.datname}</td>
                    <td>{formatInteger(db.blks_read)}</td>
                    <td>{formatInteger(db.blks_hit)}</td>
                    <td>{formatPercent(db.disk_read_percent)}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default DatabaseIO;