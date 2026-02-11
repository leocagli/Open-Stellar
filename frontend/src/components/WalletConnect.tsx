/**
 * Freighter Wallet Connection Component
 */

import React, { useState, useEffect } from 'react';
import { freighterService } from '../../stellar';
import type { FreighterWalletState } from '../../stellar';

export interface WalletConnectProps {
  onConnect?: (publicKey: string) => void;
  onDisconnect?: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect, onDisconnect }) => {
  const [walletState, setWalletState] = useState<FreighterWalletState>({
    isConnected: false,
    publicKey: null,
    isAllowed: false,
  });
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkFreighterInstalled();
  }, []);

  const checkFreighterInstalled = async () => {
    const installed = await freighterService.isFreighterInstalled();
    setIsInstalled(installed);
  };

  const handleConnect = async () => {
    setLoading(true);
    setError(null);

    try {
      const publicKey = await freighterService.connect();
      const state = freighterService.getState();
      setWalletState(state);
      onConnect?.(publicKey);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to connect wallet';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await freighterService.disconnect();
      setWalletState({
        isConnected: false,
        publicKey: null,
        isAllowed: false,
      });
      onDisconnect?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to disconnect wallet';
      setError(errorMessage);
    }
  };

  const formatPublicKey = (key: string): string => {
    return `${key.slice(0, 8)}...${key.slice(-8)}`;
  };

  if (isInstalled === null) {
    return <div className="wallet-connect loading">Checking for Freighter...</div>;
  }

  if (!isInstalled) {
    return (
      <div className="wallet-connect not-installed">
        <h3>Freighter Wallet Not Found</h3>
        <p>Please install the Freighter browser extension to continue.</p>
        <a
          href="https://www.freighter.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-primary"
        >
          Install Freighter
        </a>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {walletState.isConnected ? (
        <div className="wallet-connected">
          <div className="wallet-info">
            <span className="status-indicator connected"></span>
            <span className="public-key" title={walletState.publicKey || ''}>
              {walletState.publicKey ? formatPublicKey(walletState.publicKey) : ''}
            </span>
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleDisconnect}
            disabled={loading}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          className="btn btn-primary"
          onClick={handleConnect}
          disabled={loading}
        >
          {loading ? 'Connecting...' : 'Connect Freighter Wallet'}
        </button>
      )}
    </div>
  );
};

export default WalletConnect;
