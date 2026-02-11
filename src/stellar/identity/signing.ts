/**
 * Stellar Message Signing
 * 
 * Provides message signing and verification functionality for Stellar agents
 * Adapted from SIWA (Sign-In With Agent) for Stellar blockchain
 */

import * as StellarSdk from '@stellar/stellar-sdk';
import { StellarSIWAMessage, StellarSignature } from '../types';

/**
 * Convert a SIWA message object to a canonical string format
 * Based on EIP-4361 message format
 */
export function formatSIWAMessage(message: StellarSIWAMessage): string {
  const header = `${message.domain} wants you to sign in with your Stellar account:`;
  const addressLine = message.address;
  
  const lines = [header, addressLine];
  
  if (message.statement) {
    lines.push('');
    lines.push(message.statement);
  }
  
  lines.push('');
  lines.push(`URI: ${message.uri}`);
  lines.push(`Version: ${message.version}`);
  lines.push(`Chain ID: ${message.chainId}`);
  lines.push(`Nonce: ${message.nonce}`);
  lines.push(`Issued At: ${message.issuedAt}`);
  lines.push(`Agent ID: ${message.agentId}`);
  
  if (message.expirationTime) {
    lines.push(`Expiration Time: ${message.expirationTime}`);
  }
  
  if (message.notBefore) {
    lines.push(`Not Before: ${message.notBefore}`);
  }
  
  if (message.requestId) {
    lines.push(`Request ID: ${message.requestId}`);
  }
  
  if (message.resources && message.resources.length > 0) {
    lines.push('Resources:');
    message.resources.forEach(resource => {
      lines.push(`- ${resource}`);
    });
  }
  
  return lines.join('\n');
}

/**
 * Parse a formatted SIWA message string back into an object
 */
export function parseSIWAMessage(messageStr: string): StellarSIWAMessage | null {
  try {
    const lines = messageStr.split('\n');
    const message: Partial<StellarSIWAMessage> = {};
    
    // Parse header and address
    const headerMatch = lines[0]?.match(/^(.+) wants you to sign in/);
    if (!headerMatch) return null;
    message.domain = headerMatch[1];
    message.address = lines[1] || '';
    
    // Find statement (between address and URI)
    let currentLine = 2;
    const statementLines: string[] = [];
    while (currentLine < lines.length && !lines[currentLine].startsWith('URI:')) {
      if (lines[currentLine].trim()) {
        statementLines.push(lines[currentLine]);
      }
      currentLine++;
    }
    if (statementLines.length > 0) {
      message.statement = statementLines.join('\n');
    }
    
    // Parse key-value pairs
    const resources: string[] = [];
    let inResources = false;
    
    for (let i = currentLine; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.startsWith('Resources:')) {
        inResources = true;
        continue;
      }
      
      if (inResources) {
        if (line.startsWith('- ')) {
          resources.push(line.substring(2));
        }
        continue;
      }
      
      const [key, ...valueParts] = line.split(': ');
      const value = valueParts.join(': ');
      
      switch (key) {
        case 'URI':
          message.uri = value;
          break;
        case 'Version':
          message.version = value;
          break;
        case 'Chain ID':
          message.chainId = value;
          break;
        case 'Nonce':
          message.nonce = value;
          break;
        case 'Issued At':
          message.issuedAt = value;
          break;
        case 'Agent ID':
          message.agentId = value;
          break;
        case 'Expiration Time':
          message.expirationTime = value;
          break;
        case 'Not Before':
          message.notBefore = value;
          break;
        case 'Request ID':
          message.requestId = value;
          break;
      }
    }
    
    if (resources.length > 0) {
      message.resources = resources;
    }
    
    // Validate required fields
    if (!message.domain || !message.address || !message.uri || !message.version ||
        !message.chainId || !message.nonce || !message.issuedAt || !message.agentId) {
      return null;
    }
    
    return message as StellarSIWAMessage;
  } catch {
    return null;
  }
}

/**
 * Sign a SIWA message with a Stellar keypair
 */
export function signSIWAMessage(
  message: StellarSIWAMessage,
  keypair: StellarSdk.Keypair
): StellarSignature {
  const messageStr = formatSIWAMessage(message);
  const messageBuffer = Buffer.from(messageStr, 'utf8');
  const signature = keypair.sign(messageBuffer);
  
  return {
    signature: signature.toString('base64'),
    publicKey: keypair.publicKey(),
    message: messageStr,
  };
}

/**
 * Sign a raw message with a Stellar keypair
 */
export function signMessage(
  message: string,
  keypair: StellarSdk.Keypair
): StellarSignature {
  const messageBuffer = Buffer.from(message, 'utf8');
  const signature = keypair.sign(messageBuffer);
  
  return {
    signature: signature.toString('base64'),
    publicKey: keypair.publicKey(),
    message,
  };
}

/**
 * Verify a signed message
 */
export function verifySignature(
  message: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const keypair = StellarSdk.Keypair.fromPublicKey(publicKey);
    const messageBuffer = Buffer.from(message, 'utf8');
    const signatureBuffer = Buffer.from(signature, 'base64');
    
    return keypair.verify(messageBuffer, signatureBuffer);
  } catch (error) {
    console.error('Signature verification error:', error);
    return false;
  }
}

/**
 * Verify a SIWA signature
 */
export function verifySIWASignature(
  message: StellarSIWAMessage,
  signature: string,
  expectedPublicKey: string
): boolean {
  // Verify the message address matches the expected public key
  if (message.address !== expectedPublicKey) {
    return false;
  }
  
  const messageStr = formatSIWAMessage(message);
  return verifySignature(messageStr, signature, expectedPublicKey);
}

/**
 * Create a SIWA message
 */
export function createSIWAMessage(params: {
  domain: string;
  address: string;
  agentId: string;
  uri: string;
  chainId: string;
  nonce: string;
  statement?: string;
  expirationTime?: string;
  notBefore?: string;
  requestId?: string;
  resources?: string[];
}): StellarSIWAMessage {
  return {
    domain: params.domain,
    address: params.address,
    agentId: params.agentId,
    statement: params.statement,
    uri: params.uri,
    version: '1',
    chainId: params.chainId,
    nonce: params.nonce,
    issuedAt: new Date().toISOString(),
    expirationTime: params.expirationTime,
    notBefore: params.notBefore,
    requestId: params.requestId,
    resources: params.resources,
  };
}
