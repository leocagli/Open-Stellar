import { cn } from "@/lib/utils"
import type { MoltbotAgent, DistrictType } from "@/lib/types"
import { StatusDot } from "./status-indicator"
import { useState, useMemo } from "react"

const DISTRICT_COLORS: Record<DistrictType, { fill: string; stroke: string; roof: string; glow: string; text: string }> = {
  "data-center":  { fill: "#0d3331", stroke: "#00d2be", roof: "#115e58", glow: "rgba(0,210,190,0.3)", text: "text-[hsl(var(--district-data))]" },
  "comm-hub":     { fill: "#251540", stroke: "#8b5cf6", roof: "#3b1f70", glow: "rgba(139,92,246,0.3)", text: "text-[hsl(var(--district-comm))]" },
  "processing":   { fill: "#3a2508", stroke: "#f59e0b", roof: "#5c3a10", glow: "rgba(245,158,11,0.3)", text: "text-[hsl(var(--district-process))]" },
  "defense":      { fill: "#3b0d0d", stroke: "#ef4444", roof: "#5c1515", glow: "rgba(239,68,68,0.3)", text: "text-[hsl(var(--district-defense))]" },
  "research":     { fill: "#0d3318", stroke: "#22c55e", roof: "#155e2b", glow: "rgba(34,197,94,0.3)", text: "text-[hsl(var(--district-research))]" },
}

const DISTRICT_LABELS: Record<DistrictType, string> = {
  "data-center": "DATA CENTER", "comm-hub": "COMM HUB", "processing": "PROCESSING", "defense": "DEFENSE", "research": "RESEARCH",
}

const DISTRICT_ORDER: DistrictType[] = ["data-center", "comm-hub", "processing", "defense", "research"]

function BotCharacter({ agent, x, y, onClick, isSelected }: {
  agent: MoltbotAgent; x: number; y: number; onClick: () => void; isSelected: boolean
}) {
  const col = DISTRICT_COLORS[agent.district]
  const isWorking = agent.status === "working"
  const isOffline = agent.status === "offline"
  const isError = agent.status === "error"
  const bodyColor = isOffline ? "#333" : isError ? "#ef4444" : col.stroke
  const eyeColor = isOffline ? "#555" : isWorking ? "#facc15" : "#fff"

  return (
    <g
      onClick={onClick}
      className="cursor-pointer"
      style={{ transform: `translate(${x}px, ${y}px)` }}
    >
      {/* Shadow */}
      <ellipse cx="0" cy="30" rx="10" ry="4" fill="rgba(0,0,0,0.4)" />
      {/* Selection ring */}
      {isSelected && (
        <ellipse cx="0" cy="30" rx="14" ry="6" fill="none" stroke={col.stroke} strokeWidth="1.5" strokeDasharray="3 2" opacity="0.8">
          <animateTransform attributeName="transform" type="rotate" from="0 0 30" to="360 0 30" dur="4s" repeatCount="indefinite" />
        </ellipse>
      )}
      {/* Glow when working */}
      {isWorking && <circle cx="0" cy="10" r="18" fill={col.glow} opacity="0.4"><animate attributeName="r" values="16;20;16" dur="2s" repeatCount="indefinite" /></circle>}
      {/* Body */}
      <rect x="-8" y="2" width="16" height="18" rx="3" fill={bodyColor} opacity={isOffline ? 0.3 : 0.9} stroke={isOffline ? "#555" : col.stroke} strokeWidth="0.8" />
      {/* Head */}
      <rect x="-10" y="-12" width="20" height="14" rx="4" fill={isOffline ? "#2a2a2a" : col.fill} stroke={bodyColor} strokeWidth="1" />
      {/* Eyes */}
      <circle cx="-4" cy="-6" r="2.5" fill={eyeColor}>
        {isWorking && <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" />}
      </circle>
      <circle cx="4" cy="-6" r="2.5" fill={eyeColor}>
        {isWorking && <animate attributeName="opacity" values="1;0.3;1" dur="1.5s" repeatCount="indefinite" begin="0.2s" />}
      </circle>
      {/* Antenna */}
      <line x1="0" y1="-12" x2="0" y2="-18" stroke={bodyColor} strokeWidth="1.2" />
      <circle cx="0" cy="-19" r="2" fill={isWorking ? "#facc15" : isError ? "#ef4444" : bodyColor}>
        {isWorking && <animate attributeName="fill" values={`${col.stroke};#facc15;${col.stroke}`} dur="1s" repeatCount="indefinite" />}
      </circle>
      {/* Arms */}
      <line x1="-8" y1="6" x2="-13" y2="12" stroke={bodyColor} strokeWidth="1.5" strokeLinecap="round">
        {isWorking && <animateTransform attributeName="transform" type="rotate" values="0 -8 6;-15 -8 6;0 -8 6" dur="0.8s" repeatCount="indefinite" />}
      </line>
      <line x1="8" y1="6" x2="13" y2="12" stroke={bodyColor} strokeWidth="1.5" strokeLinecap="round">
        {isWorking && <animateTransform attributeName="transform" type="rotate" values="0 8 6;15 8 6;0 8 6" dur="0.8s" repeatCount="indefinite" begin="0.4s" />}
      </line>
      {/* Legs */}
      <line x1="-4" y1="20" x2="-5" y2="28" stroke={bodyColor} strokeWidth="1.5" strokeLinecap="round" />
      <line x1="4" y1="20" x2="5" y2="28" stroke={bodyColor} strokeWidth="1.5" strokeLinecap="round" />
      {/* Avatar label */}
      <text x="0" y="6" textAnchor="middle" fill="#fff" fontSize="6" fontFamily="monospace" fontWeight="bold" opacity={isOffline ? 0.3 : 1}>{agent.avatar}</text>
      {/* Name label */}
      <text x="0" y="42" textAnchor="middle" fill={bodyColor} fontSize="7" fontFamily="monospace" fontWeight="600" opacity={isOffline ? 0.3 : 0.9}>{agent.name.slice(0, 10)}</text>
      {/* Progress bar for working */}
      {agent.currentTask && (
        <g>
          <rect x="-12" y="48" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.1)" />
          <rect x="-12" y="48" width={Math.max(1, 24 * agent.currentTask.progress / 100)} height="3" rx="1.5" fill="#facc15" />
        </g>
      )}
    </g>
  )
}

