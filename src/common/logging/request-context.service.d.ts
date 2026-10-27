import { TracerService } from '@nestjs/observe';
export interface RequestContextData {
    requestId: string;
    traceId: string | null;
    tenantId: string | null;
    startTime: number;
    metadata: Record<string, unknown>;
}
export declare class RequestContextService {
    private readonly tracerService?;
    private readonly storage;
    constructor(tracerService?: TracerService | undefined);
    run<T>(context: RequestContextData, fn: () => T): T;
    getStore(): RequestContextData | undefined;
    getRequestId(): string | undefined;
    getTraceId(): string | undefined;
    getTenantId(): string | undefined;
    setTenantId(tenantId: string): void;
    setMetadata(key: string, value: unknown): void;
    getMetadata(): Record<string, unknown>;
    sanitizeRequestId(headerValue?: string | string[]): string;
    extractTraceId(headers: Record<string, any>): string | null;
    extractRequestId(headers: Record<string, any>): string;
}
