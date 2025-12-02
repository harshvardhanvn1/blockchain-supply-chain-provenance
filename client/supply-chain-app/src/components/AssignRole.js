import React, { useState } from 'react';
import { getContract } from '../utils/contract';
import web3 from '../utils/web3';

function AssignRole({ account }) {
	const [user, setUser] = useState('');
	const [role, setRole] = useState('0');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		const contract = getContract();

		try {
			console.log("📌 Starting assignRole...");
			console.log("📌 Contract address:", contract.options.address);
			console.log("📌 From account:", account);
			console.log("📌 User to assign:", user);
			console.log("📌 Role:", parseInt(role));

			// Step 1: Estimate gas
			console.log("🔧 Step 1: Estimating gas...");
			let gasEstimate;
			try {
				gasEstimate = await contract.methods
					.assignRole(user, parseInt(role))
					.estimateGas({ from: account });
				console.log("✅ Gas estimate:", gasEstimate);
			} catch (gasError) {
				console.error("❌ Gas estimation failed:", gasError);
				alert("Gas estimation failed. This usually means the transaction would revert. Error: " + gasError.message);
				setLoading(false);
				return;
			}

			// Step 2: Get current gas price
			console.log("🔧 Step 2: Getting gas price...");
			const gasPrice = await web3.eth.getGasPrice();
			console.log("✅ Gas price:", gasPrice);

			// Step 3: Send transaction
			console.log("🔧 Step 3: Sending transaction...");
			const tx = await contract.methods
				.assignRole(user, parseInt(role))
				.send({ 
					from: account,
					gas: Math.floor(gasEstimate * 1.2), // Add 20% buffer
					gasPrice: gasPrice
				});
			
			console.log("✅ Transaction successful!");
			console.log("📜 Transaction receipt:", tx);
			alert('Role assigned successfully!');
			setUser('');
			setRole('0');
		} catch (err) {
			console.error('❌ Transaction failed:', err);
			console.error('Error details:', {
				message: err.message,
				code: err.code,
				data: err.data,
				stack: err.stack
			});
			alert('Error: ' + err.message);
		}
		setLoading(false);
	};

	return (
		<div className="card mb-4">
			<div className="card-body">
				<h5 className="card-title">Assign Role</h5>
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label className="form-label">User Address</label>
						<input
							type="text"
							className="form-control"
							value={user}
							onChange={(e) => setUser(e.target.value)}
							placeholder="0x..."
							required
						/>
					</div>
					<div className="mb-3">
						<label className="form-label">Role</label>
						<select 
							className="form-control"
							value={role}
							onChange={(e) => setRole(e.target.value)}
							required
						>
							<option value="0">0 - None</option>
							<option value="1">1 - Manufacturer</option>
							<option value="2">2 - Distributor</option>
							<option value="3">3 - Retailer</option>
							<option value="4">4 - Regulator</option>
						</select>
					</div>
					<button type="submit" className="btn btn-secondary" disabled={loading}>
						{loading ? 'Assigning...' : 'Assign Role'}
					</button>
				</form>
			</div>
		</div>
	);
}

export default AssignRole;