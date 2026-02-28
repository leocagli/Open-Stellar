import { getBalance } from "@/lib/stellar"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { publicKey } = await req.json()
    if (!publicKey) return NextResponse.json({ error: "Missing publicKey" }, { status: 400 })

    const balance = await getBalance(publicKey)
    return NextResponse.json({ balance })
  } catch (err) {
    return NextResponse.json({ error: "Balance request failed" }, { status: 500 })
  }
}
