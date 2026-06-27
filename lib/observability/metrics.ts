import { createAgents } from '@/lib/data'
import { listTasks, type QueuedTaskPriority } from '@/lib/agent-runtime/task-queue'
import { listX402ExplorerReceipts } from '@/lib/protocols/x402'

export type MetricLabels = Record<string, string | number | boolean | undefined>

export interface CounterSample {
  name: string
  value: number
  labels: Record<string, string>
}

export type GaugeSample = CounterSample

export interface HistogramSample {
  name: string
  count: number
  sum: number
  min: number
  max: number
  p50: number
  p95: number
  p99: number
  labels: Record<string, string>
}

export interface ObservabilityMetricsSnapshot {
  generatedAt: string
  counters: CounterSample[]
  gauges: GaugeSample[]
  histograms: HistogramSample[]
  charts: {
    requestRate24h: Array<{ hour: string; count: number }>
    errorRate24h: Array<{ hour: string; count: number }>
    x402Revenue24h: Array<{ hour: string; xlm: number }>
  }
  topFailingAgents: Array<{ agentId: string; failures: number }>
}

interface HistogramState {
  labels: Record<string, string>
  values: number[]
}

interface MetricsState {
  counters: Map<string, CounterSample>
  gauges: Map<string, GaugeSample>
  histograms: Map<string, HistogramState>
  events: Array<{ name: string; at: number; labels: Record<string, string>; value?: number }>
}

const globalState = globalThis as typeof globalThis & { __openStellarMetrics__?: MetricsState }
const metricsState: MetricsState = globalState.__openStellarMetrics__ ?? {
  counters: new Map(),
  gauges: new Map(),
  histograms: new Map(),
  events: [],
}
if (!globalState.__openStellarMetrics__) globalState.__openStellarMetrics__ = metricsState

function normalizeLabels(labels: MetricLabels = {}): Record<string, string> {
  return Object.fromEntries(
    Object.entries(labels)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => [key, String(value)]),
  )
}

function keyFor(name: string, labels: Record<string, string>): string {
  return `${name}:${Object.entries(labels).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => `${key}=${value}`).join(',')}`
}

function rememberEvent(name: string, labels: Record<string, string>, value?: number): void {
  const dayAgo = Date.now() - 24 * 60 * 60 * 1000
  metricsState.events.push({ name, labels, value, at: Date.now() })
  metricsState.events = metricsState.events.filter((event) => event.at >= dayAgo)
}

export function incrementCounter(name: string, labels: MetricLabels = {}, amount = 1): void {
  const normalized = normalizeLabels(labels)
  const key = keyFor(name, normalized)
  const current = metricsState.counters.get(key) ?? { name, labels: normalized, value: 0 }
  current.value += amount
  metricsState.counters.set(key, current)
  rememberEvent(name, normalized, amount)
}

export function setGauge(name: string, labels: MetricLabels = {}, value: number): void {
  const normalized = normalizeLabels(labels)
  metricsState.gauges.set(keyFor(name, normalized), { name, labels: normalized, value })
}

export function recordHistogram(name: string, labels: MetricLabels = {}, value: number): void {
  if (!Number.isFinite(value)) return
  const normalized = normalizeLabels(labels)
  const key = keyFor(name, normalized)
  const current = metricsState.histograms.get(key) ?? { labels: normalized, values: [] }
  current.values.push(value)
  metricsState.histograms.set(key, current)
  rememberEvent(name, normalized, value)
}

export function recordTaskCompleted(input: { agentId: string; taskId: string; durationMs: number; district?: string }): void {
  incrementCounter('tasks.completed', { agent: input.agentId, district: input.district ?? 'unknown' })
  recordHistogram('task.duration_ms', { agent: input.agentId, district: input.district ?? 'unknown' }, input.durationMs)
}

export function recordTaskFailed(input: { agentId: string; taskId: string; durationMs: number; district?: string }): void {
  incrementCounter('tasks.failed', { agent: input.agentId, district: input.district ?? 'unknown' })
  recordHistogram('task.duration_ms', { agent: input.agentId, district: input.district ?? 'unknown' }, input.durationMs)
}

