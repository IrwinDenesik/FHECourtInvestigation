# Toolchain Integration Guide

## Overview

This document provides a comprehensive guide to the complete development toolchain used in the Anonymous Court Investigation System. It demonstrates how Hardhat, security tools, code quality tools, and CI/CD pipelines work together to create a robust, secure, and high-performance smart contract application.

## Table of Contents

- [Toolchain Architecture](#toolchain-architecture)
- [Layer 1: Smart Contract Development](#layer-1-smart-contract-development)
- [Layer 2: Code Quality & Security](#layer-2-code-quality--security)
- [Layer 3: CI/CD & Automation](#layer-3-cicd--automation)
- [Complete Workflow](#complete-workflow)
- [Tool Reference](#tool-reference)

---

## Toolchain Architecture

### Complete Tool Stack

```
┌──────────────────────────────────────────────────────────────────┐
│                    LAYER 1: DEVELOPMENT                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Hardhat  │→ │ Solhint  │→ │   Gas    │→ │Optimizer │       │
│  │          │  │          │  │ Reporter │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│       ↓             ↓              ↓              ↓             │
│   Compile       Code Lint      Monitor Gas   Optimize Gas      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                  LAYER 2: QUALITY & SECURITY                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ ESLint   │→ │ Prettier │→ │TypeScript│→ │  Tests   │       │
│  │          │  │          │  │          │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│       ↓             ↓              ↓              ↓             │
│  JS Security   Format Code   Type Safety   45+ Tests           │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────────────────────────────────────────────────────┐
│                   LAYER 3: CI/CD & AUTOMATION                    │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │  GitHub  │→ │ Security │→ │ Coverage │→ │  Deploy  │       │
│  │ Actions  │  │  Checks  │  │  95%+    │  │          │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│       ↓             ↓              ↓              ↓             │
│  Auto Test     npm Audit      Codecov       Sepolia            │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                              ↓
                    Production Smart Contract
```

---

## Layer 1: Smart Contract Development

### Hardhat - Development Framework

**Purpose:** Core development environment for compiling, testing, and deploying smart contracts.

**Configuration:** `hardhat.config.cjs`

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-verify");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      viaIR: true,  // New optimizer pipeline
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      chainId: 11155111,
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 21,
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
};
```

**Key Features:**
- ✅ Multi-network support (localhost, Sepolia)
- ✅ Etherscan verification integration
- ✅ Gas reporting with USD conversion
- ✅ Solidity optimizer with viaIR
- ✅ Coverage reporting

**Usage:**
```bash
# Compile contracts
npm run compile

# Run local node
npm run node

# Deploy to Sepolia
npm run deploy:sepolia

# Verify on Etherscan
npm run verify:sepolia
```

---

### Solhint - Solidity Linter

**Purpose:** Enforce Solidity best practices and catch common security issues.

**Configuration:** `.solhint.json`

```json
{
  "extends": "solhint:recommended",
  "plugins": ["prettier"],
  "rules": {
    "compiler-version": ["error", "^0.8.0"],
    "func-visibility": ["error", { "ignoreConstructors": true }],
    "max-line-length": ["warn", 120],
    "code-complexity": ["warn", 10],
    "function-max-lines": ["warn", 100],
    "not-rely-on-time": "warn",
    "avoid-low-level-calls": "warn",
    "no-unused-vars": "error",
    "const-name-snakecase": "error",
    "event-name-camelcase": "error",
    "func-name-mixedcase": "error",
    "modifier-name-mixedcase": "error",
    "private-vars-leading-underscore": "warn",
    "reason-string": ["warn", { "maxLength": 64 }],
    "prettier/prettier": "error"
  }
}
```

**Integration with Development:**

```bash
# Lint Solidity files
npm run lint

# Auto-fix issues
npm run lint:fix

# Integrated into pre-commit hook
# Runs automatically before every commit
```

**What It Catches:**
- Incorrect compiler versions
- Missing function visibility
- Code complexity issues
- Function length violations
- Security anti-patterns
- Naming convention violations
- Formatting issues

---

### Gas Reporter

**Purpose:** Monitor and optimize gas usage for all contract operations.

**Configuration:** Already integrated in `hardhat.config.cjs`

**Usage:**
```bash
# Generate detailed gas report
REPORT_GAS=true npm test

# Output example:
# ·-----------------------------------------|---------------------------|-------------|-----------------------------·
# |  Solc version: 0.8.24                   ·  Optimizer enabled: true  ·  Runs: 200  ·  Block limit: 30000000 gas  │
# ··········································|···························|·············|······························
# |  Methods                                                                                                         │
# ·············|····························|·············|·············|·············|···············|··············
# |  Contract  ·  Method                    ·  Min        ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
# ·············|····························|·············|·············|·············|···············|··············
# |  Contract  ·  startInvestigation        ·     125343  ·     145343  ·     135343  ·           10  ·       1.42  │
# |  Contract  ·  addParticipant            ·      75234  ·      85234  ·      80234  ·           20  ·       0.84  │
# ·············|····························|·············|·············|·············|···············|··············
```

**Benefits:**
- 📊 Track gas costs per function
- 💰 USD cost estimates
- 🎯 Identify optimization opportunities
- 📈 Monitor gas usage trends
- ⚠️ Detect gas spikes

---

### Solidity Optimizer

**Purpose:** Optimize bytecode for reduced gas consumption.

**Settings:**
```javascript
optimizer: {
  enabled: true,
  runs: 200,      // Balanced for deployment vs. runtime
  viaIR: true,    // New optimizer pipeline (5-15% savings)
}
```

**Optimization Trade-offs:**

| Runs | Deployment Cost | Runtime Cost | Use Case |
|------|-----------------|--------------|----------|
| 1 | **Lowest** | Highest | Rarely called |
| 200 | **Balanced** | **Balanced** | **Most contracts** ✅ |
| 1000 | Higher | Lower | Frequently called |
| 10000+ | Highest | **Lowest** | Core libraries |

**Via IR Benefits:**
- ✅ 5-15% additional gas savings
- ✅ Better storage packing optimization
- ✅ Improved loop optimization
- ❌ Slower compilation (~2x)

---

## Layer 2: Code Quality & Security

### ESLint - JavaScript/TypeScript Security

**Purpose:** Enforce secure coding practices for scripts and tests.

**Configuration:** `.eslintrc.json`

```json
{
  "env": {
    "browser": false,
    "es2021": true,
    "mocha": true,
    "node": true
  },
  "plugins": ["@typescript-eslint", "security"],
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:security/recommended"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": 12,
    "sourceType": "module"
  },
  "rules": {
    "security/detect-object-injection": "warn",
    "security/detect-non-literal-regexp": "warn",
    "security/detect-unsafe-regex": "error",
    "security/detect-buffer-noassert": "error",
    "security/detect-eval-with-expression": "error",
    "security/detect-pseudoRandomBytes": "error",
    "no-eval": "error",
    "no-implied-eval": "error",
    "no-new-func": "error"
  }
}
```

**Security Rules:**
- 🛡️ Detect object injection (prototype pollution)
- 🛡️ Prevent eval() usage
- 🛡️ Catch unsafe regex (ReDoS)
- 🛡️ Enforce secure buffer operations
- 🛡️ Detect weak randomness

**Usage:**
```bash
# Lint JavaScript/TypeScript
npm run lint:js

# Auto-fix issues
npm run lint:js:fix

# Integrated into pre-commit hook
```

---

### Prettier - Code Formatter

**Purpose:** Enforce consistent code formatting across the project.

**Configuration:** `.prettierrc.json`

```json
{
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "semi": true,
  "singleQuote": false,
  "quoteProps": "as-needed",
  "trailingComma": "es5",
  "bracketSpacing": true,
  "arrowParens": "always",
  "overrides": [
    {
      "files": "*.sol",
      "options": {
        "printWidth": 120,
        "tabWidth": 4,
        "useTabs": false,
        "singleQuote": false,
        "bracketSpacing": false
      }
    }
  ]
}
```

**Integration:**
```bash
# Format all code
npm run format

# Check formatting (CI)
npm run format:check

# Auto-formats in pre-commit hook
```

**Benefits:**
- ✅ Consistent code style
- ✅ Reduced code review friction
- ✅ Better readability
- ✅ Automated enforcement

---

### TypeScript

**Purpose:** Type safety for scripts and tests.

**Configuration:** `tsconfig.json` (if using TypeScript)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "outDir": "./dist",
    "rootDir": "./",
    "types": ["node", "mocha", "chai"]
  },
  "include": ["./scripts/**/*", "./test/**/*"],
  "exclude": ["node_modules"]
}
```

**Benefits:**
- ✅ Catch type errors at compile time
- ✅ Better IDE autocomplete
- ✅ Self-documenting code
- ✅ Refactoring safety

---

### Testing Framework

**Stack:** Hardhat + Mocha + Chai

**Test Structure:**
```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("AnonymousCourtInvestigation", function () {
  let contract, admin, investigator, judge;

  beforeEach(async function () {
    [admin, investigator, judge] = await ethers.getSigners();
    const Contract = await ethers.getContractFactory("AnonymousCourtInvestigation");
    contract = await Contract.deploy(admin.address);
  });

  describe("Deployment", function () {
    it("Should set the correct admin", async function () {
      expect(await contract.admin()).to.equal(admin.address);
    });
  });

  // 45+ more tests...
});
```

**Coverage:**
- ✅ 45+ test cases
- ✅ Deployment tests
- ✅ Access control tests
- ✅ Workflow tests
- ✅ Edge case tests
- ✅ Error condition tests
- ✅ Integration tests
- ✅ Gas usage tests

**Usage:**
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run with gas reporting
npm run test:gas
```

---

## Layer 3: CI/CD & Automation

### GitHub Actions - Automated Testing

**Workflow 1:** `test.yml` - Automated Testing

```yaml
name: Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x]

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test
```

**Triggers:**
- Every push to `main` or `develop`
- Every pull request
- Matrix testing on Node.js 18.x and 20.x

---

**Workflow 2:** `coverage.yml` - Code Coverage

```yaml
name: Coverage

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  coverage:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: "20.x"
          cache: "npm"

      - name: Install dependencies
        run: npm ci

      - name: Generate coverage report
        run: npm run test:coverage

      - name: Upload to Codecov
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          flags: unittests
          name: codecov-umbrella
```

**Integration with Codecov:**
- 📊 Track coverage over time
- 🎯 Enforce 95% coverage target
- 📈 Visualize coverage trends
- ⚠️ Fail PRs below threshold

---

**Workflow 3:** `security.yml` - Security & Quality Checks

```yaml
name: Security & Quality

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  solhint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20.x"
          cache: "npm"
      - run: npm ci
      - run: npm run lint

  prettier:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20.x"
          cache: "npm"
      - run: npm ci
      - run: npm run format:check

  npm-audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20.x"
          cache: "npm"
      - run: npm ci
      - run: npm audit --audit-level=high

  gas-report:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20.x"
          cache: "npm"
      - run: npm ci
      - run: REPORT_GAS=true npm test
      - name: Upload gas report
        uses: actions/upload-artifact@v4
        with:
          name: gas-report
          path: gas-report.txt
```

**Parallel Jobs:**
- ⚡ 4 jobs run simultaneously
- 🛡️ Solhint (code quality)
- ✨ Prettier (formatting)
- 🔒 npm audit (vulnerabilities)
- ⛽ Gas reporting (optimization)

---

### Husky - Git Hooks

**Purpose:** Automated checks before commit and push.

**Pre-commit Hook:** `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🔍 Running pre-commit security checks..."

# Step 1: Lint Solidity
npm run lint || exit 1

# Step 2: Check formatting
npm run format:check || exit 1

# Step 3: Lint JavaScript/TypeScript
npx eslint scripts/ test/ --ext .js,.ts || exit 1

# Step 4: Run tests
npm test || exit 1

# Step 5: Security audit
npm audit --audit-level=high

echo "✅ All pre-commit checks passed!"
```

**Pre-push Hook:** `.husky/pre-push`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

echo "🚀 Running pre-push checks..."

# Step 1: Compile contracts
npm run compile || exit 1

# Step 2: Run coverage
npm run test:coverage || exit 1

# Step 3: Check for sensitive data
if git diff --cached | grep -i "private.*key.*=.*0x[0-9a-fA-F]\{64\}"; then
  echo "❌ ERROR: Private key detected!"
  exit 1
fi

echo "✅ All pre-push checks passed!"
```

**Installation:**
```bash
# Install Husky
npm install --save-dev husky

# Initialize hooks
npm run prepare

# Hooks are now active!
```

---

## Complete Workflow

### Development Workflow

#### 1. Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd <project-directory>

# Install dependencies
npm install

# Initialize Husky hooks
npm run prepare

# Configure environment
cp .env.example .env
# Edit .env with your settings
```

#### 2. Development Cycle

```bash
# Start local node (Terminal 1)
npm run node

# Write/modify smart contract
# contracts/AnonymousCourtInvestigation.sol

# Compile contract
npm run compile

# Write tests
# test/AnonymousCourtInvestigation.test.js

# Run tests
npm test

# Check coverage
npm run test:coverage

# Check gas usage
npm run test:gas
```

#### 3. Code Quality Checks

```bash
# Lint Solidity
npm run lint

# Lint JavaScript/TypeScript
npm run lint:js

# Check formatting
npm run format:check

# Auto-fix formatting
npm run format

# Security audit
npm run security
```

#### 4. Commit & Push

```bash
# Stage changes
git add .

# Commit (triggers pre-commit hook)
# - Solhint check
# - Prettier check
# - ESLint check
# - Test suite
# - npm audit
git commit -m "Add new feature"

# Push (triggers pre-push hook)
# - Contract compilation
# - Coverage generation
# - Sensitive data check
git push origin feature-branch
```

#### 5. Pull Request

When you create a PR:
1. ✅ GitHub Actions run automatically
2. ✅ Test workflow (Node.js 18.x, 20.x)
3. ✅ Coverage workflow (Codecov upload)
4. ✅ Security workflow (4 parallel jobs)
5. ✅ All checks must pass before merge

#### 6. Deployment

```bash
# Deploy to Sepolia testnet
npm run deploy:sepolia

# Verify on Etherscan
npm run verify:sepolia

# Interact with contract
npm run interact:sepolia

# Simulate full workflow
npm run simulate:sepolia
```

---

### Tool Interaction Flow

```
Developer writes code
        ↓
    git add .
        ↓
  git commit -m "..."
        ↓
┌─────────────────────────┐
│   PRE-COMMIT HOOK       │
│  1. Solhint (Solidity)  │ ← Quality check
│  2. Prettier (Format)   │ ← Style check
│  3. ESLint (JS/TS)      │ ← Security check
│  4. Tests (Mocha/Chai)  │ ← Functionality check
│  5. npm audit           │ ← Dependency check
└─────────────────────────┘
        ↓
   Commit successful
        ↓
    git push
        ↓
┌─────────────────────────┐
│   PRE-PUSH HOOK         │
│  1. Compile contracts   │ ← Build check
│  2. Test coverage       │ ← Coverage check (95%+)
│  3. Sensitive data scan │ ← Secret detection
└─────────────────────────┘
        ↓
   Push successful
        ↓
┌─────────────────────────┐
│   GITHUB ACTIONS        │
│  Workflow 1: Test       │ ← Matrix test (Node 18, 20)
│  Workflow 2: Coverage   │ ← Codecov upload
│  Workflow 3: Security   │ ← 4 parallel security jobs
└─────────────────────────┘
        ↓
   All checks pass ✅
        ↓
  Ready for deployment
```

---

## Tool Reference

### Command Reference

**Compilation & Deployment:**
```bash
npm run compile              # Compile smart contracts
npm run clean                # Clean artifacts
npm run node                 # Start local Hardhat node
npm run deploy:localhost     # Deploy to local node
npm run deploy:sepolia       # Deploy to Sepolia testnet
npm run verify:sepolia       # Verify contract on Etherscan
```

**Testing:**
```bash
npm test                     # Run all tests
npm run test:coverage        # Generate coverage report
npm run test:gas             # Generate gas report
```

**Code Quality:**
```bash
npm run lint                 # Lint Solidity files
npm run lint:fix             # Auto-fix Solidity issues
npm run lint:js              # Lint JavaScript/TypeScript
npm run lint:js:fix          # Auto-fix JS/TS issues
npm run format               # Format all code
npm run format:check         # Check formatting (CI)
```

**Security:**
```bash
npm run security             # Run all security checks
npm run security:fix         # Auto-fix security issues
npm audit                    # Check dependencies
npm audit fix                # Fix dependency issues
```

**Git Hooks:**
```bash
npm run prepare              # Install Husky hooks
npm run precommit            # Manually run pre-commit checks
npm run prepush              # Manually run pre-push checks
```

**Interaction:**
```bash
npm run interact:localhost   # Interact with local contract
npm run interact:sepolia     # Interact with Sepolia contract
npm run simulate:localhost   # Simulate workflow locally
npm run simulate:sepolia     # Simulate workflow on Sepolia
```

---

### Configuration Files

| File | Purpose | Documentation |
|------|---------|---------------|
| `hardhat.config.cjs` | Hardhat configuration | [Hardhat Config](https://hardhat.org/config/) |
| `.solhint.json` | Solidity linting rules | [Solhint Rules](https://github.com/protofire/solhint/blob/master/docs/rules.md) |
| `.solhintignore` | Solhint exclusions | - |
| `.eslintrc.json` | JavaScript/TypeScript linting | [ESLint Config](https://eslint.org/docs/user-guide/configuring/) |
| `.eslintignore` | ESLint exclusions | - |
| `.prettierrc.json` | Code formatting rules | [Prettier Options](https://prettier.io/docs/en/options.html) |
| `.prettierignore` | Prettier exclusions | - |
| `codecov.yml` | Coverage configuration | [Codecov Config](https://docs.codecov.com/docs/codecov-yaml) |
| `.env.example` | Environment template | See DEPLOYMENT.md |
| `.husky/pre-commit` | Pre-commit hook script | [Husky Docs](https://typicode.github.io/husky/) |
| `.husky/pre-push` | Pre-push hook script | [Husky Docs](https://typicode.github.io/husky/) |
| `.github/workflows/test.yml` | Test automation | [GitHub Actions](https://docs.github.com/en/actions) |
| `.github/workflows/coverage.yml` | Coverage automation | [GitHub Actions](https://docs.github.com/en/actions) |
| `.github/workflows/security.yml` | Security automation | [GitHub Actions](https://docs.github.com/en/actions) |

---

### Environment Variables

**Required Variables (.env):**

```bash
# Network Configuration
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY_HERE

# Etherscan Verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Security Configuration
ADMIN_ADDRESS=0xYOUR_ADMIN_ADDRESS
PAUSER_ADDRESS_1=0xPAUSER_ADDRESS_1
PAUSER_ADDRESS_2=0xPAUSER_ADDRESS_2

# Performance & Gas
OPTIMIZER_ENABLED=true
OPTIMIZER_RUNS=200
VIA_IR=true
REPORT_GAS=false

# Monitoring (Optional)
COINMARKETCAP_API_KEY=YOUR_CMC_API_KEY

# Rate Limiting & DoS Protection
MAX_TX_PER_BLOCK=10
RATE_LIMIT_PER_ADDRESS=100
MAX_EVIDENCE_PER_INVESTIGATION=100
MAX_PARTICIPANTS_PER_INVESTIGATION=50
```

See `.env.example` for complete configuration options.

---

## Best Practices

### Development Best Practices

1. **Always run tests before committing**
   ```bash
   npm test
   ```

2. **Check coverage regularly**
   ```bash
   npm run test:coverage
   # Target: 95%+
   ```

3. **Monitor gas usage**
   ```bash
   npm run test:gas
   # Review gas-report.txt
   ```

4. **Use pre-commit hooks**
   - Hooks run automatically on `git commit`
   - Fix issues before they reach CI

5. **Keep dependencies updated**
   ```bash
   npm audit
   npm audit fix
   npm outdated
   ```

### Security Best Practices

1. **Never commit secrets**
   - Use `.env` for sensitive data
   - `.env` is in `.gitignore`
   - Pre-push hook detects private keys

2. **Run security checks**
   ```bash
   npm run security
   ```

3. **Review audit reports**
   ```bash
   npm audit --audit-level=high
   ```

4. **Use safe dependencies**
   - OpenZeppelin contracts
   - Hardhat official plugins
   - Verified npm packages

### Performance Best Practices

1. **Optimize gas usage**
   - Review PERFORMANCE_OPTIMIZATION.md
   - Use gas reporter
   - Set gas budgets for functions

2. **Use compiler optimization**
   - `optimizer.enabled: true`
   - `optimizer.runs: 200`
   - `viaIR: true`

3. **Cache storage reads**
   - Use memory for repeated reads
   - Pack storage variables
   - Use events for historical data

---

## Troubleshooting

### Common Issues

#### Issue: Pre-commit hook fails

**Symptoms:**
```
❌ Solidity linting failed
```

**Solution:**
```bash
# Run linter manually
npm run lint

# Review errors
# Fix issues or use auto-fix
npm run lint:fix

# Try commit again
git commit -m "..."
```

#### Issue: Tests fail in CI but pass locally

**Symptoms:**
```
✅ Tests pass locally
❌ Tests fail in GitHub Actions
```

**Solution:**
```bash
# Use same Node.js version as CI (18.x or 20.x)
nvm use 18

# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Run tests
npm test
```

#### Issue: Coverage below threshold

**Symptoms:**
```
⚠️ Coverage: 85% (target: 95%)
```

**Solution:**
```bash
# Check coverage report
npm run test:coverage

# View detailed report
open coverage/index.html

# Add tests for uncovered lines
# Focus on high-impact functions
```

#### Issue: Gas usage too high

**Symptoms:**
```
⚠️ Function uses 200,000 gas (budget: 150,000)
```

**Solution:**
1. Review PERFORMANCE_OPTIMIZATION.md
2. Use gas reporter to identify hotspots
3. Apply optimization patterns:
   - Pack storage variables
   - Cache storage reads
   - Use events for data
   - Optimize loops

---

## Conclusion

This toolchain provides comprehensive coverage of smart contract development, from initial coding through testing, quality assurance, security auditing, and automated deployment. By integrating Hardhat, Solhint, ESLint, Prettier, Husky, and GitHub Actions, we ensure that every commit meets high standards of quality, security, and performance.

**Key Takeaways:**
1. ✅ **Automated Quality** - Pre-commit/pre-push hooks enforce standards
2. ✅ **Continuous Testing** - GitHub Actions test every change
3. ✅ **Security First** - Multiple layers of security checks
4. ✅ **Performance Monitoring** - Gas reporting on every test run
5. ✅ **Code Consistency** - Prettier + linting enforce style

**Remember:** The tools are only as good as how you use them. Follow the workflows, heed the warnings, and continuously improve your code quality.

---

**Last Updated:** 2025-10-26
**Version:** 1.0.0
**Maintainer:** Anonymous Court Investigation Team

---

## Additional Resources

### Official Documentation

- **Hardhat:** https://hardhat.org/docs
- **Ethers.js:** https://docs.ethers.org/v6/
- **OpenZeppelin:** https://docs.openzeppelin.com/contracts/
- **Solhint:** https://github.com/protofire/solhint
- **ESLint:** https://eslint.org/docs/latest/
- **Prettier:** https://prettier.io/docs/en/
- **Husky:** https://typicode.github.io/husky/
- **GitHub Actions:** https://docs.github.com/en/actions
- **Codecov:** https://docs.codecov.com/

### Tutorials & Guides

- **Hardhat Tutorial:** https://hardhat.org/tutorial
- **Smart Contract Best Practices:** https://consensys.github.io/smart-contract-best-practices/
- **Solidity Style Guide:** https://docs.soliditylang.org/en/latest/style-guide.html
- **Gas Optimization Guide:** See PERFORMANCE_OPTIMIZATION.md
- **Security Audit Guide:** See SECURITY_AUDIT.md

### Community & Support

- **Hardhat Discord:** https://hardhat.org/discord
- **Ethereum Stack Exchange:** https://ethereum.stackexchange.com/
- **OpenZeppelin Forum:** https://forum.openzeppelin.com/
- **GitHub Issues:** Report issues in your project repository
