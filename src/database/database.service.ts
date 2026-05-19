import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

export interface DbConfig {
  id: string;
  description: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private pools = new Map<string, Pool>();
  private currentId: string | null = null;
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const configs = this.getAllConfigs();
    for (const cfg of configs) {
      const pool = new Pool({
        host: cfg.host,
        port: cfg.port,
        database: cfg.database,
        user: cfg.user,
        password: cfg.password,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
        max: 10,
      });
      try {
        const client = await pool.connect();
        client.release();
        this.pools.set(cfg.id, pool);
        this.logger.log(`Pool created for ${cfg.description} (${cfg.id})`);
        if (!this.currentId) this.currentId = cfg.id;
      } catch (err) {
        this.logger.error(`Failed to connect to ${cfg.description}: ${err.message}`);
      }
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing all database pools...');
    const closePromises = Array.from(this.pools.values()).map(pool => pool.end());
    await Promise.allSettled(closePromises);
    this.logger.log('All pools closed');
  }

  private getAllConfigs(): DbConfig[] {
    const configs: DbConfig[] = [];
    for (let i = 1; i <= 20; i++) {
      const host = this.configService.get<string>(`POSTGRES${i}_HOST`);
      if (!host) continue;
      configs.push({
        id: `${i}`,
        description: this.configService.get<string>(`POSTGRES${i}_DESCRIPTION`) || `DB ${i}`,
        host,
        port: Number(this.configService.get<string>(`POSTGRES${i}_PORT`)) || 5432,
        database: this.configService.get<string>(`POSTGRES${i}_DATABASE`) || '',
        user: this.configService.get<string>(`POSTGRES${i}_USER`) || '',
        password: this.configService.get<string>(`POSTGRES${i}_PASSWORD`) || '',
      });
    }
    return configs;
  }

  getCurrentPool(): Pool {
    if (!this.currentId) throw new Error('No active connection');
    const pool = this.pools.get(this.currentId);
    if (!pool) throw new Error(`Pool for id ${this.currentId} not found`);
    return pool;
  }

  getPoolById(id: string): Pool | undefined {
    return this.pools.get(id);
  }

  getConnectionList() {
    return this.getAllConfigs().map(c => ({
      id: c.id,
      description: c.description,
      host: c.host,
      port: c.port,
      database: c.database,
    }));
  }

  switchTo(id: string): { id: string; description: string } {
    const cfg = this.getAllConfigs().find(c => c.id === id);
    if (!cfg) throw new Error(`Connection ${id} not found`);
    if (!this.pools.has(id)) throw new Error(`Pool for ${id} not initialized`);
    this.currentId = id;
    return { id: cfg.id, description: cfg.description };
  }

  getCurrentId(): string | null {
    return this.currentId;
  }

  async query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const pool = this.getCurrentPool();
    const client = await pool.connect();
    try {
      const res = await client.query(text, params);
      return res.rows;
    } finally {
      client.release();
    }
  }
}