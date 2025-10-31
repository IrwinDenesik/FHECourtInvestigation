import React, { useState } from 'react';
import { Contract } from 'ethers';
import { useContract } from '@/hooks/useContract';
import { Investigation } from '@/types';
import { getInvestigationStatusLabel, getStatusClass, formatAddress, formatTimestamp } from '@/lib/utils';

interface InvestigationsProps {
  contract: Contract | null;
  investigations: Investigation[];
  onUpdate: () => void;
  showAlert: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Investigations: React.FC<InvestigationsProps> = ({
  contract,
  investigations,
  onUpdate,
  showAlert,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [caseId, setCaseId] = useState('');
  const [participantAddress, setParticipantAddress] = useState('');
  const [investigationId, setInvestigationId] = useState('');
  const { executeTransaction, txState } = useContract(contract);

  const handleStartInvestigation = async () => {
    if (!caseId) {
      showAlert('Please enter a case ID', 'error');
      return;
    }

    try {
      await executeTransaction(
        () => contract!.startInvestigation(parseInt(caseId)),
        'Investigation started successfully!'
      );
      showAlert('Investigation started successfully!', 'success');
      setCaseId('');
      setShowForm(false);
      onUpdate();
    } catch (error: any) {
      showAlert(error.message || 'Failed to start investigation', 'error');
    }
  };

  const handleAuthorizeParticipant = async () => {
    if (!participantAddress || !investigationId) {
      showAlert('Please fill in all fields', 'error');
      return;
    }

    try {
      await executeTransaction(
        () => contract!.authorizeParticipant(parseInt(investigationId), participantAddress),
        'Participant authorized successfully!'
      );
      showAlert('Participant authorized successfully!', 'success');
      setParticipantAddress('');
      setInvestigationId('');
    } catch (error: any) {
      showAlert(error.message || 'Failed to authorize participant', 'error');
    }
  };

  return (
    <div className="tab-content active">
      <div className="section-header">
        <h2>
          <i className="fas fa-search"></i> Investigation Management
        </h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          <i className={`fas ${showForm ? 'fa-times' : 'fa-plus'}`}></i>
          {showForm ? 'Cancel' : 'Start New Investigation'}
        </button>
      </div>

      {showForm && (
        <div className="form-section">
          <h3>Start New Investigation</h3>
          <div className="form-group">
            <label htmlFor="caseId">Case ID:</label>
            <input
              type="number"
              id="caseId"
              className="form-control"
              placeholder="Enter case ID"
              value={caseId}
              onChange={(e) => setCaseId(e.target.value)}
            />
          </div>
          <div className="form-actions">
            <button
              className="btn btn-success"
              onClick={handleStartInvestigation}
              disabled={txState.isProcessing}
            >
              <i className="fas fa-check"></i> Start Investigation
            </button>
          </div>
        </div>
      )}

      <div className="form-section">
        <h3>Active Investigations</h3>
        <div className="list-container">
          {investigations.length === 0 ? (
            <p className="empty-state">No investigations found</p>
          ) : (
            investigations.map((inv) => (
              <div key={inv.id} className="list-item">
                <div className="list-item-header">
                  <span className="list-item-title">Investigation #{inv.id}</span>
                  <span className={`list-item-status ${getStatusClass(inv.status)}`}>
                    {getInvestigationStatusLabel(inv.status)}
                  </span>
                </div>
                <p>
                  <strong>Investigator:</strong> {formatAddress(inv.investigator)}
                </p>
                <p>
                  <strong>Started:</strong> {formatTimestamp(inv.startTime)}
                </p>
                <p>
                  <strong>Evidence:</strong> {inv.evidenceCount} | <strong>Witnesses:</strong>{' '}
                  {inv.witnessCount}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="form-section">
        <h3>Manage Participants</h3>
        <div className="form-group">
          <label htmlFor="participantAddress">Participant Address:</label>
          <input
            type="text"
            id="participantAddress"
            className="form-control"
            placeholder="0x..."
            value={participantAddress}
            onChange={(e) => setParticipantAddress(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="investigationIdForParticipant">Investigation ID:</label>
          <input
            type="number"
            id="investigationIdForParticipant"
            className="form-control"
            value={investigationId}
            onChange={(e) => setInvestigationId(e.target.value)}
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleAuthorizeParticipant}
          disabled={txState.isProcessing}
        >
          <i className="fas fa-user-plus"></i> Authorize Participant
        </button>
      </div>
    </div>
  );
};
