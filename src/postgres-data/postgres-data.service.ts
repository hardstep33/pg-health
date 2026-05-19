import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SqlQuery } from './queries';
import * as os from 'os';
import { promises as fs } from 'fs';
import { convertParamValue } from './param-utils';

@Injectable()
export class PostgresDataService {
  constructor(
      private dbService: DatabaseService,
  ) {}

  private async tryParse(query: string, params?: any[]) {
    try {
      const rows = await this.dbService.query(query, params);
      return rows;
    } catch (error: any) {
      return [{ exception: error.message }];
    }
  }

  async getOsVersion() {
    const rows = await this.tryParse(SqlQuery.getOsVersion());
    return rows;
  }

  async getRamSize() {
    try {
      const meminfo = await fs.readFile('/proc/meminfo', 'utf8');
      const match = meminfo.match(/MemTotal:\s+(\d+)\s+kB/);
      if (match) {
        const totalKb = parseInt(match[1], 10);
        const totalGb = totalKb / 1024 / 1024;
        return [{ total_ram_gb: totalGb }];
      }
    } catch (e) {}
    return [{ total_ram_gb: os.totalmem() / 1024 / 1024 / 1024 }];
  }

  async getCpuSize() {
    const cpus = os.cpus();
    return [{ cpu_cores: cpus.length }];
  }

  async getDbSelected() {
    const list = this.dbService.getConnectionList();
    const currentId = this.dbService.getCurrentId();
    const current = list.find(c => c.id === currentId);
    return { selected: current ? `${current.host}:${current.port}` : 'не выбрано' };
  }

  async getDbVersion() {
    return this.tryParse(SqlQuery.getVersion());
  }

  async getOsDiskIOWait() {
    return this.tryParse(SqlQuery.getOsDiskIOWait());
  }

  async getDiskPercentRead() {
    return this.tryParse(SqlQuery.getDiskPercentRead());
  }

  async getDBIOInfo() {
    return this.tryParse(SqlQuery.getDBIOInfo());
  }

  async getTablesCount() {
    return this.tryParse(SqlQuery.getTablesCount());
  }

  async getDbSizeAll() {
    return this.tryParse(SqlQuery.getDbSizeAll());
  }

  async getDbTop10Tables() {
    return this.tryParse(SqlQuery.getDbTop10Tables());
  }

  async getDbDeadTuples() {
    return this.tryParse(SqlQuery.getDbDeadTuples());
  }

  async getDbInvalidIndexes() {
    return this.tryParse(SqlQuery.getDbInvalidIndexes());
  }

  async getDbTopDiskReadQuery() {
    return this.tryParse(SqlQuery.getDbTopDiskReadQuery());
  }

  async getPostgresParams() {
    // Кэширование убрано — всегда свежие данные
    return this.tryParse(SqlQuery.getPostgresParams());
  }

  async getActiveLocks() {
    return this.tryParse(SqlQuery.getActiveLocks());
  }

  async getLongRunningQueries(thresholdSeconds: number = 30) {
    return this.tryParse(SqlQuery.getLongRunningQueries(), [thresholdSeconds]);
  }

  async getIdleInTransaction() {
    return this.tryParse(SqlQuery.getIdleInTransaction());
  }

  async getIndexStats() {
    return this.tryParse(SqlQuery.getIndexStats());
  }

  async getConnectionStats() {
    return this.tryParse(SqlQuery.getConnectionStats());
  }

  async getQPS() {
    const intervalMs = 2000;
    const query = SqlQuery.getQPSFallback();
    try {
      const rows1 = await this.dbService.query(query);
      await new Promise(resolve => setTimeout(resolve, intervalMs));
      const rows2 = await this.dbService.query(query);
      const calls1 = rows1[0]?.total_calls || 0;
      const calls2 = rows2[0]?.total_calls || 0;
      const qps = (calls2 - calls1) / (intervalMs / 1000);
      return [{ qps: Math.max(0, Math.round(qps)) }];
    } catch (error: any) {
      return [{ exception: error.message }];
    }
  }

  // --- Репликация ---
  async getReplicationStats() {
    return this.tryParse(SqlQuery.getReplicationStats());
  }

  async getReplicationSlots() {
    return this.tryParse(SqlQuery.getReplicationSlots());
  }

  // --- Сводка ---
  async getDashboardSummary() {
    const summaryRows = await this.tryParse(SqlQuery.getDashboardSummary());
    const summary = summaryRows[0] || { high_dead_tuples: 0, invalid_indexes: 0, cache_hit_ratio: 0 };
    const paramsRows = await this.tryParse(SqlQuery.getParamsSummary());
    const totalRam = await this.getRamSize();
    const totalRamGb = totalRam[0]?.total_ram_gb || 0;
    const cpuRows = await this.getCpuSize();
    const cpuCores = cpuRows[0]?.cpu_cores || 0;
    const totalRamBytes = totalRamGb * 1024 * 1024 * 1024;

    const settingsMap: Record<string, any> = {};
    (paramsRows as any[]).forEach(s => { settingsMap[s.name] = s; });

    const getVal = (name: string): number => {
      const s = settingsMap[name];
      if (!s) return 0;
      if (name === 'autovacuum_work_mem' && s.setting === '-1') return getVal('maintenance_work_mem');
      return convertParamValue(s.setting, s.unit);
    };

    const maxConnections = getVal('max_connections') || 100;
    const storageType = 'SSD';
    let deviatedCount = 0;

    const checks = [
      { name: 'shared_buffers', current: getVal('shared_buffers'), recommended: totalRamBytes / 4 },
      { name: 'effective_cache_size', current: getVal('effective_cache_size'), recommended: totalRamBytes * 0.75 },
      { name: 'work_mem', current: getVal('work_mem'), recommended: totalRamGb > 0 ? Math.floor((totalRamBytes - Math.min(totalRamBytes * 0.25, 8*1024*1024*1024)) / maxConnections / 4) : 0 },
      { name: 'maintenance_work_mem', current: getVal('maintenance_work_mem'), recommended: totalRamGb > 0 ? Math.min(totalRamBytes * 0.1, 1*1024*1024*1024) : 0 },
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
      if (check.recommended === 0) continue;
      let isOk = false;
      if (check.name === 'max_connections') isOk = true;
      else if (check.name === 'log_autovacuum_min_duration') isOk = check.current === 0;
      else {
        const diff = Math.abs(check.current - check.recommended) / check.recommended;
        isOk = diff < 0.2;
      }
      if (!isOk) deviatedCount++;
    }

    return {
      high_dead_tuples: Number(summary.high_dead_tuples) || 0,
      invalid_indexes: Number(summary.invalid_indexes) || 0,
      deviated_params: deviatedCount,
      cache_hit_ratio: Number(summary.cache_hit_ratio) || 0,
    };
  }
}