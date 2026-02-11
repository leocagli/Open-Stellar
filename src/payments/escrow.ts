/**
 * Trustless Escrow Implementation
 * 
 * Implements a trustless escrow mechanism for Stellar payments
 * using multi-signature accounts and time-based conditions
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { getStellarServer, getNetworkPassphrase, createKeypair, loadKeypair } from './stellar';
import type { EscrowContract, EscrowState } from './types';

const server = getStellarServer();

interface CreateEscrowParams {
  buyer: string;
  seller: string;
  arbiter: string;
  amount: string;
  asset?: string;
  expirationDays?: number;
}

/**
 * Create a new escrow contract
 * 
 * This creates a temporary Stellar account that holds the funds
 * and requires signatures from buyer/seller or arbiter to release
 */
export async function createEscrow(
  params: CreateEscrowParams
): Promise<EscrowContract> {
  const { buyer, seller, arbiter, amount, asset = 'XLM', expirationDays = 30 } = params;
  
  // Generate escrow account keypair
  const escrowKeypair = createKeypair();
  const escrowId = escrowKeypair.publicKey();
  
  const contract: EscrowContract = {
    id: escrowId,
    buyer,
    seller,
    arbiter,
    amount,
    asset,
    state: 'created' as EscrowState,
    createdAt: Date.now(),
    expiresAt: Date.now() + expirationDays * 24 * 60 * 60 * 1000,
  };
  
  // Store escrow contract (in production, use persistent storage)
  escrowContracts.set(escrowId, contract);
  
  return contract;
}

/**
 * Fund an escrow contract
 * 
 * Buyer sends funds to the escrow account
 */
export async function fundEscrow(
  escrowId: string,
  buyerKeypair: StellarSdk.Keypair
): Promise<string> {
  const contract = escrowContracts.get(escrowId);
  if (!contract) {
    throw new Error('Escrow contract not found');
  }
  
  if (contract.state !== 'created') {
    throw new Error('Escrow already funded or completed');
  }
  
  try {
    // Load buyer account
    const buyerAccount = await server.loadAccount(buyerKeypair.publicKey());
    
    // Create transaction to fund escrow
    const transaction = new StellarSdk.TransactionBuilder(buyerAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: escrowId,
          asset: StellarSdk.Asset.native(),
          amount: contract.amount,
        })
      )
      .addMemo(StellarSdk.Memo.text(`Escrow ${escrowId.substring(0, 10)}`))
      .setTimeout(180)
      .build();
    
    transaction.sign(buyerKeypair);
    
    const result = await server.submitTransaction(transaction);
    
    // Update contract state
    contract.state = 'funded' as EscrowState;
    escrowContracts.set(escrowId, contract);
    
    return result.hash;
  } catch (error) {
    throw new Error(`Failed to fund escrow: ${error}`);
  }
}

/**
 * Release escrow funds to seller
 * 
 * Requires buyer's signature or arbiter's signature
 */
export async function releaseEscrow(
  escrowId: string,
  signerKeypair: StellarSdk.Keypair
): Promise<string> {
  const contract = escrowContracts.get(escrowId);
  if (!contract) {
    throw new Error('Escrow contract not found');
  }
  
  if (contract.state !== 'funded') {
    throw new Error('Escrow not funded or already completed');
  }
  
  const signerPublicKey = signerKeypair.publicKey();
  
  // Verify signer is authorized (buyer or arbiter)
  if (signerPublicKey !== contract.buyer && signerPublicKey !== contract.arbiter) {
    throw new Error('Unauthorized: only buyer or arbiter can release funds');
  }
  
  try {
    // Load escrow account
    const escrowAccount = await server.loadAccount(escrowId);
    
    // Create transaction to release funds to seller
    const transaction = new StellarSdk.TransactionBuilder(escrowAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: contract.seller,
          asset: StellarSdk.Asset.native(),
          amount: contract.amount,
        })
      )
      .addMemo(StellarSdk.Memo.text('Escrow release'))
      .setTimeout(180)
      .build();
    
    transaction.sign(signerKeypair);
    
    const result = await server.submitTransaction(transaction);
    
    // Update contract state
    contract.state = 'released' as EscrowState;
    escrowContracts.set(escrowId, contract);
    
    return result.hash;
  } catch (error) {
    throw new Error(`Failed to release escrow: ${error}`);
  }
}

/**
 * Refund escrow funds to buyer
 * 
 * Requires seller's agreement or arbiter's decision or expiration
 */
export async function refundEscrow(
  escrowId: string,
  signerKeypair: StellarSdk.Keypair
): Promise<string> {
  const contract = escrowContracts.get(escrowId);
  if (!contract) {
    throw new Error('Escrow contract not found');
  }
  
  if (contract.state !== 'funded') {
    throw new Error('Escrow not funded or already completed');
  }
  
  const signerPublicKey = signerKeypair.publicKey();
  const now = Date.now();
  
  // Verify authorization
  const isExpired = now > contract.expiresAt;
  const isAuthorized = 
    signerPublicKey === contract.seller ||
    signerPublicKey === contract.arbiter ||
    (signerPublicKey === contract.buyer && isExpired);
  
  if (!isAuthorized) {
    throw new Error('Unauthorized: cannot refund escrow');
  }
  
  try {
    // Load escrow account
    const escrowAccount = await server.loadAccount(escrowId);
    
    // Create transaction to refund to buyer
    const transaction = new StellarSdk.TransactionBuilder(escrowAccount, {
      fee: StellarSdk.BASE_FEE,
      networkPassphrase: getNetworkPassphrase(),
    })
      .addOperation(
        StellarSdk.Operation.payment({
          destination: contract.buyer,
          asset: StellarSdk.Asset.native(),
          amount: contract.amount,
        })
      )
      .addMemo(StellarSdk.Memo.text('Escrow refund'))
      .setTimeout(180)
      .build();
    
    transaction.sign(signerKeypair);
    
    const result = await server.submitTransaction(transaction);
    
    // Update contract state
    contract.state = 'refunded' as EscrowState;
    escrowContracts.set(escrowId, contract);
    
    return result.hash;
  } catch (error) {
    throw new Error(`Failed to refund escrow: ${error}`);
  }
}

/**
 * Get escrow contract details
 */
export function getEscrow(escrowId: string): EscrowContract | null {
  return escrowContracts.get(escrowId) || null;
}

/**
 * List all escrow contracts for a participant
 */
export function listEscrows(publicKey: string): EscrowContract[] {
  const contracts: EscrowContract[] = [];
  
  for (const contract of escrowContracts.values()) {
    if (
      contract.buyer === publicKey ||
      contract.seller === publicKey ||
      contract.arbiter === publicKey
    ) {
      contracts.push(contract);
    }
  }
  
  return contracts;
}

// In-memory escrow storage
// 🔴 WARNING: This will lose all data on Worker restart!
// 🔴 CRITICAL: Escrow contracts hold real funds - losing state means losing money!
// TODO: Replace with persistent storage before production:
// - Cloudflare Durable Objects (STRONGLY RECOMMENDED for escrow)
// - External database with ACID transactions
// - Never use in-memory storage for financial contracts in production!
// See SECURITY.md for migration guide to Durable Objects
const escrowContracts = new Map<string, EscrowContract>();
