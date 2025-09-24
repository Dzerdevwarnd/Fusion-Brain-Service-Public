"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinioService = void 0;
const common_1 = require("@nestjs/common");
const minio_1 = require("minio");
let MinioService = class MinioService {
    constructor() {
        this.bucket = process.env.MINIO_BUCKET || 'images';
    }
    async onModuleInit() {
        this.client = new minio_1.Client({
            endPoint: process.env.MINIO_ENDPOINT || 'localhost',
            port: Number(process.env.MINIO_PORT || 9000),
            useSSL: (process.env.MINIO_USE_SSL || 'false') === 'true',
            accessKey: process.env.MINIO_ACCESS_KEY || 'minioadmin',
            secretKey: process.env.MINIO_SECRET_KEY || 'minioadmin',
        });
        const exists = await this.client.bucketExists(this.bucket).catch(() => false);
        if (!exists) {
            await this.client.makeBucket(this.bucket, '');
        }
    }
    async putObject(objectName, data, contentType) {
        await this.client.putObject(this.bucket, objectName, data, data.length, {
            'Content-Type': contentType || 'application/octet-stream',
        });
        return this.getObjectUrl(objectName);
    }
    async getObject(objectName) {
        return this.client.getObject(this.bucket, objectName);
    }
    getObjectUrl(objectName) {
        const protocol = (process.env.MINIO_USE_SSL || 'false') === 'true' ? 'https' : 'http';
        return `${protocol}://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || 9000}/${this.bucket}/${objectName}`;
    }
};
exports.MinioService = MinioService;
exports.MinioService = MinioService = __decorate([
    (0, common_1.Injectable)()
], MinioService);
//# sourceMappingURL=minio.service.js.map