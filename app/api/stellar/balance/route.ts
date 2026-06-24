import { NextResponse } from "next/server"
import * as StellarSdk from "@stellar/stellar-sdk"
import { isMockMode } from "@/lib/mock/mock-mode"
import { mockStellar } from "@/lib/mock/stellar-mock"

const HORIZON = "https://horizon-testnet.stellar.org"

export async function POST(req: Request) {
  try {
    const { publicKey } = await req.json()
    if (!publicKey) return NextResponse.json({ error: "Missing publicKey" }, { status: 400 })
    if (isMockMode()) return NextResponse.json(await mockStellar.getBalance())

    const server = new StellarSdk.Horizon.Server(HORIZON)
    const account = await server.loadAccount(publicKey)
    const native = account.balances.find(
      (b: { asset_type: string }) => b.asset_type === "native"
    ) as { balance: string } | undefined
    return NextResponse.json({ ok: true, balance: native?.balance || "0", funded: !!native && parseFloat(native.balance) > 0 })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    const isNotFound = msg.includes("404") || msg.includes("Not Found") || msg.includes("does not exist")
    return NextResponse.json({ balance: "0", funded: false, error: isNotFound ? null : "network" })
  }
}

