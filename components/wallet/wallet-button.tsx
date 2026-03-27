'use client'
// Wallet connection for BNB and Stellar networks
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useDisconnect } from 'wagmi'
import { 
  connectFreighter, 
  getFreighterPublicKey, 
  getFreighterNetwork,
  isFreighterInstalled,
  disconnectFreighter,
  type StellarNetwork
} from '@/lib/stellar-utils'

interface WalletState {
  bnb: { address: string | null; connected: boolean }
  stellar: { publicKey: string | null; network: StellarNetwork | null; connected: boolean }
}

export function WalletButton() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [walletState, setWalletState] = useState<WalletState>({
    bnb: { address: null, connected: false },
    stellar: { publicKey: null, network: null, connected: false }
  })
  const [freighterAvailable, setFreighterAvailable] = useState(false)
  const [isConnecting, setIsConnecting] = useState<'bnb' | 'stellar' | null>(null)

  const { address: bnbAddress, isConnected: isBnbConnected } = useAccount()
  const { disconnect: disconnectBnb } = useDisconnect()

  useEffect(() => {
    async function checkFreighter() {
      try {
        const freighterApi = await isFreighterInstalled()
        const freighterWindow = typeof window !== 'undefined' && !!(window as any).freighter
        setFreighterAvailable(freighterApi || freighterWindow)
        
        if (freighterApi || freighterWindow) {
          const publicKey = await getFreighterPublicKey()
          if (publicKey) {
            const network = await getFreighterNetwork()
            setWalletState(prev => ({
              ...prev,
              stellar: { publicKey, network, connected: true }
            }))
          }
        }
      } catch (e) {
        // Silent
      }
    }
    
    const t1 = setTimeout(checkFreighter, 500)
    const t2 = setTimeout(checkFreighter, 1500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    setWalletState(prev => ({
      ...prev,
      bnb: { address: bnbAddress || null, connected: isBnbConnected }
    }))
  }, [bnbAddress, isBnbConnected])

  const handleConnectBnb = useCallback(async () => {
    setIsConnecting('bnb')
    try {
      const appKit = (window as any).appKit
      if (appKit?.open) await appKit.open()
    } catch (err) {
      console.error('[v0] BNB Error:', err)
    } finally {
      setIsConnecting(null)
      setShowDropdown(false)
    }
  }, [])

  const handleConnectStellar = useCallback(async () => {
    setIsConnecting('stellar')
    try {
      const { publicKey } = await connectFreighter()
      if (publicKey) {
        const network = await getFreighterNetwork()
        setWalletState(prev => ({
          ...prev,
          stellar: { publicKey, network, connected: true }
        }))
      }
    } catch (err) {
      console.error('[v0] Stellar Error:', err)
    } finally {
      setIsConnecting(null)
      setShowDropdown(false)
    }
  }, [])

  const handleDisconnectBnb = useCallback(() => {
    disconnectBnb()
    setWalletState(prev => ({ ...prev, bnb: { address: null, connected: false } }))
  }, [disconnectBnb])

  const handleDisconnectStellar = useCallback(() => {
    disconnectFreighter()
    setWalletState(prev => ({ ...prev, stellar: { publicKey: null, network: null, connected: false } }))
  }, [])

  const formatAddr = (addr: string) => addr.slice(0, 4) + '..' + addr.slice(-3)
  const hasConn = walletState.bnb.connected || walletState.stellar.connected
  const bg = hasConn ? '#2d5a27' : '#4a3728'
  const bdr = hasConn ? '#1a3d16' : '#2d221a'

  return (
    <div className="relative pointer-events-auto">
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-3 py-2 flex items-center gap-2"
        style={{ backgroundColor: bg, border: '3px solid ' + bdr, boxShadow: '3px 3px 0 rgba(0,0,0,0.3)', fontFamily: 'var(--font-vt323)', imageRendering: 'pixelated' }}
        whileHover={{ y: -1 }}
        whileTap={{ y: 1 }}
      >
        <WalletIcon connected={hasConn} />
        <span className="text-xs font-bold text-white uppercase tracking-wide">
          {hasConn ? (walletState.bnb.address ? formatAddr(walletState.bnb.address) : formatAddr(walletState.stellar.publicKey || '')) : 'WALLET'}
        </span>
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-56 z-50"
            style={{ backgroundColor: '#f5e6d3', border: '4px solid #4a3728', boxShadow: '4px 4px 0 rgba(0,0,0,0.4)', imageRendering: 'pixelated' }}
          >
            <div style={{ backgroundColor: '#4a3728', borderBottom: '2px solid #2d221a', padding: '8px 12px' }}>
              <span style={{ fontFamily: 'var(--font-vt323)', color: '#ffd700', fontSize: '12px', fontWeight: 'bold' }}>CONECTAR WALLET</span>
            </div>

            <div style={{ padding: '12px', borderBottom: '2px solid #4a3728' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BnbIcon />
                  <span style={{ fontFamily: 'var(--font-vt323)', color: '#4a3728', fontSize: '12px', fontWeight: 'bold' }}>BNB Testnet</span>
                </div>
                <StatusBadge active={walletState.bnb.connected} />
              </div>
              {walletState.bnb.connected && walletState.bnb.address ? (
                <div className="flex items-center justify-between gap-2">
                  <span style={{ fontFamily: 'var(--font-vt323)', color: '#666', fontSize: '12px' }}>{formatAddr(walletState.bnb.address)}</span>
                  <Btn onClick={handleDisconnectBnb} variant="danger" small>X</Btn>
                </div>
              ) : (
                <Btn onClick={handleConnectBnb} disabled={isConnecting === 'bnb'} variant="bnb" fullWidth>{isConnecting === 'bnb' ? 'Conectando...' : 'WalletConnect'}</Btn>
              )}
            </div>

            <div style={{ padding: '12px' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StellarIcon />
                  <span style={{ fontFamily: 'var(--font-vt323)', color: '#4a3728', fontSize: '12px', fontWeight: 'bold' }}>Stellar Testnet</span>
                </div>
                <StatusBadge active={walletState.stellar.connected} />
              </div>
              {walletState.stellar.connected && walletState.stellar.publicKey ? (
                <div className="flex items-center justify-between gap-2">
                  <span style={{ fontFamily: 'var(--font-vt323)', color: '#666', fontSize: '12px' }}>{formatAddr(walletState.stellar.publicKey)}</span>
                  <Btn onClick={handleDisconnectStellar} variant="danger" small>X</Btn>
                </div>
              ) : (
                <Btn onClick={handleConnectStellar} disabled={isConnecting === 'stellar'} variant="stellar" fullWidth>{isConnecting === 'stellar' ? 'Conectando...' : 'Freighter'}</Btn>
              )}
              <div style={{ fontSize: '11px', marginTop: '8px', textAlign: 'center', fontFamily: 'var(--font-vt323)', color: freighterAvailable ? '#2d5a27' : '#8b2942' }}>
                {freighterAvailable ? 'Freighter Detectado' : 'Descarga Freighter'}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function WalletIcon({ connected }: { connected: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="4" width="12" height="10" fill={connected ? '#ffd700' : '#d4a574'} />
      <rect x="1" y="5" width="1" height="8" fill="#4a3728" />
      <rect x="14" y="5" width="1" height="8" fill="#4a3728" />
      <rect x="2" y="3" width="12" height="1" fill="#4a3728" />
      <rect x="2" y="14" width="12" height="1" fill="#4a3728" />
      <rect x="10" y="8" width="4" height="3" fill="#4a3728" />
    </svg>
  )
}

function BnbIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      <rect x="7" y="3" width="2" height="2" fill="#f0b90b" />
      <rect x="4" y="5" width="2" height="2" fill="#f0b90b" />
      <rect x="10" y="5" width="2" height="2" fill="#f0b90b" />
      <rect x="7" y="7" width="2" height="2" fill="#f0b90b" />
    </svg>
  )
}

function StellarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      <rect x="3" y="5" width="10" height="2" fill="#000" />
      <rect x="3" y="9" width="10" height="2" fill="#000" />
      <rect x="5" y="7" width="2" height="2" fill="#000" />
      <rect x="9" y="7" width="2" height="2" fill="#000" />
    </svg>
  )
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <div style={{ backgroundColor: active ? '#2d5a27' : '#8b8b8b', border: '2px solid ' + (active ? '#1a3d16' : '#666'), fontFamily: 'var(--font-vt323)', color: '#fff', fontSize: '10px', padding: '2px 6px' }}>
      {active ? 'ON' : 'OFF'}
    </div>
  )
}

function Btn({ children, onClick, disabled, variant = 'default', fullWidth, small }: { children: React.ReactNode; onClick: () => void; disabled?: boolean; variant?: 'bnb' | 'stellar' | 'danger' | 'default'; fullWidth?: boolean; small?: boolean }) {
  const c = { bnb: { bg: '#f0b90b', bdr: '#c99b09', txt: '#1e2026' }, stellar: { bg: '#222', bdr: '#000', txt: '#fff' }, danger: { bg: '#8b2942', bdr: '#5c1a2a', txt: '#fff' }, default: { bg: '#4a3728', bdr: '#2d221a', txt: '#fff' } }[variant]
  return (
    <button onClick={onClick} disabled={disabled} className={(fullWidth ? 'w-full ' : '') + (small ? 'px-2 py-1' : 'py-2 px-3') + ' text-xs font-bold uppercase'} style={{ backgroundColor: disabled ? '#ccc' : c.bg, border: '2px solid ' + (disabled ? '#999' : c.bdr), color: disabled ? '#666' : c.txt, fontFamily: 'var(--font-vt323)', cursor: disabled ? 'not-allowed' : 'pointer', boxShadow: disabled ? 'none' : '2px 2px 0 rgba(0,0,0,0.2)' }}>
      {children}
    </button>
  )
}
