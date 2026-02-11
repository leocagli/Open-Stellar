import React, { useState } from 'react';
import { WalletConnect } from './components/WalletConnect';
import { BotRegistration } from './components/BotRegistration';
import { SwapInterface } from './components/SwapInterface';
import { EscrowManager } from './components/EscrowManager';

function App() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'bots' | 'swap' | 'escrow'>('bots');

  return (
    <div className="app">
      <header>
        <h1>Open Stellar - Claw2Claw on Stellar</h1>
        <p>Decentralized trading platform on Stellar blockchain</p>
      </header>

      <main>
        {!publicKey ? (
          <WalletConnect onConnect={setPublicKey} />
        ) : (
          <>
            <nav className="tabs">
              <button
                className={activeTab === 'bots' ? 'active' : ''}
                onClick={() => setActiveTab('bots')}
              >
                Bot Registration
              </button>
              <button
                className={activeTab === 'swap' ? 'active' : ''}
                onClick={() => setActiveTab('swap')}
              >
                Asset Swap
              </button>
              <button
                className={activeTab === 'escrow' ? 'active' : ''}
                onClick={() => setActiveTab('escrow')}
              >
                Escrow
              </button>
            </nav>

            <div className="content">
              {activeTab === 'bots' && <BotRegistration publicKey={publicKey} />}
              {activeTab === 'swap' && <SwapInterface publicKey={publicKey} />}
              {activeTab === 'escrow' && <EscrowManager publicKey={publicKey} />}
            </div>
          </>
        )}
      </main>

      <footer>
        <p>Powered by Stellar blockchain and Soroban smart contracts</p>
      </footer>
    </div>
  );
}

export default App;
