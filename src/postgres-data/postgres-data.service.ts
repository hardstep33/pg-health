import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { SqlQuery } from './queries';
import { CacheService } from '../cache/cache.service';
import * as os from 'os';
import { promises as fs } from 'fs';

@Injectable()
export class PostgresDataService {
  constructor(
      private dbService: DatabaseService,
      private cacheService: CacheService,
  ) {}

  private async tryParse(query: string, params?: any[]) {
    try {
      const rows = await this.dbService.query(query, params);
      return rows;
    } catch (error: any) {
      return [{ exception: error.message }];
    }
  }

  // ---- Системные метрики (только RAM и CPU оставляем на Node.js, OS version возвращаем через SQL) ----
  async getOsVersion() {
    // Возвращаем версию ОС через SQL, как было изначально
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
    } catch (e) {
      // fallback
    }
    return [{ total_ram_gb: os.totalmem() / 1024 / 1024 / 1024 }];
  }

  async getCpuSize() {
    const cpus = os.cpus();
    return [{ cpu_cores: cpus.length }];
  }

  // ---- Остальные методы используют SQL (не трогаем) ----
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
    return this.cacheService.getOrSet('postgres_params', () => this.tryParse(SqlQuery.getPostgresParams()), 30000);
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
    const rows1 = await this.dbService.query(query);
    await new Promise(resolve => setTimeout(resolve, intervalMs));
    const rows2 = await this.dbService.query(query);
    const calls1 = rows1[0]?.total_calls || 0;
    const calls2 = rows2[0]?.total_calls || 0;
    const qps = (calls2 - calls1) / (intervalMs / 1000);
    return [{ qps: Math.max(0, Math.round(qps)) }];
  }
}