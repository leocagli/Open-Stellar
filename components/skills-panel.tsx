"use client"

import type { MoltbotAgent, Skill } from "@/lib/types"

function SkillPips({ level, maxLevel, color }: { level: number; maxLevel: number; color: string }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {Array.from({ length: maxLevel }).map((_, i) => (
        <div
          key={i}
          style={{
            width: 8,
            height: 8,
            borderRadius: 2,
            background: i < level ? color : "#1e293b",
            border: `1px solid ${i < level ? color : "#334155"}`,
            transition: "background 0.3s",
          }}
        />
      ))}
    </div>
  )
}

function SkillCard({ skill, color }: { skill: Skill; color: string }) {
  const xpPct = Math.min(100, (skill.xp / skill.xpToNext) * 100)
  return (
    <div
      style={{
        background: "#111827",
        border: "1px solid #1e293b",
        borderRadius: 6,
        padding: "10px 12px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 600, color: "#e2e8f0" }}>
          {skill.name}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b" }}>
          Lv.{skill.level}
        </span>
      </div>
      <SkillPips level={skill.level} maxLevel={skill.maxLevel} color={color} />
      {skill.level < skill.maxLevel && (
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <div style={{ flex: 1, height: 3, background: "#1e293b", borderRadius: 2, overflow: "hidden" }}>
            <div
              style={{
                width: `${xpPct}%`,
                height: "100%",
                background: color + "88",
                borderRadius: 2,
                transition: "width 0.3s",
              }}
            />
          </div>
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "#475569" }}>
            {skill.xp}/{skill.xpToNext} XP
          </span>
        </div>
      )}
      {skill.level >= skill.maxLevel && (
        <span style={{ fontFamily: "monospace", fontSize: 9, color, fontWeight: 700 }}>
          MAX LEVEL
        </span>
      )}
    </div>
  )
}

interface SkillsPanelProps {
  selectedAgent: MoltbotAgent | null
  agents: MoltbotAgent[]
}

export function SkillsPanel({ selectedAgent, agents }: SkillsPanelProps) {
  if (!selectedAgent) {
    return (
      <div style={{ padding: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
        <div style={{ fontSize: 28, opacity: 0.3 }}>?</div>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#475569", textAlign: "center" }}>
          Select a bot on the map or agent list to view its skills
        </span>
      </div>
    )
  }

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: "1px solid #1e293b" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedAgent.color }} />
        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: selectedAgent.color }}>
          {selectedAgent.name}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", marginLeft: "auto" }}>
          {selectedAgent.skills.length} skills
        </span>
      </div>

      <div style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1 }}>
        District: {selectedAgent.district}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {selectedAgent.skills.map(skill => (
          <SkillCard key={skill.id} skill={skill} color={selectedAgent.color} />
        ))}
      </div>

      <div style={{ marginTop: 8, padding: 10, background: "#0f172a", borderRadius: 6, border: "1px solid #1e293b" }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>
          Skill Summary
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "#475569" }}>Total Level</div>
            <div suppressHydrationWarning style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: selectedAgent.color }}>
              {selectedAgent.skills.reduce((s, sk) => s + sk.level, 0)}
            </div>
          </div>
          <div>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "#475569" }}>Maxed</div>
            <div suppressHydrationWarning style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#34d399" }}>
              {selectedAgent.skills.filter(sk => sk.level >= sk.maxLevel).length}/{selectedAgent.skills.length}
            </div>
          </div>
        </div>
      </div>

      {/* Other agents skill count overview */}
      <div style={{ marginTop: 4, padding: 10, background: "#0f172a", borderRadius: 6, border: "1px solid #1e293b" }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          All Bots Skill Overview
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {agents.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
              <span style={{ fontFamily: "monospace", fontSize: 10, color: a.id === selectedAgent.id ? a.color : "#94a3b8", flex: 1, fontWeight: a.id === selectedAgent.id ? 700 : 400 }}>
                {a.name}
              </span>
              <span suppressHydrationWarning style={{ fontFamily: "monospace", fontSize: 10, color: "#475569" }}>
                {a.skills.reduce((s, sk) => s + sk.level, 0)} pts
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
