import React, { useState, useEffect } from 'react';
import { connectWallet } from './utils/web3';
import RegisterProduct from './components/RegisterProduct';
import TransferProduct from './components/TransferProduct';
import ProductList from './components/ProductList';
import AssignRole from './components/AssignRole';
import UpdateStatus from './components/UpdateStatus';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
	const [account, setAccount] = useState('');

	const handleConnect = async () => {
		const acc = await connectWallet();
		setAccount(acc);
	};

	return (
		<div className="App">
			<nav className="navbar navbar-dark bg-dark">
				<div className="container">
					<span className="navbar-brand">Supply Chain Tracker</span>
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

			<div className="container mt-5">
				{account ? (
					<>
						<AssignRole account={account} />
						<RegisterProduct account={account} />
						<TransferProduct account={account} />
						<UpdateStatus account={account} />
						<ProductList />
					</>
				) : (
					<div className="alert alert-info">Please connect your MetaMask wallet to continue</div>
				)}
			</div>
		</div>
	);
}

export default App;
