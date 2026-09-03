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
exports.ConnectionManagerController = void 0;
const common_1 = require("@nestjs/common");
const connection_manager_service_1 = require("./connection-manager.service");
let ConnectionManagerController = class ConnectionManagerController {
    constructor(connectionManager) {
        this.connectionManager = connectionManager;
    }
    list() {
        return this.connectionManager.getConnectionList();
    }
    switch(id) {
        return this.connectionManager.switchTo(id);
    }
    async add(dto) {
        return this.connectionManager.addConnection(dto);
    }
    async update(dto, id) {
        return this.connectionManager.updateConnection(id, dto);
    }
    async test(dto) {
        return this.connectionManager.testConnection(dto);
    }
};
exports.ConnectionManagerController = ConnectionManagerController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ConnectionManagerController.prototype, "list", null);
__decorate([
    (0, common_1.Post)('switch'),
    __param(0, (0, common_1.Body)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ConnectionManagerController.prototype, "switch", null);
__decorate([
    (0, common_1.Post)('add'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConnectionManagerController.prototype, "add", null);
__decorate([
    (0, common_1.Post)('update/:id'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Body)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ConnectionManagerController.prototype, "update", null);
__decorate([
    (0, common_1.Post)('test'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ConnectionManagerController.prototype, "test", null);
exports.ConnectionManagerController = ConnectionManagerController = __decorate([
    (0, common_1.Controller)('api/connections'),
    __metadata("design:paramtypes", [connection_manager_service_1.ConnectionManagerService])
], ConnectionManagerController);
//# sourceMappingURL=connection-manager.controller.js.map