import React, { useState } from 'react';
import contract from '../utils/contract';
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

	const fetchBatch = async (e) => {
		e && e.preventDefault();
		setLoading(true);
		try {
			const normalized = normalizeId(id);
			const contractAddr = contract.options.address;
			if (!contractAddr) throw new Error('Contract address is not set in the app');

			// low-level call to see raw return data (helps diagnose ABI/address/network issues)
			const data = contract.methods.getBatch(normalized).encodeABI();
			const raw = await web3.eth.call({ to: contractAddr, data });
			console.log('raw getBatch return:', raw);
			if (!raw || raw === '0x' || raw === '0x0') {
				throw new Error('Empty return from node — possible revert, no code at address, or wrong network');
			}

			// decode returned parameters using web3 ABI decoder (types from ABI)
			const types = [
				'bytes32',
				'address',
				'string',
				'string',
				'string',
				'string',
				'uint256',
				'uint256',
			];
			let decoded;
			try {
				decoded = web3.eth.abi.decodeParameters(types, raw);
			} catch (decErr) {
				console.error('Failed to decode parameters:', decErr);
				throw new Error('Parameter decoding failed — ABI mismatch or unexpected return format');
			}

			// map decoded values into result object similar to contract.getBatch return
			const result = {
				batchId: decoded[0],
				owner: decoded[1],
				status: decoded[2],
				productType: decoded[3],
				qualityType: decoded[4],
				metaCid: decoded[5],
				createdAt: decoded[6],
				lastUpdated: decoded[7],
			};

			setBatch(result);
			setError('');
		} catch (err) {
			console.error('getBatch error:', err);
			setError(err && err.message ? err.message : String(err));
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

				{error && (
					<div className="alert alert-danger">{error}</div>
				)}
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
