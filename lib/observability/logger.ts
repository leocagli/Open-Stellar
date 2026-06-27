import { Logtail } from '@logtail/node'

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export type LogContext = Record<string, unknown>

const globalState = globalThis as typeof globalThis & {
  __openStellarStructuredLogtail__?: Logtail | null
}

function getLogtail(): Logtail | null {
  const token = process.env.LOGTAIL_SOURCE_TOKEN?.trim()
  if (!token) return null

  if (globalState.__openStellarStructuredLogtail__ === undefined) {
    globalState.__openStellarStructuredLogtail__ = new Logtail(token)
  }

  return globalState.__openStellarStructuredLogtail__
}

function sanitizeValue(key: string, value: unknown): unknown {
  if (/(authorization|cookie|password|secret|token|api[_-]?key|signedxdr)/i.test(key)) return '[redacted]'
  if (value instanceof Error) {
    return { name: value.name, message: value.message, stack: value.stack }
  }
  if (typeof value === 'string' && value.length > 500) return `${value.slice(0, 497)}...`
  if (Array.isArray(value)) return value.map((item) => sanitizeValue(key, item))
  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([, nested]) => nested !== undefined)
        .map(([nestedKey, nested]) => [nestedKey, sanitizeValue(nestedKey, nested)]),
    )
  }
  return value
}

export function sanitizeContext(context: LogContext = {}): LogContext {
  return Object.fromEntries(
    Object.entries(context)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, sanitizeValue(key, value)]),
  )
}

async function write(level: LogLevel, event: string, context: LogContext = {}): Promise<void> {
  const payload = sanitizeContext({ event, ...context, timestamp: new Date().toISOString() })
  const logtail = getLogtail()

  try {
    if (logtail) {
      await logtail[level === 'debug' ? 'debug' : level](event, payload)
      return
    }

    const line = JSON.stringify({ level, message: event, ...payload })
    if (level === 'error') console.error(line)
    else if (level === 'warn') console.warn(line)
    else console.log(line)
  } catch {
    // Observability must never break the request or agent execution path.
  }
}

export const logger = {
  debug: (event: string, context?: LogContext) => write('debug', event, context),
  info: (event: string, context?: LogContext) => write('info', event, context),
  warn: (event: string, context?: LogContext) => write('warn', event, context),
  error: (event: string, context?: LogContext) => write('error', event, context),
}

export function clearStructuredLoggerForTests(): void {
  globalState.__openStellarStructuredLogtail__ = undefined
}
