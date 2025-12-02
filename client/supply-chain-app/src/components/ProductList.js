import React, { useState } from 'react';
import { getContract } from '../utils/contract';
import web3 from '../utils/web3';

function ProductList() {
	const [id, setId] = useState('');
	const [batch, setBatch] = useState(null);
	const [error, setError] = useState('');
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

	const formatTimestamp = (timestamp) => {
		if (!timestamp || timestamp === '0') return 'N/A';
		const date = new Date(parseInt(timestamp) * 1000);
		return date.toLocaleString();
	};

	const fetchBatch = async (e) => {
		e && e.preventDefault();
		setLoading(true);
		setError('');
		setBatch(null);

		const contract = getContract();
		
		try {
			const normalized = normalizeId(id);
			console.log("📌 Fetching batch:", normalized);

			// Call getBatch directly - no need for manual encoding!
			const result = await contract.methods.getBatch(normalized).call();
			
			console.log("✅ Batch data received:", result);

			// Result is already decoded by Web3.js
			const batchData = {
				batchId: result.batchId || result[0],
				owner: result.owner || result[1],
				status: result.status || result[2],
				productType: result.productType || result[3],
				qualityType: result.qualityType || result[4],
				metaCid: result.metaCid || result[5],
				createdAt: result.createdAt || result[6],
				lastUpdated: result.lastUpdated || result[7],
			};

			setBatch(batchData);
		} catch (err) {
			console.error('❌ getBatch error:', err);
			
			// Better error messages
			if (err.message.includes('revert')) {
				setError('Product not found. Make sure the ID is correct and the product exists.');
			} else if (err.message.includes('network')) {
				setError('Network error. Check your connection and ensure you are on Polygon Amoy testnet.');
			} else {
				setError(err.message || 'Unknown error occurred');
			}
		}
		
		setLoading(false);
	};

	return (
		<div className="card mb-4">
			<div className="card-body">
				<h5 className="card-title">View Product Details</h5>
				<form onSubmit={fetchBatch} className="mb-3">
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
						<small className="form-text text-muted">
							Enter the product ID you used when registering
						</small>
					</div>
					<button className="btn btn-info" type="submit" disabled={loading}>
						{loading ? 'Fetching...' : 'Fetch Product'}
					</button>
				</form>

				{error && <div className="alert alert-danger">{error}</div>}
				
				{batch && (
					<div className="border-top pt-3">
						<h6 className="text-success mb-3">✅ Product Found</h6>
						<dl className="row">
							<dt className="col-sm-3">Batch ID</dt>
							<dd className="col-sm-9">
								<code>{batch.batchId}</code>
							</dd>

							<dt className="col-sm-3">Current Owner</dt>
							<dd className="col-sm-9">
								<code>{batch.owner}</code>
							</dd>

							<dt className="col-sm-3">Status</dt>
							<dd className="col-sm-9">
								<span className={`badge ${
									batch.status === 'Created' ? 'bg-primary' :
									batch.status === 'InTransit' ? 'bg-warning' :
									batch.status === 'Delivered' ? 'bg-success' : 'bg-secondary'
								}`}>
									{batch.status}
								</span>
							</dd>

							<dt className="col-sm-3">Product Type</dt>
							<dd className="col-sm-9">
								<span className="badge bg-info">{batch.productType}</span>
							</dd>

							<dt className="col-sm-3">Quality Type</dt>
							<dd className="col-sm-9">
								<span className="badge bg-info">{batch.qualityType}</span>
							</dd>

							<dt className="col-sm-3">Metadata CID</dt>
							<dd className="col-sm-9">
								<code>{batch.metaCid}</code>
							</dd>

							<dt className="col-sm-3">Created At</dt>
							<dd className="col-sm-9">
								{formatTimestamp(batch.createdAt)}
								<br />
								<small className="text-muted">Timestamp: {batch.createdAt}</small>
							</dd>

							<dt className="col-sm-3">Last Updated</dt>
							<dd className="col-sm-9">
								{formatTimestamp(batch.lastUpdated)}
								<br />
								<small className="text-muted">Timestamp: {batch.lastUpdated}</small>
							</dd>
						</dl>
					</div>
				)}
			</div>
		</div>
	);
}

export default ProductList;