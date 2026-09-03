/* Модуль привязки фронта к бэку */

const BASE_URL = '/postgres-data';

/* Общий метод для привязки */
async function fetchJson(url: string, options?: RequestInit) {
    const baseUrl = url.startsWith('/api/') ? '' : BASE_URL;
    const res = await fetch(`${baseUrl}${url}`, options);
    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(errorText || `Ошибка ${res.status}`);
    }
    const json = await res.json();
    if (json && typeof json === 'object') {
        if (!Array.isArray(json) && json.exception) {
            throw new Error(json.exception);
        }
        if (Array.isArray(json) && json.length > 0 && json[0]?.exception) {
            throw new Error(json[0].exception);
        }
    }
    return json;
}

// Мапим имя метода к API на бэке
export const getDbSelected = () => fetchJson('/db/selected');
export const getDbVersion = () => fetchJson('/db/version');
export const getOsVersion = () => fetchJson('/os/version');
export const getRamSize = () => fetchJson('/os/ram');
export const getCpuSize = () => fetchJson('/os/cpu');
export const getOsDiskIOWait = () => fetchJson('/os/disk/io_wait');
export const getDiskPercentRead = () => fetchJson('/disk/read_percent');
export const getDBIOInfo = () => fetchJson('/db/total_io');
export const getTablesCount = () => fetchJson('/db/tables_count');
export const getDbSizeAll = () => fetchJson('/db/size_all');
export const getDbTop10Tables = () => fetchJson('/db/top10-tables');
export const getDbDeadTuples = () => fetchJson('/db/dead_tuples_top_50');
export const getDbInvalidIndexes = () => fetchJson('/db/invalid-indexes');
export const getDbTopDiskReadQuery = () => fetchJson('/db/top-disk-read-queries');
export const getPostgresParams = () => fetchJson('/db/params');
export const getActiveLocks = () => fetchJson('/db/active-locks');
export const getLongRunningQueries = (threshold?: number) => fetchJson(`/db/long-running-queries${threshold ? `?threshold=${threshold}` : ''}`);
export const getIdleInTransaction = () => fetchJson('/db/idle-in-transaction');
export const getIndexStats = () => fetchJson('/db/index-stats');
export const getConnectionStats = () => fetchJson('/db/connection-stats');
export const getConnections = () => fetchJson('/api/connections');
export const switchConnection = (id: string) => fetchJson('/api/connections/switch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
export const addConnection = (data: { description: string; host: string; port: number; database: string; user: string; password: string }) =>
    fetchJson('/api/connections/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
export const testConnection = (data: { description: string; host: string; port: number; database: string; user: string; password: string }) =>
    fetchJson('/api/connections/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
export const getQPS = () => fetchJson('/db/qps');
export const getReplicationStats = () => fetchJson('/replication/stats');
export const getReplicationSlots = () => fetchJson('/replication/slots');
export const getDashboardSummary = () => fetchJson('/db/dashboard-summary');
export const executeCustomQuery = (query: string) =>
    fetchJson('/custom-query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query }),
    });