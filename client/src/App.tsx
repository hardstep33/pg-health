import React, { useState, useCallback, useRef } from 'react';
import './App.css';
import DraggableDashboard from './shared/DraggableDashboard';
import { WidgetInfo } from './hooks/useDashboardLayout';
import { useOsVersionWidget } from './widgets/OsVersion';
import { useDbVersionWidget } from './widgets/DbVersion';
import { useRamSizeWidget } from './widgets/RamSize';
import { useCpuSizeWidget } from './widgets/CpuSize';
import { useDatabaseSizeWidget } from './widgets/DatabaseSize';
import { useTablesCountWidget } from './widgets/TablesCount';
import { useTop10TablesWidget } from './widgets/Top10Tables';
import { useDiskIOWaitWidget } from './widgets/DiskIOWait';
import { useDiskReadPercentWidget } from './widgets/DiskReadPercent';
import { useDatabaseIOWidget } from './widgets/DatabaseIO';
import { useTopDiskReadQueriesWidget } from './widgets/TopDiskReadQueries';
import { useInvalidIndexesWidget } from './widgets/InvalidIndexes';
import { useDeadTuplesWidget } from './widgets/DeadTuples';
import { useConnectionStatsWidget } from './widgets/ConnectionStats';
import { useActiveLocksWidget } from './widgets/ActiveLocks';
import { useLongRunningQueriesWidget } from './widgets/LongRunningQueries';
import { useIdleInTransactionWidget } from './widgets/IdleInTransaction';
import { useIndexStatsWidget } from './widgets/IndexStats';
import PostgresParamsReference from './widgets/PostgresParamsReference';
import { useParamsRamSizeWidget } from './widgets/ParamsRamSize';
import { useParamsCpuSizeWidget } from './widgets/ParamsCpuSize';
import { useParamsDbSizeWidget } from './widgets/ParamsDbSize';
import { useParamsComparisonWidget } from './widgets/ParamsComparison';
import ParamsRamSize from './widgets/ParamsRamSize/ParamsRamSize';
import ParamsCpuSize from './widgets/ParamsCpuSize/ParamsCpuSize';
import ParamsDbSize from './widgets/ParamsDbSize/ParamsDbSize';
import ParamsComparison from './widgets/ParamsComparison/ParamsComparison';
import ConnectionSelector from './widgets/ConnectionSelector/ConnectionSelector';
import { ConnectionContext, ConnectionInfo } from './hooks/useConnectionContext';
import { exportToPdf } from './utils/pdfExport';
import ThemeSwitcher from './components/ThemeSwitcher';
import { useQpsWidget } from './widgets/QpsWidget';

