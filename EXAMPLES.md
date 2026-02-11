# Open Stellar - Quick Start Examples

This guide provides step-by-step examples for using the Open Stellar platform.

## Prerequisites

1. Install [Freighter Wallet](https://www.freighter.app/) browser extension
2. Create a Stellar testnet account at [Stellar Laboratory](https://laboratory.stellar.org/#account-creator?network=test)
3. Fund your account with testnet XLM using the friendbot

## Example 1: Connect Wallet

1. Open the app at `http://localhost:8789/app`
2. Click "Connect Wallet"
3. Approve the connection in Freighter
4. Your public key will be displayed

## Example 2: Register a Bot

```bash
# Using cURL
curl -X POST http://localhost:8789/api/bots/register \
  -H "Content-Type: application/json" \
  -d '{
    "publicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "name": "Trading Bot Alpha",
    "description": "Automated market maker bot"
  }'

# Response
{
  "success": true,
  "bot": {
    "publicKey": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "name": "Trading Bot Alpha",
    "description": "Automated market maker bot",
    "timestamp": 1707685200000
  }
}
```

## Example 3: Create Asset Swap

```bash
# Find swap path
curl -X POST http://localhost:8789/api/swap/path \
  -H "Content-Type: application/json" \
  -d '{
    "sourceAsset": { "code": "XLM", "type": "native" },
    "destAsset": { 
      "code": "USDC", 
      "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
    },
    "amount": "100",
    "network": "testnet"
  }'

# Create swap transaction
curl -X POST http://localhost:8789/api/swap/create \
  -H "Content-Type: application/json" \
  -d '{
    "sourceAsset": { "code": "XLM", "type": "native" },
    "destAsset": { 
      "code": "USDC", 
      "issuer": "GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN"
    },
    "sourceAmount": "100",
    "minDestAmount": "95",
    "sourceAccount": "GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    "network": "testnet"
  }'

# Response
{
  "xdr": "AAAAAgAAAAA...",
  "hash": "abc123..."
}
```

## Example 4: Create Escrow

```bash
curl -X POST http://localhost:8789/api/escrow/create \
  -H "Content-Type: application/json" \
  -d '{
    "buyer": "GBUYER...",
    "seller": "GSELLER...",
    "arbiter": "GARBITER...",
    "amount": "1000",
    "asset": { "code": "XLM", "type": "native" },
    "contractAddress": "CESCROW...",
    "network": "testnet"
  }'

# Response
{
  "success": true,
  "escrow": {
    "id": "1707685200000",
    "buyer": "GBUYER...",
    "seller": "GSELLER...",
    "arbiter": "GARBITER...",
    "amount": "1000",
    "status": "pending",
    "createdAt": 1707685200000
  }
}
```

## Example 5: Create Time-Locked Order

```bash
# Create order that unlocks in 1 hour
UNLOCK_TIME=$(date -d "+1 hour" -Iseconds)

curl -X POST http://localhost:8789/api/orders/create \
  -H "Content-Type: application/json" \
  -d "{
    \"creator\": \"GCREATOR...\",
    \"beneficiary\": \"GBENEFICIARY...\",
    \"amount\": \"500\",
    \"asset\": { \"code\": \"XLM\", \"type\": \"native\" },
    \"unlockTime\": \"$UNLOCK_TIME\",
    \"network\": \"testnet\"
  }"

# Response
{
  "success": true,
  "order": {
    "id": "1707685200000",
    "creator": "GCREATOR...",
    "beneficiary": "GBENEFICIARY...",
    "amount": "500",
    "unlockTime": 1707688800000,
    "status": "pending",
    "createdAt": 1707685200000
  }
}
```

## Example 6: Using Stellar SDK Directly

```typescript
import { 
  StellarNetwork, 
  FreighterWallet, 
  StellarDEX,
  StellarSdk 
} from './stellar-sdk';

// Initialize network
const network = new StellarNetwork({ network: 'testnet' });

// Connect wallet
const wallet = new FreighterWallet();
const publicKey = await wallet.connect();

// Create swap
const dex = new StellarDEX(network);
const transaction = await dex.createSwapTransaction({
  sourceAsset: StellarSdk.Asset.native(),
  destAsset: new StellarSdk.Asset('USDC', 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN'),
  sourceAmount: '100',
  minDestAmount: '95',
  sourceAccount: publicKey,
});

// Sign and submit
const result = await wallet.signAndSubmitTransaction(
  transaction,
  network.networkPassphrase,
  network.server
);

console.log('Transaction successful:', result.hash);
```

## Example 7: Using Soroban Contracts

```bash
# Install Stellar CLI
cargo install --locked stellar-cli

# Deploy contracts
./scripts/deploy-contracts.sh

# Invoke escrow contract
stellar contract invoke \
  --id CESCROW... \
  --source-account alice \
  --network testnet \
  -- \
  create_escrow \
  --buyer GBUYER... \
  --seller GSELLER... \
  --arbiter GARBITER... \
  --amount 1000000000 \
  --token CTOKEN...
```

## Troubleshooting

### "Freighter not detected"
- Install the Freighter extension
- Refresh the page
- Check that Freighter is unlocked

### "Transaction failed"
- Ensure your account has sufficient XLM balance (minimum 1 XLM)
- Check that you're on the correct network (testnet/mainnet)
- Verify asset trustlines are established

### "Contract not found"
- Deploy contracts using `./scripts/deploy-contracts.sh`
- Update contract addresses in `.dev.vars`
- Verify network matches deployment network

## Next Steps

- Read the [STELLAR_MIGRATION.md](STELLAR_MIGRATION.md) for complete documentation
- Deploy contracts to testnet using the deployment script
- Explore the frontend UI at `/app`
- Check API health at `/api/health`
