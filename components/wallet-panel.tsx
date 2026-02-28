"use client"

import { useState, useEffect, useCallback } from "react"
import type { MoltbotAgent, WalletTransaction } from "@/lib/types"

interface WalletPanelProps {
  agents: MoltbotAgent[]
  selectedAgent: MoltbotAgent | null
  transactions: WalletTransaction[]
  onUpdateAgent: (agentId: string, wallet: MoltbotAgent["wallet"]) => void
  onAddTransaction: (tx: WalletTransaction) => void
}

function truncAddr(addr: string) {
  if (addr.length <= 14) return addr
  return addr.slice(0, 6) + "..." + addr.slice(-6)
}

// Freighter API is loaded dynamically to avoid SSR issues
async function getFreighter() {
  try {
    const mod = await import("@stellar/freighter-api")
    return mod
  } catch {
    return null
  }
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
        width: "100%",
      }}
    >
      {label}
    </button>
  )
}

export function WalletPanel({ agents, selectedAgent, transactions, onUpdateAgent, onAddTransaction }: WalletPanelProps) {
  const [freighterAvailable, setFreighterAvailable] = useState<boolean | null>(null)
  const [connectedKey, setConnectedKey] = useState<string | null>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sendTo, setSendTo] = useState("")
  const [sendAmount, setSendAmount] = useState("10")

  // Check Freighter availability on mount
  useEffect(() => {
    let cancelled = false
    const check = async () => {
      const freighter = await getFreighter()
      if (cancelled) return
      if (!freighter) { setFreighterAvailable(false); return }
      try {
        const result = await freighter.isConnected()
        if (cancelled) return
        setFreighterAvailable(!!result)
        if (result) {
          try {
            const addr = await freighter.getAddress()
            if (!cancelled && addr?.address) {
              setConnectedKey(addr.address)
            }
          } catch {
            // Not yet authorized -- that's ok
          }
        }
      } catch {
        if (!cancelled) setFreighterAvailable(false)
      }
    }
    check()
    return () => { cancelled = true }
  }, [])

  const handleConnect = useCallback(async () => {
    setLoading("connect")
    setError(null)
    try {
      const freighter = await getFreighter()
      if (!freighter) throw new Error("Freighter not found")

      await freighter.setAllowed()
      const addr = await freighter.getAddress()
      if (addr?.address) {
        setConnectedKey(addr.address)
      } else {
        throw new Error("Could not get address from Freighter")
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to connect Freighter")
    }
    setLoading(null)
  }, [])

  // Assign the connected Freighter key to the selected agent
  const handleAssignWallet = useCallback(async (agent: MoltbotAgent) => {
    if (!connectedKey) return
    setLoading("assign")
    setError(null)
    onUpdateAgent(agent.id, {
      publicKey: connectedKey,
      balance: "0",
      funded: false,
    })
    // Try to fetch existing balance
    try {
      const res = await fetch("/api/stellar/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: connectedKey }),
      })
      const data = await res.json()
      if (data.balance && parseFloat(data.balance) > 0) {
        onUpdateAgent(agent.id, {
          publicKey: connectedKey,
          balance: data.balance,
          funded: true,
        })
      }
    } catch {
      // Ignore -- new account may not exist yet
    }
    setLoading(null)
  }, [connectedKey, onUpdateAgent])

  const handleFund = useCallback(async (agent: MoltbotAgent) => {
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
      onUpdateAgent(agent.id, { ...agent.wallet, balance: data.balance || "10000", funded: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Friendbot funding failed")
    }
    setLoading(null)
  }, [onUpdateAgent])

  const handleRefresh = useCallback(async (agent: MoltbotAgent) => {
    if (!agent.wallet) return
    setLoading("refresh")
    try {
      const res = await fetch("/api/stellar/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ publicKey: agent.wallet.publicKey }),
      })
      const data = await res.json()
      const bal = data.balance || "0"
      onUpdateAgent(agent.id, { ...agent.wallet, balance: bal, funded: parseFloat(bal) > 0 })
    } catch { /* silent */ }
    setLoading(null)
  }, [onUpdateAgent])

  const handleSend = useCallback(async (agent: MoltbotAgent) => {
    if (!agent.wallet || !sendTo || !sendAmount) return
    const recipient = agents.find(a => a.id === sendTo)
    if (!recipient?.wallet?.funded) {
      setError("Recipient has no funded wallet")
      return
    }
    setLoading("send")
    setError(null)
    try {
      // Step 1: Build the unsigned transaction on the server
      const buildRes = await fetch("/api/stellar/build-tx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sourcePublic: agent.wallet.publicKey,
          destination: recipient.wallet.publicKey,
          amount: sendAmount,
        }),
      })
      const buildData = await buildRes.json()
      if (buildData.error) throw new Error(buildData.error)

      // Step 2: Sign with Freighter
      const freighter = await getFreighter()
      if (!freighter) throw new Error("Freighter not available")

      const signResult = await freighter.signTransaction(buildData.xdr, {
        networkPassphrase: "Test SDF Network ; September 2015",
      })

      // signResult can be { signedTxXdr: string } or a string
      const signedXdr = typeof signResult === "string" ? signResult : signResult.signedTxXdr

      // Step 3: Submit signed transaction on the server
      const submitRes = await fetch("/api/stellar/submit-tx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signedXdr }),
      })
      const submitData = await submitRes.json()
      if (submitData.error) throw new Error(submitData.error)

      // Step 4: Refresh balances
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
        hash: submitData.hash || "unknown",
      })
      setSendAmount("10")
      setSendTo("")
    } catch (e) {
      setError(e instanceof Error ? e.message : "Transaction failed")
    }
    setLoading(null)
  }, [agents, sendTo, sendAmount, onUpdateAgent, onAddTransaction])

  // -- Render --

  // Freighter status banner
  const renderFreighterStatus = () => {
    if (freighterAvailable === null) {
      return (
        <div style={{ padding: 16, fontFamily: "monospace", fontSize: 11, color: "#64748b", textAlign: "center" }}>
          Checking Freighter wallet...
        </div>
      )
    }

    if (!freighterAvailable) {
      return (
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <div style={{ fontFamily: "monospace", fontSize: 12, color: "#f87171", fontWeight: 700 }}>
            Freighter Not Detected
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textAlign: "center", lineHeight: 1.5 }}>
            Install the Freighter browser extension to connect your Stellar wallet.
          </div>
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              padding: "8px 16px",
              background: "#22d3ee22",
              color: "#22d3ee",
              border: "1px solid #22d3ee44",
              borderRadius: 4,
              fontFamily: "monospace",
              fontSize: 11,
              fontWeight: 600,
              textDecoration: "none",
              display: "inline-block",
            }}
          >
            Get Freighter
          </a>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "#334155", textAlign: "center" }}>
            Stellar Testnet only
          </div>
        </div>
      )
    }

    if (!connectedKey) {
      return (
        <div style={{ padding: 16, display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
          <div style={{ fontSize: 28, opacity: 0.3, fontFamily: "monospace" }}>XLM</div>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", textAlign: "center" }}>
            Freighter detected. Connect to manage bot wallets.
          </div>
          <WalletBtn
            label={loading === "connect" ? "Connecting..." : "Connect Freighter Wallet"}
            onClick={handleConnect}
            disabled={loading !== null}
            color="#22d3ee"
          />
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "#334155", textAlign: "center" }}>
            Stellar Testnet
          </div>
        </div>
      )
    }

    return null
  }

  const statusBanner = renderFreighterStatus()
  if (statusBanner) return statusBanner

  // Connected state -- show wallet address bar
  if (!selectedAgent) {
    return (
      <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, height: "100%" }}>
        {/* Connected address */}
        <div style={{ background: "#0f172a", borderRadius: 6, padding: 10, border: "1px solid #1e293b" }}>
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>
            Freighter Connected
          </div>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#22d3ee", marginTop: 4, wordBreak: "break-all" }}>
            {truncAddr(connectedKey!)}
          </div>
          <div style={{
            marginTop: 6,
            width: 8, height: 8, borderRadius: "50%", background: "#34d399",
            display: "inline-block",
          }} />
          <span style={{ fontFamily: "monospace", fontSize: 9, color: "#34d399", marginLeft: 6 }}>Online</span>
        </div>

        <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", textAlign: "center", padding: 12 }}>
          Select a bot on the map to assign and manage its wallet
        </div>

        {/* All wallets overview */}
        <div style={{ padding: 10, background: "#0f172a", borderRadius: 6, border: "1px solid #1e293b", flex: 1, overflow: "auto" }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            All Bot Wallets
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {agents.map(a => (
              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
                <span style={{ fontFamily: "monospace", fontSize: 10, color: "#94a3b8", flex: 1 }}>
                  {a.name}
                </span>
                <span suppressHydrationWarning style={{ fontFamily: "monospace", fontSize: 10, color: a.wallet?.funded ? "#fbbf24" : "#334155" }}>
                  {a.wallet ? `${parseFloat(a.wallet.balance).toFixed(1)} XLM` : "---"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent transactions */}
        {transactions.length > 0 && (
          <div style={{ padding: 10, background: "#0f172a", borderRadius: 6, border: "1px solid #1e293b" }}>
            <div style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
              Recent Transactions
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[...transactions].reverse().slice(0, 5).map(tx => (
                <div key={tx.id} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, fontFamily: "monospace" }}>
                  <span style={{ color: "#f87171" }}>{tx.fromName}</span>
                  <span style={{ color: "#334155" }}>{">"}</span>
                  <span style={{ color: "#34d399" }}>{tx.toName}</span>
                  <span style={{ color: "#fbbf24", marginLeft: "auto" }}>{tx.amount} XLM</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  // Selected agent wallet management
  const wallet = selectedAgent.wallet
  const otherFunded = agents.filter(a => a.id !== selectedAgent.id && a.wallet?.funded)

  return (
    <div style={{ padding: 12, display: "flex", flexDirection: "column", gap: 10, overflowY: "auto", height: "100%" }}>
      {/* Connected Freighter bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 8px", background: "#0f172a", borderRadius: 4, border: "1px solid #1e293b" }}>
        <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34d399" }} />
        <span style={{ fontFamily: "monospace", fontSize: 9, color: "#94a3b8", flex: 1 }}>
          {truncAddr(connectedKey!)}
        </span>
        <span style={{ fontFamily: "monospace", fontSize: 9, color: "#334155", background: "#1e293b", padding: "1px 5px", borderRadius: 3 }}>
          TESTNET
        </span>
      </div>

      {/* Agent header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 8, borderBottom: "1px solid #1e293b" }}>
        <div style={{ width: 10, height: 10, borderRadius: "50%", background: selectedAgent.color }} />
        <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 700, color: selectedAgent.color }}>
          {selectedAgent.name}
        </span>
      </div>

      {!wallet ? (
        /* No wallet assigned -- offer to assign */
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, padding: 16 }}>
          <div style={{ fontFamily: "monospace", fontSize: 11, color: "#64748b", textAlign: "center" }}>
            No wallet assigned to this bot.
          </div>
          <WalletBtn
            label={loading === "assign" ? "Assigning..." : "Assign Freighter Wallet"}
            onClick={() => handleAssignWallet(selectedAgent)}
            disabled={loading !== null}
            color={selectedAgent.color}
          />
          <div style={{ fontFamily: "monospace", fontSize: 9, color: "#334155", textAlign: "center" }}>
            Links your connected Freighter account to this bot
          </div>
        </div>
      ) : (
        <>
          {/* Wallet info card */}
          <div style={{ background: "#0f172a", borderRadius: 6, padding: 10, border: "1px solid #1e293b" }}>
            <div style={{ fontFamily: "monospace", fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: 1 }}>
              Public Key
            </div>
            <div style={{ fontFamily: "monospace", fontSize: 11, color: "#94a3b8", marginTop: 2, wordBreak: "break-all" }}>
              {truncAddr(wallet.publicKey)}
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
              <div style={{ marginLeft: "auto" }}>
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

          {/* Send payment (Freighter signed) */}
          {wallet.funded && (
            <div style={{ background: "#0f172a", borderRadius: 6, padding: 10, border: "1px solid #1e293b" }}>
              <div style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
                Send XLM (signed via Freighter)
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
                  <option value="">Select recipient bot...</option>
                  {otherFunded.map(a => (
                    <option key={a.id} value={a.id}>{a.name} ({truncAddr(a.wallet!.publicKey)})</option>
                  ))}
                </select>
                <div style={{ display: "flex", gap: 6 }}>
                  <input
                    type="number"
                    value={sendAmount}
                    onChange={e => setSendAmount(e.target.value)}
                    min="1"
                    step="1"
                    placeholder="Amount"
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
                    label={loading === "send" ? "Signing..." : "Send"}
                    onClick={() => handleSend(selectedAgent)}
                    disabled={loading !== null || !sendTo || !sendAmount}
                    color="#fbbf24"
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Error display */}
      {error && (
        <div style={{
          fontFamily: "monospace", fontSize: 10, color: "#f87171",
          padding: "6px 10px", background: "#f8717111", borderRadius: 4,
          border: "1px solid #f8717122",
        }}>
          {error}
        </div>
      )}

      {/* Transaction history */}
      {transactions.length > 0 && (
        <div style={{ padding: 10, background: "#0f172a", borderRadius: 6, border: "1px solid #1e293b" }}>
          <div style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
            Transactions
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

      {/* All wallets */}
      <div style={{ padding: 10, background: "#0f172a", borderRadius: 6, border: "1px solid #1e293b" }}>
        <div style={{ fontFamily: "monospace", fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 }}>
          All Bot Wallets
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {agents.map(a => (
            <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: a.color, flexShrink: 0 }} />
              <span style={{
                fontFamily: "monospace", fontSize: 10, flex: 1,
                color: a.id === selectedAgent.id ? a.color : "#94a3b8",
                fontWeight: a.id === selectedAgent.id ? 700 : 400,
              }}>
                {a.name}
              </span>
              <span suppressHydrationWarning style={{ fontFamily: "monospace", fontSize: 10, color: a.wallet?.funded ? "#fbbf24" : "#334155" }}>
                {a.wallet ? `${parseFloat(a.wallet.balance).toFixed(1)} XLM` : "---"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
