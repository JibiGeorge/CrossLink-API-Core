import { StructuredLogEntry } from './logging.service.js';

export const isColorSupported = (): boolean => {
  if (process.env.NO_COLOR !== undefined && process.env.NO_COLOR !== '') return false;
  if (process.env.FORCE_COLOR === '1' || process.env.FORCE_COLOR === 'true') return true;
  if (process.env.FORCE_COLOR === '0' || process.env.FORCE_COLOR === 'false') return false;
  return Boolean(process.stdout?.isTTY || process.env.TERM || process.env.COLORTERM);
};

export const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  italic: '\x1b[3m',
  underline: '\x1b[4m',

  // Foreground
  black: '\x1b[30m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m',

  // Bright foreground
  brightRed: '\x1b[91m',
  brightGreen: '\x1b[92m',
  brightYellow: '\x1b[93m',
  brightBlue: '\x1b[94m',
  brightMagenta: '\x1b[95m',
  brightCyan: '\x1b[96m',
  brightWhite: '\x1b[97m',

  // Backgrounds
  bgRed: '\x1b[41m',
  bgGreen: '\x1b[42m',
  bgYellow: '\x1b[43m',
  bgBlue: '\x1b[44m',
  bgMagenta: '\x1b[45m',
  bgCyan: '\x1b[46m',
  bgDarkGray: '\x1b[100m',
  bgBrightRed: '\x1b[101m',
};

const wrap = (code: string, text: unknown): string => {
  if (!isColorSupported()) return String(text);
  return `${code}${text}${colors.reset}`;
};

export const style = {
  bold: (t: unknown) => wrap(colors.bold, t),
  dim: (t: unknown) => wrap(colors.dim, t),
  italic: (t: unknown) => wrap(colors.italic, t),
  underline: (t: unknown) => wrap(colors.underline, t),

  red: (t: unknown) => wrap(colors.red, t),
  green: (t: unknown) => wrap(colors.green, t),
  yellow: (t: unknown) => wrap(colors.yellow, t),
  blue: (t: unknown) => wrap(colors.blue, t),
  magenta: (t: unknown) => wrap(colors.magenta, t),
  cyan: (t: unknown) => wrap(colors.cyan, t),
  white: (t: unknown) => wrap(colors.white, t),
  gray: (t: unknown) => wrap(colors.gray, t),

  brightRed: (t: unknown) => wrap(colors.brightRed, t),
  brightGreen: (t: unknown) => wrap(colors.brightGreen, t),
  brightYellow: (t: unknown) => wrap(colors.brightYellow, t),
  brightBlue: (t: unknown) => wrap(colors.brightBlue, t),
  brightMagenta: (t: unknown) => wrap(colors.brightMagenta, t),
  brightCyan: (t: unknown) => wrap(colors.brightCyan, t),
  brightWhite: (t: unknown) => wrap(colors.brightWhite, t),

  badge: (bg: string, fg: string, t: string) => {
    if (!isColorSupported()) return `[${t}]`;
    return `${bg}${fg}${colors.bold} ${t} ${colors.reset}`;
  },
};

export function formatLogLevel(level: string, useBadges = false): string {
  const norm = level.toLowerCase();
  if (useBadges) {
    switch (norm) {
      case 'fatal':
        return style.badge(colors.bgBrightRed, colors.brightWhite, 'FATAL');
      case 'error':
        return style.badge(colors.bgRed, colors.brightWhite, 'ERROR');
      case 'warn':
        return style.badge(colors.bgYellow, colors.black, 'WARN ');
      case 'info':
      case 'log':
        return style.badge(colors.bgGreen, colors.black, 'INFO ');
      case 'debug':
        return style.badge(colors.bgMagenta, colors.brightWhite, 'DEBUG');
      case 'verbose':
        return style.badge(colors.bgCyan, colors.black, 'VERB ');
      default:
        return style.badge(colors.bgDarkGray, colors.brightWhite, norm.toUpperCase().padEnd(5));
    }
  }

  switch (norm) {
    case 'fatal':
      return `${style.dim('[')}${style.brightRed(style.bold('FATAL'))}${style.dim(']')}`;
    case 'error':
      return `${style.dim('[')}${style.brightRed(style.bold('ERROR'))}${style.dim(']')}`;
    case 'warn':
      return `${style.dim('[')}${style.brightYellow(style.bold('WARN '))}${style.dim(']')}`;
    case 'info':
    case 'log':
      return `${style.dim('[')}${style.brightGreen(style.bold('INFO '))}${style.dim(']')}`;
    case 'debug':
      return `${style.dim('[')}${style.brightMagenta(style.bold('DEBUG'))}${style.dim(']')}`;
    case 'verbose':
      return `${style.dim('[')}${style.brightCyan(style.bold('VERB '))}${style.dim(']')}`;
    default:
      return `${style.dim('[')}${style.brightWhite(style.bold(norm.toUpperCase().padEnd(5)))}${style.dim(']')}`;
  }
}

