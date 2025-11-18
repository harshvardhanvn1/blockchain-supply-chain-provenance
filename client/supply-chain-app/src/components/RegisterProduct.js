import React, { useState } from 'react';
import contract from '../utils/contract';
function RegisterProduct({ account }) {
	const [name, setName] = useState('');
	const [category, setCategory] = useState('');
	const [loading, setLoading] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		try {
			await contract.methods.registerProduct(name, category).send({ from: account });
			alert('Product registered successfully!');
			setName('');
			setCategory('');
		} catch (error) {
			console.error(error);
			alert('Error registering product');
		}
		setLoading(false);
	};

	return (
		<div className="card mb-4">
			<div className="card-body">
				<h5 className="card-title">Register New Product</h5>
				<form onSubmit={handleSubmit}>
					<div className="mb-3">
						<label className="form-label">Product Name</label>
						<input
							type="text"
							className="form-control"
							value={name}
							onChange={(e) => setName(e.target.value)}
							required
						/>
					</div>
					<div className="mb-3">
						<label className="form-label">Category</label>
						<input
							type="text"
							className="form-control"
							value={category}
							onChange={(e) => setCategory(e.target.value)}
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
