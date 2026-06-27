import { publishSystemEvent, subscribeToSystemEvents, type PublishedSystemEvent, type SystemEvent } from "@/lib/events/system-events"

export type BadgeRarity = "common" | "rare" | "epic" | "legendary"

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  rarity: BadgeRarity
  unlockedAt?: string
  mintable?: boolean
}

interface AgentBadgeRecord extends Badge {
  agentId: string
  unlockedAt: string
}

interface BadgeProgress {
  completedTasks: number
  paymentsReceived: number
  subscriptionsAcquired: number
  zkPassportVerified: boolean
  uptimeNoErrorStartedAt: number | null
  hasErrorDuringUptimeWindow: boolean
  maxConcurrentTasks: number
  runningTasks: Set<string>
  districtLegend: boolean
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000

export const BADGE_CATALOG: Badge[] = [
  { id: "first-blood", name: "First Blood", description: "Complete first task", icon: "🎯", rarity: "common" },
  { id: "century", name: "Century", description: "Complete 100 tasks", icon: "💯", rarity: "rare" },
  { id: "millionaire", name: "Millionaire", description: "Complete 1000 tasks", icon: "🏆", rarity: "legendary", mintable: true },
  { id: "payment-pioneer", name: "Payment Pioneer", description: "First x402 payment received", icon: "💰", rarity: "rare" },
  { id: "subscriber", name: "Subscriber", description: "First subscription acquired", icon: "📋", rarity: "rare" },
  { id: "zk-certified", name: "ZK Certified", description: "ZK passport minted and verified", icon: "🔐", rarity: "epic", mintable: true },
  { id: "ironclad", name: "Ironclad", description: "7-day uptime with zero errors", icon: "🛡️", rarity: "legendary", mintable: true },
  { id: "speed-demon", name: "Speed Demon", description: "Task completed in < 2s", icon: "⚡", rarity: "epic", mintable: true },
  { id: "district-legend", name: "District Legend", description: "#1 in district leaderboard", icon: "👑", rarity: "legendary", mintable: true },
  { id: "multi-tasker", name: "Multi-tasker", description: "5 tasks running simultaneously", icon: "🔀", rarity: "epic", mintable: true },
]

const catalogById = new Map(BADGE_CATALOG.map((badge) => [badge.id, badge]))

const globalBadges = globalThis as typeof globalThis & {
  __openStellarAgentBadges__?: Map<string, AgentBadgeRecord[]>
  __openStellarBadgeProgress__?: Map<string, BadgeProgress>
  __openStellarBadgeSubscriberActive__?: boolean
}

const agentBadges = globalBadges.__openStellarAgentBadges__ ?? new Map<string, AgentBadgeRecord[]>()
const badgeProgress = globalBadges.__openStellarBadgeProgress__ ?? new Map<string, BadgeProgress>()

if (!globalBadges.__openStellarAgentBadges__) globalBadges.__openStellarAgentBadges__ = agentBadges
if (!globalBadges.__openStellarBadgeProgress__) globalBadges.__openStellarBadgeProgress__ = badgeProgress

function emptyProgress(): BadgeProgress {
  return {
    completedTasks: 0,
    paymentsReceived: 0,
    subscriptionsAcquired: 0,
    zkPassportVerified: false,
    uptimeNoErrorStartedAt: null,
    hasErrorDuringUptimeWindow: false,
    maxConcurrentTasks: 0,
    runningTasks: new Set<string>(),
    districtLegend: false,
  }
}

function getProgress(agentId: string): BadgeProgress {
  const existing = badgeProgress.get(agentId)
  if (existing) return existing
  const next = emptyProgress()
  badgeProgress.set(agentId, next)
  return next
}

function cloneBadge(badge: Badge, unlockedAt?: string): Badge {
  return { ...badge, unlockedAt }
}

export function getBadgeCatalog(): Badge[] {
  return BADGE_CATALOG.map((badge) => cloneBadge(badge))
}

export function getAgentBadges(agentId: string): Badge[] {
  return (agentBadges.get(agentId) ?? []).map((badge) => cloneBadge(badge, badge.unlockedAt))
}

function hasBadge(agentId: string, badgeId: string): boolean {
  return (agentBadges.get(agentId) ?? []).some((badge) => badge.id === badgeId)
}

function unlockBadge(agentId: string, badgeId: string, unlockedAt: string): Badge | null {
  if (hasBadge(agentId, badgeId)) return null
  const badge = catalogById.get(badgeId)
  if (!badge) return null
  const record: AgentBadgeRecord = { ...badge, agentId, unlockedAt }
  agentBadges.set(agentId, [...(agentBadges.get(agentId) ?? []), record])
  return cloneBadge(record, unlockedAt)
}

function updateProgress(agentId: string, event: SystemEvent | PublishedSystemEvent): BadgeProgress {
  const progress = getProgress(agentId)
  if (event.type === "task.started") {
    progress.runningTasks.add(event.task.id)
    progress.maxConcurrentTasks = Math.max(progress.maxConcurrentTasks, progress.runningTasks.size)
  }
  if (event.type === "task.completed") {
    progress.completedTasks += 1
    progress.runningTasks.delete(event.taskId)
  }
  if (event.type === "payment.received") progress.paymentsReceived += 1
  if (event.type === "agent.status") {
    if (event.status === "error") {
      progress.hasErrorDuringUptimeWindow = true
      progress.uptimeNoErrorStartedAt = null
    } else if (event.status !== "offline" && progress.uptimeNoErrorStartedAt === null) {
      progress.uptimeNoErrorStartedAt = Date.parse(event.occurredAt ?? new Date().toISOString())
      progress.hasErrorDuringUptimeWindow = false
    }
  }
  if (event.type === "district.unlocked" && "agentId" in event && event.agentId === agentId) progress.districtLegend = true
  return progress
}

export async function checkBadges(agentId: string, event: SystemEvent | PublishedSystemEvent): Promise<Badge[]> {
  const occurredAt = event.occurredAt ?? new Date().toISOString()
  const eventAny = event as SystemEvent & Record<string, unknown>
  const progress = updateProgress(agentId, event)
  const candidates: string[] = []

  if (progress.completedTasks >= 1) candidates.push("first-blood")
  if (progress.completedTasks >= 100) candidates.push("century")
  if (progress.completedTasks >= 1000) candidates.push("millionaire")
  if (progress.paymentsReceived >= 1) candidates.push("payment-pioneer")
  if (progress.subscriptionsAcquired >= 1 || String(eventAny.type) === "subscription.acquired") candidates.push("subscriber")
  if (progress.zkPassportVerified || String(eventAny.type) === "passport.verified" || String(eventAny.type) === "passport.minted") candidates.push("zk-certified")
  if (event.type === "task.completed" && typeof event.result.durationMs === "number" && event.result.durationMs < 2000) candidates.push("speed-demon")
  if (progress.districtLegend) candidates.push("district-legend")
  if (progress.maxConcurrentTasks >= 5) candidates.push("multi-tasker")
  if (progress.uptimeNoErrorStartedAt !== null && !progress.hasErrorDuringUptimeWindow) {
    const elapsed = Date.parse(occurredAt) - progress.uptimeNoErrorStartedAt
    if (elapsed >= SEVEN_DAYS_MS) candidates.push("ironclad")
  }

  return candidates
    .map((badgeId) => unlockBadge(agentId, badgeId, occurredAt))
    .filter((badge): badge is Badge => badge !== null)
}

export async function processBadgeEvent(event: PublishedSystemEvent): Promise<Badge[]> {
  if (event.type === "badge.unlocked" || !event.agentId) return []
  const unlocked = await checkBadges(event.agentId, event)
  for (const badge of unlocked) {
    publishSystemEvent({ type: "badge.unlocked", agentId: event.agentId, badge })
  }
  return unlocked
}

export function subscribeToBadgeEvents(): () => void {
  if (globalBadges.__openStellarBadgeSubscriberActive__) return () => {}
  globalBadges.__openStellarBadgeSubscriberActive__ = true
  return subscribeToSystemEvents((event) => {
    void processBadgeEvent(event)
  })
}

export function resetBadgesForTests(): void {
  agentBadges.clear()
  badgeProgress.clear()
  globalBadges.__openStellarBadgeSubscriberActive__ = false
}
