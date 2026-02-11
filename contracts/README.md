# Soroban Smart Contracts

This directory contains the Soroban smart contracts for Open Stellar.

## Contracts

### Escrow Contract (`escrow/`)

A secure escrow system for Stellar transactions with arbiter support.

**Features:**
- Create escrow with buyer, seller, and arbiter
- Release funds to seller (by buyer or arbiter)
- Refund to buyer (by seller or arbiter)
- Immutable escrow records

**Functions:**
```rust
create_escrow(buyer, seller, arbiter, amount, token) -> u64
release(escrow_id)
refund(escrow_id)
get_escrow(escrow_id) -> EscrowData
```

### Time-Lock Contract (`timelock/`)

Time-locked orders using Stellar's claimable balance pattern.

**Features:**
- Create orders with future unlock time
- Claim funds after unlock time
- Cancel before unlock time (creator only)
- Automatic time validation

**Functions:**
```rust
create_order(creator, beneficiary, amount, token, unlock_time) -> u64
claim(order_id)
cancel(order_id)
get_order(order_id) -> TimeLockOrder
is_claimable(order_id) -> bool
```

## Building Contracts

### Prerequisites

- Rust 1.74 or later
- `wasm32-unknown-unknown` target
- Stellar CLI

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Add wasm32 target
rustup target add wasm32-unknown-unknown

# Install Stellar CLI
cargo install --locked stellar-cli
```

### Build

```bash
# Build all contracts
npm run build:contracts

# Or build individually
cd contracts/escrow
cargo build --target wasm32-unknown-unknown --release

cd ../timelock
cargo build --target wasm32-unknown-unknown --release
```

Built contracts will be in:
- `contracts/escrow/target/wasm32-unknown-unknown/release/escrow.wasm`
- `contracts/timelock/target/wasm32-unknown-unknown/release/timelock.wasm`

## Testing

```bash
# Test all contracts
npm run test:contracts

# Test individually
cd contracts/escrow
cargo test

cd ../timelock
cargo test
```

## Deployment

### Using the Deployment Script

```bash
./scripts/deploy-contracts.sh
```

This will:
1. Build both contracts
2. Deploy to Stellar testnet
3. Save contract IDs to `.env.contracts`

### Manual Deployment

```bash
# Deploy escrow
stellar contract deploy \
  --wasm contracts/escrow/target/wasm32-unknown-unknown/release/escrow.wasm \
  --network testnet \
  --source-account default

# Deploy timelock
stellar contract deploy \
  --wasm contracts/timelock/target/wasm32-unknown-unknown/release/timelock.wasm \
  --network testnet \
  --source-account default
```

## Usage Examples

### Escrow Contract

```bash
# Create escrow
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source-account buyer \
  --network testnet \
  -- \
  create_escrow \
  --buyer GBUYER... \
  --seller GSELLER... \
  --arbiter GARBITER... \
  --amount 1000000000 \
  --token <TOKEN_CONTRACT_ID>

# Release escrow
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source-account buyer \
  --network testnet \
  -- \
  release \
  --escrow_id 12345

# Get escrow details
stellar contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- \
  get_escrow \
  --escrow_id 12345
```

### Time-Lock Contract

```bash
# Create time-locked order (unlock in 24 hours)
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source-account creator \
  --network testnet \
  -- \
  create_order \
  --creator GCREATOR... \
  --beneficiary GBENEFICIARY... \
  --amount 500000000 \
  --token <TOKEN_CONTRACT_ID> \
  --unlock_time $(date -d "+24 hours" +%s)

# Check if claimable
stellar contract invoke \
  --id <CONTRACT_ID> \
  --network testnet \
  -- \
  is_claimable \
  --order_id 12345

# Claim order (after unlock time)
stellar contract invoke \
  --id <CONTRACT_ID> \
  --source-account beneficiary \
  --network testnet \
  -- \
  claim \
  --order_id 12345
```

## Contract Security

### Auditing

Before mainnet deployment:
1. Review all contract code
2. Run comprehensive tests
3. Perform security audit
4. Test on testnet extensively

### Best Practices

- Always verify unlock times are in the future
- Use proper authorization checks
- Handle edge cases (already claimed, etc.)
- Validate all input parameters
- Use persistent storage for critical data

## Contract Optimization

Contracts are optimized for:
- Minimal WASM size (opt-level = "z")
- Reduced storage costs
- Gas efficiency
- Security (overflow checks enabled)

## License

MIT
