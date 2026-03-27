import { createConfig, http, injected } from 'wagmi'
import { bscTestnet, bsc } from 'wagmi/chains'

// Wagmi config con MetaMask (injected) para BNB Testnet y Mainnet
export const wagmiConfig = createConfig({
  chains: [bscTestnet, bsc],
  connectors: [injected()],
  transports: {
    [bscTestnet.id]: http('https://data-seed-prebsc-1-s1.binance.org:8545'),
    [bsc.id]: http('https://bsc-dataseed.binance.org'),
  },
  ssr: true,
})
