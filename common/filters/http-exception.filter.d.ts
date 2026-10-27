import { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { LoggingService } from '../logging/logging.service.js';
import { RequestContextService } from '../logging/request-context.service.js';
export declare class HttpExceptionFilter implements ExceptionFilter {
    private readonly loggingService;
    private readonly requestContextService?;
    constructor(loggingService?: LoggingService, requestContextService?: RequestContextService);
    catch(exception: any, host: ArgumentsHost): void;
    private statusToCode;
}