export function formatHttpMethod(method: string): string {
  const m = method.toUpperCase();
  switch (m) {
    case 'GET':
      return style.brightGreen(style.bold('GET'));
    case 'POST':
      return style.brightCyan(style.bold('POST'));
    case 'PUT':
      return style.brightYellow(style.bold('PUT'));
    case 'PATCH':
      return style.brightYellow(style.bold('PATCH'));
    case 'DELETE':
      return style.brightRed(style.bold('DELETE'));
    case 'OPTIONS':
      return style.gray(style.bold('OPTIONS'));
    case 'HEAD':
      return style.gray(style.bold('HEAD'));
    default:
      return style.brightMagenta(style.bold(m));
  }
}

export function formatHttpStatusCode(code: number | string): string {
  const num = typeof code === 'number' ? code : parseInt(code, 10);
  if (num >= 200 && num < 300) {
    return style.brightGreen(style.bold(num));
  }
  if (num >= 300 && num < 400) {
    return style.brightCyan(style.bold(num));
  }
  if (num >= 400 && num < 500) {
    return style.brightYellow(style.bold(num));
  }
  if (num >= 500) {
    return style.brightRed(style.bold(num));
  }
  return style.white(style.bold(code));
}

export function formatHttpDuration(durationMs: number | string): string {
  const num = typeof durationMs === 'number' ? durationMs : parseInt(durationMs, 10);
  const text = `+${num}ms`;
  if (num < 100) {
    return style.brightGreen(text);
  }
  if (num < 500) {
    return style.brightYellow(text);
  }
  return style.brightRed(text);
}

export function formatLogMessage(message: string, context?: string): string {
  if (!message || typeof message !== 'string') {
    return String(message ?? '');
  }

  // 1. HTTP Incoming request: "--> HTTP GET /api/core/v1"
  const incomingMatch = message.match(/^-->\s+HTTP\s+(\w+)\s+(.+)$/);
  if (incomingMatch) {
    const [, method, path] = incomingMatch;
    return `${style.brightCyan('-->')} ${style.dim('HTTP')} ${formatHttpMethod(method)} ${style.brightWhite(style.bold(path))}`;
  }

  // 2. HTTP Completed response: "<-- HTTP GET /api/core/v1 200 [14ms]" (with optional "(failed: reason)")
  const outgoingMatch = message.match(/^<--\s+HTTP\s+(\w+)\s+([^\s]+)\s+(\d{3})\s+\[(\d+)ms\](?:\s+\((.+)\))?$/);
  if (outgoingMatch) {
    const [, method, path, statusStr, durationStr, failureReason] = outgoingMatch;
    const statusCode = parseInt(statusStr, 10);
    const arrow = statusCode >= 500 ? style.brightRed('<--') : statusCode >= 400 ? style.brightYellow('<--') : style.brightGreen('<--');
    const statusFormatted = formatHttpStatusCode(statusCode);
    const durationFormatted = `${style.dim('[')}${formatHttpDuration(durationStr)}${style.dim(']')}`;
    const failureTag = failureReason ? ` ${style.brightRed(`(${failureReason})`)}` : '';

    return `${arrow} ${style.dim('HTTP')} ${formatHttpMethod(method)} ${style.brightWhite(style.bold(path))} ${statusFormatted} ${durationFormatted}${failureTag}`;
  }

  // 3. NestJS route mapping: "Mapped {/api/core/v1, GET} route"
  const routeMatch = message.match(/^Mapped\s+\{([^,]+),\s*(\w+)\}\s+route$/);
  if (routeMatch) {
    const [, routePath, method] = routeMatch;
    return `${style.dim('Mapped')} ${style.dim('{')}${style.brightYellow(routePath)}${style.dim(', ')}${formatHttpMethod(method)}${style.dim('}')} ${style.dim('route')}`;
  }

  // 4. NestJS controller route prefix: "AppController {/api/core/v1}:"
  const controllerMatch = message.match(/^(\w+)\s+\{([^}]+)\}:$/);
  if (controllerMatch) {
    const [, controllerName, prefix] = controllerMatch;
    return `${style.brightCyan(controllerName)} ${style.dim('{')}${style.brightYellow(prefix)}${style.dim('}:')}`;
  }

  // 5. Port listening: e.g. "Backend API (BFF) running on port 3001"
  if (/running on port\s+\d+/i.test(message)) {
    return message.replace(/running on port\s+(\d+)/i, (_, port) => {
      return `running on port ${style.brightCyan(style.bold(port))}`;
    });
  }

  // 6. Highlight Nest lifecycle keywords
  if (context === 'NestApplication' && message.includes('successfully started')) {
    return `${style.brightGreen(message)} ${style.brightGreen('🚀')}`;
  }

  return message;
}

