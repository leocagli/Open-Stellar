import * as StellarSdk from "@stellar/stellar-sdk"

const HORIZON_TESTNET = "https://horizon-testnet.stellar.org"
const FRIENDBOT_URL = "https://friendbot.stellar.org"

export function generateKeypair(): { publicKey: string; secretKey: string } {
  const pair = StellarSdk.Keypair.random()
  return {
    publicKey: pair.publicKey(),
    secretKey: pair.secret(),
  }
}

export async function fundTestnetAccount(publicKey: string): Promise<boolean> {
  try {
    const res = await fetch(`${FRIENDBOT_URL}?addr=${encodeURIComponent(publicKey)}`)
    if (!res.ok) {
      const txt = await res.text()
      console.error("Friendbot error:", txt)
      return false
    }
    return true
  } catch (err) {
    console.error("Fund error:", err)
    return false
  }
}

export async function getBalance(publicKey: string): Promise<string> {
  try {
    const server = new StellarSdk.Horizon.Server(HORIZON_TESTNET)
    const account = await server.loadAccount(publicKey)
    const native = account.balances.find(
      (b: { asset_type: string }) => b.asset_type === "native"
    )
    return native ? (native as { balance: string }).balance : "0"
  } catch (err) {
    console.error("Balance error:", err)
    return "0"
  }
}

export async function sendPayment(
  fromSecret: string,
  toPublic: string,
  amount: string
): Promise<{ success: boolean; hash: string }> {
  try {
    const server = new StellarSdk.Horizon.Server(HORIZON_TESTNET)
    const sourceKeypair = StellarSdk.Keypair.fromSecret(fromSecret)
    const sourceAccount = await server.loadAccount(sourceKeypair.publicKey())

    const transaction = new StellarSdk.TransactionBuilder(sourceAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: StellarSdk.Networks.TESTNET,
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: toPublic,
          asset: StellarSdk.Asset.native(),
          amount,
        })
      )
      .setTimeout(30)
      .build()

    transaction.sign(sourceKeypair)
    const result = await server.submitTransaction(transaction)
    return { success: true, hash: (result as { hash?: string }).hash || "unknown" }
  } catch (err) {
    console.error("Payment error:", err)
    return { success: false, hash: "" }
  }
}

export function truncateKey(key: string): string {
  if (key.length <= 12) return key
  return key.slice(0, 6) + "..." + key.slice(-6)
}
