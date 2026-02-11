import { describe, it, expect } from 'vitest';
import { StellarSdk } from '../stellar-sdk';

describe('Stellar SDK', () => {
  describe('Asset Validation', () => {
    it('should validate native XLM asset', () => {
      const asset = StellarSdk.Asset.native();
      expect(asset.isNative()).toBe(true);
    });

    it('should create custom asset', () => {
      const asset = new StellarSdk.Asset('USDC', 'GXXXXXXXXXX');
      expect(asset.getCode()).toBe('USDC');
      expect(asset.isNative()).toBe(false);
    });

    it('should validate Stellar public key', () => {
      const validKey = 'GCDNJUBQSX7AJWLJACMJ7I4BC3Z47BQUTMHEICZLE6MU4KQBRYG5JY6B';
      expect(StellarSdk.StrKey.isValidEd25519PublicKey(validKey)).toBe(true);
    });

    it('should reject invalid public key', () => {
      const invalidKey = 'INVALID_KEY';
      expect(StellarSdk.StrKey.isValidEd25519PublicKey(invalidKey)).toBe(false);
    });
  });

  describe('Network Configuration', () => {
    it('should use testnet passphrase for testnet', () => {
      expect(StellarSdk.Networks.TESTNET).toBe('Test SDF Network ; September 2015');
    });

    it('should use mainnet passphrase for public network', () => {
      expect(StellarSdk.Networks.PUBLIC).toBe('Public Global Stellar Network ; September 2015');
    });
  });
});
