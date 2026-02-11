# Open Stellar - Complete Integration Guide

## Project Overview

Open Stellar is a complete migration of the Claw2Claw project from Ethereum to the Stellar blockchain. This guide covers the full implementation and integration.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                        │
│  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Wallet   │  │    Bot     │  │   Swap   │  │  Escrow  │  │
│  │ Connect  │  │  Registry  │  │Interface │  │ Manager  │  │
│  └────┬─────┘  └─────┬──────┘  └────┬─────┘  └────┬─────┘  │
└───────┼──────────────┼──────────────┼─────────────┼────────┘
        │              │              │             │
        └──────────────┴──────────────┴─────────────┘
                       │
        ┌──────────────▼──────────────────────┐
        │      Freighter Wallet API           │
        └──────────────┬──────────────────────┘
                       │
        ┌──────────────▼──────────────────────┐
        │       Backend API (Hono)            │
        │  ┌────────┐  ┌────────┐  ┌──────┐  │
        │  │  Bots  │  │  Swap  │  │Escrow│  │
        │  └────────┘  └────────┘  └──────┘  │
        └──────────────┬──────────────────────┘
                       │
        ┌──────────────▼──────────────────────┐
        │      Stellar SDK Integration        │
        │  ┌────────┐  ┌─────┐  ┌──────────┐  │
        │  │Network │  │ DEX │  │Claimable │  │
        │  └────────┘  └─────┘  └──────────┘  │
        └──────────────┬──────────────────────┘
                       │
        ┌──────────────▼──────────────────────┐
        │         Stellar Network             │
        │  ┌──────────┐  ┌──────────────────┐ │
        │  │  Horizon │  │     Soroban      │ │
        │  │   API    │  │   Contracts      │ │
        │  │          │  │ ┌────┐  ┌─────┐ │ │
        │  │  - DEX   │  │ │Escr│  │Time │ │ │
        │  │  - Txns  │  │ │ow │  │Lock │ │ │
        │  │  - Accts │  │ └────┘  └─────┘ │ │
        │  └──────────┘  └──────────────────┘ │
        └─────────────────────────────────────┘
```

## Component Details

### 1. Smart Contracts (Soroban)

**Location**: `contracts/`

**Escrow Contract** (`escrow/`)
- Purpose: Secure transactions with arbiter
- Language: Rust (Soroban SDK)
- Functions: create_escrow, release, refund, get_escrow
- Storage: Persistent ledger storage

**Time-Lock Contract** (`timelock/`)
- Purpose: Time-based delayed payments
- Language: Rust (Soroban SDK)
- Functions: create_order, claim, cancel, is_claimable
- Storage: Persistent ledger storage with timestamps

### 2. Stellar SDK Integration

**Location**: `stellar-sdk/`

Provides TypeScript wrapper around Stellar operations:

- **network.ts**: Horizon server connection and network configuration
- **wallet.ts**: Freighter wallet integration
- **dex.ts**: DEX swap functionality
- **claimable-balance.ts**: Time-locked payment management
- **index.ts**: Main exports

### 3. Backend API

**Location**: `backend/api/`

RESTful API built with Hono:

- **bots.ts**: Bot registration and management
- **swap.ts**: DEX swap operations
- **escrow.ts**: Escrow lifecycle management
- **orders.ts**: Time-locked order operations
- **index.ts**: API router

### 4. Frontend Application

**Location**: `frontend/src/`

React-based UI with TypeScript:

**Components**:
- **WalletConnect.tsx**: Freighter wallet connection
- **BotRegistration.tsx**: Bot registration form
- **SwapInterface.tsx**: Asset swap UI
- **EscrowManager.tsx**: Escrow creation/management
- **App.tsx**: Main application with routing

**Styling**: Modern gradient design in `styles.css`

## Data Flow Examples

### Example 1: Create Escrow

```
User Action (Frontend)
    ↓
1. User fills escrow form (buyer, seller, arbiter, amount)
    ↓
2. Click "Create Escrow"
    ↓
3. Frontend → POST /api/escrow/create
    ↓
4. Backend validates input
    ↓
5. Backend → Stellar SDK → Create transaction
    ↓
6. Transaction → Freighter for signing
    ↓
7. User signs in Freighter
    ↓
8. Signed transaction → Horizon API
    ↓
9. Soroban Escrow Contract executed
    ↓
10. Funds transferred to contract
    ↓
11. Escrow ID returned to user
```

### Example 2: Asset Swap

```
User Action (Frontend)
    ↓
1. Select source asset (XLM) and dest asset (USDC)
    ↓
2. Enter amounts
    ↓
3. Frontend → POST /api/swap/create
    ↓
4. Backend → Stellar SDK → Find path
    ↓
5. Path payment transaction created
    ↓
6. Transaction → Freighter for signing
    ↓
7. User signs transaction
    ↓
8. Stellar DEX executes swap
    ↓
9. Assets exchanged atomically
    ↓
10. Transaction hash returned
```

## Key Integration Points

### Freighter Wallet Integration

```typescript
import { FreighterWallet } from './stellar-sdk';

