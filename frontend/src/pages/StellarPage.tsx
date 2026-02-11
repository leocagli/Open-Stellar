/**
 * Stellar Claw2Claw Page
 * Main interface for P2P bot trading on Stellar
 */

import React, { useState, useEffect } from 'react';
import WalletConnect from '../components/WalletConnect';
import BotRegistrationForm from '../components/BotRegistrationForm';
import { freighterService, botRegistrationService, dexService, escrowService } from '../../stellar';
import type { BotRegistration, OrderDetails, EscrowDetails } from '../../stellar';

import './StellarPage.css';

export const StellarPage: React.FC = () => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [currentBot, setCurrentBot] = useState<BotRegistration | null>(null);
  const [activeOrders, setActiveOrders] = useState<OrderDetails[]>([]);
  const [activeEscrows, setActiveEscrows] = useState<EscrowDetails[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (walletConnected && publicKey) {
      loadBotData();
      loadOrders();
      loadEscrows();
    }
  }, [walletConnected, publicKey]);

  const loadBotData = () => {
    if (!publicKey) return;
    const bot = botRegistrationService.getBotRegistration(publicKey);
    setCurrentBot(bot);
  };

  const loadOrders = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const orders = await dexService.getOrdersForAccount(publicKey);
      setActiveOrders(orders);
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEscrows = async () => {
    if (!publicKey) return;
    setLoading(true);
    try {
      const escrows = await escrowService.listEscrowsForAccount(publicKey);
      setActiveEscrows(escrows);
    } catch (error) {
      console.error('Failed to load escrows:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWalletConnect = (pk: string) => {
    setWalletConnected(true);
    setPublicKey(pk);
  };

  const handleWalletDisconnect = () => {
    setWalletConnected(false);
    setPublicKey(null);
    setCurrentBot(null);
    setActiveOrders([]);
    setActiveEscrows([]);
  };

  const handleBotRegistered = (bot: BotRegistration) => {
    setCurrentBot(bot);
  };

  return (
    <div className="stellar-page">
      <header className="stellar-header">
        <h1>🌟 Stellar Claw2Claw</h1>
        <p>P2P Bot Trading on Stellar Blockchain</p>
      </header>

      <div className="stellar-container">
        {/* Wallet Connection Section */}
        <section className="section wallet-section">
          <WalletConnect
            onConnect={handleWalletConnect}
            onDisconnect={handleWalletDisconnect}
          />
        </section>

        {walletConnected && (
          <>
            {/* Bot Registration Section */}
            {!currentBot ? (
              <section className="section bot-registration-section">
                <BotRegistrationForm
                  walletConnected={walletConnected}
                  onRegistered={handleBotRegistered}
                />
              </section>
            ) : (
              <section className="section bot-info-section">
                <h2>Your Bot</h2>
                <div className="bot-card">
                  <h3>{currentBot.name}</h3>
                  {currentBot.description && <p>{currentBot.description}</p>}
                  <div className="bot-capabilities">
                    <strong>Capabilities:</strong>
                    <div className="capability-tags">
                      {currentBot.capabilities.map(cap => (
                        <span key={cap} className="capability-tag">
                          {cap.replace('-', ' ')}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="bot-meta">
                    <small>Registered: {currentBot.registeredAt.toLocaleString()}</small>
                  </div>
                </div>
              </section>
            )}

            {/* Active Orders Section */}
            <section className="section orders-section">
              <div className="section-header">
                <h2>Active Orders</h2>
                <button className="btn btn-secondary" onClick={loadOrders} disabled={loading}>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              {activeOrders.length === 0 ? (
                <p className="empty-state">No active orders</p>
              ) : (
                <div className="orders-list">
                  {activeOrders.map(order => (
                    <div key={order.id} className="order-card">
                      <div className="order-header">
                        <span className="order-id">Order #{order.id.slice(0, 8)}</span>
                        <span className="order-timestamp">
                          {order.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div className="order-details">
                        <div className="order-side selling">
                          <label>Selling:</label>
                          <span>{order.selling.amount} {order.selling.asset}</span>
                        </div>
                        <div className="order-arrow">→</div>
                        <div className="order-side buying">
                          <label>Buying:</label>
                          <span>{order.buying.amount} {order.buying.asset}</span>
                        </div>
                      </div>
                      <div className="order-price">
                        <label>Price:</label>
                        <span>{order.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Active Escrows Section */}
            <section className="section escrows-section">
              <div className="section-header">
                <h2>Active Escrows</h2>
                <button className="btn btn-secondary" onClick={loadEscrows} disabled={loading}>
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
              </div>
              
              {activeEscrows.length === 0 ? (
                <p className="empty-state">No active escrows</p>
              ) : (
                <div className="escrows-list">
                  {activeEscrows.map(escrow => (
                    <div key={escrow.id} className="escrow-card">
                      <div className="escrow-header">
                        <span className="escrow-id">Escrow #{escrow.id.slice(0, 8)}</span>
                        {escrow.unlockTime && (
                          <span className="escrow-unlock">
                            Unlocks: {escrow.unlockTime.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="escrow-details">
                        <div className="escrow-amount">
                          <label>Amount:</label>
                          <span>{escrow.amount} {escrow.asset}</span>
                        </div>
                        <div className="escrow-parties">
                          <div>
                            <label>Sponsor:</label>
                            <span className="address">{escrow.sponsor.slice(0, 8)}...</span>
                          </div>
                          <div>
                            <label>Claimant:</label>
                            <span className="address">{escrow.claimant.slice(0, 8)}...</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
};

export default StellarPage;
