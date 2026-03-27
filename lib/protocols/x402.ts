export type SettlementChain = 'bnb' | 'stellar'

export interface X402QuoteRequest {
  serviceId: string
  chain: SettlementChain
  payer: string
  units: number
  unitPriceUsd: number
  ttlSeconds?: number
}

export interface X402Quote {
  code: 402
  serviceId: string
  chain: SettlementChain
  payer: string
  amountUsd: number
  amountUnits: string
  expiresAt: string
  paymentRef: string
  memo: string
}

export interface X402Settlement {
  paymentRef: string
  chain: SettlementChain
  txHash: string
  paidBy: string
}

export interface X402Receipt {
  accepted: boolean
  paymentRef: string
  settledAt: string
  txHash: string
  chain: SettlementChain
}

const CHAIN_DECIMALS: Record<SettlementChain, number> = {
  bnb: 18,
  stellar: 7,
}

function parseUnits(value: number, decimals: number) {
  const fixed = value.toFixed(decimals)
  return fixed.replace('.', '')
}

export function createX402Quote(input: X402QuoteRequest): X402Quote {
  const ttlSeconds = input.ttlSeconds ?? 300
  const amountUsd = Number((input.units * input.unitPriceUsd).toFixed(6))
  const amountUnits = parseUnits(amountUsd, CHAIN_DECIMALS[input.chain])
  const expiresAt = new Date(Date.now() + ttlSeconds * 1000).toISOString()
  const paymentRef = `${input.serviceId}:${input.chain}:${Date.now()}`

  return {
    code: 402,
    serviceId: input.serviceId,
    chain: input.chain,
    payer: input.payer,
    amountUsd,
    amountUnits,
    expiresAt,
    paymentRef,
    memo: `x402/${input.serviceId}/${input.chain}`,
  }
}

export function verifyX402Settlement(input: X402Settlement): X402Receipt {
  const txLooksValid = /^0x[a-fA-F0-9]{64}$/.test(input.txHash) || /^[a-fA-F0-9]{64}$/.test(input.txHash)

  return {
    accepted: txLooksValid,
    paymentRef: input.paymentRef,
    settledAt: new Date().toISOString(),
    txHash: input.txHash,
    chain: input.chain,
  }
}
