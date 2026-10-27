"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestContextService = void 0;
const common_1 = require("@nestjs/common");
const node_async_hooks_1 = require("node:async_hooks");
const crypto = __importStar(require("node:crypto"));
const observe_1 = require("@nestjs/observe");
const logging_constants_js_1 = require("./logging.constants.js");
let RequestContextService = class RequestContextService {
    tracerService;
    storage = new node_async_hooks_1.AsyncLocalStorage();
    constructor(tracerService) {
        this.tracerService = tracerService;
    }
    run(context, fn) {
        return this.storage.run(context, fn);
    }
    getStore() {
        return this.storage.getStore();
    }
    getRequestId() {
        return this.getStore()?.requestId;
    }
    getTraceId() {
        const storeTraceId = this.getStore()?.traceId;
        if (storeTraceId) {
            return storeTraceId;
        }
        try {
            const observeTraceId = this.tracerService?.currentTraceId();
            if (observeTraceId) {
                return observeTraceId;
            }
        }
        catch {
        }
        return undefined;
    }
    getTenantId() {
        return this.getStore()?.tenantId ?? undefined;
    }
    setTenantId(tenantId) {
        const store = this.getStore();
        if (store && tenantId && typeof tenantId === 'string') {
            store.tenantId = tenantId.trim();
        }
    }
    setMetadata(key, value) {
        const store = this.getStore();
        if (store) {
            store.metadata[key] = value;
        }
    }
    getMetadata() {
        return this.getStore()?.metadata ?? {};
    }
    sanitizeRequestId(headerValue) {
        const raw = Array.isArray(headerValue) ? headerValue[0] : headerValue;
        if (raw &&
            typeof raw === 'string' &&
            raw.length > 0 &&
            raw.length <= logging_constants_js_1.MAX_REQUEST_ID_LENGTH &&
            logging_constants_js_1.REQUEST_ID_REGEX.test(raw)) {
            return raw;
        }
        return crypto.randomUUID();
    }
    extractTraceId(headers) {
        try {
            const activeObserveTraceId = this.tracerService?.currentTraceId();
            if (activeObserveTraceId) {
                return activeObserveTraceId;
            }
        }
        catch {
        }
        const traceparent = headers[logging_constants_js_1.TRACEPARENT_HEADER] ?? headers['trace-parent'];
        if (typeof traceparent === 'string') {
            const parts = traceparent.split('-');
            if (parts.length >= 4 && parts[1] && parts[1].length === 32) {
                return parts[1];
            }
        }
        const b3Trace = headers[logging_constants_js_1.B3_TRACE_HEADER];
        if (typeof b3Trace === 'string' && b3Trace.length >= 16) {
            return b3Trace;
        }
        return null;
    }
    extractRequestId(headers) {
        const candidate = headers[logging_constants_js_1.REQUEST_ID_HEADER] ??
            headers[logging_constants_js_1.CORRELATION_ID_HEADER] ??
            headers['x-correlationid'];
        return this.sanitizeRequestId(candidate);
    }
};
exports.RequestContextService = RequestContextService;
exports.RequestContextService = RequestContextService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __metadata("design:paramtypes", [observe_1.TracerService])
], RequestContextService);
//# sourceMappingURL=request-context.service.js.map