import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authService from '../services/auth.service';
import './PageStyles.css';
import './Bookings.css';

const Bookings = () => {
    const user = authService.getCurrentUser();
    const token = authService.getToken();
    
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedPhoto, setSelectedPhoto] = useState(null);
    const [ratingModal, setRatingModal] = useState({ open: false, requestId: null, technicianName: '' });
    const [selectedRating, setSelectedRating] = useState(0);

    useEffect(() => {
        fetchBookings();
    }, []);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:3001/api/service-requests/${user.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setBookings(response.data);
        } catch (err) {
            setError('Error loading bookings');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelRequest = async (requestId) => {
        const confirm = window.confirm(
            'Are you sure you want to cancel this service request? This action cannot be undone.'
        );
        
        if (!confirm) return;

        try {
            await axios.delete(
                `http://localhost:3001/api/service-requests/${requestId}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            fetchBookings();
            alert('Service request cancelled successfully');
        } catch (err) {
            alert(err.response?.data?.message || 'Error cancelling request');
            console.error(err);
        }
    };

    const openRatingModal = (requestId, technicianName) => {
        setRatingModal({ open: true, requestId, technicianName });
        setSelectedRating(0);
    };

    const closeRatingModal = () => {
        setRatingModal({ open: false, requestId: null, technicianName: '' });
        setSelectedRating(0);
    };

    const handleSubmitRating = async () => {
        if (selectedRating === 0) {
            alert('Please select a rating');
            return;
        }

        try {
            await axios.put(
                `http://localhost:3001/api/service-requests/${ratingModal.requestId}/rating`,
                { rating: selectedRating },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            closeRatingModal();
            fetchBookings();
            alert('✅ Rating submitted successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error submitting rating');
            console.error(err);
        }
    };

    const convertBlobToBase64 = (blob) => {
        if (!blob || !blob.data) return null;
        const base64String = btoa(
            new Uint8Array(blob.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );
        return `data:image/png;base64,${base64String}`;
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return '#ffc107';
            case 'In Progress': return '#007bff';
            case 'Completed': return '#28a745';
            case 'Cancelled': return '#dc3545';
            default: return '#6c757d';
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="bookings-content">
                    <h1>My Bookings</h1>
                    <p>Loading your bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <div className="bookings-content">
                <h1>My Bookings</h1>
                
                {error && <div className="error-message">{error}</div>}
                
                {bookings.length === 0 ? (
                    <div className="no-bookings">
                        <p>📋 No bookings yet</p>
                        <p className="subtitle">Book a service to see your requests here</p>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {bookings.map((booking) => (
                            <div key={booking.request_id} className="booking-card">
                                <div className="booking-header">
                                    <h3>{booking.appliance_type} Service</h3>
                                    <span 
                                        className="status-badge" 
                                        style={{ backgroundColor: getStatusColor(booking.status) }}
                                    >
                                        {booking.status}
                                    </span>
                                </div>
                                
                                <div className="booking-details">
                                    <div className="detail-row">
                                        <strong>Appliance:</strong>
                                        <span>
                                            {booking.appliance_type}
                                            {booking.appliance_brand && ` - ${booking.appliance_brand}`}
                                            {booking.appliance_model && ` (${booking.appliance_model})`}
                                        </span>
                                    </div>
                                    
                                    <div className="detail-row">
                                        <strong>Problem:</strong>
                                        <span>{booking.description}</span>
                                    </div>
                                    
                                    <div className="detail-row">
                                        <strong>Request Date:</strong>
                                        <span>{new Date(booking.request_date).toLocaleDateString('en-GB')}</span>
                                    </div>
                                    
                                    {booking.technician_name && (
                                        <>
                                            <div className="detail-row technician-row">
                                                <strong>Technician:</strong>
                                                <div className="technician-info">
                                                    {booking.technician_photo && (
                                                        <img 
                                                            src={convertBlobToBase64(booking.technician_photo)}
                                                            alt="Technician"
                                                            className="technician-avatar"
                                                            onClick={() => setSelectedPhoto(convertBlobToBase64(booking.technician_photo))}
                                                            title="Click to view full image"
                                                        />
                                                    )}
                                                    <span>{booking.technician_name}</span>
                                                </div>
                                            </div>
                                            {booking.technician_phone && (
                                                <div className="detail-row">
                                                    <strong>Contact:</strong>
                                                    <span>{booking.technician_phone}</span>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    
                                    {booking.total_cost && (
                                        <div className="detail-row">
                                            <strong>Total Cost:</strong>
                                            <span>₹{booking.total_cost}</span>
                                        </div>
                                    )}
                                    
                                    {booking.payment_status && (
                                        <div className="detail-row">
                                            <strong>Payment:</strong>
                                            <span className={`payment-${booking.payment_status.toLowerCase()}`}>
                                                {booking.payment_status}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="booking-actions">
                                    {booking.status === 'Pending' && (
                                        <button 
                                            onClick={() => handleCancelRequest(booking.request_id)}
                                            className="cancel-button"
                                        >
                                            Cancel Request
                                        </button>
                                    )}
                                    {booking.status === 'Completed' && !booking.service_rating && booking.technician_id && (
                                        <button 
                                            onClick={() => openRatingModal(booking.request_id, booking.technician_name)}
                                            className="rate-button"
                                        >
                                            ⭐ Rate Technician
                                        </button>
                                    )}
                                    {booking.service_rating && (
                                        <div className="rating-display">
                                            <span>Your Rating: </span>
                                            <span className="stars">{'⭐'.repeat(Math.floor(booking.service_rating))}</span>
                                            <span className="rating-value">({booking.service_rating})</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Photo Modal */}
            {selectedPhoto && (
                <div className="photo-modal-overlay" onClick={() => setSelectedPhoto(null)}>
                    <div className="photo-modal-content" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setSelectedPhoto(null)}>&times;</button>
                        <img src={selectedPhoto} alt="Technician Full View" className="full-photo" />
                    </div>
                </div>
            )}

            {/* Rating Modal */}
            {ratingModal.open && (
                <div className="modal-overlay">
                    <div className="modal-content rating-modal">
                        <h2>Rate Technician</h2>
                        <p>How would you rate <strong>{ratingModal.technicianName}</strong>?</p>
                        
                        <div className="star-rating">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <span
                                    key={star}
                                    className={`star ${selectedRating >= star ? 'selected' : ''}`}
                                    onClick={() => setSelectedRating(star)}
                                >
                                    ⭐
                                </span>
                            ))}
                        </div>
                        
                        {selectedRating > 0 && (
                            <p className="rating-text">
                                {selectedRating === 1 && 'Poor'}
                                {selectedRating === 2 && 'Fair'}
                                {selectedRating === 3 && 'Good'}
                                {selectedRating === 4 && 'Very Good'}
                                {selectedRating === 5 && 'Excellent'}
                            </p>
                        )}
                        
                        <div className="modal-actions">
                            <button onClick={closeRatingModal} className="btn-cancel">
                                Cancel
                            </button>
                            <button onClick={handleSubmitRating} className="btn-submit">
                                Submit Rating
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Bookings;