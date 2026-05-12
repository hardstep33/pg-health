import React from 'react';
import { formatInteger, formatPercent } from '../../../utils/formatNumber';
import { useSort } from '../../../hooks/useSort';

interface DeadTupleRow {
    table_schema: string;
    n_live_tup: number | string;
    n_dead_tup: number | string;
    dead_percent: number | string;
    phase: string | null;
    heap_blks_total: number | string | null;
    heap_blks_scanned: number | string | null;
    heap_blks_vacuumed: number | string | null;
    index_vacuum_count: number | string | null;
    last_autovacuum: string | null;
    last_autoanalyze: string | null;
    last_vacuum: string | null;
    last_analyze: string | null;
    tab_size_pretty: string;
}

interface DeadTuplesProps {
    data: DeadTupleRow[] | null;
    error: string;
    errorTooltip?: string;
}

const formatDate = (d: string | null) => (d ? new Date(d).toLocaleString('ru-RU') : '—');

const DeadTuples: React.FC<DeadTuplesProps> = ({ data, error, errorTooltip }) => {
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
                    <th className="sortable" onClick={() => requestSort('table_schema')}>
                        Таблица{getSortIndicator('table_schema')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('n_live_tup')}>
                        Живых строк{getSortIndicator('n_live_tup')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('n_dead_tup')}>
                        Мёртвых строк{getSortIndicator('n_dead_tup')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('dead_percent')}>
                        % мёртвых{getSortIndicator('dead_percent')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('phase')}>
                        Фаза vacuum{getSortIndicator('phase')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('heap_blks_total')}>
                        Блоков всего{getSortIndicator('heap_blks_total')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('heap_blks_scanned')}>
                        Просканировано{getSortIndicator('heap_blks_scanned')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('heap_blks_vacuumed')}>
                        Обработано vacuum{getSortIndicator('heap_blks_vacuumed')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('index_vacuum_count')}>
                        Индексов{getSortIndicator('index_vacuum_count')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('last_autovacuum')}>
                        Последний autovacuum{getSortIndicator('last_autovacuum')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('last_autoanalyze')}>
                        Последний autoanalyze{getSortIndicator('last_autoanalyze')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('last_vacuum')}>
                        Последний vacuum{getSortIndicator('last_vacuum')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('last_analyze')}>
                        Последний analyze{getSortIndicator('last_analyze')}
                    </th>
                    <th className="sortable" onClick={() => requestSort('tab_size_pretty')}>
                        Размер{getSortIndicator('tab_size_pretty')}
                    </th>
                </tr>
                </thead>
                <tbody>
                {sortedData.map((row, idx) => {
                    const deadPercentNum = typeof row.dead_percent === 'string'
                        ? parseFloat(row.dead_percent)
                        : row.dead_percent;
                    const isHighDead = deadPercentNum > 10;

                    return (
                        <tr key={row.table_schema + idx} className={isHighDead ? 'row-warning' : ''}>
                            <td>{row.table_schema}</td>
                            <td>{formatInteger(row.n_live_tup)}</td>
                            <td>{formatInteger(row.n_dead_tup)}</td>
                            <td>{formatPercent(row.dead_percent)}</td>
                            <td>{row.phase || '—'}</td>
                            <td>{formatInteger(row.heap_blks_total)}</td>
                            <td>{formatInteger(row.heap_blks_scanned)}</td>
                            <td>{formatInteger(row.heap_blks_vacuumed)}</td>
                            <td>{formatInteger(row.index_vacuum_count)}</td>
                            <td>{formatDate(row.last_autovacuum)}</td>
                            <td>{formatDate(row.last_autoanalyze)}</td>
                            <td>{formatDate(row.last_vacuum)}</td>
                            <td>{formatDate(row.last_analyze)}</td>
                            <td>{row.tab_size_pretty}</td>
                        </tr>
                    );
                })}
                </tbody>
            </table>
        </div>
    );
};

export default DeadTuples;