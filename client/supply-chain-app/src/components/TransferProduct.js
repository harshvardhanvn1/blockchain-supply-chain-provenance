import React, { useState } from 'react';
import contract from '../utils/contract';
function TransferProduct({ account }) {
	const [productId, setProductId] = useState('');
	const [newOwner, setNewOwner] = useState('');
	const [loading, setLoading] = useState(false);

	const handleTransfer = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await contract.methods.transferProduct(productId, newOwner).send({ from: account });
			alert('Product transferred successfully!');
			setProductId('');
			setNewOwner('');
		} catch (error) {
			console.error(error);
			alert('Error transferring product');
		}
		setLoading(false);
	};

	return (
		<div className="card mb-4">
			<div className="card-body">
				<h5 className="card-title">Transfer Product</h5>
				<form onSubmit={handleTransfer}>
					<div className="mb-3">
						<label className="form-label">Product ID</label>
						<input
							type="number"
							className="form-control"
							value={productId}
							onChange={(e) => setProductId(e.target.value)}
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
							required
						/>
					</div>
					<button type="submit" className="btn btn-warning" disabled={loading}>
						{loading ? 'Transferring...' : 'Transfer Product'}
					</button>
				</form>
			</div>
		</div>
	);
}

export default TransferProduct;
