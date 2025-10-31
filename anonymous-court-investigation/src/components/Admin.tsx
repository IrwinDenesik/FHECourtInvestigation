import React, { useState } from 'react';
import { Contract } from 'ethers';
import { useContract } from '@/hooks/useContract';
import { isValidAddress } from '@/lib/utils';

interface AdminProps {
  contract: Contract | null;
  onUpdate: () => void;
  showAlert: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void;
}

export const Admin: React.FC<AdminProps> = ({ contract, onUpdate, showAlert }) => {
  const [investigatorAddress, setInvestigatorAddress] = useState('');
  const [judgeAddress, setJudgeAddress] = useState('');
  const [archiveInvestigationId, setArchiveInvestigationId] = useState('');
  const { executeTransaction, txState } = useContract(contract);

  const handleAuthorizeInvestigator = async () => {
    if (!investigatorAddress) {
      showAlert('Please enter investigator address', 'error');
      return;
    }

    if (!isValidAddress(investigatorAddress)) {
      showAlert('Invalid investigator address', 'error');
      return;
    }

    try {
      await executeTransaction(
        () => contract!.authorizeInvestigator(investigatorAddress),
        'Investigator authorized successfully!'
      );
      showAlert('Investigator authorized successfully!', 'success');
      setInvestigatorAddress('');
      onUpdate();
    } catch (error: any) {
      showAlert(error.message || 'Failed to authorize investigator', 'error');
    }
  };

  const handleRevokeInvestigator = async () => {
    if (!investigatorAddress) {
      showAlert('Please enter investigator address', 'error');
      return;
    }

    if (!isValidAddress(investigatorAddress)) {
      showAlert('Invalid investigator address', 'error');
      return;
    }

    try {
      await executeTransaction(
        () => contract!.revokeInvestigatorAccess(investigatorAddress),
        'Investigator access revoked successfully!'
      );
      showAlert('Investigator access revoked successfully!', 'success');
      setInvestigatorAddress('');
      onUpdate();
    } catch (error: any) {
      showAlert(error.message || 'Failed to revoke investigator access', 'error');
    }
  };

  const handleAuthorizeJudge = async () => {
    if (!judgeAddress) {
      showAlert('Please enter judge address', 'error');
      return;
    }

    if (!isValidAddress(judgeAddress)) {
      showAlert('Invalid judge address', 'error');
      return;
    }

    try {
      await executeTransaction(
        () => contract!.authorizeJudge(judgeAddress),
        'Judge authorized successfully!'
      );
      showAlert('Judge authorized successfully!', 'success');
      setJudgeAddress('');
      onUpdate();
    } catch (error: any) {
      showAlert(error.message || 'Failed to authorize judge', 'error');
    }
  };

  const handleRevokeJudge = async () => {
    if (!judgeAddress) {
      showAlert('Please enter judge address', 'error');
      return;
    }

    if (!isValidAddress(judgeAddress)) {
      showAlert('Invalid judge address', 'error');
      return;
    }

    try {
      await executeTransaction(
        () => contract!.revokeJudgeAccess(judgeAddress),
        'Judge access revoked successfully!'
      );
      showAlert('Judge access revoked successfully!', 'success');
      setJudgeAddress('');
      onUpdate();
    } catch (error: any) {
      showAlert(error.message || 'Failed to revoke judge access', 'error');
    }
  };

  const handleArchiveInvestigation = async () => {
    if (!archiveInvestigationId) {
      showAlert('Please enter investigation ID', 'error');
      return;
    }

    try {
      await executeTransaction(
        () => contract!.archiveInvestigation(parseInt(archiveInvestigationId)),
        'Investigation archived successfully!'
      );
      showAlert('Investigation archived successfully!', 'success');
      setArchiveInvestigationId('');
      onUpdate();
    } catch (error: any) {
      showAlert(error.message || 'Failed to archive investigation', 'error');
    }
  };

  return (
    <div className="tab-content active">
      <div className="section-header">
        <h2>
          <i className="fas fa-cog"></i> Administration
        </h2>
      </div>

      <div className="admin-grid">
        <div className="admin-section">
          <h3>Authorize Investigator</h3>
          <div className="form-group">
            <label htmlFor="investigatorAddress">Investigator Address:</label>
            <input
              type="text"
              id="investigatorAddress"
              className="form-control"
              placeholder="0x..."
              value={investigatorAddress}
              onChange={(e) => setInvestigatorAddress(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAuthorizeInvestigator}
            disabled={txState.isProcessing}
          >
            <i className="fas fa-user-plus"></i> Authorize
          </button>
          <button
            className="btn btn-danger"
            onClick={handleRevokeInvestigator}
            disabled={txState.isProcessing}
          >
            <i className="fas fa-user-minus"></i> Revoke
          </button>
        </div>

        <div className="admin-section">
          <h3>Authorize Judge</h3>
          <div className="form-group">
            <label htmlFor="judgeAddress">Judge Address:</label>
            <input
              type="text"
              id="judgeAddress"
              className="form-control"
              placeholder="0x..."
              value={judgeAddress}
              onChange={(e) => setJudgeAddress(e.target.value)}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleAuthorizeJudge}
            disabled={txState.isProcessing}
          >
            <i className="fas fa-user-plus"></i> Authorize
          </button>
          <button
            className="btn btn-danger"
            onClick={handleRevokeJudge}
            disabled={txState.isProcessing}
          >
            <i className="fas fa-user-minus"></i> Revoke
          </button>
        </div>

        <div className="admin-section">
          <h3>Archive Investigation</h3>
          <div className="form-group">
            <label htmlFor="archiveInvestigationId">Investigation ID:</label>
            <input
              type="number"
              id="archiveInvestigationId"
              className="form-control"
              value={archiveInvestigationId}
              onChange={(e) => setArchiveInvestigationId(e.target.value)}
            />
          </div>
          <button
            className="btn btn-warning"
            onClick={handleArchiveInvestigation}
            disabled={txState.isProcessing}
          >
            <i className="fas fa-archive"></i> Archive
          </button>
        </div>
      </div>
    </div>
  );
};
