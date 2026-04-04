import { NextResponse } from "next/server"
import * as StellarSdk from "@stellar/stellar-sdk"

const HORIZON = "https://horizon-testnet.stellar.org"

export async function POST(req: Request) {
  try {
    const { publicKey } = await req.json()
    if (!publicKey) return NextResponse.json({ error: "Missing publicKey" }, { status: 400 })

    const server = new StellarSdk.Horizon.Server(HORIZON)
    const account = await server.loadAccount(publicKey)
    const native = account.balances.find(
      (b: { asset_type: string }) => b.asset_type === "native"
    ) as { balance: string } | undefined
    return NextResponse.json({ balance: native?.balance || "0" })
  } catch {
    return NextResponse.json({ balance: "0" })
  }
}
