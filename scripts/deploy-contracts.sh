#!/bin/bash

# Open Stellar - Contract Deployment Script
# This script deploys Soroban contracts to Stellar testnet

set -e

echo "🌟 Open Stellar Contract Deployment"
echo "===================================="
echo ""

# Check if stellar CLI is installed
if ! command -v stellar &> /dev/null; then
    echo "❌ Stellar CLI not found. Install with:"
    echo "   cargo install --locked stellar-cli"
    exit 1
fi

# Build contracts
echo "📦 Building contracts..."
cd contracts/escrow
cargo build --target wasm32-unknown-unknown --release
cd ../timelock
cargo build --target wasm32-unknown-unknown --release
cd ../..

echo "✅ Contracts built successfully"
echo ""

# Deploy escrow contract
echo "🚀 Deploying escrow contract..."
ESCROW_ID=$(stellar contract deploy \
  --wasm contracts/escrow/target/wasm32-unknown-unknown/release/escrow.wasm \
  --network testnet \
  --source-account default)

echo "✅ Escrow contract deployed: $ESCROW_ID"
echo ""

# Deploy timelock contract
echo "🚀 Deploying timelock contract..."
TIMELOCK_ID=$(stellar contract deploy \
  --wasm contracts/timelock/target/wasm32-unknown-unknown/release/timelock.wasm \
  --network testnet \
  --source-account default)

echo "✅ Timelock contract deployed: $TIMELOCK_ID"
echo ""

# Save contract IDs
echo "💾 Saving contract IDs to .env.contracts..."
cat > .env.contracts << EOF
ESCROW_CONTRACT_ID=$ESCROW_ID
TIMELOCK_CONTRACT_ID=$TIMELOCK_ID
EOF

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Contract IDs saved to .env.contracts"
echo "Add these to your .dev.vars file:"
echo ""
echo "ESCROW_CONTRACT_ID=$ESCROW_ID"
echo "TIMELOCK_CONTRACT_ID=$TIMELOCK_ID"
echo ""
