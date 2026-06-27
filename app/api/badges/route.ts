import { getBadgeCatalog } from "@/lib/gamification/badges"

export async function GET() {
  return Response.json({ badges: getBadgeCatalog() })
}
