import { ContractConfig } from '@/types';

export const CONTRACT_CONFIG: ContractConfig = {
  address: "0x88907E07dAAda5Dae20C412B12B293DBC172bF54",
  chainId: 11155111, // Sepolia Test Network
  chainIdHex: "0xaa36a7",
  rpcUrl: "https://sepolia.infura.io/v3/",
  explorerUrl: "https://sepolia.etherscan.io",
  networkName: "Sepolia Test Network",
};

export const CONTRACT_ABI = [
  "function admin() public view returns (address)",
  "function currentInvestigationId() public view returns (uint32)",
  "function authorizedInvestigators(address) public view returns (bool)",
  "function authorizedJudges(address) public view returns (bool)",
  "function investigations(uint32) public view returns (tuple(uint32 encryptedCaseId, address investigator, uint8 status, uint256 startTime, uint256 endTime, bool isActive, address[] authorizedParticipants))",

  "function authorizeInvestigator(address _investigator) external",
  "function authorizeJudge(address _judge) external",
  "function revokeInvestigatorAccess(address _investigator) external",
  "function revokeJudgeAccess(address _judge) external",

  "function startInvestigation(uint32 _caseId) external",
  "function authorizeParticipant(uint32 _investigationId, address _participant) external",
  "function submitEncryptedEvidence(uint32 _investigationId, uint8 _evidenceType, uint32 _confidentialityLevel) external",
  "function submitAnonymousWitnessTestimony(uint32 _investigationId, uint8 _credibilityScore, uint32 _encryptedTestimonyHash) external",
  "function submitJudicialVerdict(uint32 _investigationId, uint8 _verdict, uint8 _confidence) external",
  "function verifyEvidence(uint32 _investigationId, uint32 _evidenceId) external",
  "function completeInvestigation(uint32 _investigationId) external",
  "function archiveInvestigation(uint32 _investigationId) external",

  "function getInvestigationBasicInfo(uint32 _investigationId) external view returns (address investigator, uint8 status, bool isActive)",
  "function getInvestigationTimeInfo(uint32 _investigationId) external view returns (uint256 startTime, uint256 endTime)",
  "function getInvestigationCounts(uint32 _investigationId) external view returns (uint32 evidenceCountTotal, uint32 witnessCountTotal)",
  "function getEvidenceInfo(uint32 _investigationId, uint32 _evidenceId) external view returns (address submitter, uint256 timestamp, bool isVerified)",
  "function getWitnessInfo(uint32 _investigationId, uint32 _witnessId) external view returns (bool isProtected, uint256 submissionTime)",
  "function isAuthorizedForInvestigation(uint32 _investigationId, address _participant) external view returns (bool)",
  "function getParticipantCount(uint32 _investigationId) external view returns (uint256)",
  "function hasVoted(uint32 _investigationId, address _judge) external view returns (bool)",

  "event InvestigationStarted(uint32 indexed investigationId, address indexed investigator)",
  "event EvidenceSubmitted(uint32 indexed investigationId, uint32 indexed evidenceId, address indexed submitter)",
  "event WitnessTestimonySubmitted(uint32 indexed investigationId, uint32 indexed witnessId)",
  "event VerdictSubmitted(uint32 indexed investigationId, address indexed judge)",
  "event InvestigationCompleted(uint32 indexed investigationId)",
  "event ParticipantAuthorized(uint32 indexed investigationId, address indexed participant)"
];
