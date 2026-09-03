import { OnModuleInit, OnModuleDestroy } from '@nestjs/common';
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
export interface CreateConnectionDto {
    description: string;
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}
export declare class DatabaseService implements OnModuleInit, OnModuleDestroy {
    private configService;
    private pools;
    private currentId;
    private readonly logger;
    private readonly envPath;
    private configs;
    constructor(configService: ConfigService);
    private reloadEnvFile;
    onModuleInit(): Promise<void>;
    onModuleDestroy(): Promise<void>;
    private getAllConfigs;
    private findNextId;
    private readEnvFile;
    private writeEnvFile;
    private reloadPools;
    addConnection(dto: CreateConnectionDto): Promise<DbConfig>;
    updateConnection(id: string, dto: Partial<CreateConnectionDto>): Promise<DbConfig>;
    testConnection(host: string, port: number, database: string, user: string, password: string): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteConnection(id: string): Promise<void>;
    getCurrentPool(): Pool;
    getPoolById(id: string): Pool | undefined;
    getConnectionList(): {
        id: string;
        description: string;
        host: string;
        port: number;
        database: string;
    }[];
    switchTo(id: string): {
        id: string;
        description: string;
    };
    getCurrentId(): string | null;
    query<T = any>(text: string, params?: any[]): Promise<T[]>;
}
