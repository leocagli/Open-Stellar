'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react'
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

  // AppKit hooks for BNB
  const { open: openAppKit } = useAppKit()
  const { address: bnbAddress, isConnected: isBnbConnected } = useAppKitAccount()
  const { disconnect: disconnectBnb } = useDisconnect()

  // Check Freighter availability on mount
  useEffect(() => {
    async function checkFreighter() {
      const installed = await isFreighterInstalled()
      setFreighterAvailable(installed)
      
      if (installed) {
        const publicKey = await getFreighterPublicKey()
        if (publicKey) {
          const network = await getFreighterNetwork()
          setWalletState(prev => ({
            ...prev,
            stellar: { publicKey, network, connected: true }
          }))
        }
      }
    }
    checkFreighter()
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
      await openAppKit()
    } catch (err) {
      console.error('[v0] Error connecting BNB wallet:', err)
    } finally {
      setIsConnecting(null)
      setShowDropdown(false)
    }
  }, [openAppKit])

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
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const hasAnyConnection = walletState.bnb.connected || walletState.stellar.connected

  return (
    <div className="relative">
      <motion.button
        onClick={() => setShowDropdown(!showDropdown)}
        className="px-3 py-2 pointer-events-auto flex items-center gap-2"
        style={{
          backgroundColor: hasAnyConnection ? '#2d5a27' : '#8b2942',
          border: '3px solid ' + (hasAnyConnection ? '#1a3d16' : '#5c1a2a'),
          boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
          fontFamily: 'var(--font-vt323)'
        }}
        whileHover={{ y: -1 }}
        whileTap={{ y: 1 }}
      >
        <WalletIcon />
        <span className="text-xs font-bold text-white">
          {hasAnyConnection ? 'CONNECTED' : 'WALLET'}
        </span>
      </motion.button>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 w-64 z-50"
            style={{
              backgroundColor: '#f5f0e1',
              border: '3px solid #4a3728',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.3)'
            }}
          >
            {/* Header */}
            <div 
              className="px-3 py-2 border-b-2"
              style={{ borderColor: '#4a3728', backgroundColor: '#4a3728' }}
            >
              <span 
                className="text-xs font-bold uppercase"
                style={{ fontFamily: 'var(--font-vt323)', color: '#f5f0e1' }}
              >
                Multi-Chain Wallet
              </span>
            </div>

            {/* BNB Section */}
            <div className="p-3 border-b-2" style={{ borderColor: '#4a3728' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <BnbIcon />
                  <span 
                    className="text-xs font-bold"
                    style={{ fontFamily: 'var(--font-vt323)', color: '#4a3728' }}
                  >
                    BNB Testnet
                  </span>
                </div>
                <span 
                  className="text-xs px-2 py-0.5"
                  style={{ 
                    backgroundColor: walletState.bnb.connected ? '#2d5a27' : '#8b8b8b',
                    color: '#fff',
                    fontFamily: 'var(--font-vt323)'
                  }}
                >
                  {walletState.bnb.connected ? 'ON' : 'OFF'}
                </span>
              </div>
              
              {walletState.bnb.connected && walletState.bnb.address ? (
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs"
                    style={{ fontFamily: 'var(--font-vt323)', color: '#666' }}
                  >
                    {formatAddress(walletState.bnb.address)}
                  </span>
                  <button
                    onClick={handleDisconnectBnb}
                    className="text-xs px-2 py-1"
                    style={{ 
                      backgroundColor: '#8b2942',
                      color: '#fff',
                      border: '2px solid #5c1a2a',
                      fontFamily: 'var(--font-vt323)'
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectBnb}
                  disabled={isConnecting === 'bnb'}
                  className="w-full text-xs py-2 px-3"
                  style={{ 
                    backgroundColor: '#f0b90b',
                    color: '#1e2026',
                    border: '2px solid #c99b09',
                    fontFamily: 'var(--font-vt323)',
                    opacity: isConnecting === 'bnb' ? 0.7 : 1
                  }}
                >
                  {isConnecting === 'bnb' ? 'Connecting...' : 'Connect WalletConnect'}
                </button>
              )}
            </div>

            {/* Stellar Section */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <StellarIcon />
                  <span 
                    className="text-xs font-bold"
                    style={{ fontFamily: 'var(--font-vt323)', color: '#4a3728' }}
                  >
                    Stellar {walletState.stellar.network || 'Testnet'}
                  </span>
                </div>
                <span 
                  className="text-xs px-2 py-0.5"
                  style={{ 
                    backgroundColor: walletState.stellar.connected ? '#2d5a27' : '#8b8b8b',
                    color: '#fff',
                    fontFamily: 'var(--font-vt323)'
                  }}
                >
                  {walletState.stellar.connected ? 'ON' : 'OFF'}
                </span>
              </div>
              
              {walletState.stellar.connected && walletState.stellar.publicKey ? (
                <div className="flex items-center justify-between">
                  <span 
                    className="text-xs"
                    style={{ fontFamily: 'var(--font-vt323)', color: '#666' }}
                  >
                    {formatAddress(walletState.stellar.publicKey)}
                  </span>
                  <button
                    onClick={handleDisconnectStellar}
                    className="text-xs px-2 py-1"
                    style={{ 
                      backgroundColor: '#8b2942',
                      color: '#fff',
                      border: '2px solid #5c1a2a',
                      fontFamily: 'var(--font-vt323)'
                    }}
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleConnectStellar}
                  disabled={isConnecting === 'stellar' || !freighterAvailable}
                  className="w-full text-xs py-2 px-3"
                  style={{ 
                    backgroundColor: '#000',
                    color: '#fff',
                    border: '2px solid #333',
                    fontFamily: 'var(--font-vt323)',
                    opacity: (isConnecting === 'stellar' || !freighterAvailable) ? 0.7 : 1
                  }}
                >
                  {!freighterAvailable 
                    ? 'Install Freighter' 
                    : isConnecting === 'stellar' 
                    ? 'Connecting...' 
                    : 'Connect Freighter'}
                </button>
              )}
              
              {!freighterAvailable && (
                <a 
                  href="https://www.freighter.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-xs mt-2 text-center underline"
                  style={{ fontFamily: 'var(--font-vt323)', color: '#666' }}
                >
                  Get Freighter Wallet
                </a>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// Icon components
function WalletIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4h-4z" />
    </svg>
  )
}

function BnbIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 126.61 126.61">
      <circle cx="63.31" cy="63.31" r="63.31" fill="#f0b90b"/>
      <path fill="#fff" d="M63.31 23.59l9.54 9.54-23.2 23.2-9.54-9.54zm23.2 0l9.54 9.54-46.4 46.41-9.54-9.54zm-46.4 23.2l9.54 9.54-23.2 23.2-9.54-9.54zm69.6 0l9.54 9.54-46.4 46.41-9.54-9.54zM63.31 69.99l9.54 9.54-9.54 9.54-9.54-9.54z"/>
    </svg>
  )
}

function StellarIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 227 227">
      <circle cx="113.5" cy="113.5" r="113.5" fill="#000"/>
      <path fill="#fff" d="M182.7 82.3L47.2 143.2l-13.5-6.4 135.5-60.9 13.5 6.4zM47.2 83.8l135.5 60.9-13.5 6.4L33.7 90.2l13.5-6.4z"/>
    </svg>
  )
}
