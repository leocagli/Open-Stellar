import React, { useState } from 'react';

interface SwapInterfaceProps {
  publicKey: string;
}

export const SwapInterface: React.FC<SwapInterfaceProps> = ({ publicKey }) => {
  const [sourceAsset, setSourceAsset] = useState({ code: 'XLM', issuer: '', type: 'native' });
  const [destAsset, setDestAsset] = useState({ code: 'USDC', issuer: '' });
  const [amount, setAmount] = useState('');
  const [minDestAmount, setMinDestAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const response = await fetch('/api/swap/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceAsset,
          destAsset,
          sourceAmount: amount,
          minDestAmount,
          sourceAccount: publicKey,
          network: 'testnet',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create swap transaction');
      }

      setTxHash(data.hash);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to swap assets');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="swap-interface">
      <h3>Swap Assets on Stellar DEX</h3>
      <form onSubmit={handleSwap}>
        <div className="form-group">
          <label>From:</label>
          <select
            value={sourceAsset.code}
            onChange={(e) =>
              setSourceAsset(
                e.target.value === 'XLM'
                  ? { code: 'XLM', issuer: '', type: 'native' }
                  : { code: e.target.value, issuer: '' }
              )
            }
          >
            <option value="XLM">XLM (Native)</option>
            <option value="USDC">USDC</option>
            <option value="BTC">BTC</option>
          </select>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Amount"
            step="0.0000001"
            required
          />
        </div>
        <div className="form-group">
          <label>To:</label>
          <select
            value={destAsset.code}
            onChange={(e) => setDestAsset({ code: e.target.value, issuer: '' })}
          >
            <option value="USDC">USDC</option>
            <option value="BTC">BTC</option>
            <option value="XLM">XLM (Native)</option>
          </select>
          <input
            type="number"
            value={minDestAmount}
            onChange={(e) => setMinDestAmount(e.target.value)}
            placeholder="Minimum to receive"
            step="0.0000001"
            required
          />
        </div>
        <button type="submit" disabled={isLoading || !amount || !minDestAmount}>
          {isLoading ? 'Swapping...' : 'Swap'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {txHash && (
        <div className="success">
          <p>Transaction created successfully!</p>
          <p className="hash">Hash: {txHash}</p>
        </div>
      )}
    </div>
  );
};
