'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';

interface TransactionLog {
  id: string;
  type: 'bnb' | 'stellar';
  status: 'pending' | 'success' | 'error';
  message: string;
  txHash?: string;
  timestamp: number;
}

export function TransactionPanel() {
  const { address, isConnected } = useAccount();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'bnb' | 'stellar'>('bnb');
  const [txLogs, setTxLogs] = useState<TransactionLog[]>([]);
  const [bnbAmount, setBnbAmount] = useState('0.01');
  const [stellarAmount, setStellarAmount] = useState('10');

  const addLog = (log: Omit<TransactionLog, 'id' | 'timestamp'>) => {
    setTxLogs((prev) => [
      {
        ...log,
        id: Date.now().toString(),
        timestamp: Date.now(),
      },
      ...prev.slice(0, 4), // Keep only last 5 logs
    ]);
  };

  const handleBNBTransaction = async () => {
    if (!isConnected || !address) {
      addLog({
        type: 'bnb',
        status: 'error',
        message: 'Wallet no conectado',
      });
      return;
    }

    addLog({
      type: 'bnb',
      status: 'pending',
      message: `Enviando ${bnbAmount} BNB...`,
    });

    // Simulated transaction
    setTimeout(() => {
      const mockTxHash = '0x' + Math.random().toString(16).substring(2, 18);
      addLog({
        type: 'bnb',
        status: 'success',
        message: `${bnbAmount} BNB enviados`,
        txHash: mockTxHash,
      });
    }, 2000);
  };

  const handleStellarTransaction = async () => {
    const freighter = (window as any).freighter;
    if (!freighter) {
      addLog({
        type: 'stellar',
        status: 'error',
        message: 'Freighter no instalado',
      });
      return;
    }

    try {
      const publicKey = await freighter.getPublicKey();
      if (!publicKey) {
        addLog({
          type: 'stellar',
          status: 'error',
          message: 'Wallet no conectado',
        });
        return;
      }

      addLog({
        type: 'stellar',
        status: 'pending',
        message: `Enviando ${stellarAmount} XLM...`,
      });

      // Simulated transaction
      setTimeout(() => {
        const mockTxHash = 'tx' + Math.random().toString(36).substring(2, 18);
        addLog({
          type: 'stellar',
          status: 'success',
          message: `${stellarAmount} XLM enviados`,
          txHash: mockTxHash,
        });
      }, 2000);
    } catch (error) {
      addLog({
        type: 'stellar',
        status: 'error',
        message: 'Error de conexion',
      });
    }
  };

  return (
    <>
      {/* Toggle button - pixel style */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 px-3 py-2 flex items-center gap-2"
        style={{
          backgroundColor: '#4a3728',
          border: '3px solid #2d221a',
          boxShadow: '3px 3px 0 rgba(0,0,0,0.3)',
          fontFamily: 'var(--font-vt323)',
          imageRendering: 'pixelated'
        }}
        whileHover={{ y: -1 }}
        whileTap={{ y: 1 }}
      >
        <PixelCoinIcon />
        <span className="text-xs font-bold text-white uppercase">
          {isOpen ? 'Cerrar' : 'Transacciones'}
        </span>
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 300, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 300, opacity: 0 }}
            transition={{ type: 'spring', damping: 25 }}
            className="fixed bottom-16 right-4 z-40 w-72"
            style={{
              backgroundColor: '#f5e6d3',
              border: '4px solid #4a3728',
              boxShadow: '4px 4px 0 rgba(0,0,0,0.4)',
              imageRendering: 'pixelated'
            }}
          >
            {/* Header */}
            <div 
              className="px-3 py-2"
              style={{ 
                backgroundColor: '#4a3728',
                borderBottom: '2px solid #2d221a'
              }}
            >
              <span 
                className="text-xs font-bold uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-vt323)', color: '#ffd700' }}
              >
                Panel de Transacciones
              </span>
            </div>

            {/* Tabs */}
            <div className="flex" style={{ borderBottom: '2px solid #4a3728' }}>
              <button
                onClick={() => setActiveTab('bnb')}
                className="flex-1 py-2 px-3 text-xs font-bold uppercase"
                style={{ 
                  backgroundColor: activeTab === 'bnb' ? '#f0b90b' : '#e8d5c4',
                  color: activeTab === 'bnb' ? '#1e2026' : '#4a3728',
                  fontFamily: 'var(--font-vt323)',
                  borderRight: '2px solid #4a3728'
                }}
              >
                BNB
              </button>
              <button
                onClick={() => setActiveTab('stellar')}
                className="flex-1 py-2 px-3 text-xs font-bold uppercase"
                style={{ 
                  backgroundColor: activeTab === 'stellar' ? '#222' : '#e8d5c4',
                  color: activeTab === 'stellar' ? '#fff' : '#4a3728',
                  fontFamily: 'var(--font-vt323)'
                }}
              >
                Stellar
              </button>
            </div>

            {/* Content */}
            <div className="p-3 space-y-3">
              {activeTab === 'bnb' && (
                <>
                  <div>
                    <label 
                      className="block text-xs font-bold mb-1"
                      style={{ fontFamily: 'var(--font-vt323)', color: '#4a3728' }}
                    >
                      Cantidad BNB
                    </label>
                    <input
                      type="number"
                      value={bnbAmount}
                      onChange={(e) => setBnbAmount(e.target.value)}
                      step="0.01"
                      min="0"
                      className="w-full px-2 py-1 text-xs"
                      style={{
                        backgroundColor: '#fff',
                        border: '2px solid #4a3728',
                        fontFamily: 'var(--font-vt323)',
                        color: '#4a3728'
                      }}
                      disabled={!isConnected}
                    />
                  </div>
                  <button
                    onClick={handleBNBTransaction}
                    disabled={!isConnected}
                    className="w-full py-2 px-3 text-xs font-bold uppercase"
                    style={{ 
                      backgroundColor: isConnected ? '#f0b90b' : '#ccc',
                      border: `2px solid ${isConnected ? '#c99b09' : '#999'}`,
                      color: isConnected ? '#1e2026' : '#666',
                      fontFamily: 'var(--font-vt323)',
                      cursor: isConnected ? 'pointer' : 'not-allowed',
                      boxShadow: isConnected ? '2px 2px 0 rgba(0,0,0,0.2)' : 'none'
                    }}
                  >
                    {isConnected ? 'Enviar BNB' : 'Conectar Wallet'}
                  </button>
                </>
              )}

              {activeTab === 'stellar' && (
                <>
                  <div>
                    <label 
                      className="block text-xs font-bold mb-1"
                      style={{ fontFamily: 'var(--font-vt323)', color: '#4a3728' }}
                    >
                      Cantidad XLM
                    </label>
                    <input
                      type="number"
                      value={stellarAmount}
                      onChange={(e) => setStellarAmount(e.target.value)}
                      step="1"
                      min="0"
                      className="w-full px-2 py-1 text-xs"
                      style={{
                        backgroundColor: '#fff',
                        border: '2px solid #4a3728',
                        fontFamily: 'var(--font-vt323)',
                        color: '#4a3728'
                      }}
                    />
                  </div>
                  <button
                    onClick={handleStellarTransaction}
                    className="w-full py-2 px-3 text-xs font-bold uppercase"
                    style={{ 
                      backgroundColor: '#222',
                      border: '2px solid #000',
                      color: '#fff',
                      fontFamily: 'var(--font-vt323)',
                      boxShadow: '2px 2px 0 rgba(0,0,0,0.2)'
                    }}
                  >
                    Enviar XLM
                  </button>
                </>
              )}
            </div>

            {/* Transaction logs */}
            <div 
              className="p-2 max-h-32 overflow-y-auto"
              style={{ borderTop: '2px solid #4a3728', backgroundColor: '#e8d5c4' }}
            >
              {txLogs.length === 0 ? (
                <p 
                  className="text-xs text-center py-2"
                  style={{ fontFamily: 'var(--font-vt323)', color: '#8b8b8b' }}
                >
                  Sin transacciones
                </p>
              ) : (
                <div className="space-y-1">
                  {txLogs.map((log) => (
                    <motion.div
                      key={log.id}
                      initial={{ x: -10, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="p-1.5 text-xs"
                      style={{
                        backgroundColor: log.type === 'bnb' ? '#fff8e7' : '#f0f0f0',
                        borderLeft: `3px solid ${
                          log.status === 'pending' ? '#f0b90b' :
                          log.status === 'success' ? '#2d5a27' : '#8b2942'
                        }`,
                        fontFamily: 'var(--font-vt323)'
                      }}
                    >
                      <div className="flex items-center gap-1">
                        <span 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{
                            backgroundColor: 
                              log.status === 'pending' ? '#f0b90b' :
                              log.status === 'success' ? '#2d5a27' : '#8b2942'
                          }}
                        />
                        <span style={{ color: '#4a3728' }}>{log.message}</span>
                      </div>
                      {log.txHash && (
                        <p style={{ color: '#8b8b8b', fontSize: '10px' }}>
                          {log.txHash.substring(0, 12)}...
                        </p>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function PixelCoinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" style={{ imageRendering: 'pixelated' }}>
      <rect x="4" y="1" width="8" height="2" fill="#ffd700" />
      <rect x="2" y="3" width="2" height="2" fill="#ffd700" />
      <rect x="12" y="3" width="2" height="2" fill="#ffd700" />
      <rect x="1" y="5" width="2" height="6" fill="#ffd700" />
      <rect x="13" y="5" width="2" height="6" fill="#ffd700" />
      <rect x="2" y="11" width="2" height="2" fill="#ffd700" />
      <rect x="12" y="11" width="2" height="2" fill="#ffd700" />
      <rect x="4" y="13" width="8" height="2" fill="#ffd700" />
      <rect x="3" y="3" width="10" height="10" fill="#c9a227" />
      <rect x="6" y="5" width="4" height="1" fill="#ffd700" />
      <rect x="7" y="6" width="2" height="4" fill="#ffd700" />
      <rect x="6" y="10" width="4" height="1" fill="#ffd700" />
    </svg>
  )
}
