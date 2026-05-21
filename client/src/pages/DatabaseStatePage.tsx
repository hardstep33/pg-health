import React from 'react';
import DraggableDashboard from '../components/DraggableDashboard/DraggableDashboard';
import { WidgetInfo } from '../hooks/useDashboardLayout';
import { useOsVersionWidget } from '../widgets/database/OsVersion';
import { useDbVersionWidget } from '../widgets/database/DbVersion';
import { useRamSizeWidget } from '../widgets/database/RamSize';
import { useCpuSizeWidget } from '../widgets/database/CpuSize';
import { useDatabaseSizeWidget } from '../widgets/database/DatabaseSize';
import { useQpsWidget } from '../widgets/database/QpsWidget';
import { useTablesCountWidget } from '../widgets/database/TablesCount';
import { useTop10TablesWidget } from '../widgets/database/Top10Tables';
import { useDiskIOWaitWidget } from '../widgets/database/DiskIOWait';
import { useDiskReadPercentWidget } from '../widgets/database/DiskReadPercent';
import { useDatabaseIOWidget } from '../widgets/database/DatabaseIO';
import { useTopDiskReadQueriesWidget } from '../widgets/database/TopDiskReadQueries';
import { useDeadTuplesWidget } from '../widgets/database/DeadTuples';
import { useConnectionStatsWidget } from '../widgets/database/ConnectionStats';
import { useCustomQueryWidget } from '../widgets/database/CustomQuery/useCustomQueryWidget';

const DatabaseStatePage: React.FC = () => {
    const osVersion = useOsVersionWidget();
    const dbVersion = useDbVersionWidget();
    const ramSize = useRamSizeWidget();
    const cpuSize = useCpuSizeWidget();
    const dbSize = useDatabaseSizeWidget();
    const qps = useQpsWidget();
    const tablesCount = useTablesCountWidget();
    const top10Tables = useTop10TablesWidget();
    const diskIOWait = useDiskIOWaitWidget();
    const diskReadPercent = useDiskReadPercentWidget();
    const databaseIO = useDatabaseIOWidget();
    const topDiskReadQueries = useTopDiskReadQueriesWidget();
    const deadTuples = useDeadTuplesWidget();
    const connectionStats = useConnectionStatsWidget();

    const customQuery = useCustomQueryWidget();

    const widgets: WidgetInfo[] = [
        { id: 'os-version',          title: 'Версия ОС',               tooltip: 'Версия операционной системы, на которой запущен PostgreSQL',               component: osVersion.component,          onReload: osVersion.reload,          isLoading: osVersion.isLoading,          order: 1 },
        { id: 'db-version',          title: 'Версия PostgreSQL',        tooltip: 'Полная версия сервера PostgreSQL',                                         component: dbVersion.component,          onReload: dbVersion.reload,          isLoading: dbVersion.isLoading,          order: 2 },
        { id: 'ram-size',            title: 'Объём RAM',                tooltip: 'Общий объём оперативной памяти сервера',                                   component: ramSize.component,            onReload: ramSize.reload,            isLoading: ramSize.isLoading,            order: 3 },
        { id: 'cpu-size',            title: 'Количество CPU',           tooltip: 'Количество логических ядер процессора',                                    component: cpuSize.component,            onReload: cpuSize.reload,            isLoading: cpuSize.isLoading,            order: 4 },
        { id: 'database-size',       title: 'Размер БД',                tooltip: 'Общий размер текущей базы данных',                                         component: dbSize.component,             onReload: dbSize.reload,             isLoading: dbSize.isLoading,             order: 5 },
        { id: 'qps-widget',          title: 'QPS',                      tooltip: 'Среднее количество запросов в секунду',                                   component: qps.component,               onReload: qps.reload,               isLoading: qps.isLoading,               order: 6 },
        { id: 'connection-stats',    title: 'Статистика подключений',   tooltip: 'Количество подключений к БД. Красный фон — более 90% от max_connections.', component: connectionStats.component,    onReload: connectionStats.reload,    isLoading: connectionStats.isLoading,   order: 7, fullWidth: true },
        { id: 'dead-tuples',         title: 'Мёртвые кортежи',          tooltip: 'Строки, помеченные как удалённые. Красная заливка — более 10% мёртвых.',   component: deadTuples.component,         onReload: deadTuples.reload,         isLoading: deadTuples.isLoading,        order: 8, fullWidth: true },
        { id: 'top-disk-read-queries', title: 'Тяжёлые запросы',        tooltip: 'Топ запросов по чтению с диска',                                          component: topDiskReadQueries.component, onReload: topDiskReadQueries.reload, isLoading: topDiskReadQueries.isLoading, order: 9, fullWidth: true },
        { id: 'disk-io-wait',        title: 'Ожидание диска',           tooltip: 'Запросы, ожидающие операции ввода-вывода',                                 component: diskIOWait.component,         onReload: diskIOWait.reload,         isLoading: diskIOWait.isLoading,        order: 10, fullWidth: true },
        { id: 'top10-tables',        title: 'Топ-10 таблиц',            tooltip: 'Десять самых больших таблиц по размеру',                                   component: top10Tables.component,        onReload: top10Tables.reload,        isLoading: top10Tables.isLoading,        order: 11 },
        { id: 'tables-count',        title: 'Таблицы по схемам',        tooltip: 'Количество таблиц в каждой схеме БД',                                     component: tablesCount.component,        onReload: tablesCount.reload,        isLoading: tablesCount.isLoading,        order: 12 },
        { id: 'disk-read-percent',   title: 'Чтение с диска',           tooltip: 'Процент чтения с диска для таблиц (а не из кэша)',                         component: diskReadPercent.component,    onReload: diskReadPercent.reload,    isLoading: diskReadPercent.isLoading,   order: 13, fullWidth: true },
        { id: 'database-io',         title: 'I/O по БД',                tooltip: 'Общая статистика ввода-вывода по базам данных',                            component: databaseIO.component,         onReload: databaseIO.reload,         isLoading: databaseIO.isLoading,        order: 14, fullWidth: true },
        { id: 'custom-query',       title: 'Произвольный запрос',       tooltip: 'Выполните любой SELECT запрос',                                           component: customQuery.component,         onReload: customQuery.reload,         isLoading: customQuery.isLoading,       fullWidth: true, order: 15 }
    ];

    return <DraggableDashboard storageKey="dashboard-db-state" widgets={widgets} />;
};

export default DatabaseStatePage;