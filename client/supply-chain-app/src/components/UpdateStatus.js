import React, { useState } from 'react';
import contract from '../utils/contract';
import web3 from '../utils/web3';

function UpdateStatus({ account }) {
    const [id, setId] = useState('');
    const [newStatus, setNewStatus] = useState('0');
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
        try {
            const normalized = normalizeId(id);
            await contract.methods.updateStatus(normalized, parseInt(newStatus)).send({ from: account });
            alert('Status updated successfully');
            setId('');
            setNewStatus('0');
        } catch (err) {
            console.error(err);
            alert('Error updating status');
        }
        setLoading(false);
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">Update Status (contract: updateStatus)</h5>
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
                        <label className="form-label">newStatus (uint8)</label>
                        <input
                            type="number"
                            min="0"
                            className="form-control"
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-success" disabled={loading}>
                        {loading ? 'Updating...' : 'Update Status'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default UpdateStatus;
