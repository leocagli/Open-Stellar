# Open Vinito - Multi-Chain DApp (BNB + Stellar)

Aplicacion Web3 con interfaz interactiva que conecta dos tracks blockchain:

- Track BNB (EVM) con MetaMask
- Track Stellar con Freighter

El objetivo es ofrecer una base clara para construir flujos multi-chain, ejecutar transacciones reales y sumar una capa de agentes AI para automatizacion, analisis y soporte operativo.

## Que resuelve este proyecto

- Conexion de wallets en dos ecosistemas distintos (EVM y Stellar)
- Validacion de red testnet y feedback en UI
- Envio real de transacciones BNB y XLM
- Base para integrar agentes con distintos modelos LLM y skills orientadas a servicios

## Stack tecnico

- Next.js + React + TypeScript
- Tailwind CSS + componentes UI
- wagmi + viem para track EVM (BNB)
- @stellar/freighter-api + @stellar/stellar-sdk para track Stellar

## Arquitectura general

1. Frontend
- Renderiza estado de conexion, red y acciones de transaccion.
- Expone controles para cada track (BNB y Stellar).

2. Capa Web3
- Track BNB: usa wagmi/viem para conectar MetaMask, cambiar red y enviar transacciones EVM.
- Track Stellar: usa Freighter SDK para firma y Stellar SDK para construir/enviar transacciones via Horizon.

3. Capa de Agentes AI (extensible)
- Orquesta flujos inteligentes sobre datos y acciones Web3.
- Puede usar diferentes modelos LLM segun tarea y costo/latencia.
- Puede cargar skills especializadas como servicios reutilizables.

## Guia de integracion: Front + Web3 + Agentes

### 1) Flujo base en Frontend

- El usuario conecta wallet desde la UI.
- La UI valida red activa.
- El usuario carga destino y monto.
- Se firma y envia transaccion.
- La UI muestra hash y estado.

### 2) Track BNB (EVM)

Que hace:
- Conexion con MetaMask por injected connector.
- Deteccion de chain id y switch a BNB Testnet (97).
- Envio de transaccion nativa BNB.

Que puede hacer un agente sobre este track:
- Verificador previo de riesgo (monto, destino, gas estimado).
- Monitor de confirmaciones y alertas de timeout/revert.
- Clasificador de actividad (pagos, pruebas QA, operaciones repetidas).

### 3) Track Stellar

Que hace:
- Conexion con Freighter.
- Verificacion de red Test SDF Network.
- Construccion de transaccion con Stellar SDK.
- Firma con Freighter y submit por Horizon.

Que puede hacer un agente sobre este track:
- Validacion de direccion destino y memo rules.
- Supervisar secuencia de cuenta y reintentos controlados.
- Alertar por falla de firma, red incorrecta o saldo insuficiente.

### 4) Capa de agentes con multiples LLM

Patron recomendado:
- Agente Router: decide que modelo usar por tipo de tarea.
- Agentes Especialistas: uno para EVM, otro para Stellar, otro para UX/soporte.
- Skills como herramientas: cada skill encapsula una capacidad concreta.

Ejemplo de reparto de modelos:
- Modelo rapido/economico: clasificacion, parsing, validaciones simples.
- Modelo avanzado: razonamiento complejo, planes de ejecucion multi-step, troubleshooting.

### 5) Skills como servicios

Una skill puede comportarse como micro-servicio de alto nivel.
Ejemplos utiles:

- Skill Risk Guard
   - Entrada: wallet, destino, monto, red
   - Salida: score de riesgo y recomendaciones

- Skill Tx Explainer
   - Entrada: hash y red
   - Salida: explicacion legible de lo que ocurrio on-chain

- Skill Policy Checker
   - Entrada: accion propuesta por usuario/agente
   - Salida: aprobada/rechazada segun reglas del proyecto

- Skill Ops Assistant
   - Entrada: errores operativos de wallet/RPC
   - Salida: pasos de resolucion y diagnostico

## Instalacion

1. Clonar repositorio

```bash
git clone https://github.com/leocagli/Open-Stellar.git
cd Open-Stellar
```

2. Instalar dependencias

```bash
pnpm install
```

3. Ejecutar en desarrollo

```bash
pnpm dev
```

## Configuracion de redes (testnet)

### BNB Smart Chain Testnet

- Chain ID: 97
- RPC: https://data-seed-prebsc-1-s1.binance.org:8545
- Explorer: https://testnet.bscscan.com

### Stellar Testnet

- Horizon: https://horizon-testnet.stellar.org
- Soroban RPC: https://soroban-testnet.stellar.org
- Passphrase: Test SDF Network ; September 2015
- Explorer: https://stellar.expert/explorer/testnet

## Uso rapido

1. Conectar MetaMask y Freighter
2. Confirmar que ambas wallets estan en testnet
3. Abrir panel de transacciones
4. Enviar BNB o XLM a direccion destino
5. Revisar hash en explorer

## Estructura clave

- app: layout y pagina principal
- components/wallet: provider, boton wallet y panel de transacciones
- lib/wallet-config.ts: configuracion wagmi para BNB
- lib/stellar-utils.ts: utilidades Freighter y envio Stellar
- lib/bnb-contracts.ts: helpers/ABIs para contratos EVM

## Roadmap sugerido

- Agregar historial persistente de transacciones
- Agregar simulacion pre-transaccion
- Agregar agente de monitoreo en tiempo real
- Agregar skill de cumplimiento/politicas por entorno

## Licencia

MIT
