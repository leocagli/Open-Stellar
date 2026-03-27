import { NextResponse } from 'next/server'
import { verifyX402Settlement } from '@/lib/protocols/x402'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const receipt = verifyX402Settlement({
      paymentRef: String(body.paymentRef || ''),
      chain: body.chain === 'stellar' ? 'stellar' : 'bnb',
      txHash: String(body.txHash || ''),
      paidBy: String(body.paidBy || 'unknown'),
    })

    if (!receipt.accepted) {
      return NextResponse.json({ ok: false, receipt, error: 'Invalid tx hash for x402 settlement' }, { status: 400 })
    }

    return NextResponse.json({ ok: true, receipt })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Failed settling x402 payment' },
      { status: 500 }
    )
  }
}
