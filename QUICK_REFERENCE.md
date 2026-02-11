# Open Stellar - Quick Reference

## Installation & Setup

```bash
git clone https://github.com/leocagli/Open-Stellar.git
cd Open-Stellar
npm install
cp .env.stellar.example .dev.vars
# Edit .dev.vars with your settings
npm run build
npm run start
```

## Key Commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build application |
| `npm run build:contracts` | Build Soroban contracts |
| `npm run deploy` | Deploy to Cloudflare |
| `npm run start` | Start local dev server |
| `npm run dev` | Start Vite dev server |
| `npm test` | Run tests |
| `npm run test:contracts` | Test smart contracts |
| `./scripts/deploy-contracts.sh` | Deploy contracts to testnet |

## API Endpoints

### Bots
- `POST /api/bots/register` - Register bot
- `GET /api/bots/:publicKey` - Get bot
- `GET /api/bots` - List bots
- `DELETE /api/bots/:publicKey` - Delete bot

### Swaps
- `POST /api/swap/path` - Find swap path
- `POST /api/swap/create` - Create swap
- `POST /api/swap/orderbook` - Get orderbook

### Escrow
- `POST /api/escrow/create` - Create escrow
- `POST /api/escrow/:id/release` - Release funds
- `POST /api/escrow/:id/refund` - Refund funds
- `GET /api/escrow/:id` - Get escrow
- `GET /api/escrow` - List escrows

### Orders
- `POST /api/orders/create` - Create time-locked order
- `POST /api/orders/:id/claim` - Claim order
- `POST /api/orders/:id/cancel` - Cancel order
- `GET /api/orders/:id` - Get order
- `GET /api/orders/claimable/:addr` - Get claimable orders

## Contract Functions

### Escrow Contract

```rust
create_escrow(buyer, seller, arbiter, amount, token) -> u64
release(escrow_id)
refund(escrow_id)
get_escrow(escrow_id) -> EscrowData
```

### Time-Lock Contract

```rust
create_order(creator, beneficiary, amount, token, unlock_time) -> u64
claim(order_id)
cancel(order_id)
get_order(order_id) -> TimeLockOrder
is_claimable(order_id) -> bool
```

## SDK Usage

### Connect Wallet

```typescript
import { FreighterWallet } from './stellar-sdk';

const wallet = new FreighterWallet();
const publicKey = await wallet.connect();
```

### Initialize Network

```typescript
import { StellarNetwork } from './stellar-sdk';

const network = new StellarNetwork({
  network: 'testnet'
});
```

### Create Swap

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

### Create Claimable Balance

```typescript
import { ClaimableBalanceManager } from './stellar-sdk';

const cbm = new ClaimableBalanceManager(network);
const claimant = cbm.createTimeLockedClaimant(
  beneficiaryKey,
  new Date('2024-12-31')
);

const tx = await cbm.createClaimableBalance({
  asset: StellarSdk.Asset.native(),
  amount: '100',
  claimants: [claimant],
  source: creatorKey
});
```

## Environment Variables

```bash
# Network
STELLAR_NETWORK=testnet
STELLAR_HORIZON_URL=https://horizon-testnet.stellar.org

# Contracts
ESCROW_CONTRACT_ID=CXXXXXXXXXX...
TIMELOCK_CONTRACT_ID=CXXXXXXXXXX...

# Development
DEV_MODE=true
DEBUG_ROUTES=true
```

## Stellar CLI Commands

### Deploy Contract

```bash
stellar contract deploy \
  --wasm path/to/contract.wasm \
  --network testnet \
  --source-account default
```

### Invoke Contract

```bash
stellar contract invoke \
  --id CONTRACT_ID \
  --source-account ACCOUNT \
  --network testnet \
  -- \
  function_name \
  --param1 value1 \
  --param2 value2
```

### Create Account

```bash
stellar keys generate --network testnet --name my-account
stellar keys fund my-account --network testnet
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Freighter not detected | Install extension, refresh page |
| Transaction failed | Check balance, verify trustlines |
| Contract not found | Deploy contracts, update IDs |
| Build failed | Run `npm install`, check Rust installation |
| Test failed | Ensure stellar-cli installed |

## Project Structure

```
Open-Stellar/
├── contracts/          # Soroban smart contracts
│   ├── escrow/
│   └── timelock/
├── stellar-sdk/       # Stellar SDK integration
├── backend/api/       # API endpoints
├── frontend/src/      # React frontend
├── scripts/           # Deployment scripts
└── src/              # Main entry point
```

## Resources

- **Docs**: See `STELLAR_MIGRATION.md`
- **Examples**: See `EXAMPLES.md`
- **Integration**: See `INTEGRATION_GUIDE.md`
- **Changes**: See `CHANGELOG.md`
- **Stellar Docs**: https://developers.stellar.org
- **Soroban**: https://soroban.stellar.org
- **Discord**: https://discord.gg/stellardev

## Testing Workflow

1. Build contracts: `npm run build:contracts`
2. Run contract tests: `npm run test:contracts`
3. Deploy contracts: `./scripts/deploy-contracts.sh`
4. Update contract IDs in `.dev.vars`
5. Build app: `npm run build`
6. Run tests: `npm test`
7. Start server: `npm run start`
8. Test in browser: `http://localhost:8789`

## Deployment Checklist

- [ ] Build contracts
- [ ] Test contracts locally
- [ ] Deploy to testnet
- [ ] Update contract IDs
- [ ] Test API endpoints
- [ ] Test frontend
- [ ] Run integration tests
- [ ] Deploy to Cloudflare
- [ ] Verify production

---

**Quick Links**
- GitHub: https://github.com/leocagli/Open-Stellar
- Issues: https://github.com/leocagli/Open-Stellar/issues
- Stellar Lab: https://laboratory.stellar.org
- Freighter: https://freighter.app
