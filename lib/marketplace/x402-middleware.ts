import { createX402Quote, settleX402, type X402Quote, type X402SettlementResult } from "@/lib/protocols/x402"
import { isMockMode } from "@/lib/mock/mock-mode"
import { settleMockX402 } from "@/lib/mock/x402-mock"

export interface SkillInvocationRequest {
  agentId: string
  payload: unknown
}

export interface PaymentRequirement {
  quote: X402Quote
  paymentRef: string
}

export interface InvocationResult {
  ok: boolean
  response?: unknown
  receipt?: { txHash: string; chain: string; amountUsd: number }
  error?: string
}

/**
 * Attempt an HTTP request to a skill's callUrl.
 * If the response is 402, extract payment requirements and return them.
 */
export async function attemptSkillInvocation(
  callUrl: string,
  request: SkillInvocationRequest,
): Promise<{ status: number; body: unknown; headers: Record<string, string> }> {
  const response = await fetch(callUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  })

  const body = await response.json().catch(() => ({}))
  const headers: Record<string, string> = {}
  response.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value
  })

  return { status: response.status, body, headers }
}

/**
 * Generate a Stellar payment transaction and settle it via x402.
 * In mock mode, simulates the settlement without real on-chain calls.
 */
export async function settleSkillPayment(
  paymentRef: string,
  txHash: string,
  chain: "stellar" | "bnb" | "base" = "stellar",
): Promise<X402SettlementResult> {
  if (isMockMode()) {
    const receipt = settleMockX402({ paymentRef, chain, txHash })
    return { ok: true, receipt }
  }

  return settleX402({ paymentRef, chain, txHash })
}

/**
 * Full x402 payment flow for skill invocation:
 * 1. Attempt the HTTP call
 * 2. If 402, generate quote and settle payment
 * 3. Retry the HTTP call with payment proof
 * 4. Return the final response
 */
export async function invokeSkillWithPayment(
  callUrl: string,
  skillOwnerWallet: string,
  priceXLM: number,
  request: SkillInvocationRequest,
): Promise<InvocationResult> {
  // Step 1: Attempt initial call
  const initial = await attemptSkillInvocation(callUrl, request)

  // If not 402, return the response directly
  if (initial.status !== 402) {
    return {
      ok: initial.status >= 200 && initial.status < 300,
      response: initial.body,
    }
  }

  // Step 2: Generate x402 quote for the skill payment
  const quote = createX402Quote({
    serviceId: callUrl,
    chain: "stellar",
    payer: request.agentId,
    units: 1,
    unitPriceUsd: priceXLM * 0.1, // approximate USD price
    ttlSeconds: 300,
  })

  // Step 3: Generate a mock/real payment txHash
  // In production, the caller would sign and submit a Stellar tx
  const txHash = `mock_tx_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`

  // Step 4: Settle the payment
  const settlement = await settleSkillPayment(quote.paymentRef, txHash, "stellar")

  if (!settlement.ok || !settlement.receipt) {
    return {
      ok: false,
      error: settlement.error || "Payment settlement failed",
    }
  }

  // Step 5: Retry the HTTP call with payment proof header
  const retry = await fetch(callUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Payment": JSON.stringify({
        paymentRef: quote.paymentRef,
        txHash: settlement.receipt.txHash,
        chain: settlement.receipt.chain,
      }),
    },
    body: JSON.stringify(request),
  })

  const retryBody = await retry.json().catch(() => ({}))

  return {
    ok: retry.ok,
    response: retryBody,
    receipt: {
      txHash: settlement.receipt.txHash,
      chain: settlement.receipt.chain,
      amountUsd: settlement.receipt.amountUsd ?? 0,
    },
  }
}