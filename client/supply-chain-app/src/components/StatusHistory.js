import React, { useState } from 'react';
import { getContract } from '../utils/contract';
import web3 from '../utils/web3';

function StatusHistory() {
	const [id, setId] = useState('');
	const [history, setHistory] = useState(null);
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

	const getStatusName = (statusNum) => {
		const statuses = ['Created', 'InTransit', 'Delivered'];
		return statuses[statusNum] || 'Unknown';
	};

	const fetchHistory = async (e) => {
		e && e.preventDefault();
		setLoading(true);
		setError('');
		setHistory(null);

		const contract = getContract();
		
		try {
			const normalized = normalizeId(id);
			console.log("📌 Fetching status history:", normalized);

			const result = await contract.methods.getStatusHistory(normalized).call();
			console.log("✅ History received:", result);

			setHistory(result);
		} catch (err) {
			console.error('❌ getStatusHistory error:', err);
			if (err.message.includes('revert')) {
				setError('Product not found. Make sure the ID is correct.');
			} else {
				setError(err.message || 'Failed to fetch history');
			}
		}
		
		setLoading(false);
	};

	return (
		<div className="card mb-4">
			<div className="card-body">
				<h5 className="card-title">View Status History (Audit Trail)</h5>
				<form onSubmit={fetchHistory} className="mb-3">
					<div className="mb-3">
						<label className="form-label">Product ID</label>
						<input
							type="text"
							className="form-control"
							value={id}
							onChange={(e) => setId(e.target.value)}
							placeholder="batch001 or 0x..."
							required
						/>
						<small className="form-text text-muted">
							View complete audit trail of status changes
						</small>
					</div>
					<button className="btn btn-secondary" type="submit" disabled={loading}>
						{loading ? 'Loading...' : 'View History'}
					</button>
				</form>

				{error && <div className="alert alert-danger">{error}</div>}
				
				{history && history.length > 0 && (
					<div className="border-top pt-3">
						<h6 className="text-success mb-3">📜 Complete Audit Trail ({history.length} events)</h6>
						<div className="list-group">
							{history.map((event, index) => (
								<div key={index} className="list-group-item">
									<div className="d-flex w-100 justify-content-between align-items-center">
										<div>
											<h6 className="mb-1">
												<span className={`badge ${
													getStatusName(event.status) === 'Created' ? 'bg-primary' :
													getStatusName(event.status) === 'InTransit' ? 'bg-warning text-dark' :
													'bg-success'
												}`}>
													{getStatusName(event.status)}
												</span>
												<span className="ms-2 text-muted">Event #{index + 1}</span>
											</h6>
											<p className="mb-1">
												<small className="text-muted">
													Actor: <code>{event.actor}</code>
												</small>
											</p>
										</div>
										<div className="text-end">
											<small className="text-muted">
												{formatTimestamp(event.timestamp)}
											</small>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{history && history.length === 0 && (
					<div className="alert alert-info">No history found for this product</div>
				)}
			</div>
		</div>
	);
}

export default StatusHistory;