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
exports.LoggingService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const request_context_service_1 = require("./request-context.service");
const logging_redaction_1 = require("./logging-redaction");
const logging_constants_1 = require("./logging.constants");
let LoggingService = class LoggingService {
    configService;
    requestContext;
    isProduction;
    serviceName;
    environment;
    currentLogLevel;
    constructor(configService, requestContext) {
        this.configService = configService;
        this.requestContext = requestContext;
        this.environment =
            this.configService?.get('NODE_ENV') ??
                process.env.NODE_ENV ??
                'development';
        this.isProduction = this.environment.toLowerCase() === 'production';
        this.serviceName =
            this.configService?.get('SERVICE_NAME') ??
                process.env.SERVICE_NAME ??
                'dx-adapter';
        const configuredLevel = (this.configService?.get('LOG_LEVEL') ??
            process.env.LOG_LEVEL ??
            (this.isProduction ? 'log' : 'debug')).toLowerCase();
        this.currentLogLevel = logging_constants_1.LOG_LEVELS[configuredLevel] ?? (this.isProduction ? 3 : 4);
    }
    setLogLevel(level) {
        if (level in logging_constants_1.LOG_LEVELS) {
            this.currentLogLevel = logging_constants_1.LOG_LEVELS[level];
        }
    }
    isLevelEnabled(level) {
        const levelPriority = logging_constants_1.LOG_LEVELS[level];
        return levelPriority !== undefined && levelPriority <= this.currentLogLevel;
    }
    debug(message, context, metadata) {
        if (this.isLevelEnabled('debug')) {
            this.writeLog('debug', message, context, metadata);
        }
    }
    log(message, context, metadata) {
        if (this.isLevelEnabled('log')) {
            this.writeLog('info', message, context, metadata);
        }
    }
    info(message, context, metadata) {
        if (this.isLevelEnabled('info')) {
            this.writeLog('info', message, context, metadata);
        }
    }
    warn(message, context, metadata) {
        if (this.isLevelEnabled('warn')) {
            this.writeLog('warn', message, context, metadata);
        }
    }
    verbose(message, context, metadata) {
        if (this.isLevelEnabled('verbose')) {
            this.writeLog('verbose', message, context, metadata);
        }
    }
    error(message, stackOrContext, contextOrMetadata, metadata) {
        if (!this.isLevelEnabled('error')) {
            return;
        }
        let stack;
        let context;
        let meta = metadata;
        if (typeof stackOrContext === 'string' && stackOrContext.includes('\n')) {
            stack = stackOrContext;
            if (typeof contextOrMetadata === 'string') {
                context = contextOrMetadata;
            }
            else if (typeof contextOrMetadata === 'object') {
                meta = contextOrMetadata;
            }
        }
        else if (typeof stackOrContext === 'string') {
            context = stackOrContext;
            if (typeof contextOrMetadata === 'object') {
                meta = contextOrMetadata;
            }
        }
        if (message instanceof Error) {
            stack = stack ?? message.stack;
            this.writeLog('error', message.message, context, meta, {
                name: message.name,
                message: message.message,
                stack,
            });
            return;
        }
        this.writeLog('error', message, context, meta, stack ? { stack } : undefined);
    }
    fatal(message, stackOrContext, contextOrMetadata, metadata) {
        if (!this.isLevelEnabled('fatal')) {
            return;
        }
        let stack;
        let context;
        let meta = metadata;
        if (typeof stackOrContext === 'string' && stackOrContext.includes('\n')) {
            stack = stackOrContext;
            if (typeof contextOrMetadata === 'string') {
                context = contextOrMetadata;
            }
            else if (typeof contextOrMetadata === 'object') {
                meta = contextOrMetadata;
            }
        }
        else if (typeof stackOrContext === 'string') {
            context = stackOrContext;
            if (typeof contextOrMetadata === 'object') {
                meta = contextOrMetadata;
            }
        }
        if (message instanceof Error) {
            stack = stack ?? message.stack;
            this.writeLog('fatal', message.message, context, meta, {
                name: message.name,
                message: message.message,
                stack,
            });
            return;
        }
        this.writeLog('fatal', message, context, meta, stack ? { stack } : undefined);
    }
    writeLog(level, rawMessage, context, metadata, errorDetails) {
        const timestamp = new Date().toISOString();
        const requestId = this.requestContext?.getRequestId();
        const traceId = this.requestContext?.getTraceId();
        const tenantId = this.requestContext?.getTenantId();
        const messageString = typeof rawMessage === 'string'
            ? rawMessage
            : typeof rawMessage === 'object' && rawMessage !== null
                ? JSON.stringify((0, logging_redaction_1.redact)(rawMessage))
                : String(rawMessage);
        const redactedMetadata = metadata ? (0, logging_redaction_1.redact)(metadata) : undefined;
        const redactedError = errorDetails
            ? {
                name: errorDetails.name,
                message: errorDetails.message ? (0, logging_redaction_1.redact)(errorDetails.message) : undefined,
                stack: errorDetails.stack ? (0, logging_redaction_1.redact)(errorDetails.stack) : undefined,
            }
            : undefined;
        const entry = {
            timestamp,
            level,
            service: this.serviceName,
            environment: this.environment,
            ...(context ? { context } : {}),
            message: messageString,
            ...(requestId ? { requestId } : {}),
            ...(traceId ? { traceId } : {}),
            ...(tenantId ? { tenantId } : {}),
            ...(redactedMetadata && Object.keys(redactedMetadata).length > 0 ? { metadata: redactedMetadata } : {}),
            ...(redactedError ? { error: redactedError } : {}),
        };
        if (this.isProduction) {
            const jsonLine = JSON.stringify(entry) + '\n';
            if (level === 'error' || level === 'fatal') {
                process.stderr.write(jsonLine);
            }
            else {
                process.stdout.write(jsonLine);
            }
        }
        else {
            this.writeDevConsole(entry);
        }
    }
    writeDevConsole(entry) {
        const timeFormatted = entry.timestamp.substring(11, 23);
        const levelTag = entry.level.toUpperCase().padEnd(5);
        const contextTag = entry.context ? `[${entry.context}] ` : '';
        const correlations = [];
        if (entry.requestId)
            correlations.push(`req:${entry.requestId.substring(0, 8)}`);
        if (entry.traceId)
            correlations.push(`trace:${entry.traceId.substring(0, 8)}`);
        if (entry.tenantId)
            correlations.push(`tenant:${entry.tenantId}`);
        const corrTag = correlations.length > 0 ? ` (${correlations.join('|')})` : '';
        const prefix = `[${timeFormatted}] [${levelTag}] ${contextTag}`;
        const mainLine = `${prefix}${entry.message}${corrTag}`;
        if (entry.level === 'error' || entry.level === 'fatal') {
            console.error(mainLine);
            if (entry.error?.stack) {
                console.error(entry.error.stack);
            }
        }
        else if (entry.level === 'warn') {
            console.warn(mainLine);
        }
        else {
            console.log(mainLine);
        }
        if (entry.metadata && Object.keys(entry.metadata).length > 0) {
            console.log('  Metadata:', JSON.stringify(entry.metadata, null, 2));
        }
    }
};
exports.LoggingService = LoggingService;
exports.LoggingService = LoggingService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [config_1.ConfigService,
        request_context_service_1.RequestContextService])
], LoggingService);
//# sourceMappingURL=logging.service.js.map