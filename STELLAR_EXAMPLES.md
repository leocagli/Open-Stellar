# Stellar Integration Examples

This file contains practical examples of using the Stellar integration in Open-Stellar.

## Example 1: Generate Keypair and Register Agent

```typescript
import { generateKeypair, createAgentIdentity } from './src/stellar/identity/wallet';
import { registerIdentity } from './src/stellar/auth/siwa';

// Generate a new keypair
const keypair = generateKeypair();
console.log('Public Key:', keypair.publicKey());
console.log('Secret Key:', keypair.secret()); // Store securely!

// Create agent identity
const identity = createAgentIdentity(keypair, 'my-ai-agent-001', {
  name: 'My AI Agent',
  description: 'An autonomous AI agent for task automation',
  capabilities: ['code-generation', 'data-analysis'],
});

// Register the identity
registerIdentity(identity);
console.log('Agent registered:', identity);
```

## Example 2: SIWA Authentication Flow

```typescript
import { createNonce, verifySIWA } from './src/stellar/auth/siwa';
import { createSIWAMessage, signSIWAMessage, formatSIWAMessage } from './src/stellar/identity/signing';

// Server: Generate nonce for agent
const publicKey = keypair.publicKey();
const agentId = 'my-ai-agent-001';
const nonce = await createNonce(publicKey, agentId);
console.log('Nonce:', nonce.value);

// Agent: Create and sign SIWA message
const message = createSIWAMessage({
  domain: 'example.com',
  address: publicKey,
  agentId: agentId,
  uri: 'https://example.com/api',
  chainId: 'testnet',
  nonce: nonce.value,
  statement: 'Sign in to access AI services',
});

const { signature, message: formattedMessage } = signSIWAMessage(message, keypair);
console.log('Signature:', signature);

// Server: Verify the signed message
const result = await verifySIWA(formattedMessage, signature, 'example.com');
if (result.success) {
  console.log('✅ Authentication successful!');
  console.log('Receipt:', result.receipt);
  console.log('Identity:', result.identity);
} else {
  console.log('❌ Authentication failed:', result.error);
}
```

## Example 3: Create Multi-Signature Escrow

```typescript
import { 
  createEscrowAccount, 
  setupEscrowOnChain,
  createEscrowPayment,
  signEscrowTransaction,
  submitEscrowTransaction,
} from './src/stellar/escrow/trustless';
import { getNetworkConfig } from './src/stellar/identity/wallet';

// Get testnet configuration
const config = getNetworkConfig('testnet');

// Define signers (2-of-3 multi-sig)
const agentA = generateKeypair();
const agentB = generateKeypair();
const arbiter = generateKeypair();

const escrow = await createEscrowAccount(
  config,
  [
    { publicKey: agentA.publicKey(), weight: 1 },
    { publicKey: agentB.publicKey(), weight: 1 },
    { publicKey: arbiter.publicKey(), weight: 1 },
  ],
  2 // Requires 2 signatures
);

console.log('Escrow account created:', escrow.publicKey);

// Setup escrow on Stellar network
const sourceKeypair = generateKeypair(); // Needs to be funded first
const setupResult = await setupEscrowOnChain(
  sourceKeypair,
  escrow,
  '100', // 100 XLM initial balance
  config
);

if (setupResult.success) {
  console.log('✅ Escrow setup on-chain:', setupResult.transactionHash);
} else {
  console.log('❌ Setup failed:', setupResult.error);
}
```

## Example 4: Create and Sign Escrow Payment

```typescript
// Create payment transaction from escrow
const destination = 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
const payment = await createEscrowPayment(
  escrow.publicKey,
  destination,
  '50', // 50 XLM
  config
);

// Two signers sign the transaction
signEscrowTransaction(payment, agentA);
signEscrowTransaction(payment, agentB);

// Submit the signed transaction
const submitResult = await submitEscrowTransaction(payment, config);
if (submitResult.success) {
  console.log('✅ Payment successful:', submitResult.transactionHash);
} else {
  console.log('❌ Payment failed:', submitResult.error);
}
```

## Example 5: Time-Locked Payment

```typescript
import { createTimeLockedPayment } from './src/stellar/escrow/trustless';

// Create payment that unlocks 24 hours from now
const unlockTime = Math.floor(Date.now() / 1000) + (24 * 60 * 60);

const timeLockedPayment = await createTimeLockedPayment(
  escrow.publicKey,
  destination,
  '25', // 25 XLM
  unlockTime,
  config
);

console.log('Time-locked payment created. Unlocks at:', new Date(unlockTime * 1000));

// This transaction can only be submitted after the unlock time
```

