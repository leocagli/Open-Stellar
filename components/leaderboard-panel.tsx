"use client"

import { useEffect, useState } from "react"

interface LeaderboardEntry {
  rank: number
  agentId: string
  totalXp: number
  weeklyDelta: number
  topBadge: string | null
}

function truncateAgentId(id: string): string {
  if (id.length <= 12) return id
  return `${id.slice(0, 6)}...${id.slice(-4)}`
}

export function LeaderboardPanel() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        setLoading(true)
        const res = await fetch("/api/agents/leaderboard?period=weekly&limit=5")
        if (!res.ok) throw new Error("Failed to fetch leaderboard")
        const data = await res.json()
        if (data.ok) {
          setEntries(data.entries)
        } else {
          throw new Error(data.error || "Failed to fetch leaderboard")
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchLeaderboard()
    // Refresh every 60s
    const interval = setInterval(fetchLeaderboard, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 12,
        padding: 16,
        background: "#0f172a",
        borderRadius: 8,
        border: "1px solid #1e293b",
        fontFamily: "monospace",
        width: "100%",
        maxWidth: 350,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <h3 style={{ margin: 0, fontSize: 14, color: "#e2e8f0", textTransform: "uppercase", letterSpacing: 1 }}>
          Leaderboard <span style={{ color: "#64748b", fontSize: 10 }}>Top 5</span>
        </h3>
      </div>

      {loading && entries.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: 12, textAlign: "center", padding: "20px 0" }}>Loading...</div>
      ) : error && entries.length === 0 ? (
        <div style={{ color: "#ef4444", fontSize: 12, textAlign: "center", padding: "20px 0" }}>{error}</div>
      ) : entries.length === 0 ? (
        <div style={{ color: "#64748b", fontSize: 12, textAlign: "center", padding: "20px 0" }}>No agents ranked yet.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", paddingBottom: 6, borderBottom: "1px solid #1e293b", fontSize: 10, color: "#94a3b8", textTransform: "uppercase" }}>
            <div style={{ width: 24, textAlign: "center" }}>#</div>
            <div style={{ flex: 1, paddingLeft: 8 }}>Agent</div>
            <div style={{ width: 60, textAlign: "right" }}>XP</div>
            <div style={{ width: 50, textAlign: "right" }}>7d</div>
          </div>
          
          {entries.map((entry) => (
            <div key={entry.agentId} style={{ display: "flex", alignItems: "center", fontSize: 12 }}>
              <div
                style={{
                  width: 24,
                  height: 24,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: entry.rank <= 3 ? "#fbbf2422" : "#1e293b",
                  color: entry.rank === 1 ? "#fbbf24" : entry.rank === 2 ? "#94a3b8" : entry.rank === 3 ? "#b45309" : "#64748b",
                  borderRadius: "50%",
                  fontWeight: entry.rank <= 3 ? "bold" : "normal",
                  fontSize: 11,
                }}
              >
                {entry.rank}
              </div>
              <div style={{ flex: 1, paddingLeft: 8, color: "#e2e8f0", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                {truncateAgentId(entry.agentId)}
              </div>
              <div style={{ width: 60, textAlign: "right", color: "#38bdf8", fontWeight: "bold" }}>
                {entry.totalXp.toLocaleString()}
              </div>
              <div style={{ width: 50, textAlign: "right", color: entry.weeklyDelta > 0 ? "#4ade80" : "#64748b" }}>
                {entry.weeklyDelta > 0 ? `+${entry.weeklyDelta}` : "-"}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
