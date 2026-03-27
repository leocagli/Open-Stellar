'use client'

import freighter from '@stellar/freighter-api'

// Stellar Testnet configuration
export const STELLAR_TESTNET = {
  networkUrl: 'https://horizon-testnet.stellar.org',
  networkPassphrase: 'Test SDF Network ; September 2015',
  friendbotUrl: 'https://friendbot.stellar.org'
}

export const STELLAR_MAINNET = {
  networkUrl: 'https://horizon.stellar.org',
  networkPassphrase: 'Public Global Stellar Network ; September 2015'
}

export type StellarNetwork = 'TESTNET' | 'PUBLIC'

// Check if Freighter extension is installed
export async function isFreighterInstalled(): Promise<boolean> {
  try {
    const result = await freighter.isConnected()
    return result
  } catch {
    return false
  }
}

// Check if the user has granted access to the Freighter wallet
export async function isFreighterAllowed(): Promise<boolean> {
  try {
    const result = await freighter.isAllowed()
    return result
  } catch {
    return false
  }
}

// Request access to Freighter wallet
export async function connectFreighter(): Promise<{ publicKey: string | null; error: string | null }> {
  try {
    const isInstalled = await isFreighterInstalled()
    
    if (!isInstalled) {
      return { 
        publicKey: null, 
        error: 'Freighter wallet is not installed. Please install it from https://freighter.app' 
      }
    }

    // Request access
    const accessObj = await freighter.requestAccess()
    
    if (accessObj.error) {
      return { publicKey: null, error: accessObj.error }
    }
    
    return { publicKey: accessObj.address, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to connect to Freighter'
    return { publicKey: null, error: message }
  }
}

// Get the current public key from Freighter
export async function getFreighterPublicKey(): Promise<string | null> {
  try {
    const isAllowed = await isFreighterAllowed()
    if (!isAllowed) return null
    
    const addressObj = await freighter.getAddress()
    return addressObj.address || null
  } catch {
    return null
  }
}

// Get the current network from Freighter
export async function getFreighterNetwork(): Promise<StellarNetwork | null> {
  try {
    const networkDetails = await freighter.getNetworkDetails()
    
    if (networkDetails.networkPassphrase === STELLAR_TESTNET.networkPassphrase) {
      return 'TESTNET'
    } else if (networkDetails.networkPassphrase === STELLAR_MAINNET.networkPassphrase) {
      return 'PUBLIC'
    }
    
    return null
  } catch {
    return null
  }
}

// Fund testnet account using friendbot
export async function fundTestnetAccount(publicKey: string): Promise<{ success: boolean; error: string | null }> {
  try {
    const response = await fetch(`${STELLAR_TESTNET.friendbotUrl}?addr=${encodeURIComponent(publicKey)}`)
    
    if (response.ok) {
      return { success: true, error: null }
    } else {
      const errorText = await response.text()
      return { success: false, error: errorText }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fund account'
    return { success: false, error: message }
  }
}

// Sign a transaction with Freighter
export async function signTransaction(
  xdr: string, 
  network: StellarNetwork = 'TESTNET'
): Promise<{ signedXdr: string | null; error: string | null }> {
  try {
    const networkPassphrase = network === 'TESTNET' 
      ? STELLAR_TESTNET.networkPassphrase 
      : STELLAR_MAINNET.networkPassphrase

    const result = await freighter.signTransaction(xdr, {
      networkPassphrase
    })

    if (result.error) {
      return { signedXdr: null, error: result.error }
    }

    return { signedXdr: result.signedTxXdr, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to sign transaction'
    return { signedXdr: null, error: message }
  }
}

// Disconnect Freighter (clear local state, Freighter doesn't have explicit disconnect)
export function disconnectFreighter(): void {
  // Freighter doesn't have an explicit disconnect method
  // The dApp just stops tracking the connection
  console.log('[v0] Freighter disconnected from dApp')
}
