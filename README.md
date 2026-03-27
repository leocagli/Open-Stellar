# Open Vinito / Open Stellar

Plataforma multi-chain con frontend v0 integrado, wallets Web3 conectadas con wagmi + WalletConnect + viem, flujo Stellar/Freighter, contratos de escrow, y capa de protocolos para x402 y track 8004 (con fallback de reputacion en Stellar).

## Estado actual

- Frontend integrado en dos vistas activas:
  - Vendimia v0
  - Open-Stellar v0
- Conectividad Web3:
  - BNB: MetaMask (injected) + WalletConnect (QR)
  - Stellar: Freighter
- Transacciones:
  - BNB nativa en testnet
  - XLM en Stellar testnet
- Protocolos:
  - x402 implementado en capa API y utilidades
  - track 8004 con deteccion y fallback a reputacion en Stellar
- Contratos:
  - EscrowMilestone.sol
  - X402ServicePaywall.sol
  - Base escrow Soroban (Rust)

## Integracion Frontend + Web3 + Agentes

### 1. Frontend v0 integrado

Archivo principal de entrada:

- app/page.tsx

Selector de vistas:

- Vendimia v0: simulacion tipo mundo/agentes
- Open-Stellar v0: mapa de ciudad + panel lateral operativo

Componente de integracion:

- components/integrated-home.tsx

Componente Open-Stellar:

- components/open-stellar/open-stellar-hub.tsx

### 2. Capa Web3

#### Track BNB (EVM)

- Stack: wagmi + viem
- Conectores activos:
  - injected (MetaMask)
  - walletConnect (si NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID existe)
- Red objetivo: BNB Smart Chain Testnet (chain 97)
- Envio transacciones: useSendTransaction + waitForTransactionReceipt

Archivos:

- lib/wallet-config.ts
- components/wallet/wallet-button.tsx
- components/wallet/transaction-panel.tsx

#### Track Stellar

- Stack: @stellar/freighter-api + @stellar/stellar-sdk
- Wallet: Freighter
- Red objetivo: Test SDF Network
- Envio transacciones: TransactionBuilder + signTransaction + Horizon submit

Archivos:

- lib/stellar-utils.ts
- components/wallet/wallet-button.tsx
- components/wallet/transaction-panel.tsx
- app/api/stellar/*

### 3. Capa de Agentes

Puede operar con modelos LLM distintos segun carga y complejidad:

- Router Agent (clasifica tarea)
- Specialist EVM Agent
- Specialist Stellar Agent
- Ops/Support Agent

Skills recomendadas como servicios:

- Risk Guard: analiza riesgo pre-transaccion
- Tx Explainer: explica resultado on-chain
- Policy Checker: valida reglas de entorno
- Ops Assistant: diagnostica errores wallet/RPC

## x402 y track 8004

### x402

Implementacion en:

- lib/protocols/x402.ts
- app/api/protocol/x402/quote/route.ts
- app/api/protocol/x402/settle/route.ts

Flujo:

1. Cliente pide quote x402 (respuesta tipo code 402)
2. Cliente paga on-chain
3. Cliente envia evidencia de settlement
4. Sistema emite receipt

### track 8004 + fallback

Implementacion en:

- lib/protocols/track8004.ts
- app/api/protocol/track8004/route.ts

Regla:

- Si no hay soporte 8004 en Stellar, el modo pasa automaticamente a reputation-fallback.

Sistema de reputacion:

- lib/reputation/reputation-store.ts
- app/api/protocol/reputation/route.ts
- contracts/stellar/REPUTATION_FALLBACK.md

## Tecnologia de escrow

### EVM

- contracts/evm/EscrowMilestone.sol
  - createDeal
  - release
  - refund
  - raiseDispute

- contracts/evm/X402ServicePaywall.sol
  - settle402
  - hasPaid
  - withdraw

### Stellar (Soroban base)

- contracts/stellar/escrow/src/lib.rs
  - create
  - release
  - dispute
  - get

Nota: el contrato Soroban es base funcional para evolucionar a transferencias tokenizadas/asset-based.

## Refactor de estructura

Nuevas carpetas agregadas:

- components/open-stellar/
- lib/protocols/
- lib/reputation/
- contracts/evm/
- contracts/stellar/escrow/
- app/api/protocol/

Objetivo del refactor:

- Separar UI, capa Web3, capa de protocolos y contratos
- Facilitar mantenimiento por dominio funcional

## Instalacion

1. Clonar

```bash
git clone https://github.com/leocagli/Open-Stellar.git
cd Open-Stellar
```

2. Dependencias

```bash
pnpm install
```

Si no tienes pnpm, puedes usar npm:

```bash
npm install
```

3. Variables de entorno

Crear .env.local:

```env
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=tu_project_id_walletconnect
```

4. Desarrollo

```bash
pnpm dev
```

## Chequeo y bugs

Checklist aplicada en esta iteracion:

- Revisada coherencia de conectores BNB en UI
- Revisado fallback cuando WalletConnect no esta configurado
- Revisado flujo Freighter y red testnet
- Revisado tipado de nuevos endpoints protocol
- Revisada integracion de ambas vistas frontend

Comando recomendado de verificacion local:

```bash
pnpm lint
pnpm build
```

Con npm:

```bash
npm run lint
npm run build
```

Si aparecen conflictos de node_modules en el panel de errores, ignorar y validar solo archivos del proyecto.

## Rutas API nuevas

- POST /api/protocol/x402/quote
- POST /api/protocol/x402/settle
- GET /api/protocol/track8004?chain=stellar
- GET /api/protocol/reputation?actorId=agent-1
- POST /api/protocol/reputation

## Deploy de contratos (EVM + Soroban)

Guia extendida:

- DEPLOY_GUIDE.md

Scripts de ayuda:

```bash
npm run deploy:evm:guide
npm run deploy:soroban:guide
```

## Licencia

MIT