export function formatCorrelations(
  requestId?: string,
  traceId?: string,
  tenantId?: string,
): string {
  const parts: string[] = [];
  if (requestId) {
    const shortReq = requestId.length > 8 ? requestId.substring(0, 8) : requestId;
    parts.push(`${style.cyan('req:')}${style.dim(shortReq)}`);
  }
  if (traceId) {
    const shortTrace = traceId.length > 8 ? traceId.substring(0, 8) : traceId;
    parts.push(`${style.brightMagenta('trace:')}${style.dim(shortTrace)}`);
  }
  if (tenantId) {
    parts.push(`${style.brightBlue('tenant:')}${style.brightYellow(tenantId)}`);
  }

  if (parts.length === 0) return '';
  return ` ${style.dim('(')}${parts.join(style.dim(' | '))}${style.dim(')')}`;
}

export function highlightJson(obj: unknown, indent = '  '): string {
  if (obj === null || obj === undefined) return style.dim('null');
  if (typeof obj === 'string') return style.brightGreen(`"${obj}"`);
  if (typeof obj === 'number') return style.brightYellow(String(obj));
  if (typeof obj === 'boolean') return style.brightMagenta(String(obj));

  if (Array.isArray(obj)) {
    if (obj.length === 0) return style.dim('[]');
    const lines = obj.map((item) => `${indent}  ${highlightJson(item, indent + '  ')}`);
    return `${style.dim('[\n')}${lines.join(style.dim(',\n'))}\n${indent}${style.dim(']')}`;
  }

  if (typeof obj === 'object') {
    const entries = Object.entries(obj);
    if (entries.length === 0) return style.dim('{}');
    const lines = entries.map(([key, val]) => {
      const formattedKey = style.brightCyan(`"${key}"`);
      const formattedVal = highlightJson(val, indent + '  ');
      return `${indent}  ${formattedKey}${style.dim(': ')}${formattedVal}`;
    });
    return `${style.dim('{\n')}${lines.join(style.dim(',\n'))}\n${indent}${style.dim('}')}`;
  }

  return String(obj);
}

export function formatMetadata(metadata: Record<string, unknown>, indent = '  '): string {
  if (!metadata || Object.keys(metadata).length === 0) return '';
  const header = `${indent}${style.dim('└─ ')}${style.brightCyan(style.bold('metadata'))}:`;
  const body = highlightJson(metadata, indent);
  return `${header} ${body}`;
}

export function formatErrorDetails(
  error: { name?: string; message?: string; stack?: string },
  indent = '  ',
): string {
  const output: string[] = [];
  const errorTitle = `${error.name ? `${error.name}: ` : ''}${error.message || 'An unexpected error occurred'}`;
  output.push(`${indent}${style.brightRed(style.bold('✖ ' + errorTitle))}`);

  if (error.stack) {
    const lines = error.stack.split('\n');
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;
      if (line === errorTitle || line === `${error.name}: ${error.message}`) continue;

      if (line.startsWith('at ')) {
        const match = line.match(/^at\s+(?:([^\s(]+)\s+)?\(?([^)]+)\)?$/);
        if (match) {
          const fn = match[1] ? ` ${style.brightCyan(match[1])}` : '';
          const location = ` ${style.dim(`(${match[2]})`)}`;
          output.push(`${indent}    ${style.dim('at')}${fn}${location}`);
        } else {
          output.push(`${indent}    ${style.dim(line)}`);
        }
      } else {
        output.push(`${indent}    ${style.dim(line)}`);
      }
    }
  }

  return output.join('\n');
}

export function formatDevLog(
  entry: StructuredLogEntry,
  options?: { useBadges?: boolean },
): {
  mainLine: string;
  metadataBlock?: string;
  errorBlock?: string;
} {
  const timeFormatted = entry.timestamp.substring(11, 23); // HH:mm:ss.SSS
  const timeTag = style.dim(timeFormatted);

  const pidStr = process.pid ? ` ${style.dim(process.pid)}` : '';
  const serviceBadge = `${style.dim('[')}${style.brightCyan(entry.service || 'CrossLink')}${pidStr}${style.dim(']')}`;

  const levelBadge = formatLogLevel(entry.level, options?.useBadges);

  const contextTag = entry.context
    ? `${style.brightYellow(style.bold(`[${entry.context}]`))} `
    : '';

  const corrTag = formatCorrelations(entry.requestId, entry.traceId, entry.tenantId);
  const styledMessage = formatLogMessage(entry.message, entry.context);

  const mainLine = `${serviceBadge} ${timeTag} ${levelBadge} ${contextTag}${styledMessage}${corrTag}`;

  let metadataBlock: string | undefined;
  if (entry.metadata && Object.keys(entry.metadata).length > 0) {
    metadataBlock = formatMetadata(entry.metadata);
  }

  let errorBlock: string | undefined;
  if (entry.error) {
    errorBlock = formatErrorDetails(entry.error);
  }

  return { mainLine, metadataBlock, errorBlock };
}
