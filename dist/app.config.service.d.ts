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
export declare class AppConfigService {
    private configService;
    constructor(configService: ConfigService);
    get allPostgresConfigs(): IPostgresqlConfig[];
    get postgresConfig(): IPostgresqlConfig;
}
export default AppConfigService;
