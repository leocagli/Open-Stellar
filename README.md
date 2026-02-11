# Open-Stellar

### **Descripción del Proyecto**
Open-Stellar es un repositorio enfocado en la integración de agentes inteligentes y flujos de pago mediante Stellar y Trustless, complementado por APIs de inteligencia artificial y visualizaciones en 3D.

**Características principales:**
- 🤖 **Gateway de AI** - Moltbot con integración Groq LLM gratuita (Llama 3.3 70B)
- 💳 **Sistema de Pagos** - Funciones x402 y 8004 para pagos HTTP con Stellar
- 🔒 **Escrow Trustless** - Contratos de escrow descentralizados sin intermediarios
- 🌐 **Cloudflare Workers** - Despliegue global en edge computing
- 💾 **Almacenamiento R2** - Persistencia de historial de chat y datos

---

# 🌟 Open Stellar

> AI-powered Moltbot gateway running on Cloudflare Workers with **free** Groq LLM integration

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/leocagli/Open-Stellar)

## ✨ Features

- 🚀 **Cloudflare Workers** - Runs at the edge, globally distributed
- 🤖 **Groq Integration** - Free LLM API with **Llama 3.3 70B** (14,400 requests/day)
- 💳 **Payment System** - HTTP 402 (x402) and payment validation (8004) functions
- 🔒 **Stellar Escrow** - Trustless escrow contracts for secure transactions
- 🌐 **WebSocket Support** - Real-time chat interface with message streaming
- 💾 **R2 Storage** - Optional persistent storage for chat history
- 🎯 **Admin UI** - Built-in React dashboard for device management
- 🔧 **Debug Routes** - Development tools and API testing endpoints
- 🔐 **Secure** - Token-based authentication with DEV_MODE support

## 🚀 Quick Start

### 1. Get Your Free Groq API Key

