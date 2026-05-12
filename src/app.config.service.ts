import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface IPostgresqlConfig {
  id: string;
  description: string;
  type: string;
  username: string;
  password: string;
  host: string;
  port: number;
  database: string;
  synchronize: boolean;
  entities?: any[];
  extra: {
    connectionTimeoutMillis: number;
  };
}

@Injectable()
export class AppConfigService {
  constructor(private configService: ConfigService) {}

  /** Все найденные подключения из .env */
  get allPostgresConfigs(): IPostgresqlConfig[] {
    const configs: IPostgresqlConfig[] = [];
    // Ищем переменные вида POSTGRES1_HOST, POSTGRES2_HOST, ...
    for (let i = 1; i <= 20; i++) {
      const host = this.configService.get<string>(`POSTGRES${i}_HOST`);
      if (!host) continue; // закомментировано или отсутствует
      configs.push({
        id: `${i}`,
        description:
          this.configService.get<string>(`POSTGRES${i}_DESCRIPTION`) ||
          `База ${i}`,
        type: 'postgres',
        username: this.configService.get<string>(`POSTGRES${i}_USER`) || '',
        password: this.configService.get<string>(`POSTGRES${i}_PASSWORD`) || '',
        host,
        port:
          Number(this.configService.get<string>(`POSTGRES${i}_PORT`)) || 5432,
        database: this.configService.get<string>(`POSTGRES${i}_DATABASE`) || '',
        synchronize:
          this.configService.get<boolean>(`POSTGRES${i}_SYNCHRONIZE`) || false,
        extra: {
          connectionTimeoutMillis:
            this.configService.get<number>(`POSTGRES${i}_CONNECT_TIMEOUT_MS`) ||
            5000,
        },
      });
    }
    return configs;
  }

  /** Первое (или единственное) подключение — для совместимости */
  get postgresConfig(): IPostgresqlConfig {
    const configs = this.allPostgresConfigs;
    if (configs.length === 0) {
      throw new Error('Не найдено ни одного подключения PostgreSQL в .env');
    }
    return configs[0];
  }
}

export default AppConfigService;
