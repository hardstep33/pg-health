"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionManagerModule = void 0;
const common_1 = require("@nestjs/common");
const connection_manager_service_1 = require("./connection-manager.service");
const connection_manager_controller_1 = require("./connection-manager.controller");
const app_config_module_1 = require("../app-config.module");
let ConnectionManagerModule = class ConnectionManagerModule {
};
exports.ConnectionManagerModule = ConnectionManagerModule;
exports.ConnectionManagerModule = ConnectionManagerModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [app_config_module_1.AppConfigModule],
        controllers: [connection_manager_controller_1.ConnectionManagerController],
        providers: [connection_manager_service_1.ConnectionManagerService],
        exports: [connection_manager_service_1.ConnectionManagerService],
    })
], ConnectionManagerModule);
//# sourceMappingURL=connection-manager.module.js.map