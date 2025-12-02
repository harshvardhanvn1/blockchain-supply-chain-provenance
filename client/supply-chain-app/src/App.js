import React, { useState, useEffect } from 'react';
import { connectWallet, ensureAmoyNetwork } from './utils/web3';
import { getContract, setContractAddress } from './utils/contract';
import { hasPermission } from './utils/permissions';
import web3 from './utils/web3';
import RegisterProduct from './components/RegisterProduct';
import TransferProduct from './components/TransferProduct';
import ProductList from './components/ProductList';
import AssignRole from './components/AssignRole';
import UpdateStatus from './components/UpdateStatus';
import StatusHistory from './components/StatusHistory';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
	const [account, setAccount] = useState('');
	const [role, setRole] = useState('None');
	const [adminAddress, setAdminAddress] = useState('');

	const handleConnect = async () => {
		const acc = await connectWallet();
		setAccount(acc);

		try {
			const ok = await ensureAmoyNetwork();
			if (!ok) console.warn('Could not ensure Amoy network in wallet');
		} catch (err) {
			console.error('Network ensure failed', err);
		}
	};

	const fetchAndSetRole = async (acct) => {
		if (!acct) return setRole('None');
		const contract = getContract();
		if (!contract || !contract.methods) return setRole('None');
		try {
			const r = await contract.methods.getUserRole(acct).call();
			console.log('user role from contract:', r);
			setRole(r || 'None');
		} catch (err) {
			console.error('Failed to get user role from contract', err);
			setRole('None');
		}
	};

	const fetchAdmin = async () => {
		try {
			const contract = getContract();
			const admin = await contract.methods.admin().call();
			setAdminAddress(admin);
			console.log("Contract admin:", admin);
		} catch (err) {
			console.error("Failed to fetch admin:", err);
		}
	};

	useEffect(() => {
		const envAddr = process.env.REACT_APP_CONTRACT_ADDRESS;
		if (envAddr) {
			setContractAddress(envAddr);
			console.log('Contract address set from env:', envAddr);
		} else {
			const addr = window.localStorage.getItem('contractAddress') || '';
			if (addr) setContractAddress(addr);
		}
	}, []);

	const [contractAddr, setContractAddr] = useState('');
	const [networkId, setNetworkId] = useState(null);
	const [contractInput, setContractInput] = useState('');

	useEffect(() => {
		const contract = getContract();
		setContractAddr(contract.options.address || 'not set');
		if (web3 && web3.eth && web3.eth.net) {
			web3.eth.net.getId().then((id) => setNetworkId(id)).catch(() => setNetworkId(null));
		}
		const stored = window.localStorage.getItem('contractAddress') || contract.options.address || '';
		setContractInput(stored);

		if (account) {
			fetchAndSetRole(account);
			fetchAdmin();
		}
	}, [account]);

	const handleSaveContract = () => {
		if (!contractInput) return alert('Please enter a contract address');
		setContractAddress(contractInput);
		window.localStorage.setItem('contractAddress', contractInput);
		setContractAddr(contractInput);

		(async () => {
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
				const contract = getContract();
				const total = await contract.methods.totalBatches().call();
				console.log('totalBatches:', total);
				if (account) {
					await fetchAndSetRole(account);
					await fetchAdmin();
				}
				alert('Contract address saved – validation succeeded');
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

	// Check if current user is admin
	const isAdmin = adminAddress && account && account.toLowerCase() === adminAddress.toLowerCase();

	return (
		<div className="App">
			<nav className="navbar navbar-dark bg-dark">
				<div className="container">
					<span className="navbar-brand">🌾 AgriProvenance Supply Chain</span>
					<div className="d-flex align-items-center gap-3">
						{role && role !== 'None' && (
							<span className="badge bg-info text-dark">Role: {role}</span>
						)}
						{isAdmin && (
							<span className="badge bg-danger">Admin</span>
						)}
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
						{/* Admin-only functions */}
						{isAdmin && (
							<div className="alert alert-warning">
								<strong>⚠️ Admin Panel:</strong> You can assign roles to users
							</div>
						)}
						{isAdmin && <AssignRole account={account} />}

						{/* Role-based functions */}
						{hasPermission(role, 'registerProduct') && <RegisterProduct account={account} />}
						{hasPermission(role, 'transferProduct') && <TransferProduct account={account} />}
						{hasPermission(role, 'updateStatus') && <UpdateStatus account={account} />}
						{hasPermission(role, 'statusHistory') && <StatusHistory />}
						{hasPermission(role, 'productList') && <ProductList />}

						{role === 'None' && (
							<div className="alert alert-info">
								<h5>👋 Welcome!</h5>
								<p>You don't have an assigned role yet. Contact the administrator to get access.</p>
								<p className="mb-0"><small>You can still view product details below.</small></p>
							</div>
						)}
					</>
				) : (
					<div className="alert alert-info">Please connect your MetaMask wallet to continue</div>
				)}
			</div>
		</div>
	);
}

export default App;