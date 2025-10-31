import React, { useState } from 'react';
import { Contract } from 'ethers';
import { useContract } from '@/hooks/useContract';

interface VerdictsProps {
  contract: Contract | null;
  onUpdate: () => void;
  showAlert: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Verdicts: React.FC<VerdictsProps> = ({ contract, onUpdate, showAlert }) => {
  const [investigationId, setInvestigationId] = useState('');
  const [verdict, setVerdict] = useState('0');
  const [confidence, setConfidence] = useState('');
  const [completeInvestigationId, setCompleteInvestigationId] = useState('');
  const { executeTransaction, txState } = useContract(contract);

  const handleSubmitVerdict = async () => {
    if (!investigationId || !confidence) {
      showAlert('Please fill in all fields', 'error');
      return;
    }

    try {
      await executeTransaction(
        () =>
          contract!.submitJudicialVerdict(
            parseInt(investigationId),
            parseInt(verdict),
            parseInt(confidence)
          ),
        'Verdict submitted successfully!'
      );
      showAlert('Verdict submitted successfully!', 'success');
      setInvestigationId('');
      setVerdict('0');
      setConfidence('');
    } catch (error: any) {
      showAlert(error.message || 'Failed to submit verdict', 'error');
    }
  };

  const handleCompleteInvestigation = async () => {
    if (!completeInvestigationId) {
      showAlert('Please enter investigation ID', 'error');
      return;
    }

    try {
      await executeTransaction(
        () => contract!.completeInvestigation(parseInt(completeInvestigationId)),
        'Investigation completed successfully!'
      );
      showAlert('Investigation completed successfully!', 'success');
      setCompleteInvestigationId('');
      onUpdate();
    } catch (error: any) {
      showAlert(error.message || 'Failed to complete investigation', 'error');
    }
  };

  return (
    <div className="tab-content active">
      <div className="section-header">
        <h2>
          <i className="fas fa-balance-scale"></i> Judicial Verdicts
        </h2>
      </div>

      <div className="form-section">
        <h3>Submit Verdict</h3>
        <div className="form-group">
          <label htmlFor="verdictInvestigationId">Investigation ID:</label>
          <input
            type="number"
            id="verdictInvestigationId"
            className="form-control"
            value={investigationId}
            onChange={(e) => setInvestigationId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="verdict">Verdict:</label>
          <select
            id="verdict"
            className="form-control"
            value={verdict}
            onChange={(e) => setVerdict(e.target.value)}
            required
          >
            <option value="0">Not Guilty</option>
            <option value="1">Guilty</option>
            <option value="2">Insufficient Evidence</option>
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="confidence">Confidence Level (0-100):</label>
          <input
            type="number"
            id="confidence"
            className="form-control"
            min="0"
            max="100"
            value={confidence}
            onChange={(e) => setConfidence(e.target.value)}
            required
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSubmitVerdict}
          disabled={txState.isProcessing}
        >
          <i className="fas fa-gavel"></i> Submit Verdict
        </button>
      </div>

      <div className="form-section">
        <h3>Investigation Actions</h3>
        <div className="form-group">
          <label htmlFor="completeInvestigationId">Complete Investigation ID:</label>
          <input
            type="number"
            id="completeInvestigationId"
            className="form-control"
            value={completeInvestigationId}
            onChange={(e) => setCompleteInvestigationId(e.target.value)}
            required
          />
        </div>
        <button
          className="btn btn-success"
          onClick={handleCompleteInvestigation}
          disabled={txState.isProcessing}
        >
          <i className="fas fa-check"></i> Complete Investigation
        </button>
      </div>
    </div>
  );
};
