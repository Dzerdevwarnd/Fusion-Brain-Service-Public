import { StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { CreateImageDto } from './dto/create-image.dto';
import { GetFileDto } from './dto/get-file.dto';
import { ImagesService } from './images.service';
export declare class ImagesController {
    private readonly images;
    constructor(images: ImagesService);
    styles(): Promise<string[]>;
    availability(): Promise<{
        pipeline_status: string;
    }>;
    create(dto: CreateImageDto): Promise<{
        id: string;
        status: string;
    }>;
    getFile(id: string, query: GetFileDto, res: Response): Promise<StreamableFile>;
    list(page?: string, pageSize?: string): Promise<{
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
