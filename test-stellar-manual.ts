/**
 * Manual test script for Stellar integration
 * Run with: node --loader ts-node/esm test-stellar-manual.ts
 */

import { generateKeypair, createAgentIdentity, getNetworkConfig } from './src/stellar/identity/wallet.js';
import { createSIWAMessage, signSIWAMessage, formatSIWAMessage } from './src/stellar/identity/signing.js';
import { createNonce, verifySIWA, registerIdentity } from './src/stellar/auth/siwa.js';
import { createEscrowAccount } from './src/stellar/escrow/trustless.js';

async function main() {
  console.log('🌟 Open-Stellar Manual Test\n');

  // Test 1: Generate keypair
  console.log('1️⃣  Generating keypair...');
  const keypair = generateKeypair();
  console.log('   Public Key:', keypair.publicKey());
  console.log('   Secret Key:', keypair.secret().substring(0, 10) + '...');
  console.log('   ✅ Keypair generated\n');

  // Test 2: Create agent identity
  console.log('2️⃣  Creating agent identity...');
  const identity = createAgentIdentity(keypair, 'test-agent-001', {
    name: 'Test Agent',
    description: 'A test AI agent for verification',
  });
  registerIdentity(identity);
  console.log('   Agent ID:', identity.agentId);
  console.log('   Public Key:', identity.publicKey);
  console.log('   ✅ Identity created and registered\n');

  // Test 3: SIWA authentication flow
  console.log('3️⃣  Testing SIWA authentication...');
  const nonce = await createNonce(keypair.publicKey(), 'test-agent-001');
  console.log('   Nonce:', nonce.value.substring(0, 20) + '...');
  
  const message = createSIWAMessage({
    domain: 'example.com',
    address: keypair.publicKey(),
    agentId: 'test-agent-001',
    uri: 'https://example.com/api',
    chainId: 'testnet',
    nonce: nonce.value,
    statement: 'Sign in to test Stellar integration',
  });
  
  const { signature } = signSIWAMessage(message, keypair);
  console.log('   Signature:', signature.substring(0, 20) + '...');
  
  const messageStr = formatSIWAMessage(message);
  const result = await verifySIWA(messageStr, signature, 'example.com');
  
  if (result.success) {
    console.log('   ✅ Authentication successful!');
    console.log('   Receipt:', result.receipt?.substring(0, 30) + '...');
  } else {
    console.log('   ❌ Authentication failed:', result.error);
    return;
  }
  console.log();

  // Test 4: Create escrow account
  console.log('4️⃣  Creating escrow account...');
  const agent1 = generateKeypair();
  const agent2 = generateKeypair();
  const config = getNetworkConfig('testnet');
  
  const escrow = await createEscrowAccount(
    config,
    [
      { publicKey: agent1.publicKey(), weight: 1 },
      { publicKey: agent2.publicKey(), weight: 1 },
    ],
    2 // Requires both signatures
  );
  
  console.log('   Escrow Public Key:', escrow.publicKey);
  console.log('   Signers:', escrow.signers.length);
  console.log('   Threshold:', escrow.threshold);
  console.log('   ✅ Escrow created\n');

  console.log('✅ All tests passed!\n');
  console.log('Next steps:');
  console.log('- Fund a testnet account: POST /api/stellar/fund-testnet');
  console.log('- Setup escrow on-chain (requires funded account)');
  console.log('- Test payment transactions');
}

main().catch(console.error);
