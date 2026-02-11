# Stellar Integration for Open-Stellar

This document describes the Stellar blockchain integration adapted from the ERC-8004 standard (Sign-In With Agent).

## Overview

Open-Stellar adapts the ERC-8004 SIWA (Sign-In With Agent) standard from Ethereum to work with the Stellar blockchain. This implementation allows AI agents to:

1. **Prove ownership of identity** using Stellar Ed25519 signatures
2. **Authenticate securely** using a SIWA-style message signing flow
3. **Manage trustless escrow** using Stellar's native multi-signature and time-bound features

## Key Differences from ERC-8004

| Feature | ERC-8004 (Ethereum) | Open-Stellar (Stellar) |
|---------|---------------------|------------------------|
| Identity Storage | ERC-721 NFT | Stellar Account-based |
| Signature Algorithm | ECDSA (secp256k1) | Ed25519 |
| Escrow Mechanism | Smart Contract | Multi-signature Accounts |
| Verification | On-chain contract call | Signature verification + account checks |
| Time Locks | Smart contract logic | Native transaction time bounds |

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Open-Stellar System                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐      ┌──────────────┐                    │
│  │ AI Agent     │      │ Server/API   │                    │
│  └──────┬───────┘      └──────┬───────┘                    │
│         │                     │                            │
│         │  1. Request Nonce   │                            │
│         │────────────────────>│                            │
│         │                     │                            │
│         │  2. Return Nonce    │                            │
│         │<────────────────────│                            │
│         │                     │                            │
│         │  3. Sign Message    │                            │
│         │  (with secret key)  │                            │
│         │                     │                            │
│         │  4. Send Signature  │                            │
│         │────────────────────>│                            │
│         │                     │                            │
│         │                     │  5. Verify Signature       │
│         │                     │  6. Check Stellar Account  │
│         │                     │                            │
│         │  7. Return Receipt  │                            │
│         │<────────────────────│                            │
│         │                     │                            │
└─────────┴─────────────────────┴────────────────────────────┘
                                │
                                ▼
                    ┌───────────────────────┐
                    │  Stellar Network      │
                    │  - Account Validation │
                    │  - Escrow Management  │
                    └───────────────────────┘
```

## Core Components

### 1. Identity Management (`src/stellar/identity/`)

#### Wallet Management (`wallet.ts`)
- Generate new Stellar keypairs
- Validate public/secret keys
- Create agent identities
- Fund testnet accounts

```typescript
import { generateKeypair, createAgentIdentity } from './stellar/identity/wallet';

// Generate a new keypair
const keypair = generateKeypair();
console.log('Public Key:', keypair.publicKey());
console.log('Secret Key:', keypair.secret());

// Create agent identity
const identity = createAgentIdentity(keypair, 'my-agent-001', {
  name: 'My AI Agent',
  description: 'An autonomous AI agent',
});
```

#### Message Signing (`signing.ts`)
- Create SIWA messages
- Sign messages with Ed25519
- Verify signatures
- Format messages in SIWA standard format

```typescript
import { createSIWAMessage, signSIWAMessage } from './stellar/identity/signing';

// Create a SIWA message
const message = createSIWAMessage({
  domain: 'example.com',
  address: keypair.publicKey(),
  agentId: 'my-agent-001',
  uri: 'https://example.com/api',
  chainId: 'testnet',
  nonce: 'abc123...',
  statement: 'Sign in to access AI services',
});

// Sign the message
const { signature, message: formattedMessage } = signSIWAMessage(message, keypair);
```

### 2. Authentication (`src/stellar/auth/`)

#### SIWA Authentication (`siwa.ts`)
- Nonce generation and validation
- Identity registration
- Message verification
- Receipt generation

```typescript
import { createNonce, verifySIWA } from './stellar/auth/siwa';

// Server: Generate nonce
const nonce = await createNonce(publicKey, agentId);

// Agent: Sign message with nonce
// (see signing example above)

// Server: Verify the signed message
const result = await verifySIWA(formattedMessage, signature, 'example.com');
if (result.success) {
  console.log('Authentication successful!');
  console.log('Receipt:', result.receipt);
}
```

### 3. Trustless Escrow (`src/stellar/escrow/`)

#### Multi-Signature Escrow (`trustless.ts`)

Stellar's native multi-signature accounts replace Ethereum smart contracts for trustless escrow.

**Key Features:**
- Multi-signature requirements (e.g., 2-of-3)
- Time-locked payments
- Native asset support
- No smart contract required

```typescript
import { 
  createEscrowAccount, 
  setupEscrowOnChain,
  createEscrowPayment,
} from './stellar/escrow/trustless';

// Create escrow configuration
const escrow = await createEscrowAccount(
  config,
  [
    { publicKey: 'AGENT_A_PUBLIC_KEY', weight: 1 },
    { publicKey: 'AGENT_B_PUBLIC_KEY', weight: 1 },
    { publicKey: 'ARBITER_PUBLIC_KEY', weight: 1 },
  ],
  2 // Requires 2 signatures
);

// Setup on Stellar network
const result = await setupEscrowOnChain(
  sourceKeypair,
  escrow,
  '100', // 100 XLM initial balance
  config
);

// Create payment from escrow
const payment = await createEscrowPayment(
  escrow.publicKey,
  'DESTINATION_PUBLIC_KEY',
  '50', // 50 XLM
  config
);

// Signers sign the transaction
payment.sign(signerKeypair1);
payment.sign(signerKeypair2);

