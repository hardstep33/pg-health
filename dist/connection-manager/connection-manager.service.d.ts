import { DatabaseService, CreateConnectionDto } from '../database/database.service';
export declare class ConnectionManagerService {
    private dbService;
    constructor(dbService: DatabaseService);
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
    getCurrentDataSource(): {
        query: (text: string, params?: any[]) => Promise<any[]>;
    };
    getCurrentId(): string | null;
    addConnection(dto: CreateConnectionDto): Promise<import("../database/database.service").DbConfig>;
    updateConnection(id: string, dto: Partial<CreateConnectionDto>): Promise<import("../database/database.service").DbConfig>;
    testConnection(dto: CreateConnectionDto): Promise<{
        success: boolean;
        message: string;
    }>;
    deleteConnection(id: string): Promise<void>;
}