const wallet = new FreighterWallet();
const publicKey = await wallet.connect();
```

### Stellar Network Connection

```typescript
import { StellarNetwork } from './stellar-sdk';

const network = new StellarNetwork({
  network: 'testnet',
  horizonUrl: 'https://horizon-testnet.stellar.org'
});
```

### DEX Swap

```typescript
import { StellarDEX, StellarSdk } from './stellar-sdk';

const dex = new StellarDEX(network);
const tx = await dex.createSwapTransaction({
  sourceAsset: StellarSdk.Asset.native(),
  destAsset: new StellarSdk.Asset('USDC', issuer),
  sourceAmount: '100',
  minDestAmount: '95',
  sourceAccount: publicKey
});
```

### Contract Invocation

```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source-account ACCOUNT \
  --network testnet \
  -- \
  create_escrow \
  --buyer BUYER_KEY \
  --seller SELLER_KEY \
  --arbiter ARBITER_KEY \
  --amount 1000000000 \
  --token TOKEN_ID
```

## Environment Configuration

### Required Variables

```bash
# Network
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Contracts (after deployment)
ESCROW_CONTRACT_ID=CXXXXXXXXXX...
TIMELOCK_CONTRACT_ID=CXXXXXXXXXX...

# Development
DEV_MODE=true
DEBUG_ROUTES=true
```

## Deployment Workflow

### 1. Deploy Smart Contracts

```bash
# Build contracts
npm run build:contracts

# Deploy using script
./scripts/deploy-contracts.sh

# Or manually
stellar contract deploy \
  --wasm contracts/escrow/target/wasm32-unknown-unknown/release/escrow.wasm \
  --network testnet
```

### 2. Configure Environment

Update `.dev.vars` with contract IDs from deployment.

### 3. Build Application

```bash
npm run build
```

### 4. Deploy to Cloudflare

```bash
npm run deploy
```

### 5. Test Integration

```bash
# Run tests
npm test
npm run test:contracts

# Test API
curl http://localhost:8789/api/health

# Test frontend
open http://localhost:8789/app
```

## API Integration Examples

### Register Bot

```javascript
const response = await fetch('/api/bots/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    publicKey: 'GXXXXX...',
    name: 'My Bot',
    description: 'Trading bot'
  })
});
```

### Create Swap

```javascript
const response = await fetch('/api/swap/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    sourceAsset: { code: 'XLM', type: 'native' },
    destAsset: { code: 'USDC', issuer: 'GA...' },
    sourceAmount: '100',
    minDestAmount: '95',
    sourceAccount: publicKey,
    network: 'testnet'
  })
});
```

## Troubleshooting

### Contract Deployment Issues

**Problem**: Contract deployment fails
**Solution**: 
- Ensure Rust and stellar-cli are installed
- Check network connectivity
- Verify account has sufficient XLM

### Wallet Connection Issues

**Problem**: Freighter not detected
**Solution**:
- Install Freighter extension
- Unlock wallet
- Refresh page

### Transaction Failures

**Problem**: Transaction rejected
**Solution**:
- Check account balance (min 1 XLM)
- Verify trustlines are established
- Check network (testnet vs mainnet)

## Testing Strategy

### Unit Tests

```bash
npm test
```

Tests individual components and functions.

### Contract Tests

```bash
npm run test:contracts
```

Tests smart contract logic.

### Integration Tests

Manual testing workflow:
1. Deploy contracts
2. Test wallet connection
3. Create escrow
4. Test swap
5. Create time-locked order
6. Verify all operations

## Performance Considerations

- **Contract Optimization**: Contracts built with size optimization
- **Caching**: Network configuration cached
- **Connection Pooling**: Reuse Horizon connections
- **Lazy Loading**: Frontend components lazy-loaded

## Security Best Practices

1. **Never expose private keys**
2. **Always validate input**
3. **Use testnet for development**
4. **Audit contracts before mainnet**
5. **Implement rate limiting on API**
6. **Use HTTPS in production**
7. **Validate all user signatures**

## Migration Checklist

- [x] Replace Web3.js with Stellar SDK
- [x] Replace MetaMask with Freighter
- [x] Replace Uniswap with Stellar DEX
- [x] Replace Solidity with Soroban/Rust
- [x] Implement escrow in Soroban
- [x] Implement time-locks with claimable balances
- [x] Create frontend components
- [x] Build backend API
- [x] Add comprehensive testing
- [x] Create documentation
- [ ] Deploy to testnet
- [ ] Integration testing
- [ ] Security audit
- [ ] Mainnet deployment

## Next Steps

1. **Deploy contracts to testnet**
2. **Test with real transactions**
3. **Gather user feedback**
4. **Optimize performance**
5. **Add advanced features**
6. **Prepare for mainnet**

## Support Resources

- [Stellar Developers Discord](https://discord.gg/stellardev)
- [Soroban Documentation](https://soroban.stellar.org)
- [Stellar Stack Exchange](https://stellar.stackexchange.com)
- Project Issues: GitHub Issues tab

---

**Version**: 1.0.0
**Last Updated**: 2026-02-11
**Status**: Complete Implementation
