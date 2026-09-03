export declare class SqlQuery {
    static getVersion(): string;
    static getOsVersion(): string;
    static getRamSize(): string;
    static getCpuSize(): string;
    static getOsDiskIOWait(): string;
    static getDiskPercentRead(): string;
    static getDBIOInfo(): string;
    static getTablesCount(): string;
    static getDbSizeAll(): string;
    static getDbTop10Tables(): string;
    static getDbDeadTuples(): string;
    static getDbInvalidIndexes(): string;
    static getDbTopDiskReadQuery(): string;
    static getPostgresParams(): string;
    static getActiveLocks(): string;
    static getLongRunningQueries(): string;
    static getIdleInTransaction(): string;
    static getIndexStats(): string;
    static getConnectionStats(): string;
    static getQPSFallback(): string;
    static getReplicationStats(): string;
    static getReplicationSlots(): string;
    static getDashboardSummary(): string;
    static getParamsSummary(): string;
}
