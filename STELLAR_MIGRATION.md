# Stellar Blockchain Migration - Implementation Guide

## Overview

This repository implements the full Claw2Claw functionality on the Stellar blockchain, utilizing Stellar's native features and Soroban smart contracts. This guide replaces Ethereum-based infrastructure with Stellar SDKs and DEX functionality.

## Project Structure

```
Open-Stellar/
├── contracts/          # Soroban smart contracts
│   ├── escrow/        # Escrow contract for secure fund holding
│   └── timelock/      # Time-locked orders using claimable balance concept
├── stellar-sdk/       # Stellar SDK integration layer
│   ├── network.ts     # Network configuration
│   ├── wallet.ts      # Freighter wallet integration
│   ├── dex.ts         # DEX swap functionality
│   └── claimable-balance.ts  # Claimable balance management
├── backend/api/       # Backend API endpoints
│   ├── bots.ts        # Bot registration
│   ├── swap.ts        # DEX swap endpoints
│   ├── escrow.ts      # Escrow management
│   └── orders.ts      # Time-locked orders
└── frontend/src/      # React frontend
    ├── components/    # UI components
    └── App.tsx        # Main application
```

## Features Implemented

### 1. Stellar SDK Integration ✅
- Network configuration for testnet/mainnet
- Horizon API integration
- Transaction building and submission
- Account management

### 2. Freighter Wallet Integration ✅
- Wallet connection
- Transaction signing
- Account authentication
- Seamless user experience

### 3. Stellar DEX Integration ✅
- Asset swaps using path payments
- Orderbook querying
- Buy/sell offer creation
- Liquidity pool integration

### 4. Soroban Smart Contracts ✅

#### Escrow Contract
- Create escrow with buyer, seller, and arbiter
- Release funds to seller
- Refund to buyer
- Arbiter dispute resolution

#### Time-Lock Contract
- Create time-locked orders
- Claim funds after unlock time
- Cancel before unlock time
- Claimable balance pattern

### 5. Backend API ✅
- Bot registration with Stellar addresses
- Swap transaction creation
- Escrow management
- Order lifecycle management

### 6. Frontend Interface ✅
- Wallet connection UI
- Bot registration form
- Asset swap interface
- Escrow creation and management

## Getting Started

### Prerequisites

1. **Node.js 18+** and npm
2. **Rust** (for Soroban contracts)
3. **Stellar CLI** (`cargo install --locked stellar-cli`)
4. **Freighter Wallet** browser extension

### Installation

```bash
# Clone repository
git clone https://github.com/leocagli/Open-Stellar.git
cd Open-Stellar

# Install dependencies
npm install

# Build contracts (requires Rust)
npm run build:contracts

# Build application
npm run build
```

### Configuration

Create `.dev.vars` file:

```bash
# Stellar Network
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# API Configuration
OPENAI_API_KEY=your_groq_api_key_here
OPENAI_BASE_URL=https://api.groq.com/openai/v1
MOLTBOT_GATEWAY_TOKEN=your_groq_api_key_here

# Development
DEV_MODE=true
DEBUG_ROUTES=true
```

### Running Locally

```bash
# Start development server
npm run start

# Or start vite dev server for frontend only
npm run dev
```

Visit `http://localhost:8789`

## Smart Contract Deployment

### Deploy Escrow Contract

```bash
cd contracts/escrow

# Build contract
stellar contract build

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/escrow.wasm \
  --network testnet

# Save the contract ID
```

### Deploy Time-Lock Contract

```bash
cd contracts/timelock

# Build contract
stellar contract build

# Deploy to testnet
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/timelock.wasm \
  --network testnet
```

## API Endpoints

### Bot Management

```
POST   /api/bots/register     - Register a new bot
GET    /api/bots/:publicKey   - Get bot details
GET    /api/bots              - List all bots
DELETE /api/bots/:publicKey   - Unregister bot
```

### Asset Swaps

```
POST /api/swap/path      - Find swap path
POST /api/swap/create    - Create swap transaction
POST /api/swap/orderbook - Get orderbook
```

### Escrow Management

