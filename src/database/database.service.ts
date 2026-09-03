import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

export interface DbConfig {
  id: string;
  description: string;
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

export interface CreateConnectionDto {
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
  private readonly envPath = path.join(process.cwd(), '.env');
  private configs: DbConfig[] = [];

  constructor(private configService: ConfigService) {}

  /**
   * Перечитывает .env файл и обновляет переменные окружения в процессе
   */
  private reloadEnvFile() {
    if (fs.existsSync(this.envPath)) {
      const envConfig = dotenv.parse(fs.readFileSync(this.envPath));
      // Обновляем process.env новыми значениями
      for (const key in envConfig) {
        process.env[key] = envConfig[key];
      }
      // Также обновляем внутренний кэш ConfigService
      // Это необходимо для работы в Docker, где переменные окружения не перезагружаются автоматически
      this.logger.log(`Reloaded .env file with ${Object.keys(envConfig).length} variables`);
    }
  }

  async onModuleInit() {
    await this.reloadPools();
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

  private findNextId(): string {
    const existingIds = this.getAllConfigs().map(c => parseInt(c.id, 10));
    for (let i = 1; i <= 20; i++) {
      if (!existingIds.includes(i)) return `${i}`;
    }
    throw new Error('Максимальное количество подключений достигнуто (20)');
  }

  private readEnvFile(): Record<string, string> {
    const envVars: Record<string, string> = {};
    if (fs.existsSync(this.envPath)) {
      const content = fs.readFileSync(this.envPath, 'utf-8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=');
          if (key) {
            envVars[key.trim()] = valueParts.join('=').trim();
          }
        }
      });
    }
    return envVars;
  }

  private writeEnvFile(envVars: Record<string, string>) {
    const content = Object.entries(envVars)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n') + '\n';
    fs.writeFileSync(this.envPath, content, 'utf-8');
  }

  private async reloadPools() {
    this.configs = this.getAllConfigs();
    for (const cfg of this.configs) {
      if (!this.pools.has(cfg.id)) {
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
  }

  async addConnection(dto: CreateConnectionDto): Promise<DbConfig> {
    const id = this.findNextId();
    const prefix = `POSTGRES${id}`;
    
    // Чтение и обновление .env файла
    const envVars = this.readEnvFile();
    envVars[`${prefix}_DESCRIPTION`] = dto.description;
    envVars[`${prefix}_HOST`] = dto.host;
    envVars[`${prefix}_PORT`] = String(dto.port);
    envVars[`${prefix}_DATABASE`] = dto.database;
    envVars[`${prefix}_USER`] = dto.user;
    envVars[`${prefix}_PASSWORD`] = dto.password;
    this.writeEnvFile(envVars);

    // Перечитываем .env файл и обновляем переменные окружения
    this.reloadEnvFile();

    // Создаем пул для нового подключения
    const pool = new Pool({
      host: dto.host,
      port: dto.port,
      database: dto.database,
      user: dto.user,
      password: dto.password,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 10,
    });

    try {
      const client = await pool.connect();
      client.release();
      this.pools.set(id, pool);
      // Обновляем configs из getAllConfigs(), чтобы получить актуальные данные
      this.configs = this.getAllConfigs();
      if (!this.currentId) this.currentId = id;

      this.logger.log(`Connection added: ${dto.description} (${id})`);
      return this.configs.find(c => c.id === id)!;
    } catch (err) {
      await pool.end();
      this.pools.delete(id);
      throw err;
    }
  }

  async updateConnection(id: string, dto: Partial<CreateConnectionDto>): Promise<DbConfig> {
    const existingIndex = this.configs.findIndex(c => c.id === id);
    if (existingIndex === -1) throw new Error(`Connection ${id} not found`);
    const existing = this.configs[existingIndex];

    const prefix = `POSTGRES${id}`;
    
    // Чтение и обновление .env файла
    const envVars = this.readEnvFile();
    if (dto.description !== undefined) envVars[`${prefix}_DESCRIPTION`] = dto.description;
    if (dto.host !== undefined) envVars[`${prefix}_HOST`] = dto.host;
    if (dto.port !== undefined) envVars[`${prefix}_PORT`] = String(dto.port);
    if (dto.database !== undefined) envVars[`${prefix}_DATABASE`] = dto.database;
    if (dto.user !== undefined) envVars[`${prefix}_USER`] = dto.user;
    if (dto.password !== undefined) envVars[`${prefix}_PASSWORD`] = dto.password;
    this.writeEnvFile(envVars);

    // Перечитываем .env файл и обновляем переменные окружения
    this.reloadEnvFile();

    // Закрываем старый пул и создаем новый
    const oldPool = this.pools.get(id);
    if (oldPool) {
      await oldPool.end();
      this.pools.delete(id);
    }

    const updatedConfig: DbConfig = {
      id,
      description: dto.description ?? existing.description,
      host: dto.host ?? existing.host,
      port: dto.port ?? existing.port,
      database: dto.database ?? existing.database,
      user: dto.user ?? existing.user,
      password: dto.password ?? existing.password,
    };

    const pool = new Pool({
      host: updatedConfig.host,
      port: updatedConfig.port,
      database: updatedConfig.database,
      user: updatedConfig.user,
      password: updatedConfig.password,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
      max: 10,
    });

    try {
      const client = await pool.connect();
      client.release();
      this.pools.set(id, pool);
      // Обновляем configs из getAllConfigs(), чтобы получить актуальные данные
      this.configs = this.getAllConfigs();

      this.logger.log(`Connection updated: ${updatedConfig.description} (${id})`);
      return updatedConfig;
    } catch (err) {
      await pool.end();
      throw err;
    }
  }

  async testConnection(host: string, port: number, database: string, user: string, password: string): Promise<{ success: boolean; message: string }> {
    const pool = new Pool({
      host,
      port,
      database,
      user,
      password,
      connectionTimeoutMillis: 5000,
    });

    try {
      const client = await pool.connect();
      client.release();
      await pool.end();
      return { success: true, message: 'Соединение успешно' };
    } catch (err) {
      await pool.end();
      return { success: false, message: err.message };
    }
  }

  async deleteConnection(id: string): Promise<void> {
    const existingIndex = this.configs.findIndex(c => c.id === id);
    if (existingIndex === -1) throw new Error(`Connection ${id} not found`);
    const existing = this.configs[existingIndex];

    const prefix = `POSTGRES${id}`;
    
    // Чтение и обновление .env файла - удаляем все переменные для этого подключения
    const envVars = this.readEnvFile();
    delete envVars[`${prefix}_DESCRIPTION`];
    delete envVars[`${prefix}_HOST`];
    delete envVars[`${prefix}_PORT`];
    delete envVars[`${prefix}_DATABASE`];
    delete envVars[`${prefix}_USER`];
    delete envVars[`${prefix}_PASSWORD`];
    this.writeEnvFile(envVars);

    // Перечитываем .env файл и обновляем переменные окружения
    this.reloadEnvFile();

    // Закрываем пул
    const oldPool = this.pools.get(id);
    if (oldPool) {
      await oldPool.end();
      this.pools.delete(id);
    }

    // Обновляем configs
    this.configs = this.getAllConfigs();
    
    // Если удалили текущее подключение, переключаемся на первое доступное
    if (this.currentId === id) {
      this.currentId = this.configs.length > 0 ? this.configs[0].id : null;
    }

    this.logger.log(`Connection deleted: ${existing.description} (${id})`);
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