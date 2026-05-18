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

    const widgets: WidgetInfo[] = [
        { id: 'os-version',          title: 'Версия ОС',               tooltip: 'Версия операционной системы, на которой запущен PostgreSQL',                                                                                                                                                                           component: osVersion.component,          onReload: osVersion.reload,          isLoading: osVersion.isLoading },
        { id: 'db-version',          title: 'Версия PostgreSQL',        tooltip: 'Полная версия сервера PostgreSQL',                                                                                                                                                                                                     component: dbVersion.component,          onReload: dbVersion.reload,          isLoading: dbVersion.isLoading },
        { id: 'ram-size',            title: 'Объём RAM',                tooltip: 'Общий объём оперативной памяти сервера',                                                                                                                                                                                               component: ramSize.component,            onReload: ramSize.reload,            isLoading: ramSize.isLoading },
        { id: 'cpu-size',            title: 'Количество CPU',           tooltip: 'Количество логических ядер процессора',                                                                                                                                                                                                component: cpuSize.component,            onReload: cpuSize.reload,            isLoading: cpuSize.isLoading },
        { id: 'database-size',       title: 'Размер БД',                tooltip: 'Общий размер текущей базы данных',                                                                                                                                                                                                     component: dbSize.component,             onReload: dbSize.reload,             isLoading: dbSize.isLoading },
        { id: 'qps-widget',          title: 'QPS',                      tooltip: 'Показатель QPS (query per second) – среднее количество запросов в секунду',                                                                                                                                                           component: qps.component,               onReload: qps.reload,               isLoading: qps.isLoading },
        { id: 'tables-count',        title: 'Таблицы по схемам',        tooltip: 'Количество таблиц в каждой схеме БД',                                                                                                                                                                                                  component: tablesCount.component,        onReload: tablesCount.reload,        isLoading: tablesCount.isLoading },
        { id: 'top10-tables',        title: 'Топ-10 таблиц',            tooltip: 'Десять самых больших таблиц по размеру',                                                                                                                                                                                               component: top10Tables.component,        onReload: top10Tables.reload,        isLoading: top10Tables.isLoading },
        { id: 'disk-io-wait',        title: 'Ожидание диска',           tooltip: 'Активные запросы, ожидающие завершения операций ввода-вывода',                                                                                                                                                                         component: diskIOWait.component,         onReload: diskIOWait.reload,         isLoading: diskIOWait.isLoading,        fullWidth: true },
        { id: 'disk-read-percent',   title: 'Чтение с диска',           tooltip: 'Степень чтения с диска для таблиц (а не из кэша)',                                                                                                                                                                                     component: diskReadPercent.component,    onReload: diskReadPercent.reload,    isLoading: diskReadPercent.isLoading,   fullWidth: true },
        { id: 'database-io',         title: 'I/O по БД',                tooltip: 'Общая статистика ввода-вывода по всем базам данных',                                                                                                                                                                                   component: databaseIO.component,         onReload: databaseIO.reload,         isLoading: databaseIO.isLoading,        fullWidth: true },
        { id: 'top-disk-read-queries', title: 'Тяжёлые запросы',        tooltip: 'Топ-10 самых тяжелых запросов (с момента сброса статистики pg_stat_statements)',                                                                                                                                                                       component: topDiskReadQueries.component, onReload: topDiskReadQueries.reload, isLoading: topDiskReadQueries.isLoading, fullWidth: true },
        { id: 'dead-tuples',         title: 'Мёртвые кортежи',          tooltip: '<b>Мёртвые кортежи</b> — строки, помеченные как удалённые.<br/><span style="color: #e51400;">Красная заливка</span> — более 10% мёртвых строк.<br/><i>Рекомендуется</i> проверить настройки автовакуума.',                            component: deadTuples.component,         onReload: deadTuples.reload,         isLoading: deadTuples.isLoading,        fullWidth: true },
        { id: 'connection-stats',    title: 'Статистика подключений',   tooltip: 'Текущее количество подключений к БД. Красный фон — более 90% от max_connections.',                                                                                                                                                     component: connectionStats.component,    onReload: connectionStats.reload,    isLoading: connectionStats.isLoading,   fullWidth: true },
    ];

    return <DraggableDashboard storageKey="dashboard-db-state" widgets={widgets} />;
};

export default DatabaseStatePage;
