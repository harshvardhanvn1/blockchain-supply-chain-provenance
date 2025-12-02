# Supply Chain App Frontend

React-based user interface for the blockchain supply chain provenance system.

## Overview

This application provides a web interface for interacting with the AgriProvenance smart contract deployed on Polygon Amoy testnet. Users can register products, transfer ownership, update status, and view complete audit trails.

## Technology Stack

- React 19.2.0
- Web3.js 1.10.0
- Bootstrap 5.3.8
- MetaMask integration

## Quick Start
```bash
npm install
echo "REACT_APP_CONTRACT_ADDRESS=0x2c5e8F70139Ac595776434C99526F982B126a858" > .env
npm start
```

Access the application at http://localhost:3000

## Application Structure

### Components

**AssignRole.js**
- Function: Assign roles to Ethereum addresses
- Permission: Admin only
- Contract Method: assignRole(address, uint8)

**RegisterProduct.js**
- Function: Create new product entries
- Permission: Manufacturer only
- Contract Method: registerProduct(bytes32, string, uint8, uint8)

**TransferProduct.js**
- Function: Transfer product ownership
- Permission: Current product owner
- Contract Method: transferCustody(bytes32, address)

**UpdateStatus.js**
- Function: Update product status
- Permission: Current product owner
- Contract Method: updateStatus(bytes32, uint8)

**ProductList.js**
- Function: View product details
- Permission: All users
- Contract Method: getBatch(bytes32)

**StatusHistory.js**
- Function: View complete audit trail
- Permission: All users
- Contract Method: getStatusHistory(bytes32)

### Utilities

**web3.js**
- Initializes Web3 provider using MetaMask
- Handles wallet connection
- Manages network switching to Polygon Amoy

**contract.js**
- Creates smart contract instance
- Manages contract address configuration
- Provides contract getter functions

**permissions.js**
- Defines role-based permissions
- Controls component visibility
- Maps roles to allowed actions

## Configuration

### Environment Variables

Create `.env` file:
```
REACT_APP_CONTRACT_ADDRESS=0x2c5e8F70139Ac595776434C99526F982B126a858
```

### MetaMask Setup

1. Install MetaMask extension
2. Add Polygon Amoy network:
   - Network Name: Polygon Amoy Testnet
   - RPC URL: https://rpc-amoy.polygon.technology
   - Chain ID: 80002
   - Symbol: POL
3. Get test tokens from https://faucet.polygon.technology

## Available Scripts

### `npm start`
Runs the app in development mode at http://localhost:3000

### `npm run build`
Builds the app for production to the `build` folder

### `npm test`
Launches the test runner in interactive watch mode

## Implementation Details

### Web3 Integration
- Single Web3 instance shared across application
- Automatic detection of MetaMask provider
- Network validation on every interaction
- Automatic network switching when needed

### Transaction Handling
All write operations use explicit gas estimation:
1. Estimate gas for transaction
2. Add 20% buffer for safety
3. Fetch current gas price
4. Send transaction with calculated parameters

This approach handles RPC provider variations and prevents gas estimation failures.

### ID Normalization
Product IDs can be entered as:
- Plain text (converted to bytes32)
- Hex string (used directly)

Normalization function ensures consistent format.

### Error Handling
- Try-catch blocks on all blockchain calls
- User-friendly error messages
- Detailed console logging for debugging
- Transaction revert detection

## Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Configure:
   - Framework: Create React App
   - Root Directory: `client/supply-chain-app`
   - Build Command: `npm run build`
   - Output Directory: `build`
4. Add environment variable:
   - REACT_APP_CONTRACT_ADDRESS: 0x2c5e8F70139Ac595776434C99526F982B126a858
5. Deploy

## Troubleshooting

### MetaMask Not Connecting
- Ensure MetaMask is installed and unlocked
- Check you're on Polygon Amoy network
- Refresh the page
- Check browser console for errors

### Transaction Failures
- Verify sufficient POL balance for gas
- Confirm correct role for operation
- Ensure you own the product (for transfers/updates)
- Check network connectivity

### Contract Not Loading
- Verify contract address in .env
- Confirm Polygon Amoy network connection
- Check RPC endpoint is responding
- Review browser console logs

### Build Issues
```bash
rm -rf node_modules package-lock.json
npm install
npm start
```

## Security Notes

- Private keys never stored in application
- Environment variables are public in frontend builds
- All permissions enforced by smart contract
- MetaMask handles transaction signing
- Always verify transaction details before confirming

## Browser Support

Tested on:
- Chrome (recommended)
- Firefox
- Brave
- Edge

MetaMask extension required for all browsers.

## Role Permissions Matrix

| Action | Admin | Manufacturer | Distributor | Retailer | Regulator |
|--------|-------|--------------|-------------|----------|-----------|
| Assign Roles | Yes | No | No | No | No |
| Register Product | No | Yes | No | No | No |
| Transfer (if owner) | No | Yes | Yes | Yes | No |
| Update Status (if owner) | No | Yes | Yes | Yes | No |
| View Products | Yes | Yes | Yes | Yes | Yes |
| View History | Yes | Yes | Yes | Yes | Yes |

Note: Admin is determined by wallet address, not role assignment.

## Performance

- Lazy loading of product data
- Efficient state management with React hooks
- Minimal blockchain queries
- Optimized re-renders

## Additional Resources

- Main project documentation: See root README.md
- Smart contract: See contracts/Agriprovenance.sol
- Live contract: https://amoy.polygonscan.com/address/0x2c5e8F70139Ac595776434C99526F982B126a858

---

**Live Application:** https://blockchain-supply-chain-provenance.vercel.app

This is a Create React App. Learn more at https://create-react-app.dev