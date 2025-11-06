# Blockchain Supply Chain Provenance System

A decentralized supply chain tracking system built on Polygon blockchain that ensures transparency, traceability, and trust among all participants in a product's lifecycle.

## Project Overview

This system tracks agricultural products from creation through delivery using blockchain technology, providing immutable records and role-based access control for manufacturers, distributors, retailers, and regulators.


---

## Live Deployment

### **Smart Contract**
- **Contract Address:** `0x2c5e8F70139Ac595776434C99526F982B126a858`
- **Network:** Polygon Amoy Testnet (Chain ID: 80002)
- **Status:** Deployed & Verified
- **Explorer:** [View on PolygonScan](https://amoy.polygonscan.com/address/0x2c5e8F70139Ac595776434C99526F982B126a858)
- **Verification:** [Sourcify](https://repo.sourcify.dev/80002/0x2c5e8F70139Ac595776434C99526F982B126a858/)

### **Deployment Stats**
- **Deployed:** November 4, 2025
- **Gas Used:** ~1.5M gas
- **Cost:** ~0.08 POL
- **Compiler:** Solidity 0.8.20

---

## System Architecture

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                        Users / Roles                         │
├──────────────┬──────────────┬──────────────┬────────────────┤
│ Manufacturer │ Distributor  │   Retailer   │   Regulator    │
└──────┬───────┴──────┬───────┴──────┬───────┴────────┬───────┘
       │              │              │                │
       └──────────────┴──────────────┴────────────────┘
                             │
                    ┌────────▼─────────┐
                    │   Frontend UI    │
                    │  (React + Web3)  │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │    Web3.js       │
                    │  (Blockchain     │
                    │   Interface)     │
                    └────────┬─────────┘
                             │
                ┌────────────▼────────────────┐
                │   Smart Contract Layer      │
                │   (AgriProvenance.sol)      │
                │                             │
                │  • Role Management          │
                │  • Product Registration     │
                │  • Custody Transfer         │
                │  • Status Updates           │
                │  • History Tracking         │
                └────────────┬────────────────┘
                             │
                ┌────────────▼────────────────┐
                │   Polygon Amoy Testnet      │
                │   (Blockchain Storage)      │
                └─────────────────────────────┘
                             │
                    ┌────────▼─────────┐
                    │  IPFS Storage    │
                    │  (Metadata)      │
                    └──────────────────┘
```

### **Smart Contract Architecture**

```
╔══════════════════════════════════════════════════════════════╗
║              AgriProvenance Smart Contract                    ║
╠══════════════════════════════════════════════════════════════╣
║                                                               ║
║  STATE VARIABLES                                             ║
║  ├─ batches: mapping(bytes32 => Batch)                       ║
║  ├─ roles: mapping(address => Role)                          ║
║  ├─ batchHistory: mapping(bytes32 => StatusHistory[])        ║
║  ├─ admin: address                                           ║
║  └─ totalBatches: uint256                                    ║
║                                                              ║
║  DATA STRUCTURES                                             ║
║  ├─ Batch (id, owner, status, type, quality, metadata...)    ║
║  ├─ StatusHistory (status, actor, timestamp)                 ║
║  ├─ Status enum (Created, InTransit, Delivered)              ║
║  ├─ ProductType enum (Imported, Local)                       ║
║  ├─ QualityType enum (Organic, NonOrganic)                   ║
║  └─ Role enum (None, Manufacturer, Distributor, Retailer,    ║
║                Regulator)                                    ║
║                                                              ║
║  CORE FUNCTIONS                                              ║
║  ├─ registerProduct() - Create new batch (Manufacturer)      ║
║  ├─ transferCustody() - Transfer ownership                   ║
║  ├─ updateStatus() - Update batch status                     ║
║  ├─ assignRole() - Assign user roles (Admin)                 ║
║  └─ getBatch() - Query batch details                         ║
║                                                              ║
║  ACCESS CONTROL                                              ║
║  ├─ onlyAdmin - Admin-only functions                         ║
║  ├─ onlyRole - Role-based restrictions                       ║
║  ├─ batchExists - Batch validation                           ║
║  └─ onlyBatchOwner - Owner verification                      ║
║                                                              ║
║  EVENTS                                                      ║
║  ├─ ProductCreated                                           ║
║  ├─ OwnershipTransferred                                     ║
║  ├─ StatusUpdated                                            ║
║  └─ RoleAssigned                                             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
```

### **Product Lifecycle Flow**

```
┌─────────────────────────────────────────────────────────────┐
│                    Product Journey                          │
└─────────────────────────────────────────────────────────────┘

1. CREATION
   ┌──────────────┐
   │ Manufacturer │  registerProduct()
   └──────┬───────┘  ├─ Assigns unique ID
          │          ├─ Records metadata (IPFS)
          │          ├─ Sets initial status: Created
          │          └─ Emits ProductCreated event
          ▼
   [Product: CREATED]

2. SHIPMENT
   ┌──────────────┐
   │ Manufacturer │  transferCustody() → Distributor
   └──────┬───────┘  updateStatus(InTransit)
          │          ├─ Changes ownership
          │          ├─ Updates status: InTransit
          │          └─ Records in history
          ▼
   [Product: IN_TRANSIT]

3. DISTRIBUTION
   ┌──────────────┐
   │ Distributor  │  transferCustody() → Retailer
   └──────┬───────┘  ├─ Transfers to retailer
          │          └─ Maintains InTransit status
          ▼
   [Product: IN_TRANSIT]

4. DELIVERY
   ┌──────────────┐
   │   Retailer   │  updateStatus(Delivered)
   └──────┬───────┘  ├─ Marks as delivered
          │          ├─ Final status: Delivered
          │          └─ Immutable record
          ▼
   [Product: DELIVERED]

5. VERIFICATION
   ┌──────────────┐
   │   Consumer   │  getBatch() / getStatusHistory()
   └──────┬───────┘  ├─ Views complete history
          │          ├─ Verifies authenticity
          │          └─ Checks all transfers
          ▼
   [Verified Provenance]
```

---

## ✨ Key Features

### **Role-Based Access Control (RBAC)**
- **Manufacturer:** Register products, initiate shipments
- **Distributor:** Receive and forward products
- **Retailer:** Final delivery and status updates
- **Regulator:** Oversee and audit all transactions
- **Admin:** Assign roles and manage system

### **Product Management**
- Unique batch identification using bytes32
- IPFS integration for metadata storage
- Product type classification (Imported/Local)
- Quality certification (Organic/Non-Organic)

### **Status Progression**
- Enforced workflow: Created → InTransit → Delivered
- Prevents invalid status transitions
- Immutable once delivered

### **Complete Audit Trail**
- Timestamp tracking for all actions
- Status history for each product
- Event logging for transparency
- Ownership transfer records

### **Security Features**
- Input validation on all functions
- Access control modifiers
- Duplicate prevention
- Self-transfer prevention
- Role verification before transfers

---

## Technology Stack

### **Blockchain**
- **Platform:** Polygon Amoy Testnet (Ethereum Layer-2)
- **Smart Contract Language:** Solidity 0.8.20
- **Development Environment:** Remix IDE
- **Wallet:** MetaMask

### **Frontend** (Week 2-3)
- **Framework:** React.js
- **Blockchain Library:** Web3.js / Ethers.js
- **UI Framework:** Bootstrap / Tailwind CSS
- **State Management:** React Hooks

### **Storage**
- **On-Chain:** Contract state and events
- **Off-Chain:** IPFS for product metadata
- **Metadata Format:** JSON with IPFS CID

---

## Repository Structure

```
blockchain-supply-chain-provenance/
│
├── contracts/
│   ├── AgriProvenance.sol          # Main smart contract
│   └── AgriProvenance_ABI.json     # Contract ABI
│
├── docs/
│   ├── architecture.md             # Detailed architecture
│   ├── deployment-info.md          # Deployment details
│   └── testing-guide.md            # Testing instructions
│
├── client/                         # Frontend application (Week 2)
│   ├── src/
│   │   ├── components/
│   │   ├── utils/
│   │   └── App.js
│   └── package.json
│
├── scripts/                        # Deployment scripts
│
├── .gitignore
├── README.md
└── LICENSE
```

---

## Getting Started

### **Prerequisites**
- MetaMask browser extension
- Node.js (v16+) and npm
- Git
- Basic understanding of blockchain and smart contracts

### **Setup Instructions**

#### 1. **Install MetaMask**
```bash
# Download from: https://metamask.io
# Create wallet and save recovery phrase
```

#### 2. **Add Polygon Amoy Network**
- Network Name: `Polygon Amoy Testnet`
- RPC URL: `https://rpc-amoy.polygon.technology`
- Chain ID: `80002`
- Currency Symbol: `POL`
- Block Explorer: `https://amoy.polygonscan.com`

#### 3. **Get Test Tokens**
```bash
# Visit: https://faucet.polygon.technology
# Select: Polygon Amoy + POL
# Enter your wallet address
# Verify with Twitter/GitHub
```

#### 4. **Clone Repository**
```bash
git clone https://github.com/[your-username]/blockchain-supply-chain-provenance.git
cd blockchain-supply-chain-provenance
```

#### 5. **Interact with Deployed Contract**
- Open Remix IDE: https://remix.ethereum.org
- Load contract: `contracts/AgriProvenance.sol`
- Compile with Solidity 0.8.20
- Deploy & Run → "At Address"
- Enter contract address: `0x2c5e8F70139Ac595776434C99526F982B126a858`
- Connect MetaMask and interact!

---

## Smart Contract Functions

### **Admin Functions**
```solidity
assignRole(address user, Role role)
// Assign roles to users (Manufacturer, Distributor, Retailer)
```

### **Manufacturer Functions**
```solidity
registerProduct(bytes32 id, string metaCid, ProductType pType, QualityType qType)
// Register new product batch on blockchain
```

### **All Authorized Users**
```solidity
transferCustody(bytes32 id, address newOwner)
// Transfer product ownership to another party

updateStatus(bytes32 id, Status newStatus)
// Update product status (Created → InTransit → Delivered)
```

### **View Functions (Free - No Gas)**
```solidity
getBatch(bytes32 id) returns (Batch details)
// Get complete product information

getStatusHistory(bytes32 id) returns (StatusHistory[])
// Get complete audit trail

getUserRole(address user) returns (string)
// Check user's assigned role

getCurrentStatus(bytes32 id) returns (string)
// Get current product status
```

---

## Testing Guide

### **Test Scenario 1: Role Assignment**
```javascript
// 1. Assign yourself as Manufacturer
assignRole("0xYourAddress", 1)  // 1 = Manufacturer

// 2. Verify role
getUserRole("0xYourAddress")  // Returns "Manufacturer"
```

### **Test Scenario 2: Register Product**
```javascript
// Register new agricultural product
registerProduct(
  "0x1111111111111111111111111111111111111111111111111111111111111111",
  "QmTestBatch001",  // IPFS CID
  1,                 // Local
  0                  // Organic
)

// Verify registration
totalBatches()  // Should return 1
```

### **Test Scenario 3: Complete Workflow**
```javascript
// 1. Manufacturer creates product
registerProduct(...)

// 2. Transfer to Distributor
transferCustody(batchId, distributorAddress)

// 3. Distributor updates status
updateStatus(batchId, 1)  // 1 = InTransit

// 4. Transfer to Retailer
transferCustody(batchId, retailerAddress)

// 5. Retailer marks delivered
updateStatus(batchId, 2)  // 2 = Delivered

// 6. View complete history
getStatusHistory(batchId)
```


## Team Members

| Name | Role | GitHub | Contribution |
|------|------|--------|-------------|
| Harshvardhan Vikrambhai Nagar | Smart Contract architect | [@harshvardhanvn1] | Contract development, deployment |
| Vedant Padole | Smart Contract architect| [@VedantPadole1405] | Contract development, deployment |
| Samik Nayak | Frontend Lead | [@scnyk] | React UI, Web3 integration |
| Prarthan | Project Manager | [@Prxthn] | Coordination, reporting |

---

## Important Links

- **Live Contract:** [PolygonScan](https://amoy.polygonscan.com/address/0x2c5e8F70139Ac595776434C99526F982B126a858)
- **Network Faucet:** [Get Test POL](https://faucet.polygon.technology)
- **IPFS Gateway:** [Pinata](https://pinata.cloud)
- **Remix IDE:** [remix.ethereum.org](https://remix.ethereum.org)

---

## Security Considerations

### **Implemented Security Measures**
- Role-based access control
- Input validation on all functions
- Duplicate transaction prevention
- Status progression enforcement
- Ownership verification before transfers
- Self-transfer prevention
- Role verification for recipients

### **Known Limitations**
- Testnet only (not production-ready)
- Centralized role assignment (admin-controlled)
- No multi-signature support
- Limited to single product per batch ID
- Gas costs on mainnet would be higher

### **Future Improvements**
- Implement multi-signature for admin functions
- Add batch splitting and merging
- Enable cross-chain compatibility
- Implement gasless transactions (meta-transactions)
- Add dispute resolution mechanism

---

## Cost Analysis

### **Deployment Costs (Polygon Amoy Testnet)**
| Operation | Gas Used | Cost (POL) | Cost (USD)* |
|-----------|----------|------------|-------------|
| Contract Deployment | ~1,500,000 | 0.08 | ~$0.08 |
| Register Product | ~140,000 | 0.0002 | ~$0.0002 |
| Transfer Custody | ~55,000 | 0.0001 | ~$0.0001 |
| Update Status | ~60,000 | 0.0001 | ~$0.0001 |
| Assign Role | ~45,000 | 0.00005 | ~$0.00005 |

*Estimated testnet costs. Mainnet costs would vary based on network congestion.