// Submit the signed transaction
await submitEscrowTransaction(payment, config);
```

## API Endpoints

### Agent Registration

```bash
# Generate a new keypair
POST /api/stellar/keypair
Response: {
  "success": true,
  "publicKey": "GXXXXXXXX...",
  "secretKey": "SXXXXXXXX...",
  "warning": "Store the secret key securely..."
}

# Register agent identity
POST /api/stellar/register
Body: {
  "publicKey": "GXXXXXXXX...",
  "agentId": "my-agent-001",
  "metadata": {
    "name": "My AI Agent"
  }
}
Response: {
  "success": true,
  "identity": { ... }
}
```

### SIWA Authentication Flow

```bash
# Step 1: Request nonce
POST /api/stellar/nonce
Body: {
  "publicKey": "GXXXXXXXX...",
  "agentId": "my-agent-001"
}
Response: {
  "success": true,
  "nonce": "abc123...",
  "expiresAt": 1708534567890
}

# Step 2: Agent signs message locally (not via API)
# Step 3: Verify signature
POST /api/stellar/verify
Body: {
  "message": "example.com wants you to sign in...",
  "signature": "base64signature...",
  "network": "testnet"
}
Response: {
  "success": true,
  "identity": { ... },
  "receipt": "base64receipt..."
}
```

### Identity Lookup

```bash
# Get agent identity
GET /api/stellar/identity/:publicKey
Response: {
  "success": true,
  "identity": {
    "publicKey": "GXXXXXXXX...",
    "agentId": "my-agent-001",
    "metadata": { ... }
  }
}
```

### Testnet Funding

```bash
# Fund a testnet account
POST /api/stellar/fund-testnet
Body: {
  "publicKey": "GXXXXXXXX..."
}
Response: {
  "success": true,
  "message": "Testnet account funded successfully"
}
```

### Escrow Management

```bash
# Create escrow account
POST /api/stellar/escrow/create
Body: {
  "signers": [
    { "publicKey": "GXXXXXXXX...", "weight": 1 },
    { "publicKey": "GYYYYYYYY...", "weight": 1 }
  ],
  "threshold": 2,
  "network": "testnet"
}
Response: {
  "success": true,
  "escrow": {
    "publicKey": "GZZZZZZZZ...",
    "signers": [...],
    "threshold": 2
  }
}

# Get escrow details
GET /api/stellar/escrow/:publicKey?network=testnet
Response: {
  "success": true,
  "account": { ... },
  "signers": [...],
  "thresholds": { ... }
}

# Create payment transaction
POST /api/stellar/escrow/payment
Body: {
  "escrowPublicKey": "GXXXXXXXX...",
  "destination": "GYYYYYYYY...",
  "amount": "100",
  "network": "testnet"
}
Response: {
  "success": true,
  "transactionXDR": "AAAAAA...",
  "message": "Transaction created. Sign with required signers..."
}

# Submit signed transaction
POST /api/stellar/escrow/submit
Body: {
  "transactionXDR": "AAAAAA...",
  "network": "testnet"
}
Response: {
  "success": true,
  "transactionHash": "abc123..."
}
```

## Security Considerations

### 1. Key Management
- **Never expose secret keys** in API responses or logs
- Store secret keys encrypted at rest
- Use secure key generation (provided by Stellar SDK)
- Consider using hardware security modules (HSM) for production

### 2. Nonce Management
- Nonces expire after 5 minutes by default
- Each nonce can only be used once
- Nonces are tied to specific public key + agent ID pairs
- Implement rate limiting on nonce generation

### 3. Signature Verification
- Always verify signatures server-side
- Check message timestamps and expiration
- Validate domain matches expected value
- Verify Stellar account exists on-chain (optional but recommended)

### 4. Escrow Safety
- Test escrow configurations on testnet first
- Verify signer weights and thresholds carefully
- Use time bounds for additional security
- Monitor escrow accounts for unauthorized changes

## Stellar Network Configuration

### Testnet (Development)
```typescript
{
  network: 'testnet',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015'
}
```

### Public Network (Production)
```typescript
{
  network: 'public',
  horizonUrl: 'https://horizon.stellar.org',
  networkPassphrase: 'Public Global Stellar Network ; September 2015'
}
```

## Testing

All modules include TypeScript types and can be tested using Vitest:

```bash
npm test
```

Test files are colocated with source files (`*.test.ts`).

## Migration from ERC-8004

If migrating from an ERC-8004 implementation:

1. **Identity Mapping**: Map ERC-721 NFT token IDs to Stellar public keys
2. **Signature Format**: Convert ECDSA signatures to Ed25519
3. **Message Format**: SIWA message format is preserved for compatibility
4. **Smart Contracts**: Replace with Stellar multi-sig accounts
5. **Events**: Use Stellar transaction history instead of contract events

## Best Practices

1. **Always use testnet** for development and testing
2. **Validate inputs** on both client and server
3. **Implement rate limiting** on all endpoints
4. **Monitor escrow accounts** for suspicious activity
5. **Keep dependencies updated** (especially `@stellar/stellar-sdk`)
6. **Use environment variables** for network configuration
7. **Implement proper error handling** for network failures
8. **Add logging** for security-relevant events

## Resources

- [Stellar Documentation](https://developers.stellar.org/)
- [Stellar SDK](https://github.com/stellar/js-stellar-sdk)
- [ERC-8004 Standard](https://github.com/builders-garden/siwa)
- [Sign-In With Ethereum (EIP-4361)](https://eips.ethereum.org/EIPS/eip-4361)
- [Stellar Multi-Signature](https://developers.stellar.org/docs/encyclopedia/signatures-multisig)

## License

MIT License - Same as the parent Open-Stellar project
