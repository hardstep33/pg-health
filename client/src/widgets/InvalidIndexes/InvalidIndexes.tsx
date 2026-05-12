import React from 'react';
import { useSort } from '../../hooks/useSort';

interface InvalidIndex {
    index_name: string;
    size_pretty: string;
}

interface InvalidIndexesProps {
    data: InvalidIndex[] | null;
    error: string;
    errorTooltip?: string;
}

const InvalidIndexes: React.FC<InvalidIndexesProps> = ({ data, error, errorTooltip }) => {
    const { sortedData, requestSort, getSortIndicator } = useSort(data || []);

    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    if (!data || data.length === 0) return <p>Недействительных индексов нет</p>;

    return (
        <table className="data-table">
            <thead>
            <tr>
                <th className="sortable" onClick={() => requestSort('index_name')}>
                    Индекс{getSortIndicator('index_name')}
                </th>
                <th className="sortable" onClick={() => requestSort('size_pretty')}>
                    Размер{getSortIndicator('size_pretty')}
                </th>
            </tr>
            </thead>
            <tbody>
            {sortedData.map(idx => (
                <tr key={idx.index_name}>
                    <td>{idx.index_name}</td>
                    <td>{idx.size_pretty}</td>
                </tr>
            ))}
            </tbody>
        </table>
    );
};

export default InvalidIndexes;