// Anonymous Court Investigation System DApp
class AnonymousCourtInvestigationApp {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;

        // Contract configuration - Update these values
        this.CONTRACT_ADDRESS = "0x88907E07dAAda5Dae20C412B12B293DBC172bF54"; // Replace with deployed contract address
        this.CHAIN_ID = 11155111; // Sepolia Test Network
        this.CHAIN_ID_HEX = "0xaa36a7"; // Sepolia in hex
        this.RPC_URL = "https://sepolia.infura.io/v3/";
        this.EXPLORER_URL = "https://sepolia.etherscan.io";

        this.CONTRACT_ABI = [
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

        this.investigationStatuses = {
            0: "Pending",
            1: "Active",
            2: "Completed",
            3: "Archived"
        };

        this.evidenceTypes = {
            0: "Document",
            1: "Testimony",
            2: "Physical",
            3: "Digital"
        };

        this.verdictTypes = {
            0: "Not Guilty",
            1: "Guilty",
            2: "Insufficient Evidence"
        };

        this.init();
    }

    async init() {
        // Check if ethers is loaded
        if (typeof ethers === 'undefined') {
            console.error('Ethers.js not loaded');
            this.showAlert('Failed to load ethers.js library. Please check your internet connection and refresh the page.', 'error');
            return;
        }

        console.log('Ethers.js loaded successfully');
        this.setupEventListeners();
        this.setupTabNavigation();
        await this.checkWalletConnection();
        this.showTransactionModal = this.showTransactionModal.bind(this);
        this.hideTransactionModal = this.hideTransactionModal.bind(this);
        console.log('App initialization complete');
    }

