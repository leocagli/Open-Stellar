import { fundTestnetAccount, getBalance } from "@/lib/stellar"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { publicKey } = await req.json()
    if (!publicKey) return NextResponse.json({ error: "Missing publicKey" }, { status: 400 })

    const ok = await fundTestnetAccount(publicKey)
    if (!ok) return NextResponse.json({ error: "Friendbot funding failed" }, { status: 502 })

    const balance = await getBalance(publicKey)
    return NextResponse.json({ success: true, balance })
  } catch (err) {
    return NextResponse.json({ error: "Fund request failed" }, { status: 500 })
  }
}
