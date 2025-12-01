import React, { useState, useEffect } from 'react';
import { connectWallet, ensureAmoyNetwork } from './utils/web3';
import contract, { setContractAddress } from './utils/contract';
import { hasPermission } from './utils/permissions';
import web3 from './utils/web3';
import RegisterProduct from './components/RegisterProduct';
import TransferProduct from './components/TransferProduct';
import ProductList from './components/ProductList';
import AssignRole from './components/AssignRole';
import UpdateStatus from './components/UpdateStatus';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
	const [account, setAccount] = useState('');
	const [role, setRole] = useState('None');

	const handleConnect = async () => {
		const acc = await connectWallet();
		setAccount(acc);

		// Prompt user to switch/add Polygon Amoy Testnet if needed
		try {
			const ok = await ensureAmoyNetwork();
			if (!ok) console.warn('Could not ensure Amoy network in wallet');
		} catch (err) {
			console.error('Network ensure failed', err);
		}
	};

	// fetch role for connected account and set local role state
	const fetchAndSetRole = async (acct) => {
		if (!acct || !contract || !contract.methods) return setRole('None');
		try {
			const r = await contract.methods.getUserRole(acct).call();
			console.log('user role from contract:', r);
			setRole(r || 'None');
		} catch (err) {
			console.error('Failed to get user role from contract', err);
			setRole('None');
		}
	};

	useEffect(() => {
		// set contract address from env if present, otherwise prompt once
		const envAddr = process.env.REACT_APP_CONTRACT_ADDRESS;
		if (envAddr) {
			setContractAddress(envAddr);
			console.log('Contract address set from env:', envAddr);
		} else {
			// prompt for address once (useful for dev without .env)
			const addr = window.localStorage.getItem('contractAddress') || '';
			if (addr) setContractAddress(addr);
		}
	}, []);

	const [contractAddr, setContractAddr] = React.useState('');
	const [networkId, setNetworkId] = React.useState(null);
	const [contractInput, setContractInput] = React.useState('');

	useEffect(() => {
		// update contract/network display
		setContractAddr(contract.options.address || 'not set');
		if (web3 && web3.eth && web3.eth.net) {
			web3.eth.net.getId().then((id) => setNetworkId(id)).catch(() => setNetworkId(null));
		}
		// keep the editable input in sync
		const stored = window.localStorage.getItem('contractAddress') || contract.options.address || '';
		setContractInput(stored);

		// if account already connected, fetch role
		if (account) fetchAndSetRole(account);
	}, [account]);

	const handleSaveContract = () => {
		if (!contractInput) return alert('Please enter a contract address');
		setContractAddress(contractInput);
		window.localStorage.setItem('contractAddress', contractInput);
		setContractAddr(contractInput);

		// quick validation: check that code exists at address then call a read-only method
		(async () => {
			// Try to ensure the wallet is on Amoy before validating contract code
			try {
				await ensureAmoyNetwork();
			} catch (e) {
				console.warn('ensureAmoyNetwork failed before validation', e);
			}
			try {
				const code = await web3.eth.getCode(contractInput);
				console.log('getCode:', code);
				if (!code || code === '0x' || code === '0x0') {
					alert('Contract address saved but no contract code found at this address on the connected network.');
					return;
				}
				const total = await contract.methods.totalBatches().call();
				console.log('totalBatches:', total);
				// fetch role after setting the contract address
				if (account) await fetchAndSetRole(account);
				alert('Contract address saved — validation succeeded');
			} catch (err) {
				console.error('Contract validation failed:', err);
				alert('Contract address saved but validation failed: ' + (err.message || err));
			}
		})();
	};

	const handleClearContract = () => {
		window.localStorage.removeItem('contractAddress');
		setContractAddress('');
		setContractAddr('not set');
		setContractInput('');
		alert('Contract address cleared');
	};

	return (
		<div className="App">
			<nav className="navbar navbar-dark bg-dark">
				<div className="container">
					<span className="navbar-brand">Supply Chain Tracker</span>
					{role && <span className="badge bg-info text-dark ms-3">Role: {role}</span>}
					{account ? (
						<span className="text-white">
							{account.substring(0, 6)}...{account.substring(38)}
						</span>
					) : (
						<button className="btn btn-primary" onClick={handleConnect}>
							Connect Wallet
						</button>
					)}
				</div>
			</nav>

			<div className="container mt-3">
				<div className="d-flex gap-3">
					<div className="badge bg-secondary">Contract: {contractAddr}</div>
					<div className="badge bg-secondary">Network ID: {networkId ?? 'unknown'}</div>
				</div>

				<div className="mt-3">
					<label className="form-label">Set Contract Address</label>
					<div className="d-flex gap-2">
						<input
							type="text"
							className="form-control"
							value={contractInput}
							onChange={(e) => setContractInput(e.target.value)}
							placeholder="0x..."
						/>
						<button className="btn btn-sm btn-primary" onClick={handleSaveContract}>
							Save
						</button>
						<button className="btn btn-sm btn-outline-secondary" onClick={handleClearContract}>
							Clear
						</button>
					</div>
				</div>
			</div>

			<div className="container mt-5">
				{account ? (
					<>
						{hasPermission(role, 'assignRole') && <AssignRole account={account} />}
						{hasPermission(role, 'registerProduct') && <RegisterProduct account={account} />}
						{hasPermission(role, 'transferProduct') && <TransferProduct account={account} />}
						{hasPermission(role, 'updateStatus') && <UpdateStatus account={account} />}
						{hasPermission(role, 'productList') && <ProductList />}
					</>
				) : (
					<div className="alert alert-info">Please connect your MetaMask wallet to continue</div>
				)}
			</div>
		</div>
	);
}

export default App;
