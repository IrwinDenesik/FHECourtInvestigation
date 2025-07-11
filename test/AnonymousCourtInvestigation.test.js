const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("AnonymousCourtInvestigation", function () {
  // Fixture to deploy contract
  async function deployContractFixture() {
    const [admin, investigator1, investigator2, judge1, judge2, witness1, witness2, unauthorized] =
      await ethers.getSigners();

    const AnonymousCourtInvestigation = await ethers.getContractFactory("AnonymousCourtInvestigation");
    const contract = await AnonymousCourtInvestigation.deploy();
    await contract.waitForDeployment();

    return {
      contract,
      admin,
      investigator1,
      investigator2,
      judge1,
      judge2,
      witness1,
      witness2,
      unauthorized,
    };
  }

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      const { contract, admin } = await loadFixture(deployContractFixture);
      expect(await contract.admin()).to.equal(admin.address);
    });

    it("Should set admin as authorized investigator and judge", async function () {
      const { contract, admin } = await loadFixture(deployContractFixture);
      expect(await contract.authorizedInvestigators(admin.address)).to.be.true;
      expect(await contract.authorizedJudges(admin.address)).to.be.true;
    });

    it("Should initialize investigation ID to 1", async function () {
      const { contract } = await loadFixture(deployContractFixture);
      expect(await contract.currentInvestigationId()).to.equal(1);
    });
  });

  describe("Authorization Management", function () {
    describe("Authorize Investigator", function () {
      it("Should allow admin to authorize investigator", async function () {
        const { contract, admin, investigator1 } = await loadFixture(deployContractFixture);

        await expect(contract.connect(admin).authorizeInvestigator(investigator1.address))
          .to.not.be.reverted;

        expect(await contract.authorizedInvestigators(investigator1.address)).to.be.true;
      });

      it("Should revert if non-admin tries to authorize investigator", async function () {
        const { contract, investigator1, investigator2 } = await loadFixture(deployContractFixture);

        await expect(
          contract.connect(investigator1).authorizeInvestigator(investigator2.address)
        ).to.be.revertedWith("Not authorized admin");
      });
    });

    describe("Authorize Judge", function () {
      it("Should allow admin to authorize judge", async function () {
        const { contract, admin, judge1 } = await loadFixture(deployContractFixture);

        await expect(contract.connect(admin).authorizeJudge(judge1.address))
          .to.not.be.reverted;

        expect(await contract.authorizedJudges(judge1.address)).to.be.true;
      });

      it("Should revert if non-admin tries to authorize judge", async function () {
        const { contract, investigator1, judge1 } = await loadFixture(deployContractFixture);

        await expect(
          contract.connect(investigator1).authorizeJudge(judge1.address)
        ).to.be.revertedWith("Not authorized admin");
      });
    });

    describe("Revoke Access", function () {
      it("Should allow admin to revoke investigator access", async function () {
        const { contract, admin, investigator1 } = await loadFixture(deployContractFixture);

        await contract.connect(admin).authorizeInvestigator(investigator1.address);
        expect(await contract.authorizedInvestigators(investigator1.address)).to.be.true;

        await contract.connect(admin).revokeInvestigatorAccess(investigator1.address);
        expect(await contract.authorizedInvestigators(investigator1.address)).to.be.false;
      });

      it("Should allow admin to revoke judge access", async function () {
        const { contract, admin, judge1 } = await loadFixture(deployContractFixture);

        await contract.connect(admin).authorizeJudge(judge1.address);
        expect(await contract.authorizedJudges(judge1.address)).to.be.true;

        await contract.connect(admin).revokeJudgeAccess(judge1.address);
        expect(await contract.authorizedJudges(judge1.address)).to.be.false;
      });
    });
  });

  describe("Investigation Management", function () {
    describe("Start Investigation", function () {
      it("Should allow authorized investigator to start investigation", async function () {
        const { contract, admin } = await loadFixture(deployContractFixture);

        const caseId = 12345;
        await expect(contract.connect(admin).startInvestigation(caseId))
          .to.emit(contract, "InvestigationStarted")
          .withArgs(1, admin.address);

        const info = await contract.getInvestigationBasicInfo(1);
        expect(info.investigator).to.equal(admin.address);
        expect(info.status).to.equal(1); // Active
        expect(info.isActive).to.be.true;
      });

      it("Should increment investigation ID after each start", async function () {
        const { contract, admin } = await loadFixture(deployContractFixture);

        expect(await contract.currentInvestigationId()).to.equal(1);

        await contract.connect(admin).startInvestigation(100);
        expect(await contract.currentInvestigationId()).to.equal(2);

        await contract.connect(admin).startInvestigation(200);
        expect(await contract.currentInvestigationId()).to.equal(3);
      });

      it("Should revert if unauthorized user tries to start investigation", async function () {
        const { contract, unauthorized } = await loadFixture(deployContractFixture);

        await expect(
          contract.connect(unauthorized).startInvestigation(12345)
        ).to.be.revertedWith("Not authorized investigator");
      });
    });

    describe("Authorize Participant", function () {
      it("Should allow investigator to authorize participant for their investigation", async function () {
        const { contract, admin, witness1 } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);

        await expect(contract.connect(admin).authorizeParticipant(1, witness1.address))
          .to.emit(contract, "ParticipantAuthorized")
          .withArgs(1, witness1.address);

        const isAuthorized = await contract.isAuthorizedForInvestigation(1, witness1.address);
        expect(isAuthorized).to.be.true;
      });

      it("Should revert if non-creator tries to authorize participant", async function () {
        const { contract, admin, investigator1, witness1 } = await loadFixture(deployContractFixture);

        await contract.connect(admin).authorizeInvestigator(investigator1.address);
        await contract.connect(admin).startInvestigation(100);

        await expect(
          contract.connect(investigator1).authorizeParticipant(1, witness1.address)
        ).to.be.revertedWith("Only investigation creator can authorize");
      });

      it("Should revert if investigation is not active", async function () {
        const { contract, admin, witness1 } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);
        await contract.connect(admin).completeInvestigation(1);

        await expect(
          contract.connect(admin).authorizeParticipant(1, witness1.address)
        ).to.be.revertedWith("Investigation not active");
      });
    });

    describe("Complete Investigation", function () {
      it("Should allow investigator to complete their investigation", async function () {
        const { contract, admin } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);

        await expect(contract.connect(admin).completeInvestigation(1))
          .to.emit(contract, "InvestigationCompleted")
          .withArgs(1);

        const info = await contract.getInvestigationBasicInfo(1);
        expect(info.status).to.equal(2); // Completed
        expect(info.isActive).to.be.false;
      });

      it("Should revert if non-creator tries to complete investigation", async function () {
        const { contract, admin, investigator1 } = await loadFixture(deployContractFixture);

        await contract.connect(admin).authorizeInvestigator(investigator1.address);
        await contract.connect(admin).startInvestigation(100);

        await expect(
          contract.connect(investigator1).completeInvestigation(1)
        ).to.be.revertedWith("Only investigation creator can complete");
      });
    });

    describe("Archive Investigation", function () {
      it("Should allow admin to archive completed investigation", async function () {
        const { contract, admin } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);
        await contract.connect(admin).completeInvestigation(1);

        await contract.connect(admin).archiveInvestigation(1);

        const info = await contract.getInvestigationBasicInfo(1);
        expect(info.status).to.equal(3); // Archived
      });

      it("Should revert if investigation is not completed", async function () {
        const { contract, admin } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);

        await expect(
          contract.connect(admin).archiveInvestigation(1)
        ).to.be.revertedWith("Investigation must be completed first");
      });
    });
  });

  describe("Evidence Management", function () {
    describe("Submit Evidence", function () {
      it("Should allow authorized participant to submit evidence", async function () {
        const { contract, admin, witness1 } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);
        await contract.connect(admin).authorizeParticipant(1, witness1.address);

        await expect(contract.connect(witness1).submitEncryptedEvidence(1, 0, 75))
          .to.emit(contract, "EvidenceSubmitted")
          .withArgs(1, 1, witness1.address);

        const counts = await contract.getInvestigationCounts(1);
        expect(counts.evidenceCountTotal).to.equal(1);
      });

      it("Should revert if evidence type is invalid", async function () {
        const { contract, admin } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);

        await expect(
          contract.connect(admin).submitEncryptedEvidence(1, 5, 75)
        ).to.be.revertedWith("Invalid evidence type");
      });

      it("Should revert if confidentiality level is zero", async function () {
        const { contract, admin } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);

        await expect(
          contract.connect(admin).submitEncryptedEvidence(1, 0, 0)
        ).to.be.revertedWith("Confidentiality level must be greater than 0");
      });

      it("Should revert if unauthorized user tries to submit evidence", async function () {
        const { contract, admin, unauthorized } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);

        await expect(
          contract.connect(unauthorized).submitEncryptedEvidence(1, 0, 75)
        ).to.be.revertedWith("Not authorized participant");
      });
    });

    describe("Verify Evidence", function () {
      it("Should allow authorized investigator to verify evidence", async function () {
        const { contract, admin } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);
        await contract.connect(admin).submitEncryptedEvidence(1, 0, 75);

        await expect(contract.connect(admin).verifyEvidence(1, 1))
          .to.not.be.reverted;

        const evidenceInfo = await contract.getEvidenceInfo(1, 1);
        expect(evidenceInfo.isVerified).to.be.true;
      });

      it("Should revert if evidence does not exist", async function () {
        const { contract, admin } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);

        await expect(
          contract.connect(admin).verifyEvidence(1, 999)
        ).to.be.revertedWith("Evidence does not exist");
      });
    });
  });

  describe("Witness Management", function () {
    describe("Submit Witness Testimony", function () {
      it("Should allow anyone to submit anonymous witness testimony", async function () {
        const { contract, admin, witness1 } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);

        await expect(contract.connect(witness1).submitAnonymousWitnessTestimony(1, 85, 123456))
          .to.emit(contract, "WitnessTestimonySubmitted")
          .withArgs(1, 1);

        const counts = await contract.getInvestigationCounts(1);
        expect(counts.witnessCountTotal).to.equal(1);
      });

      it("Should revert if credibility score is over 100", async function () {
        const { contract, admin, witness1 } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);

        await expect(
          contract.connect(witness1).submitAnonymousWitnessTestimony(1, 150, 123456)
        ).to.be.revertedWith("Credibility score must be 0-100");
      });
    });
  });

  describe("Judicial Verdict", function () {
    describe("Submit Verdict", function () {
      it("Should allow authorized judge to submit verdict", async function () {
        const { contract, admin, judge1 } = await loadFixture(deployContractFixture);

        await contract.connect(admin).authorizeJudge(judge1.address);
        await contract.connect(admin).startInvestigation(100);

        await expect(contract.connect(judge1).submitJudicialVerdict(1, 1, 80))
          .to.emit(contract, "VerdictSubmitted")
          .withArgs(1, judge1.address);

        const hasVoted = await contract.hasVoted(1, judge1.address);
        expect(hasVoted).to.be.true;
      });

      it("Should revert if verdict value is invalid", async function () {
        const { contract, admin, judge1 } = await loadFixture(deployContractFixture);

        await contract.connect(admin).authorizeJudge(judge1.address);
        await contract.connect(admin).startInvestigation(100);

        await expect(
          contract.connect(judge1).submitJudicialVerdict(1, 5, 80)
        ).to.be.revertedWith("Verdict must be 0 (not guilty), 1 (guilty), or 2 (insufficient evidence)");
      });

      it("Should revert if confidence is over 100", async function () {
        const { contract, admin, judge1 } = await loadFixture(deployContractFixture);

        await contract.connect(admin).authorizeJudge(judge1.address);
        await contract.connect(admin).startInvestigation(100);

        await expect(
          contract.connect(judge1).submitJudicialVerdict(1, 1, 150)
        ).to.be.revertedWith("Confidence must be 0-100");
      });

      it("Should revert if judge tries to vote twice", async function () {
        const { contract, admin, judge1 } = await loadFixture(deployContractFixture);

        await contract.connect(admin).authorizeJudge(judge1.address);
        await contract.connect(admin).startInvestigation(100);

        await contract.connect(judge1).submitJudicialVerdict(1, 1, 80);

        await expect(
          contract.connect(judge1).submitJudicialVerdict(1, 0, 90)
        ).to.be.revertedWith("Vote already submitted");
      });

      it("Should revert if unauthorized user tries to submit verdict", async function () {
        const { contract, admin, unauthorized } = await loadFixture(deployContractFixture);

        await contract.connect(admin).startInvestigation(100);

        await expect(
          contract.connect(unauthorized).submitJudicialVerdict(1, 1, 80)
        ).to.be.revertedWith("Not authorized judge");
      });
    });
  });

  describe("View Functions", function () {
    it("Should return correct investigation basic info", async function () {
      const { contract, admin } = await loadFixture(deployContractFixture);

      await contract.connect(admin).startInvestigation(100);

      const info = await contract.getInvestigationBasicInfo(1);
      expect(info.investigator).to.equal(admin.address);
      expect(info.status).to.equal(1); // Active
      expect(info.isActive).to.be.true;
    });

    it("Should return correct investigation time info", async function () {
      const { contract, admin } = await loadFixture(deployContractFixture);

      await contract.connect(admin).startInvestigation(100);

      const timeInfo = await contract.getInvestigationTimeInfo(1);
      expect(timeInfo.startTime).to.be.gt(0);
      expect(timeInfo.endTime).to.equal(0);
    });

    it("Should return correct investigation counts", async function () {
      const { contract, admin } = await loadFixture(deployContractFixture);

      await contract.connect(admin).startInvestigation(100);
      await contract.connect(admin).submitEncryptedEvidence(1, 0, 75);
      await contract.connect(admin).submitEncryptedEvidence(1, 1, 80);
      await contract.connect(admin).submitAnonymousWitnessTestimony(1, 85, 123456);

      const counts = await contract.getInvestigationCounts(1);
      expect(counts.evidenceCountTotal).to.equal(2);
      expect(counts.witnessCountTotal).to.equal(1);
    });

    it("Should return correct participant count", async function () {
      const { contract, admin, witness1, witness2 } = await loadFixture(deployContractFixture);

      await contract.connect(admin).startInvestigation(100);
      await contract.connect(admin).authorizeParticipant(1, witness1.address);
      await contract.connect(admin).authorizeParticipant(1, witness2.address);

      const count = await contract.getParticipantCount(1);
      expect(count).to.equal(3); // admin + 2 witnesses
    });
  });

  describe("Integration Tests", function () {
    it("Should handle complete investigation workflow", async function () {
      const { contract, admin, investigator1, judge1, witness1 } = await loadFixture(deployContractFixture);

      // Setup
      await contract.connect(admin).authorizeInvestigator(investigator1.address);
      await contract.connect(admin).authorizeJudge(judge1.address);

      // Start investigation
      await contract.connect(investigator1).startInvestigation(10001);

      // Authorize participant
      await contract.connect(investigator1).authorizeParticipant(1, witness1.address);

      // Submit evidence
      await contract.connect(investigator1).submitEncryptedEvidence(1, 0, 75);
      await contract.connect(witness1).submitEncryptedEvidence(1, 2, 85);

      // Submit witness testimony
      await contract.connect(witness1).submitAnonymousWitnessTestimony(1, 90, 123456);

      // Verify evidence
      await contract.connect(investigator1).verifyEvidence(1, 1);

      // Submit verdict
      await contract.connect(judge1).submitJudicialVerdict(1, 1, 85);

      // Complete investigation
      await contract.connect(investigator1).completeInvestigation(1);

      // Verify final state
      const info = await contract.getInvestigationBasicInfo(1);
      expect(info.status).to.equal(2); // Completed
      expect(info.isActive).to.be.false;

      const counts = await contract.getInvestigationCounts(1);
      expect(counts.evidenceCountTotal).to.equal(2);
      expect(counts.witnessCountTotal).to.equal(1);

      const hasVoted = await contract.hasVoted(1, judge1.address);
      expect(hasVoted).to.be.true;
    });
  });
});
