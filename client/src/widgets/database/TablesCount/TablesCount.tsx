import React from 'react';
import { formatInteger } from '../../../utils/formatNumber';
import { useSort } from '../../../hooks/useSort';

interface SchemaCount {
    schemaname: string;
    table_count: number | string;
}

interface TablesCountProps {
    data: SchemaCount[] | null;
    error: string;
    errorTooltip?: string;
}

const TablesCount: React.FC<TablesCountProps> = ({ data, error, errorTooltip }) => {
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
                <th className="sortable" onClick={() => requestSort('schemaname')}>
                    Схема{getSortIndicator('schemaname')}
                </th>
                <th className="sortable" onClick={() => requestSort('table_count')}>
                    Таблиц{getSortIndicator('table_count')}
                </th>
            </tr>
            </thead>
            <tbody>
            {sortedData.map(s => (
                <tr key={s.schemaname}>
                    <td>{s.schemaname}</td>
                    <td>{formatInteger(s.table_count)}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default TablesCount;