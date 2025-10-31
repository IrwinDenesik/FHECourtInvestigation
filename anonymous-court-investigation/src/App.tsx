import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { Tabs } from './components/Tabs';
import { Dashboard } from './components/Dashboard';
import { Investigations } from './components/Investigations';
import { Evidence } from './components/Evidence';
import { Witnesses } from './components/Witnesses';
import { Verdicts } from './components/Verdicts';
import { Admin } from './components/Admin';
import { Alerts } from './components/Alerts';
import { useWallet } from './hooks/useWallet';
import { useInvestigations } from './hooks/useInvestigations';
import { TabType, Alert, AlertType } from './types';
import { generateId } from './lib/utils';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Wallet connection
  const {
    isConnected,
    address,
    contract,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWallet();

  // Investigations and dashboard data
  const {
    investigations,
    dashboardStats,
    userRoles,
    loading,
    updateDashboard,
    updateUserRoles,
    loadInvestigations,
  } = useInvestigations(contract, address);

  // Alert management
  const showAlert = useCallback((message: string, type: AlertType = 'info') => {
    const alert: Alert = {
      id: generateId(),
      type,
      message,
    };

    setAlerts((prev) => [...prev, alert]);

    // Auto remove after 5 seconds
    setTimeout(() => {
      removeAlert(alert.id);
    }, 5000);
  }, []);

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  // Handle wallet connection
  const handleConnect = async () => {
    try {
      await connectWallet();
      showAlert('Wallet connected successfully!', 'success');
    } catch (error: any) {
      if (error.message.includes('MetaMask')) {
        showAlert('Please install MetaMask to use this application', 'error');
      } else {
        showAlert(error.message || 'Failed to connect wallet', 'error');
      }
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    showAlert('Wallet disconnected', 'info');
  };

  // Handle data updates
  const handleUpdate = async () => {
    await Promise.all([updateDashboard(), updateUserRoles(), loadInvestigations()]);
  };

  return (
    <div className="App">
      <Alerts alerts={alerts} onRemove={removeAlert} />

      <Header
        isConnected={isConnected}
        address={address}
        onConnect={handleConnect}
        onDisconnect={handleDisconnect}
      />

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="main-content">
        <div className="container">
          {!isConnected && (
            <div className="alert alert-warning">
              <i className="fas fa-exclamation-triangle"></i>
              <span>Please connect your wallet to use this application</span>
            </div>
          )}

          {activeTab === 'dashboard' && (
            <Dashboard stats={dashboardStats} roles={userRoles} />
          )}

          {activeTab === 'investigations' && (
            <Investigations
              contract={contract}
              investigations={investigations}
              onUpdate={handleUpdate}
              showAlert={showAlert}
            />
          )}

          {activeTab === 'evidence' && (
            <Evidence
              contract={contract}
              onUpdate={handleUpdate}
              showAlert={showAlert}
            />
          )}

          {activeTab === 'witnesses' && (
            <Witnesses
              contract={contract}
              onUpdate={handleUpdate}
              showAlert={showAlert}
            />
          )}

          {activeTab === 'verdicts' && (
            <Verdicts
              contract={contract}
              onUpdate={handleUpdate}
              showAlert={showAlert}
            />
          )}

          {activeTab === 'admin' && (
            <Admin
              contract={contract}
              onUpdate={handleUpdate}
              showAlert={showAlert}
            />
          )}
        </div>
      </main>

      <footer className="footer">
        <p>&copy; 2025 Anonymous Court Investigation System. Powered by FHE Technology.</p>
        <div className="footer-links">
          <a href="#" className="footer-link">
            Privacy Policy
          </a>
          <a href="#" className="footer-link">
            Terms of Service
          </a>
          <a href="#" className="footer-link">
            Documentation
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
