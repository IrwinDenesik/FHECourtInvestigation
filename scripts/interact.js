const hre = require("hardhat");
const fs = require("fs");
const path = require("path");
const readline = require("readline");

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function loadContract() {
  const networkName = hre.network.name;
  const deploymentFile = path.join(__dirname, "..", "deployments", `${networkName}-deployment.json`);

  if (!fs.existsSync(deploymentFile)) {
    throw new Error(`❌ Deployment file not found for network: ${networkName}\n   Please deploy the contract first using: npm run deploy:${networkName}`);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const [signer] = await hre.ethers.getSigners();

  const contract = await hre.ethers.getContractAt(
    "AnonymousCourtInvestigation",
    deploymentInfo.contractAddress,
    signer
  );

  return { contract, deploymentInfo, signer };
}

async function displayMenu() {
  console.log("\n" + "═".repeat(60));
  console.log("🏛️  ANONYMOUS COURT INVESTIGATION - INTERACTION MENU");
  console.log("═".repeat(60));
  console.log("\n📋 AVAILABLE OPERATIONS:\n");
  console.log("  1️⃣  View Contract Information");
  console.log("  2️⃣  Start New Investigation");
  console.log("  3️⃣  Authorize Investigator");
  console.log("  4️⃣  Authorize Judge");
  console.log("  5️⃣  Authorize Participant for Investigation");
  console.log("  6️⃣  Submit Encrypted Evidence");
  console.log("  7️⃣  Submit Anonymous Witness Testimony");
  console.log("  8️⃣  Submit Judicial Verdict");
  console.log("  9️⃣  Verify Evidence");
  console.log("  🔟  Complete Investigation");
  console.log("  1️⃣1️⃣  View Investigation Info");
  console.log("  1️⃣2️⃣  View Investigation Statistics");
  console.log("  0️⃣  Exit");
  console.log("\n" + "═".repeat(60) + "\n");
}

async function viewContractInfo(contract, deploymentInfo, signer) {
  console.log("\n" + "━".repeat(60));
  console.log("📄 CONTRACT INFORMATION");
  console.log("━".repeat(60));

  const admin = await contract.admin();
  const currentId = await contract.currentInvestigationId();
  const signerAddress = await signer.getAddress();
  const isInvestigator = await contract.authorizedInvestigators(signerAddress);
  const isJudge = await contract.authorizedJudges(signerAddress);

  console.log(`📍 Network: ${deploymentInfo.network}`);
  console.log(`📄 Contract Address: ${deploymentInfo.contractAddress}`);
  console.log(`👑 Admin: ${admin}`);
  console.log(`🔢 Current Investigation ID: ${currentId}`);
  console.log(`👤 Your Address: ${signerAddress}`);
  console.log(`🕵️  Authorized Investigator: ${isInvestigator ? "✅ Yes" : "❌ No"}`);
  console.log(`⚖️  Authorized Judge: ${isJudge ? "✅ Yes" : "❌ No"}`);

  if (deploymentInfo.etherscanUrl) {
    console.log(`🔍 Etherscan: ${deploymentInfo.etherscanUrl}`);
  }

  console.log("━".repeat(60));
}

async function startInvestigation(contract) {
  console.log("\n" + "━".repeat(60));
  console.log("🚀 START NEW INVESTIGATION");
  console.log("━".repeat(60));

  const caseId = await question("Enter case ID (numeric): ");

  try {
    console.log("\n⏳ Starting investigation...");
    const tx = await contract.startInvestigation(parseInt(caseId));
    console.log(`📝 Transaction sent: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

    // Get the investigation ID from events
    const currentId = await contract.currentInvestigationId();
    console.log(`✨ Investigation started with ID: ${currentId - 1n}`);
    console.log("━".repeat(60));
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function authorizeInvestigator(contract) {
  console.log("\n" + "━".repeat(60));
  console.log("🕵️  AUTHORIZE INVESTIGATOR");
  console.log("━".repeat(60));

  const address = await question("Enter investigator address: ");

  try {
    console.log("\n⏳ Authorizing investigator...");
    const tx = await contract.authorizeInvestigator(address);
    console.log(`📝 Transaction sent: ${tx.hash}`);

    await tx.wait();
    console.log(`✅ Investigator ${address} authorized successfully!`);
    console.log("━".repeat(60));
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function authorizeJudge(contract) {
  console.log("\n" + "━".repeat(60));
  console.log("⚖️  AUTHORIZE JUDGE");
  console.log("━".repeat(60));

  const address = await question("Enter judge address: ");

  try {
    console.log("\n⏳ Authorizing judge...");
    const tx = await contract.authorizeJudge(address);
    console.log(`📝 Transaction sent: ${tx.hash}`);

    await tx.wait();
    console.log(`✅ Judge ${address} authorized successfully!`);
    console.log("━".repeat(60));
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function authorizeParticipant(contract) {
  console.log("\n" + "━".repeat(60));
  console.log("👥 AUTHORIZE PARTICIPANT");
  console.log("━".repeat(60));

  const investigationId = await question("Enter investigation ID: ");
  const address = await question("Enter participant address: ");

  try {
    console.log("\n⏳ Authorizing participant...");
    const tx = await contract.authorizeParticipant(parseInt(investigationId), address);
    console.log(`📝 Transaction sent: ${tx.hash}`);

    await tx.wait();
    console.log(`✅ Participant ${address} authorized for investigation ${investigationId}!`);
    console.log("━".repeat(60));
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function submitEvidence(contract) {
  console.log("\n" + "━".repeat(60));
  console.log("📑 SUBMIT ENCRYPTED EVIDENCE");
  console.log("━".repeat(60));
  console.log("Evidence Types: 0=Document, 1=Testimony, 2=Physical, 3=Digital");

  const investigationId = await question("Enter investigation ID: ");
  const evidenceType = await question("Enter evidence type (0-3): ");
  const confidentialityLevel = await question("Enter confidentiality level (1-100): ");

  try {
    console.log("\n⏳ Submitting evidence...");
    const tx = await contract.submitEncryptedEvidence(
      parseInt(investigationId),
      parseInt(evidenceType),
      parseInt(confidentialityLevel)
    );
    console.log(`📝 Transaction sent: ${tx.hash}`);

    const receipt = await tx.wait();
    console.log(`✅ Evidence submitted successfully!`);
    console.log(`📦 Transaction confirmed in block ${receipt.blockNumber}`);
    console.log("━".repeat(60));
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function submitWitnessTestimony(contract) {
  console.log("\n" + "━".repeat(60));
  console.log("👤 SUBMIT ANONYMOUS WITNESS TESTIMONY");
  console.log("━".repeat(60));

  const investigationId = await question("Enter investigation ID: ");
  const credibilityScore = await question("Enter credibility score (0-100): ");
  const testimonyHash = await question("Enter encrypted testimony hash (numeric): ");

  try {
    console.log("\n⏳ Submitting witness testimony...");
    const tx = await contract.submitAnonymousWitnessTestimony(
      parseInt(investigationId),
      parseInt(credibilityScore),
      parseInt(testimonyHash)
    );
    console.log(`📝 Transaction sent: ${tx.hash}`);

    await tx.wait();
    console.log(`✅ Anonymous witness testimony submitted successfully!`);
    console.log("━".repeat(60));
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function submitVerdict(contract) {
  console.log("\n" + "━".repeat(60));
  console.log("⚖️  SUBMIT JUDICIAL VERDICT");
  console.log("━".repeat(60));
  console.log("Verdict: 0=Not Guilty, 1=Guilty, 2=Insufficient Evidence");

  const investigationId = await question("Enter investigation ID: ");
  const verdict = await question("Enter verdict (0-2): ");
  const confidence = await question("Enter confidence level (0-100): ");

  try {
    console.log("\n⏳ Submitting verdict...");
    const tx = await contract.submitJudicialVerdict(
      parseInt(investigationId),
      parseInt(verdict),
      parseInt(confidence)
    );
    console.log(`📝 Transaction sent: ${tx.hash}`);

    await tx.wait();
    console.log(`✅ Judicial verdict submitted successfully!`);
    console.log("━".repeat(60));
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function verifyEvidence(contract) {
  console.log("\n" + "━".repeat(60));
  console.log("✓ VERIFY EVIDENCE");
  console.log("━".repeat(60));

  const investigationId = await question("Enter investigation ID: ");
  const evidenceId = await question("Enter evidence ID: ");

  try {
    console.log("\n⏳ Verifying evidence...");
    const tx = await contract.verifyEvidence(parseInt(investigationId), parseInt(evidenceId));
    console.log(`📝 Transaction sent: ${tx.hash}`);

    await tx.wait();
    console.log(`✅ Evidence verified successfully!`);
    console.log("━".repeat(60));
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function completeInvestigation(contract) {
  console.log("\n" + "━".repeat(60));
  console.log("🏁 COMPLETE INVESTIGATION");
  console.log("━".repeat(60));

  const investigationId = await question("Enter investigation ID: ");

  try {
    console.log("\n⏳ Completing investigation...");
    const tx = await contract.completeInvestigation(parseInt(investigationId));
    console.log(`📝 Transaction sent: ${tx.hash}`);

    await tx.wait();
    console.log(`✅ Investigation ${investigationId} completed successfully!`);
    console.log("━".repeat(60));
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function viewInvestigationInfo(contract) {
  console.log("\n" + "━".repeat(60));
  console.log("🔍 VIEW INVESTIGATION INFO");
  console.log("━".repeat(60));

  const investigationId = await question("Enter investigation ID: ");

  try {
    const basicInfo = await contract.getInvestigationBasicInfo(parseInt(investigationId));
    const timeInfo = await contract.getInvestigationTimeInfo(parseInt(investigationId));
    const counts = await contract.getInvestigationCounts(parseInt(investigationId));
    const participantCount = await contract.getParticipantCount(parseInt(investigationId));

    const statusNames = ["Pending", "Active", "Completed", "Archived"];

    console.log(`\n📊 Investigation #${investigationId} Information:`);
    console.log(`   🕵️  Investigator: ${basicInfo.investigator}`);
    console.log(`   📌 Status: ${statusNames[basicInfo.status]}`);
    console.log(`   ⚡ Active: ${basicInfo.isActive ? "Yes" : "No"}`);
    console.log(`   📅 Start Time: ${new Date(Number(timeInfo.startTime) * 1000).toLocaleString()}`);
    if (timeInfo.endTime > 0) {
      console.log(`   🏁 End Time: ${new Date(Number(timeInfo.endTime) * 1000).toLocaleString()}`);
    }
    console.log(`   📑 Evidence Count: ${counts.evidenceCountTotal}`);
    console.log(`   👥 Witness Count: ${counts.witnessCountTotal}`);
    console.log(`   👤 Participants: ${participantCount}`);
    console.log("━".repeat(60));
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function viewStatistics(contract) {
  console.log("\n" + "━".repeat(60));
  console.log("📊 CONTRACT STATISTICS");
  console.log("━".repeat(60));

  try {
    const currentId = await contract.currentInvestigationId();
    const totalInvestigations = Number(currentId) - 1;

    console.log(`📈 Total Investigations Created: ${totalInvestigations}`);

    if (totalInvestigations > 0) {
      let activeCount = 0;
      let completedCount = 0;
      let totalEvidence = 0;
      let totalWitnesses = 0;

      for (let i = 1; i <= totalInvestigations; i++) {
        try {
          const info = await contract.getInvestigationBasicInfo(i);
          const counts = await contract.getInvestigationCounts(i);

          if (info.isActive) activeCount++;
          if (info.status === 2) completedCount++; // Status.Completed = 2

          totalEvidence += Number(counts.evidenceCountTotal);
          totalWitnesses += Number(counts.witnessCountTotal);
        } catch (e) {
          // Skip if investigation doesn't exist
          continue;
        }
      }

      console.log(`✅ Active Investigations: ${activeCount}`);
      console.log(`🏁 Completed Investigations: ${completedCount}`);
      console.log(`📑 Total Evidence Submitted: ${totalEvidence}`);
      console.log(`👥 Total Witnesses: ${totalWitnesses}`);
    }

    console.log("━".repeat(60));
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
  }
}

async function main() {
  console.log("\n🏛️  Welcome to Anonymous Court Investigation System!");

  try {
    const { contract, deploymentInfo, signer } = await loadContract();
    console.log(`✅ Connected to contract on ${deploymentInfo.network}`);

    let running = true;

    while (running) {
      await displayMenu();
      const choice = await question("Select an option: ");

      switch (choice.trim()) {
        case "1":
          await viewContractInfo(contract, deploymentInfo, signer);
          break;
        case "2":
          await startInvestigation(contract);
          break;
        case "3":
          await authorizeInvestigator(contract);
          break;
        case "4":
          await authorizeJudge(contract);
          break;
        case "5":
          await authorizeParticipant(contract);
          break;
        case "6":
          await submitEvidence(contract);
          break;
        case "7":
          await submitWitnessTestimony(contract);
          break;
        case "8":
          await submitVerdict(contract);
          break;
        case "9":
          await verifyEvidence(contract);
          break;
        case "10":
          await completeInvestigation(contract);
          break;
        case "11":
          await viewInvestigationInfo(contract);
          break;
        case "12":
          await viewStatistics(contract);
          break;
        case "0":
          running = false;
          console.log("\n👋 Goodbye!\n");
          break;
        default:
          console.log("\n❌ Invalid option. Please try again.");
      }
    }
  } catch (error) {
    console.error("\n❌ Error:", error.message);
  } finally {
    rl.close();
  }
}

// Execute if run directly
if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { main };
