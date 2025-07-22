# Performance Optimization Guide

## Overview

This guide provides comprehensive strategies for optimizing gas usage, compilation performance, and overall system efficiency in the Anonymous Court Investigation System. Performance optimization is critical for reducing transaction costs and improving user experience.

## Table of Contents

- [Gas Optimization](#gas-optimization)
- [Compiler Optimization](#compiler-optimization)
- [Storage Optimization](#storage-optimization)
- [Code Patterns](#code-patterns)
- [Testing & Monitoring](#testing--monitoring)
- [Best Practices](#best-practices)

---

## Gas Optimization

### Understanding Gas Costs

Gas is the unit of computational work on Ethereum. Each operation has a specific gas cost:

| Operation | Gas Cost | Optimization Priority |
|-----------|----------|----------------------|
| Storage (SSTORE) | 20,000 (new) / 5,000 (update) | **CRITICAL** |
| Storage (SLOAD) | 2,100 | **HIGH** |
| Memory (MSTORE) | 3 + memory expansion | **MEDIUM** |
| External Call | 2,600 + callee cost | **HIGH** |
| Event Emission | 375 + 8 per byte | **LOW** |
| Computation | 3-8 per operation | **LOW** |

**Key Insight:** Storage operations are 1000x more expensive than computation. Always optimize storage first.

---

### Storage Optimization Strategies

#### 1. Pack Storage Variables

**Before Optimization:**
```solidity
// ❌ INEFFICIENT: Each variable uses a full 32-byte slot
struct Investigation {
    uint256 id;                    // Slot 0
    bool isOpen;                   // Slot 1 (wastes 31 bytes)
    bool hasVerdict;               // Slot 2 (wastes 31 bytes)
    uint8 participantCount;        // Slot 3 (wastes 31 bytes)
    address investigator;          // Slot 4 (wastes 12 bytes)
    string caseNumber;             // Slot 5+
    string verdict;                // Slot 6+
}
```

**After Optimization:**
```solidity
// ✅ OPTIMIZED: Pack variables to minimize storage slots
struct Investigation {
    uint256 id;                    // Slot 0
    string caseNumber;             // Slot 1+ (dynamic)
    string verdict;                // Slot 2+ (dynamic)
    address investigator;          // Slot 3 (20 bytes)
    uint8 participantCount;        // Slot 3 (1 byte) - PACKED!
    bool isOpen;                   // Slot 3 (1 byte) - PACKED!
    bool hasVerdict;               // Slot 3 (1 byte) - PACKED!
    // Slot 3 total: 20 + 1 + 1 + 1 = 23 bytes (saves 2 slots!)
}
```

**Gas Savings:** ~40,000 gas per investigation creation (2 slots × 20,000 gas)

#### 2. Use Mappings Over Arrays

**Before Optimization:**
```solidity
// ❌ INEFFICIENT: Array iteration is expensive
address[] public participants;

function isParticipant(address user) public view returns (bool) {
    for (uint i = 0; i < participants.length; i++) {
        if (participants[i] == user) return true;
    }
    return false;
}
// Gas cost: O(n) - increases with array size
```

**After Optimization:**
```solidity
// ✅ OPTIMIZED: Mapping lookup is constant time
mapping(address => bool) public isParticipant;
mapping(uint256 => address[]) private participantList; // For enumeration

function addParticipant(uint256 id, address user) external {
    require(!isParticipant[user], "Already participant");
    isParticipant[user] = true;
    participantList[id].push(user);
}
// Gas cost: O(1) - constant regardless of size
```

**Gas Savings:** ~2,000+ gas per lookup (scales with array size)

#### 3. Use Events for Historical Data

**Before Optimization:**
```solidity
// ❌ INEFFICIENT: Store all evidence on-chain
struct Evidence {
    uint256 timestamp;
    address submitter;
    string description;
    string ipfsHash;
}

mapping(uint256 => Evidence[]) public evidence;

function getEvidence(uint256 id, uint256 index)
    public view returns (Evidence memory)
{
    return evidence[id][index];
}
// Storage cost: ~20,000 gas per evidence + array growth
```

**After Optimization:**
```solidity
// ✅ OPTIMIZED: Use events for historical data, minimal on-chain storage
event EvidenceSubmitted(
    uint256 indexed investigationId,
    address indexed submitter,
    uint256 timestamp,
    string ipfsHash
);

mapping(uint256 => uint256) public evidenceCount;

function submitEvidence(uint256 id, string calldata ipfsHash) external {
    evidenceCount[id]++;
    emit EvidenceSubmitted(id, msg.sender, block.timestamp, ipfsHash);
}
// Storage cost: ~5,000 gas (only counter update)
// Event cost: ~2,000 gas
// Total savings: ~13,000 gas per evidence
```

**Gas Savings:** ~13,000 gas per evidence submission

#### 4. Minimize Storage Writes

**Before Optimization:**
```solidity
// ❌ INEFFICIENT: Multiple storage writes
function updateInvestigation(uint256 id, string memory verdict) external {
    investigations[id].hasVerdict = true;      // Write 1
    investigations[id].verdict = verdict;      // Write 2
    investigations[id].isOpen = false;         // Write 3
}
// Cost: 3 × 5,000 = 15,000 gas (assuming updates, not new values)
```

**After Optimization:**
```solidity
// ✅ OPTIMIZED: Single storage write with struct update
function updateInvestigation(uint256 id, string memory verdict) external {
    Investigation storage inv = investigations[id];  // Single SLOAD
    inv.hasVerdict = true;
    inv.verdict = verdict;
    inv.isOpen = false;
}
// Cost: 1 × 2,100 (SLOAD) + 3 × 5,000 (SSTORE) = ~17,100 gas
// But with memory packing, can be further optimized
```

**Better Optimization:**
```solidity
// ✅ BEST: Batch updates with memory struct
function updateInvestigation(uint256 id, string memory verdict) external {
    Investigation memory inv = investigations[id];
    inv.hasVerdict = true;
    inv.verdict = verdict;
    inv.isOpen = false;
    investigations[id] = inv;  // Single storage write
}
```

---

### Function Optimization Strategies

#### 1. Use `calldata` Instead of `memory`

**Before Optimization:**
```solidity
// ❌ INEFFICIENT: Copies to memory (costs gas)
function startInvestigation(string memory caseNumber) external {
    // Function logic
}
// Gas cost: ~3 per byte copied to memory
```

**After Optimization:**
```solidity
// ✅ OPTIMIZED: Read directly from calldata (no copy)
function startInvestigation(string calldata caseNumber) external {
    // Function logic
}
// Gas savings: ~3 per byte
```

**Gas Savings:** ~300 gas for 100-byte string

#### 2. Use Short-Circuit Evaluation

**Before Optimization:**
```solidity
// ❌ INEFFICIENT: All conditions always evaluated
function canSubmitEvidence(uint256 id, address user) public view returns (bool) {
    bool isActive = investigations[id].isOpen;
    bool isParticipant = isParticipantOf[id][user];
    bool isInvestigator = hasRole(INVESTIGATOR_ROLE, user);
    return isActive && (isParticipant || isInvestigator);
}
```

**After Optimization:**
```solidity
// ✅ OPTIMIZED: Short-circuit evaluation (fails fast)
function canSubmitEvidence(uint256 id, address user) public view returns (bool) {
    return investigations[id].isOpen &&  // Check cheapest first
           (isParticipantOf[id][user] || hasRole(INVESTIGATOR_ROLE, user));
}
// If !isOpen, skips other checks entirely
```

**Gas Savings:** ~4,000 gas when first condition fails

#### 3. Cache Storage Variables

**Before Optimization:**
```solidity
// ❌ INEFFICIENT: Multiple storage reads (SLOAD)
function processInvestigation(uint256 id) external {
    require(investigations[id].isOpen, "Not open");              // SLOAD 1
    require(investigations[id].participantCount > 0, "No participants");  // SLOAD 2

    if (investigations[id].hasVerdict) {                         // SLOAD 3
        // Process logic
    }
}
// Cost: 3 × 2,100 = 6,300 gas
```

**After Optimization:**
```solidity
// ✅ OPTIMIZED: Cache storage in memory
function processInvestigation(uint256 id) external {
    Investigation storage inv = investigations[id];  // Single SLOAD
    require(inv.isOpen, "Not open");
    require(inv.participantCount > 0, "No participants");

    if (inv.hasVerdict) {
        // Process logic
    }
}
// Cost: 1 × 2,100 = 2,100 gas
// Savings: 4,200 gas
```

**Gas Savings:** ~4,200 gas (2 SLOADs avoided)

#### 4. Optimize Loop Operations

**Before Optimization:**
```solidity
// ❌ INEFFICIENT: Reads length in every iteration
function getTotalParticipants(uint256[] memory ids) public view returns (uint256) {
    uint256 total = 0;
    for (uint256 i = 0; i < ids.length; i++) {  // reads .length every iteration
        total += investigations[ids[i]].participantCount;
    }
    return total;
}
```

**After Optimization:**
```solidity
// ✅ OPTIMIZED: Cache length, use unchecked for counter
function getTotalParticipants(uint256[] memory ids) public view returns (uint256) {
    uint256 total = 0;
    uint256 length = ids.length;  // Cache length
    for (uint256 i = 0; i < length;) {
        total += investigations[ids[i]].participantCount;
        unchecked { ++i; }  // Counter overflow impossible, save gas
    }
    return total;
}
```

**Gas Savings:** ~200 gas per iteration

---

## Compiler Optimization

### Optimizer Configuration

**Configuration:** `hardhat.config.cjs`

```javascript
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,  // Optimize for deployment cost vs. runtime cost
      },
      viaIR: true,  // Enable new optimizer pipeline
    },
  },
};
```

### Understanding Optimizer Runs

The `runs` parameter is a trade-off between deployment cost and runtime cost:

| Runs | Deployment Cost | Runtime Cost | Use Case |
|------|-----------------|--------------|----------|
| 1 | Lowest | Highest | Rarely called contracts |
| 200 | **Balanced** | **Balanced** | **Most contracts** |
| 1000 | Higher | Lower | Frequently called contracts |
| 10000+ | Highest | Lowest | Libraries, core contracts |

**Recommendation:** Use `200` for most contracts (balanced approach)

### Via IR Optimization

**What is Via IR?**
- IR = Intermediate Representation
- New compiler pipeline introduced in Solidity 0.8.13+
- Better optimization, especially for complex code

**Benefits:**
- 5-15% gas savings on complex contracts
- Better handling of storage packing
- Improved optimization for loops and conditionals

**Configuration:**
```javascript
settings: {
  optimizer: {
    enabled: true,
    runs: 200,
  },
  viaIR: true,  // Enable new optimizer
}
```

**Trade-off:** Longer compilation time (~2x slower)

---

## Storage Optimization

### Storage Layout Best Practices

#### 1. Order Variables by Size

**Before Optimization:**
```solidity
// ❌ INEFFICIENT: Random ordering wastes space
contract Example {
    bool flag1;        // Slot 0 (1 byte, wastes 31)
    uint256 value;     // Slot 1 (32 bytes)
    bool flag2;        // Slot 2 (1 byte, wastes 31)
    address owner;     // Slot 3 (20 bytes, wastes 12)
}
// Total: 4 slots = 4 × 20,000 = 80,000 gas
```

**After Optimization:**
```solidity
// ✅ OPTIMIZED: Group by size for packing
contract Example {
    uint256 value;     // Slot 0 (32 bytes)
    address owner;     // Slot 1 (20 bytes)
    bool flag1;        // Slot 1 (1 byte) - PACKED
    bool flag2;        // Slot 1 (1 byte) - PACKED
}
// Total: 2 slots = 2 × 20,000 = 40,000 gas
// Savings: 40,000 gas
```

#### 2. Use Smaller Integer Types When Possible

**Guidelines:**
- `uint8` - Values 0-255 (perfect for counters, percentages)
- `uint16` - Values 0-65,535
- `uint32` - Timestamps (until year 2106)
- `uint64` - Large numbers with known bounds
- `uint256` - Default, use when no clear bound

**Example:**
```solidity
// ✅ OPTIMIZED: Right-sized types
struct Investigation {
    uint256 id;                // Need full range
    uint32 timestamp;          // Enough until 2106
    uint8 participantCount;    // Max 255 participants
    address investigator;      // 20 bytes
    bool isOpen;               // 1 byte
    bool hasVerdict;           // 1 byte
}
// Efficient packing: id (slot 0), investigator+timestamp+count+flags (slot 1)
```

#### 3. Use Constants and Immutables

**Before Optimization:**
```solidity
// ❌ INEFFICIENT: Storage variable costs gas on every read
contract Example {
    uint256 public maxParticipants = 50;  // Storage: 2,100 gas per read
}
```

**After Optimization:**
```solidity
// ✅ OPTIMIZED: Constant is embedded in bytecode
contract Example {
    uint256 public constant MAX_PARTICIPANTS = 50;  // No storage, ~3 gas
}
```

**Gas Savings:** ~2,097 gas per read

**Immutable (for constructor-set values):**
```solidity
contract Example {
    address public immutable ADMIN;  // Set once in constructor, embedded in bytecode

    constructor(address admin) {
        ADMIN = admin;
    }
}
```

---

## Code Patterns

### Gas-Efficient Patterns

#### 1. Batch Operations

**Before Optimization:**
```solidity
// ❌ INEFFICIENT: Multiple transactions
function addParticipant(uint256 id, address participant) external {
    // Add single participant
}

// User must call 3 times for 3 participants
// 3 × 21,000 = 63,000 gas (base transaction cost alone)
```

**After Optimization:**
```solidity
// ✅ OPTIMIZED: Batch operation
function addParticipants(uint256 id, address[] calldata participants) external {
    uint256 length = participants.length;
    for (uint256 i = 0; i < length;) {
        // Add participant logic
        unchecked { ++i; }
    }
}

// Single transaction: 21,000 + operation costs
// Savings: 42,000 gas (2 × 21,000 transaction base cost)
```

#### 2. Early Returns

**Before Optimization:**
```solidity
// ❌ INEFFICIENT: All logic executes even when not needed
function processInvestigation(uint256 id) external {
    Investigation storage inv = investigations[id];

    // Complex logic here (1000+ gas)
    // ...

    if (!inv.isOpen) {
        revert("Investigation not open");
    }
}
```

**After Optimization:**
```solidity
// ✅ OPTIMIZED: Fail fast with early validation
function processInvestigation(uint256 id) external {
    Investigation storage inv = investigations[id];

    // Check critical conditions first
    if (!inv.isOpen) {
        revert("Investigation not open");
    }

    // Complex logic only runs if checks pass
    // ...
}
```

#### 3. Custom Errors (Solidity 0.8.4+)

**Before Optimization:**
```solidity
// ❌ INEFFICIENT: String errors cost ~200-400 gas
require(hasRole(JUDGE_ROLE, msg.sender), "Caller is not a judge");
```

**After Optimization:**
```solidity
// ✅ OPTIMIZED: Custom errors save gas
error NotJudge();

if (!hasRole(JUDGE_ROLE, msg.sender)) {
    revert NotJudge();
}
```

**Gas Savings:** ~200-400 gas per error

**With Parameters:**
```solidity
error InvestigationNotFound(uint256 investigationId);

if (investigations[id].id == 0) {
    revert InvestigationNotFound(id);
}
```

#### 4. Minimize Zero to Non-Zero Writes

**Storage Cost Differences:**
- Zero → Non-Zero: 20,000 gas
- Non-Zero → Non-Zero: 5,000 gas
- Non-Zero → Zero: 5,000 gas (with 15,000 refund)

**Pattern:**
```solidity
// When possible, initialize to 1 instead of 0 for flags
mapping(address => uint256) public lastActivity;

function recordActivity(address user) external {
    if (lastActivity[user] == 0) {
        lastActivity[user] = 1;  // 20,000 gas (first time)
    }
    lastActivity[user] = block.timestamp;  // 5,000 gas (subsequent)
}

// Alternative: Use timestamp directly (0 = never active)
function recordActivity(address user) external {
    lastActivity[user] = block.timestamp;
    // 20,000 gas first time, 5,000 gas after
}
```

---

## Testing & Monitoring

### Gas Reporting

**Configuration:** `hardhat.config.cjs`

```javascript
module.exports = {
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    gasPrice: 21,  // gwei
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
    outputFile: "gas-report.txt",
    noColors: true,
  },
};
```

**Usage:**
```bash
# Generate gas report
REPORT_GAS=true npm test

# Example output:
# ·-----------------------------------------|---------------------------|-------------|-----------------------------·
# |  Solc version: 0.8.24                   ·  Optimizer enabled: true  ·  Runs: 200  ·  Block limit: 30000000 gas  │
# ··········································|···························|·············|······························
# |  Methods                                                                                                         │
# ·············|····························|·············|·············|·············|···············|··············
# |  Contract  ·  Method                    ·  Min        ·  Max        ·  Avg        ·  # calls      ·  usd (avg)  │
# ·············|····························|·············|·············|·············|···············|··············
# |  Contract  ·  startInvestigation        ·     125000  ·     145000  ·     135000  ·           10  ·       1.50  │
# ·············|····························|·············|·············|·············|···············|··············
```

### Gas Optimization Testing

**Test Template:**
```javascript
describe("Gas Optimization Tests", function () {
  it("Should use minimal gas for investigation creation", async function () {
    const tx = await contract.startInvestigation("CASE-001");
    const receipt = await tx.wait();

    console.log(`Gas used: ${receipt.gasUsed}`);

    // Set gas budget
    expect(receipt.gasUsed).to.be.lt(150000);
  });

  it("Should pack storage efficiently", async function () {
    // Test storage layout
    const slot0 = await ethers.provider.getStorageAt(contract.address, 0);
    const slot1 = await ethers.provider.getStorageAt(contract.address, 1);

    // Verify packing
    console.log(`Slot 0: ${slot0}`);
    console.log(`Slot 1: ${slot1}`);
  });
});
```

### Performance Benchmarks

**Target Gas Costs:**

| Function | Gas Budget | Notes |
|----------|-----------|-------|
| `startInvestigation` | < 150,000 | One-time operation |
| `addParticipant` | < 80,000 | Per participant |
| `submitEvidence` | < 100,000 | Using events for data |
| `setVerdict` | < 90,000 | Judge operation |
| `closeInvestigation` | < 70,000 | Final state change |

**Monitoring:**
```bash
# Run gas tests
npm run test:gas

# Review gas report
cat gas-report.txt

# Check against budget
npm run test:gas | grep -A 20 "Methods"
```

---

## Best Practices

### Development Workflow

1. **Design Phase**
   - [ ] Plan storage layout for packing
   - [ ] Identify constants vs. state variables
   - [ ] Consider event-driven architecture for historical data

2. **Implementation Phase**
   - [ ] Use `calldata` for external function parameters
   - [ ] Pack struct variables by size
   - [ ] Use custom errors instead of strings
   - [ ] Cache storage variables in memory
   - [ ] Minimize storage writes

3. **Testing Phase**
   - [ ] Enable gas reporter
   - [ ] Set gas budgets for each function
   - [ ] Test with realistic data sizes
   - [ ] Compare gas costs with/without optimization

4. **Optimization Phase**
   - [ ] Review gas report
   - [ ] Identify high-cost functions
   - [ ] Apply optimization patterns
   - [ ] Re-test and verify savings

5. **Deployment Phase**
   - [ ] Verify optimizer settings
   - [ ] Check viaIR compilation
   - [ ] Test on testnet with real gas prices
   - [ ] Monitor gas costs post-deployment

### Optimization Checklist

#### High-Impact Optimizations (Do First)

- [ ] Pack storage variables by size
- [ ] Use events for historical data
- [ ] Use mappings instead of arrays for lookups
- [ ] Cache storage variables in memory
- [ ] Use `constant` and `immutable` where possible
- [ ] Use custom errors (Solidity 0.8.4+)

#### Medium-Impact Optimizations

- [ ] Use `calldata` instead of `memory` for external functions
- [ ] Short-circuit boolean expressions
- [ ] Cache array length in loops
- [ ] Use `unchecked` for safe arithmetic (loop counters)
- [ ] Batch operations when possible
- [ ] Early returns on validation failures

#### Low-Impact Optimizations

- [ ] Use `++i` instead of `i++` in loops
- [ ] Use `!= 0` instead of `> 0` for unsigned integers
- [ ] Use smaller integer types when appropriate
- [ ] Minimize function visibility (external < public)
- [ ] Remove unused code and imports

### Anti-Patterns to Avoid

**❌ Don't:**
- Store data on-chain that can be stored off-chain (use events + IPFS)
- Use arrays when mappings would work
- Perform the same storage read multiple times
- Use string error messages (use custom errors)
- Ignore storage packing opportunities
- Use `memory` for external function parameters
- Perform unbounded loops
- Store constants as state variables

**✅ Do:**
- Emit events for historical data
- Use mappings for O(1) lookups
- Cache storage reads in memory
- Use custom errors
- Pack storage variables by type size
- Use `calldata` for read-only parameters
- Limit loop iterations with constants
- Use `constant` and `immutable` for fixed values

---

## Performance Metrics

### Gas Cost Reference

**Storage Operations:**
```
SSTORE (zero → non-zero): 20,000 gas
SSTORE (non-zero → non-zero): 5,000 gas
SSTORE (non-zero → zero): 5,000 gas + 15,000 refund
SLOAD: 2,100 gas
```

**Memory Operations:**
```
MSTORE: 3 gas + memory expansion
MLOAD: 3 gas
```

**Computational Operations:**
```
ADD/SUB/MUL: 3 gas
DIV/MOD: 5 gas
EXP: 10 gas + 50 per byte
SHA3: 30 gas + 6 per word
```

**External Operations:**
```
CALL: 2,600 gas + gas sent to callee
DELEGATECALL: 2,600 gas + gas sent to callee
STATICCALL: 2,600 gas + gas sent to callee
CREATE: 32,000 gas
CREATE2: 32,000 gas
```

**Transaction Overhead:**
```
Base cost: 21,000 gas
Calldata (zero byte): 4 gas
Calldata (non-zero byte): 16 gas
```

---

## Conclusion

Performance optimization is an ongoing process that requires careful consideration of trade-offs between deployment cost, runtime cost, and code readability. Focus on high-impact optimizations first (storage layout, events, caching), then move to medium and low-impact optimizations as needed.

**Key Principles:**
1. **Storage is expensive** - minimize storage operations
2. **Events are cheap** - use for historical data
3. **Cache smartly** - store once, use many times
4. **Fail fast** - validate early, save gas
5. **Measure always** - use gas reporter to verify improvements

**Remember:** Premature optimization is the root of all evil. Optimize only after identifying actual bottlenecks through measurement.

---

**Last Updated:** 2025-10-26
**Version:** 1.0.0
**Maintainer:** Anonymous Court Investigation Team
