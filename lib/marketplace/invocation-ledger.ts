export interface InvocationRecord {
  id: string
  agentId: string
  skillId: string
  amountXLM: number
  txHash: string
  invokedAt: string
  status: "success" | "failed" | "insufficient_balance"
  error?: string
}

type LedgerDb = InvocationRecord[]

const globalState = globalThis as typeof globalThis & {
  __openStellarInvocationLedger__?: LedgerDb
}

function getDb(): LedgerDb {
  if (!globalState.__openStellarInvocationLedger__) {
    globalState.__openStellarInvocationLedger__ = []
  }
  return globalState.__openStellarInvocationLedger__
}

export function recordInvocation(
  agentId: string,
  skillId: string,
  amountXLM: number,
  txHash: string,
  status: InvocationRecord["status"] = "success",
  error?: string,
): InvocationRecord {
  const record: InvocationRecord = {
    id: `inv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
    agentId: agentId.trim(),
    skillId: skillId.trim(),
    amountXLM: Math.max(0, Number(amountXLM) || 0),
    txHash: txHash.trim(),
    invokedAt: new Date().toISOString(),
    status,
    error,
  }

  const db = getDb()
  db.push(record)

  // Cap at 50k entries
  if (db.length > 50_000) {
    db.splice(0, db.length - 50_000)
  }

  return record
}

export function listInvocations(
  filters: { agentId?: string; skillId?: string; limit?: number } = {},
): InvocationRecord[] {
  const db = getDb()
  let results = [...db].reverse()

  if (filters.agentId) {
    results = results.filter((r) => r.agentId === filters.agentId)
  }
  if (filters.skillId) {
    results = results.filter((r) => r.skillId === filters.skillId)
  }
  if (filters.limit && filters.limit > 0) {
    results = results.slice(0, filters.limit)
  }

  return results
}

export function getInvocationById(id: string): InvocationRecord | null {
  return getDb().find((r) => r.id === id) ?? null
}

export function getTotalSpentByAgent(agentId: string): number {
  return getDb()
    .filter((r) => r.agentId === agentId && r.status === "success")
    .reduce((sum, r) => sum + r.amountXLM, 0)
}

export function resetInvocationLedger(): void {
  getDb().splice(0, getDb().length)
}