"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FusionBrainService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("axios");
const FormData = require("form-data");
class HttpFusionBrainClient {
    constructor(options) {
        this.baseUrl = options.baseUrl || 'https://api-key.fusionbrain.ai/';
        this.apiKey = options.apiKey;
        this.secretKey = options.secretKey;
        this.http = axios_1.default.create({ baseURL: this.baseUrl, responseType: 'json' });
    }
    get authHeaders() {
        return {
            'X-Key': `Key ${this.apiKey || ''}`,
            'X-Secret': `Secret ${this.secretKey || ''}`,
        };
    }
    async ensurePipelineId() {
        var _a;
        if (this.pipelineId)
            return this.pipelineId;
        const { data } = await this.http.get('key/api/v1/pipelines', { headers: this.authHeaders });
        this.pipelineId = Array.isArray(data) && data.length > 0 ? ((_a = data[0].id) !== null && _a !== void 0 ? _a : data[0].uuid) : undefined;
        if (!this.pipelineId)
            throw new Error('Pipeline id not found');
        return this.pipelineId;
    }
    async getStyles() {
        const urls = [
            'https://api-key.fusionbrain.ai/key/api/v1/pipeline/static/styles/api',
        ];
        for (const url of urls) {
            try {
                const { data } = await axios_1.default.get(url, { responseType: 'json', headers: this.authHeaders });
                if (Array.isArray(data))
                    return data;
                if (Array.isArray(data === null || data === void 0 ? void 0 : data.styles))
                    return data.styles;
            }
            catch {
            }
        }
        return [];
    }
    async createImage(prompt, style) {
        const pipelineId = await this.ensurePipelineId();
        const params = {
            type: 'GENERATE',
            numImages: 1,
            width: 1024,
            height: 1024,
            style,
            generateParams: { query: prompt },
        };
        const form = new FormData();
        form.append('pipeline_id', pipelineId);
        form.append('params', JSON.stringify(params), { contentType: 'application/json' });
        const { data } = await this.http.post('key/api/v1/pipeline/run', form, {
            headers: { ...this.authHeaders, ...form.getHeaders() },
        });
        return { taskId: data.uuid };
    }
    async getTaskStatus(taskId) {
        var _a;
        const { data } = await this.http.get(`key/api/v1/pipeline/status/${taskId}`, { headers: this.authHeaders });
        return {
            status: data.status,
            errorDescription: data.errorDescription,
            files: (_a = data === null || data === void 0 ? void 0 : data.result) === null || _a === void 0 ? void 0 : _a.files,
        };
    }
    async getResultFromStatus(files) {
        const base64 = files[0];
        return Buffer.from(base64, 'base64');
    }
    async checkAvailability() {
        const { data } = await this.http.get('key/api/v1/pipeline/availability', { headers: this.authHeaders });
        return data;
    }
}
let FusionBrainService = class FusionBrainService {
    constructor() {
        this.styles = [];
        this.lastFetchedAt = 0;
        this.stylesTtlMs = 60 * 60 * 1000;
    }
    async onModuleInit() {
        this.client = new HttpFusionBrainClient({
            apiKey: process.env.FUSION_BRAIN_API_KEY,
            secretKey: process.env.FUSION_BRAIN_API_SECRET,
            baseUrl: process.env.FUSION_BRAIN_API_URL || 'https://api-key.fusionbrain.ai/',
        });
    }
    async getValidStyles() {
        return this.styles;
    }
    async requestImage(prompt, style) {
        const { taskId } = await this.client.createImage(prompt, style);
        return taskId;
    }
    async waitForResult(taskId, timeoutMs = 5 * 60 * 1000) {
        const start = Date.now();
        while (Date.now() - start < timeoutMs) {
            const s = await this.client.getTaskStatus(taskId);
            if (s.status === 'DONE' && s.files && s.files.length > 0) {
                return this.client.getResultFromStatus(s.files);
            }
            if (s.status === 'FAIL') {
                throw new Error(s.errorDescription || 'Generation failed');
            }
            await new Promise(r => setTimeout(r, 2000));
        }
        throw new Error('Generation timeout');
    }
    async checkAvailability() {
        return this.client.checkAvailability();
    }
};
exports.FusionBrainService = FusionBrainService;
exports.FusionBrainService = FusionBrainService = __decorate([
    (0, common_1.Injectable)()
], FusionBrainService);
//# sourceMappingURL=fusionbrain.service.js.map