function CityBuilding({ x, y, w, h, district }: { x: number; y: number; w: number; h: number; district: DistrictType }) {
  const col = DISTRICT_COLORS[district]
  return (
    <g>
      <rect x={x} y={y - h} width={w} height={h} fill={col.fill} stroke={col.stroke} strokeWidth="0.5" opacity="0.7" rx="1" />
      <rect x={x} y={y - h} width={w} height={4} fill={col.roof} opacity="0.8" rx="1" />
      {/* Windows */}
      {Array.from({ length: Math.floor(h / 10) }).map((_, i) =>
        Array.from({ length: Math.floor(w / 8) }).map((_, j) => (
          <rect
            key={`${i}-${j}`}
            x={x + 3 + j * 8}
            y={y - h + 7 + i * 10}
            width="4"
            height="5"
            fill={Math.random() > 0.3 ? col.stroke : "transparent"}
            opacity={0.15 + Math.random() * 0.25}
            rx="0.5"
          />
        ))
      )}
    </g>
  )
}

interface Props { agents: MoltbotAgent[]; selectedAgent: MoltbotAgent | null; onSelectAgent: (a: MoltbotAgent) => void }

export function CityGrid({ agents, selectedAgent, onSelectAgent }: Props) {
  const [hoveredDistrict, setHoveredDistrict] = useState<DistrictType | null>(null)

  const districtAgents = useMemo(() => {
    const map: Record<DistrictType, MoltbotAgent[]> = {
      "data-center": [], "comm-hub": [], "processing": [], "defense": [], "research": [],
    }
    agents.forEach((a) => map[a.district].push(a))
    return map
  }, [agents])

  const SVG_W = 1100
  const SVG_H = 600
  const ZONE_W = SVG_W / DISTRICT_ORDER.length
  const GROUND_Y = SVG_H - 60

  return (
    <div className="flex-1 overflow-auto p-3">
      <div className="grid-city min-h-full rounded-lg border border-border bg-background/30 p-2">
        <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} className="w-full h-auto" style={{ minHeight: 420 }}>
          <defs>
            <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#060a14" />
              <stop offset="100%" stopColor="#0e1525" />
            </linearGradient>
            {DISTRICT_ORDER.map((d) => (
              <linearGradient key={d} id={`ground-${d}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={DISTRICT_COLORS[d].stroke} stopOpacity="0.08" />
                <stop offset="100%" stopColor={DISTRICT_COLORS[d].stroke} stopOpacity="0.02" />
              </linearGradient>
            ))}
          </defs>

          {/* Sky */}
          <rect x="0" y="0" width={SVG_W} height={SVG_H} fill="url(#sky)" />

          {/* Stars */}
          {Array.from({ length: 40 }).map((_, i) => (
            <circle
              key={`star-${i}`}
              cx={Math.random() * SVG_W}
              cy={Math.random() * (GROUND_Y - 80)}
              r={Math.random() * 1.2 + 0.3}
              fill="#fff"
              opacity={0.2 + Math.random() * 0.4}
            >
              <animate attributeName="opacity" values={`${0.2 + Math.random() * 0.3};${0.5 + Math.random() * 0.4};${0.2 + Math.random() * 0.3}`} dur={`${2 + Math.random() * 4}s`} repeatCount="indefinite" />
            </circle>
          ))}

          {/* Ground line */}
          <line x1="0" y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke="rgba(255,255,255,0.06)" strokeWidth="1" />

          {/* District zones */}
          {DISTRICT_ORDER.map((district, i) => {
            const x0 = i * ZONE_W
            const dAgents = districtAgents[district]
            const col = DISTRICT_COLORS[district]
            const isHovered = hoveredDistrict === district

            return (
              <g
                key={district}
                onMouseEnter={() => setHoveredDistrict(district)}
                onMouseLeave={() => setHoveredDistrict(null)}
              >
                {/* Zone ground */}
                <rect x={x0} y={GROUND_Y} width={ZONE_W} height={SVG_H - GROUND_Y} fill={`url(#ground-${district})`} />

                {/* Zone separator */}
                {i > 0 && <line x1={x0} y1={GROUND_Y - 120} x2={x0} y2={SVG_H} stroke="rgba(255,255,255,0.04)" strokeWidth="1" strokeDasharray="4 4" />}

                {/* District highlight on hover */}
                {isHovered && <rect x={x0} y={0} width={ZONE_W} height={SVG_H} fill={col.stroke} opacity="0.03" />}

                {/* Buildings */}
                <CityBuilding x={x0 + 10} y={GROUND_Y} w={28} h={70 + i * 12} district={district} />
                <CityBuilding x={x0 + 45} y={GROUND_Y} w={22} h={45 + i * 8} district={district} />
                <CityBuilding x={x0 + ZONE_W - 55} y={GROUND_Y} w={24} h={55 + i * 10} district={district} />
                <CityBuilding x={x0 + ZONE_W - 25} y={GROUND_Y} w={18} h={35 + i * 6} district={district} />
                {ZONE_W > 160 && <CityBuilding x={x0 + ZONE_W / 2 - 12} y={GROUND_Y} w={24} h={80 + i * 5} district={district} />}

                {/* District label */}
                <text
                  x={x0 + ZONE_W / 2}
                  y={GROUND_Y + 25}
                  textAnchor="middle"
                  fill={col.stroke}
                  fontSize="9"
                  fontFamily="monospace"
                  fontWeight="600"
                  letterSpacing="2"
                  opacity={isHovered ? 1 : 0.5}
                >
                  {DISTRICT_LABELS[district]}
                </text>

                {/* Agent count */}
                <text
                  x={x0 + ZONE_W / 2}
                  y={GROUND_Y + 38}
                  textAnchor="middle"
                  fill={col.stroke}
                  fontSize="8"
                  fontFamily="monospace"
                  opacity="0.4"
                >
                  {dAgents.length} agent{dAgents.length !== 1 ? "s" : ""}
                </text>

                {/* Bot characters */}
                {dAgents.map((agent, aIdx) => {
                  const cols = Math.min(dAgents.length, 4)
                  const row = Math.floor(aIdx / cols)
                  const col2 = aIdx % cols
                  const spacing = Math.min(50, (ZONE_W - 40) / cols)
                  const startX = x0 + (ZONE_W - (cols - 1) * spacing) / 2
                  const bx = startX + col2 * spacing
                  const by = GROUND_Y - 40 - row * 65
                  return (
                    <BotCharacter
                      key={agent.id}
                      agent={agent}
                      x={bx}
                      y={by}
                      onClick={() => onSelectAgent(agent)}
                      isSelected={selectedAgent?.id === agent.id}
                    />
                  )
                })}
              </g>
            )
          })}

          {/* City title glow line at ground */}
          <line x1="0" y1={GROUND_Y} x2={SVG_W} y2={GROUND_Y} stroke="rgba(0,210,190,0.15)" strokeWidth="0.5" />
        </svg>

        {agents.length === 0 && (
          <div className="flex h-32 items-center justify-center">
            <p className="text-sm font-mono text-muted-foreground">No agents in this district</p>
          </div>
        )}
      </div>
    </div>
  )
}
