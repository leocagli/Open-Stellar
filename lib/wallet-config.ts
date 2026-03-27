import { cookieStorage, createStorage, http } from 'wagmi'
import { bscTestnet, bsc } from 'wagmi/chains'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'

// WalletConnect Project ID - obtenido de https://cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || ''

if (!projectId && typeof window !== 'undefined') {
  console.warn('[v0] Missing NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable')
}

// Metadata para la aplicación
export const metadata = {
  name: 'Vendimia World',
  description: 'Ciudad de Agentes IA con integración Web3',
  url: typeof window !== 'undefined' ? window.location.origin : 'https://localhost:3000',
  icons: ['/favicon.ico']
}

// Chains soportadas - BNB Testnet y Mainnet
export const chains = [bscTestnet, bsc] as const

// Configuración del adaptador Wagmi para Reown AppKit
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks: chains,
  transports: {
    [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
    [bsc.id]: http('https://bsc-dataseed.binance.org'),
  }
})

export const wagmiConfig = wagmiAdapter.wagmiConfig