export function recordX402Payment(input: { service: string; amountXlm?: number; amountUsd?: number; agentId?: string }): void {
  incrementCounter('x402.payments', { service: input.service, agent: input.agentId ?? 'unknown' })
  incrementCounter('x402.payments.xlm_sum', { service: input.service }, input.amountXlm ?? 0)
  if (input.amountUsd !== undefined) incrementCounter('x402.payments.usd_sum', { service: input.service }, input.amountUsd)
}

function percentile(values: number[], p: number): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil((p / 100) * sorted.length) - 1))
  return sorted[index]
}

function histogramSamples(): HistogramSample[] {
  return [...metricsState.histograms.entries()].map(([key, state]) => {
    const values = state.values
    const sum = values.reduce((total, value) => total + value, 0)
    return {
      name: key.split(':')[0],
      labels: state.labels,
      count: values.length,
      sum,
      min: values.length ? Math.min(...values) : 0,
      max: values.length ? Math.max(...values) : 0,
      p50: percentile(values, 50),
      p95: percentile(values, 95),
      p99: percentile(values, 99),
    }
  })
}

function updateDerivedGauges(): void {
  const agents = createAgents()
  setGauge('agents.online', {}, agents.filter((agent) => agent.status === 'active' || agent.status === 'working').length)

  const priorities: QueuedTaskPriority[] = ['critical', 'high', 'normal', 'low']
  const pending = listTasks({ includeDeadLetter: true }).filter((task) => task.status === 'pending')
  for (const priority of priorities) {
    setGauge('tasks.queue.depth', { priority }, pending.filter((task) => task.priority === priority).length)
  }
}

function bucketEvents(name: string, valueKey: 'count' | 'xlm'): Array<{ hour: string; count?: number; xlm?: number }> {
  const now = Date.now()
  const hours = Array.from({ length: 24 }, (_, index) => {
    const at = new Date(now - (23 - index) * 60 * 60 * 1000)
    at.setMinutes(0, 0, 0)
    return { hour: at.toISOString(), count: 0, xlm: 0 }
  })
  const byHour = new Map(hours.map((bucket) => [bucket.hour, bucket]))
  for (const event of metricsState.events.filter((item) => item.name === name)) {
    const hour = new Date(event.at)
    hour.setMinutes(0, 0, 0)
    const bucket = byHour.get(hour.toISOString())
    if (!bucket) continue
    if (valueKey === 'xlm') bucket.xlm += event.value ?? 0
    else bucket.count += 1
  }
  return hours
}

function deriveReceiptRevenueXlm(): number {
  return listX402ExplorerReceipts({ pageSize: 100 }).receipts.reduce((sum, receipt) => {
    const amount = Number.parseFloat(String(receipt.amount ?? '0'))
    return sum + (Number.isFinite(amount) ? amount : 0)
  }, 0)
}

export function getMetricsSnapshot(): ObservabilityMetricsSnapshot {
  updateDerivedGauges()
  const failureCounts = new Map<string, number>()
  for (const sample of metricsState.counters.values()) {
    if (sample.name !== 'tasks.failed') continue
    const agentId = sample.labels.agent ?? 'unknown'
    failureCounts.set(agentId, (failureCounts.get(agentId) ?? 0) + sample.value)
  }

  const chartsRevenue = bucketEvents('x402.payments.xlm_sum', 'xlm').map((bucket) => ({ hour: bucket.hour, xlm: bucket.xlm ?? 0 }))
  if (chartsRevenue.every((bucket) => bucket.xlm === 0)) {
    chartsRevenue[chartsRevenue.length - 1].xlm = deriveReceiptRevenueXlm()
  }

  return {
    generatedAt: new Date().toISOString(),
    counters: [...metricsState.counters.values()],
    gauges: [...metricsState.gauges.values()],
    histograms: histogramSamples(),
    charts: {
      requestRate24h: bucketEvents('api.route.completed', 'count').map((bucket) => ({ hour: bucket.hour, count: bucket.count ?? 0 })),
      errorRate24h: bucketEvents('api.route.failed', 'count').map((bucket) => ({ hour: bucket.hour, count: bucket.count ?? 0 })),
      x402Revenue24h: chartsRevenue,
    },
    topFailingAgents: [...failureCounts.entries()]
      .map(([agentId, failures]) => ({ agentId, failures }))
      .sort((a, b) => b.failures - a.failures)
      .slice(0, 5),
  }
}

export function resetMetricsForTests(): void {
  metricsState.counters.clear()
  metricsState.gauges.clear()
  metricsState.histograms.clear()
  metricsState.events = []
}
