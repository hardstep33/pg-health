import React from 'react';
import { formatInteger, formatPercent } from '../../../utils/formatNumber';

interface ConnectionStat {
    database_name: string;
    current_connections: number | string;
    max_connections: number | string;
    connection_pct: number | string;
    active_queries: number | string;
    idle_connections: number | string;
    idle_in_transaction: number | string;
    waiting_queries: number | string;
}

interface ConnectionStatsProps {
    data: ConnectionStat[] | null;
    error: string;
    errorTooltip?: string;
}

const ConnectionStats: React.FC<ConnectionStatsProps> = ({ data, error, errorTooltip }) => {
    if (error) {
        return (
            <span className="error" title={errorTooltip || error}>
        нет данных
      </span>
        );
    }
    if (!data || data.length === 0) return <p>Нет данных о подключениях</p>;

    const stats = data[0];
    const idleInTransaction = Number(stats.idle_in_transaction) || 0;
    const connectionPct = Number(stats.connection_pct) || 0;

    return (
        <div className="table-wrapper">
            <table className="data-table">
                <thead>
                <tr>
                    <th>База данных</th>
                    <th>Текущие подключения</th>
                    <th>Макс. подключений</th>
                    <th>Использовано (%)</th>
                    <th>Активных запросов</th>
                    <th>Idle подключений</th>
                    <th>Idle in transaction</th>
                    <th>Ожидающих запросов</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>{stats.database_name}</td>
                    <td>{formatInteger(stats.current_connections)}</td>
                    <td>{formatInteger(stats.max_connections)}</td>
                    <td
                        className={connectionPct >= 90 ? 'cell-warning' : ''}
                        title={connectionPct >= 90 ? 'Возможное переполнение количества соединений!' : undefined}
                        style={{ cursor: connectionPct >= 90 ? 'help' : 'default' }}
                    >
                        {formatPercent(stats.connection_pct)}
                    </td>
                    <td>{formatInteger(stats.active_queries)}</td>
                    <td>{formatInteger(stats.idle_connections)}</td>
                    <td
                        className={idleInTransaction > 0 ? 'cell-warning' : ''}
                        title={idleInTransaction > 0 ? 'Возможно, зависшие транзакции. Посмотри вкладку \'Блокировки и транзакции\'' : undefined}
                        style={{ cursor: idleInTransaction > 0 ? 'help' : 'default' }}
                    >
                        {formatInteger(stats.idle_in_transaction)}
                    </td>
                    <td>{formatInteger(stats.waiting_queries)}</td>
                </tr>
                </tbody>
            </table>
        </div>
    );
};

export default ConnectionStats;