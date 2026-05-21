import React from 'react';
import { useSort } from '../../../hooks/useSort';

interface ReplicaRow {
  application_name: string;
  client_addr: string;
  state: string;
  sync_state: string;
  replay_lag_bytes: number | string | null;
  replay_lag: any; // может быть interval объектом или строкой
  flush_lag: any;
  write_lag: any;
}

interface ReplicationStatsProps {
  data: ReplicaRow[] | null;
  error: string;
  errorTooltip?: string;
}

const formatBytes = (bytes: number | string | null | undefined): string => {
  if (bytes === null || bytes === undefined) return '—';
  let num = typeof bytes === 'string' ? parseFloat(bytes) : bytes;
  if (isNaN(num)) return '—';
  if (num < 0) return '—';
  if (num === 0) return '0 B';
  const units = ['B', 'kB', 'MB', 'GB'];
  let i = 0;
  let val = num;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
};

const formatLag = (lag: any): string => {
  if (lag === null || lag === undefined) return '—';
  if (typeof lag === 'string') return lag;
  if (typeof lag === 'object' && lag !== null) {
    // PostgreSQL возвращает interval как { milliseconds: number }
    if ('milliseconds' in lag && typeof lag.milliseconds === 'number') {
      const ms = lag.milliseconds;
      if (ms < 1000) return `${ms} ms`;
      if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
      if (ms < 3600000) return `${(ms / 60000).toFixed(1)} min`;
      return `${(ms / 3600000).toFixed(1)} h`;
    }
    // попробуем сериализовать
    try {
      return JSON.stringify(lag);
    } catch {
      return '—';
    }
  }
  return String(lag);
};

const ReplicationStats: React.FC<ReplicationStatsProps> = ({ data, error, errorTooltip }) => {
  const { sortedData, requestSort, getSortIndicator } = useSort(data || []);

  if (error) {
    return <span className="error" title={errorTooltip || error}>нет данных</span>;
  }
  if (!data || data.length === 0) return <p>Репликация не настроена или нет активных реплик</p>;

  return (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
          <tr>
            <th className="sortable" onClick={() => requestSort('application_name')}>Приложение{getSortIndicator('application_name')}</th>
            <th className="sortable" onClick={() => requestSort('client_addr')}>Адрес{getSortIndicator('client_addr')}</th>
            <th className="sortable" onClick={() => requestSort('state')}>Состояние{getSortIndicator('state')}</th>
            <th className="sortable" onClick={() => requestSort('sync_state')}>Синхронизация{getSortIndicator('sync_state')}</th>
            <th className="sortable" onClick={() => requestSort('replay_lag_bytes')}>Отставание (байты){getSortIndicator('replay_lag_bytes')}</th>
            <th>Отставание replay</th>
            <th>Отставание flush</th>
            <th>Отставание write</th>
          </tr>
          </thead>
          <tbody>
          {sortedData.map((row, idx) => (
              <tr key={idx}>
                <td>{row.application_name || '—'}</td>
                <td>{row.client_addr || '—'}</td>
                <td>{row.state}</td>
                <td>{row.sync_state}</td>
                <td>{formatBytes(row.replay_lag_bytes)}</td>
                <td>{formatLag(row.replay_lag)}</td>
                <td>{formatLag(row.flush_lag)}</td>
                <td>{formatLag(row.write_lag)}</td>
              </tr>
          ))}
          </tbody>
         </table>
      </div>
);
};

export default ReplicationStats;