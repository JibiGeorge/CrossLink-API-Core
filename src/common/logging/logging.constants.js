"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.REQUEST_ID_REGEX = exports.MAX_REQUEST_ID_LENGTH = exports.B3_TRACE_HEADER = exports.TRACEPARENT_HEADER = exports.CORRELATION_ID_HEADER = exports.REQUEST_ID_HEADER = exports.DEFAULT_SENSITIVE_KEYS = exports.LOG_LEVELS = void 0;
exports.LOG_LEVELS = {
    fatal: 0,
    error: 1,
    warn: 2,
    info: 3,
    log: 3,
    debug: 4,
    verbose: 5,
};
exports.DEFAULT_SENSITIVE_KEYS = [
    'authorization',
    'x-api-key',
    'api-key',
    'apikey',
    'cookie',
    'set-cookie',
    'password',
    'secret',
    'token',
    'access_token',
    'refresh_token',
    'client_secret',
    'private_key',
    'credential',
    'credentials',
    'connectionstring',
    'db',
    'dbname',
    'host',
    'port',
];
exports.REQUEST_ID_HEADER = 'x-request-id';
exports.CORRELATION_ID_HEADER = 'x-correlation-id';
exports.TRACEPARENT_HEADER = 'traceparent';
exports.B3_TRACE_HEADER = 'x-b3-traceid';
exports.MAX_REQUEST_ID_LENGTH = 64;
exports.REQUEST_ID_REGEX = /^[a-zA-Z0-9_\-\.]+$/;
//# sourceMappingURL=logging.constants.js.map