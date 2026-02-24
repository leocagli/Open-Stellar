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
  // Main building body
  drawPixelRect(ctx, x, y, w, h, darken(color, 40))
  // Roof accent
  drawPixelRect(ctx, x + 2, y + 2, w - 4, 4, lighten(color, 30))
  // Roof antenna
  drawRect(ctx, x + Math.floor(w / 2) - 1, y - 6, 2, 6, darken(color, 20))
  const blink = Math.sin(tick * 0.1 + x) > 0.5
  drawRect(ctx, x + Math.floor(w / 2) - 2, y - 8, 4, 2, blink ? lighten(color, 80) : darken(color, 30))

  // Windows
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

export function drawDistrict(ctx: CanvasRenderingContext2D, d: District, tick: number, bgImage?: HTMLImageElement) {
  // Save state for clipping
  ctx.save()

  // Clip to district bounds with rounded corners
  const radius = 8
  ctx.beginPath()
  ctx.moveTo(d.x + radius, d.y)
  ctx.lineTo(d.x + d.w - radius, d.y)
  ctx.quadraticCurveTo(d.x + d.w, d.y, d.x + d.w, d.y + radius)
  ctx.lineTo(d.x + d.w, d.y + d.h - radius)
  ctx.quadraticCurveTo(d.x + d.w, d.y + d.h, d.x + d.w - radius, d.y + d.h)
  ctx.lineTo(d.x + radius, d.y + d.h)
  ctx.quadraticCurveTo(d.x, d.y + d.h, d.x, d.y + d.h - radius)
  ctx.lineTo(d.x, d.y + radius)
  ctx.quadraticCurveTo(d.x, d.y, d.x + radius, d.y)
  ctx.closePath()
  ctx.clip()

  // Draw background image or fallback color
  if (bgImage) {
    ctx.drawImage(bgImage, d.x, d.y, d.w, d.h)
    // Semi-transparent overlay to darken and tint with district color
    ctx.fillStyle = d.bgColor + "cc"
    ctx.fillRect(d.x, d.y, d.w, d.h)
  } else {
    ctx.fillStyle = d.bgColor
    ctx.fillRect(d.x, d.y, d.w, d.h)
  }

  // Pixel scanline effect over the background
  ctx.fillStyle = "rgba(0,0,0,0.08)"
  for (let sy = d.y; sy < d.y + d.h; sy += 4) {
    ctx.fillRect(d.x, sy, d.w, 1)
  }

  ctx.restore()

  // Border glow
  ctx.strokeStyle = d.color + "55"
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(d.x + radius, d.y)
  ctx.lineTo(d.x + d.w - radius, d.y)
  ctx.quadraticCurveTo(d.x + d.w, d.y, d.x + d.w, d.y + radius)
  ctx.lineTo(d.x + d.w, d.y + d.h - radius)
  ctx.quadraticCurveTo(d.x + d.w, d.y + d.h, d.x + d.w - radius, d.y + d.h)
  ctx.lineTo(d.x + radius, d.y + d.h)
  ctx.quadraticCurveTo(d.x, d.y + d.h, d.x, d.y + d.h - radius)
  ctx.lineTo(d.x, d.y + radius)
  ctx.quadraticCurveTo(d.x, d.y, d.x + radius, d.y)
  ctx.closePath()
  ctx.stroke()

  // Animated corner glow pulses
  const pulse = Math.sin(tick * 0.05) * 0.3 + 0.7
  ctx.fillStyle = d.color + Math.round(pulse * 80).toString(16).padStart(2, "0")
  ctx.fillRect(d.x, d.y, 3, 3)
  ctx.fillRect(d.x + d.w - 3, d.y, 3, 3)
  ctx.fillRect(d.x, d.y + d.h - 3, 3, 3)
  ctx.fillRect(d.x + d.w - 3, d.y + d.h - 3, 3, 3)

  // Draw buildings
  const bx = d.x + 8
  const by = d.y + d.h - 64
  drawBuilding(ctx, bx, by, 30, 52, d.color, tick)
  drawBuilding(ctx, bx + 38, by + 16, 24, 36, d.color, tick)
  drawBuilding(ctx, d.x + d.w - 42, by + 8, 28, 44, d.color, tick)

  // District label with background pill
  ctx.font = "bold 10px monospace"
  const labelW = ctx.measureText(d.name.toUpperCase()).width + 12
  ctx.fillStyle = d.bgColor + "dd"
  ctx.fillRect(d.x + 6, d.y + 6, labelW, 18)
  ctx.fillStyle = d.color
  ctx.fillText(d.name.toUpperCase(), d.x + 12, d.y + 18)
}

