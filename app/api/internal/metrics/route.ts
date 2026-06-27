import { NextResponse } from 'next/server'
import { getMetricsSnapshot } from '@/lib/observability/metrics'
import { logger } from '@/lib/observability/logger'

export const dynamic = 'force-dynamic'

export async function GET(): Promise<NextResponse> {
  const snapshot = getMetricsSnapshot()
  await logger.info('metrics.snapshot.served', {
    counters: snapshot.counters.length,
    gauges: snapshot.gauges.length,
    histograms: snapshot.histograms.length,
  })
  return NextResponse.json({ ok: true, ...snapshot })
}
