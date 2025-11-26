// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import { FHE, euint8, euint32, euint64, ebool, externalEuint64 } from "@fhevm/solidity/lib/FHE.sol";
import { SepoliaConfig } from "@fhevm/solidity/config/ZamaConfig.sol";

/**
 * @title Anonymous Court Investigation System with Advanced Privacy Features
 * @notice Privacy-preserving judicial investigations using FHE with Gateway callback mode
 * @dev Implements refund mechanism, timeout protection, and privacy-preserving computations
 */
contract AnonymousCourtInvestigation is SepoliaConfig {

    // ========== STATE VARIABLES ==========

    address public admin;
    uint32 public currentInvestigationId;

    // Constants for security and timeout protection
    uint256 public constant MIN_INVESTIGATION_DURATION = 1 days;
    uint256 public constant MAX_INVESTIGATION_DURATION = 365 days;
    uint256 public constant EVIDENCE_TIMEOUT = 30 days;
    uint256 public constant REFUND_GRACE_PERIOD = 7 days;

    // Gas optimization: HCU limits
    uint256 public constant MAX_HCU_PER_OPERATION = 100000;

    // ========== ENUMS ==========

    enum InvestigationStatus {
        Pending,
        Active,
        Completed,
        Archived,
        TimedOut       // New: For timeout protection
    }

    enum EvidenceType {
        Document,
        Testimony,
        Physical,
        Digital
    }

    enum DecryptionStatus {
        None,
        Requested,
        Completed,
        Failed         // New: For refund mechanism
    }

    // ========== STRUCTS ==========

    struct Investigation {
        euint32 encryptedCaseId;
        address investigator;
        InvestigationStatus status;
        uint256 startTime;
        uint256 endTime;
        uint256 expiryTime;        // New: Timeout protection
        bool isActive;
        address[] authorizedParticipants;
        uint256 totalStake;        // New: For refund mechanism
        euint64 obfuscatedMetric;  // New: Privacy-preserving metric
    }

    struct EncryptedEvidence {
        euint32 evidenceId;
        euint8 evidenceType;
        euint32 confidentialityLevel;
        address submitter;
        uint256 timestamp;
        uint256 expiryTime;        // New: Evidence timeout
        bool isVerified;
        uint256 stake;             // New: Refundable stake
        DecryptionStatus decryptionStatus;  // New: Gateway callback tracking
        uint256 decryptionRequestId;        // New: Gateway request ID
    }

    struct AnonymousWitness {
        euint32 witnessId;
        euint8 credibilityScore;
        euint32 encryptedTestimony;
        bool isProtected;
        uint256 submissionTime;
        uint256 stake;             // New: Witness protection stake
        bool refunded;             // New: Refund tracking
    }

    struct JudicialVote {
        euint8 verdict;
        euint8 confidence;
        address voter;
        uint256 voteTime;
        bool isSubmitted;
        euint64 encryptedWeight;   // New: Privacy-preserving vote weight
    }

    // New: Gateway callback request tracking
    struct DecryptionRequest {
        uint32 investigationId;
        uint32 evidenceId;
        address requester;
        uint256 timestamp;
        bool completed;
    }

    // ========== MAPPINGS ==========

    mapping(uint32 => Investigation) public investigations;
    mapping(uint32 => mapping(uint32 => EncryptedEvidence)) public caseEvidence;
    mapping(uint32 => mapping(uint32 => AnonymousWitness)) public witnesses;
    mapping(uint32 => mapping(address => JudicialVote)) public judicialVotes;
    mapping(uint32 => uint32) public evidenceCount;
    mapping(uint32 => uint32) public witnessCount;
    mapping(address => bool) public authorizedInvestigators;
    mapping(address => bool) public authorizedJudges;

    // New: Gateway callback and refund tracking
    mapping(uint256 => DecryptionRequest) public decryptionRequests;
    mapping(uint32 => mapping(uint32 => bool)) public evidenceRefunded;
    mapping(uint32 => mapping(uint32 => bool)) public witnessRefunded;
    mapping(uint256 => string) internal requestIdToBetId;

    uint256 public nextDecryptionRequestId = 1;

    // ========== EVENTS ==========

    event InvestigationStarted(uint32 indexed investigationId, address indexed investigator, uint256 expiryTime);
    event EvidenceSubmitted(uint32 indexed investigationId, uint32 indexed evidenceId, address indexed submitter, uint256 stake);
    event WitnessTestimonySubmitted(uint32 indexed investigationId, uint32 indexed witnessId, uint256 stake);
    event VerdictSubmitted(uint32 indexed investigationId, address indexed judge);
    event InvestigationCompleted(uint32 indexed investigationId);
    event InvestigationTimedOut(uint32 indexed investigationId);
    event ParticipantAuthorized(uint32 indexed investigationId, address indexed participant);

    // New: Gateway callback and refund events
    event DecryptionRequested(uint256 indexed requestId, uint32 indexed investigationId, uint32 indexed evidenceId);
    event DecryptionCompleted(uint256 indexed requestId, uint32 indexed investigationId, uint32 indexed evidenceId);
    event DecryptionFailed(uint256 indexed requestId, uint32 indexed investigationId, uint32 indexed evidenceId);
    event RefundIssued(uint32 indexed investigationId, uint32 indexed itemId, address indexed recipient, uint256 amount);
    event StakeReceived(uint32 indexed investigationId, address indexed sender, uint256 amount);

    // ========== MODIFIERS ==========

    modifier onlyAdmin() {
        require(msg.sender == admin, "Not authorized: admin only");
        _;
    }

    modifier onlyAuthorizedInvestigator() {
        require(authorizedInvestigators[msg.sender] || msg.sender == admin, "Not authorized: investigator only");
        _;
    }

    modifier onlyAuthorizedJudge() {
        require(authorizedJudges[msg.sender] || msg.sender == admin, "Not authorized: judge only");
        _;
    }

    modifier onlyActiveInvestigation(uint32 _investigationId) {
        require(investigations[_investigationId].isActive, "Investigation not active");
        require(investigations[_investigationId].status == InvestigationStatus.Active, "Investigation not in active status");
        require(block.timestamp < investigations[_investigationId].expiryTime, "Investigation expired");
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
        require(isAuthorized || msg.sender == admin, "Not authorized: participant only");
        _;
    }

    // New: Input validation modifiers
    modifier validDuration(uint256 _duration) {
        require(_duration >= MIN_INVESTIGATION_DURATION, "Duration too short");
        require(_duration <= MAX_INVESTIGATION_DURATION, "Duration too long");
        _;
    }

    modifier validStake() {
        require(msg.value > 0, "Stake must be greater than zero");
        _;
    }

    // ========== CONSTRUCTOR ==========

    constructor() {
        admin = msg.sender;
        currentInvestigationId = 1;
        authorizedInvestigators[msg.sender] = true;
        authorizedJudges[msg.sender] = true;
    }

    // ========== ADMIN FUNCTIONS ==========

    function authorizeInvestigator(address _investigator) external onlyAdmin {
        require(_investigator != address(0), "Invalid address");
        authorizedInvestigators[_investigator] = true;
    }

    function authorizeJudge(address _judge) external onlyAdmin {
        require(_judge != address(0), "Invalid address");
        authorizedJudges[_judge] = true;
    }

    function revokeInvestigatorAccess(address _investigator) external onlyAdmin {
        require(_investigator != address(0), "Invalid address");
        authorizedInvestigators[_investigator] = false;
    }

    function revokeJudgeAccess(address _judge) external onlyAdmin {
        require(_judge != address(0), "Invalid address");
        authorizedJudges[_judge] = false;
    }

    // ========== INVESTIGATION MANAGEMENT ==========

    /**
     * @notice Start a new investigation with timeout protection
     * @param _caseId Case identifier
     * @param _duration Investigation duration in seconds
     */
    function startInvestigation(uint32 _caseId, uint256 _duration)
        external
        onlyAuthorizedInvestigator
        validDuration(_duration)
    {
        euint32 encryptedCaseId = FHE.asEuint32(_caseId);
        uint256 expiryTime = block.timestamp + _duration;

        // Initialize with obfuscated metric for privacy-preserving division
        euint64 initialMetric = FHE.asEuint64(0);

        investigations[currentInvestigationId] = Investigation({
            encryptedCaseId: encryptedCaseId,
            investigator: msg.sender,
            status: InvestigationStatus.Active,
            startTime: block.timestamp,
            endTime: 0,
            expiryTime: expiryTime,
            isActive: true,
            authorizedParticipants: new address[](0),
            totalStake: 0,
            obfuscatedMetric: initialMetric
        });

        investigations[currentInvestigationId].authorizedParticipants.push(msg.sender);

        FHE.allowThis(encryptedCaseId);
        FHE.allow(encryptedCaseId, msg.sender);
        FHE.allowThis(initialMetric);

        emit InvestigationStarted(currentInvestigationId, msg.sender, expiryTime);
        emit ParticipantAuthorized(currentInvestigationId, msg.sender);

        currentInvestigationId++;
    }

    function authorizeParticipant(uint32 _investigationId, address _participant)
        external
        onlyAuthorizedInvestigator
        onlyActiveInvestigation(_investigationId)
    {
        require(_participant != address(0), "Invalid participant address");
        require(investigations[_investigationId].investigator == msg.sender, "Only investigation creator can authorize");

        investigations[_investigationId].authorizedParticipants.push(_participant);

        FHE.allow(investigations[_investigationId].encryptedCaseId, _participant);

        emit ParticipantAuthorized(_investigationId, _participant);
    }

    // ========== EVIDENCE MANAGEMENT WITH GATEWAY CALLBACK ==========

    /**
     * @notice Submit encrypted evidence with refundable stake
     * @param _investigationId Investigation ID
     * @param _evidenceType Type of evidence
     * @param _confidentialityLevel Confidentiality level
     */
    function submitEncryptedEvidence(
        uint32 _investigationId,
        uint8 _evidenceType,
        uint32 _confidentialityLevel
    )
        external
        payable
        onlyActiveInvestigation(_investigationId)
        onlyAuthorizedParticipant(_investigationId)
        validStake
    {
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
            expiryTime: block.timestamp + EVIDENCE_TIMEOUT,
            isVerified: false,
            stake: msg.value,
            decryptionStatus: DecryptionStatus.None,
            decryptionRequestId: 0
        });

        FHE.allowThis(encryptedEvidenceId);
        FHE.allowThis(encryptedType);
        FHE.allowThis(encryptedConfidentiality);
        FHE.allow(encryptedEvidenceId, msg.sender);
        FHE.allow(encryptedType, msg.sender);
        FHE.allow(encryptedConfidentiality, msg.sender);

        investigations[_investigationId].totalStake += msg.value;
        evidenceCount[_investigationId] = evidenceId;

        emit EvidenceSubmitted(_investigationId, evidenceId, msg.sender, msg.value);
        emit StakeReceived(_investigationId, msg.sender, msg.value);
    }

    /**
     * @notice Request decryption via Gateway callback mode
     * @param _investigationId Investigation ID
     * @param _evidenceId Evidence ID
     */
    function requestEvidenceDecryption(uint32 _investigationId, uint32 _evidenceId)
        external
        onlyAuthorizedParticipant(_investigationId)
        returns (uint256)
    {
        EncryptedEvidence storage evidence = caseEvidence[_investigationId][_evidenceId];
        require(evidence.submitter != address(0), "Evidence does not exist");
        require(evidence.decryptionStatus == DecryptionStatus.None, "Decryption already requested");

        // Create decryption request for Gateway
        bytes32[] memory cts = new bytes32[](3);
        cts[0] = FHE.toBytes32(evidence.evidenceId);
        cts[1] = FHE.toBytes32(evidence.evidenceType);
        cts[2] = FHE.toBytes32(evidence.confidentialityLevel);

        uint256 requestId = FHE.requestDecryption(cts, this.decryptionCallback.selector);

        evidence.decryptionRequestId = requestId;
        evidence.decryptionStatus = DecryptionStatus.Requested;

        decryptionRequests[requestId] = DecryptionRequest({
            investigationId: _investigationId,
            evidenceId: _evidenceId,
            requester: msg.sender,
            timestamp: block.timestamp,
            completed: false
        });

        emit DecryptionRequested(requestId, _investigationId, _evidenceId);

        return requestId;
    }

    /**
     * @notice Gateway callback for decryption results
     * @param requestId Decryption request ID
     * @param cleartexts Decrypted values
     * @param decryptionProof Cryptographic proof
     */
    function decryptionCallback(
        uint256 requestId,
        bytes memory cleartexts,
        bytes memory decryptionProof
    ) external {
        // Verify signatures from Gateway
        FHE.checkSignatures(requestId, cleartexts, decryptionProof);

        DecryptionRequest storage request = decryptionRequests[requestId];
        require(!request.completed, "Request already completed");

        EncryptedEvidence storage evidence = caseEvidence[request.investigationId][request.evidenceId];

        // Decode decrypted values
        (uint32 evidenceId, uint8 evidenceType, uint32 confidentialityLevel) =
            abi.decode(cleartexts, (uint32, uint8, uint32));

        // Mark as completed
        evidence.decryptionStatus = DecryptionStatus.Completed;
        request.completed = true;

        emit DecryptionCompleted(requestId, request.investigationId, request.evidenceId);
    }

    // ========== REFUND MECHANISM ==========

    /**
     * @notice Request refund for failed decryption or timed-out evidence
     * @param _investigationId Investigation ID
     * @param _evidenceId Evidence ID
     */
    function requestEvidenceRefund(uint32 _investigationId, uint32 _evidenceId) external {
        EncryptedEvidence storage evidence = caseEvidence[_investigationId][_evidenceId];

        require(evidence.submitter == msg.sender, "Only submitter can request refund");
        require(!evidenceRefunded[_investigationId][_evidenceId], "Already refunded");
        require(evidence.stake > 0, "No stake to refund");

        // Check conditions for refund
        bool isTimedOut = block.timestamp > evidence.expiryTime;
        bool isDecryptionFailed = evidence.decryptionStatus == DecryptionStatus.Failed;
        bool isInvestigationExpired = block.timestamp > investigations[_investigationId].expiryTime + REFUND_GRACE_PERIOD;

        require(isTimedOut || isDecryptionFailed || isInvestigationExpired, "Refund conditions not met");

        uint256 refundAmount = evidence.stake;
        evidenceRefunded[_investigationId][_evidenceId] = true;
        investigations[_investigationId].totalStake -= refundAmount;

        // Transfer refund
        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund transfer failed");

        emit RefundIssued(_investigationId, _evidenceId, msg.sender, refundAmount);
    }

    /**
     * @notice Request refund for witness testimony
     * @param _investigationId Investigation ID
     * @param _witnessId Witness ID
     */
    function requestWitnessRefund(uint32 _investigationId, uint32 _witnessId) external {
        AnonymousWitness storage witness = witnesses[_investigationId][_witnessId];

        require(!witness.refunded, "Already refunded");
        require(witness.stake > 0, "No stake to refund");

        bool isInvestigationExpired = block.timestamp > investigations[_investigationId].expiryTime + REFUND_GRACE_PERIOD;
        require(isInvestigationExpired, "Refund conditions not met");

        uint256 refundAmount = witness.stake;
        witness.refunded = true;

        (bool sent, ) = payable(msg.sender).call{value: refundAmount}("");
        require(sent, "Refund transfer failed");

        emit RefundIssued(_investigationId, _witnessId, msg.sender, refundAmount);
    }

    // ========== WITNESS SYSTEM ==========

    function submitAnonymousWitnessTestimony(
        uint32 _investigationId,
        uint8 _credibilityScore,
        uint32 _encryptedTestimonyHash
    )
        external
        payable
        onlyActiveInvestigation(_investigationId)
        validStake
    {
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
            submissionTime: block.timestamp,
            stake: msg.value,
            refunded: false
        });

        FHE.allowThis(encryptedWitnessId);
        FHE.allowThis(encryptedCredibility);
        FHE.allowThis(encryptedTestimony);

        witnessCount[_investigationId] = witnessId;

        emit WitnessTestimonySubmitted(_investigationId, witnessId, msg.value);
    }

    // ========== PRIVACY-PRESERVING JUDICIAL VOTING ==========

    /**
     * @notice Submit judicial verdict with privacy-preserving weight
     * @param _investigationId Investigation ID
     * @param _verdict Verdict (0=not guilty, 1=guilty, 2=insufficient evidence)
     * @param _confidence Confidence level (0-100)
     * @param encryptedWeight Encrypted vote weight for privacy
     * @param inputProof Cryptographic proof for encrypted weight
     */
    function submitJudicialVerdict(
        uint32 _investigationId,
        uint8 _verdict,
        uint8 _confidence,
        externalEuint64 encryptedWeight,
        bytes calldata inputProof
    )
        external
        onlyAuthorizedJudge
        onlyActiveInvestigation(_investigationId)
    {
        require(_verdict <= 2, "Verdict must be 0 (not guilty), 1 (guilty), or 2 (insufficient evidence)");
        require(_confidence <= 100, "Confidence must be 0-100");
        require(!judicialVotes[_investigationId][msg.sender].isSubmitted, "Vote already submitted");

        euint8 encryptedVerdict = FHE.asEuint8(_verdict);
        euint8 encryptedConfidence = FHE.asEuint8(_confidence);
        euint64 weight = FHE.fromExternal(encryptedWeight, inputProof);

        judicialVotes[_investigationId][msg.sender] = JudicialVote({
            verdict: encryptedVerdict,
            confidence: encryptedConfidence,
            voter: msg.sender,
            voteTime: block.timestamp,
            isSubmitted: true,
            encryptedWeight: weight
        });

        FHE.allowThis(encryptedVerdict);
        FHE.allowThis(encryptedConfidence);
        FHE.allowThis(weight);
        FHE.allow(encryptedVerdict, msg.sender);
        FHE.allow(encryptedConfidence, msg.sender);

        // Update obfuscated metric using privacy-preserving addition
        euint64 currentMetric = investigations[_investigationId].obfuscatedMetric;
        investigations[_investigationId].obfuscatedMetric = FHE.add(currentMetric, weight);
        FHE.allowThis(investigations[_investigationId].obfuscatedMetric);

        emit VerdictSubmitted(_investigationId, msg.sender);
    }

    // ========== EVIDENCE VERIFICATION ==========

    function verifyEvidence(uint32 _investigationId, uint32 _evidenceId)
        external
        onlyAuthorizedInvestigator
        onlyActiveInvestigation(_investigationId)
        onlyAuthorizedParticipant(_investigationId)
    {
        require(caseEvidence[_investigationId][_evidenceId].submitter != address(0), "Evidence does not exist");
        caseEvidence[_investigationId][_evidenceId].isVerified = true;
    }

    // ========== INVESTIGATION COMPLETION ==========

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

    /**
     * @notice Handle investigation timeout
     * @param _investigationId Investigation ID
     */
    function handleInvestigationTimeout(uint32 _investigationId) external {
        Investigation storage investigation = investigations[_investigationId];
        require(investigation.isActive, "Investigation not active");
        require(block.timestamp >= investigation.expiryTime, "Investigation not expired yet");

        investigation.status = InvestigationStatus.TimedOut;
        investigation.isActive = false;
        investigation.endTime = block.timestamp;

        emit InvestigationTimedOut(_investigationId);
    }

    function archiveInvestigation(uint32 _investigationId) external onlyAdmin {
        require(
            investigations[_investigationId].status == InvestigationStatus.Completed ||
            investigations[_investigationId].status == InvestigationStatus.TimedOut,
            "Investigation must be completed or timed out first"
        );
        investigations[_investigationId].status = InvestigationStatus.Archived;
    }

    // ========== VIEW FUNCTIONS ==========

    function getInvestigationBasicInfo(uint32 _investigationId) external view returns (
        address investigator,
        InvestigationStatus status,
        bool isActive,
        uint256 expiryTime
    ) {
        Investigation storage investigation = investigations[_investigationId];
        return (
            investigation.investigator,
            investigation.status,
            investigation.isActive,
            investigation.expiryTime
        );
    }

    function getInvestigationTimeInfo(uint32 _investigationId) external view returns (
        uint256 startTime,
        uint256 endTime,
        uint256 expiryTime
    ) {
        Investigation storage investigation = investigations[_investigationId];
        return (
            investigation.startTime,
            investigation.endTime,
            investigation.expiryTime
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

    function getInvestigationStake(uint32 _investigationId) external view returns (uint256) {
        return investigations[_investigationId].totalStake;
    }

    function getEvidenceInfo(uint32 _investigationId, uint32 _evidenceId)
        external
        view
        onlyAuthorizedParticipant(_investigationId)
        returns (
            address submitter,
            uint256 timestamp,
            uint256 expiryTime,
            bool isVerified,
            uint256 stake,
            DecryptionStatus decryptionStatus
        )
    {
        EncryptedEvidence storage evidence = caseEvidence[_investigationId][_evidenceId];
        return (
            evidence.submitter,
            evidence.timestamp,
            evidence.expiryTime,
            evidence.isVerified,
            evidence.stake,
            evidence.decryptionStatus
        );
    }

    function getWitnessInfo(uint32 _investigationId, uint32 _witnessId)
        external
        view
        onlyAuthorizedParticipant(_investigationId)
        returns (
            bool isProtected,
            uint256 submissionTime,
            uint256 stake,
            bool refunded
        )
    {
        AnonymousWitness storage witness = witnesses[_investigationId][_witnessId];
        return (
            witness.isProtected,
            witness.submissionTime,
            witness.stake,
            witness.refunded
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

    function getDecryptionRequestInfo(uint256 _requestId) external view returns (
        uint32 investigationId,
        uint32 evidenceId,
        address requester,
        uint256 timestamp,
        bool completed
    ) {
        DecryptionRequest storage request = decryptionRequests[_requestId];
        return (
            request.investigationId,
            request.evidenceId,
            request.requester,
            request.timestamp,
            request.completed
        );
    }

    // ========== FALLBACK ==========

    receive() external payable {}
}
