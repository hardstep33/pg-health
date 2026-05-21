import React, { useState } from 'react';
import { useSort } from '../../../hooks/useSort';
import { formatInteger, formatPercent } from '../../../utils/formatNumber';
import { formatBytes } from '../../../utils/convertParamValue';
import { paginate, getTotalPages } from '../../../utils/pagination';
import Pagination from '../../../components/Pagination/Pagination';

interface IndexStat {
    schema_name: string;
    table_name: string;
    index_name: string;
    idx_scan: number | string;
    idx_tup_read: number | string;
    idx_tup_fetch: number | string;
    index_size_bytes: number | string;
    index_size_pretty: string;
    idx_blks_read: number | string;
    idx_blks_hit: number | string;
    cache_hit_ratio: number | string;
}

interface IndexStatsProps {
    data: IndexStat[] | null;
    error: string;
    errorTooltip?: string;
}

const PAGE_SIZE = 20;

const IndexStats: React.FC<IndexStatsProps> = ({ data, error, errorTooltip }) => {
    const { sortedData, requestSort, getSortIndicator } = useSort(data || []);
    const [currentPage, setCurrentPage] = useState(1);

    if (error) {
        return <span className="error" title={errorTooltip || error}>{error}</span>;
    }
    if (!data || data.length === 0) return <p>Индексы не найдены</p>;

    const totalBytes = (data || []).reduce((sum, row) => sum + (Number(row.index_size_bytes) || 0), 0);
    const totalPages = getTotalPages(sortedData.length, PAGE_SIZE);
    const paginatedData = paginate(sortedData, currentPage, PAGE_SIZE);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                <tr>
                    <th className="sortable" onClick={() => requestSort('schema_name')}>Схема{getSortIndicator('schema_name')}</th>
                    <th className="sortable" onClick={() => requestSort('table_name')}>Таблица{getSortIndicator('table_name')}</th>
                    <th className="sortable" onClick={() => requestSort('index_name')}>Индекс{getSortIndicator('index_name')}</th>
                    <th className="sortable" onClick={() => requestSort('idx_scan')}>Сканирований{getSortIndicator('idx_scan')}</th>
                    <th className="sortable" onClick={() => requestSort('idx_tup_fetch')}>Извлечено строк{getSortIndicator('idx_tup_fetch')}</th>
                    <th className="sortable" onClick={() => requestSort('index_size_pretty')}>Размер{getSortIndicator('index_size_pretty')}</th>
                    <th className="sortable" onClick={() => requestSort('cache_hit_ratio')}>% кэша{getSortIndicator('cache_hit_ratio')}</th>
                    <th>Статус</th>
                </tr>
                </thead>
                <tbody>
                {paginatedData.map((row, idx) => {
                    const scans = Number(row.idx_scan) || 0;
                    const sizeBytes = Number(row.index_size_bytes) || 0;
                    let status = scans === 0 && sizeBytes > 0 ? '⚠️ Не используется' : (scans < 10 && sizeBytes > 1024*1024 ? 'Редко используется' : 'OK');
                    return (
                        <tr key={`${row.index_name}-${idx}`} className={scans === 0 && sizeBytes > 0 ? 'row-warning' : ''}>
                            <td>{row.schema_name}</td>
                            <td className="break-word">{row.table_name}</td>
                            <td className="break-word">{row.index_name}</td>
                            <td>{formatInteger(row.idx_scan)}</td>
                            <td>{formatInteger(row.idx_tup_fetch)}</td>
                            <td>{row.index_size_pretty}</td>
                            <td>{formatPercent(row.cache_hit_ratio)}</td>
                            <td>{status}</td>
                        </tr>
                    );
                })}
                </tbody>
                <tfoot>
                <tr className="table-footer"><td colSpan={5}>Всего</td><td>{formatBytes(totalBytes)}</td><td colSpan={2}></td></tr>
                </tfoot>
            </table>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
    );
};

export default IndexStats;