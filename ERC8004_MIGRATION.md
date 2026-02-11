# ERC-8004 to Stellar Migration Guide

This document explains how the Open-Stellar implementation adapts ERC-8004 concepts to work with Stellar blockchain.

## What is ERC-8004?

ERC-8004 is the "Sign-In With Agent" (SIWA) standard for Ethereum that allows AI agents to prove their identity using:
- ERC-721 NFT tokens as identity markers
- ECDSA signatures for message signing
- Smart contracts for on-chain verification
- Ethereum addresses as identifiers

## How Open-Stellar Adapts ERC-8004

Open-Stellar implements the same authentication flow but replaces Ethereum-specific components with Stellar equivalents.

### Identity Storage

**ERC-8004 (Ethereum):**
```solidity
// Identity stored as NFT on-chain
contract AgentRegistry {
    mapping(uint256 => address) public agentToOwner;
    mapping(address => Agent) public agents;
}
```

**Open-Stellar (Stellar):**
```typescript
// Identity tied to Stellar account
interface StellarAgentIdentity {
  publicKey: string;  // Stellar public key (G...)
  agentId: string;    // Unique agent identifier
  metadata: object;   // Agent information
}

// Registered in-memory or stored in database
registerIdentity(identity);
```

**Key Difference:** Instead of NFTs, we use Stellar public keys as identity anchors. The Stellar account itself serves as proof of identity.

### Signature Algorithm

**ERC-8004 (Ethereum):**
- Uses ECDSA signatures with secp256k1 curve
- Signatures are 65 bytes (r, s, v)
- Compatible with Ethereum wallets

