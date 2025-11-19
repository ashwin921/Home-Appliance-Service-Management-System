import React, { useState } from 'react';
import './Modal.css';

const AddApplianceModal = ({ isOpen, onClose, onAdd, customerId }) => {
    const [formData, setFormData] = useState({
        type: '',
        brand: '',
        model_no: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await onAdd({ ...formData, customer_id: customerId });
            setFormData({ type: '', brand: '', model_no: '' });
            onClose();
        } catch (err) {
            setError(err.response?.data?.message || 'Error adding appliance');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Add New Appliance</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                
                {error && <div className="error-message">{error}</div>}
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Appliance Type: *</label>
                        <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            className="form-select"
                        >
                            <option value="">-- Select Type --</option>
                            <option value="Refrigerator">Refrigerator</option>
                            <option value="Washing Machine">Washing Machine</option>
                            <option value="Air Conditioner">Air Conditioner</option>
                            <option value="Microwave">Microwave</option>
                            <option value="Television">Television</option>
                            <option value="Water Filter">Water Filter</option>
                        </select>
                    </div>
                    
                    <div className="form-group">
                        <label>Brand:</label>
                        <input
                            type="text"
                            name="brand"
                            value={formData.brand}
                            onChange={handleChange}
                            placeholder="e.g., LG, Samsung"
                        />
                    </div>
                    
                    <div className="form-group">
                        <label>Model Number:</label>
                        <input
                            type="text"
                            name="model_no"
                            value={formData.model_no}
                            onChange={handleChange}
                            placeholder="e.g., ABC123"
                        />
                    </div>
                    
                    <div className="modal-actions">
                        <button type="button" onClick={onClose} className="btn-cancel">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || !formData.type} className="btn-submit">
                            {loading ? 'Adding...' : 'Add Appliance'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddApplianceModal;