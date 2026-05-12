import { useWidgetData } from '../../../hooks/useWidgetData';
import { getCpuSize } from '../../../api/postgresApi';

export function useParamsCpuSizeWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getCpuSize);
    const cpuCores = data?.[0]?.cpu_cores ?? null;
    const errorTooltip = error ? `Ошибка получения количества CPU:\n${error}` : undefined;
    return { cpuCores, error, isLoading, reload, errorTooltip };
}