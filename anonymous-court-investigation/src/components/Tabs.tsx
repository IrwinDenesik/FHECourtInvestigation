import React from 'react';
import { TabType } from '@/types';

interface TabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const Tabs: React.FC<TabsProps> = ({ activeTab, onTabChange }) => {
  const tabs: { id: TabType; icon: string; label: string }[] = [
    { id: 'dashboard', icon: 'fa-tachometer-alt', label: 'Dashboard' },
    { id: 'investigations', icon: 'fa-search', label: 'Investigations' },
    { id: 'evidence', icon: 'fa-file-alt', label: 'Evidence' },
    { id: 'witnesses', icon: 'fa-user-secret', label: 'Witnesses' },
    { id: 'verdicts', icon: 'fa-balance-scale', label: 'Verdicts' },
    { id: 'admin', icon: 'fa-cog', label: 'Admin' },
  ];

  return (
    <nav className="nav-tabs">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          <i className={`fas ${tab.icon}`}></i> {tab.label}
        </button>
      ))}
    </nav>
  );
};
