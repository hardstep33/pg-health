function toNumber(value: number | string): number {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        const cleaned = value.replace(/[^\d.-]/g, '');
        const parsed = parseFloat(cleaned);
        return isNaN(parsed) ? 0 : parsed;
    }
    return 0;
}

export function formatInteger(value: number | string | null): string {
    if (value === null || value === undefined) return '—';
    const num = toNumber(value);
    return num.toLocaleString('ru-RU', { maximumFractionDigits: 0 });
}

export function formatDecimal(value: number | string | null, fractionDigits: number = 2): string {
    if (value === null || value === undefined) return '—';
    const num = toNumber(value);
    return num.toLocaleString('ru-RU', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits,
    });
}

export function formatPercent(value: number | string | null): string {
    if (value === null || value === undefined) return '—';
    const num = toNumber(value);
    return num.toLocaleString('ru-RU', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 3,
    }) + '%';
}