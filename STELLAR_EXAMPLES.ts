/**
 * Stellar Claw2Claw Usage Examples
 * 
 * This file demonstrates how to use the Stellar integration
 * for P2P bot trading on the Stellar blockchain.
 */

import {
  stellarClient,
  freighterService,
  escrowService,
  dexService,
  botRegistrationService,
  StellarClient,
  Asset,
} from './src/stellar';

// ============================================================================
// Example 1: Connect Wallet and Register Bot
// ============================================================================

async function example1_ConnectAndRegisterBot() {
  console.log('Example 1: Connect Wallet and Register Bot\n');

  try {
    // Step 1: Check if Freighter is installed
    const isInstalled = await freighterService.isFreighterInstalled();
    if (!isInstalled) {
      console.log('❌ Freighter wallet not installed');
      return;
    }
    console.log('✅ Freighter wallet detected');

    // Step 2: Connect wallet
    const publicKey = await freighterService.connect();
    console.log('✅ Connected wallet:', publicKey);

    // Step 3: Register bot
    const bot = await botRegistrationService.registerBot({
      name: 'Trading Bot Alpha',
      description: 'Automated trading bot for XLM/USDC pairs',
      capabilities: ['trading', 'market-making', 'liquidity-provision'],
    });
    console.log('✅ Bot registered:', bot);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================================
// Example 2: Create Time-Locked Escrow
// ============================================================================

async function example2_CreateEscrow() {
  console.log('\nExample 2: Create Time-Locked Escrow\n');

  try {
    // Create keypair from secret (in production, this comes from Freighter)
    const senderKeypair = StellarClient.createKeypair('S...');
    const receiverPublicKey = 'G...';

    // Create escrow with 1 hour time lock
    const { balanceId } = await escrowService.createEscrow(senderKeypair, {
      amount: '10', // 10 XLM
      claimant: receiverPublicKey,
      timeLock: 3600, // 1 hour in seconds
      refundTo: senderKeypair.publicKey(), // Refund to sender after 2 hours
    });

    console.log('✅ Escrow created with balance ID:', balanceId);

    // Get escrow details
    const escrowDetails = await escrowService.getEscrowDetails(balanceId);
    console.log('Escrow details:', escrowDetails);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================================
// Example 3: Create Trading Order on Stellar DEX
// ============================================================================

async function example3_CreateTradingOrder() {
  console.log('\nExample 3: Create Trading Order on Stellar DEX\n');

  try {
    // Create keypair from secret
    const traderKeypair = StellarClient.createKeypair('S...');

    // Create sell order: Sell 100 XLM for USDC
    const { offerId } = await dexService.createOrder(traderKeypair, {
      selling: {
        code: 'XLM',
        amount: '100',
      },
      buying: {
        code: 'USDC',
        issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN',
      },
      price: '0.1', // 1 XLM = 0.1 USDC
    });

    console.log('✅ Order created with ID:', offerId);

    // Get active orders
    const orders = await dexService.getOrdersForAccount(traderKeypair.publicKey());
    console.log('Active orders:', orders);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================================
// Example 4: Query Order Book
// ============================================================================

async function example4_QueryOrderBook() {
  console.log('\nExample 4: Query Order Book\n');

  try {
    // Get order book for XLM/USDC trading pair
    const orderbook = await dexService.getOrderBook(
      { code: 'XLM' },
      { 
        code: 'USDC', 
        issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' 
      },
      20 // Limit to top 20 orders
    );

    console.log('Order Book:');
    console.log('Bids (buying XLM):', orderbook.bids);
    console.log('Asks (selling XLM):', orderbook.asks);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================================
// Example 5: Find Payment Paths for Complex Swaps
// ============================================================================

async function example5_FindPaymentPaths() {
  console.log('\nExample 5: Find Payment Paths\n');

  try {
    const sourceAccount = 'G...';
    const destAccount = 'G...';

    // Find paths to send USDC worth 100 XLM
    const paths = await dexService.findPaymentPaths(
      sourceAccount,
      destAccount,
      { 
        code: 'USDC', 
        issuer: 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN' 
      },
      '100' // Destination amount
    );

    console.log('Available payment paths:', paths);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================================
// Example 6: Claim Escrow After Time Lock
// ============================================================================

async function example6_ClaimEscrow() {
  console.log('\nExample 6: Claim Escrow\n');

  try {
    const claimantKeypair = StellarClient.createKeypair('S...');
    const balanceId = '...'; // From escrow creation

    // Check escrow details first
    const escrow = await escrowService.getEscrowDetails(balanceId);
    console.log('Escrow details:', escrow);

    // Check if time lock has passed
    if (escrow?.unlockTime && new Date() < escrow.unlockTime) {
      console.log('⏳ Time lock not expired yet');
      console.log('Can claim after:', escrow.unlockTime);
      return;
    }

    // Claim escrow
    await escrowService.claimEscrow(claimantKeypair, balanceId);
    console.log('✅ Escrow claimed successfully');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================================
// Example 7: Search and Discover Bots
// ============================================================================

async function example7_SearchBots() {
  console.log('\nExample 7: Search and Discover Bots\n');

  try {
    // Search bots by capability
    const tradingBots = botRegistrationService.searchBotsByCapability('trading');
    console.log('Trading bots:', tradingBots);

    const marketMakers = botRegistrationService.searchBotsByCapability('market-making');
    console.log('Market making bots:', marketMakers);

    // List all bots
    const allBots = botRegistrationService.listRegisteredBots();
    console.log('Total registered bots:', allBots.length);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================================
// Example 8: Check Account Balance
// ============================================================================

async function example8_CheckBalance() {
  console.log('\nExample 8: Check Account Balance\n');

  try {
    const publicKey = 'G...';

    // Get all balances
    const balances = await stellarClient.getBalance(publicKey);
    console.log('Account balances:');
    balances.forEach(balance => {
      console.log(`  ${balance.asset}: ${balance.balance}`);
    });

    // Check if account has sufficient balance for bot operations
    const hasSufficientBalance = await botRegistrationService.checkBotBalance(publicKey, '10');
    console.log('Sufficient balance for bot operations:', hasSufficientBalance);

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================================
// Example 9: Complete Bot Trading Workflow
// ============================================================================

async function example9_CompleteTradingWorkflow() {
  console.log('\nExample 9: Complete Bot Trading Workflow\n');

  try {
    // Step 1: Connect wallet
    console.log('1️⃣ Connecting wallet...');
    const publicKey = await freighterService.connect();
    console.log('✅ Connected:', publicKey);

    // Step 2: Register bot if not already registered
    console.log('\n2️⃣ Checking bot registration...');
    let bot = botRegistrationService.getBotRegistration(publicKey);
    if (!bot) {
      bot = await botRegistrationService.registerBot({
        name: 'Auto Trader',
        capabilities: ['trading', 'automated-trading'],
      });
      console.log('✅ Bot registered:', bot.name);
    } else {
      console.log('✅ Bot already registered:', bot.name);
    }

    // Step 3: Check balance
    console.log('\n3️⃣ Checking balance...');
    const balances = await stellarClient.getBalance(publicKey);
    console.log('Balances:', balances);

    // Step 4: Create escrow for a trade
    console.log('\n4️⃣ Creating escrow...');
    // Note: In real usage, this would use the connected wallet
    // For demo, we show the structure
    console.log('Escrow parameters:');
    console.log('  Amount: 10 XLM');
    console.log('  Time lock: 1 hour');
    console.log('  Claimant: Trading partner');

    // Step 5: Place order on DEX
    console.log('\n5️⃣ Order placement structure:');
    console.log('  Selling: 100 XLM');
    console.log('  Buying: USDC');
    console.log('  Price: 0.1 USDC per XLM');

    console.log('\n✅ Workflow complete!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// ============================================================================
// Run Examples
// ============================================================================

async function runAllExamples() {
  console.log('='.repeat(80));
  console.log('STELLAR CLAW2CLAW USAGE EXAMPLES');
  console.log('='.repeat(80));

  // Note: Comment out examples that require real wallet connection
  // await example1_ConnectAndRegisterBot();
  // await example2_CreateEscrow();
  // await example3_CreateTradingOrder();
  await example4_QueryOrderBook();
  await example5_FindPaymentPaths();
  // await example6_ClaimEscrow();
  await example7_SearchBots();
  // await example8_CheckBalance();
  // await example9_CompleteTradingWorkflow();

  console.log('\n' + '='.repeat(80));
  console.log('Examples complete!');
  console.log('='.repeat(80));
}

// Export examples for use in other modules
export {
  example1_ConnectAndRegisterBot,
  example2_CreateEscrow,
  example3_CreateTradingOrder,
  example4_QueryOrderBook,
  example5_FindPaymentPaths,
  example6_ClaimEscrow,
  example7_SearchBots,
  example8_CheckBalance,
  example9_CompleteTradingWorkflow,
};

// Uncomment to run examples
// runAllExamples().catch(console.error);
