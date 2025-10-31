import React from 'react';
import { DashboardStats, UserRoles } from '@/types';

interface DashboardProps {
  stats: DashboardStats;
  roles: UserRoles;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, roles }) => {
  return (
    <div className="tab-content active">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-folder-open"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalInvestigations}</h3>
            <p>Total Investigations</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-play"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.activeInvestigations}</h3>
            <p>Active Cases</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-file-alt"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalEvidence}</h3>
            <p>Evidence Submitted</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <i className="fas fa-user-secret"></i>
          </div>
          <div className="stat-info">
            <h3>{stats.totalWitnesses}</h3>
            <p>Anonymous Witnesses</p>
          </div>
        </div>
      </div>

      <div className="roles-section">
        <h2>
          <i className="fas fa-id-badge"></i> Your Roles
        </h2>
        <div className="roles-grid">
          <div className={`role-card ${roles.isInvestigator ? 'authorized' : ''}`}>
            <i className="fas fa-search"></i>
            <h3>Investigator</h3>
            <p>{roles.isInvestigator ? 'Authorized' : 'Not Authorized'}</p>
          </div>
          <div className={`role-card ${roles.isJudge ? 'authorized' : ''}`}>
            <i className="fas fa-balance-scale"></i>
            <h3>Judge</h3>
            <p>{roles.isJudge ? 'Authorized' : 'Not Authorized'}</p>
          </div>
          <div className={`role-card ${roles.isAdmin ? 'admin' : ''}`}>
            <i className="fas fa-crown"></i>
            <h3>Administrator</h3>
            <p>{roles.isAdmin ? 'Administrator' : 'Not Admin'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
