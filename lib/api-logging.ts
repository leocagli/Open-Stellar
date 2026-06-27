import { NextResponse } from 'next/server'
import { logger, sanitizeContext } from '@/lib/observability/logger'
import { incrementCounter, recordHistogram } from '@/lib/observability/metrics'

export type ApiLogLevel = 'info' | 'warn' | 'error'

export interface ApiLogContext {
  route?: string
  method?: string
  path?: string
  status?: number
  durationMs?: number
  error?: unknown
  [key: string]: unknown
}

export interface ApiRouteLogger {
  json(body: unknown, init?: ResponseInit, details?: ApiLogContext): Promise<NextResponse>
  report(level: ApiLogLevel, error: unknown, body: unknown, init?: ResponseInit, details?: ApiLogContext): Promise<NextResponse>
}

function normalizeContext(context: ApiLogContext): ApiLogContext {
  return sanitizeContext(context)
}

function levelForStatus(status: number): ApiLogLevel {
  if (status >= 500) return 'error'
  if (status >= 400) return 'warn'
  return 'info'
}

function routeContext(
  req: Request,
  route: string,
  startedAt: number,
  details?: ApiLogContext,
): ApiLogContext {
  const url = new URL(req.url)
  const query = Object.fromEntries(
    Array.from(url.searchParams.entries(), ([key, value]) => [key, normalizeContext({ [key]: value })[key]]),
  )

  return normalizeContext({
    route,
    method: req.method,
    path: url.pathname,
    query,
    durationMs: Date.now() - startedAt,
    ...details,
  })
}

async function emit(level: ApiLogLevel, message: string, context: ApiLogContext) {
  await logger[level](message, context)
  incrementCounter(message, { route: context.route, method: context.method, status: context.status })
  if (typeof context.durationMs === 'number') recordHistogram('api.route.duration_ms', { route: context.route, method: context.method }, context.durationMs)
}

export function clearLogtailLoggerForTests() {
  // Kept for backwards-compatible tests; the shared structured logger owns its client cache.
}

export async function logApiEvent(level: ApiLogLevel, message: string, context: ApiLogContext = {}) {
  await emit(level, message, normalizeContext(context))
}

export function createApiRouteLogger(req: Request, route: string, baseDetails: ApiLogContext = {}): ApiRouteLogger {
  const startedAt = Date.now()

  return {
    async json(body: unknown, init?: ResponseInit, details: ApiLogContext = {}) {
      const response = NextResponse.json(body, init)
      const context = routeContext(req, route, startedAt, {
        ...baseDetails,
        ...details,
        status: response.status,
      })
      await emit(levelForStatus(response.status), 'api.route.completed', context)
      return response
    },

    async report(level: ApiLogLevel, error: unknown, body: unknown, init?: ResponseInit, details: ApiLogContext = {}) {
      const response = NextResponse.json(body, init)
      const context = routeContext(req, route, startedAt, {
        ...baseDetails,
        ...details,
        status: response.status,
        error,
      })
      await emit(level, 'api.route.failed', context)
      return response
    },
  }
}
