import { ConnectionManagerService } from './connection-manager.service';
export interface CreateConnectionDto {
    description: string;
    host: string;
    port: number;
    database: string;
    user: string;
    password: string;
}
export declare class ConnectionManagerController {
    private connectionManager;
    constructor(connectionManager: ConnectionManagerService);
    list(): {
        id: string;
        description: string;
        host: string;
        port: number;
        database: string;
    }[];
    switch(id: string): {
        id: string;
        description: string;
    };
    add(dto: CreateConnectionDto): Promise<import("../database/database.service").DbConfig>;
    update(dto: Partial<CreateConnectionDto>, id: string): Promise<import("../database/database.service").DbConfig>;
    test(dto: CreateConnectionDto): Promise<{
        success: boolean;
        message: string;
    }>;
}
