export declare function isSensitiveKey(key: string): boolean;
export declare function redactString(value: string): string;
export declare function redact<T>(data: T, seen?: WeakSet<object>): T;
