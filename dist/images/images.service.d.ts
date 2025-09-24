import { FusionBrainService } from '../fusionbrain/fusionbrain.service';
import { MinioService } from '../minio/minio.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ImagesService {
    private readonly prisma;
    private readonly fusionBrain;
    private readonly minio;
    constructor(prisma: PrismaService, fusionBrain: FusionBrainService, minio: MinioService);
    private getSharp;
    getStyles(): Promise<string[]>;
    checkAvailability(): Promise<{
        pipeline_status: string;
    }>;
    create(prompt: string, style: string): Promise<{
        id: string;
        status: string;
    }>;
    private generateAndStore;
    getFile(id: string, type: 'original' | 'thumbnail'): Promise<{
        stream: import("stream").Readable;
        filename: string;
    }>;
    list(page?: number, pageSize?: number): Promise<{
        page: number;
        pageSize: number;
        total: number;
        items: {
            id: string;
            status: import("@prisma/client/default").$Enums.ImageStatus;
            prompt: string;
            style: string;
            thumbnailUrl: string | null;
            originalUrl: string | null;
            createdAt: Date;
        }[];
    }>;
}
