/**
 * Bot Registration Service
 * Handles bot registration and authentication using Freighter wallet
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { freighterService, FreighterService } from './freighter';
import { stellarClient } from '../client';

export interface BotRegistration {
  id: string;
  publicKey: string;
  name: string;
  description?: string;
  capabilities: string[];
  registeredAt: Date;
  verified: boolean;
  signature?: string;
}

export interface RegisterBotOptions {
  name: string;
  description?: string;
  capabilities: string[];
}

export class BotRegistrationService {
  private registeredBots: Map<string, BotRegistration> = new Map();

  /**
   * Register a new bot with wallet signature
   */
  async registerBot(options: RegisterBotOptions): Promise<BotRegistration> {
    const { name, description, capabilities } = options;

    // Ensure wallet is connected
    const publicKey = freighterService.getPublicKey();
    if (!publicKey) {
      throw new Error('Wallet not connected. Please connect Freighter wallet first.');
    }

    // Validate bot name
    if (!name || name.trim().length === 0) {
      throw new Error('Bot name is required');
    }

    if (capabilities.length === 0) {
      throw new Error('At least one capability is required');
    }

    // Check if bot already registered
    if (this.registeredBots.has(publicKey)) {
      throw new Error('Bot already registered with this wallet');
    }

    // Create registration message
    const registrationMessage = JSON.stringify({
      action: 'register_bot',
      name,
      description,
      capabilities,
      timestamp: Date.now(),
      publicKey,
    });

    // Sign the registration message with Freighter
    let signature: string;
    try {
      signature = await freighterService.signMessage(registrationMessage);
    } catch (error) {
      throw new Error(`Failed to sign registration: ${error}`);
    }

    // Create bot registration
    const botRegistration: BotRegistration = {
      id: this.generateBotId(publicKey, name),
      publicKey,
      name,
      description,
      capabilities,
      registeredAt: new Date(),
      verified: true,
      signature,
    };

    // Store registration
    this.registeredBots.set(publicKey, botRegistration);

    return botRegistration;
  }

  /**
   * Unregister a bot
   */
  async unregisterBot(publicKey: string): Promise<boolean> {
    if (!this.registeredBots.has(publicKey)) {
      throw new Error('Bot not found');
    }

    // Verify caller is the bot owner
    const walletPublicKey = freighterService.getPublicKey();
    if (walletPublicKey !== publicKey) {
      throw new Error('Only bot owner can unregister');
    }

    return this.registeredBots.delete(publicKey);
  }

  /**
   * Get bot registration details
   */
  getBotRegistration(publicKey: string): BotRegistration | null {
    return this.registeredBots.get(publicKey) || null;
  }

  /**
   * List all registered bots
   */
  listRegisteredBots(): BotRegistration[] {
    return Array.from(this.registeredBots.values());
  }

  /**
   * Update bot details
   */
  async updateBot(
    publicKey: string,
    updates: Partial<Pick<BotRegistration, 'name' | 'description' | 'capabilities'>>
  ): Promise<BotRegistration> {
    const bot = this.registeredBots.get(publicKey);
    if (!bot) {
      throw new Error('Bot not found');
    }

    // Verify caller is the bot owner
    const walletPublicKey = freighterService.getPublicKey();
    if (walletPublicKey !== publicKey) {
      throw new Error('Only bot owner can update');
    }

    // Update bot details
    const updatedBot: BotRegistration = {
      ...bot,
      ...updates,
    };

    this.registeredBots.set(publicKey, updatedBot);

    return updatedBot;
  }

  /**
   * Verify bot signature
   */
  verifyBotSignature(botId: string, signature: string, message: string): boolean {
    const bot = Array.from(this.registeredBots.values()).find(b => b.id === botId);
    if (!bot) {
      return false;
    }

    return FreighterService.verifySignature(
      bot.publicKey,
      message,
      signature
    );
  }

  /**
   * Check if account has sufficient balance for bot operations
   */
  async checkBotBalance(publicKey: string, minBalance: string = '10'): Promise<boolean> {
    try {
      const balances = await stellarClient.getBalance(publicKey);
      const xlmBalance = balances.find(b => b.asset === 'XLM');
      
      if (!xlmBalance) {
        return false;
      }

      return parseFloat(xlmBalance.balance) >= parseFloat(minBalance);
    } catch {
      return false;
    }
  }

  /**
   * Generate unique bot ID
   */
  private generateBotId(publicKey: string, name: string): string {
    const hash = StellarSdk.hash(Buffer.from(`${publicKey}:${name}`));
    return hash.toString('hex').substring(0, 16);
  }

  /**
   * Search bots by capability
   */
  searchBotsByCapability(capability: string): BotRegistration[] {
    return Array.from(this.registeredBots.values()).filter(bot =>
      bot.capabilities.includes(capability)
    );
  }

  /**
   * Get bot statistics
   */
  getBotStats(publicKey: string): {
    registered: boolean;
    uptime: number;
    transactions: number;
  } {
    const bot = this.registeredBots.get(publicKey);
    if (!bot) {
      return { registered: false, uptime: 0, transactions: 0 };
    }

    const uptime = Date.now() - bot.registeredAt.getTime();
    
    return {
      registered: true,
      uptime: Math.floor(uptime / 1000), // in seconds
      transactions: 0, // Would be tracked separately
    };
  }
}

// Export singleton instance
export const botRegistrationService = new BotRegistrationService();
