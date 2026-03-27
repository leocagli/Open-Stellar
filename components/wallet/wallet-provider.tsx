'use client'

import { type ReactNode, useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, type State } from 'wagmi'
import { wagmiAdapter, projectId, metadata, chains } from '@/lib/wallet-config'
import { bscTestnet } from 'wagmi/chains'

// Create query client
const queryClient = new QueryClient()

// Flag to track AppKit initialization
let appKitInitialized = false

interface WalletProviderProps {
  children: ReactNode
  initialState?: State
}

export function WalletProvider({ children, initialState }: WalletProviderProps) {
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    async function initAppKit() {
      if (typeof window === 'undefined' || appKitInitialized) {
        setIsReady(true)
        return
      }

      // Only initialize if we have a project ID
      if (projectId) {
        try {
          const { createAppKit } = await import('@reown/appkit/react')
          createAppKit({
            adapters: [wagmiAdapter],
            projectId,
            networks: chains,
            defaultNetwork: bscTestnet,
            metadata,
            features: {
              analytics: false,
              email: false,
              socials: false,
            }
          })
          appKitInitialized = true
        } catch (error) {
          console.error('[v0] Failed to initialize AppKit:', error)
        }
      }
      
      setIsReady(true)
    }

    initAppKit()
  }, [])

  // Always render children - wallet features will be disabled if not ready
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}

// Export hook to check if AppKit is ready
export function useAppKitReady() {
  const [ready, setReady] = useState(appKitInitialized)
  
  useEffect(() => {
    if (appKitInitialized) {
      setReady(true)
    }
  }, [])
  
  return ready && !!projectId
}