type TabName = 'db-state' | 'postgres-params' | 'locks-transactions' | 'indexes';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabName>('db-state');
    const [currentConnection, setCurrentConnection] = useState<ConnectionInfo | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const handleSetConnection = useCallback((conn: ConnectionInfo) => {
        setCurrentConnection(conn);
    }, []);

    // Виджеты первой вкладки
    const osVersion = useOsVersionWidget();
    const dbVersion = useDbVersionWidget();
    const ramSize = useRamSizeWidget();
    const cpuSize = useCpuSizeWidget();
    const dbSize = useDatabaseSizeWidget();
    const tablesCount = useTablesCountWidget();
    const top10Tables = useTop10TablesWidget();
    const diskIOWait = useDiskIOWaitWidget();
    const diskReadPercent = useDiskReadPercentWidget();
    const databaseIO = useDatabaseIOWidget();
    const topDiskReadQueries = useTopDiskReadQueriesWidget();
    const deadTuples = useDeadTuplesWidget();
    const connectionStats = useConnectionStatsWidget();
    const qps = useQpsWidget();

    // Виджеты второй вкладки
    const paramsRam = useParamsRamSizeWidget();
    const paramsCpu = useParamsCpuSizeWidget();
    const paramsDbSize = useParamsDbSizeWidget();
    const paramsComparison = useParamsComparisonWidget();

    // Виджеты третьей вкладки
    const activeLocks = useActiveLocksWidget();
    const longRunningQueries = useLongRunningQueriesWidget();
    const idleInTransaction = useIdleInTransactionWidget();

    // Виджеты четвёртой вкладки
    const invalidIndexes = useInvalidIndexesWidget();
    const indexStats = useIndexStatsWidget();

    // Refs для экспорта
    const dbStateRef = useRef<HTMLDivElement>(null);
    const paramsRef = useRef<HTMLDivElement>(null);
    const locksRef = useRef<HTMLDivElement>(null);
    const indexesRef = useRef<HTMLDivElement>(null);

    const handleExportPdf = async () => {
        const refMap: Record<TabName, React.RefObject<HTMLDivElement | null>> = {
            'db-state': dbStateRef,
            'postgres-params': paramsRef,
            'locks-transactions': locksRef,
            'indexes': indexesRef,
        };
        const currentRef = refMap[activeTab];
        if (!currentRef?.current) return;
        setIsExporting(true);
        try {
            await exportToPdf(currentRef.current, `report-${activeTab}.pdf`);
        } finally {
            setIsExporting(false);
        }
    };

    const dbStateWidgets: WidgetInfo[] = [
        { id: 'os-version', title: 'Версия ОС', tooltip: 'Версия операционной системы, на которой запущен PostgreSQL', component: osVersion.component, onReload: osVersion.reload, isLoading: osVersion.isLoading },
        { id: 'db-version', title: 'Версия PostgreSQL', tooltip: 'Полная версия сервера PostgreSQL', component: dbVersion.component, onReload: dbVersion.reload, isLoading: dbVersion.isLoading },
        { id: 'ram-size', title: 'Объём RAM', tooltip: 'Общий объём оперативной памяти сервера', component: ramSize.component, onReload: ramSize.reload, isLoading: ramSize.isLoading },
        { id: 'cpu-size', title: 'Количество CPU', tooltip: 'Количество логических ядер процессора', component: cpuSize.component, onReload: cpuSize.reload, isLoading: cpuSize.isLoading },
        { id: 'database-size', title: 'Размер БД', tooltip: 'Общий размер текущей базы данных', component: dbSize.component, onReload: dbSize.reload, isLoading: dbSize.isLoading },
        { id: 'qps-widget', title: 'QPS', tooltip: 'Показатель QPS (query per second) – среднее количество запросов в секунду', component: qps.component, onReload: qps.reload, isLoading: qps.isLoading },
        { id: 'tables-count', title: 'Таблицы по схемам', tooltip: 'Количество таблиц в каждой схеме БД', component: tablesCount.component, onReload: tablesCount.reload, isLoading: tablesCount.isLoading, fullWidth: true },
        { id: 'top10-tables', title: 'Топ-10 таблиц', tooltip: 'Десять самых больших таблиц по размеру', component: top10Tables.component, onReload: top10Tables.reload, isLoading: top10Tables.isLoading },
        { id: 'disk-io-wait', title: 'Ожидание диска', tooltip: 'Активные запросы, ожидающие завершения операций ввода-вывода', component: diskIOWait.component, onReload: diskIOWait.reload, isLoading: diskIOWait.isLoading, fullWidth: true },
        { id: 'disk-read-percent', title: 'Чтение с диска', tooltip: 'Степень чтения с диска для таблиц (а не из кэша)', component: diskReadPercent.component, onReload: diskReadPercent.reload, isLoading: diskReadPercent.isLoading, fullWidth: true },
        { id: 'database-io', title: 'I/O по БД', tooltip: 'Общая статистика ввода-вывода по всем базам данных', component: databaseIO.component, onReload: databaseIO.reload, isLoading: databaseIO.isLoading, fullWidth: true },
        { id: 'top-disk-read-queries', title: 'Тяжёлые запросы', tooltip: 'Топ-10 запросов, которые читают данные преимущественно с диска', component: topDiskReadQueries.component, onReload: topDiskReadQueries.reload, isLoading: topDiskReadQueries.isLoading, fullWidth: true },
        { id: 'dead-tuples', title: 'Мёртвые кортежи', tooltip: '<b>Мёртвые кортежи</b> — строки, помеченные как удалённые.<br/>' + '<span style="color: #e51400;">Красная заливка</span> — более 10% мёртвых строк.<br/>' + '<i>Рекомендуется</i> проверить настройки автовакуума.', component: deadTuples.component, onReload: deadTuples.reload, isLoading: deadTuples.isLoading, fullWidth: true },
        { id: 'connection-stats', title: 'Статистика подключений', tooltip: 'Текущее количество подключений к БД. Красный фон — более 90% от max_connections.', component: connectionStats.component, onReload: connectionStats.reload, isLoading: connectionStats.isLoading, fullWidth: true },
    ];

    const postgresParamsWidgets: WidgetInfo[] = [
        { id: 'params-reference', title: 'Справка по параметрам', tooltip: 'Рекомендации по настройке критичных параметров PostgreSQL', component: <PostgresParamsReference /> },
        { id: 'params-ram-size', title: 'Объём RAM', tooltip: 'Используется для расчёта shared_buffers, effective_cache_size, work_mem', component: <ParamsRamSize totalRamGb={paramsRam.totalRamGb} error={paramsRam.error} errorTooltip={paramsRam.errorTooltip} />, onReload: paramsRam.reload, isLoading: paramsRam.isLoading },
        { id: 'params-cpu-size', title: 'Количество CPU', tooltip: 'Используется для расчёта max_parallel_workers и autovacuum_max_workers', component: <ParamsCpuSize cpuCores={paramsCpu.cpuCores} error={paramsCpu.error} errorTooltip={paramsCpu.errorTooltip} />, onReload: paramsCpu.reload, isLoading: paramsCpu.isLoading },
        { id: 'params-db-size', title: 'Размер БД', tooltip: 'Влияет на выбор maintenance_work_mem и пороги autovacuum для больших таблиц', component: <ParamsDbSize dbSizeGb={paramsDbSize.dbSizeGb} error={paramsDbSize.error} errorTooltip={paramsDbSize.errorTooltip} />, onReload: paramsDbSize.reload, isLoading: paramsDbSize.isLoading },
        { id: 'params-comparison', title: 'Сравнение параметров', tooltip: 'Сравнение текущих значений параметров PostgreSQL с рекомендуемыми', component: <ParamsComparison data={paramsComparison.data} error={paramsComparison.error} totalRamGb={paramsRam.totalRamGb !== null && !isNaN(paramsRam.totalRamGb) ? paramsRam.totalRamGb : null} cpuCores={paramsCpu.cpuCores !== null && !isNaN(paramsCpu.cpuCores) ? paramsCpu.cpuCores : null} />, onReload: paramsComparison.reload, isLoading: paramsComparison.isLoading, fullWidth: true },
    ];

    const locksTransactionsWidgets: WidgetInfo[] = [
        { id: 'active-locks', title: 'Активные блокировки', tooltip: 'Блокировки из pg_locks. Красным — ожидающие блокировку.', component: activeLocks.component, onReload: activeLocks.reload, isLoading: activeLocks.isLoading, fullWidth: true },
        { id: 'long-running-queries', title: 'Длительные запросы (>30 сек)', tooltip: 'Активные запросы, выполняющиеся дольше 30 секунд. Красным — более 5 минут.', component: longRunningQueries.component, onReload: longRunningQueries.reload, isLoading: longRunningQueries.isLoading, fullWidth: true },
        { id: 'idle-in-transaction', title: 'Зависшие транзакции (Idle in transaction)', tooltip: 'Транзакции в состоянии idle in transaction. Красным — дольше 10 минут.', component: idleInTransaction.component, onReload: idleInTransaction.reload, isLoading: idleInTransaction.isLoading, fullWidth: true },
    ];

    const indexWidgets: WidgetInfo[] = [
        { id: 'invalid-indexes', title: 'Недействительные индексы (indisvalid = false)', tooltip: 'Индексы, помеченные как недействительные (требуют перестроения)', component: invalidIndexes.component, onReload: invalidIndexes.reload, isLoading: invalidIndexes.isLoading, fullWidth: true },
        { id: 'index-stats', title: 'Статистика использования индексов', tooltip: 'Данные pg_stat_user_indexes + pg_statio_user_indexes. Неиспользуемые индексы отмечены красным.', component: indexStats.component, onReload: indexStats.reload, isLoading: indexStats.isLoading, fullWidth: true },
    ];

    return (
        <ConnectionContext.Provider value={{ currentConnection, setCurrentConnection: handleSetConnection }}>
            <div className="app">
                <div className="app-header">
                    <div className="app-tabs">
                        <button className={`app-tab ${activeTab === 'db-state' ? 'app-tab--active' : ''}`} onClick={() => setActiveTab('db-state')}>Состояние БД</button>
                        <button className={`app-tab ${activeTab === 'postgres-params' ? 'app-tab--active' : ''}`} onClick={() => setActiveTab('postgres-params')}>Параметры Postgres</button>
                        <button className={`app-tab ${activeTab === 'locks-transactions' ? 'app-tab--active' : ''}`} onClick={() => setActiveTab('locks-transactions')}>Блокировки и транзакции</button>
                        <button className={`app-tab ${activeTab === 'indexes' ? 'app-tab--active' : ''}`} onClick={() => setActiveTab('indexes')}>Индексы</button>
                    </div>
                    <div className="app-header-right">
                        <ThemeSwitcher />
                        <button className="export-pdf-btn" onClick={handleExportPdf} title="Сохранить отчёт в PDF">📄 PDF</button>
                        <ConnectionSelector />
                    </div>
                </div>

                <div className="app-content">
                    {activeTab === 'db-state' && <div ref={dbStateRef}><DraggableDashboard storageKey="dashboard-db-state" widgets={dbStateWidgets} /></div>}
                    {activeTab === 'postgres-params' && <div ref={paramsRef}><DraggableDashboard storageKey="dashboard-postgres-params" widgets={postgresParamsWidgets} /></div>}
                    {activeTab === 'locks-transactions' && <div ref={locksRef}><DraggableDashboard storageKey="dashboard-locks-transactions" widgets={locksTransactionsWidgets} /></div>}
                    {activeTab === 'indexes' && <div ref={indexesRef}><DraggableDashboard storageKey="dashboard-indexes" widgets={indexWidgets} /></div>}
                </div>

                {isExporting && (
                    <div className="export-overlay">
                        <div className="export-overlay-content">
                            <div className="widget-spinner"></div>
                            <span>Идёт экспорт PDF...</span>
                        </div>
                    </div>
                )}
            </div>
        </ConnectionContext.Provider>
    );
};

export default App;