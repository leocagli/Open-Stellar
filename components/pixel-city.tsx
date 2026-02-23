"use client"

import { useRef, useEffect, useCallback } from "react"
import type { MoltbotAgent, District } from "@/lib/types"
import { drawGrid, drawStars, drawRoads, drawDistrict, drawBot } from "@/lib/renderer"

interface PixelCityProps {
  agents: MoltbotAgent[]
  districts: District[]
  selectedAgentId: string | null
  onSelectAgent: (id: string | null) => void
  tick: number
}

export function PixelCity({ agents, districts, selectedAgentId, onSelectAgent, tick }: PixelCityProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return
    const dpr = window.devicePixelRatio || 1
    const rect = container.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    canvas.style.width = `${rect.width}px`
    canvas.style.height = `${rect.height}px`
    const ctx = canvas.getContext("2d")
    if (ctx) ctx.scale(dpr, dpr)
  }, [])

  useEffect(() => {
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [resizeCanvas])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const w = canvas.width / dpr
    const h = canvas.height / dpr

    ctx.clearRect(0, 0, w, h)
    ctx.fillStyle = "#0a0e17"
    ctx.fillRect(0, 0, w, h)

    drawStars(ctx, w, h, tick)
    drawGrid(ctx, w, h)
    drawRoads(ctx, districts)

    for (const d of districts) {
      drawDistrict(ctx, d, tick)
    }

    const sorted = [...agents].sort((a, b) => a.pixelY - b.pixelY)
    for (const agent of sorted) {
      drawBot(ctx, agent, tick, agent.id === selectedAgentId)
    }

    // title
    ctx.font = "bold 14px monospace"
    ctx.fillStyle = "#22d3ee"
    ctx.textAlign = "left"
    ctx.fillText("MOLTBOT CITY", 40, 30)
    ctx.font = "10px monospace"
    ctx.fillStyle = "#64748b"
    ctx.fillText(`TICK ${tick}  |  ${agents.length} AGENTS DEPLOYED`, 40, 44)
  }, [agents, districts, selectedAgentId, tick])

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const mx = e.clientX - rect.left
      const my = e.clientY - rect.top

      let found: string | null = null
      for (const agent of agents) {
        const dx = mx - (agent.pixelX + 8)
        const dy = my - (agent.pixelY + 10)
        if (Math.sqrt(dx * dx + dy * dy) < 16) {
          found = agent.id
          break
        }
      }
      onSelectAgent(found)
    },
    [agents, onSelectAgent]
  )

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%", position: "relative" }}>
      <canvas
        ref={canvasRef}
        onClick={handleClick}
        style={{ cursor: "crosshair", display: "block", imageRendering: "pixelated" }}
      />
    </div>
  )
}
