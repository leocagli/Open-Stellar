"use client"

import { useState } from "react"
import { VendimiaWorld } from "@/components/vendimia/vendimia-world"
import { OpenStellarHub } from "@/components/open-stellar/open-stellar-hub"
import { TransactionPanel } from "@/components/wallet/transaction-panel"

type ViewMode = "vendimia" | "open-stellar"

export function IntegratedHome() {
  const [mode, setMode] = useState<ViewMode>("vendimia")

  return (
    <div className="relative min-h-screen">
      <div
        className="fixed left-4 top-4 z-[60] flex items-center gap-2 rounded-md border px-2 py-1"
        style={{
          backgroundColor: "#1f2937",
          borderColor: "#334155",
          boxShadow: "3px 3px 0 rgba(0,0,0,0.35)",
        }}
      >
        <button
          onClick={() => setMode("vendimia")}
          className="px-2 py-1 text-xs font-bold uppercase"
          style={{
            backgroundColor: mode === "vendimia" ? "#f0b90b" : "#374151",
            color: mode === "vendimia" ? "#111827" : "#d1d5db",
          }}
        >
          Vendimia v0
        </button>
        <button
          onClick={() => setMode("open-stellar")}
          className="px-2 py-1 text-xs font-bold uppercase"
          style={{
            backgroundColor: mode === "open-stellar" ? "#22d3ee" : "#374151",
            color: mode === "open-stellar" ? "#082f49" : "#d1d5db",
          }}
        >
          Open-Stellar v0
        </button>
      </div>

      {mode === "vendimia" ? <VendimiaWorld /> : <OpenStellarHub />}
      <TransactionPanel />
    </div>
  )
}
