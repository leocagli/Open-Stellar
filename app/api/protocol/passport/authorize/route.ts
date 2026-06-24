import { NextResponse } from 'next/server'
import { authorizePayment } from '@/lib/passport/passport'
import { isMockMode } from '@/lib/mock/mock-mode'
import { mockPassport } from '@/lib/mock/passport-mock'

// POST { agentId, amount } -> on-chain spend-cap gate for the agent's passport.
// `amount` is in the smallest on-chain unit (must already be scaled by caller).
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const agentId = String(body.agentId || '')
    const amount = String(body.amount || '')

    if (!agentId || !amount) {
      return NextResponse.json({ ok: false, error: 'agentId and amount are required' }, { status: 400 })
    }

    const result = isMockMode()
      ? await mockPassport.authorizePayment(agentId, amount)
      : await authorizePayment(agentId, amount)

    return NextResponse.json({ ok: true, ...result })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed authorizing payment' },
      { status: 500 },
    )
  }
}

