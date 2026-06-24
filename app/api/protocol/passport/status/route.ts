import { NextResponse } from 'next/server'
import { getPassport, isRegistered } from '@/lib/passport/passport'
import { isMockMode } from '@/lib/mock/mock-mode'
import { mockPassport } from '@/lib/mock/passport-mock'

// GET /api/protocol/passport/status?agentId=...  -> on-chain passport lookup.
export async function GET(req: Request) {
  try {
    const agentId = new URL(req.url).searchParams.get('agentId')
    if (!agentId) {
      return NextResponse.json({ ok: false, error: 'agentId query param is required' }, { status: 400 })
    }

    if (isMockMode()) {
      return NextResponse.json({ ok: true, ...(await mockPassport.getStatus(agentId)) })
    }

    const [registered, attestation] = await Promise.all([
      isRegistered(agentId),
      getPassport(agentId),
    ])

    return NextResponse.json({ ok: true, registered, attestation: attestation ?? null })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed reading passport status' },
      { status: 500 },
    )
  }
}