**Open-Stellar (Stellar):**
- Uses Ed25519 signatures (Stellar's native algorithm)
- Signatures are 64 bytes
- More efficient and secure than ECDSA

```typescript
// Stellar signing (Ed25519)
const signature = keypair.sign(messageBuffer);

// Stellar verification
const isValid = keypair.verify(messageBuffer, signature);
```

### Message Format

Both implementations use the same SIWA message format (based on EIP-4361):

```
example.com wants you to sign in with your Stellar account:
GXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

Sign in to access AI services

URI: https://example.com/api
Version: 1
Chain ID: testnet
Nonce: abc123...
Issued At: 2024-01-01T00:00:00.000Z
Agent ID: my-agent-001
```

This ensures compatibility and familiarity for developers migrating from ERC-8004.

### On-Chain Verification

**ERC-8004 (Ethereum):**
```solidity
// Smart contract verifies ownership
function verifySIWA(
    bytes memory message,
    bytes memory signature,
    uint256 tokenId
) public view returns (bool) {
    address signer = ECDSA.recover(message, signature);
    return ownerOf(tokenId) == signer;
}
```

**Open-Stellar (Stellar):**
```typescript
// Server-side verification (no smart contract needed)
async function verifySIWA(message, signature, domain, config) {
  // 1. Verify signature
  const isValid = verifySignature(message, signature, publicKey);
  
  // 2. Optionally check account exists on Stellar
  const exists = await accountExists(publicKey, config);
  
  // 3. Return verification result
  return { success: isValid && exists, receipt: generateReceipt() };
}
```

**Key Difference:** Stellar doesn't need smart contracts for verification. The signature verification happens off-chain, which is faster and cheaper.

### Escrow Mechanism

**ERC-8004 (Ethereum):**
```solidity
// Smart contract holds funds
contract Escrow {
    mapping(bytes32 => EscrowData) public escrows;
    
    function createEscrow(
        address payee,
        uint256 releaseTime
    ) public payable {
        // Store escrow data in contract
    }
    
    function release(bytes32 escrowId) public {
        require(block.timestamp >= escrow.releaseTime);
        payee.transfer(escrow.amount);
    }
}
```

**Open-Stellar (Stellar):**
```typescript
// Multi-signature account holds funds
const escrow = await createEscrowAccount(
  config,
  [
    { publicKey: agentA, weight: 1 },
    { publicKey: agentB, weight: 1 },
    { publicKey: arbiter, weight: 1 },
  ],
  2 // Requires 2 signatures
);

// Payments require multiple signatures
const payment = await createEscrowPayment(escrow.publicKey, destination, '100');
payment.sign(agentA);  // First signature
payment.sign(agentB);  // Second signature
await submitTransaction(payment);
```

**Key Difference:** Stellar uses native multi-signature accounts instead of smart contracts. This is:
- More efficient (no contract execution fees)
- More secure (tested protocol-level feature)
- Simpler to implement

### Time-Locked Payments

**ERC-8004 (Ethereum):**
```solidity
// Time lock in smart contract
require(block.timestamp >= releaseTime, "Too early");
```

**Open-Stellar (Stellar):**
```typescript
// Time bounds built into transaction
const transaction = new TransactionBuilder(account, {
  timebounds: {
    minTime: unlockTime,  // Can't submit before this
    maxTime: 0,           // No maximum
  }
})
```

**Key Difference:** Stellar has native time bounds at the protocol level.

## Migration Checklist

If you're migrating from ERC-8004 to Open-Stellar:

### 1. Identity Migration
- [ ] Export agent addresses from Ethereum
- [ ] Generate Stellar keypairs for each agent
- [ ] Map Ethereum addresses to Stellar public keys
- [ ] Migrate agent metadata to new format

### 2. Update Signature Logic
- [ ] Replace ECDSA signing with Ed25519
- [ ] Update signature verification code
- [ ] Keep SIWA message format (compatible)

### 3. Replace Smart Contracts
- [ ] Identify escrow smart contracts
- [ ] Create equivalent multi-sig Stellar accounts
- [ ] Update escrow creation logic
- [ ] Test payment flows

### 4. Update API Integration
- [ ] Replace Ethereum RPC calls with Stellar Horizon API
- [ ] Update transaction submission logic
- [ ] Adapt event monitoring (if needed)

### 5. Testing
- [ ] Test on Stellar testnet first
- [ ] Verify all authentication flows work
- [ ] Test escrow functionality
- [ ] Load test API endpoints
- [ ] Security audit

## Code Comparison

### Ethereum (ERC-8004)
```javascript
// Create identity NFT
const tx = await agentRegistry.mint(agentId, metadata);
await tx.wait();

// Sign message
const signature = await wallet.signMessage(message);

// Verify on-chain
const isValid = await agentRegistry.verifySIWA(
  message, 
  signature, 
  tokenId
);
```

### Stellar (Open-Stellar)
```typescript
// Create identity
const keypair = generateKeypair();
const identity = createAgentIdentity(keypair, agentId, metadata);
registerIdentity(identity);

// Sign message
const { signature } = signMessage(message, keypair);

// Verify off-chain
const result = await verifySIWA(
  message,
  signature,
  domain,
  config
);
```

## Advantages of Stellar Implementation

1. **Lower Costs**: No gas fees for smart contract execution
2. **Faster**: No need to wait for block confirmations for verification
3. **Simpler**: Less code, fewer dependencies
4. **Native Features**: Multi-sig and time bounds are protocol-level
5. **Scalable**: Off-chain verification reduces blockchain load

## Compatibility Considerations

### What Stays the Same
✅ SIWA message format (EIP-4361 compatible)  
✅ Authentication flow (nonce → sign → verify)  
✅ Receipt-based session management  
✅ Multi-signature escrow concept  

### What Changes
❌ Signature algorithm (ECDSA → Ed25519)  
❌ Address format (0x... → G...)  
❌ Verification location (on-chain → off-chain)  
❌ Escrow implementation (smart contract → multi-sig account)  

## Best Practices

1. **Key Management**: Use the same security practices as Ethereum
2. **Nonce Handling**: Implement same replay protection
3. **Receipt Validation**: Use JWT or similar for session tokens
4. **Escrow Setup**: Test multi-sig configurations thoroughly
5. **Network Selection**: Always use testnet for development

## Resources

- [ERC-8004 Specification](https://eips.ethereum.org/EIPS/eip-8004)
- [SIWA Documentation](https://github.com/builders-garden/siwa)
- [Stellar Multi-Signature Guide](https://developers.stellar.org/docs/encyclopedia/signatures-multisig)
- [Stellar SDK Documentation](https://stellar.github.io/js-stellar-sdk/)

## Support

For questions about migrating from ERC-8004 to Open-Stellar:
- Open an issue on GitHub
- Check STELLAR_INTEGRATION.md for technical details
- Review STELLAR_EXAMPLES.md for code examples
