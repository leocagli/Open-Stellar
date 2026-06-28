import { getAgentBadges, getBadgeCatalog } from "@/lib/gamification/badges"

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params
  return Response.json({ badges: getAgentBadges(id), catalog: getBadgeCatalog() })
}
