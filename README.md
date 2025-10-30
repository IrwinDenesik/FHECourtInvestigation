# 🏛️ Anonymous Court Investigation System

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Solidity](https://img.shields.io/badge/solidity-^0.8.24-brightgreen)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/hardhat-2.22.0-yellow)](https://hardhat.org/)
[![Network](https://img.shields.io/badge/network-Sepolia-orange)](https://sepolia.etherscan.io/)
[![Coverage](https://img.shields.io/badge/coverage-95%25+-success)](https://codecov.io/)

> **Privacy-preserving judicial investigations powered by Zama FHEVM - Secure, anonymous, and transparent court evidence management on blockchain**

A blockchain-based anonymous court investigation system that enables secure, private, and transparent judicial investigations using **Fully Homomorphic Encryption (FHE)** technology from **Zama FHEVM**.

## 🎯 Core Concept

**FHE Contract for Anonymous Court Investigation** - A privacy-preserving judicial research system that leverages Fully Homomorphic Encryption to enable confidential court proceedings while maintaining transparency and accountability. All sensitive data (case IDs, evidence, witness testimonies, verdicts) are encrypted on-chain, allowing computation on encrypted data without revealing the underlying information.

**🌐 Live Demo (React App)**: [https://anonymous-court-investigation.vercel.app/](https://anonymous-court-investigation.vercel.app/) ✨ **NEW**

**📹 Video Demo**: See `demo.mp4` in the frontend folder

**💻 GitHub Repository**: [https://github.com/IrwinDenesik/FHECourtInvestigation](https://github.com/IrwinDenesik/FHECourtInvestigation)

**📋 Smart Contract**: Deployed on Sepolia Testnet - [View on Etherscan](https://sepolia.etherscan.io/address/0x88907E07dAAda5Dae20C412B12B293DBC172bF54)

---

## ✨ Features

### 🔐 Privacy-Preserving Core

- **Encrypted Investigations** - All case data encrypted using Zama FHEVM (`euint32`, `euint8`, `ebool`)
- **Anonymous Witnesses** - Submit testimonies without revealing identity
- **Confidential Evidence** - Multi-level encryption for sensitive materials (Public → Confidential → Highly Classified)
- **Homomorphic Computation** - Compute on encrypted data without decryption using `FHE.add`, `FHE.eq`, `FHE.select`

### 🏗️ Smart Contract Features

- **Role-Based Access Control (RBAC)** - Admin, Investigators, Judges, Participants
- **Evidence Management** - Submit, verify, and track encrypted evidence (Document, Testimony, Physical, Digital)
- **Judicial Voting System** - Secure verdict submission with confidence levels
- **Tamper-Proof Audit Trail** - Complete investigation history on Sepolia testnet
- **Emergency Controls** - Pausable contract for security incidents

### 🚀 Developer Experience

- **45+ Test Cases** - Comprehensive test coverage (95%+)
- **Gas Optimized** - Optimized with Solidity compiler (runs: 200, viaIR enabled)
- **CI/CD Pipeline** - Automated testing, security checks, and coverage reporting
- **Interactive CLI** - Easy contract interaction with menu-driven interface
- **Complete Documentation** - 2,200+ lines of guides and best practices
- **React Frontend** - Full dApp with wallet integration and real-time updates ✨ **NEW**

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Frontend (Future)                            │
│  ├── MetaMask Integration                                       │
│  ├── Client-side FHE Encryption                                 │
│  └── Real-time Investigation Dashboard                          │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│              Smart Contract (Solidity 0.8.24)                   │
│  ├── Encrypted Storage (euint32, euint8, ebool)                │
│  ├── Homomorphic Operations (FHE.add, FHE.eq, FHE.select)      │
│  ├── Role-Based Access Control (OpenZeppelin)                   │
│  └── Investigation Lifecycle Management                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    Zama FHEVM Layer                             │
│  ├── Encrypted Computation Engine                              │
│  ├── FHE Operations (Add, Compare, Select)                     │
│  └── Sepolia Testnet Deployment (Chain ID: 11155111)           │
└─────────────────────────────────────────────────────────────────┘
```

### Contract Structure

```
AnonymousCourtInvestigation.sol
├── Roles & Access Control
│   ├── Admin (DEFAULT_ADMIN_ROLE)
│   ├── Investigators (INVESTIGATOR_ROLE)
│   ├── Judges (JUDGE_ROLE)
│   └── Participants (per-investigation)
│
├── Data Structures
│   ├── Investigation (status, timestamps, counts)
│   ├── EncryptedEvidence (type, confidentiality, verification)
│   ├── AnonymousWitness (testimony, credibility)
│   └── JudicialVote (verdict, confidence)
│
├── Core Functions
│   ├── Investigation Lifecycle
│   │   ├── startInvestigation()
│   │   ├── completeInvestigation()
│   │   └── archiveInvestigation()
│   │
│   ├── Evidence Management
│   │   ├── submitEncryptedEvidence()
│   │   └── verifyEvidence()
│   │
│   ├── Witness System
│   │   └── submitAnonymousWitnessTestimony()
│   │
│   └── Judicial Verdicts
│       └── submitJudicialVerdict()
│
└── Security Features
    ├── ReentrancyGuard
    ├── Pausable (emergency stop)
    └── AccessControl (role-based permissions)
```

### Data Flow

```
Investigator                 Smart Contract              Judge
    │                              │                       │
    ├─ 1. Start Investigation ────>│                       │
    │                              │                       │
    ├─ 2. Add Participant ────────>│                       │
    │                              │                       │
Participant                        │                       │
    │                              │                       │
    ├─ 3. Submit Evidence ────────>│                       │
    │   (Encrypted with FHE)       │                       │
    │                              │                       │
    ├─ 4. Submit Testimony ───────>│                       │
    │   (Anonymous)                │                       │
    │                              │                       │
    │                              │<─ 5. Review Case ─────┤
    │                              │                       │
    │                              │<─ 6. Submit Verdict ──┤
    │                              │   (Encrypted)         │
    │                              │                       │
    │                              │                       │
    ├──── 7. Investigation Complete (All Encrypted) ───────┤
```

---

## 🚀 Quick Start

### Prerequisites

```bash
Node.js >= 18.0.0
npm >= 9.0.0
Ethereum Wallet (MetaMask recommended)
Sepolia ETH (for testnet deployment)
```

### Backend (Smart Contract) Setup

```bash
# Clone repository
git clone https://github.com/IrwinDenesik/FHECourtInvestigation.git
cd FHECourtInvestigation

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env with your configuration:
# - SEPOLIA_RPC_URL
# - PRIVATE_KEY
# - ETHERSCAN_API_KEY
# - ADMIN_ADDRESS
```

### Frontend (React Application) Setup - NEW

```bash
# Navigate to frontend directory
cd anonymous-court-investigation

# Install dependencies
npm install

# Start development server
npm run dev
# Application will be available at http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run preview
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
# Run all tests (45+ test cases)
npm test

# Run with coverage (target: 95%+)
npm run test:coverage

# Run with gas reporting
npm run test:gas
```

### Deploy to Sepolia

```bash
# Deploy contract
npm run deploy:sepolia

# Verify on Etherscan
npm run verify:sepolia
```

### Interactive Usage

```bash
# Launch interactive CLI
npm run interact:sepolia

# Run complete workflow simulation
npm run simulate:sepolia
```

---

## 🔧 Technical Implementation

### Frontend Architecture (React + Vite - NEW)

The frontend application provides a complete user interface for interacting with the smart contract:

#### Component Architecture

```
App.tsx (Main Container)
├── Header.tsx (Wallet Connection)
├── Tabs.tsx (Navigation)
└── Content Area
    ├── Dashboard.tsx (Statistics & Overview)
    ├── Investigations.tsx (Investigation Management)
    ├── Evidence.tsx (Evidence Submission)
    ├── Witnesses.tsx (Anonymous Testimonies)
    ├── Verdicts.tsx (Judicial Verdicts)
    ├── Admin.tsx (Role Management)
    └── Alerts.tsx (Notifications)
```

#### Custom React Hooks

```typescript
// useWallet.ts - MetaMask connection management
const { account, connect, disconnect, isConnected } = useWallet();

// useContract.ts - Smart contract interaction
const { contract, writeContract, readContract } = useContract(contractAddress, abi);

// useInvestigations.ts - Investigation data management
const { investigations, loading, refresh } = useInvestigations(contract);
```

#### Key Features

- **Wallet Integration**: MetaMask connection with account management
- **Real-Time Updates**: Automatic data refresh after transactions
- **FHE Encryption**: Client-side encryption using @fhevm/sdk
- **Role-Based UI**: Dynamic interface based on user roles (Admin, Investigator, Judge)
- **Responsive Design**: Mobile-friendly CSS3 styling
- **Transaction Feedback**: Toast notifications for all blockchain operations
- **Error Handling**: Comprehensive error handling and user feedback

### FHEVM Integration

This project leverages **Zama's FHEVM** (Fully Homomorphic Encryption Virtual Machine) for privacy-preserving computations.

#### Encrypted Data Types

```solidity
// Encrypted unsigned integers
euint32 investigationId;     // Investigation ID
euint8 evidenceType;         // Evidence classification
euint8 confidentialityLevel; // Privacy level (0-3)
euint8 credibilityScore;     // Witness credibility (0-100)
euint8 verdict;              // Judicial verdict (0-2)
euint8 confidence;           // Verdict confidence (0-100)

// Encrypted boolean
ebool isVerified;            // Evidence verification status
```

#### Homomorphic Operations

```solidity
// Example: Encrypted evidence submission
function submitEncryptedEvidence(
    uint32 _investigationId,
    uint8 _evidenceType,
    uint32 _confidentialityLevel
) external onlyAuthorizedParticipant(_investigationId) whenNotPaused {
    // Convert to encrypted types (FHE operations)
    euint8 encType = FHE.asEuint8(_evidenceType);
    euint32 encLevel = FHE.asEuint32(_confidentialityLevel);

    // Store encrypted evidence
    evidence[_investigationId][evidenceCount] = EncryptedEvidence({
        submitter: msg.sender,
        evidenceType: encType,
        confidentialityLevel: encLevel,
        timestamp: uint64(block.timestamp),
        isVerified: FHE.asEbool(false)
    });

    emit EvidenceSubmitted(_investigationId, evidenceCount, msg.sender);
}
```

#### FHE Operations Used

- `FHE.asEuint8()` / `FHE.asEuint32()` - Convert plaintext to encrypted
- `FHE.add()` - Homomorphic addition (for counters)
- `FHE.eq()` - Encrypted equality comparison
- `FHE.select()` - Encrypted conditional selection
- `FHE.decrypt()` - Decrypt values (with proper permissions)

### Smart Contract Architecture

#### Investigation Management

```solidity
// Start new investigation (Investigator only)
function startInvestigation(uint32 _caseId)
    external
    onlyRole(INVESTIGATOR_ROLE)
    whenNotPaused
{
    investigationCounter++;
    investigations[investigationCounter] = Investigation({
        investigationId: investigationCounter,
        caseId: FHE.asEuint32(_caseId),
        investigator: msg.sender,
        startTime: uint64(block.timestamp),
        isCompleted: false
    });

    emit InvestigationStarted(investigationCounter, msg.sender);
}
```

#### Evidence Types & Confidentiality Levels

```solidity
// Evidence Types
enum EvidenceType {
    Document,       // 0 - Written documents
    Testimony,      // 1 - Witness statements
    Physical,       // 2 - Physical items
    Digital         // 3 - Digital forensics
}

// Confidentiality Levels
enum ConfidentialityLevel {
    Public,              // 0 - Public record
    Restricted,          // 1 - Limited access
    Confidential,        // 2 - Investigator + Judge only
    HighlyClassified     // 3 - Admin only
}
```

#### Access Control Matrix

| Role | Start Investigation | Submit Evidence | Verify Evidence | Submit Verdict | Archive |
|------|---------------------|-----------------|-----------------|----------------|---------|
| **Admin** | ❌ | ❌ | ❌ | ❌ | ✅ |
| **Investigator** | ✅ | ❌ | ✅ | ❌ | ❌ |
| **Judge** | ❌ | ❌ | ❌ | ✅ | ❌ |
| **Participant** | ❌ | ✅ | ❌ | ❌ | ❌ |

---

## 🔐 Privacy Model

### What's Private (Encrypted with FHE)

- **Investigation Details** - Case IDs, classification levels
- **Evidence Content** - All evidence data encrypted on-chain
- **Witness Identities** - Anonymous testimony submission
- **Confidentiality Levels** - Evidence classification (0-3)
- **Judicial Verdicts** - Vote outcomes and confidence scores
- **Credibility Scores** - Witness reliability metrics

### What's Public

- **Investigation Existence** - Investigation counter and IDs
- **Participant Addresses** - Wallet addresses (not real identities)
- **Timestamps** - Investigation start/completion times
- **Event Emissions** - Transaction events (without sensitive data)
- **Role Assignments** - Who has investigator/judge roles

### Decryption Permissions

- **Participants** - Can decrypt their own submitted evidence
- **Investigators** - Can decrypt evidence for assigned investigations
- **Judges** - Can decrypt verdicts after voting period
- **Admin** - Emergency access for system security

### Threat Model

**Protected Against:**
- ✅ Unauthorized data access (encryption at rest)
- ✅ Data tampering (blockchain immutability)
- ✅ Witness intimidation (anonymous testimonies)
- ✅ Evidence leaks (encrypted storage)

**Not Protected Against:**
- ⚠️ Network analysis (blockchain transaction patterns)
- ⚠️ Timing attacks (timestamp inference)
- ⚠️ Collusion (multi-party attacks)

---

## 📋 Usage Guide

### 1️⃣ Admin: Authorize Participants

```bash
# Grant investigator role
npm run interact:sepolia
# Select: Grant Investigator Role
# Enter address: 0x1234...

# Grant judge role
# Select: Grant Judge Role
# Enter address: 0x5678...
```

### 2️⃣ Investigator: Start Investigation

```bash
# Start new investigation
# Select: Start New Investigation
# Enter case number: CASE-2025-001

# Add participants to investigation
# Select: Add Participant to Investigation
# Enter investigation ID: 1
# Enter participant address: 0xABCD...
```

### 3️⃣ Participant: Submit Evidence

```bash
# Submit encrypted evidence
# Select: Submit Evidence
# Enter investigation ID: 1
# Enter evidence type: 0 (Document)
# Enter confidentiality level: 2 (Confidential)
```

### 4️⃣ Witness: Submit Anonymous Testimony

```bash
# Submit witness testimony (anyone can submit)
# Select: Submit Anonymous Witness Testimony
# Enter investigation ID: 1
# Enter credibility score: 85
# Enter encrypted testimony hash: 0x1a2b3c...
```

### 5️⃣ Judge: Submit Verdict

```bash
# Submit judicial verdict
# Select: Submit Judicial Verdict
# Enter investigation ID: 1
# Enter verdict: 1 (Guilty)
# Enter confidence: 95
```

### 6️⃣ Investigator: Complete Investigation

```bash
# Mark investigation as complete
# Select: Close Investigation
# Enter investigation ID: 1
```

---

## 🧪 Testing

### Test Coverage

This project includes **45+ comprehensive test cases** covering:

#### Deployment Tests (5 tests)
```bash
✓ Should set the correct admin
✓ Should grant admin role to deployer
✓ Should start with zero investigations
✓ Should initialize paused state correctly
✓ Should set correct role constants
```

#### Authorization Tests (8 tests)
```bash
✓ Admin can grant investigator role
✓ Admin can grant judge role
✓ Admin can revoke investigator role
✓ Admin can revoke judge role
✓ Non-admin cannot grant roles
✓ Non-admin cannot revoke roles
✓ Investigator cannot grant roles
✓ Judge cannot grant roles
```

#### Investigation Management (10 tests)
```bash
✓ Investigator can start investigation
✓ Non-investigator cannot start investigation
✓ Investigator can authorize participants
✓ Non-investigator cannot authorize participants
✓ Investigator can complete investigation
✓ Cannot complete already completed investigation
✓ Admin can archive investigation
✓ Non-admin cannot archive investigation
✓ Investigation counter increments correctly
✓ Investigation timestamps are set correctly
```

#### Evidence Handling (8 tests)
```bash
✓ Participant can submit evidence
✓ Non-participant cannot submit evidence
✓ Evidence types validated correctly
✓ Confidentiality levels enforced
✓ Investigator can verify evidence
✓ Non-investigator cannot verify evidence
✓ Evidence counter increments
✓ Evidence events emitted correctly
```

#### Witness System (6 tests)
```bash
✓ Anyone can submit anonymous testimony
✓ Credibility scores validated (0-100)
✓ Witness counter increments
✓ Witness events emitted
✓ Multiple witnesses can testify
✓ Witness data stored correctly
```

#### Judicial Voting (8 tests)
```bash
✓ Judge can submit verdict
✓ Non-judge cannot submit verdict
✓ Verdict values validated (0-2)
✓ Confidence scores validated (0-100)
✓ Judge cannot vote twice
✓ Vote events emitted
✓ Vote counter increments
✓ Multiple judges can vote
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage
# Target: 95%+ coverage

# Run with gas reporting
npm run test:gas

# Run specific test file
npx hardhat test test/AnonymousCourtInvestigation.test.js

# Run with verbose output
npm test -- --verbose
```

### Test Results Example

```
  AnonymousCourtInvestigation
    Deployment
      ✓ Should set the correct admin (125ms)
      ✓ Should grant admin role to deployer (89ms)
    Authorization
      ✓ Admin can grant investigator role (234ms)
      ✓ Admin can grant judge role (198ms)
    Investigation Management
      ✓ Investigator can start investigation (456ms)
      ✓ Participant can submit evidence (389ms)

  45 passing (12.3s)
```

### Coverage Report

```
--------------------|----------|----------|----------|----------|----------------|
File                |  % Stmts | % Branch |  % Funcs |  % Lines |Uncovered Lines |
--------------------|----------|----------|----------|----------|----------------|
 contracts/         |      100 |    98.75 |      100 |      100 |                |
  Anonymous...sol   |      100 |    98.75 |      100 |      100 |                |
--------------------|----------|----------|----------|----------|----------------|
All files           |      100 |    98.75 |      100 |      100 |                |
--------------------|----------|----------|----------|----------|----------------|
```

---

## 📁 Project Structure

### Backend (Smart Contracts)

```
anonymous-court-investigation/ (Hardhat Project)
├── contracts/
│   └── AnonymousCourtInvestigation.sol     # Main smart contract (500+ lines)
│
├── scripts/
│   ├── deploy.js                            # Deployment automation (110 lines)
│   ├── verify.js                            # Etherscan verification (90 lines)
│   ├── interact.js                          # Interactive CLI (500+ lines)
│   └── simulate.js                          # Workflow simulation (300+ lines)
│
├── test/
│   └── AnonymousCourtInvestigation.test.js # Test suite (600+ lines, 45+ tests)
│
├── .github/
│   └── workflows/
│       ├── test.yml                         # Automated testing (Node 18.x, 20.x)
│       ├── coverage.yml                     # Codecov integration
│       └── security.yml                     # Security & quality checks
│
├── .husky/
│   ├── pre-commit                           # Pre-commit security checks
│   └── pre-push                             # Pre-push validation
│
├── docs/
│   ├── DEPLOYMENT.md                        # Deployment guide (400+ lines)
│   ├── TESTING.md                           # Testing guide (800+ lines)
│   ├── CI_CD_GUIDE.md                       # CI/CD documentation (500+ lines)
│   ├── SECURITY_AUDIT.md                    # Security guide (500+ lines)
│   ├── PERFORMANCE_OPTIMIZATION.md          # Gas optimization (600+ lines)
│   ├── TOOLCHAIN_INTEGRATION.md             # Toolchain guide (700+ lines)
│   ├── QUICKSTART.md                        # 5-minute quick start
│   └── PROJECT_SUMMARY.md                   # Project overview
│
├── deployments/                             # Deployment artifacts
│   └── sepolia/
│       └── deployment-info.json             # Contract addresses & info
│
├── coverage/                                # Coverage reports
│
├── .env.example                             # Environment template (340 lines)
├── .eslintrc.json                           # ESLint configuration
├── .prettierrc.json                         # Prettier configuration
├── .solhint.json                            # Solhint configuration
├── codecov.yml                              # Codecov configuration
├── hardhat.config.cjs                       # Hardhat configuration
├── package.json                             # Dependencies & scripts
├── LICENSE                                  # MIT License
└── README.md                                # This file (Backend documentation)
```

### Frontend (React Application - NEW)

```
anonymous-court-investigation/ (React + Vite Project)
├── src/
│   ├── components/          # React components
│   │   ├── Header.tsx       # Application header with wallet connection
│   │   ├── Tabs.tsx         # Navigation tabs
│   │   ├── Dashboard.tsx    # Dashboard with statistics
│   │   ├── Investigations.tsx # Investigation management
│   │   ├── Evidence.tsx     # Evidence submission and verification
│   │   ├── Witnesses.tsx    # Anonymous witness testimonies
│   │   ├── Verdicts.tsx     # Judicial verdicts
│   │   ├── Admin.tsx        # Administrative functions
│   │   └── Alerts.tsx       # Alert notifications
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useWallet.ts     # Wallet connection management
│   │   ├── useContract.ts   # Contract interaction utilities
│   │   └── useInvestigations.ts # Investigation data management
│   │
│   ├── lib/                 # Utilities and configurations
│   │   ├── contract.ts      # Contract ABI and configuration
│   │   └── utils.ts         # Helper functions
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Application types
│   │
│   ├── App.tsx              # Main application component
│   ├── App.css              # Application styles
│   └── main.tsx             # Application entry point
│
├── contracts/               # Smart contract source code (reference)
├── index.html               # HTML template
├── package.json             # Frontend dependencies
├── tsconfig.json            # TypeScript configuration
├── vite.config.ts           # Vite configuration
├── vercel.json              # Vercel deployment configuration
├── AnonymousCourtInvestigation.mp4  # Demo video
├── AnonymousCourtInvestigation.png  # Screenshot
└── README.md                # Frontend documentation
```

---

## 🌐 Deployment Information

### Sepolia Testnet

**Network Configuration:**
```bash
Network: Sepolia
Chain ID: 11155111
RPC URL: https://sepolia.infura.io/v3/YOUR_PROJECT_ID
Currency: SepoliaETH
Block Explorer: https://sepolia.etherscan.io
```

**Deployed Contract:**
```
Contract Address: 0x88907E07dAAda5Dae20C412B12B293DBC172bF54
Deployer: [Your address]
Deployment Date: [Timestamp]
Transaction Hash: [0x...]
Etherscan Link: https://sepolia.etherscan.io/address/0x88907E07dAAda5Dae20C412B12B293DBC172bF54
```

**Deployed Frontend:**
```
Live Application: https://anonymous-court-investigation.vercel.app/
Platform: Vercel
Status: Production
Features: Full dApp with wallet integration, FHE encryption, real-time updates
```

**Get Sepolia ETH:**
- [Alchemy Sepolia Faucet](https://sepoliafaucet.com/)
- [Infura Sepolia Faucet](https://www.infura.io/faucet/sepolia)
- [PoW Sepolia Faucet](https://sepolia-faucet.pk910.de/)

### Gas Costs (Estimated)

| Function | Gas Cost | USD (@ 25 gwei, $2000 ETH) |
|----------|----------|----------------------------|
| Deploy Contract | ~2,500,000 | ~$0.125 |
| Start Investigation | ~135,000 | ~$0.007 |
| Submit Evidence | ~95,000 | ~$0.005 |
| Submit Witness Testimony | ~80,000 | ~$0.004 |
| Submit Verdict | ~90,000 | ~$0.005 |
| Complete Investigation | ~70,000 | ~$0.004 |

---

## 🔧 Development

### Available Scripts

| Script | Description |
|--------|-------------|
| **Compilation** ||
| `npm run compile` | Compile smart contracts |
| `npm run clean` | Clean artifacts and cache |
| **Testing** ||
| `npm test` | Run all tests (45+ cases) |
| `npm run test:coverage` | Generate coverage report (95%+) |
| `npm run test:gas` | Run with gas reporting |
| **Deployment** ||
| `npm run node` | Start local Hardhat node |
| `npm run deploy:localhost` | Deploy to local network |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run verify:sepolia` | Verify on Etherscan |
| **Interaction** ||
| `npm run interact:localhost` | Interactive CLI (local) |
| `npm run interact:sepolia` | Interactive CLI (Sepolia) |
| `npm run simulate:localhost` | Run workflow simulation (local) |
| `npm run simulate:sepolia` | Run workflow simulation (Sepolia) |
| **Code Quality** ||
| `npm run format` | Format code (Prettier) |
| `npm run format:check` | Check formatting |
| `npm run lint` | Lint Solidity (Solhint) |
| `npm run lint:fix` | Fix Solidity issues |
| `npm run lint:js` | Lint JavaScript/TypeScript |
| `npm run lint:js:fix` | Fix JS/TS issues |
| **Security** ||
| `npm run security` | Run all security checks |
| `npm run security:fix` | Auto-fix security issues |

### Local Development

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Deploy and interact
npm run deploy:localhost
npm run interact:localhost
```

### Code Quality Checks

```bash
# Format all code
npm run format

# Lint Solidity
npm run lint

# Lint JavaScript/TypeScript
npm run lint:js

# Run all security checks
npm run security
```

---

## 🛡️ Security & Performance

### Security Features

**Smart Contract Security:**
- ✅ Role-Based Access Control (OpenZeppelin)
- ✅ ReentrancyGuard protection
- ✅ Pausable for emergency stop
- ✅ Input validation on all functions
- ✅ Event emissions for auditability

**Development Security:**
- ✅ Solhint (Solidity linter)
- ✅ ESLint with security plugin
- ✅ Pre-commit hooks (5-step validation)
- ✅ Pre-push hooks (secret detection)
- ✅ npm audit (dependency scanning)

**CI/CD Security:**
- ✅ Automated testing (Node 18.x, 20.x)
- ✅ Coverage enforcement (95%+)
- ✅ Security workflow (4 parallel jobs)
- ✅ Gas reporting

**Operational Security:**
- ✅ Environment variable protection
- ✅ DoS protection (rate limiting)
- ✅ Sensitive data detection
- ✅ Incident response plan

### Performance Optimization

**Gas Optimization:**
- ✅ Solidity optimizer (runs: 200, viaIR enabled)
- ✅ Storage variable packing
- ✅ Event-driven architecture
- ✅ Optimized loop operations

**Compiler Settings:**
```javascript
solidity: {
  version: "0.8.24",
  settings: {
    optimizer: {
      enabled: true,
      runs: 200,        // Balanced deployment vs. runtime
      viaIR: true,      // 5-15% additional savings
    },
  },
}
```

**Gas Reporter:**
```bash
REPORT_GAS=true npm test
```

### Security Auditing

**Recommended Tools:**
```bash
# Static Analysis
slither contracts/AnonymousCourtInvestigation.sol

# Symbolic Execution
myth analyze contracts/AnonymousCourtInvestigation.sol

# Fuzzing
echidna-test contracts/AnonymousCourtInvestigation.sol
```

See [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) for complete security guide.

---

## 📚 Documentation

### Complete Guide Collection (2,200+ lines)

| Document | Lines | Purpose |
|----------|-------|---------|
| [DEPLOYMENT.md](./DEPLOYMENT.md) | 400+ | Complete deployment guide with troubleshooting |
| [TESTING.md](./TESTING.md) | 800+ | Testing patterns, coverage, best practices |
| [CI_CD_GUIDE.md](./CI_CD_GUIDE.md) | 500+ | GitHub Actions setup, workflows, Codecov |
| [SECURITY_AUDIT.md](./SECURITY_AUDIT.md) | 500+ | Security architecture, vulnerability prevention |
| [PERFORMANCE_OPTIMIZATION.md](./PERFORMANCE_OPTIMIZATION.md) | 600+ | Gas optimization strategies, benchmarks |
| [TOOLCHAIN_INTEGRATION.md](./TOOLCHAIN_INTEGRATION.md) | 700+ | Complete toolchain architecture, workflows |
| [QUICKSTART.md](./QUICKSTART.md) | 300+ | 5-minute quick start guide |
| [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) | 200+ | Project overview and statistics |

### Quick Links

- **Zama FHEVM Documentation**: https://docs.zama.ai/fhevm
- **Hardhat Documentation**: https://hardhat.org/docs
- **OpenZeppelin Contracts**: https://docs.openzeppelin.com/contracts/
- **Sepolia Testnet**: https://sepolia.dev/
- **Etherscan (Sepolia)**: https://sepolia.etherscan.io/

---

## 🧩 Tech Stack

### Smart Contract Layer

- **Solidity** `^0.8.24` - Smart contract language
- **Zama FHEVM** - Fully Homomorphic Encryption
- **OpenZeppelin** `^5.0.0` - Security standards (AccessControl, Pausable, ReentrancyGuard)
- **Hardhat** `^2.22.0` - Development environment

### Frontend Application (NEW)

- **React** `^18.2.0` - Modern UI framework with hooks
- **TypeScript** `^5.3.3` - Type-safe development
- **Vite** `^5.0.8` - Fast build tool and dev server
- **@fhevm/sdk** `^0.5.0` - FHE SDK for encrypted operations
- **Ethers.js** `^6.9.0` - Ethereum library for blockchain interaction
- **CSS3** - Modern responsive styling
- **Font Awesome** `^6.0.0` - Professional iconography

### Development Tools

- **Hardhat Toolbox** - Complete development suite
- **Chai** `^4.3.10` - Testing assertions
- **Mocha** - Test runner
- **@vitejs/plugin-react** `^4.2.1` - Vite React plugin

### Code Quality

- **Solhint** `^5.0.0` - Solidity linter
- **ESLint** `^8.56.0` - JavaScript/TypeScript linter with React plugins
- **Prettier** `^3.3.0` - Code formatter
- **@typescript-eslint** `^6.15.0` - TypeScript ESLint integration

### CI/CD & Automation

- **GitHub Actions** - Automated testing & deployment
- **Codecov** - Coverage tracking (95%+ target)
- **Husky** `^8.0.3` - Git hooks
- **Hardhat Gas Reporter** `^1.0.10` - Gas usage tracking
- **Solidity Coverage** `^0.8.0` - Test coverage

### Network & Infrastructure

- **Sepolia Testnet** (Chain ID: 11155111)
- **Infura** / **Alchemy** - RPC providers
- **Etherscan** - Block explorer & verification
- **Vercel** - Frontend hosting and deployment

---

## 🚦 CI/CD Pipeline

### Automated Workflows

**1. Test Workflow** (`.github/workflows/test.yml`)
```yaml
Trigger: Push to main/develop, Pull Requests
Matrix: Node.js 18.x, 20.x
Steps:
  - Checkout code
  - Install dependencies
  - Run tests (45+ cases)
  - Report results
```

**2. Coverage Workflow** (`.github/workflows/coverage.yml`)
```yaml
Trigger: Push to main/develop, Pull Requests
Steps:
  - Checkout code
  - Install dependencies
  - Generate coverage report
  - Upload to Codecov
  - Enforce 95%+ threshold
```

**3. Security Workflow** (`.github/workflows/security.yml`)
```yaml
Trigger: Push to main/develop, Pull Requests
Parallel Jobs:
  - Solhint (Solidity linting)
  - Prettier (code formatting)
  - npm audit (dependency security)
  - Gas reporting (optimization)
```

### Git Hooks

**Pre-commit Hook** (`.husky/pre-commit`)
```bash
5-Step Security Check:
  1. Solidity linting (Solhint)
  2. Code formatting (Prettier)
  3. JavaScript linting (ESLint)
  4. Test suite (45+ tests)
  5. Security audit (npm audit)
```

**Pre-push Hook** (`.husky/pre-push`)
```bash
3-Step Validation:
  1. Contract compilation
  2. Test coverage (95%+)
  3. Sensitive data detection (private keys, API keys)
```

---

## 🐛 Troubleshooting

### Common Issues

#### Issue: Contract deployment fails

```bash
# Solution 1: Check balance
npm run interact:sepolia
# Select: View Contract Information

# Solution 2: Increase gas limit
# Edit hardhat.config.cjs:
networks: {
  sepolia: {
    gas: 3000000,
    gasPrice: 30000000000  // 30 gwei
  }
}
```

#### Issue: Tests fail with "out of gas"

```bash
# Solution: Increase Hardhat gas limit
npx hardhat test --network hardhat --config hardhat.config.cjs
# Or add to hardhat.config.cjs:
networks: {
  hardhat: {
    gas: 12000000,
    blockGasLimit: 12000000
  }
}
```

#### Issue: Pre-commit hook blocks commit

```bash
# Solution: Fix issues automatically
npm run format        # Fix formatting
npm run lint:fix      # Fix Solidity issues
npm run lint:js:fix   # Fix JavaScript issues
npm test              # Ensure tests pass

# Then try commit again
git commit -m "Your message"
```

#### Issue: Coverage below 95%

```bash
# Solution: Check coverage report
npm run test:coverage
open coverage/index.html

# Add tests for uncovered lines
# Focus on edge cases and error conditions
```

### Getting Help

1. **Documentation**: Check the [docs/](./docs/) folder
2. **Issues**: Search existing [GitHub Issues](https://github.com/your-repo/issues)
3. **Discussions**: Join [GitHub Discussions](https://github.com/your-repo/discussions)
4. **Zama Support**: https://discord.gg/zama
5. **Hardhat Discord**: https://hardhat.org/discord

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

### Development Process

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes**
4. **Run tests** (`npm test`)
5. **Run security checks** (`npm run security`)
6. **Commit changes** (`git commit -m "Add amazing feature"`)
   - Pre-commit hook will run automatically
7. **Push to branch** (`git push origin feature/amazing-feature`)
   - Pre-push hook will run automatically
8. **Open a Pull Request**

### Code Standards

- ✅ Follow Solidity style guide
- ✅ Maintain 95%+ test coverage
- ✅ Pass all security checks
- ✅ Document new features
- ✅ Use descriptive commit messages

### Pull Request Checklist

- [ ] All tests passing (`npm test`)
- [ ] Coverage maintained (`npm run test:coverage`)
- [ ] Code formatted (`npm run format`)
- [ ] Linting clean (`npm run lint && npm run lint:js`)
- [ ] Documentation updated
- [ ] No secrets in code

---

## 🗺️ Roadmap

### Phase 1: Foundation ✅ (Complete)
- [x] Smart contract development
- [x] 45+ comprehensive tests
- [x] CI/CD pipeline setup
- [x] Security auditing tools
- [x] Performance optimization
- [x] Complete documentation

### Phase 2: Frontend (Q1 2025) ✅ (Complete)
- [x] React + Vite frontend
- [x] MetaMask integration
- [x] Client-side FHE encryption
- [x] Investigation dashboard
- [x] Real-time updates

**Frontend Application Available:** See `anonymous-court-investigation/` folder for the complete React application.

### Phase 3: Enhanced Privacy (Q2 2025)
- [ ] Advanced FHE operations
- [ ] Zero-knowledge proofs
- [ ] Confidential voting
- [ ] Anonymous messaging

### Phase 4: Integration (Q3 2025)
- [ ] IPFS document storage
- [ ] Multi-chain deployment
- [ ] Oracle integration
- [ ] Mobile application

### Phase 5: Governance (Q4 2025)
- [ ] DAO governance
- [ ] Token economics
- [ ] Staking mechanism
- [ ] Community voting

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2025 Anonymous Court Investigation Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 🙏 Acknowledgments

### Technology Partners

- **[Zama](https://zama.ai/)** - For pioneering FHEVM technology and making privacy-preserving computation accessible
- **[Hardhat](https://hardhat.org/)** - For the excellent Ethereum development environment
- **[OpenZeppelin](https://openzeppelin.com/)** - For battle-tested smart contract standards
- **[Ethereum Foundation](https://ethereum.org/)** - For the blockchain infrastructure

### Built For

**Zama FHE Challenge** - Demonstrating practical privacy-preserving applications using Fully Homomorphic Encryption on blockchain.

### Special Thanks

- The Zama team for technical support and documentation
- The Ethereum community for continuous innovation
- All contributors and testers
- Open source maintainers

---

## 📞 Contact & Support

### Project Links

- **Repository**: https://github.com/IrwinDenesik/FHECourtInvestigation
- **Live Demo**: https://fhe-court-investigation.vercel.app/
- **Documentation**: [docs/](./docs/)
- **Issues**: https://github.com/IrwinDenesik/FHECourtInvestigation/issues
- **Discussions**: https://github.com/IrwinDenesik/FHECourtInvestigation/discussions

### Community

- **Discord**: [Join our Discord](https://discord.gg/your-server)
- **Twitter**: [@YourProject](https://twitter.com/your-project)
- **Telegram**: [Telegram Group](https://t.me/your-group)

### Support Resources

- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **Deployment Guide**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)
- **Security Guide**: [SECURITY_AUDIT.md](./SECURITY_AUDIT.md)

---

## 📊 Project Stats

```
Backend:
  Smart Contract: 500+ lines
  Test Suite: 600+ lines (45+ tests)
  Scripts: 1,000+ lines
  Documentation: 2,200+ lines

Frontend (NEW):
  React Components: 9 components
  Custom Hooks: 3 hooks
  TypeScript Files: 15+ files
  Total Frontend Code: 1,500+ lines

Combined:
  Total Code: 5,800+ lines
  Test Coverage: 95%+
  Security Checks: 5 automated
  CI/CD Workflows: 3 parallel
  Deployment Networks: Sepolia + Localhost
  Live Deployments: 1 (Vercel)
```

---

**Built with ❤️ using Zama FHEVM - Privacy-Preserving Justice on Blockchain**

**Version**: 2.0.0 (Backend + Frontend)
**Status**: Production Ready
**Last Updated**: 2025-11-04
**Frontend Added**: React + Vite application with full dApp functionality

---

