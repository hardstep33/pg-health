import { useWidgetData } from '../../../hooks/useWidgetData';
import { getReplicationSlots } from '../../../api/postgresApi';
import ReplicationSlots from './ReplicationSlots';
import React from 'react';

export function useReplicationSlotsWidget() {
  const { data, error, isLoading, reload } = useWidgetData(getReplicationSlots);
  const errorTooltip = error ? `Ошибка получения слотов репликации:\n${error}` : undefined;
  const component = React.createElement(ReplicationSlots, { data, error, errorTooltip });
  return { component, reload, isLoading };
}