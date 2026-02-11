# Stellar Claw2Claw Integration

This document describes the implementation of Claw2Claw functionality on the Stellar blockchain, integrated with the Open-Stellar repository.

## Overview

The Stellar Claw2Claw implementation provides a complete peer-to-peer bot trading platform on the Stellar blockchain, featuring:

- **Freighter Wallet Integration**: Secure wallet connection and transaction signing
- **Bot Registration**: On-chain bot registration with wallet-signed verification
- **Escrow System**: Time-locked escrow using Stellar's claimableBalances
- **DEX Integration**: P2P order matching using Stellar's native decentralized exchange
- **Trading Interface**: React-based UI for bot management and trading operations

## Architecture

### Backend Services

#### 1. Stellar Client (`src/stellar/client.ts`)
- Unified interface for Stellar SDK operations
- Account management and balance queries
- Transaction submission and monitoring
- Network configuration (testnet/mainnet)

#### 2. Freighter Wallet Service (`src/stellar/services/freighter.ts`)
- Wallet detection and connection
- Transaction signing via Freighter extension
- Message signing for authentication
- Signature verification

#### 3. Escrow Service (`src/stellar/services/escrow.ts`)
- Create time-locked escrows using claimableBalances
- Support for refund addresses
- Escrow claiming and monitoring
- List escrows for an account

#### 4. DEX Service (`src/stellar/services/dex.ts`)
- Create and cancel orders on Stellar DEX
- Query order books for trading pairs
- Execute path payments for complex swaps
- Find optimal payment paths between assets

#### 5. Bot Registration Service (`src/stellar/services/bot-registration.ts`)
- Register bots with wallet signatures
- Manage bot capabilities
- Search bots by capability
- Track bot statistics

### Frontend Components

#### 1. Wallet Connect (`frontend/src/components/WalletConnect.tsx`)
- Freighter wallet connection UI
- Connection status display
- Disconnect functionality

#### 2. Bot Registration Form (`frontend/src/components/BotRegistrationForm.tsx`)
- Bot registration interface
- Capability selection
- Form validation

#### 3. Stellar Page (`frontend/src/pages/StellarPage.tsx`)
- Main dashboard for Stellar operations
- Display active orders and escrows
- Integrated bot management

### API Endpoints

All Stellar endpoints are mounted at `/stellar/*`:

#### Bot Management
- `POST /stellar/bot/register` - Register a new bot
- `GET /stellar/bot/:publicKey` - Get bot details
- `GET /stellar/bots` - List all bots (optional: `?capability=trading`)
- `PUT /stellar/bot/:publicKey` - Update bot details
- `DELETE /stellar/bot/:publicKey` - Unregister bot

#### Escrow Management
- `GET /stellar/escrow/:balanceId` - Get escrow details
- `GET /stellar/escrows/:publicKey` - List escrows for account

#### DEX Operations
- `GET /stellar/orders/:publicKey` - Get active orders
- `GET /stellar/orderbook` - Get order book for trading pair
- `POST /stellar/paths` - Find payment paths

#### Account Operations
- `GET /stellar/account/:publicKey` - Get account details
- `GET /stellar/account/:publicKey/balance` - Get account balance

#### Health Check
- `GET /stellar/health` - Service health status

## Setup

### 1. Install Dependencies

```bash
npm install @stellar/stellar-sdk @stellar/freighter-api
```

### 2. Configure Environment

Add to `.dev.vars`:

```bash
# Stellar Network Configuration
STELLAR_NETWORK=testnet  # or 'mainnet'
STELLAR_ESCROW_CONTRACT_ID=  # Optional: Custom escrow contract
STELLAR_ORDER_MATCHING_CONTRACT_ID=  # Optional: Custom order matching contract
```

### 3. Build and Deploy

```bash
npm run build
npm run deploy
```

## Usage

### Connect Wallet

1. Install [Freighter Wallet](https://www.freighter.app/) browser extension
2. Create or import a Stellar account
3. Visit the Stellar page and click "Connect Freighter Wallet"
4. Approve the connection in Freighter

### Register a Bot

1. Connect your wallet
2. Fill in bot details:
   - Name (required)
   - Description (optional)
   - Capabilities (at least one required)
3. Click "Register Bot"
4. Sign the transaction in Freighter

### Create an Escrow

Using the escrow service in code:

```typescript
import { escrowService, StellarClient } from './stellar';

// Create keypair from secret
const sourceKeypair = StellarClient.createKeypair('S...');

// Create escrow
const { balanceId } = await escrowService.createEscrow(sourceKeypair, {
  amount: '10',
  claimant: 'G...',  // Recipient's public key
  timeLock: 3600,    // 1 hour in seconds
  refundTo: 'G...'   // Optional: Refund address
});
```

### Create a Trading Order

Using the DEX service in code:

```typescript
import { dexService, StellarClient } from './stellar';

// Create keypair from secret
const sourceKeypair = StellarClient.createKeypair('S...');

// Create sell order
const { offerId } = await dexService.createOrder(sourceKeypair, {
  selling: {
    code: 'XLM',
    amount: '100'
  },
  buying: {
    code: 'USDC',
    issuer: 'G...'
  },
  price: '0.1'  // Price of buying asset in terms of selling asset
});
```

### Claim an Escrow

```typescript
import { escrowService, StellarClient } from './stellar';

// Create keypair from secret
const claimantKeypair = StellarClient.createKeypair('S...');

// Claim escrow
await escrowService.claimEscrow(claimantKeypair, balanceId);
```

## Key Features

### 1. Escrow with Time Locks

The implementation uses Stellar's native claimableBalances to create escrows with time-based unlocking:

- **Time-Locked Release**: Funds are locked until a specific time
- **Refund Mechanism**: Optional refund to original sender after extended period
- **No Smart Contract Required**: Uses native Stellar operations

### 2. DEX Integration

Leverages Stellar's built-in decentralized exchange:

- **Order Book Matching**: Native order book for efficient price discovery
- **Path Payments**: Automatic routing through multiple assets
- **Low Fees**: Stellar's minimal transaction fees (0.00001 XLM base fee)

### 3. Wallet-Based Authentication

Uses Freighter wallet for secure authentication:

- **Transaction Signing**: All transactions signed by user's wallet
- **Message Signing**: Bot registration verified with wallet signature
- **Non-Custodial**: Users maintain full control of their keys

### 4. Bot Registry

In-memory bot registration system:

- **Capability-Based Discovery**: Search bots by capabilities
- **Verified Registration**: Wallet signature verification
- **Flexible Capabilities**: Support for multiple bot types

## Security Considerations

1. **Wallet Security**: Private keys never leave Freighter wallet
2. **Transaction Verification**: All transactions verified before submission
3. **Time Lock Validation**: Escrow times validated to prevent manipulation
4. **Signature Verification**: Bot registrations verified via wallet signatures
5. **Network Isolation**: Separate testnet and mainnet configurations

## Testing

### Run Tests

```bash
npm test
```

### Test Network

For development, use Stellar testnet:

1. Create testnet account at [Stellar Laboratory](https://laboratory.stellar.org/#account-creator)
2. Fund account with test XLM from [Friendbot](https://friendbot.stellar.org)
3. Set `STELLAR_NETWORK=testnet` in environment

## Comparison with Ethereum/Uniswap Implementation

| Feature | Ethereum/Uniswap v4 | Stellar/Soroban |
|---------|-------------------|-----------------|
| **DEX** | Uniswap v4 AMM | Native Stellar DEX (Order Book) |
| **Escrow** | Smart Contract | ClaimableBalances (Native) |
| **Wallet** | MetaMask | Freighter |
| **Smart Contracts** | Solidity | Rust (Soroban) |
| **Transaction Fees** | High (gas) | Very Low (0.00001 XLM) |
| **Finality** | ~12-15 seconds | 3-5 seconds |
| **Network** | Mainnet/Testnet | Public/Testnet |

## Future Enhancements

1. **Soroban Smart Contracts**: Deploy custom escrow and order matching contracts
2. **Multi-Sig Escrow**: Support for multi-signature escrow releases
3. **Advanced Trading**: Limit orders, stop-loss, automated strategies
4. **Analytics Dashboard**: Trading volume, bot performance metrics
5. **Event Notifications**: WebSocket notifications for order fills and escrow claims
6. **Cross-Asset Swaps**: Automated path finding for complex asset swaps

## Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Soroban Documentation](https://soroban.stellar.org/)
- [Freighter Wallet](https://www.freighter.app/)
- [Stellar Laboratory](https://laboratory.stellar.org/)
- [Stellar Expert](https://stellar.expert/) - Network explorer

## Support

For issues or questions:

1. Check the [Stellar Documentation](https://developers.stellar.org/)
2. Join the [Stellar Discord](https://discord.gg/stellardev)
3. Review the code in `src/stellar/` directory
4. Test on Stellar testnet before mainnet deployment

## License

MIT
