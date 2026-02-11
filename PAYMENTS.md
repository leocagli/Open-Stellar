# Payment System Documentation

## Overview

Open-Stellar includes a comprehensive payment system with three main components:

1. **Stellar Integration** - Direct blockchain payments using Stellar network
2. **x402 Payment Required** - HTTP 402 status code implementation for paid resources
3. **8004 Custom Payment Processing** - Advanced payment workflows with error codes
4. **Trusstles Escrow** - Trustless escrow mechanism for secure payment handling

## Table of Contents

- [Quick Start](#quick-start)
- [Stellar Integration](#stellar-integration)
- [x402 Payment Required](#x402-payment-required)
- [8004 Payment Processing](#8004-payment-processing)
- [Trusstles Escrow System](#trusstles-escrow-system)
- [API Reference](#api-reference)
- [Testing](#testing)

---

## Quick Start

### Installation

The payment system is already integrated into Open-Stellar. The Stellar SDK is included as a dependency.

### Environment Variables

Add to your `.dev.vars` file:

```bash
# Stellar Network (testnet or mainnet)
STELLAR_NETWORK=testnet

# Optional: Your Stellar account for receiving payments
STELLAR_PAYEE_PUBLIC_KEY=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

### Basic Example: Process a Payment

```typescript
import { process8004Payment, loadAccount } from './payments';

// Load sender account
const sender = loadAccount('SECRET_KEY_HERE');

// Process payment
const result = await process8004Payment(
  sender,
  'RECIPIENT_PUBLIC_KEY',
  {
    amount: '100',
    asset: { code: 'XLM' }
  },
  'testnet'
);

if (result.code === 8004) {
  console.log('Payment successful:', result.transactionHash);
} else {
  console.error('Payment failed:', result.message);
}
```

---

## Stellar Integration

### Generate New Keypair

```typescript
import { generateKeypair, createTestnetAccount } from './payments';

// Generate new keypair
const keypair = generateKeypair();
console.log('Public Key:', keypair.publicKey);
console.log('Secret Key:', keypair.secretKey); // Keep this safe!

// Fund account on testnet (testnet only)
const result = await createTestnetAccount(keypair.publicKey);
if (result.success) {
  console.log('Account funded:', result.transactionHash);
}
```

### Check Account Balance

```typescript
import { getAccountBalance } from './payments';

const balance = await getAccountBalance(
  'PUBLIC_KEY_HERE',
  'native', // 'native' for XLM, or asset code like 'USDC'
  'testnet'
);

console.log('Balance:', balance, 'XLM');
```

### Send Direct Payment

```typescript
import { buildPaymentTransaction, submitTransaction } from './payments';

const sender = loadAccount('SENDER_SECRET_KEY');

// Build transaction
const transaction = await buildPaymentTransaction(
  sender,
  'RECIPIENT_PUBLIC_KEY',
  { amount: '50', asset: { code: 'XLM' } },
  'testnet',
  'Payment memo'
);

// Submit transaction
const result = await submitTransaction(transaction, [sender], 'testnet');

if (result.success) {
  console.log('Payment sent:', result.transactionHash);
}
```

### Verify Payment

```typescript
import { verifyPayment } from './payments';

const isValid = await verifyPayment(
  'TRANSACTION_HASH',
  'EXPECTED_FROM_ADDRESS',
  'EXPECTED_TO_ADDRESS',
  { amount: '100', asset: { code: 'XLM' } },
  'testnet'
);

console.log('Payment valid:', isValid);
```

---

## x402 Payment Required

### Protect a Route with Payment Requirement

```typescript
import { Hono } from 'hono';
import { requirePayment } from './payments';

const app = new Hono();

// Protect route - requires 10 XLM payment
app.get(
  '/premium-content',
  requirePayment(
    { amount: '10', asset: { code: 'XLM' } },
    'YOUR_PAYEE_PUBLIC_KEY',
    { description: 'Access to premium content' }
  ),
  (c) => c.json({ content: 'This is premium content!' })
);
```

### Payment Flow

1. **Request without payment** → Receives HTTP 402 with payment instructions
2. **User sends payment** on Stellar network
3. **Submit payment proof** to `/api/payments/verify`
4. **Request with payment token** → Access granted

### Example Client Flow

```typescript
// 1. Request protected resource
const response = await fetch('/premium-content');

if (response.status === 402) {
  const paymentInfo = await response.json();
  
  // 2. Show payment instructions to user
  console.log('Send', paymentInfo.payment.amount, 'to', paymentInfo.payment.payee);
  
  // 3. After user pays, verify payment
  const verifyResponse = await fetch('/api/payments/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      requestId: paymentInfo.payment.id,
      transactionHash: 'USER_TRANSACTION_HASH',
      fromAddress: 'USER_PUBLIC_KEY',
      network: 'testnet'
    })
  });
  
  const { paymentToken } = await verifyResponse.json();
  
  // 4. Access resource with payment token
  const contentResponse = await fetch(`/premium-content?paymentToken=${paymentToken}`);
  const content = await contentResponse.json();
}
```

---

## 8004 Payment Processing

### Success and Error Codes

- **8004** - Payment processed successfully
- **8001** - Invalid payment transaction
- **8002** - Insufficient funds
- **8003** - Payment expired
- **8005** - Escrow not found
- **8006** - Escrow invalid state
- **8007** - Unauthorized
- **8008** - Network error

### Direct Payment Processing

```typescript
import { process8004Payment, get8004ResultMessage } from './payments';

const result = await process8004Payment(
  senderAccount,
  'RECIPIENT_KEY',
  { amount: '100', asset: { code: 'XLM' } },
  'testnet',
  {
    memo: 'Invoice #12345',
    verifyBalance: true // Check balance before sending
  }
);

console.log(get8004ResultMessage(result.code));
if (result.code === 8004) {
  console.log('Transaction:', result.transactionHash);
}
```

### Batch Payments

```typescript
import { process8004BatchPayments } from './payments';

const payments = [
  {
    from: senderAccount,
    to: 'RECIPIENT_1',
    amount: { amount: '10', asset: { code: 'XLM' } },
    memo: 'Payment 1'
  },
  {
    from: senderAccount,
    to: 'RECIPIENT_2',
    amount: { amount: '20', asset: { code: 'XLM' } },
    memo: 'Payment 2'
  }
];

const results = await process8004BatchPayments(payments, 'testnet');

results.forEach((result, i) => {
  console.log(`Payment ${i + 1}:`, get8004ResultMessage(result.code));
});
```

---

## Trusstles Escrow System

The Trusstles escrow system provides trustless payment escrow with the following features:

- **Multi-party agreement** - Payer, payee, optional arbiter
- **Time-based expiration** - Automatic refund after timeout
- **Conditional release** - Requires appropriate signatures
- **Auto-release** - Optional automatic release after time period
- **Dispute resolution** - Optional arbiter for conflicts

### Create and Fund Escrow

```typescript
import { createEscrow, fundEscrow } from './payments';

// 1. Create escrow
const { escrow, account: escrowAccount } = await createEscrow(
  {
    payer: 'PAYER_PUBLIC_KEY',
    payee: 'PAYEE_PUBLIC_KEY',
    arbiter: 'ARBITER_PUBLIC_KEY' // Optional
  },
  { amount: '1000', asset: { code: 'XLM' } },
  'testnet',
  {
    expiresInMs: 7 * 24 * 60 * 60 * 1000, // 7 days
    requireArbiterApproval: true,
    autoReleaseAfter: Date.now() + (3 * 24 * 60 * 60 * 1000) // Auto-release in 3 days
  }
);

console.log('Escrow ID:', escrow.id);
console.log('Escrow Account:', escrowAccount.publicKey);

// 2. Fund escrow (payer sends funds)
const payerAccount = loadAccount('PAYER_SECRET_KEY');
const { escrow: fundedEscrow, result } = await fundEscrow(
  escrow,
  escrowAccount,
  payerAccount,
  'testnet'
);

if (result.success) {
  console.log('Escrow funded:', result.transactionHash);
}
```

### Release Escrow (Complete Payment)

```typescript
import { releaseEscrow } from './payments';

// Release requires: payee signature + arbiter signature (if required)
const payeeAccount = loadAccount('PAYEE_SECRET_KEY');
const arbiterAccount = loadAccount('ARBITER_SECRET_KEY');

const { escrow: releasedEscrow, result } = await releaseEscrow(
  fundedEscrow,
  escrowAccount,
  [payeeAccount, arbiterAccount],
  'testnet'
);

if (result.success) {
  console.log('Escrow released to payee:', result.transactionHash);
}
```

### Refund Escrow

```typescript
import { refundEscrow } from './payments';

// Refund can happen if:
// - Escrow expired
// - Both payer and payee agree
// - Arbiter decides

const { escrow: refundedEscrow, result } = await refundEscrow(
  fundedEscrow,
  escrowAccount,
  [payerAccount, payeeAccount], // Both parties agree
  'testnet',
  'Service not delivered'
);

if (result.success) {
  console.log('Escrow refunded to payer:', result.transactionHash);
}
```

### Check Escrow Status

```typescript
import { getEscrowStatus } from './payments';

const status = getEscrowStatus(escrow);

console.log('State:', status.state);
console.log('Can release:', status.canRelease);
console.log('Can refund:', status.canRefund);
console.log('Is expired:', status.isExpired);
console.log('Can auto-release:', status.canAutoRelease);
```

---

## API Reference

### Payment Verification

#### POST `/api/payments/verify`

Verify a payment for a payment request.

**Request:**
```json
{
  "requestId": "pay_123_abc",
  "transactionHash": "abc123...",
  "fromAddress": "GPAYER...",
  "network": "testnet"
}
```

**Response (Success):**
```json
{
  "success": true,
  "paymentToken": "pay_123_abc",
  "verification": {
    "verified": true,
    "transactionHash": "abc123...",
    "timestamp": 1234567890,
    "amount": { "amount": "100", "asset": { "code": "XLM" } },
    "from": "GPAYER...",
    "to": "GPAYEE..."
  },
  "message": "Payment verified successfully"
}
```

#### GET `/api/payments/request/:id`

Get payment request details.

**Response:**
```json
{
  "id": "pay_123_abc",
  "resource": "/premium-content",
  "amount": { "amount": "10", "asset": { "code": "XLM" } },
  "payee": "GPAYEE...",
  "description": "Access to premium content",
  "createdAt": 1234567890,
  "expiresAt": 1234571490,
  "paymentUrl": "/api/payments/verify",
  "status": "pending"
}
```

### Direct Payments

#### POST `/api/payments/process`

Process a direct payment (8004).

**Request:**
```json
{
  "fromSecretKey": "SXXXXX...",
  "to": "GRECIPIENT...",
  "amount": "100",
  "assetCode": "XLM",
  "network": "testnet",
  "memo": "Payment description"
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "code": 8004,
    "message": "Payment processed successfully",
    "paymentId": "transaction_hash_here",
    "transactionHash": "transaction_hash_here",
    "timestamp": 1234567890
  }
}
```

#### POST `/api/payments/verify-transaction`

Verify a Stellar transaction.

**Request:**
```json
{
  "transactionHash": "abc123...",
  "from": "GSENDER...",
  "to": "GRECIPIENT...",
  "amount": "100",
  "assetCode": "XLM",
  "network": "testnet"
}
```

### Escrow Payments

#### POST `/api/payments/escrow/create`

Create and fund a new escrow.

**Request:**
```json
{
  "payerSecretKey": "SXXXXX...",
  "payee": "GPAYEE...",
  "amount": "1000",
  "assetCode": "XLM",
  "network": "testnet",
  "arbiter": "GARBITER...",
  "expiresInMs": 604800000,
  "requireArbiterApproval": true,
  "autoReleaseAfter": 1234567890
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "code": 8004,
    "message": "Escrow payment created and funded successfully",
    "escrowId": "escrow_123_abc",
    "transactionHash": "funding_tx_hash",
    "timestamp": 1234567890
  }
}
```

### Utilities

#### POST `/api/payments/generate-keypair`

Generate a new Stellar keypair.

**Request:**
```json
{
  "network": "testnet",
  "fundAccount": true
}
```

**Response:**
```json
{
  "keypair": {
    "publicKey": "GXXXXX...",
    "secretKey": "SXXXXX..."
  },
  "funded": true,
  "transactionHash": "funding_tx_hash",
  "warning": "Keep your secret key safe! Never share it."
}
```

#### GET `/api/payments/balance/:publicKey`

Get account balance.

**Query Parameters:**
- `network` - Network to use (default: testnet)
- `assetCode` - Asset code to check (default: native for XLM)

**Response:**
```json
{
  "publicKey": "GXXXXX...",
  "assetCode": "native",
  "balance": "1000.5000000",
  "network": "testnet"
}
```

---

## Testing

### Run Tests

```bash
npm test
```

### Test Coverage

```bash
npm run test:coverage
```

### Example Integration Test

```typescript
import { describe, it, expect } from 'vitest';
import { 
  generateKeypair, 
  createTestnetAccount,
  process8004Payment,
  PAYMENT_CODE_8004_SUCCESS
} from './payments';

describe('Payment Integration', () => {
  it('should complete full payment flow on testnet', async () => {
    // 1. Generate accounts
    const sender = generateKeypair();
    const recipient = generateKeypair();
    
    // 2. Fund sender account
    await createTestnetAccount(sender.publicKey);
    
    // 3. Process payment
    const result = await process8004Payment(
      sender,
      recipient.publicKey,
      { amount: '10', asset: { code: 'XLM' } },
      'testnet'
    );
    
    expect(result.code).toBe(PAYMENT_CODE_8004_SUCCESS);
    expect(result.transactionHash).toBeDefined();
  });
});
```

---

## Security Best Practices

1. **Never expose secret keys** - Store them securely using environment variables or secrets management
2. **Use HTTPS** - Always use HTTPS for production deployments
3. **Validate inputs** - Validate all payment amounts and addresses
4. **Use testnet first** - Test thoroughly on testnet before mainnet deployment
5. **Monitor transactions** - Implement logging and monitoring for all payments
6. **Rate limiting** - Implement rate limiting on payment endpoints
7. **Verify payments** - Always verify payments on the blockchain before granting access

---

## Production Deployment

### Environment Variables

For production, set these via `wrangler secret put`:

```bash
npx wrangler secret put STELLAR_NETWORK  # Set to "mainnet"
npx wrangler secret put STELLAR_PAYEE_PUBLIC_KEY  # Your receiving address
```

### Use Mainnet

Change network to `mainnet` in production:

```typescript
const result = await process8004Payment(
  sender,
  recipient,
  amount,
  'mainnet'  // Use mainnet for production
);
```

### Monitor Transactions

```typescript
import { getTransaction } from './payments';

// Get transaction details
const tx = await getTransaction('TRANSACTION_HASH', 'mainnet');
if (tx) {
  console.log('Transaction successful:', tx.successful);
  console.log('Ledger:', tx.ledger);
}
```

---

## Support

For issues or questions:
- GitHub Issues: https://github.com/leocagli/Open-Stellar/issues
- Stellar Documentation: https://developers.stellar.org
- Stellar Stack Exchange: https://stellar.stackexchange.com

---

## License

MIT License - see LICENSE file for details
