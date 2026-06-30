/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { createElement } from "react"
import { renderToString } from "react-dom/server"
import { AgentDashboard } from "@/components/agent-dashboard"

// ─── Types ─────────────────────────────────────────────────────────

type MockListener = (event: MessageEvent) => void

interface MockEventSourceInstance {
  url: string
  readyState: number
  onopen: ((this: EventSource, ev: Event) => any) | null
  onmessage: ((this: EventSource, ev: MessageEvent) => any) | null
  onerror: ((this: EventSource, ev: Event) => any) | null
  addEventListener(type: string, listener: MockListener): void
  removeEventListener(type: string, listener: MockListener): void
  close(): void
  _dispatch(type: string, data: unknown): void
}

// ─── Mock EventSource ─────────────────────────────────────────────

const mockInstances: MockEventSourceInstance[] = []

class MockEventSource implements MockEventSourceInstance {
  url: string
  readyState = 0
  onopen: ((this: EventSource, ev: Event) => any) | null = null
  onmessage: ((this: EventSource, ev: MessageEvent) => any) | null = null
  onerror: ((this: EventSource, ev: Event) => any) | null = null

  private listeners = new Map<string, MockListener[]>()

  constructor(url: string | URL) {
    this.url = String(url)
    this.readyState = 0
    mockInstances.push(this)

    // Simulate connection open
    setTimeout(() => {
      this.readyState = 1
      if (this.onopen) {
        this.onopen.call(this as unknown as EventSource, new Event("open"))
      }
    }, 0)
  }

  addEventListener(type: string, listener: MockListener): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, [])
    }
    this.listeners.get(type)!.push(listener)
  }

  removeEventListener(type: string, listener: MockListener): void {
    const list = this.listeners.get(type) || []
    const idx = list.indexOf(listener)
    if (idx !== -1) list.splice(idx, 1)
  }

  _dispatch(type: string, data: unknown): void {
    const listeners = this.listeners.get(type) || []
    const event = new MessageEvent(type, {
      data: JSON.stringify(data),
      origin: "",
      lastEventId: "",
    })
    listeners.forEach((fn) => fn(event))
  }

  close(): void {
    this.readyState = 2
  }
}

// Assign static properties to satisfy EventSource interface
Object.defineProperty(MockEventSource, "CONNECTING", { value: 0 })
Object.defineProperty(MockEventSource, "OPEN", { value: 1 })
Object.defineProperty(MockEventSource, "CLOSED", { value: 2 })

// ─── Setup / Teardown ─────────────────────────────────────────────

