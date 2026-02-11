import React from 'react';

function App() {
  return (
    <div style={{
      fontFamily: 'system-ui, sans-serif',
      maxWidth: '800px',
      margin: '40px auto',
      padding: '20px',
    }}>
      <h1>🌟 Open-Stellar</h1>
      <p>AI-powered Moltbot gateway with Stellar blockchain integration</p>
      
      <h2>Stellar Integration</h2>
      <p>This project implements Sign-In With Agent (SIWA) adapted from ERC-8004 for Stellar.</p>
      
      <h3>Features:</h3>
      <ul>
        <li>✅ Agent Authentication with Ed25519 signatures</li>
        <li>✅ Trustless Escrow using multi-signature accounts</li>
        <li>✅ No Smart Contracts - Uses Stellar's native protocol</li>
      </ul>
      
      <h3>API Endpoints:</h3>
      <ul>
        <li><code>POST /api/stellar/keypair</code> - Generate new keypair</li>
        <li><code>POST /api/stellar/register</code> - Register agent identity</li>
        <li><code>POST /api/stellar/nonce</code> - Get authentication nonce</li>
        <li><code>POST /api/stellar/verify</code> - Verify signed message</li>
        <li><code>GET /api/stellar/identity/:publicKey</code> - Get agent identity</li>
        <li><code>POST /api/stellar/escrow/create</code> - Create escrow account</li>
      </ul>
      
      <h3>Documentation:</h3>
      <p>
        See <a href="https://github.com/leocagli/Open-Stellar/blob/main/STELLAR_INTEGRATION.md">
          STELLAR_INTEGRATION.md
        </a> for detailed documentation.
      </p>
    </div>
  );
}

export default App;