## Example 6: Using the HTTP API

```bash
# Generate a new keypair
curl -X POST http://localhost:8789/api/stellar/keypair

# Register an agent
curl -X POST http://localhost:8789/api/stellar/register \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "GXXXXXXXX...",
    "agentId": "my-agent-001",
    "metadata": {
      "name": "My AI Agent"
    }
  }'

# Request a nonce
curl -X POST http://localhost:8789/api/stellar/nonce \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "GXXXXXXXX...",
    "agentId": "my-agent-001"
  }'

# Verify authentication
curl -X POST http://localhost:8789/api/stellar/verify \
  -H "Content-Type: application/json" \
  -d '{
    "message": "example.com wants you to sign in...",
    "signature": "base64signature...",
    "network": "testnet"
  }'

# Get agent identity
curl http://localhost:8789/api/stellar/identity/GXXXXXXXX...

# Fund testnet account
curl -X POST http://localhost:8789/api/stellar/fund-testnet \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "GXXXXXXXX..."
  }'

# Create escrow
curl -X POST http://localhost:8789/api/stellar/escrow/create \
  -H "Content-Type: application/json" \
  -d '{
    "signers": [
      {"publicKey": "GXXXXXXXX...", "weight": 1},
      {"publicKey": "GYYYYYYYY...", "weight": 1}
    ],
    "threshold": 2,
    "network": "testnet"
  }'

# Get escrow details
curl "http://localhost:8789/api/stellar/escrow/GXXXXXXXX...?network=testnet"

# Create escrow payment
curl -X POST http://localhost:8789/api/stellar/escrow/payment \
  -H "Content-Type: application/json" \
  -d '{
    "escrowPublicKey": "GXXXXXXXX...",
    "destination": "GYYYYYYYY...",
    "amount": "100",
    "network": "testnet"
  }'

# Submit signed transaction
curl -X POST http://localhost:8789/api/stellar/escrow/submit \
  -H "Content-Type: application/json" \
  -d '{
    "transactionXDR": "AAAAAA...",
    "network": "testnet"
  }'
```

## Complete Workflow Example

```typescript
import * as StellarSDK from '@stellar/stellar-sdk';

// 1. Setup
const agentKeypair = generateKeypair();
const config = getNetworkConfig('testnet');

// 2. Fund testnet account
await fundTestnetAccount(agentKeypair.publicKey());

// 3. Register agent identity
const identity = createAgentIdentity(agentKeypair, 'workflow-agent', {
  name: 'Workflow Agent',
  type: 'autonomous',
});
registerIdentity(identity);

// 4. Authenticate using SIWA
const nonce = await createNonce(agentKeypair.publicKey(), 'workflow-agent');
const siwaMessage = createSIWAMessage({
  domain: 'myapp.com',
  address: agentKeypair.publicKey(),
  agentId: 'workflow-agent',
  uri: 'https://myapp.com/api',
  chainId: 'testnet',
  nonce: nonce.value,
});

const { signature } = signSIWAMessage(siwaMessage, agentKeypair);
const messageStr = formatSIWAMessage(siwaMessage);
const authResult = await verifySIWA(messageStr, signature, 'myapp.com', config);

if (authResult.success) {
  console.log('✅ Agent authenticated');
  
  // 5. Create escrow for a transaction
  const counterpartyKeypair = generateKeypair();
  const escrow = await createEscrowAccount(
    config,
    [
      { publicKey: agentKeypair.publicKey(), weight: 1 },
      { publicKey: counterpartyKeypair.publicKey(), weight: 1 },
    ],
    2
  );
  
  // 6. Perform escrow operations
  // ... transaction logic here
  
  console.log('Workflow complete!');
}
```

## Notes

- Always use **testnet** for development and testing
- Store secret keys securely (never commit them to git)
- Validate all inputs on both client and server
- Implement rate limiting on API endpoints
- Monitor escrow accounts for suspicious activity

## Resources

- [STELLAR_INTEGRATION.md](./STELLAR_INTEGRATION.md) - Full documentation
- [Stellar Documentation](https://developers.stellar.org/)
- [Stellar SDK](https://github.com/stellar/js-stellar-sdk)
