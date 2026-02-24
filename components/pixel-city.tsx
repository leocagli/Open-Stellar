"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import type { MoltbotAgent, District } from "@/lib/types"
import { drawGrid, drawRoads, drawDistrict, drawBot } from "@/lib/renderer"

const BG_IMAGES: Record<string, string> = {
  sky: "/bg-sky.jpg",
  "data-center": "/bg-data-center.jpg",
  "comm-hub": "/bg-comm-hub.jpg",
  processing: "/bg-processing.jpg",
  defense: "/bg-defense.jpg",
  research: "/bg-research.jpg",
}

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
  const [images, setImages] = useState<Record<string, HTMLImageElement>>({})

  // Preload all background images
  useEffect(() => {
    const loaded: Record<string, HTMLImageElement> = {}
    let count = 0
    const total = Object.keys(BG_IMAGES).length

    Object.entries(BG_IMAGES).forEach(([key, src]) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        loaded[key] = img
        count++
        if (count === total) {
          setImages({ ...loaded })
        }
      }
      img.onerror = () => {
        count++
        if (count === total) setImages({ ...loaded })
      }
      img.src = src
    })
  }, [])

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

    // Sky background
    ctx.clearRect(0, 0, w, h)
    if (images.sky) {
      ctx.drawImage(images.sky, 0, 0, w, h)
      // Darken overlay for better contrast
      ctx.fillStyle = "rgba(10, 14, 23, 0.35)"
      ctx.fillRect(0, 0, w, h)
    } else {
      ctx.fillStyle = "#0a0e17"
      ctx.fillRect(0, 0, w, h)
    }

    // Animated pixel stars on top of sky image
    for (let i = 0; i < 80; i++) {
      const sx = (i * 137.5 + 50) % w
      const sy = (i * 97.3 + 20) % (h * 0.4)
      const brightness = Math.sin(tick * 0.03 + i * 1.7) * 0.5 + 0.5
      ctx.fillStyle = `rgba(255,255,255,${0.15 + brightness * 0.45})`
      const size = i % 5 === 0 ? 3 : 2
      ctx.fillRect(Math.round(sx), Math.round(sy), size, size)
    }

    drawGrid(ctx, w, h)
    drawRoads(ctx, districts)

    // Draw districts with background images
    for (const d of districts) {
      drawDistrict(ctx, d, tick, images[d.id])
    }

    // Draw agents sorted by Y for depth
    const sorted = [...agents].sort((a, b) => a.pixelY - b.pixelY)
    for (const agent of sorted) {
      drawBot(ctx, agent, tick, agent.id === selectedAgentId)
    }

    // Title
    ctx.font = "bold 14px monospace"
    ctx.fillStyle = "#22d3ee"
    ctx.textAlign = "left"
    ctx.fillText("MOLTBOT CITY", 40, 30)
    ctx.font = "10px monospace"
    ctx.fillStyle = "#64748b"
    ctx.fillText(`TICK ${tick}  |  ${agents.length} AGENTS DEPLOYED`, 40, 44)
  }, [agents, districts, selectedAgentId, tick, images])

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
