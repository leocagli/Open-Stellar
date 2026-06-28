import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api/error'
import { getX402Receipt } from '@/lib/protocols/x402-receipt-store'

export async function GET(_req: Request, { params }: { params: Promise<{ receiptId: string }> }) {
  const { receiptId } = await params
  const receipt = getX402Receipt(receiptId)

  if (!receipt) {
    return apiError('Receipt not found', 'RECEIPT_NOT_FOUND', 404)
  }

  return NextResponse.json({ ok: true, receipt })
}
