import { NextResponse } from "next/server"

import { getQuests } from "@/lib/gamification/quests"

export const dynamic = "force-dynamic"

export async function GET(_req: Request) {
  return NextResponse.json({ quests: getQuests() })
}
