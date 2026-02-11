/**
 * Stellar Integration Module
 * Main entry point for Stellar blockchain functionality
 */

// Configuration
export { STELLAR_CONFIG, type StellarNetwork } from './config';

// Client
export { StellarClient, stellarClient } from './client';

// Services
export { 
  FreighterService, 
  freighterService,
  type FreighterWalletState 
} from './services/freighter';

export { 
  EscrowService, 
  escrowService,
  type EscrowOptions,
  type EscrowDetails 
} from './services/escrow';

export { 
  DexService, 
  dexService,
  type OrderDetails,
  type CreateOrderOptions 
} from './services/dex';

export { 
  BotRegistrationService, 
  botRegistrationService,
  type BotRegistration,
  type RegisterBotOptions 
} from './services/bot-registration';

// Re-export commonly used Stellar SDK types
export { Asset, Keypair, Transaction } from '@stellar/stellar-sdk';
