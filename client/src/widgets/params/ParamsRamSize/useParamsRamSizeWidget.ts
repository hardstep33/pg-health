import { useWidgetData } from '../../../hooks/useWidgetData';
import { getRamSize } from '../../../api/postgresApi';

export function useParamsRamSizeWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getRamSize);
    const totalRamGb = data?.[0]?.total_ram_gb ?? null;
    const errorTooltip = error ? `Ошибка получения объёма RAM:\n${error}` : undefined;
    return { totalRamGb, error, isLoading, reload, errorTooltip };
}