import React, { useState } from 'react';
import { getContract } from '../utils/contract';
import web3 from '../utils/web3';

function UpdateStatus({ account }) {
	const [id, setId] = useState('');
	const [newStatus, setNewStatus] = useState('0');
	const [loading, setLoading] = useState(false);

	const normalizeId = (raw) => {
		if (!raw) return raw;
		if (raw.startsWith('0x')) return raw;
		try {
			return web3.utils.asciiToHex(raw).padEnd(66, '0');
		} catch (e) {
			return raw;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		const contract = getContract();
		
		try {
			const normalized = normalizeId(id);
			console.log("📌 Updating status:", normalized);

			// Estimate gas
			const gasEstimate = await contract.methods
				.updateStatus(normalized, parseInt(newStatus))
				.estimateGas({ from: account });
			console.log("✅ Gas estimate:", gasEstimate);

			// Get gas price
			const gasPrice = await web3.eth.getGasPrice();

			// Send transaction
			await contract.methods
				.updateStatus(normalized, parseInt(newStatus))
				.send({ 
					from: account,
					gas: Math.floor(gasEstimate * 1.2),
					gasPrice: gasPrice
				});

			alert('Status updated successfully');
			setId('');
			setNewStatus('0');
		} catch (err) {
			console.error(err);
			alert('Error updating status: ' + err.message);
		}
		setLoading(false);
	};

	return (
		<div className="card mb-4">
			<div className="card-body">
				<h5 className="card-title">Update Status</h5>
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label className="form-label">Product ID (bytes32 or text)</label>
						<input
							type="text"
							className="form-control"
							value={id}
							onChange={(e) => setId(e.target.value)}
							placeholder="batch001 or 0x..."
							required
						/>
					</div>
					<div className="mb-3">
						<label className="form-label">New Status</label>
						<select 
							className="form-control"
							value={newStatus}
							onChange={(e) => setNewStatus(e.target.value)}
							required
						>
							<option value="0">0 - Created</option>
							<option value="1">1 - InTransit</option>
							<option value="2">2 - Delivered</option>
						</select>
					</div>
					<button type="submit" className="btn btn-success" disabled={loading}>
						{loading ? 'Updating...' : 'Update Status'}
					</button>
				</form>
			</div>
		</div>
	);
}

export default UpdateStatus;