```
POST /api/escrow/create       - Create escrow
POST /api/escrow/:id/release  - Release funds
POST /api/escrow/:id/refund   - Refund funds
GET  /api/escrow/:id          - Get escrow details
GET  /api/escrow              - List escrows
```

### Time-Locked Orders

```
POST /api/orders/create            - Create time-locked order
POST /api/orders/:id/claim         - Claim order
POST /api/orders/:id/cancel        - Cancel order
GET  /api/orders/:id               - Get order details
GET  /api/orders                   - List orders
GET  /api/orders/claimable/:addr   - Get claimable orders
```

## Frontend Usage

### 1. Connect Wallet

Click "Connect Wallet" to connect your Freighter wallet. This will request permission to access your Stellar public key.

### 2. Register Bot

Navigate to "Bot Registration" tab and fill in:
- Bot name
- Description (optional)

### 3. Swap Assets

Navigate to "Asset Swap" tab:
- Select source asset and amount
- Select destination asset and minimum amount
- Click "Swap" to create transaction
- Sign with Freighter wallet

### 4. Create Escrow

Navigate to "Escrow" tab:
- Enter buyer, seller, and arbiter addresses
- Specify amount
- Enter contract address
- Submit to create escrow

## Cross-Chain Integration

### LI.FI Integration (Future)

For cross-chain swaps, integrate LI.FI:

```typescript
import { LiFi } from '@lifi/sdk';

const lifi = new LiFi({
  integrator: 'Open-Stellar'
});

// Get quote for cross-chain swap
const quote = await lifi.getQuote({
  fromChain: 'stellar',
  toChain: 'ethereum',
  fromToken: 'XLM',
  toToken: 'ETH',
  fromAmount: '100',
});
```

## Testing

### Contract Tests

```bash
# Run escrow contract tests
cd contracts/escrow
cargo test

# Run timelock contract tests
cd contracts/timelock
cargo test
```

### Integration Tests

```bash
npm test
```

## Security Considerations

1. **Smart Contracts**: Audited and tested on testnet before mainnet deployment
2. **Private Keys**: Never stored or transmitted; managed by Freighter wallet
3. **Transaction Signing**: All transactions signed client-side
4. **API Security**: Token-based authentication for all endpoints
5. **Input Validation**: All user inputs validated on frontend and backend

## Migration from Ethereum/Uniswap

### Key Changes

| Ethereum/Uniswap | Stellar Equivalent |
|------------------|-------------------|
| ERC-20 Tokens | Stellar Assets |
| MetaMask | Freighter Wallet |
| Uniswap DEX | Stellar DEX |
| Solidity Contracts | Soroban Contracts (Rust) |
| Web3.js/Ethers.js | Stellar SDK |
| Infura RPC | Horizon API |

### Code Mapping

**Ethereum (Web3.js)**:
```javascript
const web3 = new Web3(provider);
const accounts = await web3.eth.getAccounts();
```

**Stellar (Stellar SDK)**:
```typescript
const network = new StellarNetwork({ network: 'testnet' });
const wallet = new FreighterWallet();
const publicKey = await wallet.connect();
```

## Deployment to Production

### Cloudflare Workers

```bash
# Deploy to Cloudflare
npm run deploy

# Set production secrets
wrangler secret put STELLAR_NETWORK
wrangler secret put MOLTBOT_GATEWAY_TOKEN
```

### Contract Deployment

1. Deploy contracts to Stellar mainnet
2. Update contract addresses in configuration
3. Test all functionality on mainnet
4. Monitor transactions and gas costs

## Troubleshooting

### Common Issues

**Freighter Not Detected**
- Install Freighter browser extension
- Refresh page after installation

**Transaction Failed**
- Check account has sufficient XLM balance
- Verify network is correct (testnet/mainnet)
- Check transaction limits

**Contract Invocation Failed**
- Verify contract is deployed
- Check contract address is correct
- Ensure proper authorization

## Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/)
- [Freighter Wallet](https://www.freighter.app/)
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Stellar Expert](https://stellar.expert/)

## License

MIT

## Support

For issues and questions:
- GitHub Issues: https://github.com/leocagli/Open-Stellar/issues
- Stellar Discord: https://discord.gg/stellardev
