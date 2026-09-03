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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostgresDataController = void 0;
const common_1 = require("@nestjs/common");
const postgres_data_service_1 = require("./postgres-data.service");
const auth_guard_1 = require("../auth/auth.guard");
let PostgresDataController = class PostgresDataController {
    constructor(postgresDataService) {
        this.postgresDataService = postgresDataService;
    }
    getDbSelected() {
        return this.postgresDataService.getDbSelected();
    }
    async getDbVersion() {
        return this.postgresDataService.getDbVersion();
    }
    async getOsVersion() {
        return this.postgresDataService.getOsVersion();
    }
    async getRamSize() {
        return this.postgresDataService.getRamSize();
    }
    async getCpuSize() {
        return this.postgresDataService.getCpuSize();
    }
    async getOsDiskIOWait() {
        return this.postgresDataService.getOsDiskIOWait();
    }
    async getDiskPercentRead() {
        return this.postgresDataService.getDiskPercentRead();
    }
    async getDBIOInfo() {
        return this.postgresDataService.getDBIOInfo();
    }
    async getTablesCount() {
        return this.postgresDataService.getTablesCount();
    }
    async getDbSizeAll() {
        return this.postgresDataService.getDbSizeAll();
    }
    async getDbTop10Tables() {
        return this.postgresDataService.getDbTop10Tables();
    }
    async getDbDeadTuples() {
        return this.postgresDataService.getDbDeadTuples();
    }
    async getDbInvalidIndexes() {
        return this.postgresDataService.getDbInvalidIndexes();
    }
    async getDbTopDiskReadQuery() {
        return this.postgresDataService.getDbTopDiskReadQuery();
    }
    async getPostgresParams() {
        return this.postgresDataService.getPostgresParams();
    }
    async getActiveLocks() {
        return this.postgresDataService.getActiveLocks();
    }
    async getLongRunningQueries(threshold) {
        let thresholdSeconds = threshold ? parseInt(threshold, 10) : 30;
        if (thresholdSeconds > 30) {
            thresholdSeconds = 30;
        }
        return this.postgresDataService.getLongRunningQueries(thresholdSeconds);
    }
    async getIdleInTransaction() {
        return this.postgresDataService.getIdleInTransaction();
    }
    async getIndexStats() {
        return this.postgresDataService.getIndexStats();
    }
    async getConnectionStats() {
        return this.postgresDataService.getConnectionStats();
    }
    async getQPS() {
        return this.postgresDataService.getQPS();
    }
    async getReplicationStats() {
        return this.postgresDataService.getReplicationStats();
    }
    async getReplicationSlots() {
        return this.postgresDataService.getReplicationSlots();
    }
    async getDashboardSummary() {
        return this.postgresDataService.getDashboardSummary();
    }
    async executeCustomQuery(query) {
        return this.postgresDataService.executeCustomQuery(query);
    }
};
exports.PostgresDataController = PostgresDataController;
__decorate([
    (0, common_1.Get)('/db/selected'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PostgresDataController.prototype, "getDbSelected", null);
__decorate([
    (0, common_1.Get)('/db/version'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getDbVersion", null);
__decorate([
    (0, common_1.Get)('/os/version'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getOsVersion", null);
__decorate([
    (0, common_1.Get)('/os/ram'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getRamSize", null);
__decorate([
    (0, common_1.Get)('/os/cpu'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getCpuSize", null);
__decorate([
    (0, common_1.Get)('/os/disk/io_wait'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getOsDiskIOWait", null);
__decorate([
    (0, common_1.Get)('/disk/read_percent'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getDiskPercentRead", null);
__decorate([
    (0, common_1.Get)('/db/total_io'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getDBIOInfo", null);
__decorate([
    (0, common_1.Get)('/db/tables_count'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getTablesCount", null);
__decorate([
    (0, common_1.Get)('/db/size_all'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getDbSizeAll", null);
__decorate([
    (0, common_1.Get)('/db/top10-tables'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getDbTop10Tables", null);
__decorate([
    (0, common_1.Get)('/db/dead_tuples_top_50'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getDbDeadTuples", null);
__decorate([
    (0, common_1.Get)('/db/invalid-indexes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getDbInvalidIndexes", null);
__decorate([
    (0, common_1.Get)('/db/top-disk-read-queries'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getDbTopDiskReadQuery", null);
__decorate([
    (0, common_1.Get)('/db/params'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getPostgresParams", null);
__decorate([
    (0, common_1.Get)('/db/active-locks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getActiveLocks", null);
__decorate([
    (0, common_1.Get)('/db/long-running-queries'),
    __param(0, (0, common_1.Query)('threshold')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getLongRunningQueries", null);
__decorate([
    (0, common_1.Get)('/db/idle-in-transaction'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getIdleInTransaction", null);
__decorate([
    (0, common_1.Get)('/db/index-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getIndexStats", null);
__decorate([
    (0, common_1.Get)('/db/connection-stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getConnectionStats", null);
__decorate([
    (0, common_1.Get)('/db/qps'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getQPS", null);
__decorate([
    (0, common_1.Get)('/replication/stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getReplicationStats", null);
__decorate([
    (0, common_1.Get)('/replication/slots'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getReplicationSlots", null);
__decorate([
    (0, common_1.Get)('/db/dashboard-summary'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "getDashboardSummary", null);
__decorate([
    (0, common_1.Post)('/custom-query'),
    __param(0, (0, common_1.Body)('query')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PostgresDataController.prototype, "executeCustomQuery", null);
exports.PostgresDataController = PostgresDataController = __decorate([
    (0, common_1.Controller)('postgres-data'),
    (0, common_1.UseGuards)(auth_guard_1.AuthGuard),
    __metadata("design:paramtypes", [postgres_data_service_1.PostgresDataService])
], PostgresDataController);
//# sourceMappingURL=postgres-data.controller.js.map