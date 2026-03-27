'use client'

import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, type State } from 'wagmi'
import { createAppKit } from '@reown/appkit/react'
import { wagmiAdapter, projectId, metadata, chains } from '@/lib/wallet-config'
import { bscTestnet } from 'wagmi/chains'

// Create query client
const queryClient = new QueryClient()

// Initialize AppKit (only on client)
if (typeof window !== 'undefined' && projectId) {
  createAppKit({
    adapters: [wagmiAdapter],
    projectId,
    networks: chains,
    defaultNetwork: bscTestnet,
    metadata,
    features: {
      analytics: true,
      email: false,
      socials: false,
    }
  })
}

interface WalletProviderProps {
  children: ReactNode
  initialState?: State
}

export function WalletProvider({ children, initialState }: WalletProviderProps) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
}
