# 🌟 Open Stellar - Claw2Claw on Stellar Blockchain

> Decentralized trading platform built on Stellar blockchain with Soroban smart contracts and Freighter wallet integration

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/leocagli/Open-Stellar)

### **Project Description**
Open-Stellar is a complete migration of the Claw2Claw project to the Stellar blockchain, replacing Ethereum infrastructure with Stellar's native features, DEX functionality, and Soroban smart contracts for programmable logic.

## ✨ Features

### Blockchain Infrastructure
- 🌐 **Stellar Blockchain** - Native integration with Stellar network (testnet/mainnet)
- 💎 **Soroban Smart Contracts** - Rust-based contracts for escrow and time-locked orders
- 👛 **Freighter Wallet** - Seamless wallet connection for bot registration and transactions
- 🔄 **Stellar DEX** - Decentralized asset swaps using path payments
- 🔒 **Claimable Balances** - Time-locked orders with Stellar's native feature
- 🌉 **Cross-Chain Ready** - Prepared for LI.FI integration for cross-chain swaps

### Platform Features
- 🤖 **Bot Registration** - Register trading bots with Stellar addresses
- 💱 **Asset Swaps** - Trade assets using Stellar's decentralized exchange
- 🛡️ **Escrow System** - Secure fund holding with arbiter support
- ⏰ **Time-Locked Orders** - Create and manage delayed transactions
- 🎯 **React Frontend** - Modern UI for all trading operations
- 📡 **REST API** - Comprehensive backend for all blockchain operations

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Rust (for smart contracts)
- Stellar CLI: `cargo install --locked stellar-cli`
- Freighter Wallet browser extension

### 1. Clone and Install

```bash
git clone https://github.com/leocagli/Open-Stellar.git
cd Open-Stellar
npm install
```

### 2. Configure Environment

Create `.dev.vars` file:

```bash
# Stellar Network
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# API Configuration (for AI features)
OPENAI_API_KEY=your_groq_api_key_here
OPENAI_BASE_URL=https://api.groq.com/openai/v1
MOLTBOT_GATEWAY_TOKEN=your_groq_api_key_here

# Development Settings
DEV_MODE=true
DEBUG_ROUTES=true
```

### 3. Build Smart Contracts

```bash
# Build Soroban contracts
npm run build:contracts

# Deploy to Stellar testnet
cd contracts/escrow
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/escrow.wasm --network testnet

cd ../timelock
stellar contract deploy --wasm target/wasm32-unknown-unknown/release/timelock.wasm --network testnet
```

### 4. Build and Run

```bash
npm run build
npm run start
```

Visit `http://localhost:8789` and connect your Freighter wallet.

## 🏗️ Architecture

```
Frontend (React)
    ↓
Freighter Wallet ←→ User Authentication
    ↓
Backend API (Hono)
    ↓
Stellar SDK
    ↓
├─→ Stellar Horizon (DEX, Transactions)
├─→ Soroban Contracts (Escrow, Time-Lock)
└─→ Claimable Balances (Native Stellar)
```

### Technology Stack

- **Frontend**: React 19 + TypeScript
- **Backend**: Hono (Cloudflare Workers)
- **Blockchain**: Stellar SDK
- **Smart Contracts**: Soroban (Rust)
- **Wallet**: Freighter API
- **Deployment**: Cloudflare Workers

## 📖 Documentation

- [`STELLAR_MIGRATION.md`](STELLAR_MIGRATION.md) - Complete migration guide and API documentation
- [`AGENTS.md`](AGENTS.md) - Development guide for AI agents
- [`CREATE_OPEN_STELLAR.md`](CREATE_OPEN_STELLAR.md) - Repository setup guide
- [Stellar Developer Docs](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/)

## 🔧 Development

```bash
npm run dev              # Start Vite dev server for UI development
npm run start            # Start wrangler dev (local worker)
npm run build            # Build worker + client
npm run build:contracts  # Build Soroban contracts
npm run test             # Run tests with Vitest
npm run test:contracts   # Run contract tests
npm run typecheck        # TypeScript type checking
npm run deploy           # Deploy to Cloudflare Workers
```

## 🌐 Deployment

### Prerequisites

- Cloudflare account

## 📁 Project Structure

```
Open-Stellar/
├── contracts/          # Soroban smart contracts (Rust)
│   ├── escrow/        # Escrow contract for secure transactions
│   └── timelock/      # Time-locked orders contract
├── stellar-sdk/       # Stellar SDK integration layer
│   ├── network.ts     # Network configuration
│   ├── wallet.ts      # Freighter wallet integration
│   ├── dex.ts         # DEX functionality
│   └── claimable-balance.ts  # Claimable balance management
├── backend/api/       # Backend API endpoints
│   ├── bots.ts        # Bot registration endpoints
│   ├── swap.ts        # Asset swap endpoints
│   ├── escrow.ts      # Escrow management
│   └── orders.ts      # Time-locked orders
└── frontend/src/      # React frontend application
    ├── components/    # UI components
    │   ├── WalletConnect.tsx
    │   ├── BotRegistration.tsx
    │   ├── SwapInterface.tsx
    │   └── EscrowManager.tsx
    └── App.tsx        # Main application
```

## 🎯 Use Cases

1. **Bot Registration**: Register automated trading bots with Stellar wallet addresses
2. **Asset Swapping**: Trade assets using Stellar's decentralized exchange
3. **Escrow Transactions**: Secure payments with arbiter support
4. **Time-Locked Orders**: Schedule transactions for future execution
5. **Cross-Chain Swaps**: Bridge assets between blockchains (via LI.FI)

## 🤝 Contributing

We welcome contributions! Please:
- Create issues for bugs or feature requests
- Use feature branches for new functionality
- Include tests for all new code
- Follow existing code style and conventions

## 📄 License

MIT License - See [LICENSE](LICENSE) for details