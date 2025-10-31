import React from 'react';

interface HeaderProps {
  isConnected: boolean;
  address: string | null;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isConnected, address, onConnect, onDisconnect }) => {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1>
          <i className="fas fa-gavel"></i> Anonymous Court Investigation System
        </h1>
        <p>Secure, Private, and Transparent Judicial Investigations</p>
        <div className="wallet-section">
          {!isConnected ? (
            <button className="btn btn-primary" onClick={onConnect}>
              <i className="fas fa-wallet"></i> Connect Wallet
            </button>
          ) : (
            <div className="wallet-info">
              <span className="wallet-address">{address && formatAddress(address)}</span>
              <button className="btn btn-secondary" onClick={onDisconnect}>
                <i className="fas fa-sign-out-alt"></i> Disconnect
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