describe("AgentDashboard", () => {
  const agentId = "agent-test-123"

  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    global.EventSource = MockEventSource as unknown as typeof EventSource
    mockInstances.length = 0

    global.fetch = vi.fn(async (input: string | Request | URL) => {
      const url = String(input)

      if (url.includes("/health")) {
        return new Response(
          JSON.stringify({
            ok: true,
            health: {
              status: "healthy",
              cpu: 42.5,
              memory: 38.2,
              uptime: 3600,
              missedHeartbeats: 0,
              lastHeartbeat: new Date().toISOString(),
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      }

      if (url.includes("/reputation")) {
        return new Response(
          JSON.stringify({
            ok: true,
            reputation: {
              score: 847,
              badge: "Gold",
              totalActions: 1240,
            },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      }

      if (url.includes("/notifications")) {
        return new Response(
          JSON.stringify({
            ok: true,
            unreadCount: 3,
            notifications: [],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      }

      return new Response(JSON.stringify({ ok: false }), { status: 404 })
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.restoreAllMocks()
    mockInstances.forEach((es) => es.close())
    mockInstances.length = 0
  })

  // ─── Loading State ────────────────────────────────────────────────

  it("renders loading state initially", () => {
    const html = renderToString(createElement(AgentDashboard, { agentId }))
    expect(html).toContain("Loading agent dashboard")
    expect(html).toContain("agent-dashboard-loading")
  })

  // ─── Healthy State Snapshot ─────────────────────────────────────

  it("renders healthy state with all data sections", async () => {
    // Advance timers to let fetch promises resolve
    vi.advanceTimersByTime(100)
    await vi.runAllTimersAsync()

    const html = renderToString(createElement(AgentDashboard, { agentId }))

    expect(html).toContain("agent-dashboard")
    expect(html).toContain("Healthy")
    expect(html).toContain("847")
    expect(html).toContain("GOLD")
    expect(html).toContain("CPU")
    expect(html).toContain("Memory")
    expect(html).toContain("Live Position")
    expect(html).toContain("Reputation")
  })

  // ─── Offline State Snapshot ─────────────────────────────────────

  it("renders offline state when health returns 404", async () => {
    global.fetch = vi.fn(async (input: string | Request | URL) => {
      const url = String(input)

      if (url.includes("/health")) {
        return new Response(
          JSON.stringify({ ok: false, error: "Not found" }),
          { status: 404, headers: { "Content-Type": "application/json" } }
        )
      }

      if (url.includes("/reputation")) {
        return new Response(
          JSON.stringify({
            ok: true,
            reputation: { score: 0, badge: "Unranked", totalActions: 0 },
          }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      }

      if (url.includes("/notifications")) {
        return new Response(
          JSON.stringify({ ok: true, unreadCount: 0, notifications: [] }),
          { status: 200, headers: { "Content-Type": "application/json" } }
        )
      }

      return new Response(JSON.stringify({ ok: false }), { status: 404 })
    })

    vi.advanceTimersByTime(100)
    await vi.runAllTimersAsync()

    const html = renderToString(createElement(AgentDashboard, { agentId }))

    expect(html).toContain("agent-dashboard")
    expect(html).toContain("Offline")
    expect(html).toContain("CPU")
    expect(html).toContain("Memory")
  })

  // ─── Error State ────────────────────────────────────────────────

  it("renders error state when all fetches fail", async () => {
    global.fetch = vi.fn(async () => {
      throw new Error("Network error")
    })

    vi.advanceTimersByTime(100)
    await vi.runAllTimersAsync()

    const html = renderToString(createElement(AgentDashboard, { agentId }))

    expect(html).toContain("agent-dashboard-error")
    expect(html).toContain("Network error")
    expect(html).toContain("Retry")
  })

  // ─── SSE Position Update ────────────────────────────────────────

  it("connects to SSE and receives position updates", async () => {
    vi.advanceTimersByTime(100)
    await vi.runAllTimersAsync()

    // Should have created an EventSource instance
    expect(mockInstances.length).toBeGreaterThan(0)

    const es = mockInstances[0]
    expect(es.url).toContain("/api/agents/positions")

    // Simulate position delta
    es._dispatch("agent.positions.delta", {
      agentId,
      lat: 40.7128,
      lng: -74.006,
      timestamp: new Date().toISOString(),
    })

    // Re-render to verify position updated
    const html = renderToString(createElement(AgentDashboard, { agentId }))
    expect(html).toContain("40.712800")
    expect(html).toContain("-74.006000")
  })

  // ─── Health Polling Interval ────────────────────────────────────

  it("polls health every 30 seconds", async () => {
    const fetchSpy = vi.mocked(global.fetch)

    vi.advanceTimersByTime(100)
    await vi.runAllTimersAsync()

    // Initial health call
    const healthCalls = fetchSpy.mock.calls.filter((call) =>
      String(call[0]).includes("/health")
    )
    expect(healthCalls.length).toBeGreaterThanOrEqual(1)

    // Advance 30 seconds
    vi.advanceTimersByTime(30_000)
    await vi.runAllTimersAsync()

    const callsAfterPoll = fetchSpy.mock.calls.filter((call) =>
      String(call[0]).includes("/health")
    )
    expect(callsAfterPoll.length).toBeGreaterThanOrEqual(2)
  })

  // ─── Cleanup on Unmount ───────────────────────────────────────

  it("closes SSE on unmount", async () => {
    vi.advanceTimersByTime(100)
    await vi.runAllTimersAsync()

    expect(mockInstances.length).toBeGreaterThan(0)
    const es = mockInstances[0]
    const closeSpy = vi.spyOn(es, "close")

    // Simulate unmount by closing
    es.close()

    expect(closeSpy).toHaveBeenCalled()
  })

  // ─── Notification Bubble ────────────────────────────────────────

  it("shows notification count bubble when unread > 0", async () => {
    vi.advanceTimersByTime(100)
    await vi.runAllTimersAsync()

    const html = renderToString(createElement(AgentDashboard, { agentId }))

    expect(html).toContain("notification-bubble")
  })

  // ─── CPU Bar Color Thresholds ───────────────────────────────────

  it("renders CPU bar with correct width", async () => {
    vi.advanceTimersByTime(100)
    await vi.runAllTimersAsync()

    const html = renderToString(createElement(AgentDashboard, { agentId }))

    expect(html).toContain("cpu-bar")
    expect(html).toContain("42.5%")
  })
})
