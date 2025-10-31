import React from 'react';
import { Alert } from '@/types';

interface AlertsProps {
  alerts: Alert[];
  onRemove: (id: string) => void;
}

export const Alerts: React.FC<AlertsProps> = ({ alerts, onRemove }) => {
  return (
    <div className="alerts-container">
      {alerts.map((alert) => (
        <div key={alert.id} className={`alert alert-${alert.type}`}>
          <span>{alert.message}</span>
          <button className="alert-close" onClick={() => onRemove(alert.id)}>
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};
