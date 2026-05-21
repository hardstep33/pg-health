import React from 'react';
import { useSort } from '../../../hooks/useSort';

interface SlotRow {
  slot_name: string;
  slot_type: string;
  active: boolean;
  wal_retained_bytes: number | string | null;
  active_pid: number | null;
}

interface ReplicationSlotsProps {
  data: SlotRow[] | null;
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

const ReplicationSlots: React.FC<ReplicationSlotsProps> = ({ data, error, errorTooltip }) => {
  const { sortedData, requestSort, getSortIndicator } = useSort(data || []);

  if (error) {
    return <span className="error" title={errorTooltip || error}>нет данных</span>;
  }
  if (!data || data.length === 0) return <p>Слоты репликации отсутствуют</p>;

  return (
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
          <tr>
            <th className="sortable" onClick={() => requestSort('slot_name')}>Имя слота{getSortIndicator('slot_name')}</th>
            <th className="sortable" onClick={() => requestSort('slot_type')}>Тип{getSortIndicator('slot_type')}</th>
            <th className="sortable" onClick={() => requestSort('active')}>Активен{getSortIndicator('active')}</th>
            <th className="sortable" onClick={() => requestSort('wal_retained_bytes')}>Удержано WAL (байты){getSortIndicator('wal_retained_bytes')}</th>
            <th className="sortable" onClick={() => requestSort('active_pid')}>PID{getSortIndicator('active_pid')}</th>
          </tr>
          </thead>
          <tbody>
          {sortedData.map((row, idx) => (
              <tr key={idx} className={!row.active ? 'row-warning' : ''}>
                <td>{row.slot_name}</td>
                <td>{row.slot_type}</td>
                <td>{row.active ? 'Да' : 'Нет'}</td>
                <td>{formatBytes(row.wal_retained_bytes)}</td>
                <td>{row.active_pid || '—'}</td>
              </tr>
          ))}
          </tbody>
        </table>
      </div>
  );
};

export default ReplicationSlots;