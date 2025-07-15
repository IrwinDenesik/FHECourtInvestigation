# Anonymous Court Investigation System - Deployment Guide

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Deployment Process](#deployment-process)
- [Contract Verification](#contract-verification)
- [Deployment Information](#deployment-information)
- [Usage](#usage)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)

## 🎯 Overview

This document provides comprehensive instructions for deploying and interacting with the Anonymous Court Investigation System smart contract on Ethereum networks.

## ✅ Prerequisites

Before deploying the contract, ensure you have:

- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Ethereum Wallet**: With sufficient ETH for deployment
- **Infura/Alchemy Account**: For network access (recommended)
- **Etherscan API Key**: For contract verification

## 📦 Installation

1. Clone the repository:
```bash
cd anonymous-court-investigation-system
```

2. Install dependencies:
```bash
npm install
```

3. Verify installation:
```bash
npx hardhat --version
```

## ⚙️ Configuration

### 1. Environment Setup

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

### 2. Configure Environment Variables

Edit `.env` with your credentials:

```env
# Network RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
# or
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Deployment Account Private Key (KEEP SECURE!)
PRIVATE_KEY=your_private_key_here

# Etherscan API Key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Optional: Gas reporting
REPORT_GAS=false
```

### 3. Security Best Practices

- ⚠️ **NEVER** commit `.env` file to version control
- ⚠️ **NEVER** share your private key
- ✅ Use separate wallets for development and production
- ✅ Store sensitive data in secure password managers

## 🚀 Deployment Process

### Step 1: Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### Step 2: Run Tests (Optional but Recommended)

```bash
npm test
```

### Step 3: Deploy to Local Network (Testing)

Start local Hardhat node:
```bash
npm run node
```

In a new terminal, deploy to localhost:
```bash
npm run deploy:localhost
```

### Step 4: Deploy to Sepolia Testnet

```bash
npm run deploy:sepolia
```

Expected output:
```
🚀 Starting deployment process...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Network: sepolia
🔗 Chain ID: 11155111
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
👤 Deployer: 0x1234...5678
💰 Balance: 1.5 ETH
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📦 Deploying AnonymousCourtInvestigation contract...
⏳ Deploying contract (this may take a minute)...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Contract deployed successfully!
📄 Contract Address: 0xabcd...efgh
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## ✓ Contract Verification

After successful deployment, verify the contract on Etherscan:

```bash
npm run verify:sepolia
```

Expected output:
```
🔍 Starting contract verification process...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 Network: sepolia
📄 Contract: 0xabcd...efgh
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏳ Verifying contract on Etherscan...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Contract verified successfully!
```

## 📊 Deployment Information

### Sepolia Testnet Deployment

**Contract Information:**
- **Contract Address**: `[Will be populated after deployment]`
- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Deployer**: `[Your deployer address]`
- **Admin**: `[Contract admin address]`
- **Deployment Date**: `[Deployment timestamp]`

**Etherscan Links:**
- **Contract**: `https://sepolia.etherscan.io/address/[CONTRACT_ADDRESS]`
- **Verified Code**: `https://sepolia.etherscan.io/address/[CONTRACT_ADDRESS]#code`
- **Read Contract**: `https://sepolia.etherscan.io/address/[CONTRACT_ADDRESS]#readContract`
- **Write Contract**: `https://sepolia.etherscan.io/address/[CONTRACT_ADDRESS]#writeContract`

**Transaction Details:**
- **Deployment Transaction**: `https://sepolia.etherscan.io/tx/[TX_HASH]`
- **Gas Used**: `[Gas amount]`
- **Transaction Fee**: `[Fee in ETH]`

### Network Information

**Sepolia Testnet:**
- **RPC URL**: `https://sepolia.infura.io/v3/YOUR_PROJECT_ID`
- **Chain ID**: 11155111
- **Block Explorer**: https://sepolia.etherscan.io
- **Faucet**: https://sepoliafaucet.com

## 🎮 Usage

### Interactive Menu

Launch the interactive menu to interact with the deployed contract:

```bash
npm run interact:sepolia
```

Available operations:
1. View Contract Information
2. Start New Investigation
3. Authorize Investigator
4. Authorize Judge
5. Authorize Participant for Investigation
6. Submit Encrypted Evidence
7. Submit Anonymous Witness Testimony
8. Submit Judicial Verdict
9. Verify Evidence
10. Complete Investigation
11. View Investigation Info
12. View Investigation Statistics

### Simulation Script

Run a complete workflow simulation:

```bash
npm run simulate:sepolia
```

This will:
- Authorize investigators and judges
- Start an investigation
- Submit evidence and witness testimonies
- Submit judicial verdicts
- Complete the investigation
- Display comprehensive statistics

### Contract Functions

#### Admin Functions

```javascript
// Authorize an investigator
contract.authorizeInvestigator(investigatorAddress)

// Authorize a judge
contract.authorizeJudge(judgeAddress)

// Revoke investigator access
contract.revokeInvestigatorAccess(investigatorAddress)

// Archive completed investigation
contract.archiveInvestigation(investigationId)
```

#### Investigator Functions

```javascript
// Start new investigation
contract.startInvestigation(caseId)

// Authorize participant for investigation
contract.authorizeParticipant(investigationId, participantAddress)

// Verify evidence
contract.verifyEvidence(investigationId, evidenceId)

// Complete investigation
contract.completeInvestigation(investigationId)
```

#### Participant Functions

```javascript
// Submit encrypted evidence
contract.submitEncryptedEvidence(investigationId, evidenceType, confidentialityLevel)
// evidenceType: 0=Document, 1=Testimony, 2=Physical, 3=Digital
```

#### Public Functions

```javascript
// Submit anonymous witness testimony
contract.submitAnonymousWitnessTestimony(investigationId, credibilityScore, encryptedTestimonyHash)
```

#### Judge Functions

```javascript
// Submit judicial verdict
contract.submitJudicialVerdict(investigationId, verdict, confidence)
// verdict: 0=Not Guilty, 1=Guilty, 2=Insufficient Evidence
```

#### View Functions

```javascript
// Get investigation basic info
contract.getInvestigationBasicInfo(investigationId)

// Get investigation time info
contract.getInvestigationTimeInfo(investigationId)

// Get investigation counts
contract.getInvestigationCounts(investigationId)

// Get evidence info
contract.getEvidenceInfo(investigationId, evidenceId)

// Check if authorized for investigation
contract.isAuthorizedForInvestigation(investigationId, participantAddress)

// Check if judge has voted
contract.hasVoted(investigationId, judgeAddress)
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Run with Gas Reporting

```bash
npm run test:gas
```

### Generate Coverage Report

```bash
npm run test:coverage
```

### Test on Local Network

```bash
# Terminal 1: Start local node
npm run node

# Terminal 2: Run tests
npm test --network localhost
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Insufficient Funds

**Error**: `sender doesn't have enough funds`

**Solution**:
- Get testnet ETH from Sepolia faucet
- Verify wallet has sufficient balance: `npm run interact:sepolia` → Option 1

#### 2. Nonce Too High/Low

**Error**: `nonce has already been used`

**Solution**:
- Reset MetaMask account (Settings → Advanced → Reset Account)
- Wait a few minutes and retry

#### 3. Contract Verification Failed

**Error**: `Unable to verify contract`

**Solution**:
- Verify Etherscan API key is correct
- Wait 1-2 minutes after deployment before verifying
- Try manual verification on Etherscan

#### 4. RPC Connection Issues

**Error**: `could not detect network`

**Solution**:
- Check RPC URL in `.env` file
- Verify Infura/Alchemy API key is active
- Try alternative RPC provider

#### 5. Transaction Reverted

**Error**: `Transaction reverted without a reason string`

**Solution**:
- Check authorization requirements
- Verify investigation is in correct state
- Review function parameter requirements

### Getting Help

If you encounter issues:

1. Check error messages carefully
2. Review deployment logs in `deployments/` directory
3. Verify all environment variables are set correctly
4. Test on local network first
5. Check Etherscan for transaction details

## 📁 Project Structure

```
anonymous-court-investigation-system/
├── contracts/
│   └── AnonymousCourtInvestigation.sol
├── scripts/
│   ├── deploy.js
│   ├── verify.js
│   ├── interact.js
│   └── simulate.js
├── test/
│   └── AnonymousCourtInvestigation.test.js
├── deployments/
│   └── sepolia-deployment.json
├── hardhat.config.js
├── package.json
├── .env.example
├── .env (create this)
├── DEPLOYMENT.md
└── README.md
```

## 📝 Deployment Checklist

- [ ] Node.js and npm installed
- [ ] Dependencies installed (`npm install`)
- [ ] `.env` file created and configured
- [ ] Contract compiled successfully
- [ ] Tests passing
- [ ] Sufficient testnet ETH in deployer wallet
- [ ] RPC URL configured
- [ ] Private key configured
- [ ] Etherscan API key configured
- [ ] Deploy to Sepolia
- [ ] Verify contract on Etherscan
- [ ] Test contract functions
- [ ] Run simulation script
- [ ] Document deployment information
- [ ] Save deployment artifacts

## 🔐 Security Considerations

1. **Private Key Management**
   - Never expose private keys
   - Use hardware wallets for mainnet
   - Separate dev and production keys

2. **Access Control**
   - Only admin can authorize investigators/judges
   - Only investigation creator can complete it
   - Evidence requires participant authorization

3. **Data Privacy**
   - All sensitive data is encrypted using FHE
   - Witness testimonies are anonymous
   - Evidence has confidentiality levels

4. **Testing**
   - Always test on testnet first
   - Run full test suite before deployment
   - Perform security audits for mainnet

## 📞 Support

For additional support:
- Review test files for usage examples
- Check Hardhat documentation: https://hardhat.org
- Verify Etherscan documentation: https://docs.etherscan.io
- FHEVM documentation: https://docs.zama.ai

## 📄 License

MIT License - See LICENSE file for details

---

**Last Updated**: 2025-10-26

**Version**: 1.0.0

**Status**: Production Ready
