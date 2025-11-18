import React, { useState, useEffect } from 'react';
import contract from '../utils/contract';
function ProductList() {
	const [products, setProducts] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		loadProducts();
	}, []);

	const loadProducts = async () => {
		try {
			const count = await contract.methods.productCount().call();
			const productsList = [];
			for (let i = 1; i <= count; i++) {
				const product = await contract.methods.getProduct(i).call();
				productsList.push({
					id: product.id,
					name: product.name,
					category: product.category,
					manufacturer: product.manufacturer,
					currentOwner: product.currentOwner,
					status: product.status,
				});
			}
			setProducts(productsList);
			setLoading(false);
		} catch (error) {
			console.error(error);
			setLoading(false);
		}
	};

	if (loading) return <div>Loading products...</div>;

	return (
		<div className="card">
			<div className="card-body">
				<h5 className="card-title">All Products</h5>
				<button className="btn btn-info mb-3" onClick={loadProducts}>
					Refresh
				</button>
				<table className="table">
					<thead>
						<tr>
							<th>ID</th>
							<th>Name</th>
							<th>Category</th>
							<th>Current Owner</th>
							<th>Status</th>
						</tr>
					</thead>
					<tbody>
						{products.map((product) => (
							<tr key={product.id}>
								<td>{product.id}</td>
								<td>{product.name}</td>
								<td>{product.category}</td>
								<td>
									{product.currentOwner.substring(0, 6)}...
									{product.currentOwner.substring(38)}
								</td>
								<td>
									<span className="badge bg-success">{product.status}</span>
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default ProductList;
