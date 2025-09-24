"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FusionBrainModule = void 0;
const common_1 = require("@nestjs/common");
const fusionbrain_service_1 = require("./fusionbrain.service");
let FusionBrainModule = class FusionBrainModule {
};
exports.FusionBrainModule = FusionBrainModule;
exports.FusionBrainModule = FusionBrainModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        providers: [fusionbrain_service_1.FusionBrainService],
        exports: [fusionbrain_service_1.FusionBrainService],
    })
], FusionBrainModule);
//# sourceMappingURL=fusionbrain.module.js.map