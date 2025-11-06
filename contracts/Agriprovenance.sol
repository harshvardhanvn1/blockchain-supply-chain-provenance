// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgriProvenance - Enhanced Supply Chain Tracking
 * @notice Tracks agricultural products from creation to delivery with role-based access
 */
contract AgriProvenance {
    
    // ENUMS
    enum Status { Created, InTransit, Delivered }
    enum ProductType { Imported, Local }
    enum QualityType { Organic, NonOrganic }
    enum Role { None, Manufacturer, Distributor, Retailer, Regulator }
    
    // STRUCTS 
    struct Batch {
        bytes32 id;
        address owner;
        Status status;
        ProductType productType;
        QualityType qualityType;
        string metaCid;
        uint256 createdAt;
        uint256 lastUpdated;
        bool exists;
    }
    
    struct StatusHistory {
        Status status;
        address actor;
        uint256 timestamp;
    }
    
    // STATE VARIABLES
    mapping(bytes32 => Batch) public batches;
    mapping(address => Role) public roles;
    mapping(bytes32 => StatusHistory[]) public batchHistory;
    
    address public admin;
    uint256 public totalBatches;
    
    // EVENTS
    event ProductCreated(
        bytes32 indexed batchId,
        address indexed creator,
        string metaCid,
        string productType,
        string qualityType,
        uint256 timestamp
    );
    
    event OwnershipTransferred(
        bytes32 indexed batchId, 
        address indexed from, 
        address indexed to,
        uint256 timestamp
    );
    
    event StatusUpdated(
        bytes32 indexed batchId, 
        string fromStatus, 
        string toStatus, 
        address indexed actor,
        uint256 timestamp
    );
    
    event RoleAssigned(address indexed user, string role);
    
    // MODIFIERS
    modifier onlyAdmin() {
        require(msg.sender == admin, "Not admin");
        _;
    }
    
    modifier onlyRole(Role requiredRole) {
        require(roles[msg.sender] == requiredRole, "Insufficient role");
        _;
    }
    
    modifier batchExists(bytes32 id) {
        require(batches[id].exists, "Unknown batch");
        _;
    }
    
    modifier onlyBatchOwner(bytes32 id) {
        require(batches[id].owner == msg.sender, "Not owner");
        _;
    }
    
    // CONSTRUCTOR
    constructor() {
        admin = msg.sender;
        roles[msg.sender] = Role.Regulator;
    }
    
    // HELPER FUNCTIONS
    function _statusToString(Status s) internal pure returns (string memory) {
        if (s == Status.Created) return "Created";
        if (s == Status.InTransit) return "InTransit";
        if (s == Status.Delivered) return "Delivered";
        return "Unknown";
    }
    
    function _productTypeToString(ProductType p) internal pure returns (string memory) {
        return p == ProductType.Imported ? "Imported" : "Local";
    }
    
    function _qualityTypeToString(QualityType q) internal pure returns (string memory) {
        return q == QualityType.Organic ? "Organic" : "NonOrganic";
    }
    
    function _roleToString(Role r) internal pure returns (string memory) {
        if (r == Role.Manufacturer) return "Manufacturer";
        if (r == Role.Distributor) return "Distributor";
        if (r == Role.Retailer) return "Retailer";
        if (r == Role.Regulator) return "Regulator";
        return "None";
    }
    
    // ROLE MANAGEMENT
    function assignRole(address user, Role role) external onlyAdmin {
        roles[user] = role;
        emit RoleAssigned(user, _roleToString(role));
    }
    
    // CORE FUNCTIONS
    
    /**
     * @notice Register a new product batch (Manufacturer only)
     * @param id Unique batch identifier
     * @param metaCid IPFS CID containing batch metadata
     * @param pType Product origin type
     * @param qType Quality classification
     */
    function registerProduct(
        bytes32 id,
        string calldata metaCid,
        ProductType pType,
        QualityType qType
    ) external onlyRole(Role.Manufacturer) {
        require(!batches[id].exists, "Already registered");
        require(bytes(metaCid).length > 0, "Invalid metadata CID");
        
        batches[id] = Batch({
            id: id,
            owner: msg.sender,
            status: Status.Created,
            productType: pType,
            qualityType: qType,
            metaCid: metaCid,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp,
            exists: true
        });
        
        // Record initial status
        batchHistory[id].push(StatusHistory({
            status: Status.Created,
            actor: msg.sender,
            timestamp: block.timestamp
        }));
        
        totalBatches++;
        
        emit ProductCreated(
            id,
            msg.sender,
            metaCid,
            _productTypeToString(pType),
            _qualityTypeToString(qType),
            block.timestamp
        );
        
        emit StatusUpdated(
            id, 
            "None", 
            "Created", 
            msg.sender,
            block.timestamp
        );
    }
    
    /**
     * @notice Transfer custody of a batch to another party
     * @param id Batch identifier
     * @param newOwner Address of the new owner
     */
    function transferCustody(bytes32 id, address newOwner) 
        external 
        batchExists(id) 
        onlyBatchOwner(id) 
    {
        require(newOwner != address(0), "Invalid address");
        require(roles[newOwner] != Role.None, "Recipient has no role");
        require(newOwner != msg.sender, "Cannot transfer to self");
        
        address oldOwner = batches[id].owner;
        batches[id].owner = newOwner;
        batches[id].lastUpdated = block.timestamp;
        
        emit OwnershipTransferred(id, oldOwner, newOwner, block.timestamp);
    }
    
    /**
     * @notice Update batch status (with enforced progression)
     * @param id Batch identifier
     * @param newStatus New status to set
     */
    function updateStatus(bytes32 id, Status newStatus) 
        external 
        batchExists(id) 
        onlyBatchOwner(id) 
    {
        Status currentStatus = batches[id].status;
        require(currentStatus != newStatus, "Status unchanged");
        
        // Enforce valid status transitions
        if (currentStatus == Status.Created) {
            require(newStatus == Status.InTransit, "Must go InTransit first");
        } else if (currentStatus == Status.InTransit) {
            require(newStatus == Status.Delivered, "Can only deliver from transit");
        } else if (currentStatus == Status.Delivered) {
            revert("Cannot change delivered status");
        }
        
        string memory prevStatus = _statusToString(currentStatus);
        batches[id].status = newStatus;
        batches[id].lastUpdated = block.timestamp;
        
        // Record status change
        batchHistory[id].push(StatusHistory({
            status: newStatus,
            actor: msg.sender,
            timestamp: block.timestamp
        }));
        
        emit StatusUpdated(
            id, 
            prevStatus, 
            _statusToString(newStatus), 
            msg.sender,
            block.timestamp
        );
    }
    
    // VIEW FUNCTIONS 
    
    /**
     * @notice Get complete batch information
     * @param id Batch identifier
     */
    function getBatch(bytes32 id) external view batchExists(id) returns (
        bytes32 batchId,
        address owner,
        string memory status,
        string memory productType,
        string memory qualityType,
        string memory metaCid,
        uint256 createdAt,
        uint256 lastUpdated
    ) {
        Batch memory batch = batches[id];
        return (
            batch.id,
            batch.owner,
            _statusToString(batch.status),
            _productTypeToString(batch.productType),
            _qualityTypeToString(batch.qualityType),
            batch.metaCid,
            batch.createdAt,
            batch.lastUpdated
        );
    }
    
    /**
     * @notice Get status history for a batch
     * @param id Batch identifier
     */
    function getStatusHistory(bytes32 id) 
        external 
        view 
        batchExists(id) 
        returns (StatusHistory[] memory) 
    {
        return batchHistory[id];
    }
    
    /**
     * @notice Check if batch exists
     * @param id Batch identifier
     */
    function batchExistsCheck(bytes32 id) external view returns (bool) {
        return batches[id].exists;
    }
    
    /**
     * @notice Get user's role
     * @param user Address to check
     */
    function getUserRole(address user) external view returns (string memory) {
        return _roleToString(roles[user]);
    }
    
    /**
     * @notice Get current status as string
     * @param id Batch identifier
     */
    function getCurrentStatus(bytes32 id) 
        external 
        view 
        batchExists(id) 
        returns (string memory) 
    {
        return _statusToString(batches[id].status);
    }
}