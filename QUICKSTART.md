# Anonymous Court Investigation System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you quickly set up and deploy the Anonymous Court Investigation System.

## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- ✅ **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org)
- ✅ **npm** (v9.0.0 or higher) - Comes with Node.js
- ✅ **MetaMask** or Ethereum wallet
- ✅ **Sepolia testnet ETH** - [Get from faucet](https://sepoliafaucet.com)
- ✅ **Infura or Alchemy account** - [Sign up](https://infura.io) (free)
- ✅ **Etherscan API key** - [Get here](https://etherscan.io/myapikey) (free)

## 🛠️ Installation Steps

### Step 1: Install Dependencies

```bash
npm install
```

This will install:
- Hardhat development environment
- Ethers.js for blockchain interaction
- Testing libraries (Chai, Mocha)
- FHEVM Solidity libraries

### Step 2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env` file with your credentials:

```env
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
PRIVATE_KEY=your_wallet_private_key_without_0x
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**Security Warning**: Never commit your `.env` file to version control!

### Step 3: Compile Contract

```bash
npm run compile
```

Expected output:
```
Compiled 1 Solidity file successfully
```

### Step 4: Run Tests (Optional)

```bash
npm test
```

All tests should pass with green checkmarks ✅

## 🚀 Deployment

### Deploy to Sepolia Testnet

```bash
npm run deploy:sepolia
```

**What happens:**
1. Connects to Sepolia testnet
2. Deploys AnonymousCourtInvestigation contract
3. Saves deployment info to `deployments/sepolia-deployment.json`
4. Displays contract address and Etherscan link

**Example output:**
```
✅ Contract deployed successfully!
📄 Contract Address: 0xabcd...1234
🔍 View on Etherscan: https://sepolia.etherscan.io/address/0xabcd...1234
```

### Verify Contract on Etherscan

```bash
npm run verify:sepolia
```

This makes your contract's source code publicly verifiable on Etherscan.

## 🎮 Interact with Your Contract

### Method 1: Interactive CLI (Recommended)

```bash
npm run interact:sepolia
```

This launches an interactive menu where you can:
- View contract information
- Start investigations
- Submit evidence
- Add witnesses
- Submit verdicts
- And more!

### Method 2: Run Full Simulation

```bash
npm run simulate:sepolia
```

This runs a complete workflow automatically:
- Authorizes investigators and judges
- Starts an investigation
- Submits evidence
- Adds witness testimonies
- Submits verdicts
- Completes the investigation

## 📊 Viewing Your Contract

After deployment, view your contract on Etherscan:

1. Copy your contract address from deployment output
2. Go to https://sepolia.etherscan.io
3. Paste your contract address in the search bar
4. Explore:
   - **Transactions**: See all contract interactions
   - **Events**: View emitted events
   - **Read Contract**: Query contract state
   - **Write Contract**: Execute contract functions (requires wallet connection)

## 🧪 Local Testing

Want to test locally first?

### Start Local Node

```bash
# Terminal 1
npm run node
```

Keep this running in the background.

### Deploy Locally

```bash
# Terminal 2
npm run deploy:localhost
```

### Interact Locally

```bash
npm run interact:localhost
```

## 📝 Common Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run compile` | Compile smart contracts |
| `npm test` | Run all tests |
| `npm run deploy:sepolia` | Deploy to Sepolia testnet |
| `npm run verify:sepolia` | Verify contract on Etherscan |
| `npm run interact:sepolia` | Interactive CLI menu |
| `npm run simulate:sepolia` | Full workflow simulation |
| `npm run node` | Start local Hardhat node |
| `npm run clean` | Clean build artifacts |

## 🔍 Troubleshooting

### Issue: "Insufficient funds"
**Solution**: Get more Sepolia ETH from faucets:
- https://sepoliafaucet.com
- https://faucet.sepolia.dev

### Issue: "Invalid API key"
**Solution**:
- Verify your `.env` file has correct values
- Check Infura/Alchemy dashboard for correct API key
- Ensure no extra spaces in `.env` file

### Issue: "Transaction reverted"
**Solution**:
- Check you have the correct role (Admin, Investigator, Judge)
- Verify investigation is in active state
- Review function requirements in contract

### Issue: "Cannot find module"
**Solution**:
```bash
rm -rf node_modules package-lock.json
npm install
```

## 🎯 Next Steps

After successful deployment:

1. **Save your contract address** - You'll need it for interactions
2. **Share the Etherscan link** - Show verified contract to others
3. **Try the interactive CLI** - Explore all contract functions
4. **Run the simulation** - See a complete workflow in action
5. **Read DEPLOYMENT.md** - Detailed documentation
6. **Customize the contract** - Adapt to your use case

## 📚 Additional Resources

- **Full Documentation**: See `DEPLOYMENT.md`
- **Contract Details**: See `README.md`
- **Hardhat Docs**: https://hardhat.org/docs
- **Ethers.js Docs**: https://docs.ethers.org
- **FHEVM Docs**: https://docs.zama.ai

## 💡 Quick Examples

### Start an Investigation (CLI)

```bash
npm run interact:sepolia
# Select option 2: Start New Investigation
# Enter case ID: 10001
```

### View Contract Info (CLI)

```bash
npm run interact:sepolia
# Select option 1: View Contract Information
```

### Submit Evidence (CLI)

```bash
npm run interact:sepolia
# Select option 6: Submit Encrypted Evidence
# Enter investigation ID: 1
# Enter evidence type (0-3): 0
# Enter confidentiality level (1-100): 75
```

## ✅ Success Checklist

After completing this guide, you should have:

- [x] Installed all dependencies
- [x] Configured environment variables
- [x] Compiled the smart contract
- [x] Run tests successfully
- [x] Deployed to Sepolia testnet
- [x] Verified contract on Etherscan
- [x] Interacted with the contract
- [x] Viewed contract on Etherscan

## 🎉 Congratulations!

You've successfully set up and deployed the Anonymous Court Investigation System!

### What You've Built

A fully functional blockchain-based judicial investigation system with:
- ✅ Encrypted evidence management
- ✅ Anonymous witness testimonies
- ✅ Role-based access control
- ✅ Judicial voting system
- ✅ Complete investigation lifecycle

### Share Your Achievement

- Tweet your contract address with #Blockchain #Ethereum #FHE
- Share on LinkedIn with your verified Etherscan link
- Show your friends the interactive CLI in action

## 🆘 Need Help?

- Check the `DEPLOYMENT.md` for detailed documentation
- Review test files for usage examples
- Open an issue on GitHub
- Read Hardhat documentation

---

**Happy Building! 🚀**

*Built with Hardhat, Ethers.js, and FHEVM Technology*
