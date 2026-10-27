export declare const LOG_LEVELS: {
    readonly fatal: 0;
    readonly error: 1;
    readonly warn: 2;
    readonly info: 3;
    readonly log: 3;
    readonly debug: 4;
    readonly verbose: 5;
};
export type LogLevelName = keyof typeof LOG_LEVELS;
export declare const DEFAULT_SENSITIVE_KEYS: readonly ["authorization", "x-api-key", "api-key", "apikey", "cookie", "set-cookie", "password", "secret", "token", "access_token", "refresh_token", "client_secret", "private_key", "credential", "credentials", "connectionstring", "db", "dbname", "host", "port"];
export declare const REQUEST_ID_HEADER = "x-request-id";
export declare const CORRELATION_ID_HEADER = "x-correlation-id";
export declare const TRACEPARENT_HEADER = "traceparent";
export declare const B3_TRACE_HEADER = "x-b3-traceid";
export declare const MAX_REQUEST_ID_LENGTH = 64;
export declare const REQUEST_ID_REGEX: RegExp;
