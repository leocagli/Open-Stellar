import type { MoltbotAgent, District } from "./types"

const PIXEL = 2

function drawRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  ctx.fillRect(x, y, w, h)
}

function drawPixelRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color
  for (let py = 0; py < h; py += PIXEL) {
    for (let px = 0; px < w; px += PIXEL) {
      ctx.fillRect(x + px, y + py, PIXEL, PIXEL)
    }
  }
}

function darken(hex: string, amount: number): string {
  const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount)
  const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount)
  const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount)
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

function lighten(hex: string, amount: number): string {
  const r = Math.min(255, parseInt(hex.slice(1, 3), 16) + amount)
  const g = Math.min(255, parseInt(hex.slice(3, 5), 16) + amount)
  const b = Math.min(255, parseInt(hex.slice(5, 7), 16) + amount)
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`
}

export function drawBuilding(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string, tick: number) {
  drawPixelRect(ctx, x, y, w, h, darken(color, 40))
  drawPixelRect(ctx, x + 2, y + 2, w - 4, 4, lighten(color, 30))

  const winW = 6
  const winH = 6
  const gap = 4
  const cols = Math.floor((w - 10) / (winW + gap))
  const rows = Math.floor((h - 16) / (winH + gap))

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const wx = x + 6 + c * (winW + gap)
      const wy = y + 12 + r * (winH + gap)
      const lit = Math.sin(tick * 0.02 + c * 1.5 + r * 2.3 + x * 0.1) > 0.1
      drawRect(ctx, wx, wy, winW, winH, lit ? lighten(color, 60) : darken(color, 60))
    }
  }
}

export function drawDistrict(ctx: CanvasRenderingContext2D, d: District, tick: number) {
  ctx.fillStyle = d.bgColor
  ctx.fillRect(d.x, d.y, d.w, d.h)

  ctx.strokeStyle = d.color + "44"
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])
  ctx.strokeRect(d.x + 0.5, d.y + 0.5, d.w - 1, d.h - 1)
  ctx.setLineDash([])

  const bx = d.x + 8
  const by = d.y + d.h - 60
  drawBuilding(ctx, bx, by, 30, 52, d.color, tick)
  drawBuilding(ctx, bx + 38, by + 16, 24, 36, d.color, tick)
  drawBuilding(ctx, d.x + d.w - 42, by + 8, 28, 44, d.color, tick)

  ctx.font = "bold 11px monospace"
  ctx.fillStyle = d.color
  ctx.fillText(d.name.toUpperCase(), d.x + 8, d.y + 18)
}

export function drawBot(ctx: CanvasRenderingContext2D, agent: MoltbotAgent, tick: number, isSelected: boolean) {
  const x = Math.round(agent.pixelX)
  const y = Math.round(agent.pixelY)
  const c = agent.color
  const frame = Math.floor(tick / 8) % 4
  const bobY = agent.status === "working" ? Math.sin(tick * 0.15) * 2 : 0

  if (isSelected) {
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(x + 8, y + 10, 16, 0, Math.PI * 2)
    ctx.stroke()
  }

  // shadow
  ctx.fillStyle = "rgba(0,0,0,0.3)"
  ctx.fillRect(x + 2, y + 18, 12, 3)

  // body
  const by = y + bobY
  drawRect(ctx, x + 2, by + 6, 12, 10, darken(c, 40))
  drawRect(ctx, x + 4, by + 8, 8, 6, c)

  // head
  drawRect(ctx, x + 3, by, 10, 8, c)
  drawRect(ctx, x + 5, by + 2, 2, 2, "#000")
  drawRect(ctx, x + 9, by + 2, 2, 2, "#000")

  if (agent.status === "working") {
    drawRect(ctx, x + 5, by + 2, 2, 2, "#fff")
    drawRect(ctx, x + 9, by + 2, 2, 2, "#fff")
  }
  if (agent.status === "error") {
    drawRect(ctx, x + 5, by + 2, 2, 2, "#f87171")
    drawRect(ctx, x + 9, by + 2, 2, 2, "#f87171")
  }

  // antenna
  drawRect(ctx, x + 7, by - 4, 2, 4, c)
  const antennaGlow = Math.sin(tick * 0.1) > 0
  if (agent.status !== "offline") {
    drawRect(ctx, x + 6, by - 6, 4, 2, antennaGlow ? lighten(c, 80) : c)
  }

  // legs
  const legFrame = agent.status === "working" || (agent.pixelX !== agent.targetX) ? frame : 0
  if (legFrame % 2 === 0) {
    drawRect(ctx, x + 4, by + 16, 2, 4, darken(c, 30))
    drawRect(ctx, x + 10, by + 14, 2, 4, darken(c, 30))
  } else {
    drawRect(ctx, x + 4, by + 14, 2, 4, darken(c, 30))
    drawRect(ctx, x + 10, by + 16, 2, 4, darken(c, 30))
  }

  // arms
  if (agent.status === "working") {
    const armSwing = Math.sin(tick * 0.2) * 2
    drawRect(ctx, x, by + 8 + armSwing, 2, 6, darken(c, 20))
    drawRect(ctx, x + 14, by + 8 - armSwing, 2, 6, darken(c, 20))
  } else {
    drawRect(ctx, x, by + 8, 2, 6, darken(c, 20))
    drawRect(ctx, x + 14, by + 8, 2, 6, darken(c, 20))
  }

  // status indicator
  const statusColors: Record<string, string> = {
    active: "#34d399",
    working: "#fbbf24",
    idle: "#64748b",
    error: "#f87171",
    offline: "#1e293b",
  }
  drawRect(ctx, x + 14, by, 4, 4, statusColors[agent.status] || "#64748b")

  // name label
  ctx.font = "9px monospace"
  ctx.fillStyle = c
  ctx.textAlign = "center"
  ctx.fillText(agent.name, x + 8, y + 28)
  ctx.textAlign = "left"

  // task progress bar
  if (agent.status === "working" && agent.taskProgress > 0) {
    const barW = 20
    const barH = 3
    const bx = x - 2
    const barY = y + 30
    drawRect(ctx, bx, barY, barW, barH, "#1e293b")
    drawRect(ctx, bx, barY, Math.floor(barW * agent.taskProgress / 100), barH, c)
  }
}

export function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = "#1a2235"
  ctx.lineWidth = 0.5
  for (let x = 0; x < w; x += 40) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, h)
    ctx.stroke()
  }
  for (let y = 0; y < h; y += 40) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(w, y)
    ctx.stroke()
  }
}

export function drawRoads(ctx: CanvasRenderingContext2D, districts: District[]) {
  ctx.strokeStyle = "#2a3a52"
  ctx.lineWidth = 4
  ctx.setLineDash([8, 6])

  for (let i = 0; i < districts.length - 1; i++) {
    const a = districts[i]
    const b = districts[i + 1]
    const ax = a.x + a.w / 2
    const ay = a.y + a.h / 2
    const bx = b.x + b.w / 2
    const by = b.y + b.h / 2
    ctx.beginPath()
    ctx.moveTo(ax, ay)
    ctx.lineTo(bx, by)
    ctx.stroke()
  }

  ctx.setLineDash([])
}

export function drawStars(ctx: CanvasRenderingContext2D, w: number, h: number, tick: number) {
  for (let i = 0; i < 60; i++) {
    const sx = (i * 137.5 + 50) % w
    const sy = (i * 97.3 + 20) % (h * 0.3)
    const brightness = Math.sin(tick * 0.03 + i * 1.7) * 0.5 + 0.5
    ctx.fillStyle = `rgba(255,255,255,${0.2 + brightness * 0.5})`
    ctx.fillRect(sx, sy, 2, 2)
  }
}
