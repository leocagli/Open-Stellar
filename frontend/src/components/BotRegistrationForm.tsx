/**
 * Bot Registration Component
 */

import React, { useState } from 'react';
import { botRegistrationService } from '../../stellar';
import type { BotRegistration } from '../../stellar';

export interface BotRegistrationFormProps {
  onRegistered?: (bot: BotRegistration) => void;
  walletConnected: boolean;
}

const AVAILABLE_CAPABILITIES = [
  'trading',
  'market-making',
  'arbitrage',
  'liquidity-provision',
  'price-oracle',
  'automated-trading',
  'order-matching',
  'escrow-management',
];

export const BotRegistrationForm: React.FC<BotRegistrationFormProps> = ({
  onRegistered,
  walletConnected,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    capabilities: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
    setSuccess(false);
  };

  const handleCapabilityToggle = (capability: string) => {
    setFormData(prev => ({
      ...prev,
      capabilities: prev.capabilities.includes(capability)
        ? prev.capabilities.filter(c => c !== capability)
        : [...prev.capabilities, capability],
    }));
    setError(null);
    setSuccess(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      if (!walletConnected) {
        throw new Error('Please connect your wallet first');
      }

      if (!formData.name.trim()) {
        throw new Error('Bot name is required');
      }

      if (formData.capabilities.length === 0) {
        throw new Error('Please select at least one capability');
      }

      const registration = await botRegistrationService.registerBot({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        capabilities: formData.capabilities,
      });

      setSuccess(true);
      setFormData({ name: '', description: '', capabilities: [] });
      onRegistered?.(registration);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to register bot';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bot-registration-form">
      <h2>Register Your Bot</h2>

      {!walletConnected && (
        <div className="alert alert-warning">
          Please connect your Freighter wallet to register a bot.
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          Bot registered successfully!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Bot Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., TradingBot Alpha"
            disabled={!walletConnected || loading}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe what your bot does..."
            rows={3}
            disabled={!walletConnected || loading}
          />
        </div>

        <div className="form-group">
          <label>Capabilities *</label>
          <div className="capabilities-grid">
            {AVAILABLE_CAPABILITIES.map(capability => (
              <label key={capability} className="capability-checkbox">
                <input
                  type="checkbox"
                  checked={formData.capabilities.includes(capability)}
                  onChange={() => handleCapabilityToggle(capability)}
                  disabled={!walletConnected || loading}
                />
                <span>{capability.replace('-', ' ')}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!walletConnected || loading || !formData.name.trim() || formData.capabilities.length === 0}
        >
          {loading ? 'Registering...' : 'Register Bot'}
        </button>
      </form>
    </div>
  );
};

export default BotRegistrationForm;
