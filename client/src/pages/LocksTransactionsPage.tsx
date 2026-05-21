import React from 'react';
import DraggableDashboard from '../components/DraggableDashboard/DraggableDashboard';
import { WidgetInfo } from '../hooks/useDashboardLayout';
import { useActiveLocksWidget } from '../widgets/locks/ActiveLocks';
import { useLongRunningQueriesWidget } from '../widgets/locks/LongRunningQueries';
import { useIdleInTransactionWidget } from '../widgets/locks/IdleInTransaction';

const LocksTransactionsPage: React.FC = () => {
    const activeLocks = useActiveLocksWidget();
    const longRunningQueries = useLongRunningQueriesWidget();
    const idleInTransaction = useIdleInTransactionWidget();

    const widgets: WidgetInfo[] = [
        {
            id: 'active-locks',
            title: 'Активные блокировки',
            tooltip: 'Блокировки из pg_locks. Красным — ожидающие блокировку.',
            component: activeLocks.component,
            onReload: activeLocks.reload,
            isLoading: activeLocks.isLoading,
            fullWidth: true,
            order: 1,
        },
        {
            id: 'long-running-queries',
            title: 'Длительные запросы (>30 сек)',
            tooltip: 'Активные запросы дольше 30 секунд. Красным — более 5 минут.',
            component: longRunningQueries.component,
            onReload: longRunningQueries.reload,
            isLoading: longRunningQueries.isLoading,
            fullWidth: true,
            order: 2,
        },
        {
            id: 'idle-in-transaction',
            title: 'Зависшие транзакции (Idle in transaction)',
            tooltip: 'Транзакции в состоянии idle in transaction. Красным — дольше 10 минут.',
            component: idleInTransaction.component,
            onReload: idleInTransaction.reload,
            isLoading: idleInTransaction.isLoading,
            fullWidth: true,
            order: 3,
        },
    ];

    return <DraggableDashboard storageKey="dashboard-locks-transactions" widgets={widgets} />;
};

export default LocksTransactionsPage;