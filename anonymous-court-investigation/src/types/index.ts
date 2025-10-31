import { BrowserProvider, Signer, Contract } from 'ethers';

// Investigation Status Enum
export enum InvestigationStatus {
  Pending = 0,
  Active = 1,
  Completed = 2,
  Archived = 3,
}

// Evidence Type Enum
export enum EvidenceType {
  Document = 0,
  Testimony = 1,
  Physical = 2,
  Digital = 3,
}

// Verdict Type Enum
export enum VerdictType {
  NotGuilty = 0,
  Guilty = 1,
  InsufficientEvidence = 2,
}

// Investigation Interface
export interface Investigation {
  id: number;
  encryptedCaseId: number;
  investigator: string;
  status: InvestigationStatus;
  startTime: number;
  endTime: number;
  isActive: boolean;
  evidenceCount: number;
  witnessCount: number;
}

// Evidence Interface
export interface Evidence {
  id: number;
  investigationId: number;
  submitter: string;
  evidenceType: EvidenceType;
  confidentialityLevel: number;
  timestamp: number;
  isVerified: boolean;
}

// Witness Testimony Interface
export interface WitnessTestimony {
  id: number;
  investigationId: number;
  credibilityScore: number;
  encryptedTestimonyHash: number;
  isProtected: boolean;
  submissionTime: number;
}

// Verdict Interface
export interface Verdict {
  investigationId: number;
  judge: string;
  verdict: VerdictType;
  confidence: number;
  timestamp: number;
}

// User Roles Interface
export interface UserRoles {
  isInvestigator: boolean;
  isJudge: boolean;
  isAdmin: boolean;
}

// Dashboard Statistics Interface
export interface DashboardStats {
  totalInvestigations: number;
  activeInvestigations: number;
  totalEvidence: number;
  totalWitnesses: number;
}

// Wallet State Interface
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  provider: BrowserProvider | null;
  signer: Signer | null;
  contract: Contract | null;
  chainId: number | null;
}

// Transaction State Interface
export interface TransactionState {
  isProcessing: boolean;
  message: string;
  isSuccess: boolean;
  error: string | null;
}

// Alert Type
export type AlertType = 'success' | 'error' | 'warning' | 'info';

// Alert Interface
export interface Alert {
  id: string;
  type: AlertType;
  message: string;
}

// Contract Configuration
export interface ContractConfig {
  address: string;
  chainId: number;
  chainIdHex: string;
  rpcUrl: string;
  explorerUrl: string;
  networkName: string;
}

// Form Data Interfaces
export interface StartInvestigationForm {
  caseId: string;
}

export interface SubmitEvidenceForm {
  investigationId: string;
  evidenceType: string;
  confidentialityLevel: string;
}

export interface SubmitWitnessForm {
  investigationId: string;
  credibilityScore: string;
  testimonyHash: string;
}

export interface SubmitVerdictForm {
  investigationId: string;
  verdict: string;
  confidence: string;
}

export interface AuthorizeParticipantForm {
  investigationId: string;
  participantAddress: string;
}

export interface AuthorizeInvestigatorForm {
  investigatorAddress: string;
}

export interface AuthorizeJudgeForm {
  judgeAddress: string;
}

export interface ArchiveInvestigationForm {
  investigationId: string;
}

// Tab Type
export type TabType = 'dashboard' | 'investigations' | 'evidence' | 'witnesses' | 'verdicts' | 'admin';

// Context Types
export interface WalletContextType extends WalletState {
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  switchNetwork: () => Promise<void>;
}

export interface AppContextType {
  userRoles: UserRoles;
  dashboardStats: DashboardStats;
  updateDashboard: () => Promise<void>;
  updateUserRoles: () => Promise<void>;
  showAlert: (message: string, type: AlertType) => void;
  alerts: Alert[];
  removeAlert: (id: string) => void;
}
