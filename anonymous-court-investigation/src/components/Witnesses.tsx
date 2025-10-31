import React, { useState } from 'react';
import { Contract } from 'ethers';
import { useContract } from '@/hooks/useContract';

interface WitnessesProps {
  contract: Contract | null;
  onUpdate: () => void;
  showAlert: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Witnesses: React.FC<WitnessesProps> = ({ contract, onUpdate, showAlert }) => {
  const [investigationId, setInvestigationId] = useState('');
  const [credibilityScore, setCredibilityScore] = useState('');
  const [testimonyHash, setTestimonyHash] = useState('');
  const { executeTransaction, txState } = useContract(contract);

  const handleSubmitTestimony = async () => {
    if (!investigationId || !credibilityScore || !testimonyHash) {
      showAlert('Please fill in all fields', 'error');
      return;
    }

    try {
      await executeTransaction(
        () =>
          contract!.submitAnonymousWitnessTestimony(
            parseInt(investigationId),
            parseInt(credibilityScore),
            parseInt(testimonyHash)
          ),
        'Anonymous testimony submitted successfully!'
      );
      showAlert('Anonymous testimony submitted successfully!', 'success');
      setInvestigationId('');
      setCredibilityScore('');
      setTestimonyHash('');
      onUpdate();
    } catch (error: any) {
      showAlert(error.message || 'Failed to submit testimony', 'error');
    }
  };

  return (
    <div className="tab-content active">
      <div className="section-header">
        <h2>
          <i className="fas fa-user-secret"></i> Anonymous Witness Testimony
        </h2>
      </div>

      <div className="form-section">
        <h3>Submit Anonymous Testimony</h3>
        <div className="form-group">
          <label htmlFor="witnessInvestigationId">Investigation ID:</label>
          <input
            type="number"
            id="witnessInvestigationId"
            className="form-control"
            value={investigationId}
            onChange={(e) => setInvestigationId(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="credibilityScore">Credibility Score (0-100):</label>
          <input
            type="number"
            id="credibilityScore"
            className="form-control"
            min="0"
            max="100"
            value={credibilityScore}
            onChange={(e) => setCredibilityScore(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="testimonyHash">Encrypted Testimony Hash:</label>
          <input
            type="number"
            id="testimonyHash"
            className="form-control"
            placeholder="Encrypted testimony hash"
            value={testimonyHash}
            onChange={(e) => setTestimonyHash(e.target.value)}
            required
          />
        </div>
        <button
          className="btn btn-primary"
          onClick={handleSubmitTestimony}
          disabled={txState.isProcessing}
        >
          <i className="fas fa-shield-alt"></i> Submit Anonymous Testimony
        </button>
      </div>

      <div className="info-card">
        <i className="fas fa-info-circle"></i>
        <h4>Anonymous Protection</h4>
        <p>
          All witness testimonies are encrypted and anonymous. Your identity is protected through
          advanced cryptographic techniques.
        </p>
      </div>
    </div>
  );
};
