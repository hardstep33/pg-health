import { Injectable, OnModuleInit } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AppConfigService, IPostgresqlConfig } from '../app.config.service';

@Injectable()
export class ConnectionManagerService implements OnModuleInit {
  private dataSources = new Map<string, DataSource>();
  private currentId: string | null = null;

  constructor(private appConfigService: AppConfigService) {}

  async onModuleInit() {
    const configs = this.appConfigService.allPostgresConfigs;
    for (const cfg of configs) {
      const ds = new DataSource({
        type: 'postgres',
        host: cfg.host,
        port: cfg.port,
        username: cfg.username,
        password: cfg.password,
        database: cfg.database,
        synchronize: false,
        extra: cfg.extra,
      });
      try {
        await ds.initialize();
        this.dataSources.set(cfg.id, ds);
        console.log(`Подключено: ${cfg.description} (id=${cfg.id})`);
        if (!this.currentId) {
          this.currentId = cfg.id;
        }
      } catch (err) {
        console.error(`Ошибка подключения к ${cfg.description}:`, err.message);
      }
    }
  }

  /** Список доступных подключений */
  getConnectionList() {
    return this.appConfigService.allPostgresConfigs.map((cfg) => ({
      id: cfg.id,
      description: cfg.description,
      host: cfg.host,
      port: cfg.port,
      database: cfg.database,
    }));
  }

  /** Получить текущий DataSource */
  getCurrentDataSource(): DataSource {
    if (!this.currentId) throw new Error('Нет активного подключения');
    const ds = this.dataSources.get(this.currentId);
    if (!ds) throw new Error(`DataSource с id=${this.currentId} не найден`);
    return ds;
  }

  /** Получить DataSource по id */
  getDataSourceById(id: string): DataSource | undefined {
    return this.dataSources.get(id);
  }

  /** Переключить активное подключение */
  switchTo(id: string): { id: string; description: string } {
    const cfg = this.appConfigService.allPostgresConfigs.find(
      (c) => c.id === id,
    );
    if (!cfg) throw new Error(`Подключение с id=${id} не найдено`);
    const ds = this.dataSources.get(id);
    if (!ds) throw new Error(`DataSource с id=${id} не инициализирован`);
    this.currentId = id;
    return { id: cfg.id, description: cfg.description };
  }

  /** Текущий id */
  getCurrentId(): string | null {
    return this.currentId;
  }
}
