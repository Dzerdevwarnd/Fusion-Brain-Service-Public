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
exports.ImagesService = void 0;
const common_1 = require("@nestjs/common");
const fusionbrain_service_1 = require("../fusionbrain/fusionbrain.service");
const minio_service_1 = require("../minio/minio.service");
const prisma_service_1 = require("../prisma/prisma.service");
let ImagesService = class ImagesService {
    constructor(prisma, fusionBrain, minio) {
        this.prisma = prisma;
        this.fusionBrain = fusionBrain;
        this.minio = minio;
    }
    async getSharp() {
        const mod = await Promise.resolve().then(() => require('sharp'));
        return mod.default || mod;
    }
    async getStyles() {
        return this.fusionBrain.getValidStyles();
    }
    async checkAvailability() {
        return this.fusionBrain.checkAvailability();
    }
    async create(prompt, style) {
        const image = await this.prisma.image.create({ data: { prompt, style, status: 'PENDING' } });
        void this.generateAndStore(image.id, prompt, style);
        return { id: image.id, status: 'PENDING' };
    }
    async generateAndStore(id, prompt, style) {
        try {
            await this.prisma.image.update({ where: { id }, data: { status: 'PROCESSING' } });
            const taskId = await this.fusionBrain.requestImage(prompt, style);
            const buffer = await this.fusionBrain.waitForResult(taskId);
            const sharp = await this.getSharp();
            const sharpImg = sharp(buffer, { failOnError: false });
            const metadata = await sharpImg.metadata();
            const format = metadata.format || 'png';
            const originalKey = `${id}/original.${format}`;
            const thumbnailBuffer = await sharp(buffer).resize(128, 128, { fit: 'cover' }).webp({ quality: 90 }).toBuffer();
            const thumbnailKey = `${id}/thumbnail.webp`;
            await this.minio.putObject(originalKey, buffer, `image/${format}`);
            await this.minio.putObject(thumbnailKey, thumbnailBuffer, 'image/webp');
            await this.prisma.image.update({
                where: { id },
                data: { status: 'READY', originalKey, thumbnailKey },
            });
        }
        catch (err) {
            await this.prisma.image.update({
                where: { id },
                data: { status: 'FAILED', errorMessage: String((err === null || err === void 0 ? void 0 : err.message) || err) },
            });
        }
    }
    async getFile(id, type) {
        const image = await this.prisma.image.findUnique({ where: { id } });
        if (!image)
            throw new common_1.NotFoundException('Image not found');
        if (image.status !== 'READY')
            throw new common_1.BadRequestException('Image not ready');
        const key = type === 'original' ? image.originalKey : image.thumbnailKey;
        if (!key)
            throw new common_1.NotFoundException('File not found');
        const stream = await this.minio.getObject(key);
        return { stream, filename: key.split('/').pop() };
    }
    async list(page = 1, pageSize = 20) {
        page = Math.max(1, Math.floor(page));
        pageSize = Math.min(100, Math.max(1, Math.floor(pageSize)));
        const [items, total] = await Promise.all([
            this.prisma.image.findMany({
                take: pageSize,
                skip: (page - 1) * pageSize,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.image.count(),
        ]);
        return {
            page,
            pageSize,
            total,
            items: items.map(i => ({
                id: i.id,
                status: i.status,
                prompt: i.prompt,
                style: i.style,
                thumbnailUrl: i.thumbnailKey ? this.minio.getObjectUrl(i.thumbnailKey) : null,
                originalUrl: i.originalKey ? this.minio.getObjectUrl(i.originalKey) : null,
                createdAt: i.createdAt,
            })),
        };
    }
};
exports.ImagesService = ImagesService;
exports.ImagesService = ImagesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        fusionbrain_service_1.FusionBrainService,
        minio_service_1.MinioService])
], ImagesService);
//# sourceMappingURL=images.service.js.map