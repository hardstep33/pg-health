import { useWidgetData } from '../../hooks/useWidgetData';
import { getPostgresParams } from '../../api/postgresApi';

export function useParamsComparisonWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getPostgresParams);
    return { data, error, isLoading, reload };
}