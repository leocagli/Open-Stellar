import { NextResponse } from "next/server"
import { listReputations, type ReputationBadge } from "@/lib/reputation/reputation-store"
import { getLeaderboardByAgentId } from "@/lib/agents/xp-leaderboard-store"

const BADGE_RARITY_WEIGHT = {
  legendary: 4,
  epic: 3,
  rare: 2,
  common: 1,
} as const

function getTopBadge(badges: ReputationBadge[]) {
  if (!badges || badges.length === 0) return null
  return badges.reduce((top, current) => {
    return BADGE_RARITY_WEIGHT[current.rarity] > BADGE_RARITY_WEIGHT[top.rarity] ? current : top
  })
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const limitParam = searchParams.get("limit")

    let limit = 20
    if (limitParam) {
      limit = Math.min(50, Math.max(1, Number(limitParam)))
    }

    const reputations = listReputations(limit)
    
    const entries = reputations.map((rep, index) => {
      let weeklyDelta = 0
      const weeklyData = getLeaderboardByAgentId(rep.actorId, "7d")
      if (weeklyData) {
        weeklyDelta = weeklyData.xp
      }

      const topBadge = getTopBadge(rep.metrics.badges)

      return {
        rank: index + 1,
        agentId: rep.actorId,
        totalXp: rep.score,
        weeklyDelta,
        topBadge: topBadge ? topBadge : null,
      }
    })

    return NextResponse.json(
      { ok: true, entries },
      { headers: { "Cache-Control": "no-store" } },
    )
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Failed to fetch leaderboard" },
      { status: 500 },
    )
  }
}