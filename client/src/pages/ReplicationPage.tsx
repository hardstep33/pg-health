import React from 'react';
import DraggableDashboard from '../components/DraggableDashboard/DraggableDashboard';
import { WidgetInfo } from '../hooks/useDashboardLayout';
import { useReplicationStatsWidget } from '../widgets/replication/ReplicationStats/useReplicationStatsWidget';
import { useReplicationSlotsWidget } from '../widgets/replication/ReplicationSlots/useReplicationSlotsWidget';

const ReplicationPage: React.FC = () => {
  const replicationStats = useReplicationStatsWidget();
  const replicationSlots = useReplicationSlotsWidget();

  const widgets: WidgetInfo[] = [
    {
      id: 'replication-stats',
      title: 'Статус репликации',
      tooltip: 'Активные реплики и их состояние из pg_stat_replication',
      component: replicationStats.component,
      onReload: replicationStats.reload,
      isLoading: replicationStats.isLoading,
      fullWidth: true,
      order: 1,
    },
    {
      id: 'replication-slots',
      title: 'Слоты репликации',
      tooltip: 'Слоты репликации и объём удерживаемого WAL',
      component: replicationSlots.component,
      onReload: replicationSlots.reload,
      isLoading: replicationSlots.isLoading,
      fullWidth: true,
      order: 2,
    },
  ];

  return <DraggableDashboard storageKey="dashboard-replication" widgets={widgets} />;
};

export default ReplicationPage;