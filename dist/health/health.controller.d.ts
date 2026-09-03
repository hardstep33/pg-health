import { DatabaseService } from '../database/database.service';
export declare class HealthController {
    private dbService;
    constructor(dbService: DatabaseService);
    check(): Promise<{
        status: string;
        timestamp: string;
        message?: undefined;
    } | {
        status: string;
        message: any;
        timestamp?: undefined;
    }>;
}
