import { useWidgetData } from '../../../hooks/useWidgetData';
import { getDbSelected } from '../../../api/postgresApi';

export function useDbSelectedWidget() {
    const { data, error, isLoading, reload } = useWidgetData(getDbSelected);
    const selected = data?.selected || '';
    return { selected, error, isLoading, reload };
}