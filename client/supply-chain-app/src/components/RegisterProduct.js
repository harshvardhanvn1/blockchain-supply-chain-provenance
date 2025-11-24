import React, { useState } from 'react';
import contract from '../utils/contract';
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
			// convert string to bytes32 hex
			return web3.utils.asciiToHex(raw).padEnd(66, '0');
		} catch (e) {
			return raw;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			const normalized = normalizeId(id);
			await contract.methods.registerProduct(normalized, metaCid, parseInt(pType), parseInt(qType)).send({ from: account });
			alert('Product registered successfully!');
			setId('');
			setMetaCid('');
			setPType('0');
			setQType('0');
		} catch (error) {
			console.error(error);
			alert('Error registering product');
		}
		setLoading(false);
	};

	return (
		<div className="card mb-4">
			<div className="card-body">
				<h5 className="card-title">Register Product (contract: registerProduct)</h5>
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label className="form-label">ID (bytes32 or text)</label>
						<input
							type="text"
							className="form-control"
							value={id}
							onChange={(e) => setId(e.target.value)}
							placeholder="0x... or plain text"
							required
						/>
					</div>
					<div className="mb-3">
						<label className="form-label">metaCid (string)</label>
						<input
							type="text"
							className="form-control"
							value={metaCid}
							onChange={(e) => setMetaCid(e.target.value)}
							required
						/>
					</div>
					<div className="mb-3">
						<label className="form-label">pType (uint8)</label>
						<input
							type="number"
							min="0"
							className="form-control"
							value={pType}
							onChange={(e) => setPType(e.target.value)}
							required
						/>
					</div>
					<div className="mb-3">
						<label className="form-label">qType (uint8)</label>
						<input
							type="number"
							min="0"
							className="form-control"
							value={qType}
							onChange={(e) => setQType(e.target.value)}
							required
						/>
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
