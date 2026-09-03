import { PostgresDataService } from './postgres-data.service';
export declare class PostgresDataController {
    private readonly postgresDataService;
    constructor(postgresDataService: PostgresDataService);
    getDbSelected(): Promise<{
        selected: string;
    }>;
    getDbVersion(): Promise<any[]>;
    getOsVersion(): Promise<any[]>;
    getRamSize(): Promise<any[]>;
    getCpuSize(): Promise<any[]>;
    getOsDiskIOWait(): Promise<any[]>;
    getDiskPercentRead(): Promise<any[]>;
    getDBIOInfo(): Promise<any[]>;
    getTablesCount(): Promise<any[]>;
    getDbSizeAll(): Promise<any[]>;
    getDbTop10Tables(): Promise<any[]>;
    getDbDeadTuples(): Promise<any[]>;
    getDbInvalidIndexes(): Promise<any[]>;
    getDbTopDiskReadQuery(): Promise<any[]>;
    getPostgresParams(): Promise<any[]>;
    getActiveLocks(): Promise<any[]>;
    getLongRunningQueries(threshold?: string): Promise<any[]>;
    getIdleInTransaction(): Promise<any[]>;
    getIndexStats(): Promise<any[]>;
    getConnectionStats(): Promise<any[]>;
    getQPS(): Promise<{
        qps: number;
    }[] | {
        exception: any;
    }[]>;
    getReplicationStats(): Promise<any[]>;
    getReplicationSlots(): Promise<any[]>;
    getDashboardSummary(): Promise<{
        high_dead_tuples: number;
        invalid_indexes: number;
        deviated_params: number;
        cache_hit_ratio: number;
    }>;
    executeCustomQuery(query: string): Promise<{
        rows: any[];
        rowCount: number;
        error?: undefined;
    } | {
        error: any;
        rows?: undefined;
        rowCount?: undefined;
    }>;
}
