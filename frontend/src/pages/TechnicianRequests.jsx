import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../pages/PageStyles.css';
import '../pages/Bookings.css';
import './TechnicianRequests.css';

const TechnicianRequests = () => {
    const technicianId = localStorage.getItem('technicianId');
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [invoiceModal, setInvoiceModal] = useState({ open: false, requestId: null });
    const [invoiceData, setInvoiceData] = useState({
        total_cost: '',
        issue_date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:3001/api/technician/${technicianId}/requests`
            );
            setRequests(response.data);
        } catch (err) {
            setError('Error loading requests');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartJob = async (requestId) => {
        if (!window.confirm('Are you sure you want to start this job?')) return;

        try {
            await axios.put(
                `http://localhost:3001/api/technician/requests/${requestId}/start`,
                { technician_id: technicianId }
            );
            alert('✅ Job started successfully!');
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Error starting job');
        }
    };

    const openFinishModal = (requestId) => {
        setInvoiceModal({ open: true, requestId });
        setInvoiceData({
            total_cost: '',
            issue_date: new Date().toISOString().split('T')[0]
        });
    };

    const closeFinishModal = () => {
        setInvoiceModal({ open: false, requestId: null });
        setInvoiceData({ total_cost: '', issue_date: new Date().toISOString().split('T')[0] });
    };

    const handleFinishJob = async (e) => {
        e.preventDefault();

        if (!invoiceData.total_cost || invoiceData.total_cost <= 0) {
            alert('Please enter a valid total cost');
            return;
        }

        try {
            await axios.post(
                `http://localhost:3001/api/technician/requests/${invoiceModal.requestId}/finish`,
                {
                    technician_id: technicianId,
                    total_cost: invoiceData.total_cost,
                    issue_date: invoiceData.issue_date
                }
            );
            alert('✅ Job completed and invoice created successfully!');
            closeFinishModal();
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Error finishing job');
        }
    };

    const handleMarkAsPaid = async (invoiceId) => {
        if (!window.confirm('Mark this invoice as paid?')) return;

        try {
            await axios.put(
                `http://localhost:3001/api/technician/invoices/${invoiceId}/mark-paid`,
                { technician_id: technicianId }
            );
            alert('✅ Invoice marked as paid!');
            fetchRequests();
        } catch (err) {
            alert(err.response?.data?.message || 'Error marking invoice as paid');
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

    const getActionButton = (request) => {
        if (request.status === 'Pending') {
            return (
                <button 
                    onClick={() => handleStartJob(request.request_id)}
                    className="action-button start-button"
                >
                    ▶️ Start Job
                </button>
            );
        } else if (request.status === 'In Progress' && !request.invoice_id) {
            return (
                <button 
                    onClick={() => openFinishModal(request.request_id)}
                    className="action-button finish-button"
                >
                    ✅ Finish Job
                </button>
            );
        } else if (request.invoice_id && request.payment_status === 'Unpaid') {
            return (
                <button 
                    onClick={() => handleMarkAsPaid(request.invoice_id)}
                    className="action-button paid-button"
                >
                    💰 Mark as Paid
                </button>
            );
        }
        return null;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#ffc107';
            case 'In Progress': return '#007bff';
            case 'Completed': return '#28a745';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                    <h1>📋 My Service Requests</h1>
                    <p>Loading requests...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
                <h1>📋 My Service Requests</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                {requests.length === 0 ? (
                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '8px',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                        textAlign: 'center',
                        marginTop: '2rem'
                    }}>
                        <p style={{ fontSize: '1.2rem', color: '#666' }}>
                            No active service requests assigned
                        </p>
                    </div>
                ) : (
                    <div className="requests-list">
                        {requests.map((request) => (
                            <div key={request.request_id} className="request-card">
                                <div className="request-header">
                                    <h3>Request #{request.request_id}</h3>
                                    <span 
                                        className="status-badge" 
                                        style={{ backgroundColor: getStatusColor(request.status) }}
                                    >
                                        {request.status}
                                    </span>
                                </div>
                                
                                <div className="request-details">
                                    <div className="detail-section">
                                        <h4>👤 Customer Information</h4>
                                        <div className="detail-row">
                                            <strong>Name:</strong>
                                            <span>{request.customer_fname} {request.customer_lname}</span>
                                        </div>
                                        <div className="detail-row">
                                            <strong>Phone:</strong>
                                            <span>{request.customer_phones.join(', ')}</span>
                                        </div>
                                        <div className="detail-row">
                                            <strong>Address:</strong>
                                            <span>{formatAddress(request)}</span>
                                        </div>
                                    </div>

                                    <div className="detail-section">
                                        <h4>🔧 Service Details</h4>
                                        <div className="detail-row">
                                            <strong>Appliance:</strong>
                                            <span>
                                                {request.appliance_type}
                                                {request.appliance_brand && ` - ${request.appliance_brand}`}
                                                {request.appliance_model && ` (${request.appliance_model})`}
                                            </span>
                                        </div>
                                        <div className="detail-row">
                                            <strong>Issue:</strong>
                                            <span>{request.description}</span>
                                        </div>
                                        <div className="detail-row">
                                            <strong>Request Date:</strong>
                                            <span>{new Date(request.request_date).toLocaleDateString('en-GB')}</span>
                                        </div>
                                        {request.total_cost && (
                                            <div className="detail-row">
                                                <strong>Invoice Amount:</strong>
                                                <span>₹{request.total_cost}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="request-actions">
                                    {getActionButton(request)}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Invoice Modal */}
                {invoiceModal.open && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <h2>📄 Create Invoice</h2>
                            <form onSubmit={handleFinishJob}>
                                <div className="form-group">
                                    <label>Request ID</label>
                                    <input 
                                        type="text" 
                                        value={`#${invoiceModal.requestId}`} 
                                        disabled 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Issue Date *</label>
                                    <input 
                                        type="date" 
                                        value={invoiceData.issue_date}
                                        onChange={(e) => setInvoiceData({...invoiceData, issue_date: e.target.value})}
                                        required 
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Total Cost (₹) *</label>
                                    <input 
                                        type="number" 
                                        value={invoiceData.total_cost}
                                        onChange={(e) => setInvoiceData({...invoiceData, total_cost: e.target.value})}
                                        min="0"
                                        step="0.01"
                                        placeholder="Enter amount"
                                        required 
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={closeFinishModal} className="btn-cancel">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        Create Invoice & Complete
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TechnicianRequests;
