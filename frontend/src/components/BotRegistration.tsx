import React, { useState } from 'react';

interface BotRegistrationProps {
  publicKey: string;
}

export const BotRegistration: React.FC<BotRegistrationProps> = ({ publicKey }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/bots/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          publicKey,
          name,
          description,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register bot');
      }

      setSuccess(true);
      setName('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to register bot');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bot-registration">
      <h3>Register Bot</h3>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Bot Name:</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="My Trading Bot"
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description (optional):</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A bot that performs automated trading"
            rows={3}
          />
        </div>
        <button type="submit" disabled={isSubmitting || !name}>
          {isSubmitting ? 'Registering...' : 'Register Bot'}
        </button>
      </form>
      {error && <p className="error">{error}</p>}
      {success && <p className="success">Bot registered successfully!</p>}
    </div>
  );
};
