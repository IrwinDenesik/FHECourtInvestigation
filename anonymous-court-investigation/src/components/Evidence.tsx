import React, { useState } from 'react';
import { Contract } from 'ethers';
import { useContract } from '@/hooks/useContract';
import { EvidenceType } from '@/types';

interface EvidenceProps {
  contract: Contract | null;
  onUpdate: () => void;
  showAlert: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Evidence: React.FC<EvidenceProps> = ({ contract, onUpdate, showAlert }) => {
  const [investigationId, setInvestigationId] = useState('');
  const [evidenceType, setEvidenceType] = useState('0');
  const [confidentialityLevel, setConfidentialityLevel] = useState('');
  const [verifyInvestigationId, setVerifyInvestigationId] = useState('');
  const [verifyEvidenceId, setVerifyEvidenceId] = useState('');
  const { executeTransaction, txState } = useContract(contract);

  const handleSubmitEvidence = async () => {
    if (!investigationId || !confidentialityLevel) {
      showAlert('Please fill in all fields', 'error');
      return;
    }

    try {
      await executeTransaction(
        () =>
          contract!.submitEncryptedEvidence(
            parseInt(investigationId),
            parseInt(evidenceType),
            parseInt(confidentialityLevel)
          ),
        'Evidence submitted successfully!'
      );
      showAlert('Evidence submitted successfully!', 'success');
      setInvestigationId('');
      setEvidenceType('0');
      setConfidentialityLevel('');
      onUpdate();
    } catch (error: any) {
      showAlert(error.message || 'Failed to submit evidence', 'error');
    }
  };

  const handleVerifyEvidence = async () => {
    if (!verifyInvestigationId || !verifyEvidenceId) {
      showAlert('Please fill in all fields', 'error');
      return;
    }

    try {
      await executeTransaction(
        () =>
          contract!.verifyEvidence(parseInt(verifyInvestigationId), parseInt(verifyEvidenceId)),
        'Evidence verified successfully!'
      );
      showAlert('Evidence verified successfully!', 'success');
      setVerifyInvestigationId('');
      setVerifyEvidenceId('');
    } catch (error: any) {
      showAlert(error.message || 'Failed to verify evidence', 'error');
    }
  };

  return (
    <div className="tab-content active">
      <div className="section-header">
        <h2>
          <i className="fas fa-file-alt"></i> Evidence Management
        </h2>
      </div>

      <div className="form-section">
        <h3>Submit Evidence</h3>
        <div className="form-group">
          <label htmlFor="evidenceInvestigationId">Investigation ID:</label>
          <input
            type="number"
            id="evidenceInvestigationId"
            className="form-control"
            value={investigationId}
            onChange={(e) => setInvestigationId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="evidenceType">Evidence Type:</label>
          <select
            id="evidenceType"
            className="form-control"
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value)}
            required
          >
            <option value="0">Document</option>
            <option value="1">Testimony</option>
            <option value="2">Physical</option>
            <option value="3">Digital</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="confidentialityLevel">Confidentiality Level (1-100):</label>
          <input
            type="number"
            id="confidentialityLevel"
            className="form-control"
            min="1"
            max="100"
            value={confidentialityLevel}
            onChange={(e) => setConfidentialityLevel(e.target.value)}
            required
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSubmitEvidence}
          disabled={txState.isProcessing}
        >
          <i className="fas fa-upload"></i> Submit Evidence
        </button>
      </div>

      <div className="form-section">
        <h3>Verify Evidence</h3>
        <div className="form-group">
          <label htmlFor="verifyInvestigationId">Investigation ID:</label>
          <input
            type="number"
            id="verifyInvestigationId"
            className="form-control"
            value={verifyInvestigationId}
            onChange={(e) => setVerifyInvestigationId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="verifyEvidenceId">Evidence ID:</label>
          <input
            type="number"
            id="verifyEvidenceId"
            className="form-control"
            value={verifyEvidenceId}
            onChange={(e) => setVerifyEvidenceId(e.target.value)}
            required
          />
        </div>
        <button
          className="btn btn-success"
          onClick={handleVerifyEvidence}
          disabled={txState.isProcessing}
        >
          <i className="fas fa-check-circle"></i> Verify Evidence
        </button>
      </div>
    </div>
  );
};
