import { OnModuleInit } from '@nestjs/common';
export declare class MinioService implements OnModuleInit {
    private client;
    private bucket;
    onModuleInit(): Promise<void>;
    putObject(objectName: string, data: Buffer, contentType?: string): Promise<string>;
    getObject(objectName: string): Promise<import("stream").Readable>;
    getObjectUrl(objectName: string): string;
}
