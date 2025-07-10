const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("🎭 Starting Anonymous Court Investigation Simulation...");
  console.log("═".repeat(60));

  const networkName = hre.network.name;
  console.log(`📍 Network: ${networkName}\n`);

  // Get signers
  const [admin, investigator1, investigator2, judge1, judge2, witness1, witness2] = await hre.ethers.getSigners();

  console.log("👥 Simulation Participants:");
  console.log(`   👑 Admin: ${await admin.getAddress()}`);
  console.log(`   🕵️  Investigator 1: ${await investigator1.getAddress()}`);
  console.log(`   🕵️  Investigator 2: ${await investigator2.getAddress()}`);
  console.log(`   ⚖️  Judge 1: ${await judge1.getAddress()}`);
  console.log(`   ⚖️  Judge 2: ${await judge2.getAddress()}`);
  console.log(`   👤 Witness 1: ${await witness1.getAddress()}`);
  console.log(`   👤 Witness 2: ${await witness2.getAddress()}`);
  console.log("═".repeat(60));

  let contract;
  let contractAddress;

  // Try to load existing deployment or deploy new contract
  if (networkName !== "hardhat" && networkName !== "localhost") {
    const deploymentFile = path.join(__dirname, "..", "deployments", `${networkName}-deployment.json`);

    if (fs.existsSync(deploymentFile)) {
      const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
      contractAddress = deploymentInfo.contractAddress;
      contract = await hre.ethers.getContractAt("AnonymousCourtInvestigation", contractAddress, admin);
      console.log(`✅ Using deployed contract at: ${contractAddress}`);
    } else {
      console.log("⚠️  No deployment found. Please deploy first using: npm run deploy");
      return;
    }
  } else {
    // Deploy fresh contract for local testing
    console.log("📦 Deploying new contract for simulation...\n");
    const AnonymousCourtInvestigation = await hre.ethers.getContractFactory("AnonymousCourtInvestigation");
    contract = await AnonymousCourtInvestigation.deploy();
    await contract.waitForDeployment();
    contractAddress = await contract.getAddress();
    console.log(`✅ Contract deployed at: ${contractAddress}`);
  }

  console.log("═".repeat(60));

  // Simulation Steps
  try {
    // Step 1: Authorize participants
    console.log("\n📋 STEP 1: Authorizing Participants");
    console.log("━".repeat(60));

    console.log("🕵️  Authorizing investigators...");
    let tx = await contract.connect(admin).authorizeInvestigator(await investigator1.getAddress());
    await tx.wait();
    console.log(`   ✅ Investigator 1 authorized`);

    tx = await contract.connect(admin).authorizeInvestigator(await investigator2.getAddress());
    await tx.wait();
    console.log(`   ✅ Investigator 2 authorized`);

    console.log("⚖️  Authorizing judges...");
    tx = await contract.connect(admin).authorizeJudge(await judge1.getAddress());
    await tx.wait();
    console.log(`   ✅ Judge 1 authorized`);

    tx = await contract.connect(admin).authorizeJudge(await judge2.getAddress());
    await tx.wait();
    console.log(`   ✅ Judge 2 authorized`);

    // Step 2: Start Investigation
    console.log("\n📋 STEP 2: Starting Investigation");
    console.log("━".repeat(60));

    const caseId = 10001;
    console.log(`🚀 Starting investigation for case ID: ${caseId}`);
    tx = await contract.connect(investigator1).startInvestigation(caseId);
    const receipt = await tx.wait();
    console.log(`   ✅ Investigation started`);
    console.log(`   📝 Transaction: ${receipt.hash}`);

    const investigationId = 1;
    console.log(`   🔢 Investigation ID: ${investigationId}`);

    // Step 3: Authorize additional participants
    console.log("\n📋 STEP 3: Authorizing Additional Participants");
    console.log("━".repeat(60));

    console.log("👥 Authorizing participants for investigation...");
    tx = await contract.connect(investigator1).authorizeParticipant(investigationId, await investigator2.getAddress());
    await tx.wait();
    console.log(`   ✅ Investigator 2 authorized for investigation`);

    tx = await contract.connect(investigator1).authorizeParticipant(investigationId, await witness1.getAddress());
    await tx.wait();
    console.log(`   ✅ Witness 1 authorized for investigation`);

    // Step 4: Submit Evidence
    console.log("\n📋 STEP 4: Submitting Evidence");
    console.log("━".repeat(60));

    console.log("📑 Submitting encrypted evidence...");

    // Evidence 1: Document
    tx = await contract.connect(investigator1).submitEncryptedEvidence(investigationId, 0, 75);
    await tx.wait();
    console.log(`   ✅ Evidence 1 submitted (Type: Document, Confidentiality: 75)`);

    // Evidence 2: Digital
    tx = await contract.connect(investigator2).submitEncryptedEvidence(investigationId, 3, 90);
    await tx.wait();
    console.log(`   ✅ Evidence 2 submitted (Type: Digital, Confidentiality: 90)`);

    // Evidence 3: Physical
    tx = await contract.connect(witness1).submitEncryptedEvidence(investigationId, 2, 60);
    await tx.wait();
    console.log(`   ✅ Evidence 3 submitted (Type: Physical, Confidentiality: 60)`);

    // Step 5: Submit Witness Testimonies
    console.log("\n📋 STEP 5: Submitting Witness Testimonies");
    console.log("━".repeat(60));

    console.log("👤 Submitting anonymous witness testimonies...");

    tx = await contract.connect(witness1).submitAnonymousWitnessTestimony(investigationId, 85, 123456);
    await tx.wait();
    console.log(`   ✅ Witness 1 testimony submitted (Credibility: 85)`);

    tx = await contract.connect(witness2).submitAnonymousWitnessTestimony(investigationId, 92, 789012);
    await tx.wait();
    console.log(`   ✅ Witness 2 testimony submitted (Credibility: 92)`);

    // Step 6: Verify Evidence
    console.log("\n📋 STEP 6: Verifying Evidence");
    console.log("━".repeat(60));

    console.log("✓ Verifying submitted evidence...");
    tx = await contract.connect(investigator1).verifyEvidence(investigationId, 1);
    await tx.wait();
    console.log(`   ✅ Evidence 1 verified`);

    tx = await contract.connect(investigator1).verifyEvidence(investigationId, 2);
    await tx.wait();
    console.log(`   ✅ Evidence 2 verified`);

    // Step 7: Submit Judicial Verdicts
    console.log("\n📋 STEP 7: Submitting Judicial Verdicts");
    console.log("━".repeat(60));

    console.log("⚖️  Judges submitting verdicts...");

    // Judge 1: Guilty with 80% confidence
    tx = await contract.connect(judge1).submitJudicialVerdict(investigationId, 1, 80);
    await tx.wait();
    console.log(`   ✅ Judge 1 verdict: Guilty (Confidence: 80%)`);

    // Judge 2: Guilty with 75% confidence
    tx = await contract.connect(judge2).submitJudicialVerdict(investigationId, 1, 75);
    await tx.wait();
    console.log(`   ✅ Judge 2 verdict: Guilty (Confidence: 75%)`);

    // Step 8: Complete Investigation
    console.log("\n📋 STEP 8: Completing Investigation");
    console.log("━".repeat(60));

    console.log("🏁 Completing investigation...");
    tx = await contract.connect(investigator1).completeInvestigation(investigationId);
    await tx.wait();
    console.log(`   ✅ Investigation completed successfully`);

    // Step 9: Display Final Results
    console.log("\n📋 STEP 9: Final Investigation Results");
    console.log("━".repeat(60));

    const basicInfo = await contract.getInvestigationBasicInfo(investigationId);
    const timeInfo = await contract.getInvestigationTimeInfo(investigationId);
    const counts = await contract.getInvestigationCounts(investigationId);
    const participantCount = await contract.getParticipantCount(investigationId);

    const statusNames = ["Pending", "Active", "Completed", "Archived"];

    console.log(`\n📊 Investigation #${investigationId} Summary:`);
    console.log(`   🕵️  Lead Investigator: ${basicInfo.investigator}`);
    console.log(`   📌 Status: ${statusNames[basicInfo.status]}`);
    console.log(`   ⚡ Active: ${basicInfo.isActive ? "Yes" : "No"}`);
    console.log(`   📅 Started: ${new Date(Number(timeInfo.startTime) * 1000).toLocaleString()}`);
    console.log(`   🏁 Ended: ${new Date(Number(timeInfo.endTime) * 1000).toLocaleString()}`);
    console.log(`   ⏱️  Duration: ${Math.floor((Number(timeInfo.endTime) - Number(timeInfo.startTime)) / 60)} minutes`);
    console.log(`   📑 Total Evidence: ${counts.evidenceCountTotal}`);
    console.log(`   👥 Total Witnesses: ${counts.witnessCountTotal}`);
    console.log(`   👤 Total Participants: ${participantCount}`);

    // Check vote status
    const judge1Voted = await contract.hasVoted(investigationId, await judge1.getAddress());
    const judge2Voted = await contract.hasVoted(investigationId, await judge2.getAddress());
    console.log(`   ⚖️  Judge 1 Voted: ${judge1Voted ? "Yes" : "No"}`);
    console.log(`   ⚖️  Judge 2 Voted: ${judge2Voted ? "Yes" : "No"}`);

    console.log("\n═".repeat(60));
    console.log("✨ SIMULATION COMPLETED SUCCESSFULLY!");
    console.log("═".repeat(60));

    // Step 10: Additional Statistics
    console.log("\n📊 CONTRACT STATISTICS");
    console.log("━".repeat(60));

    const currentId = await contract.currentInvestigationId();
    console.log(`📈 Total Investigations Created: ${Number(currentId) - 1}`);
    console.log(`📄 Contract Address: ${contractAddress}`);
    console.log(`🌐 Network: ${networkName}`);

    if (networkName === "sepolia") {
      console.log(`🔍 Etherscan: https://sepolia.etherscan.io/address/${contractAddress}`);
    }

    console.log("━".repeat(60));

    // Summary of operations
    console.log("\n📋 SIMULATION SUMMARY");
    console.log("━".repeat(60));
    console.log("✅ Operations Completed:");
    console.log("   • Authorized 2 investigators");
    console.log("   • Authorized 2 judges");
    console.log("   • Started 1 investigation");
    console.log("   • Authorized 2 additional participants");
    console.log("   • Submitted 3 pieces of evidence");
    console.log("   • Submitted 2 witness testimonies");
    console.log("   • Verified 2 pieces of evidence");
    console.log("   • Submitted 2 judicial verdicts");
    console.log("   • Completed the investigation");
    console.log("━".repeat(60));

    console.log("\n🎉 All simulation steps executed successfully!");
    console.log("   The Anonymous Court Investigation system is fully functional.\n");

  } catch (error) {
    console.error("\n❌ Simulation Error:", error.message);
    throw error;
  }
}

// Execute simulation
main()
  .then(() => {
    console.log("\n✅ Simulation script completed!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Simulation failed:", error);
    process.exit(1);
  });

module.exports = { main };
