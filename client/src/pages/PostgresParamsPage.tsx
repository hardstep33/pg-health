import React from 'react';
import DraggableDashboard from '../components/DraggableDashboard/DraggableDashboard';
import { WidgetInfo } from '../hooks/useDashboardLayout';
import { useParamsRamSizeWidget } from '../widgets/params/ParamsRamSize';
import { useParamsCpuSizeWidget } from '../widgets/params/ParamsCpuSize';
import { useParamsDbSizeWidget } from '../widgets/params/ParamsDbSize';
import { useParamsComparisonWidget } from '../widgets/params/ParamsComparison';
import PostgresParamsReference from '../widgets/params/PostgresParamsReference';
import ParamsRamSize from '../widgets/params/ParamsRamSize/ParamsRamSize';
import ParamsCpuSize from '../widgets/params/ParamsCpuSize/ParamsCpuSize';
import ParamsDbSize from '../widgets/params/ParamsDbSize/ParamsDbSize';
import ParamsComparison from '../widgets/params/ParamsComparison/ParamsComparison';

const PostgresParamsPage: React.FC = () => {
    const paramsRam = useParamsRamSizeWidget();
    const paramsCpu = useParamsCpuSizeWidget();
    const paramsDbSize = useParamsDbSizeWidget();
    const paramsComparison = useParamsComparisonWidget();

    const widgets: WidgetInfo[] = [
        {
            id: 'params-ram-size',
            title: 'Объём RAM',
            tooltip: 'Используется для расчёта shared_buffers, effective_cache_size, work_mem',
            component: <ParamsRamSize totalRamGb={paramsRam.totalRamGb} error={paramsRam.error} errorTooltip={paramsRam.errorTooltip} />,
            onReload: paramsRam.reload,
            isLoading: paramsRam.isLoading,
            order: 1,
        },
        {
            id: 'params-cpu-size',
            title: 'Количество CPU',
            tooltip: 'Используется для расчёта max_parallel_workers и autovacuum_max_workers',
            component: <ParamsCpuSize cpuCores={paramsCpu.cpuCores} error={paramsCpu.error} errorTooltip={paramsCpu.errorTooltip} />,
            onReload: paramsCpu.reload,
            isLoading: paramsCpu.isLoading,
            order: 2,
        },
        {
            id: 'params-db-size',
            title: 'Размер БД',
            tooltip: 'Влияет на выбор maintenance_work_mem и пороги autovacuum для больших таблиц',
            component: <ParamsDbSize dbSizeGb={paramsDbSize.dbSizeGb} error={paramsDbSize.error} errorTooltip={paramsDbSize.errorTooltip} />,
            onReload: paramsDbSize.reload,
            isLoading: paramsDbSize.isLoading,
            order: 3,
        },
        {
            id: 'params-comparison',
            title: 'Сравнение параметров',
            tooltip: 'Сравнение текущих значений параметров PostgreSQL с рекомендуемыми',
            component: (
                <ParamsComparison
                    data={paramsComparison.data}
                    error={paramsComparison.error}
                    totalRamGb={paramsRam.totalRamGb !== null && !isNaN(paramsRam.totalRamGb) ? paramsRam.totalRamGb : null}
                    cpuCores={paramsCpu.cpuCores !== null && !isNaN(paramsCpu.cpuCores) ? paramsCpu.cpuCores : null}
                />
            ),
            onReload: paramsComparison.reload,
            isLoading: paramsComparison.isLoading,
            fullWidth: true,
            order: 4,
        },
    ];

    return (
        <>
            <div style={{ padding: 'var(--content-padding, 20px) var(--content-padding, 20px) 0' }}>
                <PostgresParamsReference />
            </div>
            <DraggableDashboard storageKey="dashboard-postgres-params" widgets={widgets} />
        </>
    );
};

export default PostgresParamsPage;
