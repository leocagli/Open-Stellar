# Guía de Implementación: Funciones x402 y 8004 con Escrow Trusstles

## Descripción General

Esta guía proporciona instrucciones paso a paso para implementar y utilizar las funciones x402 (HTTP 402 Payment Required) y 8004 (procesamiento de pagos personalizado) en el sistema Open-Stellar, con soporte completo para manejar pagos mediante el mecanismo de escrow Trusstles.

## Índice

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Configuración Inicial](#configuración-inicial)
3. [Implementación de x402](#implementación-de-x402)
4. [Implementación de 8004](#implementación-de-8004)
5. [Sistema de Escrow Trusstles](#sistema-de-escrow-trusstles)
6. [Ejemplos Completos](#ejemplos-completos)
7. [Resolución de Problemas](#resolución-de-problemas)

---

## Arquitectura del Sistema

### Componentes Principales

```
┌─────────────────────────────────────────────────────────┐
│                    Open-Stellar Worker                   │
│  ┌────────────────────────────────────────────────────┐  │
│  │             Sistema de Pagos                       │  │
│  │  ┌──────────┐  ┌──────────┐  ┌─────────────────┐  │  │
│  │  │   x402   │  │   8004   │  │ Trusstles Escrow│  │  │
│  │  └──────────┘  └──────────┘  └─────────────────┘  │  │
│  └────────────────────────────────────────────────────┘  │
│                           │                              │
│                           ▼                              │
│  ┌────────────────────────────────────────────────────┐  │
│  │          Integración Stellar SDK                   │  │
│  └────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
              ┌────────────────────────┐
              │   Red Stellar          │
              │   (Testnet/Mainnet)    │
              └────────────────────────┘
```

### Flujo de Datos

1. **Cliente** → Solicita recurso protegido
2. **x402 Handler** → Verifica pago o retorna 402
3. **Cliente** → Realiza pago en Stellar
4. **8004 Processor** → Procesa y valida el pago
5. **Escrow System** → Maneja retención de fondos (opcional)
6. **Sistema** → Otorga acceso al recurso

---

## Configuración Inicial

### Paso 1: Instalar Dependencias

Las dependencias ya están instaladas en Open-Stellar:

```bash
npm install  # Instala @stellar/stellar-sdk y otras dependencias
```

### Paso 2: Configurar Variables de Entorno

Edita `.dev.vars`:

```bash
# Red Stellar (testnet para desarrollo, mainnet para producción)
STELLAR_NETWORK=testnet

# Tu clave pública para recibir pagos
STELLAR_PAYEE_PUBLIC_KEY=GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Opcional: Habilitar rutas de debug
DEBUG_ROUTES=true
```

### Paso 3: Verificar Instalación

```bash
npm run typecheck  # Verifica que todo compile
npm test          # Ejecuta las pruebas
```

---

## Implementación de x402

### ¿Qué es x402?

x402 es una implementación del código de estado HTTP 402 "Payment Required" que permite proteger recursos y requerir pago antes de otorgar acceso.

### Paso 1: Proteger un Recurso

```typescript
import { Hono } from 'hono';
import { requirePayment } from './payments';

const app = new Hono();

// Proteger contenido premium - requiere 10 XLM
app.get(
  '/contenido-premium',
  requirePayment(
    { amount: '10', asset: { code: 'XLM' } },
    process.env.STELLAR_PAYEE_PUBLIC_KEY || '',
    { description: 'Acceso a contenido premium por 30 días' }
  ),
  (c) => c.json({ 
    contenido: 'Este es el contenido premium exclusivo',
    mensaje: '¡Bienvenido, usuario premium!'
  })
);
```

### Paso 2: Flujo del Cliente

#### 2.1 Solicitar Recurso (Sin Pago)

```typescript
const response = await fetch('http://localhost:8789/contenido-premium');

if (response.status === 402) {
  const data = await response.json();
  console.log('Pago requerido:', data);
  
  // Respuesta incluye:
  // - payment.id: ID de solicitud de pago
  // - payment.amount: Cantidad a pagar
  // - payment.payee: Dirección de destino
  // - instructions: Pasos a seguir
}
```

#### 2.2 Realizar Pago en Stellar

```typescript
// El usuario debe enviar el pago usando su wallet Stellar
// O puedes procesarlo programáticamente:

import { process8004Payment, loadAccount } from './payments';

const usuarioAccount = loadAccount('CLAVE_SECRETA_DEL_USUARIO');

const resultado = await process8004Payment(
  usuarioAccount,
  data.payment.payee,  // Dirección del beneficiario
  data.payment.amount, // Cantidad requerida
  'testnet',
  { memo: `Pago: ${data.payment.id}` }
);

if (resultado.code === 8004) {
  console.log('Pago enviado:', resultado.transactionHash);
}
```

#### 2.3 Verificar Pago

```typescript
const verificacion = await fetch('http://localhost:8789/api/payments/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    requestId: data.payment.id,
    transactionHash: resultado.transactionHash,
    fromAddress: usuarioAccount.publicKey,
    network: 'testnet'
  })
});

const { paymentToken } = await verificacion.json();
```

#### 2.4 Acceder al Recurso

```typescript
// Opción 1: Con header
const contenido = await fetch('http://localhost:8789/contenido-premium', {
  headers: { 'X-Payment-Token': paymentToken }
});

// Opción 2: Con query parameter
const contenido2 = await fetch(
  `http://localhost:8789/contenido-premium?paymentToken=${paymentToken}`
);

const data = await contenido.json();
console.log('Contenido premium:', data);
```

---

## Implementación de 8004

### ¿Qué es 8004?

8004 es un sistema de procesamiento de pagos personalizado con códigos de error específicos para diferentes situaciones.

### Códigos de Resultado

- **8004** - Pago procesado exitosamente
- **8001** - Transacción de pago inválida
- **8002** - Fondos insuficientes
- **8003** - Pago expirado
- **8005** - Escrow no encontrado
- **8006** - Estado de escrow inválido
- **8007** - No autorizado
- **8008** - Error de red

### Paso 1: Procesar Pago Directo

```typescript
import { 
  process8004Payment, 
  get8004ResultMessage,
  PAYMENT_CODE_8004_SUCCESS 
} from './payments';

async function procesarPago(
  cuentaOrigen: StellarAccount,
  direccionDestino: string,
  cantidad: string
) {
  const resultado = await process8004Payment(
    cuentaOrigen,
    direccionDestino,
    { amount: cantidad, asset: { code: 'XLM' } },
    'testnet',
    {
      memo: 'Factura #12345',
      verifyBalance: true  // Verifica saldo antes de enviar
    }
  );

  console.log('Código:', resultado.code);
  console.log('Mensaje:', get8004ResultMessage(resultado.code));

  if (resultado.code === PAYMENT_CODE_8004_SUCCESS) {
    console.log('✓ Pago exitoso');
    console.log('Hash de transacción:', resultado.transactionHash);
    return resultado.transactionHash;
  } else {
    console.error('✗ Pago fallido:', resultado.message);
    throw new Error(resultado.message);
  }
}
```

### Paso 2: Verificar Transacción

```typescript
import { verify8004Payment } from './payments';

async function verificarTransaccion(
  hashTransaccion: string,
  direccionOrigen: string,
  direccionDestino: string,
  cantidad: string
) {
  const resultado = await verify8004Payment(
    hashTransaccion,
    direccionOrigen,
    direccionDestino,
    { amount: cantidad, asset: { code: 'XLM' } },
    'testnet'
  );

  if (resultado.code === PAYMENT_CODE_8004_SUCCESS) {
    console.log('✓ Transacción verificada');
    return true;
  } else {
    console.error('✗ Verificación falló:', resultado.message);
    return false;
  }
}
```

### Paso 3: Procesar Pagos por Lotes

```typescript
import { process8004BatchPayments } from './payments';

async function procesarPagosMultiples(cuentaOrigen: StellarAccount) {
  const pagos = [
    {
      from: cuentaOrigen,
      to: 'DESTINATARIO_1',
      amount: { amount: '50', asset: { code: 'XLM' } },
      memo: 'Pago 1 de 3'
    },
    {
      from: cuentaOrigen,
      to: 'DESTINATARIO_2',
      amount: { amount: '75', asset: { code: 'XLM' } },
      memo: 'Pago 2 de 3'
    },
    {
      from: cuentaOrigen,
      to: 'DESTINATARIO_3',
      amount: { amount: '100', asset: { code: 'XLM' } },
      memo: 'Pago 3 de 3'
    }
  ];

  const resultados = await process8004BatchPayments(pagos, 'testnet');

  resultados.forEach((resultado, indice) => {
    console.log(`Pago ${indice + 1}:`, get8004ResultMessage(resultado.code));
    if (resultado.code === PAYMENT_CODE_8004_SUCCESS) {
      console.log('  Hash:', resultado.transactionHash);
    }
  });
}
```

---

## Sistema de Escrow Trusstles

### ¿Qué es Trusstles Escrow?

Un sistema de escrow sin confianza (trustless) que permite:
- Retener fondos de forma segura entre dos partes
- Resolución de disputas con árbitro opcional
- Reembolso automático al expirar
- Liberación condicional basada en criterios predefinidos

### Paso 1: Crear y Fondear Escrow

```typescript
import { createEscrow, fundEscrow, loadAccount } from './payments';

async function crearEscrow() {
  // 1. Crear escrow
  const { escrow, account: cuentaEscrow } = await createEscrow(
    {
      payer: 'CLAVE_PUBLICA_PAGADOR',
      payee: 'CLAVE_PUBLICA_BENEFICIARIO',
      arbiter: 'CLAVE_PUBLICA_ARBITRO'  // Opcional
    },
    { amount: '1000', asset: { code: 'XLM' } },
    'testnet',
    {
      expiresInMs: 7 * 24 * 60 * 60 * 1000,  // 7 días
      requireArbiterApproval: true,
      autoReleaseAfter: Date.now() + (3 * 24 * 60 * 60 * 1000)  // Auto-liberar en 3 días
    }
  );

  console.log('ID de Escrow:', escrow.id);
  console.log('Cuenta de Escrow:', cuentaEscrow.publicKey);
  console.log('⚠️ Guardar cuentaEscrow.secretKey de forma segura!');

  // 2. Fondear escrow (el pagador envía fondos)
  const cuentaPagador = loadAccount('CLAVE_SECRETA_PAGADOR');
  
  const { escrow: escrowFondeado, result } = await fundEscrow(
    escrow,
    cuentaEscrow,
    cuentaPagador,
    'testnet'
  );

  if (result.success) {
    console.log('✓ Escrow fondeado exitosamente');
    console.log('Hash de transacción:', result.transactionHash);
    console.log('Estado:', escrowFondeado.state);  // 'funded'
  }

  return { escrow: escrowFondeado, cuentaEscrow };
}
```

### Paso 2: Liberar Fondos (Completar Pago)

```typescript
import { releaseEscrow } from './payments';

async function liberarEscrow(
  escrow: EscrowConfig,
  cuentaEscrow: StellarAccount
) {
  // Requiere: firma del beneficiario + firma del árbitro (si se requiere)
  const cuentaBeneficiario = loadAccount('CLAVE_SECRETA_BENEFICIARIO');
  const cuentaArbitro = loadAccount('CLAVE_SECRETA_ARBITRO');

  const { escrow: escrowLiberado, result } = await releaseEscrow(
    escrow,
    cuentaEscrow,
    [cuentaBeneficiario, cuentaArbitro],
    'testnet'
  );

  if (result.success) {
    console.log('✓ Fondos liberados al beneficiario');
    console.log('Hash de transacción:', result.transactionHash);
    console.log('Estado final:', escrowLiberado.state);  // 'released'
  }
}
```

### Paso 3: Reembolsar Fondos

```typescript
import { refundEscrow } from './payments';

async function reembolsarEscrow(
  escrow: EscrowConfig,
  cuentaEscrow: StellarAccount
) {
  // Reembolso puede ocurrir si:
  // - El escrow expiró
  // - Ambas partes están de acuerdo
  // - El árbitro decide

  const cuentaPagador = loadAccount('CLAVE_SECRETA_PAGADOR');
  const cuentaBeneficiario = loadAccount('CLAVE_SECRETA_BENEFICIARIO');

  const { escrow: escrowReembolsado, result } = await refundEscrow(
    escrow,
    cuentaEscrow,
    [cuentaPagador, cuentaBeneficiario],  // Ambas partes de acuerdo
    'testnet',
    'Servicio no entregado según lo acordado'
  );

  if (result.success) {
    console.log('✓ Fondos reembolsados al pagador');
    console.log('Hash de transacción:', result.transactionHash);
    console.log('Estado final:', escrowReembolsado.state);  // 'refunded' o 'expired'
  }
}
```

### Paso 4: Verificar Estado del Escrow

```typescript
import { getEscrowStatus, isEscrowExpired, canAutoRelease } from './payments';

function verificarEstadoEscrow(escrow: EscrowConfig) {
  const estado = getEscrowStatus(escrow);

  console.log('Estado actual:', estado.state);
  console.log('¿Puede liberarse?', estado.canRelease);
  console.log('¿Puede reembolsarse?', estado.canRefund);
  console.log('¿Está expirado?', estado.isExpired);
  console.log('¿Auto-liberación disponible?', estado.canAutoRelease);

  if (estado.isExpired) {
    console.log('⚠️ Escrow expirado - reembolso automático disponible');
  }

  if (estado.canAutoRelease) {
    console.log('✓ Escrow elegible para auto-liberación');
  }

  return estado;
}
```

---

## Ejemplos Completos

### Ejemplo 1: Sistema de Suscripción Premium

```typescript
import { Hono } from 'hono';
import { requirePayment, generateKeypair, createTestnetAccount } from './payments';

const app = new Hono();

// Configurar beneficiario para pagos
const beneficiario = generateKeypair();
await createTestnetAccount(beneficiario.publicKey);

console.log('Beneficiario:', beneficiario.publicKey);
console.log('Para recibir pagos en:', beneficiario.publicKey);

// Contenido gratuito
app.get('/contenido-gratis', (c) => {
  return c.json({ mensaje: 'Este contenido es gratuito para todos' });
});

// Contenido que requiere pago
app.get(
  '/suscripcion-mensual',
  requirePayment(
    { amount: '50', asset: { code: 'XLM' } },
    beneficiario.publicKey,
    { description: 'Suscripción mensual - Acceso ilimitado' }
  ),
  (c) => {
    return c.json({
      mensaje: '¡Bienvenido, suscriptor!',
      beneficios: [
        'Acceso ilimitado a todo el contenido',
        'Sin anuncios',
        'Soporte prioritario',
        'Descargas offline'
      ]
    });
  }
);
```

### Ejemplo 2: Marketplace con Escrow

```typescript
import {
  process8004EscrowPayment,
  complete8004EscrowPayment,
  loadAccount,
  PAYMENT_CODE_8004_SUCCESS
} from './payments';

async function crearOrdenConEscrow(
  compradorSecretKey: string,
  vendedorPublicKey: string,
  arbitroPublicKey: string,
  precioProducto: string
) {
  const comprador = loadAccount(compradorSecretKey);

  // 1. Crear escrow para la compra
  console.log('Creando escrow para orden...');
  const resultado = await process8004EscrowPayment(
    comprador,
    vendedorPublicKey,
    { amount: precioProducto, asset: { code: 'XLM' } },
    'testnet',
    {
      arbiter: arbitroPublicKey,
      expiresInMs: 30 * 24 * 60 * 60 * 1000,  // 30 días
      requireArbiterApproval: true,
      autoReleaseAfter: Date.now() + (14 * 24 * 60 * 60 * 1000)  // Auto-liberar en 14 días
    }
  );

  if (resultado.code === PAYMENT_CODE_8004_SUCCESS) {
    console.log('✓ Escrow creado y fondeado');
    console.log('ID de Escrow:', resultado.escrowId);
    console.log('Hash de transacción:', resultado.transactionHash);
    
    return {
      escrowId: resultado.escrowId,
      status: 'awaiting_delivery'
    };
  } else {
    throw new Error(`Error al crear escrow: ${resultado.message}`);
  }
}

// Después de que el comprador confirma recepción
async function confirmarEntrega(
  escrow: EscrowConfig,
  cuentaEscrow: StellarAccount,
  vendedorSecretKey: string,
  arbitroSecretKey: string
) {
  const vendedor = loadAccount(vendedorSecretKey);
  const arbitro = loadAccount(arbitroSecretKey);

  console.log('Liberando fondos al vendedor...');
  const resultado = await complete8004EscrowPayment(
    escrow,
    cuentaEscrow,
    [vendedor, arbitro],
    'testnet'
  );

  if (resultado.code === PAYMENT_CODE_8004_SUCCESS) {
    console.log('✓ Pago completado - fondos entregados al vendedor');
    return { status: 'completed', transactionHash: resultado.transactionHash };
  } else {
    throw new Error(`Error al completar pago: ${resultado.message}`);
  }
}
```

### Ejemplo 3: API de Generación de Claves

```typescript
app.post('/api/generar-cuenta-testnet', async (c) => {
  try {
    const { financiar = true } = await c.req.json();

    // Generar nuevo par de claves
    const keypair = generateKeypair();

    let resultado = {
      publicKey: keypair.publicKey,
      secretKey: keypair.secretKey,
      financiada: false,
      advertencia: '⚠️ Guarda tu clave secreta de forma segura. ¡No la compartas!'
    };

    // Financiar cuenta en testnet si se solicita
    if (financiar) {
      const fundResult = await createTestnetAccount(keypair.publicKey);
      if (fundResult.success) {
        resultado.financiada = true;
        resultado.saldoInicial = '10000 XLM (testnet)';
      }
    }

    return c.json(resultado);
  } catch (error) {
    return c.json(
      { error: error instanceof Error ? error.message : 'Error al generar cuenta' },
      500
    );
  }
});
```

---

## Resolución de Problemas

### Problema: "Account not found"

**Causa:** La cuenta no existe en la red Stellar.

**Solución:**
```typescript
// Para testnet, crear y financiar cuenta
const resultado = await createTestnetAccount(publicKey);

// Para mainnet, la cuenta debe ser financiada manualmente
// enviando al menos 1 XLM desde otra cuenta existente
```

### Problema: "Insufficient funds"

**Causa:** La cuenta no tiene suficiente saldo para la transacción.

**Solución:**
```typescript
// Verificar saldo antes de enviar
const saldo = await getAccountBalance(publicKey, 'native', 'testnet');
console.log('Saldo disponible:', saldo, 'XLM');

// Asegurarse de dejar al menos 1 XLM para la reserva mínima
```

### Problema: "Payment verification failed"

**Causa:** Los parámetros de verificación no coinciden con la transacción real.

**Solución:**
```typescript
// Verificar que los parámetros coincidan exactamente
await verifyPayment(
  transactionHash,
  senderPublicKey,      // ← Debe coincidir con el remitente real
  recipientPublicKey,   // ← Debe coincidir con el destinatario real
  { amount: '100', asset: { code: 'XLM' } },  // ← Cantidad y activo exactos
  'testnet'
);
```

### Problema: "Escrow expired"

**Causa:** Se intentó liberar un escrow después de su fecha de expiración.

**Solución:**
```typescript
// Verificar estado antes de operar
const estado = getEscrowStatus(escrow);

if (estado.isExpired) {
  console.log('Escrow expirado - solo se puede reembolsar');
  // Proceder con refund en lugar de release
  await refundEscrow(escrow, escrowAccount, signers, 'testnet');
} else if (estado.canRelease) {
  // Proceder con release normal
  await releaseEscrow(escrow, escrowAccount, signers, 'testnet');
}
```

### Problema: Código 8008 - "Network error"

**Causa:** Error de conexión con la red Stellar.

**Solución:**
```typescript
// Implementar reintentos con exponential backoff
async function procesarConReintentos(maxReintentos = 3) {
  for (let intento = 0; intento < maxReintentos; intento++) {
    try {
      const resultado = await process8004Payment(/* ... */);
      if (resultado.code === PAYMENT_CODE_8004_SUCCESS) {
        return resultado;
      }
    } catch (error) {
      if (intento === maxReintentos - 1) throw error;
      await new Promise(resolve => 
        setTimeout(resolve, Math.pow(2, intento) * 1000)
      );
    }
  }
}
```

---

## Próximos Pasos

1. **Pruebas en Testnet** - Probar todos los flujos en testnet antes de producción
2. **Implementar Almacenamiento** - Usar R2 o Durable Objects para persistir estado de pagos y escrows
3. **Monitoreo** - Implementar logging y alertas para transacciones
4. **Seguridad** - Revisar y aplicar mejores prácticas de seguridad
5. **Documentación** - Documentar flujos específicos de tu aplicación

## Recursos Adicionales

- [Documentación de Pagos (Inglés)](./PAYMENTS.md)
- [Documentación de Stellar](https://developers.stellar.org)
- [Ejemplos de Stellar SDK](https://github.com/stellar/js-stellar-sdk/tree/master/docs)
- [Stellar Laboratory](https://laboratory.stellar.org) - Herramienta para probar transacciones

---

**¿Necesitas ayuda?** Abre un issue en GitHub: https://github.com/leocagli/Open-Stellar/issues