1. Go to [console.groq.com](https://console.groq.com/)
2. Sign up for a free account
3. Navigate to **API Keys** section
4. Click **Create API Key**
5. Copy your key (starts with `gsk_...`)

### 2. Clone and Setup

```bash
git clone https://github.com/leocagli/Open-Stellar.git
cd Open-Stellar
npm install
```

### 3. Configure Environment

Create `.dev.vars` file:

```bash
# Groq Configuration
OPENAI_API_KEY=your_groq_api_key_here
OPENAI_BASE_URL=https://api.groq.com/openai/v1
MOLTBOT_GATEWAY_TOKEN=your_groq_api_key_here

# Development Settings
DEV_MODE=true
DEBUG_ROUTES=true
```

### 4. Build and Run

```bash
npm run build
npm run start
```

Visit `http://localhost:8789` in your browser.

## 📚 Available Models

Open Stellar automatically configures these Groq models:

- **Llama 3.3 70B Versatile** (Primary) - 131K context
- **Llama 3.1 70B Versatile** - 131K context
- **Mixtral 8x7B** - 32K context
- **Gemma 2 9B** - 8K context

## 🏗️ Architecture

```
Browser → Cloudflare Worker → Sandbox Container → Moltbot Gateway → Groq API
                ↓
         Payment System
         (x402/8004)
                ↓
         Stellar Network
         (Blockchain)
```

The worker proxies HTTP and WebSocket traffic to a Moltbot instance running in a Cloudflare Sandbox container, which then communicates with the Groq API. The integrated payment system enables HTTP 402 payment requirements and trustless escrow contracts on the Stellar blockchain.

## 📖 Documentation

- [`AGENTS.md`](AGENTS.md) - Development guide for AI agents
- [`IMPLEMENTATION_GUIDE.md`](IMPLEMENTATION_GUIDE.md) - Complete guide for x402, 8004, and escrow implementation
- [`README.md`](README.md) - This file
- [`CREATE_OPEN_STELLAR.md`](CREATE_OPEN_STELLAR.md) - Repository setup guide

## 🔧 Development

```bash
npm run dev        # Start Vite dev server for UI development
npm run start      # Start wrangler dev (local worker)
npm run build      # Build worker + client
npm run deploy     # Deploy to Cloudflare Workers
npm run test       # Run tests with Vitest
npm run typecheck  # TypeScript type checking
```

## 🌐 Deployment

### Prerequisites

- Cloudflare account
- Wrangler CLI configured
- Domain (optional, workers.dev provided by default)
- Groq API key (free from [console.groq.com](https://console.groq.com/))
- Stellar account (optional, for payment features)

### Deploy

```bash
# Set production secrets
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put MOLTBOT_GATEWAY_TOKEN

# Optional: Configure Stellar network for payments
npx wrangler secret put STELLAR_NETWORK  # 'testnet' or 'mainnet'

# Deploy
npm run deploy
```

Your worker will be available at `https://your-worker.your-subdomain.workers.dev`

## 💳 Payment Features

Open-Stellar includes a complete payment system with:

### HTTP 402 Payment Required (x402)
Generate payment requirements for protected resources:

```typescript
import { x402 } from './payments';

const paymentReq = x402('10', 'XLM', 'DESTINATION_ADDRESS');
// Returns 402 response with payment details
```

### Payment Validation (8004)
Validate Stellar transactions:

```typescript
import { process8004 } from './payments';

const result = await process8004({
  paymentId: 'pay_123',
  transactionHash: 'stellar_tx_hash'
});
// Returns validation status and confirmations
```

### Trustless Escrow
Secure transactions without intermediaries:

```typescript
import { createEscrow, fundEscrow, releaseEscrow } from './payments/escrow';

// Create escrow
const contract = await createEscrow({
  buyer: 'BUYER_ADDRESS',
  seller: 'SELLER_ADDRESS',
  arbiter: 'ARBITER_ADDRESS',
  amount: '100'
});

// Buyer funds escrow
await fundEscrow(contract.id, buyerKeypair);

// Release to seller when complete
await releaseEscrow(contract.id, buyerKeypair);
```

### Payment API Endpoints

```
POST /api/payments/x402           - Generate payment requirement
POST /api/payments/8004           - Validate payment
GET  /api/payments/status/:id     - Get payment status
POST /api/payments/escrow/create  - Create escrow contract
POST /api/payments/escrow/:id/fund    - Fund escrow
POST /api/payments/escrow/:id/release - Release funds
POST /api/payments/escrow/:id/refund  - Refund to buyer
```

📖 **For complete implementation guide, see [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md)**

### **Estructura del Proyecto**
#### Carpetas Principales:
- `/api-integrations`: Wrappers y configuración para interactuar con APIs externas (Groq, OpenRouter, ChatGPT Pro).
- `/agents`: Lógica de los agentes inteligentes y sus roles.
- `/payments`: Implementación de pagos con Stellar Trustless y manejo de escrow.
- `/mvp-generation`: Lógica para generar productos mínimos viables (MVPs).
- `/visualization`: Simulación 3D usando Three.js.
- `/tests`: Pruebas automatizadas y de integración.

---

### **Fases del Desarrollo**
1. **Arquitectura Inicial y Configuración**: Estandarización de la estructura y preparación del entorno.
2. **Integración de APIs**: Implementación de interacción con Groq, OpenRouter y ChatGPT Pro.
3. **Flujo de Pagos Trustless**: Configuración del protocolo de pagos usando Stellar Trustless.
4. **Interacción entre Agentes**: Implementación de flujos de trabajo y validación del sistema.
5. **Visualización en 3D**: Creación de un entorno interactivo utilizando mapas o ciudades renderizadas con Three.js.

### **Contribuyendo**
- Crea nuevos issues para reportar errores o sugerir mejoras.
- Usa ramas específicas para desarrollar nuevas funcionalidades.
- Asegúrate de incluir pruebas para garantizar la calidad del código.

### **Objetivo Final**
Permitir la interacción eficiente entre agentes inteligentes simulada a través de APIs y flujos gráficos, logrando un manejo completo de pagos y servicios con Stellar.