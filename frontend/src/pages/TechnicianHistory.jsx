import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/PageStyles.css';
import './TechnicianHistory.css';

const TechnicianHistory = () => {
    const technicianId = localStorage.getItem('technicianId');
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:3001/api/technician/${technicianId}/history`
            );
            setHistory(response.data);
        } catch (err) {
            setError('Error loading service history');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const formatAddress = (request) => {
        const parts = [
            request.address_line1,
            request.landmark,
            request.stage,
            request.city,
            request.pincode
        ].filter(Boolean);
        return parts.join(', ');
    };

    const getPaymentStatusColor = (status) => {
        return status === 'Paid' ? '#28a745' : '#dc3545';
    };

    if (loading) {
        return (
            <div className="page-container">
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                    <h1>📚 Service History</h1>
                    <p>Loading history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <h1>📚 Service History</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                {history.length === 0 ? (
                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        marginTop: '2rem'
                    }}>
                        <p style={{ fontSize: '1.2rem', color: '#666' }}>
                            No completed service requests yet
                        </p>
                    </div>
                ) : (
                    <div className="history-list">
                        {history.map((request) => (
                            <div key={request.request_id} className="history-card">
                                <div className="history-header">
                                    <div>
                                        <h3>Request #{request.request_id}</h3>
                                        <p className="history-date">
                                            {new Date(request.request_date).toLocaleDateString('en-GB')}
                                        </p>
                                    </div>
                                    <div className="invoice-info">
                                        <div className="invoice-badge">
                                            Invoice #{request.invoice_id}
                                        </div>
                                        <div 
                                            className="payment-badge"
                                            style={{ backgroundColor: getPaymentStatusColor(request.payment_status) }}
                                        >
                                            {request.payment_status}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="history-details">
                                    <div className="history-section">
                                        <h4>👤 Customer</h4>
                                        <div className="history-row">
                                            <strong>Name:</strong>
                                            <span>{request.customer_fname} {request.customer_lname}</span>
                                        </div>
                                        <div className="history-row">
                                            <strong>Phone:</strong>
                                            <span>{request.customer_phones ? request.customer_phones.join(', ') : 'N/A'}</span>
                                        </div>
                                        <div className="history-row">
                                            <strong>Address:</strong>
                                            <span>{formatAddress(request)}</span>
                                        </div>
                                    </div>

                                    <div className="history-section">
                                        <h4>🔧 Service Details</h4>
                                        <div className="history-row">
                                            <strong>Appliance:</strong>
                                            <span>
                                                {request.appliance_type}
                                                {request.appliance_brand && ` - ${request.appliance_brand}`}
                                                {request.appliance_model && ` (${request.appliance_model})`}
                                            </span>
                                        </div>
                                        <div className="history-row">
                                            <strong>Issue:</strong>
                                            <span>{request.description}</span>
                                        </div>
                                    </div>

                                    <div className="history-section">
                                        <h4>💰 Invoice Details</h4>
                                        <div className="history-row">
                                            <strong>Amount:</strong>
                                            <span className="amount-value">₹{request.total_cost}</span>
                                        </div>
                                        <div className="history-row">
                                            <strong>Issue Date:</strong>
                                            <span>{new Date(request.issue_date).toLocaleDateString('en-GB')}</span>
                                        </div>
                                        <div className="history-row">
                                            <strong>Status:</strong>
                                            <span 
                                                style={{ 
                                                    color: getPaymentStatusColor(request.payment_status),
                                                    fontWeight: '600'
                                                }}
                                            >
                                                {request.payment_status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicianHistory;
