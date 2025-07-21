# Security Audit & Best Practices

## Overview

This document outlines the comprehensive security measures, audit procedures, and best practices implemented in the Anonymous Court Investigation System. Our security approach follows defense-in-depth principles with multiple layers of protection.

## Table of Contents

- [Security Architecture](#security-architecture)
- [Access Control](#access-control)
- [Security Tools & Automation](#security-tools--automation)
- [Vulnerability Prevention](#vulnerability-prevention)
- [Audit Procedures](#audit-procedures)
- [Incident Response](#incident-response)
- [Security Checklist](#security-checklist)

---

## Security Architecture

### Multi-Layer Security Model

```
┌─────────────────────────────────────────────────────────┐
│ Layer 1: Smart Contract Security                       │
│  - Access Control (RBAC)                                │
│  - Pausable Pattern                                     │
│  - ReentrancyGuard                                      │
│  - Input Validation                                     │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 2: Development Security                          │
│  - Solhint (Solidity Linter)                           │
│  - ESLint (JavaScript/TypeScript Security)             │
│  - Pre-commit Hooks (Husky)                            │
│  - Automated Testing (45+ tests)                       │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 3: CI/CD Security                                │
│  - GitHub Actions Workflows                            │
│  - Automated Security Audits                           │
│  - npm Audit                                           │
│  - Code Coverage (95%+ target)                         │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│ Layer 4: Operational Security                          │
│  - Environment Variable Protection                      │
│  - Secret Management                                    │
│  - Rate Limiting & DoS Protection                      │
│  - Monitoring & Alerting                               │
└─────────────────────────────────────────────────────────┘
```

---

## Access Control

### Role-Based Access Control (RBAC)

The contract implements a strict role-based access control system:

#### Roles and Permissions

| Role | Permissions | Security Level |
|------|-------------|----------------|
| **Admin** | - Grant/revoke investigator roles<br>- Grant/revoke judge roles<br>- Pause/unpause contract<br>- Emergency controls | CRITICAL |
| **Judge** | - Review investigations<br>- Set verdicts<br>- Close investigations | HIGH |
| **Investigator** | - Start investigations<br>- Manage participants<br>- Submit evidence | MEDIUM |
| **Participant** | - Submit evidence<br>- View assigned investigations | LOW |

#### Access Control Best Practices

```solidity
// ✅ CORRECT: Always use modifiers for access control
function startInvestigation(string memory _caseNumber)
    external
    onlyRole(INVESTIGATOR_ROLE)
    whenNotPaused
{
    // Function logic
}

// ❌ WRONG: Manual access checks are error-prone
function startInvestigation(string memory _caseNumber) external {
    require(hasRole(INVESTIGATOR_ROLE, msg.sender), "Not authorized");
    // Function logic - missing other checks!
}
```

### Pausable Pattern

The contract includes a pausable mechanism for emergency situations:

```solidity
// Emergency pause - Admin only
function pause() external onlyRole(DEFAULT_ADMIN_ROLE) {
    _pause();
}

// Resume operations - Admin only
function unpause() external onlyRole(DEFAULT_ADMIN_ROLE) {
    _unpause();
}
```

**When to Pause:**
- Critical vulnerability discovered
- Suspicious activity detected
- Ongoing security incident
- Emergency maintenance required

---

## Security Tools & Automation

### 1. Solhint - Solidity Linter

**Configuration:** `.solhint.json`

```json
{
  "extends": "solhint:recommended",
  "rules": {
    "compiler-version": ["error", "^0.8.0"],
    "func-visibility": ["error", { "ignoreConstructors": true }],
    "max-line-length": ["warn", 120],
    "code-complexity": ["warn", 10],
    "function-max-lines": ["warn", 100],
    "not-rely-on-time": "warn",
    "avoid-low-level-calls": "warn",
    "avoid-sha3": "warn",
    "no-inline-assembly": "warn"
  }
}
```

**Usage:**
```bash
# Lint all Solidity files
npm run lint

# Auto-fix issues
npm run lint:fix
```

### 2. ESLint - JavaScript/TypeScript Security

**Configuration:** `.eslintrc.json`

**Security Rules Enabled:**
- `security/detect-object-injection` - Prevents prototype pollution
- `security/detect-eval-with-expression` - Blocks eval() usage
- `security/detect-non-literal-regexp` - Prevents ReDoS attacks
- `security/detect-unsafe-regex` - Detects unsafe regular expressions
- `security/detect-buffer-noassert` - Buffer safety checks
- `security/detect-pseudoRandomBytes` - Cryptographic randomness

**Usage:**
```bash
# Lint JavaScript/TypeScript files
npm run lint:js

# Auto-fix issues
npm run lint:js:fix
```

### 3. Husky Pre-commit Hooks

**Pre-commit Hook:** `.husky/pre-commit`

Runs automatically before every commit:

1. **Solidity Linting** - Check smart contract code quality
2. **Code Formatting** - Ensure consistent formatting (Prettier)
3. **JavaScript Linting** - Security checks for scripts/tests
4. **Test Suite** - Run all 45+ tests
5. **Security Audit** - npm audit for dependency vulnerabilities

**Pre-push Hook:** `.husky/pre-push`

Runs before pushing to remote:

1. **Contract Compilation** - Ensure code compiles successfully
2. **Test Coverage** - Generate coverage reports (95%+ target)
3. **Sensitive Data Detection** - Scan for private keys, API keys

```bash
# Example: Sensitive data detection
if git diff --cached | grep -i "private.*key.*=.*0x[0-9a-fA-F]\{64\}"; then
  echo "❌ ERROR: Private key detected in commit!"
  exit 1
fi
```

### 4. GitHub Actions CI/CD

**Workflows:**

1. **test.yml** - Automated testing on push/PR
   - Matrix testing: Node.js 18.x, 20.x
   - Run full test suite
   - Cache dependencies for speed

2. **coverage.yml** - Code coverage tracking
   - Generate coverage reports
   - Upload to Codecov
   - Enforce 95% coverage target

3. **security.yml** - Security & quality checks (4 parallel jobs)
   - Solhint analysis
   - Prettier formatting check
   - npm audit (high severity vulnerabilities)
   - Gas usage reporting

---

## Vulnerability Prevention

### Common Vulnerabilities & Mitigations

#### 1. Reentrancy Attacks

**Vulnerability:**
```solidity
// ❌ VULNERABLE: External call before state change
function withdraw(uint256 amount) external {
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success);
    balances[msg.sender] -= amount;  // State change AFTER external call
}
```

**Mitigation:**
```solidity
// ✅ PROTECTED: Using ReentrancyGuard + Checks-Effects-Interactions
contract AnonymousCourtInvestigation is ReentrancyGuard {
    function submitEvidence(...) external nonReentrant {
        // 1. Checks
        require(hasRole(INVESTIGATOR_ROLE, msg.sender));

        // 2. Effects
        evidenceCount[investigationId]++;

        // 3. Interactions (if any)
        // External calls happen last
    }
}
```

#### 2. Access Control Vulnerabilities

**Vulnerability:**
```solidity
// ❌ VULNERABLE: Missing access control
function setVerdict(uint256 id, string memory verdict) external {
    investigations[id].verdict = verdict;
}
```

**Mitigation:**
```solidity
// ✅ PROTECTED: Proper access control with modifiers
function setVerdict(uint256 investigationId, string memory _verdict)
    external
    onlyRole(JUDGE_ROLE)
    whenNotPaused
{
    // Function logic
}
```

#### 3. Integer Overflow/Underflow

**Protection:**
```solidity
// ✅ PROTECTED: Solidity 0.8.x has built-in overflow checks
pragma solidity ^0.8.24;

// Automatic revert on overflow
uint256 total = participants.length + 1;  // Safe in 0.8.x
```

#### 4. DoS (Denial of Service)

**Vulnerability:**
```solidity
// ❌ VULNERABLE: Unbounded loop
function distributeRewards(address[] memory recipients) external {
    for (uint i = 0; i < recipients.length; i++) {
        // Could exceed gas limit with many recipients
        payable(recipients[i]).transfer(reward);
    }
}
```

**Mitigation:**
```solidity
// ✅ PROTECTED: Bounded operations with configurable limits
uint256 public constant MAX_EVIDENCE_PER_INVESTIGATION = 100;
uint256 public constant MAX_PARTICIPANTS_PER_INVESTIGATION = 50;

function addEvidence(...) external {
    require(
        evidenceCount[investigationId] < MAX_EVIDENCE_PER_INVESTIGATION,
        "Evidence limit reached"
    );
    // Function logic
}
```

**Additional DoS Protection** (`.env.example`):
```bash
# Rate Limiting & DoS Protection
MAX_TX_PER_BLOCK=10
RATE_LIMIT_PER_ADDRESS=100
MAX_EVIDENCE_PER_INVESTIGATION=100
MAX_PARTICIPANTS_PER_INVESTIGATION=50
```

#### 5. Front-Running

**Protection Strategy:**
- Use commit-reveal schemes for sensitive operations
- Implement minimum time delays between actions
- Consider using private mempools (Flashbots)

```solidity
// ✅ PROTECTED: Time-based protection
mapping(uint256 => uint256) public investigationStartTime;

function setVerdict(uint256 investigationId, string memory _verdict) external {
    require(
        block.timestamp >= investigationStartTime[investigationId] + 1 days,
        "Investigation cooling period"
    );
    // Function logic
}
```

#### 6. Timestamp Manipulation

**Vulnerability:**
```solidity
// ❌ VULNERABLE: Critical logic based on block.timestamp
require(block.timestamp == expectedTime, "Wrong time");
```

**Mitigation:**
```solidity
// ✅ SAFER: Allow reasonable timestamp tolerance
require(
    block.timestamp >= investigationStartTime[id] + 1 days,
    "Too early"
);
```

---

## Audit Procedures

### Pre-Deployment Audit Checklist

#### Smart Contract Audit

- [ ] **Code Review**
  - [ ] All functions have proper access control
  - [ ] ReentrancyGuard applied to external functions
  - [ ] No unchecked external calls
  - [ ] Input validation on all user inputs
  - [ ] Event emissions for all state changes

- [ ] **Solhint Analysis**
  ```bash
  npm run lint
  ```
  - [ ] No errors reported
  - [ ] All warnings reviewed and addressed

- [ ] **Testing**
  ```bash
  npm test
  npm run test:coverage
  ```
  - [ ] All 45+ tests passing
  - [ ] Code coverage ≥ 95%
  - [ ] Edge cases covered

- [ ] **Gas Optimization**
  ```bash
  npm run test:gas
  ```
  - [ ] Gas usage reviewed
  - [ ] No unexpected gas spikes
  - [ ] Optimizer settings verified

#### JavaScript/TypeScript Audit

- [ ] **ESLint Security Check**
  ```bash
  npm run lint:js
  ```
  - [ ] No security warnings
  - [ ] No eval() or Function() usage
  - [ ] No unsafe regular expressions

- [ ] **Dependency Audit**
  ```bash
  npm audit
  npm audit --audit-level=high
  ```
  - [ ] No high/critical vulnerabilities
  - [ ] All dependencies up to date

#### Configuration Audit

- [ ] **Environment Variables**
  - [ ] No secrets in version control
  - [ ] `.env.example` complete and documented
  - [ ] Private keys properly secured
  - [ ] Admin/Pauser addresses verified

- [ ] **Network Configuration**
  - [ ] RPC URLs configured correctly
  - [ ] Chain IDs verified
  - [ ] Gas price strategies set
  - [ ] Etherscan API key configured

#### Pre-commit/Pre-push Hooks

- [ ] **Husky Configuration**
  ```bash
  npm run prepare
  ```
  - [ ] Hooks installed correctly
  - [ ] Pre-commit checks passing
  - [ ] Pre-push checks passing

### Manual Security Review

#### Critical Functions Review

Review these high-risk functions manually:

1. **Role Management** (Admin functions)
   ```solidity
   grantInvestigatorRole(address)
   revokeInvestigatorRole(address)
   grantJudgeRole(address)
   revokeJudgeRole(address)
   ```

2. **Emergency Controls**
   ```solidity
   pause()
   unpause()
   ```

3. **Investigation Lifecycle**
   ```solidity
   startInvestigation(string)
   addParticipant(uint256, address)
   setVerdict(uint256, string)
   closeInvestigation(uint256)
   ```

#### Code Review Questions

For each function, ask:

- ✅ Is access control properly enforced?
- ✅ Are all inputs validated?
- ✅ Are events emitted for state changes?
- ✅ Is it protected against reentrancy?
- ✅ Can it cause DoS (unbounded loops/operations)?
- ✅ Are there overflow/underflow risks?
- ✅ Is it resistant to front-running?

### Automated Security Scans

#### Recommended Tools

1. **Slither** (Static Analysis)
   ```bash
   pip3 install slither-analyzer
   slither contracts/AnonymousCourtInvestigation.sol
   ```

2. **Mythril** (Symbolic Execution)
   ```bash
   docker pull mythril/myth
   myth analyze contracts/AnonymousCourtInvestigation.sol
   ```

3. **Echidna** (Fuzzing)
   ```bash
   docker run -it -v $PWD:/src trailofbits/eth-security-toolbox
   echidna-test contracts/AnonymousCourtInvestigation.sol
   ```

---

## Incident Response

### Security Incident Response Plan

#### Phase 1: Detection

**Monitoring:**
- Monitor contract events for unusual activity
- Set up alerts for:
  - Pause/unpause events
  - Role changes (especially admin)
  - High-frequency transactions
  - Failed transaction patterns

**Detection Tools:**
```bash
# Example: Monitor contract events
npm run interact:sepolia
# Select option: View Contract Information
```

#### Phase 2: Assessment

**Severity Levels:**

| Level | Description | Response Time |
|-------|-------------|---------------|
| **CRITICAL** | Active exploit, funds at risk | Immediate (< 1 hour) |
| **HIGH** | Vulnerability confirmed, no active exploit | 4 hours |
| **MEDIUM** | Potential vulnerability, requires investigation | 24 hours |
| **LOW** | Minor issue, no immediate risk | 1 week |

#### Phase 3: Containment

**Emergency Actions:**

1. **Pause Contract** (if critical vulnerability)
   ```javascript
   // Admin action via interact.js
   // Select: Pause Contract
   await contract.pause();
   ```

2. **Revoke Compromised Roles**
   ```javascript
   // Remove compromised investigator
   await contract.revokeInvestigatorRole(compromisedAddress);
   ```

3. **Document Incident**
   - Timestamp of detection
   - Affected functions/users
   - Attack vector (if known)
   - Actions taken

#### Phase 4: Recovery

**Recovery Steps:**

1. **Fix Vulnerability**
   - Deploy patched contract
   - Verify fix with tests
   - Audit changes

2. **Migrate State** (if necessary)
   - Export current state
   - Deploy new contract
   - Import state to new contract

3. **Verify Recovery**
   - Run full test suite
   - Check contract state
   - Verify access controls

4. **Resume Operations**
   ```javascript
   // After verification
   await contract.unpause();
   ```

#### Phase 5: Post-Incident Analysis

**Post-Mortem Report:**

- **Incident Summary**
  - What happened?
  - When was it detected?
  - How long did it last?

- **Root Cause Analysis**
  - What was the vulnerability?
  - How did it occur?
  - Why wasn't it caught earlier?

- **Impact Assessment**
  - Users affected
  - Data compromised
  - Financial impact

- **Lessons Learned**
  - What worked well?
  - What could be improved?
  - Process changes needed?

- **Action Items**
  - [ ] Update security procedures
  - [ ] Add new tests
  - [ ] Enhance monitoring
  - [ ] Team training

---

## Security Checklist

### Development Phase

- [ ] All dependencies installed from trusted sources
- [ ] No secrets in source code or version control
- [ ] `.env.example` maintained and documented
- [ ] Solidity compiler version pinned (0.8.24)
- [ ] Optimizer settings documented and tested
- [ ] All external calls protected against reentrancy
- [ ] Access control on all administrative functions
- [ ] Input validation on all user-facing functions
- [ ] Events emitted for all state changes
- [ ] Gas limits considered for all operations

### Testing Phase

- [ ] Unit tests cover all functions (45+ tests)
- [ ] Integration tests cover workflows
- [ ] Edge cases and error conditions tested
- [ ] Gas usage tested and optimized
- [ ] Code coverage ≥ 95%
- [ ] Reentrancy tests included
- [ ] Access control tests included
- [ ] DoS attack vectors tested

### Pre-Deployment Phase

- [ ] Full Solhint analysis passing
- [ ] ESLint security checks passing
- [ ] npm audit clean (no high/critical vulnerabilities)
- [ ] Pre-commit hooks passing
- [ ] Pre-push hooks passing
- [ ] CI/CD workflows all green
- [ ] Test coverage reports reviewed
- [ ] Gas reports reviewed
- [ ] Manual code review completed
- [ ] Admin/Pauser addresses verified
- [ ] Network configuration verified
- [ ] RPC endpoints tested
- [ ] Etherscan API key configured

### Deployment Phase

- [ ] Deployer account has sufficient balance
- [ ] Network configuration verified (Sepolia/Mainnet)
- [ ] Admin address correctly set
- [ ] Deployment transaction confirmed
- [ ] Contract verified on Etherscan
- [ ] Deployment info saved securely
- [ ] Initial roles granted correctly
- [ ] Contract functionality tested on-chain
- [ ] Events monitoring configured

### Post-Deployment Phase

- [ ] Contract address published
- [ ] Documentation updated with contract address
- [ ] Monitoring alerts configured
- [ ] Backup procedures documented
- [ ] Emergency contact list updated
- [ ] Incident response plan reviewed
- [ ] Team trained on emergency procedures
- [ ] Regular security audits scheduled

---

## Security Resources

### Official Documentation

- **OpenZeppelin Contracts:** https://docs.openzeppelin.com/contracts/
- **Ethereum Security Best Practices:** https://consensys.github.io/smart-contract-best-practices/
- **Solidity Security Considerations:** https://docs.soliditylang.org/en/latest/security-considerations.html

### Security Tools

- **Slither:** https://github.com/crytic/slither
- **Mythril:** https://github.com/ConsenSys/mythril
- **Echidna:** https://github.com/crytic/echidna
- **Manticore:** https://github.com/trailofbits/manticore

### Security Auditors

- **ConsenSys Diligence:** https://consensys.net/diligence/
- **Trail of Bits:** https://www.trailofbits.com/
- **OpenZeppelin:** https://www.openzeppelin.com/security-audits
- **Certora:** https://www.certora.com/

---

## Conclusion

Security is an ongoing process, not a one-time checklist. This document provides a comprehensive framework for maintaining security throughout the development lifecycle. Regular audits, continuous monitoring, and staying updated with the latest security best practices are essential for protecting the Anonymous Court Investigation System and its users.

**Remember:** Security is everyone's responsibility.

---

**Last Updated:** 2025-10-26
**Version:** 1.0.0
**Maintainer:** Anonymous Court Investigation Team
