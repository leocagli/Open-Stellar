import { createConfig, http, injected } from 'wagmi'
import { walletConnect } from '@wagmi/connectors'
import { bscTestnet, bsc } from 'wagmi/chains'

const walletConnectProjectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID

const connectors: any[] = [injected()]

if (walletConnectProjectId) {
  connectors.push(
    walletConnect({
      projectId: walletConnectProjectId,
      showQrModal: true,
      metadata: {
        name: 'Open Vinito',
        description: 'Open Vinito multi-chain dApp',
        url: 'http://localhost:3000',
        icons: ['https://avatars.githubusercontent.com/u/37784886'],
      },
    })
  )
}

// Wagmi config con MetaMask + WalletConnect para BNB Testnet y Mainnet
export const wagmiConfig = createConfig({
  chains: [bscTestnet, bsc],
  connectors,
  transports: {
    [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
    [bsc.id]: http('https://bsc-dataseed.binance.org'),
  },
  ssr: true,
})
