import React, { useState } from 'react';
import { formatInteger, formatPercent } from '../../../utils/formatNumber';
import { useSort } from '../../../hooks/useSort';
import { paginate, getTotalPages } from '../../../utils/pagination';
import Pagination from '../../../components/Pagination/Pagination';

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

const PAGE_SIZE = 10;

const TopDiskReadQueries: React.FC<TopDiskReadQueriesProps> = ({ data, error, errorTooltip }) => {
    const { sortedData, requestSort, getSortIndicator } = useSort(data || []);
    const [currentPage, setCurrentPage] = useState(1);

    if (error) {
        return <span className="error" title={errorTooltip || error}>{error}</span>;
    }
    if (!data) return null;

    const totalPages = getTotalPages(sortedData.length, PAGE_SIZE);
    const paginatedData = paginate(sortedData, currentPage, PAGE_SIZE);
    const handlePageChange = (page: number) => setCurrentPage(page);

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                <tr>
                    <th className="sortable" onClick={() => requestSort('query')}>Запрос{getSortIndicator('query')}</th>
                    <th className="sortable" onClick={() => requestSort('shared_blks_read')}>Блоков с диска{getSortIndicator('shared_blks_read')}</th>
                    <th className="sortable" onClick={() => requestSort('shared_blks_hit')}>Блоков в кэше{getSortIndicator('shared_blks_hit')}</th>
                    <th className="sortable" onClick={() => requestSort('disk_percent')}>% чтения с диска{getSortIndicator('disk_percent')}</th>
                    <th className="sortable" onClick={() => requestSort('calls')}>Вызовов{getSortIndicator('calls')}</th>
                </tr>
                </thead>
                <tbody>
                {paginatedData.map((q, idx) => {
                    const diskPercentNum = typeof q.disk_percent === 'string' ? parseFloat(q.disk_percent) : q.disk_percent;
                    return (
                        <tr key={idx} className={diskPercentNum > 100 ? 'row-warning' : ''}>
                            <td className="query-text">{q.query}</td>
                            <td>{formatInteger(q.shared_blks_read)}</td>
                            <td>{formatInteger(q.shared_blks_hit)}</td>
                            <td>{formatPercent(q.disk_percent)}</td>
                            <td>{formatInteger(q.calls)}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
    );
};

export default TopDiskReadQueries;