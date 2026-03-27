'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useDisconnect } from 'wagmi'
import { useAppKitReady } from './wallet-provider'
import { 
  connectFreighter, 
  getFreighterPublicKey, 
  getFreighterNetwork,
  isFreighterInstalled,
  disconnectFreighter,
  type StellarNetwork
} from '@/lib/stellar-utils'

type WalletType = 'bnb' | 'stellar' | null

interface WalletState {
  bnb: {
    address: string | null
    connected: boolean
  }
  stellar: {
    publicKey: string | null
    network: StellarNetwork | null
    connected: boolean
  }
}

export function WalletButton() {
  const [showDropdown, setShowDropdown] = useState(false)
  const [walletState, setWalletState] = useState<WalletState>({
    bnb: { address: null, connected: false },
    stellar: { publicKey: null, network: null, connected: false }
  })
  const [freighterAvailable, setFreighterAvailable] = useState(false)
  const [isConnecting, setIsConnecting] = useState<WalletType>(null)

  // Wagmi hooks (siempre disponibles)
  const { address: bnbAddress, isConnected: isBnbConnected } = useAccount()
  const { disconnect: disconnectBnb } = useDisconnect()
  
  // Check if AppKit is ready
  const appKitReady = useAppKitReady()

  // Check Freighter availability on mount - with retries for slow loading
  useEffect(() => {
    let attempts = 0
    const maxAttempts = 5
    
    async function checkFreighter() {
      // Check both ways - the API and direct window access
      const freighterApi = await isFreighterInstalled()
      const freighterWindow = typeof window !== 'undefined' && !!(window as any).freighter
      const installed = freighterApi || freighterWindow
      
      setFreighterAvailable(installed)
      
      if (installed) {
        try {
          const publicKey = await getFreighterPublicKey()
          if (publicKey) {
            const network = await getFreighterNetwork()
            setWalletState(prev => ({
              ...prev,
              stellar: { publicKey, network, connected: true }
            }))
          }
        } catch (e) {
          // Freighter installed but not connected - that's OK
        }
      } else if (attempts < maxAttempts) {
        // Retry after a delay - extension might load slowly
        attempts++
        setTimeout(checkFreighter, 1000)
      }
    }
    
    // Initial check with small delay to let extension inject
    setTimeout(checkFreighter, 500)
  }, [])

  // Sync BNB connection state
  useEffect(() => {
    setWalletState(prev => ({
      ...prev,
      bnb: { 
        address: bnbAddress || null, 
        connected: isBnbConnected 
      }
    }))
  }, [bnbAddress, isBnbConnected])

  // Connect to BNB via WalletConnect
  const handleConnectBnb = useCallback(async () => {
    setIsConnecting('bnb')
    try {
      // Dynamic import to avoid SSR issues
      const { useAppKit } = await import('@reown/appkit/react')
      const appKit = (window as any).appKit
      
      if (appKit?.open) {
        await appKit.open()
      } else {
        // Try using the hook's open function
        try {
          const mod = await import('@reown/appkit/react')
          if (mod.open) {
            await mod.open()
          }
        } catch (e) {
          console.error('[v0] Could not open wallet modal:', e)
          alert('Error: Configura NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID en las variables de entorno')
        }
      }
    } catch (err) {
      console.error('[v0] Error connecting BNB wallet:', err)
      alert('Error conectando wallet. Verifica tu configuracion.')
    } finally {
      setIsConnecting(null)
      setShowDropdown(false)
    }
  }, [])

  // Connect to Stellar via Freighter
  const handleConnectStellar = useCallback(async () => {
    setIsConnecting('stellar')
    try {
      const { publicKey, error } = await connectFreighter()
      
      if (error) {
        console.error('[v0] Freighter error:', error)
        return
      }

      if (publicKey) {
        const network = await getFreighterNetwork()
        setWalletState(prev => ({
          ...prev,
          stellar: { publicKey, network, connected: true }
        }))
      }
    } catch (err) {
      console.error('[v0] Error connecting Stellar wallet:', err)
    } finally {
      setIsConnecting(null)
      setShowDropdown(false)
    }
  }, [])

  // Disconnect handlers
  const handleDisconnectBnb = useCallback(() => {
    disconnectBnb()
    setWalletState(prev => ({
      ...prev,
      bnb: { address: null, connected: false }
    }))
  }, [disconnectBnb])

  const handleDisconnectStellar = useCallback(() => {
    disconnectFreighter()
    setWalletState(prev => ({
      ...prev,
      stellar: { publicKey: null, network: null, connected: false }
    }))
  }, [])

  // Format address for display
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 4)}..${addr.slice(-3)}`
  }

  const hasAnyConnection = walletState.bnb.connected || walletState.stellar.connected

  // Pixel art styled button colors
  const buttonBg = hasAnyConnection ? '#2d5a27' : '#4a3728'
  const buttonBorder = hasAnyConnection ? '#1a3d16' : '#2d221a'

  return (
    <div className="relative pointer-events-auto">
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-3 py-2 flex items-center gap-2"
        style={{
          backgroundColor: buttonBg,
          border: `3px solid ${buttonBorder}`,
          boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
          fontFamily: 'var(--font-vt323)',
          imageRendering: 'pixelated'
        }}
        whileHover={{ y: -1 }}
        whileTap={{ y: 1 }}
      >
        <PixelWalletIcon connected={hasAnyConnection} />
        <span className="text-xs font-bold text-white uppercase tracking-wide">
          {hasAnyConnection 
            ? (walletState.bnb.address 
                ? formatAddress(walletState.bnb.address)
                : walletState.stellar.publicKey 
                  ? formatAddress(walletState.stellar.publicKey)
                  : 'WALLET')
            : 'WALLET'}
        </span>
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className="absolute top-full right-0 mt-2 w-56 z-50"
            style={{
              backgroundColor: '#f5e6d3',
              border: '4px solid #4a3728',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.4)',
              imageRendering: 'pixelated'
            }}
          >
            {/* Header - Pixel style */}
            <div 
              className="px-3 py-2"
              style={{ 
                backgroundColor: '#4a3728',
                borderBottom: '2px solid #2d221a'
              }}
            >
              <span 
                className="text-xs font-bold uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-vt323)', color: '#ffd700' }}
              >
                Conectar Wallet
              </span>
            </div>

            {/* BNB Section */}
            <div className="p-3" style={{ borderBottom: '2px solid #4a3728' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PixelBnbIcon />
                  <span 
                    className="text-xs font-bold"
                    style={{ fontFamily: 'var(--font-vt323)', color: '#4a3728' }}
                  >
                    BNB Testnet
                  </span>
                </div>
                <PixelStatusBadge active={walletState.bnb.connected} />
              </div>
              
              {walletState.bnb.connected && walletState.bnb.address ? (
                <div className="flex items-center justify-between gap-2">
                  <span 
                    className="text-xs truncate"
                    style={{ fontFamily: 'var(--font-vt323)', color: '#666' }}
                  >
                    {formatAddress(walletState.bnb.address)}
                  </span>
                  <PixelButton 
                    onClick={handleDisconnectBnb}
                    variant="danger"
                    small
                  >
                    X
                  </PixelButton>
                </div>
              ) : (
                <PixelButton
                  onClick={handleConnectBnb}
                  disabled={isConnecting === 'bnb'}
                  variant="bnb"
                  fullWidth
                >
                  {isConnecting === 'bnb' ? 'Conectando...' : 'WalletConnect'}
                </PixelButton>
              )}
            </div>

            {/* Stellar Section */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <PixelStellarIcon />
                  <span 
                    className="text-xs font-bold"
                    style={{ fontFamily: 'var(--font-vt323)', color: '#4a3728' }}
                  >
                    Stellar {walletState.stellar.network || 'Testnet'}
                  </span>
                </div>
                <PixelStatusBadge active={walletState.stellar.connected} />
              </div>
              
              {walletState.stellar.connected && walletState.stellar.publicKey ? (
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs truncate" style={{ fontFamily: 'var(--font-vt323)', color: '#666' }}>
                    {formatAddress(walletState.stellar.publicKey)}
                  </span>
                  <PixelButton onClick={handleDisconnectStellar} variant="danger" small>
                    X
                  </PixelButton>
                </div>
              ) : (
                <PixelButton onClick={handleConnectStellar} disabled={isConnecting === 'stellar'} variant="stellar" fullWidth>
                  {isConnecting === 'stellar' ? 'Conectando...' : 'Freighter'}
                </PixelButton>
              )}
              <a href="https://www.freighter.app/" target="_blank" rel="noopener noreferrer" className="block text-xs mt-2 text-center" style={{ fontFamily: 'var(--font-vt323)', color: freighterAvailable ? '#2d5a27' : '#8b2942', textDecoration: 'underline' }}>
                {freighterAvailable ? 'Freighter Detectado' : 'Descargar Freighter'}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Pixel art styled components

function PixelWalletIcon({ connected }: { connected: boolean }) {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      <rect x="2" y="4" width="12" height="10" fill={connected ? '#ffd700' : '#d4a574'} />
      <rect x="1" y="5" width="1" height="8" fill="#4a3728" />
      <rect x="14" y="5" width="1" height="8" fill="#4a3728" />
      <rect x="2" y="3" width="12" height="1" fill="#4a3728" />
      <rect x="2" y="14" width="12" height="1" fill="#4a3728" />
      <rect x="10" y="8" width="4" height="3" fill="#4a3728" />
      <rect x="11" y="9" width="2" height="1" fill={connected ? '#2d5a27' : '#8b8b8b'} />
    </svg>
  )
}

function PixelBnbIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      <rect x="0" y="0" width="16" height="16" fill="#f0b90b" rx="2" />
      <rect x="7" y="3" width="2" height="2" fill="#fff" />
      <rect x="4" y="5" width="2" height="2" fill="#fff" />
      <rect x="10" y="5" width="2" height="2" fill="#fff" />
      <rect x="7" y="7" width="2" height="2" fill="#fff" />
      <rect x="4" y="9" width="2" height="2" fill="#fff" />
      <rect x="10" y="9" width="2" height="2" fill="#fff" />
      <rect x="7" y="11" width="2" height="2" fill="#fff" />
    </svg>
  )
}

function PixelStellarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      <rect x="0" y="0" width="16" height="16" fill="#000" rx="2" />
      <rect x="3" y="5" width="10" height="2" fill="#fff" />
      <rect x="3" y="9" width="10" height="2" fill="#fff" />
      <rect x="5" y="7" width="2" height="2" fill="#fff" />
      <rect x="9" y="7" width="2" height="2" fill="#fff" />
    </svg>
  )
}

function PixelStatusBadge({ active }: { active: boolean }) {
  return (
    <div 
      className="px-2 py-0.5"
      style={{ 
        backgroundColor: active ? '#2d5a27' : '#8b8b8b',
        border: `2px solid ${active ? '#1a3d16' : '#666'}`,
        fontFamily: 'var(--font-vt323)',
        color: '#fff',
        fontSize: '10px'
      }}
    >
      {active ? 'ON' : 'OFF'}
    </div>
  )
}

interface PixelButtonProps {
  children: React.ReactNode
  onClick: () => void
  disabled?: boolean
  variant?: 'bnb' | 'stellar' | 'danger' | 'default'
  fullWidth?: boolean
  small?: boolean
}

function PixelButton({ 
  children, 
  onClick, 
  disabled, 
  variant = 'default',
  fullWidth,
  small
}: PixelButtonProps) {
  const colors = {
    bnb: { bg: '#f0b90b', border: '#c99b09', text: '#1e2026' },
    stellar: { bg: '#222', border: '#000', text: '#fff' },
    danger: { bg: '#8b2942', border: '#5c1a2a', text: '#fff' },
    default: { bg: '#4a3728', border: '#2d221a', text: '#fff' }
  }[variant]

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${fullWidth ? 'w-full' : ''} ${small ? 'px-2 py-1' : 'py-2 px-3'} text-xs font-bold uppercase`}
      style={{ 
        backgroundColor: disabled ? '#ccc' : colors.bg,
        border: `2px solid ${disabled ? '#999' : colors.border}`,
        color: disabled ? '#666' : colors.text,
        fontFamily: 'var(--font-vt323)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: disabled ? 'none' : '2px 2px 0 rgba(0,0,0,0.2)'
      }}
    >
      {children}
    </button>
  )
}
