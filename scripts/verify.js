const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🔍 Starting contract verification process...");
  console.log("━".repeat(60));

  const networkName = hre.network.name;

  // Check if we're on a supported network
  if (networkName === "hardhat" || networkName === "localhost") {
    console.log("⚠️  Contract verification is not needed for local networks.");
    console.log("   This script is designed for public testnets like Sepolia.");
    return;
  }

  // Load deployment information
  const deploymentFile = path.join(__dirname, "..", "deployments", `${networkName}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`❌ Deployment file not found: ${deploymentFile}\n   Please deploy the contract first using: npm run deploy:${networkName}`);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));

  console.log(`📍 Network: ${networkName}`);
  console.log(`📄 Contract: ${deploymentInfo.contractAddress}`);
  console.log("━".repeat(60));

  // Verify the contract
  try {
    console.log("⏳ Verifying contract on Etherscan...");
    console.log("   (This may take a minute)");

    await hre.run("verify:verify", {
      address: deploymentInfo.contractAddress,
      constructorArguments: [],
      contract: "contracts/AnonymousCourtInvestigation.sol:AnonymousCourtInvestigation",
    });

    console.log("━".repeat(60));
    console.log("✅ Contract verified successfully!");
    console.log("━".repeat(60));

    // Update deployment info with verification status
    deploymentInfo.verified = true;
    deploymentInfo.verifiedAt = new Date().toISOString();

    fs.writeFileSync(
      deploymentFile,
      JSON.stringify(deploymentInfo, null, 2)
    );

    console.log("💾 Deployment info updated with verification status");
    console.log("━".repeat(60));

    // Display Etherscan link
    if (networkName === "sepolia") {
      console.log("🔍 View verified contract on Etherscan:");
      console.log(`   ${deploymentInfo.etherscanUrl}`);
      console.log("━".repeat(60));
    }

    console.log("📋 Contract Information:");
    console.log(`   Name: ${deploymentInfo.contractName}`);
    console.log(`   Address: ${deploymentInfo.contractAddress}`);
    console.log(`   Network: ${deploymentInfo.network}`);
    console.log(`   Admin: ${deploymentInfo.admin}`);
    console.log("━".repeat(60));

  } catch (error) {
    if (error.message.includes("Already Verified")) {
      console.log("━".repeat(60));
      console.log("✅ Contract is already verified on Etherscan!");
      console.log("━".repeat(60));

      if (networkName === "sepolia") {
        console.log("🔍 View verified contract:");
        console.log(`   ${deploymentInfo.etherscanUrl}`);
        console.log("━".repeat(60));
      }

      // Update deployment info
      deploymentInfo.verified = true;
      deploymentInfo.verifiedAt = deploymentInfo.verifiedAt || new Date().toISOString();

      fs.writeFileSync(
        deploymentFile,
        JSON.stringify(deploymentInfo, null, 2)
      );
    } else {
      console.error("━".repeat(60));
      console.error("❌ Verification failed:");
      console.error(error.message);
      console.error("━".repeat(60));
      console.error("\n📋 Troubleshooting tips:");
      console.error("1. Check if ETHERSCAN_API_KEY is set in .env file");
      console.error("2. Wait a few moments after deployment before verifying");
      console.error("3. Ensure the contract was deployed successfully");
      console.error("4. Verify constructor arguments match the deployment");
      throw error;
    }
  }

  console.log("✨ Verification process completed!");
}

// Execute verification
main()
  .then(() => {
    console.log("\n✅ Verification completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Verification failed:", error.message);
    process.exit(1);
  });

module.exports = { main };
