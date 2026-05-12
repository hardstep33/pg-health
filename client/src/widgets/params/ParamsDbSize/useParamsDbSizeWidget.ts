import { useWidgetData } from '../../../hooks/useWidgetData';
import { getDbSizeAll } from '../../../api/postgresApi';

export function useParamsDbSizeWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getDbSizeAll);
    const dbSizeGb = data?.[0]?.db_size_gb ?? null;
    const errorTooltip = error ? `Ошибка получения размера БД:\n${error}` : undefined;
    return { dbSizeGb, error, isLoading, reload, errorTooltip };
}