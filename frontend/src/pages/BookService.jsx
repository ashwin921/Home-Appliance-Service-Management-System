import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/auth.service';
import AddApplianceModal from '../components/AddApplianceModal';
import './PageStyles.css';
import './BookService.css';

const BookService = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const token = authService.getToken();
    
    const [appliances, setAppliances] = useState([]);
    const [selectedAppliance, setSelectedAppliance] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loadingAppliances, setLoadingAppliances] = useState(true);

    useEffect(() => {
        fetchAppliances();
    }, []);

    const fetchAppliances = async () => {
        try {
            setLoadingAppliances(true);
            const response = await axios.get(
                `http://localhost:3001/api/appliances/${user.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setAppliances(response.data);
        } catch (err) {
            setError('Error loading appliances');
            console.error(err);
        } finally {
            setLoadingAppliances(false);
        }
    };

    const handleAddAppliance = async (applianceData) => {
        try {
            const response = await axios.post(
                'http://localhost:3001/api/appliances',
                applianceData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            // Refresh appliances list
            await fetchAppliances();
            
            // Auto-select the newly added appliance
            const newAppliance = response.data.appliance;
            setSelectedAppliance(`${newAppliance.appliance_id}_${newAppliance.customer_id}`);
            
            setSuccess('Appliance added successfully!');
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            throw err;
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (selectedAppliance === 'add_new') {
                setError('Please add an appliance first');
                setLoading(false);
                return;
            }

            const [appliance_id, customer_id] = selectedAppliance.split('_');
            const request_date = new Date().toISOString().split('T')[0];

            await axios.post(
                'http://localhost:3001/api/service-requests',
                {
                    customer_id: parseInt(customer_id),
                    appliance_id: parseInt(appliance_id),
                    description,
                    request_date
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            alert('Service request submitted successfully ✅');
            navigate('/bookings');
        } catch (err) {
            setError(err.response?.data?.message || 'Error submitting request');
        } finally {
            setLoading(false);
        }
    };

    const handleApplianceChange = (e) => {
        const value = e.target.value;
        if (value === 'add_new') {
            setIsModalOpen(true);
        } else {
            setSelectedAppliance(value);
        }
    };

    return (
        <div className="page-container">
            <div className="book-service-content">
                <h1>Book a Service</h1>
                
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                <form onSubmit={handleSubmit} className="service-form">
                    <div className="form-group">
                        <label>Select Appliance: *</label>
                        {loadingAppliances ? (
                            <p>Loading appliances...</p>
                        ) : (
                            <select
                                value={selectedAppliance}
                                onChange={handleApplianceChange}
                                required
                                className="form-select"
                            >
                                <option value="">-- Select an appliance --</option>
                                {appliances.map((appliance) => (
                                    <option 
                                        key={`${appliance.appliance_id}_${appliance.customer_id}`}
                                        value={`${appliance.appliance_id}_${appliance.customer_id}`}
                                    >
                                        {appliance.type}
                                        {appliance.brand && ` - ${appliance.brand}`}
                                        {appliance.model_no && ` (${appliance.model_no})`}
                                    </option>
                                ))}
                                <option value="add_new">➕ Add New Appliance</option>
                            </select>
                        )}
                    </div>

                    <div className="form-group">
                        <label>Problem Description: *</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe the issue with your appliance..."
                            required
                            rows="5"
                            className="form-textarea"
                        />
                    </div>

                    <div className="form-group">
                        <label>Request Date:</label>
                        <input
                            type="text"
                            value={new Date().toLocaleDateString('en-GB')}
                            disabled
                            className="form-input-disabled"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading || !selectedAppliance || !description}
                        className="submit-button"
                    >
                        {loading ? 'Submitting...' : 'Submit Request'}
                    </button>
                </form>
            </div>

            <AddApplianceModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onAdd={handleAddAppliance}
                customerId={user.id}
            />
        </div>
    );
};

export default BookService;