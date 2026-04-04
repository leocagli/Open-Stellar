import { NextResponse } from 'next/server'
import { applyReputationAction, getReputation, listReputations } from '@/lib/reputation/reputation-store'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const actorId = searchParams.get('actorId')

  if (actorId) {
    return NextResponse.json({ ok: true, reputation: getReputation(actorId) })
  }

  return NextResponse.json({ ok: true, reputations: listReputations() })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const updated = applyReputationAction({
      actorId: String(body.actorId || 'anonymous'),
      delta: Number(body.delta || 0),
      reason: String(body.reason || 'manual-update'),
      scope: body.scope === 'governance' || body.scope === 'service' ? body.scope : 'tx',
    })

    return NextResponse.json({ ok: true, reputation: updated })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed updating reputation' },
      { status: 500 }
    )
  }
}
