"use client"

import { OpenStellarHub } from "@/components/open-stellar/open-stellar-hub"
import { TransactionPanel } from "@/components/wallet/transaction-panel"

export function IntegratedHome() {
  return (
    <div className="relative min-h-screen">
      <OpenStellarHub />
      <TransactionPanel />
    </div>
  )
}
