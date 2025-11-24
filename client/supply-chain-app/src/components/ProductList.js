import React, { useState } from 'react';
import contract from '../utils/contract';
import web3 from '../utils/web3';

function ProductList() {
	const [id, setId] = useState('');
	const [batch, setBatch] = useState(null);
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

	const fetchBatch = async (e) => {
		e && e.preventDefault();
		setLoading(true);
		try {
			const normalized = normalizeId(id);
			const result = await contract.methods.getBatch(normalized).call();
			setBatch(result);
		} catch (err) {
			console.error(err);
			alert('Error fetching batch');
			setBatch(null);
		}
		setLoading(false);
	};

	return (
		<div className="card mb-4">
			<div className="card-body">
				<h5 className="card-title">Get Batch (contract: getBatch)</h5>
				<form onSubmit={fetchBatch} className="mb-3">
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
					<button className="btn btn-info" type="submit" disabled={loading}>
						{loading ? 'Fetching...' : 'Fetch Batch'}
					</button>
				</form>

				{batch && (
					<div>
						<dl className="row">
							<dt className="col-sm-3">Batch ID</dt>
							<dd className="col-sm-9">{batch.batchId}</dd>

							<dt className="col-sm-3">Owner</dt>
							<dd className="col-sm-9">{batch.owner}</dd>

							<dt className="col-sm-3">Status</dt>
							<dd className="col-sm-9">{batch.status}</dd>

							<dt className="col-sm-3">Product Type</dt>
							<dd className="col-sm-9">{batch.productType}</dd>

							<dt className="col-sm-3">Quality Type</dt>
							<dd className="col-sm-9">{batch.qualityType}</dd>

							<dt className="col-sm-3">metaCid</dt>
							<dd className="col-sm-9">{batch.metaCid}</dd>

							<dt className="col-sm-3">Created At (timestamp)</dt>
							<dd className="col-sm-9">{batch.createdAt}</dd>

							<dt className="col-sm-3">Last Updated</dt>
							<dd className="col-sm-9">{batch.lastUpdated}</dd>
						</dl>
					</div>
				)}
			</div>
		</div>
	);
}

export default ProductList;
