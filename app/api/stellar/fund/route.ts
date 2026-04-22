import { NextResponse } from "next/server"
import * as StellarSdk from "@stellar/stellar-sdk"

const FRIENDBOT = "https://friendbot.stellar.org"
const HORIZON = "https://horizon-testnet.stellar.org"

export async function POST(req: Request) {
  try {
    const { publicKey } = await req.json()
    if (!publicKey) return NextResponse.json({ error: "Missing publicKey" }, { status: 400 })

    const res = await fetch(`${FRIENDBOT}?addr=${encodeURIComponent(publicKey)}`)
    if (!res.ok) {
      const txt = await res.text()
      return NextResponse.json({ error: `Friendbot failed: ${txt}` }, { status: 500 })
    }

    // Fetch balance after funding
    const server = new StellarSdk.Horizon.Server(HORIZON)
    const account = await server.loadAccount(publicKey)
    const native = account.balances.find(
      (b: { asset_type: string }) => b.asset_type === "native"
    ) as { balance: string } | undefined

    return NextResponse.json({ success: true, balance: native?.balance || "10000" })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
