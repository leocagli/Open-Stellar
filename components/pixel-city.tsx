"use client"

import { useRef, useEffect, useCallback, useState } from "react"
import type { MoltbotAgent, District } from "@/lib/types"
import { drawGrid, drawRoads, drawDistrict, drawBot } from "@/lib/renderer"

const BG_IMAGES: Record<string, string> = {
  sky: "/bg-sky.gif",
  "data-center": "/bg-data-center.jpg",
  "comm-hub": "/bg-comm-hub.jpg",
  processing: "/bg-processing.jpg",
  defense: "/bg-defense.jpg",
  research: "/bg-research.jpg",
}

const SPRITE_PATHS = [
  "/sprites/robot-tv.gif",      // 0 - TV headed bot
  "/sprites/robot-tank.gif",    // 1 - Tank treaded bot
  "/sprites/robot-blue.gif",    // 2 - Blue cartoon bot
  "/sprites/robot-gold.gif",    // 3 - Gold pixel bot
  "/sprites/robot-runner.gif",  // 4 - Running humanoid bot
  "/sprites/robot-heavy.webp",  // 5 - Heavy dark bot
  "/sprites/robot-green.gif",   // 6 - Green walking bot
]

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
  const [sprites, setSprites] = useState<HTMLImageElement[]>([])

  // Preload all background images and robot sprites
  useEffect(() => {
    const loaded: Record<string, HTMLImageElement> = {}
    const loadedSprites: (HTMLImageElement | null)[] = new Array(SPRITE_PATHS.length).fill(null)
    let count = 0
    const totalBg = Object.keys(BG_IMAGES).length
    const totalSprites = SPRITE_PATHS.length
    const total = totalBg + totalSprites

    Object.entries(BG_IMAGES).forEach(([key, src]) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        loaded[key] = img
        count++
        if (count === total) {
          setImages({ ...loaded })
          setSprites(loadedSprites.filter(Boolean) as HTMLImageElement[])
        }
      }
      img.onerror = () => {
        count++
        if (count === total) {
          setImages({ ...loaded })
          setSprites(loadedSprites.filter(Boolean) as HTMLImageElement[])
        }
      }
      img.src = src
    })

    SPRITE_PATHS.forEach((src, idx) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        loadedSprites[idx] = img
        count++
        if (count === total) {
          setImages({ ...loaded })
          setSprites(loadedSprites.filter(Boolean) as HTMLImageElement[])
        }
      }
      img.onerror = () => {
        count++
        if (count === total) {
          setImages({ ...loaded })
          setSprites(loadedSprites.filter(Boolean) as HTMLImageElement[])
        }
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

    // Sky background -- animated GIF drawn each frame
    ctx.clearRect(0, 0, w, h)
    if (images.sky) {
      ctx.drawImage(images.sky, 0, 0, w, h)
      // Very light overlay so district zones stand out
      ctx.fillStyle = "rgba(10, 14, 23, 0.2)"
      ctx.fillRect(0, 0, w, h)
    } else {
      ctx.fillStyle = "#0a0e17"
      ctx.fillRect(0, 0, w, h)
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
      const agentSprite = sprites[agent.spriteId % sprites.length] || sprites[0]
      drawBot(ctx, agent, tick, agent.id === selectedAgentId, agentSprite)
    }

    // Title
    ctx.font = "bold 14px monospace"
    ctx.fillStyle = "#22d3ee"
    ctx.textAlign = "left"
    ctx.fillText("MOLTBOT CITY", 40, 30)
    ctx.font = "10px monospace"
    ctx.fillStyle = "#64748b"
    ctx.fillText(`TICK ${tick}  |  ${agents.length} AGENTS DEPLOYED`, 40, 44)
  }, [agents, districts, selectedAgentId, tick, images, sprites])

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
