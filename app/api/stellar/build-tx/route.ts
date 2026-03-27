import { NextResponse } from "next/server"
import * as StellarSdk from "@stellar/stellar-sdk"

const HORIZON = "https://horizon-testnet.stellar.org"

export async function POST(req: Request) {
  try {
    const { sourcePublic, destination, amount } = await req.json()
    if (!sourcePublic || !destination || !amount) {
      return NextResponse.json({ error: "Missing params" }, { status: 400 })
    }

    const server = new StellarSdk.Horizon.Server(HORIZON)
    const sourceAccount = await server.loadAccount(sourcePublic)

    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination,
          asset: StellarSdk.Asset.native(),
          amount: String(amount),
        })
      )
      .setTimeout(30)
      .build()

    return NextResponse.json({ xdr: transaction.toXDR() })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
