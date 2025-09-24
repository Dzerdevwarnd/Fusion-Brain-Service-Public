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
exports.ImagesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const create_image_dto_1 = require("./dto/create-image.dto");
const get_file_dto_1 = require("./dto/get-file.dto");
const images_service_1 = require("./images.service");
let ImagesController = class ImagesController {
    constructor(images) {
        this.images = images;
    }
    async styles() {
        return this.images.getStyles();
    }
    async availability() {
        return this.images.checkAvailability();
    }
    async create(dto) {
        return this.images.create(dto.prompt, dto.style);
    }
    async getFile(id, query, res) {
        const { stream, filename } = await this.images.getFile(id, query.type);
        res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
        return new common_1.StreamableFile(stream);
    }
    async list(page, pageSize) {
        return this.images.list(Number(page) || 1, Number(pageSize) || 20);
    }
};
exports.ImagesController = ImagesController;
__decorate([
    (0, common_1.Get)('styles'),
    (0, swagger_1.ApiOperation)({ summary: 'Get available styles for validation' }),
    (0, swagger_1.ApiOkResponse)({ description: 'List of available styles' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "styles", null);
__decorate([
    (0, common_1.Get)('availability'),
    (0, swagger_1.ApiOperation)({ summary: 'Check Fusion Brain pipeline availability' }),
    (0, swagger_1.ApiOkResponse)({ description: 'Pipeline availability status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "availability", null);
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create image generation task' }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Task created' }),
    (0, swagger_1.ApiBadRequestResponse)({ description: 'Validation error' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_image_dto_1.CreateImageDto]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(':id/file'),
    (0, swagger_1.ApiOperation)({ summary: 'Get generated image file' }),
    (0, swagger_1.ApiQuery)({ name: 'type', enum: ['original', 'thumbnail'], required: true }),
    (0, swagger_1.ApiOkResponse)({ description: 'Image file stream' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)()),
    __param(2, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, get_file_dto_1.GetFileDto, Object]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "getFile", null);
__decorate([
    (0, common_1.Get)('thumbnails'),
    (0, swagger_1.ApiOperation)({ summary: 'List images with thumbnail and original URLs' }),
    (0, swagger_1.ApiOkResponse)({ description: 'List of images with pagination' }),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], ImagesController.prototype, "list", null);
exports.ImagesController = ImagesController = __decorate([
    (0, swagger_1.ApiTags)('images'),
    (0, common_1.Controller)('images'),
    __metadata("design:paramtypes", [images_service_1.ImagesService])
], ImagesController);
//# sourceMappingURL=images.controller.js.map