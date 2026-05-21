import { useWidgetData } from '../../../hooks/useWidgetData';
import { getReplicationStats } from '../../../api/postgresApi';
import ReplicationStats from './ReplicationStats';
import React from 'react';

export function useReplicationStatsWidget() {
  const { data, error, isLoading, reload } = useWidgetData(getReplicationStats);
  const errorTooltip = error ? `Ошибка получения статистики репликации:\n${error}` : undefined;
  const component = React.createElement(ReplicationStats, { data, error, errorTooltip });
  return { component, reload, isLoading };
}