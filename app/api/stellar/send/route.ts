import { sendPayment, getBalance } from "@/lib/stellar"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { fromSecret, toPublic, amount } = await req.json()
    if (!fromSecret || !toPublic || !amount) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const result = await sendPayment(fromSecret, toPublic, amount)
    if (!result.success) {
      return NextResponse.json({ error: "Transaction failed" }, { status: 502 })
    }

    return NextResponse.json({ success: true, hash: result.hash })
  } catch (err) {
    return NextResponse.json({ error: "Send request failed" }, { status: 500 })
  }
}
