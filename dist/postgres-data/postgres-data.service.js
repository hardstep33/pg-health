"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresDataService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
const queries_1 = require("./queries");
const param_utils_1 = require("./param-utils");
let PostgresDataService = class PostgresDataService {
    constructor(dbService) {
        this.dbService = dbService;
    }
    async tryParse(query, params) {
        try {
            const rows = await this.dbService.query(query, params);
            return rows;
        }
        catch (error) {
            return [{ exception: error.message }];
        }
    }
    async getOsVersion() {
        const rows = await this.tryParse(queries_1.SqlQuery.getOsVersion());
        return rows;
    }
    async getRamSize() {
        return this.tryParse(queries_1.SqlQuery.getRamSize());
    }
    async getCpuSize() {
        return this.tryParse(queries_1.SqlQuery.getCpuSize());
    }
    async getDbSelected() {
        const list = this.dbService.getConnectionList();
        const currentId = this.dbService.getCurrentId();
        const current = list.find(c => c.id === currentId);
        return { selected: current ? `${current.host}:${current.port}` : 'не выбрано' };
    }
    async getDbVersion() {
        return this.tryParse(queries_1.SqlQuery.getVersion());
    }
    async getOsDiskIOWait() {
        return this.tryParse(queries_1.SqlQuery.getOsDiskIOWait());
    }
    async getDiskPercentRead() {
        return this.tryParse(queries_1.SqlQuery.getDiskPercentRead());
    }
    async getDBIOInfo() {
        return this.tryParse(queries_1.SqlQuery.getDBIOInfo());
    }
    async getTablesCount() {
        return this.tryParse(queries_1.SqlQuery.getTablesCount());
    }
    async getDbSizeAll() {
        return this.tryParse(queries_1.SqlQuery.getDbSizeAll());
    }
    async getDbTop10Tables() {
        return this.tryParse(queries_1.SqlQuery.getDbTop10Tables());
    }
    async getDbDeadTuples() {
        return this.tryParse(queries_1.SqlQuery.getDbDeadTuples());
    }
    async getDbInvalidIndexes() {
        return this.tryParse(queries_1.SqlQuery.getDbInvalidIndexes());
    }
    async getDbTopDiskReadQuery() {
        return this.tryParse(queries_1.SqlQuery.getDbTopDiskReadQuery());
    }
    async getPostgresParams() {
        return this.tryParse(queries_1.SqlQuery.getPostgresParams());
    }
    async getActiveLocks() {
        return this.tryParse(queries_1.SqlQuery.getActiveLocks());
    }
    async getLongRunningQueries(thresholdSeconds = 30) {
        return this.tryParse(queries_1.SqlQuery.getLongRunningQueries(), [thresholdSeconds]);
    }
    async getIdleInTransaction() {
        return this.tryParse(queries_1.SqlQuery.getIdleInTransaction());
    }
    async getIndexStats() {
        return this.tryParse(queries_1.SqlQuery.getIndexStats());
    }
    async getConnectionStats() {
        return this.tryParse(queries_1.SqlQuery.getConnectionStats());
    }
    async getQPS() {
        const intervalMs = 2000;
        const query = queries_1.SqlQuery.getQPSFallback();
        try {
            const rows1 = await this.dbService.query(query);
            await new Promise(resolve => setTimeout(resolve, intervalMs));
            const rows2 = await this.dbService.query(query);
            const calls1 = rows1[0]?.total_calls || 0;
            const calls2 = rows2[0]?.total_calls || 0;
            const qps = (calls2 - calls1) / (intervalMs / 1000);
            return [{ qps: Math.max(0, Math.round(qps)) }];
        }
        catch (error) {
            return [{ exception: error.message }];
        }
    }
    async getReplicationStats() {
        return this.tryParse(queries_1.SqlQuery.getReplicationStats());
    }
    async getReplicationSlots() {
        return this.tryParse(queries_1.SqlQuery.getReplicationSlots());
    }
    async getDashboardSummary() {
        const summaryRows = await this.tryParse(queries_1.SqlQuery.getDashboardSummary());
        const summary = summaryRows[0] || { high_dead_tuples: 0, invalid_indexes: 0, cache_hit_ratio: 0 };
        const paramsRows = await this.tryParse(queries_1.SqlQuery.getParamsSummary());
        const totalRam = await this.getRamSize();
        const totalRamGb = totalRam[0]?.total_ram_gb || 0;
        const cpuRows = await this.getCpuSize();
        const cpuCores = cpuRows[0]?.cpu_cores || 0;
        const totalRamBytes = totalRamGb * 1024 * 1024 * 1024;
        const settingsMap = {};
        paramsRows.forEach(s => { settingsMap[s.name] = s; });
        const getVal = (name) => {
            const s = settingsMap[name];
            if (!s)
                return 0;
            if (name === 'autovacuum_work_mem' && s.setting === '-1')
                return getVal('maintenance_work_mem');
            return (0, param_utils_1.convertParamValue)(s.setting, s.unit);
        };
        const maxConnections = getVal('max_connections') || 100;
        const storageType = 'SSD';
        let deviatedCount = 0;
        const checks = [
            { name: 'shared_buffers', current: getVal('shared_buffers'), recommended: totalRamBytes / 4 },
            { name: 'effective_cache_size', current: getVal('effective_cache_size'), recommended: totalRamBytes * 0.75 },
            { name: 'work_mem', current: getVal('work_mem'), recommended: totalRamGb > 0 ? Math.floor((totalRamBytes - Math.min(totalRamBytes * 0.25, 8 * 1024 * 1024 * 1024)) / maxConnections / 4) : 0 },
            { name: 'maintenance_work_mem', current: getVal('maintenance_work_mem'), recommended: totalRamGb > 0 ? Math.min(totalRamBytes * 0.1, 1 * 1024 * 1024 * 1024) : 0 },
            { name: 'max_connections', current: getVal('max_connections'), recommended: 200 },
            { name: 'max_parallel_workers', current: getVal('max_parallel_workers'), recommended: cpuCores > 0 ? Math.min(cpuCores, 8) : 0 },
            { name: 'max_parallel_workers_per_gather', current: getVal('max_parallel_workers_per_gather'), recommended: cpuCores > 0 ? Math.min(Math.floor(cpuCores / 2), 4) : 0 },
            { name: 'max_parallel_maintenance_workers', current: getVal('max_parallel_maintenance_workers'), recommended: cpuCores > 0 ? Math.max(Math.floor(cpuCores * 0.25), 4) : 0 },
            { name: 'max_worker_processes', current: getVal('max_worker_processes'), recommended: cpuCores },
            { name: 'autovacuum_enabled', current: getVal('autovacuum_enabled'), recommended: 1 },
            { name: 'autovacuum_max_workers', current: getVal('autovacuum_max_workers'), recommended: cpuCores > 0 ? Math.max(Math.ceil(cpuCores / 3), 1) : 0 },
            { name: 'autovacuum_naptime', current: getVal('autovacuum_naptime'), recommended: 60 * 1000 },
            { name: 'autovacuum_vacuum_cost_delay', current: getVal('autovacuum_vacuum_cost_delay'), recommended: storageType === 'SSD' ? 2 : 10 },
            { name: 'autovacuum_vacuum_cost_limit', current: getVal('autovacuum_vacuum_cost_limit'), recommended: storageType === 'SSD' ? 2000 : 200 },
            { name: 'autovacuum_work_mem', current: getVal('autovacuum_work_mem'), recommended: totalRamGb > 0 && cpuCores > 0 ? 256 * 1024 * 1024 : 0 },
            { name: 'log_autovacuum_min_duration', current: getVal('log_autovacuum_min_duration'), recommended: 0 },
            { name: 'autovacuum_vacuum_threshold', current: getVal('autovacuum_vacuum_threshold'), recommended: 50 },
            { name: 'autovacuum_vacuum_scale_factor', current: getVal('autovacuum_vacuum_scale_factor'), recommended: 0.05 },
            { name: 'autovacuum_analyze_threshold', current: getVal('autovacuum_analyze_threshold'), recommended: 50 },
            { name: 'autovacuum_analyze_scale_factor', current: getVal('autovacuum_analyze_scale_factor'), recommended: 0.05 },
        ];
        for (const check of checks) {
            if (check.recommended === 0)
                continue;
            let isOk = false;
            if (check.name === 'max_connections')
                isOk = true;
            else if (check.name === 'log_autovacuum_min_duration')
                isOk = check.current === 0;
            else {
                const diff = Math.abs(check.current - check.recommended) / check.recommended;
                isOk = diff < 0.2;
            }
            if (!isOk)
                deviatedCount++;
        }
        return {
            high_dead_tuples: Number(summary.high_dead_tuples) || 0,
            invalid_indexes: Number(summary.invalid_indexes) || 0,
            deviated_params: deviatedCount,
            cache_hit_ratio: Number(summary.cache_hit_ratio) || 0,
        };
    }
    async executeCustomQuery(query) {
        const forbiddenKeywords = ['create', 'insert', 'update', 'delete', 'drop', 'truncate',
            'alter', 'grant', 'revoke', 'copy', 'load', 'do', 'call',
            'vacuum', 'reindex', 'select into', 'create or replace', 'comment', 'security label',
            'import foreign schema', 'set', 'reset', 'prepare', 'release savepoint', 'abort', 'rollback', 'refresh', 'execute'
        ];
        const lowerQuery = query.toLowerCase();
        for (const keyword of forbiddenKeywords) {
            if (lowerQuery.includes(keyword)) {
                return { error: `Запрещён оператор: ${keyword.toUpperCase()}. Разрешены только SELECT запросы.` };
            }
        }
        if (!lowerQuery.includes('limit 10')) {
            return { error: `Разрешены только SELECT запросы c указанием limit 10 (в одну строку)` };
        }
        const trimmed = query.trim().toLowerCase();
        if (!trimmed.startsWith('select') && !trimmed.startsWith('with')) {
            return { error: 'Разрешены только SELECT запросы (в том числе с CTE).' };
        }
        try {
            const result = await this.dbService.query(query);
            return { rows: result, rowCount: result.length };
        }
        catch (error) {
            return { error: error.message };
        }
    }
};
exports.PostgresDataService = PostgresDataService;
exports.PostgresDataService = PostgresDataService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], PostgresDataService);
//# sourceMappingURL=postgres-data.service.js.map