import React from 'react';
import DraggableDashboard from '../components/DraggableDashboard/DraggableDashboard';
import { WidgetInfo } from '../hooks/useDashboardLayout';
import { useInvalidIndexesWidget } from '../widgets/indexes/InvalidIndexes';
import { useIndexStatsWidget } from '../widgets/indexes/IndexStats';

const IndexesPage: React.FC = () => {
    const invalidIndexes = useInvalidIndexesWidget();
    const indexStats = useIndexStatsWidget();

    const widgets: WidgetInfo[] = [
        {
            id: 'invalid-indexes',
            title: 'Недействительные индексы (indisvalid = false)',
            tooltip: 'Индексы, помеченные как недействительные (требуют перестроения)',
            component: invalidIndexes.component,
            onReload: invalidIndexes.reload,
            isLoading: invalidIndexes.isLoading,
            fullWidth: true,
            order: 1,
        },
        {
            id: 'index-stats',
            title: 'Статистика использования индексов',
            tooltip: 'Данные pg_stat_user_indexes + pg_statio_user_indexes. Неиспользуемые индексы отмечены красным.',
            component: indexStats.component,
            onReload: indexStats.reload,
            isLoading: indexStats.isLoading,
            fullWidth: true,
            order: 2,
        },
    ];

    return <DraggableDashboard storageKey="dashboard-indexes" widgets={widgets} />;
};

export default IndexesPage;