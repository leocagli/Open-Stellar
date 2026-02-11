# Guía de Implementación: Funciones x402 y 8004 con Escrow Trustless

## Resumen

Este documento proporciona una guía paso a paso para implementar y utilizar las funciones x402 (HTTP 402 Payment Required) y 8004 (validación de pagos) integradas con un mecanismo de escrow trustless basado en la red Stellar.

## Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────┐
│                    Cliente (Navegador/API)              │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Cloudflare Worker (Open-Stellar)           │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Rutas de Pago (/api/payments/*)                   │ │
│  │  - POST /x402        - Generar requisito de pago   │ │
│  │  - POST /8004        - Validar transacción         │ │
│  │  - POST /escrow/*    - Operaciones de escrow       │ │
│  └────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────┐ │
│  │  Lógica de Negocio                                 │ │
│  │  - x402.ts           - HTTP 402 handler            │ │
│  │  - 8004.ts           - Validación de pagos         │ │
│  │  - stellar.ts        - Utilidades de Stellar       │ │
│  │  - escrow.ts         - Contratos de escrow         │ │
│  └────────────────────────────────────────────────────┘ │
└─────────────────────┬───────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────┐
│              Red Stellar (Blockchain)                   │
│  - Transacciones de pago                                │
│  - Cuentas de escrow multi-firma                        │
│  - Validación de transacciones                          │
└─────────────────────────────────────────────────────────┘
```

## Componentes Principales

### 1. Función x402 (HTTP 402 Payment Required)

**Ubicación:** `/src/payments/x402.ts`

**Propósito:** Generar respuestas HTTP 402 cuando se requiere un pago para acceder a un recurso o servicio.

**Características:**
- Genera IDs de pago únicos
- Especifica monto, activo (XLM, USDC, etc.) y dirección de destino
- Middleware para proteger rutas con requisitos de pago
- Compatible con el estándar HTTP 402

### 2. Función 8004 (Validación de Pagos)

**Ubicación:** `/src/payments/8004.ts`

**Propósito:** Validar y procesar transacciones de pago en la red Stellar.

**Características:**
- Valida hashes de transacciones
- Rastrea estado de pagos (pending, confirmed, failed)
- Cuenta confirmaciones de red
- Limpieza automática de registros antiguos

### 3. Utilidades Stellar

**Ubicación:** `/src/payments/stellar.ts`

**Propósito:** Interactuar con la blockchain de Stellar.

**Características:**
- Creación y gestión de keypairs
- Envío de pagos
- Verificación de transacciones
- Consulta de saldos de cuenta

### 4. Sistema de Escrow Trustless

**Ubicación:** `/src/payments/escrow.ts`

**Propósito:** Implementar contratos de escrow descentralizados sin intermediarios.

**Características:**
- Creación de contratos de escrow
- Financiamiento por el comprador
- Liberación de fondos al vendedor
- Reembolso al comprador
- Soporte para árbitros
- Expiración automática de contratos

## Guía de Implementación Paso a Paso

### Paso 1: Configuración Inicial

#### 1.1 Instalar Dependencias

```bash
cd Open-Stellar
npm install @stellar/stellar-sdk
```

#### 1.2 Configurar Variables de Entorno

Crear o editar `.dev.vars`:

```bash
# Configuración de Stellar
STELLAR_NETWORK=testnet  # o 'mainnet' para producción

# Configuración existente de Moltbot
OPENAI_API_KEY=your_groq_api_key_here
OPENAI_BASE_URL=https://api.groq.com/openai/v1
MOLTBOT_GATEWAY_TOKEN=your_groq_api_key_here
DEV_MODE=true
DEBUG_ROUTES=true
```

### Paso 2: Usar la Función x402

#### 2.1 Ejemplo de Protección de Ruta

```typescript
import { Hono } from 'hono';
import { requirePayment } from './payments';

const app = new Hono();

// Proteger una ruta específica con pago requerido
app.get(
  '/premium-content',
  requirePayment('10', 'XLM', 'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX'),
  async (c) => {
    return c.json({ content: 'Este es contenido premium' });
  }
);
```

#### 2.2 Generar Requisito de Pago Manual

```typescript
import { x402 } from './payments';

// En un controlador
const paymentRequired = x402(
  '10',                                                          // Monto (10 XLM)
  'XLM',                                                        // Activo
  'GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',    // Dirección destino
  'Pago requerido para acceder al servicio premium'            // Mensaje opcional
);

// Respuesta:
// {
//   statusCode: 402,
//   message: 'Pago requerido para acceder al servicio premium',
//   paymentRequired: {
//     amount: '10',
//     asset: 'XLM',
//     destination: 'GXXX...',
//     paymentId: 'pay_1234567890_abc123'
//   }
// }
```

### Paso 3: Validar Pagos con 8004

#### 3.1 Proceso de Validación

```typescript
import { process8004 } from './payments';

// Después de que el cliente realice el pago y obtenga el hash de transacción
const validationResult = await process8004({
  paymentId: 'pay_1234567890_abc123',
  transactionHash: 'abcdef1234567890...'
});

// Respuesta:
// {
//   validated: true,
//   status: 'confirmed',
//   confirmations: 1
// }
```

#### 3.2 Consultar Estado de Pago

```typescript
import { getPaymentStatus } from './payments';

const status = getPaymentStatus('pay_1234567890_abc123');
// null si no existe, o PaymentRecord si existe
```

### Paso 4: Implementar Escrow Trustless

#### 4.1 Crear un Contrato de Escrow

```typescript
import { createEscrow } from './payments/escrow';

// Crear un nuevo contrato de escrow
const contract = await createEscrow({
  buyer: 'GBUYER_PUBLIC_KEY...',
  seller: 'GSELLER_PUBLIC_KEY...',
  arbiter: 'GARBITER_PUBLIC_KEY...',
  amount: '100',
  asset: 'XLM',
  expirationDays: 30
});

console.log('Escrow ID:', contract.id);
console.log('Estado:', contract.state); // 'created'
```

#### 4.2 Financiar el Escrow (Comprador)

```typescript
import { fundEscrow, loadKeypair } from './payments';

// El comprador firma y envía los fondos al escrow
const buyerKeypair = loadKeypair('BUYER_SECRET_KEY...');
const txHash = await fundEscrow(contract.id, buyerKeypair);

console.log('Escrow financiado:', txHash);
// Estado del contrato ahora es 'funded'
```

#### 4.3 Liberar Fondos al Vendedor

```typescript
import { releaseEscrow } from './payments';

// El comprador (o árbitro) aprueba la liberación de fondos
const txHash = await releaseEscrow(contract.id, buyerKeypair);

console.log('Fondos liberados al vendedor:', txHash);
// Estado del contrato ahora es 'released'
```

#### 4.4 Reembolsar al Comprador

```typescript
import { refundEscrow } from './payments';

// En caso de disputa o cancelación
// Puede ser firmado por vendedor, árbitro, o comprador (si expiró)
const txHash = await refundEscrow(contract.id, sellerKeypair);

console.log('Fondos reembolsados al comprador:', txHash);
// Estado del contrato ahora es 'refunded'
```

### Paso 5: API REST Endpoints

El sistema expone los siguientes endpoints REST:

#### Endpoints x402 y 8004

```bash
# Generar requisito de pago
POST /api/payments/x402
Content-Type: application/json

{
  "amount": "10",
  "asset": "XLM",
  "destination": "GXXX...",
  "message": "Pago para servicio premium"
}

# Validar pago
POST /api/payments/8004
Content-Type: application/json

{
  "paymentId": "pay_1234567890_abc123",
  "transactionHash": "abcdef1234567890..."
}

# Consultar estado de pago
GET /api/payments/status/{paymentId}
```

#### Endpoints de Escrow

```bash
# Crear escrow
POST /api/payments/escrow/create
Content-Type: application/json

{
  "buyer": "GBUYER...",
  "seller": "GSELLER...",
  "arbiter": "GARBITER...",
  "amount": "100",
  "asset": "XLM",
  "expirationDays": 30
}

# Financiar escrow
POST /api/payments/escrow/{escrowId}/fund
Content-Type: application/json

{
  "buyerSecretKey": "SBUYER..."
}

# Liberar fondos
POST /api/payments/escrow/{escrowId}/release
Content-Type: application/json

{
  "signerSecretKey": "SBUYER_OR_ARBITER..."
}

# Reembolsar fondos
POST /api/payments/escrow/{escrowId}/refund
Content-Type: application/json

{
  "signerSecretKey": "SSELLER_OR_ARBITER_OR_BUYER..."
}

# Consultar escrow
GET /api/payments/escrow/{escrowId}

# Listar escrows de un participante
GET /api/payments/escrow/list/{publicKey}
```

#### Endpoints Utilitarios

```bash
# Verificar transacción de pago
POST /api/payments/verify
Content-Type: application/json

{
  "transactionHash": "abc...",
  "destination": "GXXX...",
  "amount": "10",
  "asset": "XLM"
}

# Generar nuevo keypair (solo para testing)
POST /api/payments/keypair
```

### Paso 6: Integración con Moltbot

Las funciones de pago pueden integrarse con el sistema Moltbot existente:

#### 6.1 Crear Agente de Pagos

Configurar un agente de Moltbot que maneje pagos:

```json
{
  "agents": {
    "payment_agent": {
      "model": {
        "primary": "openai/llama-3.3-70b-versatile"
      },
      "system_prompt": "Eres un agente de pagos que ayuda a los usuarios a realizar transacciones seguras usando Stellar y escrow trustless.",
      "skills": ["payment_processing", "escrow_management"]
    }
  }
}
```

#### 6.2 Comandos de Pago para el Agente

El agente puede utilizar las funciones de pago para:
- Generar requisitos de pago (x402)
- Validar transacciones (8004)
- Crear y gestionar contratos de escrow
- Verificar estado de pagos

## Casos de Uso

### Caso 1: Servicio de Suscripción

```typescript
// Usuario solicita acceso a contenido premium
app.get('/premium', requirePayment('5', 'XLM', PREMIUM_ADDRESS), async (c) => {
  return c.json({ video: 'premium_content.mp4' });
});

// El middleware x402 rechaza la solicitud sin pago válido
// Cliente recibe 402 con detalles de pago
// Cliente realiza pago en Stellar
// Cliente envía transactionHash para validación con 8004
// Si validado, cliente puede acceder con header X-Payment-Id
```

### Caso 2: Marketplace con Escrow

```typescript
// Comprador y vendedor acuerdan términos
const escrow = await createEscrow({
  buyer: buyerAddress,
  seller: sellerAddress,
  arbiter: platformAddress,
  amount: '1000',
  expirationDays: 7
});

// Comprador deposita fondos
await fundEscrow(escrow.id, buyerKeypair);

// Vendedor entrega producto/servicio
// Comprador confirma y libera fondos
await releaseEscrow(escrow.id, buyerKeypair);

// O en caso de disputa, árbitro decide
await releaseEscrow(escrow.id, arbiterKeypair);
// o
await refundEscrow(escrow.id, arbiterKeypair);
```

### Caso 3: Pago por API Calls

```typescript
app.post('/api/expensive-operation', async (c) => {
  // Verificar que el pago ha sido validado
  const paymentId = c.req.header('X-Payment-Id');
  const status = getPaymentStatus(paymentId);
  
  if (!status || status.status !== 'confirmed') {
    const requirement = x402('0.1', 'XLM', API_ADDRESS);
    return c.json(requirement, 402);
  }
  
  // Procesar operación costosa
  const result = await expensiveOperation();
  return c.json(result);
});
```

## Seguridad

### Consideraciones Importantes

1. **Manejo de Claves Privadas:**
   - NUNCA almacenar claves privadas en código
   - Usar variables de entorno para claves sensibles
   - En producción, usar servicios de gestión de claves (KMS)
   - Los endpoints actuales que aceptan `secretKey` son solo para demostración

2. **Validación de Transacciones:**
   - Siempre verificar monto, destino y activo
   - Implementar rate limiting para endpoints de pago
   - Usar confirmations > 1 para montos grandes

3. **Escrow:**
   - Validar todas las firmas
   - Implementar timeouts apropiados
   - Considerar multi-firma para árbitros
   - Auditar cambios de estado

4. **Red Stellar:**
   - Usar testnet para desarrollo
   - Verificar saldos antes de transacciones
   - Manejar errores de red apropiadamente

## Testing

### Testing en Red Testnet

```bash
# 1. Crear cuenta de prueba en Stellar Testnet
curl https://friendbot.stellar.org?addr=YOUR_PUBLIC_KEY

# 2. Configurar .dev.vars con testnet
STELLAR_NETWORK=testnet

# 3. Ejecutar tests
npm test
```

### Ejemplo de Test de Integración

```typescript
import { test, expect } from 'vitest';
import { createEscrow, fundEscrow } from '../src/payments/escrow';

test('Escrow workflow completo', async () => {
  // Crear escrow
  const contract = await createEscrow({
    buyer: 'GB...',
    seller: 'GS...',
    arbiter: 'GA...',
    amount: '10'
  });
  
  expect(contract.state).toBe('created');
  
  // Financiar
  const txHash = await fundEscrow(contract.id, buyerKeypair);
  expect(txHash).toBeDefined();
  
  // Verificar estado
  const updated = getEscrow(contract.id);
  expect(updated.state).toBe('funded');
});
```

## Deployment

### Paso 1: Build

```bash
npm run build
```

### Paso 2: Configurar Secrets en Producción

```bash
# Configurar red Stellar
npx wrangler secret put STELLAR_NETWORK
# Ingresar: mainnet

# Mantener secrets existentes
npx wrangler secret put OPENAI_API_KEY
npx wrangler secret put MOLTBOT_GATEWAY_TOKEN
```

### Paso 3: Deploy

```bash
npm run deploy
```

## Monitoreo y Mantenimiento

### Limpieza de Pagos Antiguos

```typescript
import { cleanupOldPayments } from './payments';

// Ejecutar periódicamente (ej: cron job)
setInterval(() => {
  cleanupOldPayments();
}, 24 * 60 * 60 * 1000); // Una vez al día
```

### Logs y Debugging

```bash
# Ver logs en tiempo real
npx wrangler tail

# Habilitar debug routes
# En .dev.vars: DEBUG_ROUTES=true
# Acceder a /debug/processes para ver estado
```

## Próximos Pasos

1. **Almacenamiento Persistente:** Reemplazar Map en memoria con Durable Objects o KV storage
2. **Webhooks:** Implementar notificaciones de eventos de pago
3. **Multi-Asset:** Soporte completo para assets personalizados de Stellar
4. **UI de Escrow:** Crear interfaz web para gestión de escrow
5. **Métricas:** Implementar tracking de pagos y analytics
6. **Contratos Inteligentes:** Explorar Soroban para lógica de escrow más compleja

## Soporte

Para preguntas o problemas:
- Revisar documentación de Stellar: https://developers.stellar.org/
- Issues en GitHub: https://github.com/leocagli/Open-Stellar/issues
- Documentación de Moltbot: https://docs.molt.bot/

## Referencias

- [Stellar SDK Documentation](https://stellar.github.io/js-stellar-sdk/)
- [HTTP 402 Payment Required](https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/402)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Moltbot Gateway](https://molt.bot/)