export function drawBot(ctx: CanvasRenderingContext2D, agent: MoltbotAgent, tick: number, isSelected: boolean) {
  const x = Math.round(agent.pixelX)
  const y = Math.round(agent.pixelY)
  const c = agent.color
  const frame = Math.floor(tick / 8) % 4
  const bobY = agent.status === "working" ? Math.sin(tick * 0.15) * 2 : 0

  if (isSelected) {
    // Pulsing selection ring
    const ringPulse = Math.sin(tick * 0.08) * 2 + 18
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 1.5
    ctx.beginPath()
    ctx.arc(x + 8, y + 10, ringPulse, 0, Math.PI * 2)
    ctx.stroke()
    // Glow
    ctx.strokeStyle = c + "66"
    ctx.lineWidth = 3
    ctx.beginPath()
    ctx.arc(x + 8, y + 10, ringPulse + 2, 0, Math.PI * 2)
    ctx.stroke()
  }

  // Shadow
  ctx.fillStyle = "rgba(0,0,0,0.35)"
  ctx.beginPath()
  ctx.ellipse(x + 8, y + 20, 7, 3, 0, 0, Math.PI * 2)
  ctx.fill()

  const by = y + bobY

  // Body
  drawRect(ctx, x + 2, by + 6, 12, 10, darken(c, 40))
  drawRect(ctx, x + 4, by + 8, 8, 6, c)

  // Head
  drawRect(ctx, x + 3, by, 10, 8, c)
  // Eyes
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

  // Antenna
  drawRect(ctx, x + 7, by - 4, 2, 4, c)
  const antennaGlow = Math.sin(tick * 0.1) > 0
  if (agent.status !== "offline") {
    drawRect(ctx, x + 6, by - 6, 4, 2, antennaGlow ? lighten(c, 80) : c)
    // Signal waves for working bots
    if (agent.status === "working" && antennaGlow) {
      ctx.strokeStyle = c + "44"
      ctx.lineWidth = 1
      for (let r = 0; r < 2; r++) {
        ctx.beginPath()
        ctx.arc(x + 8, by - 6, 4 + r * 4, -Math.PI * 0.8, -Math.PI * 0.2)
        ctx.stroke()
      }
    }
  }

  // Legs with animation
  const legFrame = agent.status === "working" || (Math.abs(agent.pixelX - agent.targetX) > 2) ? frame : 0
  if (legFrame % 2 === 0) {
    drawRect(ctx, x + 4, by + 16, 2, 4, darken(c, 30))
    drawRect(ctx, x + 10, by + 14, 2, 4, darken(c, 30))
  } else {
    drawRect(ctx, x + 4, by + 14, 2, 4, darken(c, 30))
    drawRect(ctx, x + 10, by + 16, 2, 4, darken(c, 30))
  }

  // Arms
  if (agent.status === "working") {
    const armSwing = Math.sin(tick * 0.2) * 2
    drawRect(ctx, x, by + 8 + armSwing, 2, 6, darken(c, 20))
    drawRect(ctx, x + 14, by + 8 - armSwing, 2, 6, darken(c, 20))
  } else {
    drawRect(ctx, x, by + 8, 2, 6, darken(c, 20))
    drawRect(ctx, x + 14, by + 8, 2, 6, darken(c, 20))
  }

  // Status indicator dot
  const statusColors: Record<string, string> = {
    active: "#34d399",
    working: "#fbbf24",
    idle: "#64748b",
    error: "#f87171",
    offline: "#1e293b",
  }
  drawRect(ctx, x + 14, by, 4, 4, statusColors[agent.status] || "#64748b")

  // Name label
  ctx.font = "bold 8px monospace"
  ctx.fillStyle = "#000000"
  ctx.textAlign = "center"
  ctx.fillText(agent.name, x + 9, y + 29)
  ctx.fillStyle = c
  ctx.fillText(agent.name, x + 8, y + 28)
  ctx.textAlign = "left"

  // Task progress bar
  if (agent.status === "working" && agent.taskProgress > 0) {
    const barW = 22
    const barH = 3
    const barX = x - 3
    const barY = y + 32
    drawRect(ctx, barX, barY, barW, barH, "#0a0e17")
    drawRect(ctx, barX, barY, Math.floor(barW * agent.taskProgress / 100), barH, c)
    // Bar border
    ctx.strokeStyle = c + "44"
    ctx.lineWidth = 0.5
    ctx.strokeRect(barX, barY, barW, barH)
  }
}

export function drawGrid(ctx: CanvasRenderingContext2D, w: number, h: number) {
  ctx.strokeStyle = "#1a223522"
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
  // Road shadows
  ctx.strokeStyle = "#0a0e17"
  ctx.lineWidth = 8
  ctx.setLineDash([])
  for (let i = 0; i < districts.length - 1; i++) {
    const a = districts[i]
    const b = districts[i + 1]
    ctx.beginPath()
    ctx.moveTo(a.x + a.w / 2, a.y + a.h / 2)
    ctx.lineTo(b.x + b.w / 2, b.y + b.h / 2)
    ctx.stroke()
  }

  // Road surface
  ctx.strokeStyle = "#1e293b"
  ctx.lineWidth = 6
  for (let i = 0; i < districts.length - 1; i++) {
    const a = districts[i]
    const b = districts[i + 1]
    ctx.beginPath()
    ctx.moveTo(a.x + a.w / 2, a.y + a.h / 2)
    ctx.lineTo(b.x + b.w / 2, b.y + b.h / 2)
    ctx.stroke()
  }

  // Dashed center line
  ctx.strokeStyle = "#2a3a52"
  ctx.lineWidth = 1
  ctx.setLineDash([6, 8])
  for (let i = 0; i < districts.length - 1; i++) {
    const a = districts[i]
    const b = districts[i + 1]
    ctx.beginPath()
    ctx.moveTo(a.x + a.w / 2, a.y + a.h / 2)
    ctx.lineTo(b.x + b.w / 2, b.y + b.h / 2)
    ctx.stroke()
  }
  ctx.setLineDash([])
}
