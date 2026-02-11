import React, { useState } from 'react';
import { FreighterWallet } from '../../../stellar-sdk';

interface WalletConnectProps {
  onConnect: (publicKey: string) => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const wallet = new FreighterWallet();

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      const pk = await wallet.connect();
      setPublicKey(pk);
      onConnect(pk);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  if (publicKey) {
    return (
      <div className="wallet-connected">
        <h3>Wallet Connected</h3>
        <p>Public Key: {publicKey.substring(0, 8)}...{publicKey.substring(publicKey.length - 8)}</p>
      </div>
    );
  }

  return (
    <div className="wallet-connect">
      <h3>Connect Freighter Wallet</h3>
      <button 
        onClick={handleConnect} 
        disabled={isConnecting}
        className="connect-button"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
      {error && <p className="error">{error}</p>}
    </div>
  );
};
