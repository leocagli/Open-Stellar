"use client"

import { useState } from "react"
import type { MoltbotAgent, WalletTransaction } from "@/lib/types"

interface WalletPanelProps {
  agents: MoltbotAgent[]
  selectedAgent: MoltbotAgent | null
  transactions: WalletTransaction[]
  onUpdateAgent: (agentId: string, wallet: MoltbotAgent["wallet"]) => void
  onAddTransaction: (tx: WalletTransaction) => void
}

function truncateKey(key: string): string {
  if (key.length <= 12) return key
  return key.slice(0, 6) + "..." + key.slice(-6)
}

function WalletBtn({ label, onClick, disabled, color }: { label: string; onClick: () => void; disabled?: boolean; color: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: "6px 12px",
        background: disabled ? "#1e293b" : color + "22",
        color: disabled ? "#475569" : color,
        border: `1px solid ${disabled ? "#1e293b" : color + "44"}`,
        borderRadius: 4,
        cursor: disabled ? "not-allowed" : "pointer",
        fontFamily: "monospace",
        fontSize: 10,
        fontWeight: 600,
        transition: "all 0.15s",
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {label}
    </button>
  )
}

export function WalletPanel({ agents, selectedAgent, transactions, onUpdateAgent, onAddTransaction }: WalletPanelProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const [sendTo, setSendTo] = useState("")
  const [sendAmount, setSendAmount] = useState("10")
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async (agent: MoltbotAgent) => {
    setLoading("generate")
    setError(null)
    try {
      const res = await fetch("/api/stellar/keypair", { method: "POST" })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onUpdateAgent(agent.id, {
        publicKey: data.publicKey,
        secretKey: data.secretKey,
        balance: "0",
        funded: false,
      })
    } catch (e) {
      setError("Failed to generate keypair")
    }
    setLoading(null)
  }

  const handleFund = async (agent: MoltbotAgent) => {
    if (!agent.wallet) return
    setLoading("fund")
    setError(null)
    try {
      const res = await fetch("/api/stellar/fund", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: agent.wallet.publicKey }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      onUpdateAgent(agent.id, { ...agent.wallet, balance: data.balance, funded: true })
    } catch (e) {
      setError("Friendbot funding failed. Try again.")
    }
    setLoading(null)
  }

  const handleRefresh = async (agent: MoltbotAgent) => {
    if (!agent.wallet) return
    setLoading("refresh")
    try {
      const res = await fetch("/api/stellar/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: agent.wallet.publicKey }),
      })
      const data = await res.json()
      onUpdateAgent(agent.id, { ...agent.wallet, balance: data.balance || "0" })
    } catch {
      // silent fail on refresh
    }
    setLoading(null)
  }

  const handleSend = async (agent: MoltbotAgent) => {
    if (!agent.wallet || !sendTo || !sendAmount) return
    const recipient = agents.find(a => a.id === sendTo)
    if (!recipient?.wallet?.funded) {
      setError("Recipient has no funded wallet")
      return
    }
    setLoading("send")
    setError(null)
    try {
      const res = await fetch("/api/stellar/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromSecret: agent.wallet.secretKey,
          toPublic: recipient.wallet.publicKey,
          amount: sendAmount,
        }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)

      // Refresh both balances
      const [fromBal, toBal] = await Promise.all([
        fetch("/api/stellar/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKey: agent.wallet.publicKey }),
        }).then(r => r.json()),
        fetch("/api/stellar/balance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ publicKey: recipient.wallet.publicKey }),
        }).then(r => r.json()),
      ])

      onUpdateAgent(agent.id, { ...agent.wallet, balance: fromBal.balance || "0" })
      onUpdateAgent(recipient.id, { ...recipient.wallet, balance: toBal.balance || "0" })
      onAddTransaction({
        id: Date.now(),
        fromName: agent.name,
        toName: recipient.name,
        amount: sendAmount,
        timestamp: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false }),
        hash: data.hash || "unknown",
      })
      setSendAmount("10")
      setSendTo("")
    } catch (e) {
      setError("Transaction failed. Check balances.")
    }
    setLoading(null)
  }

  if (!selectedAgent) {
    return (
      <div style={{ padding: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 8 }}>
        <div style={{ fontSize: 28, opacity: 0.3, fontFamily: "monospace" }}>XLM</div>
        <span style={{ fontFamily: "monospace", fontSize: 12, color: "#475569", textAlign: "center" }}>
          Select a bot to manage its Stellar wallet
        </span>
        <span style={{ fontFamily: "monospace", fontSize: 9, color: "#334155", textAlign: "center", marginTop: 4 }}>
          Testnet only -- no real assets
        </span>
      </div>
    )
  }

  const wallet = selectedAgent.wallet
  const otherFunded = agents.filter(a => a.id !== selectedAgent.id && a.wallet?.funded)

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", height: "100%" }}>
      {/* Agent header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: "1px solid #1e293b" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedAgent.color }} />
        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: selectedAgent.color }}>
          {selectedAgent.name}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: 9, color: "#334155", marginLeft: "auto", background: "#1e293b", padding: "2px 6px", borderRadius: 3 }}>
          TESTNET
        </span>
      </div>

      {!wallet ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 20 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", textAlign: "center" }}>
            This bot has no Stellar wallet yet
          </div>
          <WalletBtn
            label={loading === "generate" ? "Generating..." : "Generate Keypair"}
            onClick={() => handleGenerate(selectedAgent)}
            disabled={loading !== null}
            color="#22d3ee"
          />
        </div>
      ) : (
        <>
          {/* Wallet info */}
          <div style={{ background: "#0f172a", borderRadius: 6, padding: 10, border: "1px solid #1e293b" }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>
              Public Key
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "#94a3b8", marginTop: 2, wordBreak: "break-all" }}>
              {truncateKey(wallet.publicKey)}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
              <div>
                <div style={{ fontFamily: "monospace", fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>
                  Balance
                </div>
                <div suppressHydrationWarning style={{ fontFamily: "monospace", fontSize: 18, fontWeight: 700, color: "#fbbf24", marginTop: 2 }}>
                  {parseFloat(wallet.balance).toFixed(2)} XLM
                </div>
              </div>
              <div style={{ marginLeft: "auto", display: "flex", gap: 6 }}>
                <WalletBtn
                  label={loading === "refresh" ? "..." : "Refresh"}
                  onClick={() => handleRefresh(selectedAgent)}
                  disabled={loading !== null}
                  color="#64748b"
                />
              </div>
            </div>
          </div>

          {/* Fund button */}
          {!wallet.funded && (
            <WalletBtn
              label={loading === "fund" ? "Funding via Friendbot..." : "Fund with Friendbot (10,000 XLM)"}
              onClick={() => handleFund(selectedAgent)}
              disabled={loading !== null}
              color="#34d399"
            />
          )}

          {/* Send payment */}
          {wallet.funded && (
            <div style={{ background: "#0f172a", borderRadius: 6, padding: 10, border: "1px solid #1e293b" }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Send XLM
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <select
                  value={sendTo}
                  onChange={e => setSendTo(e.target.value)}
                  style={{
                    background: "#111827",
                    border: "1px solid #1e293b",
                    borderRadius: 4,
                    padding: "6px 8px",
                    fontFamily: "monospace",
                    fontSize: 11,
                    color: "#e2e8f0",
                    outline: "none",
                  }}
                >
                  <option value="">Select recipient...</option>
                  {otherFunded.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({truncateKey(a.wallet!.publicKey)})</option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={e => setSendAmount(e.target.value)}
                    min="1"
                    step="1"
                    style={{
                      flex: 1,
                      background: "#111827",
                      border: "1px solid #1e293b",
                      borderRadius: 4,
                      padding: "6px 8px",
                      fontFamily: "monospace",
                      fontSize: 11,
                      color: "#e2e8f0",
                      outline: "none",
                    }}
                  />
                  <WalletBtn
                    label={loading === "send" ? "Sending..." : "Send"}
                    onClick={() => handleSend(selectedAgent)}
                    disabled={loading !== null || !sendTo || !sendAmount}
                    color="#fbbf24"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Error display */}
          {error && (
            <div style={{ fontFamily: "monospace", fontSize: 10, color: "#f87171", padding: "6px 10px", background: "#2a141422", borderRadius: 4, border: "1px solid #f8717122" }}>
              {error}
            </div>
          )}
        </>
      )}

      {/* Transaction history */}
      {transactions.length > 0 && (
        <div style={{ marginTop: 4, padding: 10, background: "#0f172a", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Recent Transactions
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {[...transactions].reverse().slice(0, 10).map(tx => (
              <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "monospace" }}>
                <span style={{ color: "#f87171" }}>{tx.fromName}</span>
                <span style={{ color: "#334155" }}>{">"}</span>
                <span style={{ color: "#34d399" }}>{tx.toName}</span>
                <span style={{ color: "#fbbf24", marginLeft: "auto" }}>{tx.amount} XLM</span>
                <span style={{ color: "#334155", fontSize: 9 }}>{tx.timestamp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All wallets overview */}
      <div style={{ marginTop: 4, padding: 10, background: "#0f172a", borderRadius: 6, border: "1px solid #1e293b" }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          All Bot Wallets
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {agents.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
              <span style={{ fontFamily: "monospace", fontSize: 10, color: a.id === selectedAgent.id ? a.color : "#94a3b8", flex: 1, fontWeight: a.id === selectedAgent.id ? 700 : 400 }}>
                {a.name}
              </span>
              <span suppressHydrationWarning style={{ fontFamily: "monospace", fontSize: 10, color: a.wallet?.funded ? "#fbbf24" : "#334155" }}>
                {a.wallet ? `${parseFloat(a.wallet.balance).toFixed(1)} XLM` : "No wallet"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
