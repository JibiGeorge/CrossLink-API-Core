"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSensitiveKey = isSensitiveKey;
exports.redactString = redactString;
exports.redact = redact;
const logging_constants_js_1 = require("./logging.constants.js");
const SENSITIVE_KEY_PATTERNS = logging_constants_js_1.DEFAULT_SENSITIVE_KEYS.map((key) => new RegExp(`^${key.replace(/[-_]/g, '[-_]?')}$`, 'i'));
const BEARER_REGEX = /Bearer\s+([A-Za-z0-9_\-\.]+)/gi;
const CONNECTION_STRING_REGEX = /([a-z]+:\/\/[^:]+:)([^@]+)(@.+)/gi;
function isSensitiveKey(key) {
    const normalized = key.toLowerCase();
    for (const pattern of SENSITIVE_KEY_PATTERNS) {
        if (pattern.test(normalized)) {
            return true;
        }
    }
    return logging_constants_js_1.DEFAULT_SENSITIVE_KEYS.some((sensitive) => normalized.includes(sensitive.toLowerCase()));
}
function redactString(value) {
    let result = value;
    if (BEARER_REGEX.test(result)) {
        result = result.replace(BEARER_REGEX, 'Bearer [REDACTED]');
    }
    if (CONNECTION_STRING_REGEX.test(result)) {
        result = result.replace(CONNECTION_STRING_REGEX, '$1[REDACTED]$3');
    }
    return result;
}
function redact(data, seen = new WeakSet()) {
    if (data === null || data === undefined) {
        return data;
    }
    if (typeof data === 'string') {
        return redactString(data);
    }
    if (typeof data !== 'object') {
        return data;
    }
    if (data instanceof Date || data instanceof RegExp) {
        return data;
    }
    if (data instanceof Error) {
        const errorObj = {
            name: data.name,
            message: redactString(data.message),
            stack: data.stack ? redactString(data.stack) : undefined,
        };
        for (const [key, val] of Object.entries(data)) {
            if (isSensitiveKey(key)) {
                errorObj[key] = '[REDACTED]';
            }
            else {
                errorObj[key] = redact(val, seen);
            }
        }
        return errorObj;
    }
    if (seen.has(data)) {
        return '[CIRCULAR]';
    }
    seen.add(data);
    if (Array.isArray(data)) {
        return data.map((item) => redact(item, seen));
    }
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        if (isSensitiveKey(key)) {
            result[key] = '[REDACTED]';
        }
        else {
            result[key] = redact(value, seen);
        }
    }
    return result;
}
//# sourceMappingURL=logging-redaction.js.map