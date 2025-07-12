const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🚀 Starting deployment process...");
  console.log("━".repeat(60));

  // Get network information
  const network = await hre.ethers.provider.getNetwork();
  const networkName = hre.network.name;

  console.log(`📍 Network: ${networkName}`);
  console.log(`🔗 Chain ID: ${network.chainId}`);
  console.log("━".repeat(60));

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  const deployerAddress = await deployer.getAddress();
  const balance = await hre.ethers.provider.getBalance(deployerAddress);

  console.log(`👤 Deployer: ${deployerAddress}`);
  console.log(`💰 Balance: ${hre.ethers.formatEther(balance)} ETH`);
  console.log("━".repeat(60));

  // Check if deployer has sufficient balance
  if (balance === 0n) {
    throw new Error("❌ Deployer account has zero balance. Please fund the account before deploying.");
  }

  console.log("📦 Deploying AnonymousCourtInvestigation contract...");

  // Deploy the contract
  const AnonymousCourtInvestigation = await hre.ethers.getContractFactory("AnonymousCourtInvestigation");

  console.log("⏳ Deploying contract (this may take a minute)...");
  const contract = await AnonymousCourtInvestigation.deploy();

  await contract.waitForDeployment();
  const contractAddress = await contract.getAddress();

  console.log("━".repeat(60));
  console.log("✅ Contract deployed successfully!");
  console.log(`📄 Contract Address: ${contractAddress}`);
  console.log("━".repeat(60));

  // Get deployment transaction details
  const deploymentTx = contract.deploymentTransaction();
  if (deploymentTx) {
    console.log(`📝 Transaction Hash: ${deploymentTx.hash}`);
    console.log(`⛽ Gas Used: ${deploymentTx.gasLimit?.toString() || "N/A"}`);
  }

  // Verify admin setup
  const admin = await contract.admin();
  console.log(`👑 Admin Address: ${admin}`);
  console.log("━".repeat(60));

  // Save deployment information
  const deploymentInfo = {
    network: networkName,
    chainId: network.chainId.toString(),
    contractName: "AnonymousCourtInvestigation",
    contractAddress: contractAddress,
    deployer: deployerAddress,
    admin: admin,
    deploymentTime: new Date().toISOString(),
    transactionHash: deploymentTx?.hash || "N/A",
    blockNumber: deploymentTx?.blockNumber?.toString() || "N/A",
    etherscanUrl: networkName === "sepolia"
      ? `https://sepolia.etherscan.io/address/${contractAddress}`
      : `https://etherscan.io/address/${contractAddress}`,
  };

  // Create deployments directory if it doesn't exist
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  // Save deployment info to JSON file
  const deploymentFile = path.join(deploymentsDir, `${networkName}-deployment.json`);
  fs.writeFileSync(
    deploymentFile,
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log(`💾 Deployment info saved to: ${deploymentFile}`);
  console.log("━".repeat(60));

  // Display next steps
  console.log("📋 NEXT STEPS:");
  console.log("━".repeat(60));
  console.log("1. Verify contract on Etherscan:");
  console.log(`   npx hardhat verify --network ${networkName} ${contractAddress}`);
  console.log("");
  console.log("2. Interact with the contract:");
  console.log(`   node scripts/interact.js`);
  console.log("");
  console.log("3. Run simulation tests:");
  console.log(`   node scripts/simulate.js`);
  console.log("━".repeat(60));

  if (networkName === "sepolia") {
    console.log("🔍 View on Etherscan:");
    console.log(`   ${deploymentInfo.etherscanUrl}`);
    console.log("━".repeat(60));
  }

  console.log("✨ Deployment completed successfully!");

  return deploymentInfo;
}

// Execute deployment
main()
  .then((deploymentInfo) => {
    console.log("\n✅ All deployment tasks completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Deployment failed:", error);
    process.exit(1);
  });

module.exports = { main };
