// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, ebool } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

contract AnonymousCourtInvestigation is SepoliaConfig {

    address public admin;
    uint32 public currentInvestigationId;

    enum InvestigationStatus {
        Pending,
        Active,
        Completed,
        Archived
    }

    enum EvidenceType {
        Document,
        Testimony,
        Physical,
        Digital
    }

    struct Investigation {
        euint32 encryptedCaseId;
        address investigator;
        InvestigationStatus status;
        uint256 startTime;
        uint256 endTime;
        bool isActive;
        address[] authorizedParticipants;
    }

    struct EncryptedEvidence {
        euint32 evidenceId;
        euint8 evidenceType;
        euint32 confidentialityLevel;
        address submitter;
        uint256 timestamp;
        bool isVerified;
    }

    struct AnonymousWitness {
        euint32 witnessId;
        euint8 credibilityScore;
        euint32 encryptedTestimony;
        bool isProtected;
        uint256 submissionTime;
    }

    struct JudicialVote {
        euint8 verdict;
        euint8 confidence;
        address voter;
        uint256 voteTime;
        bool isSubmitted;
    }

    mapping(uint32 => Investigation) public investigations;
    mapping(uint32 => mapping(uint32 => EncryptedEvidence)) public caseEvidence;
    mapping(uint32 => mapping(uint32 => AnonymousWitness)) public witnesses;
    mapping(uint32 => mapping(address => JudicialVote)) public judicialVotes;
    mapping(uint32 => uint32) public evidenceCount;
    mapping(uint32 => uint32) public witnessCount;
    mapping(address => bool) public authorizedInvestigators;
    mapping(address => bool) public authorizedJudges;

    event InvestigationStarted(uint32 indexed investigationId, address indexed investigator);
    event EvidenceSubmitted(uint32 indexed investigationId, uint32 indexed evidenceId, address indexed submitter);
    event WitnessTestimonySubmitted(uint32 indexed investigationId, uint32 indexed witnessId);
    event VerdictSubmitted(uint32 indexed investigationId, address indexed judge);
    event InvestigationCompleted(uint32 indexed investigationId);
    event ParticipantAuthorized(uint32 indexed investigationId, address indexed participant);

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized admin");
        _;
    }

    modifier onlyAuthorizedInvestigator() {
        require(authorizedInvestigators[msg.sender] || msg.sender == admin, "Not authorized investigator");
        _;
    }

    modifier onlyAuthorizedJudge() {
        require(authorizedJudges[msg.sender] || msg.sender == admin, "Not authorized judge");
        _;
    }

    modifier onlyActiveInvestigation(uint32 _investigationId) {
        require(investigations[_investigationId].isActive, "Investigation not active");
        require(investigations[_investigationId].status == InvestigationStatus.Active, "Investigation not in active status");
        _;
    }

    modifier onlyAuthorizedParticipant(uint32 _investigationId) {
        Investigation storage investigation = investigations[_investigationId];
        bool isAuthorized = false;
        for (uint i = 0; i < investigation.authorizedParticipants.length; i++) {
            if (investigation.authorizedParticipants[i] == msg.sender) {
                isAuthorized = true;
                break;
            }
        }
        require(isAuthorized || msg.sender == admin, "Not authorized participant");
        _;
    }

    constructor() {
        admin = msg.sender;
        currentInvestigationId = 1;
        authorizedInvestigators[msg.sender] = true;
        authorizedJudges[msg.sender] = true;
    }

    function authorizeInvestigator(address _investigator) external onlyAdmin {
        authorizedInvestigators[_investigator] = true;
    }

    function authorizeJudge(address _judge) external onlyAdmin {
        authorizedJudges[_judge] = true;
    }

    function revokeInvestigatorAccess(address _investigator) external onlyAdmin {
        authorizedInvestigators[_investigator] = false;
    }

    function revokeJudgeAccess(address _judge) external onlyAdmin {
        authorizedJudges[_judge] = false;
    }

    function startInvestigation(uint32 _caseId) external onlyAuthorizedInvestigator {
        euint32 encryptedCaseId = FHE.asEuint32(_caseId);

        investigations[currentInvestigationId] = Investigation({
            encryptedCaseId: encryptedCaseId,
            investigator: msg.sender,
            status: InvestigationStatus.Active,
            startTime: block.timestamp,
            endTime: 0,
            isActive: true,
            authorizedParticipants: new address[](0)
        });

        investigations[currentInvestigationId].authorizedParticipants.push(msg.sender);

        FHE.allowThis(encryptedCaseId);
        FHE.allow(encryptedCaseId, msg.sender);

        emit InvestigationStarted(currentInvestigationId, msg.sender);
        emit ParticipantAuthorized(currentInvestigationId, msg.sender);

        currentInvestigationId++;
    }

    function authorizeParticipant(uint32 _investigationId, address _participant)
        external
        onlyAuthorizedInvestigator
        onlyActiveInvestigation(_investigationId)
    {
        require(investigations[_investigationId].investigator == msg.sender, "Only investigation creator can authorize");

        investigations[_investigationId].authorizedParticipants.push(_participant);

        FHE.allow(investigations[_investigationId].encryptedCaseId, _participant);

        emit ParticipantAuthorized(_investigationId, _participant);
    }

    function submitEncryptedEvidence(
        uint32 _investigationId,
        uint8 _evidenceType,
        uint32 _confidentialityLevel
    ) external onlyActiveInvestigation(_investigationId) onlyAuthorizedParticipant(_investigationId) {
        require(_evidenceType <= uint8(EvidenceType.Digital), "Invalid evidence type");
        require(_confidentialityLevel > 0, "Confidentiality level must be greater than 0");

        uint32 evidenceId = evidenceCount[_investigationId] + 1;

        euint32 encryptedEvidenceId = FHE.asEuint32(evidenceId);
        euint8 encryptedType = FHE.asEuint8(_evidenceType);
        euint32 encryptedConfidentiality = FHE.asEuint32(_confidentialityLevel);

        caseEvidence[_investigationId][evidenceId] = EncryptedEvidence({
            evidenceId: encryptedEvidenceId,
            evidenceType: encryptedType,
            confidentialityLevel: encryptedConfidentiality,
            submitter: msg.sender,
            timestamp: block.timestamp,
            isVerified: false
        });

        FHE.allowThis(encryptedEvidenceId);
        FHE.allowThis(encryptedType);
        FHE.allowThis(encryptedConfidentiality);
        FHE.allow(encryptedEvidenceId, msg.sender);
        FHE.allow(encryptedType, msg.sender);
        FHE.allow(encryptedConfidentiality, msg.sender);

        evidenceCount[_investigationId] = evidenceId;

        emit EvidenceSubmitted(_investigationId, evidenceId, msg.sender);
    }

    function submitAnonymousWitnessTestimony(
        uint32 _investigationId,
        uint8 _credibilityScore,
        uint32 _encryptedTestimonyHash
    ) external onlyActiveInvestigation(_investigationId) {
        require(_credibilityScore <= 100, "Credibility score must be 0-100");

        uint32 witnessId = witnessCount[_investigationId] + 1;

        euint32 encryptedWitnessId = FHE.asEuint32(witnessId);
        euint8 encryptedCredibility = FHE.asEuint8(_credibilityScore);
        euint32 encryptedTestimony = FHE.asEuint32(_encryptedTestimonyHash);

        witnesses[_investigationId][witnessId] = AnonymousWitness({
            witnessId: encryptedWitnessId,
            credibilityScore: encryptedCredibility,
            encryptedTestimony: encryptedTestimony,
            isProtected: true,
            submissionTime: block.timestamp
        });

        FHE.allowThis(encryptedWitnessId);
        FHE.allowThis(encryptedCredibility);
        FHE.allowThis(encryptedTestimony);

        witnessCount[_investigationId] = witnessId;

        emit WitnessTestimonySubmitted(_investigationId, witnessId);
    }

    function submitJudicialVerdict(
        uint32 _investigationId,
        uint8 _verdict,
        uint8 _confidence
    ) external onlyAuthorizedJudge onlyActiveInvestigation(_investigationId) {
        require(_verdict <= 2, "Verdict must be 0 (not guilty), 1 (guilty), or 2 (insufficient evidence)");
        require(_confidence <= 100, "Confidence must be 0-100");
        require(!judicialVotes[_investigationId][msg.sender].isSubmitted, "Vote already submitted");

        euint8 encryptedVerdict = FHE.asEuint8(_verdict);
        euint8 encryptedConfidence = FHE.asEuint8(_confidence);

        judicialVotes[_investigationId][msg.sender] = JudicialVote({
            verdict: encryptedVerdict,
            confidence: encryptedConfidence,
            voter: msg.sender,
            voteTime: block.timestamp,
            isSubmitted: true
        });

        FHE.allowThis(encryptedVerdict);
        FHE.allowThis(encryptedConfidence);
        FHE.allow(encryptedVerdict, msg.sender);
        FHE.allow(encryptedConfidence, msg.sender);

        emit VerdictSubmitted(_investigationId, msg.sender);
    }

    function verifyEvidence(uint32 _investigationId, uint32 _evidenceId)
        external
        onlyAuthorizedInvestigator
        onlyActiveInvestigation(_investigationId)
        onlyAuthorizedParticipant(_investigationId)
    {
        require(caseEvidence[_investigationId][_evidenceId].submitter != address(0), "Evidence does not exist");
        caseEvidence[_investigationId][_evidenceId].isVerified = true;
    }

    function completeInvestigation(uint32 _investigationId)
        external
        onlyAuthorizedInvestigator
        onlyActiveInvestigation(_investigationId)
    {
        require(investigations[_investigationId].investigator == msg.sender, "Only investigation creator can complete");

        investigations[_investigationId].status = InvestigationStatus.Completed;
        investigations[_investigationId].isActive = false;
        investigations[_investigationId].endTime = block.timestamp;

        emit InvestigationCompleted(_investigationId);
    }

    function archiveInvestigation(uint32 _investigationId) external onlyAdmin {
        require(investigations[_investigationId].status == InvestigationStatus.Completed, "Investigation must be completed first");
        investigations[_investigationId].status = InvestigationStatus.Archived;
    }

    function getInvestigationBasicInfo(uint32 _investigationId) external view returns (
        address investigator,
        InvestigationStatus status,
        bool isActive
    ) {
        Investigation storage investigation = investigations[_investigationId];
        return (
            investigation.investigator,
            investigation.status,
            investigation.isActive
        );
    }

    function getInvestigationTimeInfo(uint32 _investigationId) external view returns (
        uint256 startTime,
        uint256 endTime
    ) {
        Investigation storage investigation = investigations[_investigationId];
        return (
            investigation.startTime,
            investigation.endTime
        );
    }

    function getInvestigationCounts(uint32 _investigationId) external view returns (
        uint32 evidenceCountTotal,
        uint32 witnessCountTotal
    ) {
        return (
            evidenceCount[_investigationId],
            witnessCount[_investigationId]
        );
    }

    function getEvidenceInfo(uint32 _investigationId, uint32 _evidenceId)
        external
        view
        onlyAuthorizedParticipant(_investigationId)
        returns (
            address submitter,
            uint256 timestamp,
            bool isVerified
        )
    {
        EncryptedEvidence storage evidence = caseEvidence[_investigationId][_evidenceId];
        return (
            evidence.submitter,
            evidence.timestamp,
            evidence.isVerified
        );
    }

    function getWitnessInfo(uint32 _investigationId, uint32 _witnessId)
        external
        view
        onlyAuthorizedParticipant(_investigationId)
        returns (
            bool isProtected,
            uint256 submissionTime
        )
    {
        AnonymousWitness storage witness = witnesses[_investigationId][_witnessId];
        return (
            witness.isProtected,
            witness.submissionTime
        );
    }

    function isAuthorizedForInvestigation(uint32 _investigationId, address _participant)
        external
        view
        returns (bool)
    {
        Investigation storage investigation = investigations[_investigationId];
        for (uint i = 0; i < investigation.authorizedParticipants.length; i++) {
            if (investigation.authorizedParticipants[i] == _participant) {
                return true;
            }
        }
        return false;
    }

    function getParticipantCount(uint32 _investigationId) external view returns (uint256) {
        return investigations[_investigationId].authorizedParticipants.length;
    }

    function hasVoted(uint32 _investigationId, address _judge) external view returns (bool) {
        return judicialVotes[_investigationId][_judge].isSubmitted;
    }
}