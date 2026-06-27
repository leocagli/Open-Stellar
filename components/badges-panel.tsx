"use client"

import type { AgentBadge, MoltbotAgent } from "@/lib/types"
import { BADGE_CATALOG, type Badge } from "@/lib/gamification/badges"

const rarityStyles: Record<Badge["rarity"], { color: string; glow: string; label: string }> = {
  common: { color: "#94a3b8", glow: "none", label: "Common" },
  rare: { color: "#38bdf8", glow: "0 0 14px rgba(56,189,248,0.35)", label: "Rare" },
  epic: { color: "#a78bfa", glow: "0 0 18px rgba(167,139,250,0.45)", label: "Epic" },
  legendary: { color: "#fbbf24", glow: "0 0 22px rgba(251,191,36,0.55)", label: "Legendary" },
}

function BadgeCard({ badge, unlocked }: { badge: Badge | AgentBadge; unlocked: boolean }) {
  const style = rarityStyles[badge.rarity]
  return (
    <div
      title={unlocked ? `${badge.name} unlocked` : badge.description}
      style={{
        minHeight: 118,
        padding: 10,
        borderRadius: 10,
        border: `1px solid ${unlocked ? style.color + "88" : "#1e293b"}`,
        background: unlocked ? "linear-gradient(180deg, #111827, #0f172a)" : "#0b1120",
        boxShadow: unlocked ? style.glow : "none",
        opacity: unlocked ? 1 : 0.48,
        filter: unlocked ? "none" : "grayscale(1)",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 26 }}>{unlocked ? badge.icon : "◇"}</span>
        <span style={{ fontFamily: "monospace", fontSize: 8, color: style.color, textTransform: "uppercase", letterSpacing: 1 }}>
          {style.label}
        </span>
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 12, color: unlocked ? "#e2e8f0" : "#64748b", fontWeight: 700 }}>
        {badge.name}
      </div>
      <div style={{ fontFamily: "monospace", fontSize: 9, color: unlocked ? "#94a3b8" : "#475569", lineHeight: 1.35 }}>
        {unlocked ? `Unlocked ${badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : "recently"}` : badge.description}
      </div>
      {badge.mintable && (
        <div style={{ marginTop: "auto", fontFamily: "monospace", fontSize: 8, color: style.color }}>
          Soroban attestation eligible
        </div>
      )}
    </div>
  )
}

interface BadgesPanelProps {
  selectedAgent: MoltbotAgent | null
}

export function BadgesPanel({ selectedAgent }: BadgesPanelProps) {
  if (!selectedAgent) {
    return (
      <div style={{ padding: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
        <div style={{ fontSize: 28, opacity: 0.3 }}>🏅</div>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#475569", textAlign: "center" }}>
          Select a bot to view achievement badges
        </span>
      </div>
    )
  }

  const unlockedById = new Map((selectedAgent.badges ?? []).map((badge) => [badge.id, badge]))
  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: "1px solid #1e293b" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedAgent.color }} />
        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: selectedAgent.color }}>
          {selectedAgent.name} Badges
        </span>
        <span style={{ marginLeft: "auto", fontFamily: "monospace", fontSize: 10, color: "#64748b" }}>
          {unlockedById.size}/{BADGE_CATALOG.length} unlocked
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 8 }}>
        {BADGE_CATALOG.map((catalogBadge) => {
          const unlocked = unlockedById.get(catalogBadge.id)
          return <BadgeCard key={catalogBadge.id} badge={unlocked ?? catalogBadge} unlocked={Boolean(unlocked)} />
        })}
      </div>
    </div>
  )
}
