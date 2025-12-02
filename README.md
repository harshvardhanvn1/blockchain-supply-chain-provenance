# Blockchain-Based Supply Chain Provenance System

A decentralized supply chain tracking system built with Solidity and React for CSE 540 - Engineering Blockchain Applications at Arizona State University.

**Live Demo:** (https://blockchain-supply-chain-provenance.vercel.app/)

## Project Overview

This project implements a blockchain-based provenance system for agricultural supply chains. The system tracks products from creation through distribution to delivery, maintaining an immutable audit trail on the Polygon Amoy testnet.


---
## Live Deployment

### **Smart Contract**
- **Contract Address:** `0x2c5e8F70139Ac595776434C99526F982B126a858`
- **Network:** Polygon Amoy Testnet (Chain ID: 80002)
- **Status:** Deployed & Verified
- **Explorer:** [View on PolygonScan](https://amoy.polygonscan.com/address/0x2c5e8F70139Ac595776434C99526F982B126a858)
- **Verification:** [Sourcify](https://repo.sourcify.dev/80002/0x2c5e8F70139Ac595776434C99526F982B126a858/)

### Frontend Layer
- **Framework:** React 19.2.0
- **Blockchain Library:** Web3.js 1.10.0
- **Styling:** Bootstrap 5.3.8
- **Hosting:** Vercel

---

### System Flow
```
User Interface (React)
        ↓
MetaMask Wallet
        ↓
Web3.js Library
        ↓
Smart Contract (Solidity)
        ↓
Polygon Amoy Blockchain
```
---

## System Architecture

### **High-Level Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                        Users / Roles                        │
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
```

### **Smart Contract Architecture**

```
╔══════════════════════════════════════════════════════════════╗
║              AgriProvenance Smart Contract                   ║
╠══════════════════════════════════════════════════════════════╣
║                                                              ║
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
- Admin: Assign roles to participants
- Manufacturer: Register new products
- Distributor: Manage product transfers
- Retailer: Mark products as delivered
- Regulator: Audit system activity

### Core Functionality
- Product registration with unique identifiers
- Ownership transfer tracking between parties
- Status progression (Created → InTransit → Delivered)
- Complete audit trail of all transactions
- Event logging for transparency

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
## Installation and Setup

### Prerequisites
- Node.js (v16 or higher)
- MetaMask browser extension
- Git

### Smart Contract Deployment
The smart contract is already deployed on Polygon Amoy testnet at:
```
0x2c5e8F70139Ac595776434C99526F982B126a858
```

### Frontend Setup

1. Clone the repository:
```bash
git clone https://github.com/harshvardhanvn1/blockchain-supply-chain-provenance.git
cd blockchain-supply-chain-provenance
```

2. Navigate to the React application:
```bash
cd client/supply-chain-app
```

3. Install dependencies:
```bash
npm install
```

4. Create environment configuration:
```bash
echo "REACT_APP_CONTRACT_ADDRESS=0x2c5e8F70139Ac595776434C99526F982B126a858" > .env
```

5. Start the development server:
```bash
npm start
```

6. Access the application at http://localhost:3000

### MetaMask Configuration

Configure MetaMask with Polygon Amoy testnet:

**Network Settings:**
- Network Name: Polygon Amoy Testnet
- RPC URL: https://rpc-amoy.polygon.technology
- Chain ID: 80002
- Currency Symbol: POL
- Block Explorer URL: https://amoy.polygonscan.com

**Get Test Tokens:**
Visit https://faucet.polygon.technology to obtain test POL tokens.

## Usage

### System Workflow

1. **Role Assignment (Admin Only)**
   - Admin assigns appropriate roles to participant addresses
   - Each participant can have one role

2. **Product Registration (Manufacturer)**
   - Manufacturer creates new product entry
   - Provides unique ID and metadata
   - Selects product and quality types
   - Becomes initial product owner

3. **Status Management (Owner)**
   - Current owner can update product status
   - Status must progress sequentially
   - System enforces: Created → InTransit → Delivered

4. **Ownership Transfer (Owner)**
   - Current owner transfers custody to another participant
   - Recipient must have an assigned role
   - Transfer is recorded with timestamp

5. **Audit Trail (All Users)**
   - Anyone can query product details
   - Complete history of status changes available
   - Regulators can audit all system activity

## Smart Contract Interface

### Core Functions

**Administrative Functions:**
```solidity
function assignRole(address user, Role role) external onlyAdmin
```

**Product Management:**
```solidity
function registerProduct(
    bytes32 id,
    string calldata metaCid,
    ProductType pType,
    QualityType qType
) external onlyRole(Manufacturer)

function transferCustody(bytes32 id, address newOwner) external onlyBatchOwner(id)

function updateStatus(bytes32 id, Status newStatus) external onlyBatchOwner(id)
```

**View Functions:**
```solidity
function getBatch(bytes32 id) public view returns (...)
function getStatusHistory(bytes32 id) public view returns (StatusHistory[])
function getUserRole(address user) public view returns (string)
function totalBatches() public view returns (uint256)
```

### Events Emitted
```solidity
event ProductCreated(bytes32 indexed batchId, address indexed creator, ...)
event OwnershipTransferred(bytes32 indexed batchId, address indexed from, address indexed to, ...)
event StatusUpdated(bytes32 indexed batchId, string fromStatus, string toStatus, ...)
event RoleAssigned(address indexed user, string role)
```

### Enumerations

**Roles:**
- 0: None
- 1: Manufacturer
- 2: Distributor
- 3: Retailer
- 4: Regulator

**Status:**
- 0: Created
- 1: InTransit
- 2: Delivered

**Product Types:**
- 0: Imported
- 1: Local

**Quality Types:**
- 0: Organic
- 1: NonOrganic

## Testing

### Smart Contract Testing
All contract functions were tested using Remix IDE on Polygon Amoy testnet:
- Role assignment and access control validation
- Product registration with duplicate ID prevention
- Ownership transfer between different roles
- Status update with progression enforcement
- Event emission verification
- Complete end-to-end workflow testing

### Frontend Testing
The React application was tested with live transactions:
- MetaMask wallet connection
- Network switching to Polygon Amoy
- All CRUD operations on products
- Role-based UI component rendering
- Transaction confirmation and error handling
- Gas estimation and transaction execution

## Technical Implementation

### Gas Optimization
The frontend implements explicit gas estimation to handle varying RPC provider responses:
- Manual gas estimation before each transaction
- 20% buffer added to estimated gas
- Separate gas price fetching
- Fallback error handling for reverted transactions

### Security Measures
- All permissions enforced at smart contract level
- Frontend only controls UI visibility
- Owner verification for transfers and updates
- Sequential status progression validation
- Duplicate product ID prevention

### Architecture Decisions
- Single Web3 instance shared across application
- Contract ABI imported directly into frontend
- Role-based component rendering
- Dynamic admin detection from contract

## Project Structure
```
blockchain-supply-chain-provenance/
├── client/
│   └── supply-chain-app/
│       ├── public/
│       ├── src/
│       │   ├── components/
│       │   │   ├── AssignRole.js
│       │   │   ├── RegisterProduct.js
│       │   │   ├── TransferProduct.js
│       │   │   ├── UpdateStatus.js
│       │   │   ├── ProductList.js
│       │   │   └── StatusHistory.js
│       │   ├── utils/
│       │   │   ├── web3.js
│       │   │   ├── contract.js
│       │   │   └── permissions.js
│       │   ├── contracts/
│       │   │   └── Agriprovenance_ABI.json
│       │   ├── App.js
│       │   ├── App.css
│       │   └── index.js
│       ├── package.json
│       └── README.md
├── contracts/
│   └── Agriprovenance.sol
└── README.md
```

## Future Enhancements

Potential improvements identified for future development:

**IPFS Integration**
- Store product images and detailed metadata on IPFS
- Use metaCid field to reference IPFS content
- Enable decentralized document storage

**Additional Features**
- QR code generation for product lookups
- Multi-signature approval for transfers
- Batch product operations
- Mobile application development
- Real-time notifications
- Advanced analytics dashboard

## Known Limitations

- Metadata is currently stored as plain string (IPFS integration not implemented)
- Gas costs vary with network congestion
- Testnet only - not production ready
- Limited to Polygon Amoy network

## Team Information

**Course:** CSE 540 - Engineering Blockchain Applications  
**Institution:** Arizona State University  
**Semester:** Fall 2025

## Team Members

| Name | Role | GitHub | Contribution |
|------|------|--------|-------------|
| Harshvardhan Vikrambhai Nagar | Project Lead | [@harshvardhanvn1] | Contract development, deployment, React UI, Web3 Integration |
| Vedant Padole | Smart Contract architect| [@VedantPadole1405] | Contract development, deployment |
| Samik Nayak | Frontend Lead | [@scnyk] | React UI, Web3 integration |
| Prarthan | Project Manager | [@Prxthn] | Coordination, reporting |

## Resources and References

**Documentation:**
- Solidity: https://docs.soliditylang.org
- Web3.js: https://web3js.readthedocs.io
- React: https://react.dev
- Polygon: https://docs.polygon.technology

**Tools Used:**
- Remix IDE for contract development
- MetaMask for wallet management
- Vercel for frontend deployment
- GitHub for version control

## License

This project is developed for academic purposes as part of CSE 540 coursework at Arizona State University.

## Contact

For questions regarding this project, please open an issue in the GitHub repository.

---

**Important Note:** This system is deployed on Polygon Amoy testnet using test tokens. It is designed for educational purposes and demonstration only, not for production use.