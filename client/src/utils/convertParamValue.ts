// Конвертирует значение параметра с учётом unit в число
// Возвращает: для памяти — байты, для времени — миллисекунды, для остального — без изменений
export function convertParamValue(setting: string, unit: string | null): number {
    // Булевы значения
    if (setting === 'on') return 1;
    if (setting === 'off') return 0;

    const val = parseFloat(setting);
    if (isNaN(val)) return 0;

    if (!unit || unit === '') return val;

    switch (unit) {
        case '8kB': return val * 8 * 1024;
        case 'kB':  return val * 1024;
        case 'MB':  return val * 1024 * 1024;
        case 'GB':  return val * 1024 * 1024 * 1024;
        case 'ms':  return val;
        case 's':   return val * 1000;
        case 'min': return val * 60 * 1000;
        case 'h':   return val * 3600 * 1000;
        case 'd':   return val * 86400 * 1000;
        default:    return val;
    }
}

// Форматирует байты в человекочитаемый вид
export function formatBytes(bytes: number): string {
    if (bytes < 0) return '—';
    if (bytes === 0) return '0 B';
    const units = ['B', 'kB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i));
    return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// Форматирует миллисекунды
export function formatMs(ms: number): string {
    if (ms === 0) return '0ms';
    if (ms >= 60000) return `${ms / 60000}min`;
    if (ms >= 1000) return `${ms / 1000}s`;
    return `${ms}ms`;
}