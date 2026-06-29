"use client"

import { useEffect, useState, useCallback, useRef } from "react"

// ─── Types ─────────────────────────────────────────────────────────

interface AgentPosition {
  agentId: string
  lat: number
  lng: number
  timestamp: string
}

interface AgentHealth {
  status: "healthy" | "degraded" | "offline"
  cpu: number
  memory: number
  uptime: number
  missedHeartbeats: number
  lastHeartbeat: string
}

interface ReputationData {
  score: number
  badge: string
  totalActions: number
}

interface NotificationSummary {
  unreadCount: number
}

interface DashboardState {
  position: AgentPosition | null
  health: AgentHealth | null
  reputation: ReputationData | null
  notifications: NotificationSummary | null
  loading: boolean
  error: string | null
}

// ─── Constants ────────────────────────────────────────────────────

const HEALTH_POLL_INTERVAL_MS = 30_000
const SSE_RETRY_MS = 3_000

// ─── Component ────────────────────────────────────────────────────

export interface AgentDashboardProps {
  agentId: string
}

export function AgentDashboard({ agentId }: AgentDashboardProps) {
  const [state, setState] = useState<DashboardState>({
    position: null,
    health: null,
    reputation: null,
    notifications: null,
    loading: true,
    error: null,
  })

  const sseRef = useRef<EventSource | null>(null)
  const healthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const mountedRef = useRef(true)

  // ─── SSE: Position Stream ──────────────────────────────────────

  const connectPositionStream = useCallback(() => {
    if (sseRef.current) {
      sseRef.current.close()
    }

    const url = `/api/agents/positions`
    const es = new EventSource(url)
    sseRef.current = es

    es.addEventListener("agent.positions.snapshot", (e) => {
      if (!mountedRef.current) return
      try {
        const data = JSON.parse(e.data)
        const positions = data.positions || []
        const mine = positions.find((p: any) => p.agentId === agentId)
        if (mine) {
          setState((prev) => ({
            ...prev,
            position: {
              agentId: mine.agentId,
              lat: mine.lat,
              lng: mine.lng,
              timestamp: mine.timestamp,
            },
            loading: false,
          }))
        }
      } catch {
        // silently ignore parse errors
      }
    })

    es.addEventListener("agent.positions.delta", (e) => {
      if (!mountedRef.current) return
      try {
        const data = JSON.parse(e.data)
        if (data.agentId === agentId) {
          setState((prev) => ({
            ...prev,
            position: {
              agentId: data.agentId,
              lat: data.lat,
              lng: data.lng,
              timestamp: data.timestamp,
            },
            loading: false,
          }))
        }
      } catch {
        // silently ignore parse errors
      }
    })

    es.addEventListener("error", () => {
      if (!mountedRef.current) return
      // Auto-reconnect after delay
      setTimeout(() => {
        if (mountedRef.current) connectPositionStream()
      }, SSE_RETRY_MS)
    })

    es.onopen = () => {
      if (!mountedRef.current) return
      setState((prev) => ({ ...prev, error: null }))
    }
  }, [agentId])

  // ─── Polling: Health ─────────────────────────────────────────────

  const fetchHealth = useCallback(async () => {
    try {
      const res = await fetch(`/api/agents/${encodeURIComponent(agentId)}/health`, {
        cache: "no-store",
      })
      if (!res.ok) {
        if (res.status === 404) {
          setState((prev) => ({
            ...prev,
            health: {
              status: "offline",
              cpu: 0,
              memory: 0,
              uptime: 0,
              missedHeartbeats: 0,
              lastHeartbeat: "",
            },
            loading: false,
          }))
          return
        }
        throw new Error(`Health fetch failed: ${res.status}`)
      }
      const data = await res.json()
      setState((prev) => ({
        ...prev,
        health: data.health,
        loading: false,
      }))
    } catch (err) {
      if (!mountedRef.current) return
      setState((prev) => ({
        ...prev,
        health: {
          status: "offline",
          cpu: 0,
          memory: 0,
          uptime: 0,
          missedHeartbeats: 0,
          lastHeartbeat: "",
        },
        error: err instanceof Error ? err.message : "Health check failed",
        loading: false,
      }))
    }
  }, [agentId])

  // ─── Fetch: Reputation ──────────────────────────────────────────

  const fetchReputation = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/protocol/reputation?actorId=${encodeURIComponent(agentId)}`,
        { cache: "no-store" }
      )
      if (!res.ok) throw new Error(`Reputation fetch failed: ${res.status}`)
      const data = await res.json()
      setState((prev) => ({
        ...prev,
        reputation: data.reputation,
        loading: false,
      }))
    } catch (err) {
      if (!mountedRef.current) return
      setState((prev) => ({
        ...prev,
        reputation: null,
        error: err instanceof Error ? err.message : "Reputation fetch failed",
        loading: false,
      }))
    }
  }, [agentId])

  // ─── Fetch: Notifications ───────────────────────────────────────

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/notifications?agentId=${encodeURIComponent(agentId)}&limit=1`,
        { cache: "no-store" }
      )
      if (!res.ok) throw new Error(`Notifications fetch failed: ${res.status}`)
      const data = await res.json()
      setState((prev) => ({
        ...prev,
        notifications: { unreadCount: data.unreadCount ?? 0 },
        loading: false,
      }))
    } catch (err) {
      if (!mountedRef.current) return
      setState((prev) => ({
        ...prev,
        notifications: null,
        error: err instanceof Error ? err.message : "Notifications fetch failed",
        loading: false,
      }))
    }
  }, [agentId])

  // ─── Mount / Unmount ─────────────────────────────────────────────

  useEffect(() => {
    mountedRef.current = true
    setState((prev) => ({ ...prev, loading: true, error: null }))

    // Start all data sources
    connectPositionStream()
    fetchHealth()
    fetchReputation()
    fetchNotifications()

    // Health polling interval (30s)
    healthIntervalRef.current = setInterval(fetchHealth, HEALTH_POLL_INTERVAL_MS)

    return () => {
      mountedRef.current = false
      if (sseRef.current) {
        sseRef.current.close()
        sseRef.current = null
      }
      if (healthIntervalRef.current) {
        clearInterval(healthIntervalRef.current)
        healthIntervalRef.current = null
      }
    }
  }, [agentId, connectPositionStream, fetchHealth, fetchReputation, fetchNotifications])

  // ─── Derived State ─────────────────────────────────────────────

  const isLoading = state.loading
  const isError = !!state.error &&
    !state.position &&
    !state.health &&
    !state.reputation &&
    !state.notifications

  const healthStatus = state.health?.status ?? "offline"
  const statusColor =
    healthStatus === "healthy"
      ? "#34d399"
      : healthStatus === "degraded"
      ? "#fbbf24"
      : "#f87171"

  const statusLabel = healthStatus.charAt(0).toUpperCase() + healthStatus.slice(1)

  // ─── Render ──────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div
        data-testid="agent-dashboard-loading"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 320,
          borderRadius: 12,
          border: "1px solid #2a3a52",
          background: "rgba(15, 23, 42, 0.86)",
          color: "#94a3b8",
          fontSize: 14,
        }}
      >
        <span style={{ marginRight: 10 }} className="animate-spin">⟳</span>
        Loading agent dashboard…
      </div>
    )
  }

  if (isError) {
    return (
      <div
        data-testid="agent-dashboard-error"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
          minHeight: 320,
          borderRadius: 12,
          border: "1px solid #7f1d1d",
          background: "rgba(127, 29, 29, 0.15)",
          color: "#fca5a5",
          fontSize: 14,
          padding: 24,
        }}
      >
        <span style={{ fontSize: 24 }}>⚠</span>
        <span>{state.error}</span>
        <button
          onClick={() => {
            setState((prev) => ({ ...prev, loading: true, error: null }))
            connectPositionStream()
            fetchHealth()
            fetchReputation()
            fetchNotifications()
          }}
          style={{
            marginTop: 8,
            padding: "6px 14px",
            borderRadius: 6,
            border: "1px solid #fca5a5",
            background: "transparent",
            color: "#fca5a5",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div
      data-testid="agent-dashboard"
      style={{
        borderRadius: 12,
        border: "1px solid #2a3a52",
        background: "rgba(15, 23, 42, 0.86)",
        color: "#e2e8f0",
        padding: 20,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        minWidth: 320,
        maxWidth: 480,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            data-testid="health-badge"
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: statusColor,
              boxShadow: `0 0 8px ${statusColor}`,
            }}
          />
          <span style={{ fontWeight: 600, fontSize: 15 }}>
            Agent {agentId.slice(0, 8)}…
          </span>
        </div>
        {state.notifications && state.notifications.unreadCount > 0 && (
          <div
            data-testid="notification-bubble"
            style={{
              background: "#ef4444",
              color: "#fff",
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 999,
              minWidth: 20,
              textAlign: "center",
            }}
          >
            {state.notifications.unreadCount}
          </div>
        )}
      </div>

      {/* Health Status */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 13,
            color: "#94a3b8",
          }}
        >
          <span>Status</span>
          <span style={{ color: statusColor, fontWeight: 600 }}>{statusLabel}</span>
        </div>

        {/* CPU Bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#64748b",
            }}
          >
            <span>CPU</span>
            <span>{state.health ? `${state.health.cpu.toFixed(1)}%` : "--"}</span>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 3,
              background: "#1e293b",
              overflow: "hidden",
            }}
          >
            <div
              data-testid="cpu-bar"
              style={{
                width: `${state.health?.cpu ?? 0}%`,
                height: "100%",
                background:
                  (state.health?.cpu ?? 0) > 80
                    ? "#f87171"
                    : (state.health?.cpu ?? 0) > 50
                    ? "#fbbf24"
                    : "#34d399",
                borderRadius: 3,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>

        {/* Memory Bar */}
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              fontSize: 12,
              color: "#64748b",
            }}
          >
            <span>Memory</span>
            <span>{state.health ? `${state.health.memory.toFixed(1)}%` : "--"}</span>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 3,
              background: "#1e293b",
              overflow: "hidden",
            }}
          >
            <div
              data-testid="memory-bar"
              style={{
                width: `${state.health?.memory ?? 0}%`,
                height: "100%",
                background:
                  (state.health?.memory ?? 0) > 80
                    ? "#f87171"
                    : (state.health?.memory ?? 0) > 50
                    ? "#fbbf24"
                    : "#34d399",
                borderRadius: 3,
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      </div>

      {/* Position */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 6,
          padding: "12px",
          borderRadius: 8,
          background: "rgba(30, 41, 59, 0.5)",
        }}
      >
        <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
          Live Position
        </span>
        {state.position ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                fontFamily: "monospace",
              }}
            >
              <span style={{ color: "#94a3b8" }}>lat</span>
              <span data-testid="position-lat">{state.position.lat.toFixed(6)}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                fontFamily: "monospace",
              }}
            >
              <span style={{ color: "#94a3b8" }}>lng</span>
              <span data-testid="position-lng">{state.position.lng.toFixed(6)}</span>
            </div>
            <span style={{ fontSize: 11, color: "#475569", marginTop: 2 }}>
              {new Date(state.position.timestamp).toLocaleTimeString()}
            </span>
          </div>
        ) : (
          <span style={{ fontSize: 13, color: "#64748b" }}>No position data</span>
        )}
      </div>

      {/* Reputation */}
      {state.reputation && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "10px 12px",
            borderRadius: 8,
            background: "rgba(30, 41, 59, 0.5)",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span style={{ fontSize: 12, color: "#64748b", fontWeight: 500 }}>
              Reputation
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0" }}>
              {state.reputation.score}
            </span>
          </div>
          <span
            style={{
              padding: "4px 10px",
              borderRadius: 999,
              background: "rgba(52, 211, 153, 0.15)",
              color: "#34d399",
              fontSize: 11,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: 0.5,
            }}
          >
            {state.reputation.badge}
          </span>
        </div>
      )}

      {/* Footer: last updated */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 11,
          color: "#475569",
          marginTop: 4,
        }}
      >
        <span>
          {state.health?.lastHeartbeat
            ? `Last heartbeat: ${new Date(state.health.lastHeartbeat).toLocaleTimeString()}`
            : "No heartbeat recorded"}
        </span>
        {state.health?.missedHeartbeats ? (
          <span style={{ color: "#f87171" }}>
            {state.health.missedHeartbeats} missed
          </span>
        ) : null}
      </div>
    </div>
  )
}
