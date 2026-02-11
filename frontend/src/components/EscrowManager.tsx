import React, { useState } from 'react';

interface EscrowManagerProps {
  publicKey: string;
}

export const EscrowManager: React.FC<EscrowManagerProps> = ({ publicKey }) => {
  const [buyer, setBuyer] = useState('');
  const [seller, setSeller] = useState('');
  const [arbiter, setArbiter] = useState('');
  const [amount, setAmount] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [escrowId, setEscrowId] = useState<string | null>(null);

  const handleCreateEscrow = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setEscrowId(null);

    try {
      const response = await fetch('/api/escrow/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          buyer,
          seller,
          arbiter,
          amount,
          asset: { code: 'XLM', type: 'native' },
          contractAddress,
          network: 'testnet',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create escrow');
      }

      setEscrowId(data.escrow.id);
      setBuyer('');
      setSeller('');
      setArbiter('');
      setAmount('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create escrow');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="escrow-manager">
      <h3>Create Escrow</h3>
      <form onSubmit={handleCreateEscrow}>
        <div className="form-group">
          <label htmlFor="buyer">Buyer Address:</label>
          <input
            type="text"
            id="buyer"
            value={buyer}
            onChange={(e) => setBuyer(e.target.value)}
            placeholder="GXXXXXXXXXX..."
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="seller">Seller Address:</label>
          <input
            type="text"
            id="seller"
            value={seller}
            onChange={(e) => setSeller(e.target.value)}
            placeholder="GXXXXXXXXXX..."
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="arbiter">Arbiter Address:</label>
          <input
            type="text"
            id="arbiter"
            value={arbiter}
            onChange={(e) => setArbiter(e.target.value)}
            placeholder="GXXXXXXXXXX..."
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="amount">Amount (XLM):</label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            step="0.0000001"
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="contract">Contract Address:</label>
          <input
            type="text"
            id="contract"
            value={contractAddress}
            onChange={(e) => setContractAddress(e.target.value)}
            placeholder="CXXXXXXXXXX..."
            required
          />
        </div>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating...' : 'Create Escrow'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {escrowId && (
        <div className="success">
          <p>Escrow created successfully!</p>
          <p>ID: {escrowId}</p>
        </div>
      )}
    </div>
  );
};
