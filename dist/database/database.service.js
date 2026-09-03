"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const pg_1 = require("pg");
const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
let DatabaseService = DatabaseService_1 = class DatabaseService {
    constructor(configService) {
        this.configService = configService;
        this.pools = new Map();
        this.currentId = null;
        this.logger = new common_1.Logger(DatabaseService_1.name);
        this.envPath = path.join(process.cwd(), '.env');
        this.configs = [];
    }
    reloadEnvFile() {
        if (fs.existsSync(this.envPath)) {
            const envConfig = dotenv.parse(fs.readFileSync(this.envPath));
            for (const key in envConfig) {
                process.env[key] = envConfig[key];
            }
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
    getAllConfigs() {
        const configs = [];
        for (let i = 1; i <= 20; i++) {
            const host = this.configService.get(`POSTGRES${i}_HOST`);
            if (!host)
                continue;
            configs.push({
                id: `${i}`,
                description: this.configService.get(`POSTGRES${i}_DESCRIPTION`) || `DB ${i}`,
                host,
                port: Number(this.configService.get(`POSTGRES${i}_PORT`)) || 5432,
                database: this.configService.get(`POSTGRES${i}_DATABASE`) || '',
                user: this.configService.get(`POSTGRES${i}_USER`) || '',
                password: this.configService.get(`POSTGRES${i}_PASSWORD`) || '',
            });
        }
        return configs;
    }
    findNextId() {
        const existingIds = this.getAllConfigs().map(c => parseInt(c.id, 10));
        for (let i = 1; i <= 20; i++) {
            if (!existingIds.includes(i))
                return `${i}`;
        }
        throw new Error('Максимальное количество подключений достигнуто (20)');
    }
    readEnvFile() {
        const envVars = {};
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
    writeEnvFile(envVars) {
        const content = Object.entries(envVars)
            .map(([key, value]) => `${key}=${value}`)
            .join('\n') + '\n';
        fs.writeFileSync(this.envPath, content, 'utf-8');
    }
    async reloadPools() {
        this.configs = this.getAllConfigs();
        for (const cfg of this.configs) {
            if (!this.pools.has(cfg.id)) {
                const pool = new pg_1.Pool({
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
                    if (!this.currentId)
                        this.currentId = cfg.id;
                }
                catch (err) {
                    this.logger.error(`Failed to connect to ${cfg.description}: ${err.message}`);
                }
            }
        }
    }
    async addConnection(dto) {
        const id = this.findNextId();
        const prefix = `POSTGRES${id}`;
        const envVars = this.readEnvFile();
        envVars[`${prefix}_DESCRIPTION`] = dto.description;
        envVars[`${prefix}_HOST`] = dto.host;
        envVars[`${prefix}_PORT`] = String(dto.port);
        envVars[`${prefix}_DATABASE`] = dto.database;
        envVars[`${prefix}_USER`] = dto.user;
        envVars[`${prefix}_PASSWORD`] = dto.password;
        this.writeEnvFile(envVars);
        this.reloadEnvFile();
        const pool = new pg_1.Pool({
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
            this.configs = this.getAllConfigs();
            if (!this.currentId)
                this.currentId = id;
            this.logger.log(`Connection added: ${dto.description} (${id})`);
            return this.configs.find(c => c.id === id);
        }
        catch (err) {
            await pool.end();
            this.pools.delete(id);
            throw err;
        }
    }
    async updateConnection(id, dto) {
        const existingIndex = this.configs.findIndex(c => c.id === id);
        if (existingIndex === -1)
            throw new Error(`Connection ${id} not found`);
        const existing = this.configs[existingIndex];
        const prefix = `POSTGRES${id}`;
        const envVars = this.readEnvFile();
        if (dto.description !== undefined)
            envVars[`${prefix}_DESCRIPTION`] = dto.description;
        if (dto.host !== undefined)
            envVars[`${prefix}_HOST`] = dto.host;
        if (dto.port !== undefined)
            envVars[`${prefix}_PORT`] = String(dto.port);
        if (dto.database !== undefined)
            envVars[`${prefix}_DATABASE`] = dto.database;
        if (dto.user !== undefined)
            envVars[`${prefix}_USER`] = dto.user;
        if (dto.password !== undefined)
            envVars[`${prefix}_PASSWORD`] = dto.password;
        this.writeEnvFile(envVars);
        this.reloadEnvFile();
        const oldPool = this.pools.get(id);
        if (oldPool) {
            await oldPool.end();
            this.pools.delete(id);
        }
        const updatedConfig = {
            id,
            description: dto.description ?? existing.description,
            host: dto.host ?? existing.host,
            port: dto.port ?? existing.port,
            database: dto.database ?? existing.database,
            user: dto.user ?? existing.user,
            password: dto.password ?? existing.password,
        };
        const pool = new pg_1.Pool({
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
            this.configs = this.getAllConfigs();
            this.logger.log(`Connection updated: ${updatedConfig.description} (${id})`);
            return updatedConfig;
        }
        catch (err) {
            await pool.end();
            throw err;
        }
    }
    async testConnection(host, port, database, user, password) {
        const pool = new pg_1.Pool({
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
        }
        catch (err) {
            await pool.end();
            return { success: false, message: err.message };
        }
    }
    getCurrentPool() {
        if (!this.currentId)
            throw new Error('No active connection');
        const pool = this.pools.get(this.currentId);
        if (!pool)
            throw new Error(`Pool for id ${this.currentId} not found`);
        return pool;
    }
    getPoolById(id) {
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
    switchTo(id) {
        const cfg = this.getAllConfigs().find(c => c.id === id);
        if (!cfg)
            throw new Error(`Connection ${id} not found`);
        if (!this.pools.has(id))
            throw new Error(`Pool for ${id} not initialized`);
        this.currentId = id;
        return { id: cfg.id, description: cfg.description };
    }
    getCurrentId() {
        return this.currentId;
    }
    async query(text, params) {
        const pool = this.getCurrentPool();
        const client = await pool.connect();
        try {
            const res = await client.query(text, params);
            return res.rows;
        }
        finally {
            client.release();
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseService);
//# sourceMappingURL=database.service.js.map