    setupEventListeners() {
        console.log('Setting up event listeners...');

        // Wallet connection
        const connectBtn = document.getElementById('connectWallet');
        const disconnectBtn = document.getElementById('disconnectWallet');

        if (connectBtn) {
            connectBtn.addEventListener('click', (e) => {
                console.log('Connect wallet button clicked');
                e.preventDefault();
                this.connectWallet();
            });
            console.log('Connect wallet listener added');
        } else {
            console.error('Connect wallet button not found');
        }

        if (disconnectBtn) {
            disconnectBtn.addEventListener('click', (e) => {
                console.log('Disconnect wallet button clicked');
                e.preventDefault();
                this.disconnectWallet();
            });
            console.log('Disconnect wallet listener added');
        } else {
            console.error('Disconnect wallet button not found');
        }

        // Investigation management
        document.getElementById('startInvestigationBtn').addEventListener('click', () => this.toggleInvestigationForm());
        document.getElementById('submitInvestigation').addEventListener('click', () => this.startInvestigation());
        document.getElementById('cancelInvestigation').addEventListener('click', () => this.toggleInvestigationForm());
        document.getElementById('authorizeParticipant').addEventListener('click', () => this.authorizeParticipant());

        // Evidence management
        document.getElementById('submitEvidence').addEventListener('click', () => this.submitEvidence());
        document.getElementById('verifyEvidence').addEventListener('click', () => this.verifyEvidence());

        // Witness testimony
        document.getElementById('submitWitnessTestimony').addEventListener('click', () => this.submitWitnessTestimony());

        // Judicial verdicts
        document.getElementById('submitVerdict').addEventListener('click', () => this.submitVerdict());
        document.getElementById('completeInvestigation').addEventListener('click', () => this.completeInvestigation());

        // Admin functions
        document.getElementById('authorizeInvestigator').addEventListener('click', () => this.authorizeInvestigator());
        document.getElementById('revokeInvestigator').addEventListener('click', () => this.revokeInvestigatorAccess());
        document.getElementById('authorizeJudge').addEventListener('click', () => this.authorizeJudge());
        document.getElementById('revokeJudge').addEventListener('click', () => this.revokeJudgeAccess());
        document.getElementById('archiveInvestigation').addEventListener('click', () => this.archiveInvestigation());

        // Modal
        document.getElementById('closeModal').addEventListener('click', () => this.hideTransactionModal());
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tabId = button.getAttribute('data-tab');

                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    async checkWalletConnection() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                console.log('Checking existing wallet connection...');
                const accounts = await window.ethereum.request({ method: 'eth_accounts' });
                if (accounts.length > 0) {
                    console.log('Found existing connection, auto-connecting...');
                    await this.connectWallet();
                } else {
                    console.log('No existing wallet connection found');
                    this.showAlert('Please connect wallet to get started', 'info');
                }
            } catch (error) {
                console.error('Error checking wallet connection:', error);
                this.showAlert('Failed to check wallet connection', 'warning');
            }
        } else {
            console.log('No Ethereum provider detected');
            this.showAlert('No wallet detected, please install MetaMask', 'warning');
        }
    }

    async connectWallet() {
        console.log('connectWallet method called');
        try {
            if (typeof window.ethereum === 'undefined') {
                this.showAlert('Please install MetaMask or another Ethereum wallet', 'error');
                return;
            }

            console.log('Requesting wallet accounts...');
            // Request account access
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });

            if (accounts.length === 0) {
                this.showAlert('Please authorize access in your wallet', 'error');
                return;
            }

            console.log('Accounts received:', accounts);
            this.userAddress = accounts[0];
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();

            // Check current network
            const network = await this.provider.getNetwork();
            console.log('Current network:', network);

            // Check if on correct network
            if (network.chainId !== this.CHAIN_ID) {
                console.log(`Current network: ${network.name} (${network.chainId}), expected: ${this.CHAIN_ID}`);

                // Show user-friendly network switch message
                const shouldSwitch = confirm(
                    `This application requires Sepolia Test Network (Chain ID: ${this.CHAIN_ID}).\n\n` +
                    `Current network: ${network.name} (${network.chainId})\n\n` +
                    `Would you like to switch to Sepolia Test Network?\n\n` +
                    `Note: This is the official Ethereum test network.`
                );

                if (shouldSwitch) {
                    try {
                        await this.switchNetwork();
                    } catch (switchError) {
                        console.log('Network switch failed:', switchError);
                        this.showAlert(`Network switch failed. Please manually switch to Sepolia Test Network in MetaMask.`, 'warning');
                    }
                } else {
                    this.showAlert(`Warning: Application may not work properly on ${network.name}`, 'warning');
                }
            }

            // Initialize contract if address is set
            if (this.CONTRACT_ADDRESS !== "0x...") {
                try {
                    this.contract = new ethers.Contract(this.CONTRACT_ADDRESS, this.CONTRACT_ABI, this.signer);
                    console.log('Contract initialized:', this.CONTRACT_ADDRESS);

                    // Test contract connection
                    try {
                        await this.contract.currentInvestigationId();
                        this.showAlert('Connected to Anonymous Court Investigation contract!', 'success');
                    } catch (testError) {
                        console.error('Contract test failed:', testError);
                        this.showAlert('Contract connection failed - please verify deployment', 'warning');
                    }
                } catch (contractError) {
                    console.error('Contract initialization failed:', contractError);
                    this.showAlert('Contract initialization failed', 'warning');
                }
            } else {
                console.log('Contract address not set - showing deployment instructions');
                this.showAlert('Please deploy the contract and update CONTRACT_ADDRESS in app.js', 'info');
            }

            this.updateWalletUI();
            await this.updateDashboard();
            await this.updateUserRoles();

            this.showAlert('Wallet connected successfully!', 'success');

        } catch (error) {
            console.error('Error connecting wallet:', error);

            // Handle specific error types
            if (error.code === 4001) {
                this.showAlert('User rejected connection', 'error');
            } else if (error.code === -32002) {
                this.showAlert('Wallet connection pending, please check your wallet', 'warning');
            } else {
                this.showAlert('Failed to connect wallet: ' + error.message, 'error');
            }
        }
    }

    async switchNetwork() {
        try {
            console.log('Attempting to switch to Sepolia Test Network...');
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: this.CHAIN_ID_HEX }],
            });
            console.log('Successfully switched to Sepolia Test Network');
        } catch (error) {
            console.log('Switch failed, error code:', error.code);

            if (error.code === 4902) {
                // Network not added to MetaMask - show user explanation
                const addNetwork = confirm(
                    `Sepolia Test Network is not in your MetaMask.\n\n` +
                    `This is the official Ethereum test network, widely used for testing applications.\n\n` +
                    `Network Details:\n` +
                    `• Name: Sepolia Test Network\n` +
                    `• Chain ID: 11155111\n` +
                    `• Currency: ETH (test tokens)\n` +
                    `• RPC: Infura Public Endpoint\n\n` +
                    `Would you like to add this network?`
                );

                if (addNetwork) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [{
                                chainId: this.CHAIN_ID_HEX,
                                chainName: 'Sepolia Test Network',
                                nativeCurrency: {
                                    name: 'ETH',
                                    symbol: 'ETH',
                                    decimals: 18
                                },
                                rpcUrls: [this.RPC_URL],
                                blockExplorerUrls: [this.EXPLORER_URL]
                            }]
                        });
                        console.log('Successfully added Sepolia Test Network');
                        this.showAlert('Sepolia Test Network added successfully!', 'success');
                    } catch (addError) {
                        console.error('Failed to add network:', addError);
                        this.showAlert('Failed to add network. Please add manually in MetaMask.', 'error');
                        throw addError;
                    }
                } else {
                    throw new Error('User cancelled network addition');
                }
            } else if (error.code === 4001) {
                // User rejected
                this.showAlert('Network switch cancelled by user', 'info');
                throw error;
            } else {
                // Other error
                console.error('Network switch error:', error);
                throw error;
            }
        }
    }

    disconnectWallet() {
        console.log('Disconnecting wallet...');
        this.provider = null;
        this.signer = null;
        this.contract = null;
        this.userAddress = null;
        this.updateWalletUI();
        this.showAlert('Wallet disconnected successfully', 'info');
    }

    updateWalletUI() {
        const connectBtn = document.getElementById('connectWallet');
        const walletInfo = document.getElementById('walletInfo');
        const walletAddress = document.getElementById('walletAddress');

        if (this.userAddress) {
            connectBtn.style.display = 'none';
            walletInfo.style.display = 'flex';
            walletAddress.textContent = `${this.userAddress.slice(0, 6)}...${this.userAddress.slice(-4)}`;
        } else {
            connectBtn.style.display = 'inline-flex';
            walletInfo.style.display = 'none';
        }
    }

    async updateDashboard() {
        if (!this.contract) {
            this.showContractNotDeployedMessage();
            return;
        }

        try {
            const currentId = await this.contract.currentInvestigationId();
            document.getElementById('totalInvestigations').textContent = currentId.sub(1).toString();

            // Count active investigations
            let activeCount = 0;
            let totalEvidence = 0;
            let totalWitnesses = 0;

            for (let i = 1; i < currentId; i++) {
                try {
                    const [investigator, status, isActive] = await this.contract.getInvestigationBasicInfo(i);
                    if (isActive && status === 1) {
                        activeCount++;
                    }

                    const [evidenceCount, witnessCount] = await this.contract.getInvestigationCounts(i);
                    totalEvidence += evidenceCount.toNumber();
                    totalWitnesses += witnessCount.toNumber();
                } catch (error) {
                    // Investigation might not exist
                    continue;
                }
            }

            document.getElementById('activeInvestigations').textContent = activeCount.toString();
            document.getElementById('totalEvidence').textContent = totalEvidence.toString();
            document.getElementById('totalWitnesses').textContent = totalWitnesses.toString();

        } catch (error) {
            console.error('Error updating dashboard:', error);
        }
    }

    async updateUserRoles() {
        if (!this.contract || !this.userAddress) return;

        try {
            const isInvestigator = await this.contract.authorizedInvestigators(this.userAddress);
            const isJudge = await this.contract.authorizedJudges(this.userAddress);
            const admin = await this.contract.admin();
            const isAdmin = admin.toLowerCase() === this.userAddress.toLowerCase();

            // Update investigator role
            const investigatorRole = document.getElementById('investigatorRole');
            const investigatorStatus = document.getElementById('investigatorStatus');
            if (isInvestigator) {
                investigatorRole.classList.add('authorized');
                investigatorStatus.textContent = 'Authorized';
            } else {
                investigatorRole.classList.remove('authorized');
                investigatorStatus.textContent = 'Not Authorized';
            }

            // Update judge role
            const judgeRole = document.getElementById('judgeRole');
            const judgeStatus = document.getElementById('judgeStatus');
            if (isJudge) {
                judgeRole.classList.add('authorized');
                judgeStatus.textContent = 'Authorized';
            } else {
                judgeRole.classList.remove('authorized');
                judgeStatus.textContent = 'Not Authorized';
            }

            // Update admin role
            const adminRole = document.getElementById('adminRole');
            const adminStatus = document.getElementById('adminStatus');
            if (isAdmin) {
                adminRole.classList.add('admin');
                adminStatus.textContent = 'Administrator';
            } else {
                adminRole.classList.remove('admin');
                adminStatus.textContent = 'Not Admin';
            }

        } catch (error) {
            console.error('Error updating user roles:', error);
        }
    }

    showContractNotDeployedMessage() {
        const dashboardContent = document.getElementById('dashboard');
        dashboardContent.innerHTML = `
            <div class="alert alert-warning">
                <h3><i class="fas fa-exclamation-triangle"></i> Contract Not Deployed</h3>
                <p>The Anonymous Court Investigation smart contract needs to be deployed before you can use this application.</p>

                <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 15px 0;">
                    <h4><i class="fas fa-rocket"></i> Quick Deployment Options:</h4>
                    <ul>
                        <li><strong>Using Hardhat:</strong> Professional deployment with full control</li>
                        <li><strong>Using Remix IDE:</strong> Browser-based deployment (easier)</li>
                    </ul>
                </div>

                <p><strong>Current Status:</strong></p>
                <ul>
                    <li>CONTRACT_ADDRESS: <code>${this.CONTRACT_ADDRESS}</code></li>
                    <li>Network: Sepolia Test Network (${this.CHAIN_ID})</li>
                    <li>RPC: ${this.RPC_URL}</li>
                </ul>

                <div style="text-align: center; margin: 20px 0;">
                    <a href="deploy-guide.html" target="_blank" class="btn btn-primary">
                        <i class="fas fa-book"></i> View Deployment Guide
                    </a>
                    <a href="network-info.html" target="_blank" class="btn btn-secondary">
                        <i class="fas fa-info-circle"></i> About Zama Devnet
                    </a>
                    <button onclick="window.location.reload()" class="btn btn-success">
                        <i class="fas fa-refresh"></i> Refresh After Deployment
                    </button>
                </div>

                <div style="background: #d1ecf1; padding: 10px; border-radius: 5px; margin-top: 15px;">
                    <small><i class="fas fa-lightbulb"></i> <strong>Tip:</strong> After deploying, update the CONTRACT_ADDRESS in app.js and refresh this page.</small>
                </div>
            </div>
        `;
    }

    toggleInvestigationForm() {
        const form = document.getElementById('startInvestigationForm');
        const btn = document.getElementById('startInvestigationBtn');

        if (form.style.display === 'none' || !form.style.display) {
            form.style.display = 'block';
            btn.textContent = 'Cancel';
            btn.innerHTML = '<i class="fas fa-times"></i> Cancel';
        } else {
            form.style.display = 'none';
            btn.innerHTML = '<i class="fas fa-plus"></i> Start New Investigation';
            document.getElementById('caseId').value = '';
        }
    }

    async startInvestigation() {
        if (!this.contract) {
            this.showAlert('Contract not connected', 'error');
            return;
        }

        const caseId = document.getElementById('caseId').value;
        if (!caseId) {
            this.showAlert('Please enter a case ID', 'error');
            return;
        }

        try {
            this.showTransactionModal('Starting investigation...');

            const tx = await this.contract.startInvestigation(parseInt(caseId));
            await tx.wait();

            this.hideTransactionModal();
            this.showAlert('Investigation started successfully!', 'success');
            this.toggleInvestigationForm();
            await this.updateDashboard();

        } catch (error) {
            this.hideTransactionModal();
            console.error('Error starting investigation:', error);
            this.showAlert('Failed to start investigation: ' + error.message, 'error');
        }
    }

    async authorizeParticipant() {
        if (!this.contract) {
            this.showAlert('Contract not connected', 'error');
            return;
        }

        const participantAddress = document.getElementById('participantAddress').value;
        const investigationId = document.getElementById('investigationIdForParticipant').value;

        if (!participantAddress || !investigationId) {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }

        if (!ethers.utils.isAddress(participantAddress)) {
            this.showAlert('Invalid participant address', 'error');
            return;
        }

        try {
            this.showTransactionModal('Authorizing participant...');

            const tx = await this.contract.authorizeParticipant(parseInt(investigationId), participantAddress);
            await tx.wait();

            this.hideTransactionModal();
            this.showAlert('Participant authorized successfully!', 'success');
            document.getElementById('participantAddress').value = '';
            document.getElementById('investigationIdForParticipant').value = '';

        } catch (error) {
            this.hideTransactionModal();
            console.error('Error authorizing participant:', error);
            this.showAlert('Failed to authorize participant: ' + error.message, 'error');
        }
    }

    async submitEvidence() {
        if (!this.contract) {
            this.showAlert('Contract not connected', 'error');
            return;
        }

        const investigationId = document.getElementById('evidenceInvestigationId').value;
        const evidenceType = document.getElementById('evidenceType').value;
        const confidentialityLevel = document.getElementById('confidentialityLevel').value;

        if (!investigationId || evidenceType === '' || !confidentialityLevel) {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }

        try {
            this.showTransactionModal('Submitting evidence...');

            const tx = await this.contract.submitEncryptedEvidence(
                parseInt(investigationId),
                parseInt(evidenceType),
                parseInt(confidentialityLevel)
            );
            await tx.wait();

            this.hideTransactionModal();
            this.showAlert('Evidence submitted successfully!', 'success');
            document.getElementById('evidenceInvestigationId').value = '';
            document.getElementById('evidenceType').value = '0';
            document.getElementById('confidentialityLevel').value = '';
            await this.updateDashboard();

        } catch (error) {
            this.hideTransactionModal();
            console.error('Error submitting evidence:', error);
            this.showAlert('Failed to submit evidence: ' + error.message, 'error');
        }
    }

    async verifyEvidence() {
        if (!this.contract) {
            this.showAlert('Contract not connected', 'error');
            return;
        }

        const investigationId = document.getElementById('verifyInvestigationId').value;
        const evidenceId = document.getElementById('verifyEvidenceId').value;

        if (!investigationId || !evidenceId) {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }

        try {
            this.showTransactionModal('Verifying evidence...');

            const tx = await this.contract.verifyEvidence(parseInt(investigationId), parseInt(evidenceId));
            await tx.wait();

            this.hideTransactionModal();
            this.showAlert('Evidence verified successfully!', 'success');
            document.getElementById('verifyInvestigationId').value = '';
            document.getElementById('verifyEvidenceId').value = '';

        } catch (error) {
            this.hideTransactionModal();
            console.error('Error verifying evidence:', error);
            this.showAlert('Failed to verify evidence: ' + error.message, 'error');
        }
    }

    async submitWitnessTestimony() {
        if (!this.contract) {
            this.showAlert('Contract not connected', 'error');
            return;
        }

        const investigationId = document.getElementById('witnessInvestigationId').value;
        const credibilityScore = document.getElementById('credibilityScore').value;
        const testimonyHash = document.getElementById('testimonyHash').value;

        if (!investigationId || !credibilityScore || !testimonyHash) {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }

        try {
            this.showTransactionModal('Submitting anonymous testimony...');

            const tx = await this.contract.submitAnonymousWitnessTestimony(
                parseInt(investigationId),
                parseInt(credibilityScore),
                parseInt(testimonyHash)
            );
            await tx.wait();

            this.hideTransactionModal();
            this.showAlert('Anonymous testimony submitted successfully!', 'success');
            document.getElementById('witnessInvestigationId').value = '';
            document.getElementById('credibilityScore').value = '';
            document.getElementById('testimonyHash').value = '';
            await this.updateDashboard();

        } catch (error) {
            this.hideTransactionModal();
            console.error('Error submitting witness testimony:', error);
            this.showAlert('Failed to submit testimony: ' + error.message, 'error');
        }
    }

    async submitVerdict() {
        if (!this.contract) {
            this.showAlert('Contract not connected', 'error');
            return;
        }

        const investigationId = document.getElementById('verdictInvestigationId').value;
        const verdict = document.getElementById('verdict').value;
        const confidence = document.getElementById('confidence').value;

        if (!investigationId || verdict === '' || !confidence) {
            this.showAlert('Please fill in all fields', 'error');
            return;
        }

        try {
            this.showTransactionModal('Submitting verdict...');

            const tx = await this.contract.submitJudicialVerdict(
                parseInt(investigationId),
                parseInt(verdict),
                parseInt(confidence)
            );
            await tx.wait();

            this.hideTransactionModal();
            this.showAlert('Verdict submitted successfully!', 'success');
            document.getElementById('verdictInvestigationId').value = '';
            document.getElementById('verdict').value = '0';
            document.getElementById('confidence').value = '';

        } catch (error) {
            this.hideTransactionModal();
            console.error('Error submitting verdict:', error);
            this.showAlert('Failed to submit verdict: ' + error.message, 'error');
        }
    }

    async completeInvestigation() {
        if (!this.contract) {
            this.showAlert('Contract not connected', 'error');
            return;
        }

        const investigationId = document.getElementById('completeInvestigationId').value;

        if (!investigationId) {
            this.showAlert('Please enter investigation ID', 'error');
            return;
        }

        try {
            this.showTransactionModal('Completing investigation...');

            const tx = await this.contract.completeInvestigation(parseInt(investigationId));
            await tx.wait();

            this.hideTransactionModal();
            this.showAlert('Investigation completed successfully!', 'success');
            document.getElementById('completeInvestigationId').value = '';
            await this.updateDashboard();

        } catch (error) {
            this.hideTransactionModal();
            console.error('Error completing investigation:', error);
            this.showAlert('Failed to complete investigation: ' + error.message, 'error');
        }
    }

    async authorizeInvestigator() {
        if (!this.contract) {
            this.showAlert('Contract not connected', 'error');
            return;
        }

        const investigatorAddress = document.getElementById('investigatorAddress').value;

        if (!investigatorAddress) {
            this.showAlert('Please enter investigator address', 'error');
            return;
        }

        if (!ethers.utils.isAddress(investigatorAddress)) {
            this.showAlert('Invalid investigator address', 'error');
            return;
        }

        try {
            this.showTransactionModal('Authorizing investigator...');

            const tx = await this.contract.authorizeInvestigator(investigatorAddress);
            await tx.wait();

            this.hideTransactionModal();
            this.showAlert('Investigator authorized successfully!', 'success');
            document.getElementById('investigatorAddress').value = '';

        } catch (error) {
            this.hideTransactionModal();
            console.error('Error authorizing investigator:', error);
            this.showAlert('Failed to authorize investigator: ' + error.message, 'error');
        }
    }

    async revokeInvestigatorAccess() {
        if (!this.contract) {
            this.showAlert('Contract not connected', 'error');
            return;
        }

        const investigatorAddress = document.getElementById('investigatorAddress').value;

        if (!investigatorAddress) {
            this.showAlert('Please enter investigator address', 'error');
            return;
        }

        if (!ethers.utils.isAddress(investigatorAddress)) {
            this.showAlert('Invalid investigator address', 'error');
            return;
        }

        try {
            this.showTransactionModal('Revoking investigator access...');

            const tx = await this.contract.revokeInvestigatorAccess(investigatorAddress);
            await tx.wait();

            this.hideTransactionModal();
            this.showAlert('Investigator access revoked successfully!', 'success');
            document.getElementById('investigatorAddress').value = '';

        } catch (error) {
            this.hideTransactionModal();
            console.error('Error revoking investigator access:', error);
            this.showAlert('Failed to revoke investigator access: ' + error.message, 'error');
        }
    }

    async authorizeJudge() {
        if (!this.contract) {
            this.showAlert('Contract not connected', 'error');
            return;
        }

        const judgeAddress = document.getElementById('judgeAddress').value;

        if (!judgeAddress) {
            this.showAlert('Please enter judge address', 'error');
            return;
        }

        if (!ethers.utils.isAddress(judgeAddress)) {
            this.showAlert('Invalid judge address', 'error');
            return;
        }

        try {
            this.showTransactionModal('Authorizing judge...');

            const tx = await this.contract.authorizeJudge(judgeAddress);
            await tx.wait();

            this.hideTransactionModal();
            this.showAlert('Judge authorized successfully!', 'success');
            document.getElementById('judgeAddress').value = '';

        } catch (error) {
            this.hideTransactionModal();
            console.error('Error authorizing judge:', error);
            this.showAlert('Failed to authorize judge: ' + error.message, 'error');
        }
    }

    async revokeJudgeAccess() {
        if (!this.contract) {
            this.showAlert('Contract not connected', 'error');
            return;
        }

        const judgeAddress = document.getElementById('judgeAddress').value;

        if (!judgeAddress) {
            this.showAlert('Please enter judge address', 'error');
            return;
        }

        if (!ethers.utils.isAddress(judgeAddress)) {
            this.showAlert('Invalid judge address', 'error');
            return;
        }

        try {
            this.showTransactionModal('Revoking judge access...');

            const tx = await this.contract.revokeJudgeAccess(judgeAddress);
            await tx.wait();

            this.hideTransactionModal();
            this.showAlert('Judge access revoked successfully!', 'success');
            document.getElementById('judgeAddress').value = '';

        } catch (error) {
            this.hideTransactionModal();
            console.error('Error revoking judge access:', error);
            this.showAlert('Failed to revoke judge access: ' + error.message, 'error');
        }
    }

    async archiveInvestigation() {
        if (!this.contract) {
            this.showAlert('Contract not connected', 'error');
            return;
        }

        const investigationId = document.getElementById('archiveInvestigationId').value;

        if (!investigationId) {
            this.showAlert('Please enter investigation ID', 'error');
            return;
        }

        try {
            this.showTransactionModal('Archiving investigation...');

            const tx = await this.contract.archiveInvestigation(parseInt(investigationId));
            await tx.wait();

            this.hideTransactionModal();
            this.showAlert('Investigation archived successfully!', 'success');
            document.getElementById('archiveInvestigationId').value = '';
            await this.updateDashboard();

        } catch (error) {
            this.hideTransactionModal();
            console.error('Error archiving investigation:', error);
            this.showAlert('Failed to archive investigation: ' + error.message, 'error');
        }
    }

    showTransactionModal(message) {
        const modal = document.getElementById('transactionModal');
        const messageEl = document.getElementById('transactionMessage');
        const resultDiv = document.getElementById('transactionResult');

        messageEl.textContent = message;
        resultDiv.style.display = 'none';
        modal.classList.add('show');
    }

    hideTransactionModal() {
        const modal = document.getElementById('transactionModal');
        modal.classList.remove('show');
    }

    showAlert(message, type = 'info') {
        // Create alert element
        const alert = document.createElement('div');
        alert.className = `alert alert-${type}`;
        alert.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" style="background: none; border: none; float: right; font-size: 1.2rem; cursor: pointer;">&times;</button>
        `;

        // Insert at top of main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(alert, mainContent.firstChild);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (alert.parentElement) {
                alert.remove();
            }
        }, 5000);
    }

    formatAddress(address) {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    }

    formatTimestamp(timestamp) {
        return new Date(timestamp * 1000).toLocaleString();
    }
}

// App initialization is now handled by the CDN loader in index.html
// This ensures ethers.js is loaded before the app starts

// Backup initialization if called directly
function initializeAppBackup() {
    if (typeof ethers === 'undefined') {
        console.error('Cannot initialize: ethers.js not loaded');
        return;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOM Content Loaded - Creating app instance...');
            window.app = new AnonymousCourtInvestigationApp();
        });
    } else {
        console.log('DOM already loaded - Creating app instance...');
        window.app = new AnonymousCourtInvestigationApp();
    }
}

// Handle account changes
if (typeof window.ethereum !== 'undefined') {
    window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
            window.app.disconnectWallet();
        } else {
            window.app.connectWallet();
        }
    });

    window.ethereum.on('chainChanged', () => {
        window.location.reload();
    });
}