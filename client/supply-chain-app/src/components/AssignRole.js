import React, { useState } from 'react';
import contract from '../utils/contract';

function AssignRole({ account }) {
    const [user, setUser] = useState('');
    const [role, setRole] = useState('0');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await contract.methods.assignRole(user, parseInt(role)).send({ from: account });
            alert('Role assigned successfully');
            setUser('');
            setRole('0');
        } catch (err) {
            console.error(err);
            alert('Error assigning role');
        }
        setLoading(false);
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">Assign Role (contract: assignRole)</h5>
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">User Address</label>
                        <input
                            type="text"
                            className="form-control"
                            value={user}
                            onChange={(e) => setUser(e.target.value)}
                            placeholder="0x..."
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Role (uint8)</label>
                        <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={role}
                            onChange={(e) => setRole(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-secondary" disabled={loading}>
                        {loading ? 'Assigning...' : 'Assign Role'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default AssignRole;
