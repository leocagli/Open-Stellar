import { NextResponse } from "next/server"

import { apiError } from "@/lib/api/error"
import { getStoredQuest } from "@/lib/gamification/quest-store"
import { getQuestById, type Quest } from "@/lib/gamification/quests"

type QuestChainContext = {
  params: Promise<{ id: string }>
}

function getChainQuest(id: string): Pick<Quest, "id" | "unlocksQuestId"> | null {
  return getStoredQuest(id) ?? getQuestById(id)
}

export async function GET(_request: Request, context: QuestChainContext) {
  const { id } = await context.params
  const questId = decodeURIComponent(id)
  let currentQuest = getChainQuest(questId)

  if (!currentQuest) {
    return apiError("Quest not found", "QUEST_NOT_FOUND", 404)
  }

  const chain: string[] = []
  const visited = new Set<string>()

  while (currentQuest) {
    if (visited.has(currentQuest.id)) {
      return apiError("cycle_detected", "CYCLE_DETECTED", 400)
    }

    visited.add(currentQuest.id)
    chain.push(currentQuest.id)
    currentQuest = currentQuest.unlocksQuestId
      ? getChainQuest(currentQuest.unlocksQuestId)
      : null
  }

  return NextResponse.json({ chain, length: chain.length })
}
