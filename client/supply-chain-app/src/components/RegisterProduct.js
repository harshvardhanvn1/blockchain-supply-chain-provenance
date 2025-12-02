import React, { useState } from 'react';
import { getContract } from '../utils/contract';
import web3 from '../utils/web3';

function RegisterProduct({ account }) {
	const [id, setId] = useState('');
	const [metaCid, setMetaCid] = useState('');
	const [pType, setPType] = useState('0');
	const [qType, setQType] = useState('0');
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
			console.log("📌 Registering product:", normalized);

			// Estimate gas
			const gasEstimate = await contract.methods
				.registerProduct(normalized, metaCid, parseInt(pType), parseInt(qType))
				.estimateGas({ from: account });
			console.log("✅ Gas estimate:", gasEstimate);

			// Get gas price
			const gasPrice = await web3.eth.getGasPrice();

			// Send transaction
			await contract.methods
				.registerProduct(normalized, metaCid, parseInt(pType), parseInt(qType))
				.send({ 
					from: account,
					gas: Math.floor(gasEstimate * 1.2),
					gasPrice: gasPrice
				});

			alert('Product registered successfully!');
			setId('');
			setMetaCid('');
			setPType('0');
			setQType('0');
		} catch (error) {
			console.error(error);
			alert('Error registering product: ' + error.message);
		}
		setLoading(false);
	};

	return (
		<div className="card mb-4">
			<div className="card-body">
				<h5 className="card-title">Register Product</h5>
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
						<label className="form-label">Metadata CID (IPFS)</label>
						<input
							type="text"
							className="form-control"
							value={metaCid}
							onChange={(e) => setMetaCid(e.target.value)}
							placeholder="QmXxx... or any metadata string"
							required
						/>
					</div>
					<div className="mb-3">
						<label className="form-label">Product Type</label>
						<select 
							className="form-control"
							value={pType}
							onChange={(e) => setPType(e.target.value)}
							required
						>
							<option value="0">0 - Imported</option>
							<option value="1">1 - Local</option>
						</select>
					</div>
					<div className="mb-3">
						<label className="form-label">Quality Type</label>
						<select 
							className="form-control"
							value={qType}
							onChange={(e) => setQType(e.target.value)}
							required
						>
							<option value="0">0 - Organic</option>
							<option value="1">1 - Non-Organic</option>
						</select>
					</div>
					<button type="submit" className="btn btn-primary" disabled={loading}>
						{loading ? 'Registering...' : 'Register Product'}
					</button>
				</form>
			</div>
		</div>
	);
}

export default RegisterProduct;