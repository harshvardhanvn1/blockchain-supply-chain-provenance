import React, { useState } from 'react';
import { getContract } from '../utils/contract';
import web3 from '../utils/web3';

function TransferProduct({ account }) {
	const [id, setId] = useState('');
	const [newOwner, setNewOwner] = useState('');
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

	const handleTransfer = async (e) => {
		e.preventDefault();
		setLoading(true);
		const contract = getContract();
		
		try {
			const normalized = normalizeId(id);
			console.log("📌 Transferring custody:", normalized);

			// Estimate gas
			const gasEstimate = await contract.methods
				.transferCustody(normalized, newOwner)
				.estimateGas({ from: account });
			console.log("✅ Gas estimate:", gasEstimate);

			// Get gas price
			const gasPrice = await web3.eth.getGasPrice();

			// Send transaction
			await contract.methods
				.transferCustody(normalized, newOwner)
				.send({ 
					from: account,
					gas: Math.floor(gasEstimate * 1.2),
					gasPrice: gasPrice
				});

			alert('Custody transferred successfully!');
			setId('');
			setNewOwner('');
		} catch (error) {
			console.error(error);
			alert('Error transferring custody: ' + error.message);
		}
		setLoading(false);
	};

	return (
		<div className="card mb-4">
			<div className="card-body">
				<h5 className="card-title">Transfer Custody</h5>
				<form onSubmit={handleTransfer}>
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
						<label className="form-label">New Owner Address</label>
						<input
							type="text"
							className="form-control"
							value={newOwner}
							onChange={(e) => setNewOwner(e.target.value)}
							placeholder="0x..."
							required
						/>
					</div>
					<button type="submit" className="btn btn-warning" disabled={loading}>
						{loading ? 'Transferring...' : 'Transfer Custody'}
					</button>
				</form>
			</div>
		</div>
	);
}

export default TransferProduct;