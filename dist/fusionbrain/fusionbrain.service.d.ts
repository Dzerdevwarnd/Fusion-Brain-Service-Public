import { OnModuleInit } from '@nestjs/common';
export declare class FusionBrainService implements OnModuleInit {
    private client;
    private styles;
    private lastFetchedAt;
    private stylesTtlMs;
    onModuleInit(): Promise<void>;
    getValidStyles(): Promise<string[]>;
    requestImage(prompt: string, style: string): Promise<string>;
    waitForResult(taskId: string, timeoutMs?: number): Promise<Buffer>;
    checkAvailability(): Promise<{
        pipeline_status: string;
    }>;
}
