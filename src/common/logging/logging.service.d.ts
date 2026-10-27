import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RequestContextService } from './request-context.service';
import { LogLevelName } from './logging.constants';
export interface StructuredLogEntry {
    timestamp: string;
    level: string;
    service: string;
    environment: string;
    context?: string;
    message: string;
    requestId?: string;
    traceId?: string;
    tenantId?: string;
    metadata?: Record<string, unknown>;
    error?: {
        name?: string;
        message?: string;
        stack?: string;
    };
}
export declare class LoggingService implements LoggerService {
    private readonly configService?;
    private readonly requestContext?;
    private readonly isProduction;
    private readonly serviceName;
    private readonly environment;
    private currentLogLevel;
    constructor(configService?: ConfigService | undefined, requestContext?: RequestContextService | undefined);
    setLogLevel(level: LogLevelName): void;
    private isLevelEnabled;
    debug(message: any, context?: string, metadata?: Record<string, unknown>): void;
    log(message: any, context?: string, metadata?: Record<string, unknown>): void;
    info(message: any, context?: string, metadata?: Record<string, unknown>): void;
    warn(message: any, context?: string, metadata?: Record<string, unknown>): void;
    verbose(message: any, context?: string, metadata?: Record<string, unknown>): void;
    error(message: any, stackOrContext?: string, contextOrMetadata?: any, metadata?: Record<string, unknown>): void;
    fatal(message: any, stackOrContext?: string, contextOrMetadata?: any, metadata?: Record<string, unknown>): void;
    private writeLog;
    private writeDevConsole;
}
