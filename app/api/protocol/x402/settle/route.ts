import { NextResponse } from 'next/server'
import { settleX402 } from '@/lib/protocols/x402'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const result = settleX402({
      paymentRef: String(body.paymentRef || ''),
      chain: body.chain === 'stellar' ? 'stellar' : 'bnb',
      txHash: String(body.txHash || ''),
      paidBy: String(body.paidBy || 'unknown'),
    })

    if (!result.ok || !result.receipt) {
      return NextResponse.json({ ok: false, error: result.error || 'x402 settlement rejected' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, receipt: result.receipt })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed settling x402 payment' },
      { status: 500 }
    )
  }
}
