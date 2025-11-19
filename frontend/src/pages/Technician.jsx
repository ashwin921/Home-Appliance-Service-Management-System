import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import TechnicianNavbar from '../components/TechnicianNavbar';
import TechnicianRequests from './TechnicianRequests';
import TechnicianHistory from './TechnicianHistory';
import TechnicianProfile from './TechnicianProfile';
import './PageStyles.css';
import './Auth.css';

const TechnicianDashboard = ({ technicianId }) => {
    return (
        <div className="page-container">
            <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '2rem' }}>
                <h1>🔧 Dashboard</h1>
                <div style={{
                    background: 'white',
                    padding: '3rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                    textAlign: 'center'
                }}>
                    <p style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Welcome, Technician #{technicianId}!</p>
                    <p style={{ color: '#666' }}>Use the navigation bar above to view your requests and profile</p>
                </div>
            </div>
        </div>
    );
};

const Technician = () => {
    const [technicianId, setTechnicianId] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');

        if (!technicianId || technicianId.trim() === '') {
            setError('Please enter your Technician ID');
            return;
        }

        
        setIsLoggedIn(true);
        
        localStorage.setItem('technicianId', technicianId);
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setTechnicianId('');
        localStorage.removeItem('technicianId');
    };

    
    React.useEffect(() => {
        const storedTechId = localStorage.getItem('technicianId');
        if (storedTechId) {
            setTechnicianId(storedTechId);
            setIsLoggedIn(true);
        }
    }, []);

    if (isLoggedIn) {
        return (
            <>
                <TechnicianNavbar technicianId={technicianId} />
                <Routes>
                    <Route path="/" element={<TechnicianDashboard technicianId={technicianId} />} />
                    <Route path="/requests" element={<TechnicianRequests />} />
                    <Route path="/history" element={<TechnicianHistory />} />
                    <Route path="/profile" element={<TechnicianProfile />} />
                    <Route path="*" element={<Navigate to="/technician" />} />
                </Routes>
            </>
        );
    }

    return (
        <div className="auth-container">
            <div className="auth-card">
                <h1>🔧 Technician Login</h1>
                <p className="subtitle">Enter your Technician ID to access the portal</p>
                
                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label>Technician ID *</label>
                        <input
                            type="number"
                            value={technicianId}
                            onChange={(e) => setTechnicianId(e.target.value)}
                            placeholder="Enter your Technician ID"
                            required
                            min="1"
                        />
                    </div>
                    
                    {error && <div className="error-message">{error}</div>}
                    
                    <button type="submit" className="btn-primary">
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Technician;
