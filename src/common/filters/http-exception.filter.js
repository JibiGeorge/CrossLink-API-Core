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
exports.HttpExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const logging_service_js_1 = require("../logging/logging.service.js");
const request_context_service_js_1 = require("../logging/request-context.service.js");
const logging_redaction_js_1 = require("../logging/logging-redaction.js");
let HttpExceptionFilter = class HttpExceptionFilter {
    loggingService;
    requestContextService;
    constructor(loggingService, requestContextService) {
        this.loggingService = loggingService ?? new logging_service_js_1.LoggingService();
        this.requestContextService = requestContextService;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let errorCode = 'INTERNAL_SERVER_ERROR';
        let message = 'An unexpected error occurred';
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
                errorCode = this.statusToCode(status);
            }
            else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
                const errorResponse = exceptionResponse;
                if (Array.isArray(errorResponse.message)) {
                    message = errorResponse.message.join('; ');
                }
                else if (typeof errorResponse.message === 'string') {
                    message = errorResponse.message;
                }
                errorCode =
                    errorResponse.error?.toUpperCase().replace(/ /g, '_') ??
                        this.statusToCode(status);
            }
        }
        else if (exception?.success === false && exception?.error) {
            status = exception.statusCode || common_1.HttpStatus.BAD_REQUEST;
            if (exception.error.code === 'UNAUTHORIZED')
                status = common_1.HttpStatus.UNAUTHORIZED;
            else if (exception.error.code === 'NOT_FOUND')
                status = common_1.HttpStatus.NOT_FOUND;
            else if (exception.error.code === 'FORBIDDEN')
                status = common_1.HttpStatus.FORBIDDEN;
            errorCode = exception.error.code;
            message = exception.error.message;
        }
        const requestId = this.requestContextService?.getRequestId() ||
            response.getHeader('X-Request-Id') ||
            undefined;
        const isClientError = status < common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        const sanitizedPath = (request.originalUrl || request.url || '').split('?')[0];
        if (isClientError) {
            this.loggingService.warn(`HTTP ${status} [${errorCode}]: ${message} (${request.method} ${sanitizedPath})`, 'HttpExceptionFilter', {
                status,
                errorCode,
                path: sanitizedPath,
                method: request.method,
            });
        }
        else {
            const stack = exception instanceof Error ? exception.stack : undefined;
            const errorName = exception instanceof Error ? exception.name : 'ServerError';
            this.loggingService.error(`HTTP ${status} [${errorCode}]: ${message} (${request.method} ${sanitizedPath})`, stack, 'HttpExceptionFilter', {
                status,
                errorCode,
                path: sanitizedPath,
                method: request.method,
                errorName,
                details: (0, logging_redaction_js_1.redact)(exception?.details || exception?.meta),
            });
        }
        const clientMessage = status >= common_1.HttpStatus.INTERNAL_SERVER_ERROR && process.env.NODE_ENV === 'production'
            ? 'An unexpected internal server error occurred'
            : message;
        response.status(status).json({
            success: false,
            error: {
                code: errorCode,
                message: clientMessage,
                ...(requestId ? { requestId } : {}),
            },
        });
    }
    statusToCode(status) {
        const map = {
            400: 'BAD_REQUEST',
            401: 'UNAUTHORIZED',
            403: 'FORBIDDEN',
            404: 'NOT_FOUND',
            409: 'CONFLICT',
            422: 'UNPROCESSABLE_ENTITY',
            429: 'TOO_MANY_REQUESTS',
            500: 'INTERNAL_SERVER_ERROR',
        };
        return map[status] ?? 'ERROR';
    }
};
exports.HttpExceptionFilter = HttpExceptionFilter;
exports.HttpExceptionFilter = HttpExceptionFilter = __decorate([
    (0, common_1.Catch)(),
    __param(0, (0, common_1.Optional)()),
    __param(1, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [logging_service_js_1.LoggingService,
        request_context_service_js_1.RequestContextService])
], HttpExceptionFilter);
//# sourceMappingURL=http-exception.filter.js.map