#!/usr/bin/env bash
set -euo pipefail

echo "Soroban deploy template"
echo "1) cd contracts/stellar/escrow"
echo "2) soroban contract build"
echo "3) soroban contract deploy --wasm target/wasm32-unknown-unknown/release/stellar_escrow.wasm --source deployer --network testnet"
echo "4) copy contract id into app config"
