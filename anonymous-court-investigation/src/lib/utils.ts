import { InvestigationStatus, EvidenceType, VerdictType } from '@/types';

// Format address to shortened version
export const formatAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Format timestamp to readable date
export const formatTimestamp = (timestamp: number): string => {
  if (!timestamp) return 'N/A';
  return new Date(timestamp * 1000).toLocaleString();
};

// Get investigation status label
export const getInvestigationStatusLabel = (status: InvestigationStatus): string => {
  const labels = {
    [InvestigationStatus.Pending]: 'Pending',
    [InvestigationStatus.Active]: 'Active',
    [InvestigationStatus.Completed]: 'Completed',
    [InvestigationStatus.Archived]: 'Archived',
  };
  return labels[status] || 'Unknown';
};

// Get evidence type label
export const getEvidenceTypeLabel = (type: EvidenceType): string => {
  const labels = {
    [EvidenceType.Document]: 'Document',
    [EvidenceType.Testimony]: 'Testimony',
    [EvidenceType.Physical]: 'Physical',
    [EvidenceType.Digital]: 'Digital',
  };
  return labels[type] || 'Unknown';
};

// Get verdict type label
export const getVerdictTypeLabel = (verdict: VerdictType): string => {
  const labels = {
    [VerdictType.NotGuilty]: 'Not Guilty',
    [VerdictType.Guilty]: 'Guilty',
    [VerdictType.InsufficientEvidence]: 'Insufficient Evidence',
  };
  return labels[verdict] || 'Unknown';
};

// Validate Ethereum address
export const isValidAddress = (address: string): boolean => {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
};

// Generate unique ID for alerts
export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

// Parse error message from contract error
export const parseErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Extract user-friendly message from error
    const message = error.message;

    // Common error patterns
    if (message.includes('user rejected')) {
      return 'Transaction was rejected by user';
    }
    if (message.includes('insufficient funds')) {
      return 'Insufficient funds for transaction';
    }
    if (message.includes('execution reverted')) {
      // Try to extract custom error message
      const match = message.match(/execution reverted: (.+?)"/);
      if (match && match[1]) {
        return match[1];
      }
      return 'Transaction failed - contract execution reverted';
    }

    return message;
  }

  return 'An unknown error occurred';
};

// Delay utility for async operations
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Check if MetaMask is installed
export const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

// Get status CSS class
export const getStatusClass = (status: InvestigationStatus): string => {
  const classes = {
    [InvestigationStatus.Pending]: 'status-pending',
    [InvestigationStatus.Active]: 'status-active',
    [InvestigationStatus.Completed]: 'status-completed',
    [InvestigationStatus.Archived]: 'status-archived',
  };
  return classes[status] || '';
};
