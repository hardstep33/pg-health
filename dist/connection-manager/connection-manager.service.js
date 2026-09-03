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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManagerService = void 0;
const common_1 = require("@nestjs/common");
const database_service_1 = require("../database/database.service");
let ConnectionManagerService = class ConnectionManagerService {
    constructor(dbService) {
        this.dbService = dbService;
    }
    getConnectionList() {
        return this.dbService.getConnectionList();
    }
    switchTo(id) {
        return this.dbService.switchTo(id);
    }
    getCurrentDataSource() {
        return {
            query: (text, params) => this.dbService.query(text, params),
        };
    }
    getCurrentId() {
        return this.dbService.getCurrentId();
    }
    addConnection(dto) {
        return this.dbService.addConnection(dto);
    }
    updateConnection(id, dto) {
        return this.dbService.updateConnection(id, dto);
    }
    testConnection(dto) {
        return this.dbService.testConnection(dto.host, dto.port, dto.database, dto.user, dto.password);
    }
};
exports.ConnectionManagerService = ConnectionManagerService;
exports.ConnectionManagerService = ConnectionManagerService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [database_service_1.DatabaseService])
], ConnectionManagerService);
//# sourceMappingURL=connection-manager.service.js.map