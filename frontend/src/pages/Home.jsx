import React from 'react';
import authService from '../services/auth.service';
import './PageStyles.css';

const Home = () => {
    const user = authService.getCurrentUser();

    return (
        <div className="page-container">
            <div className="welcome-section">
                <h1>Welcome to HomeFix Hub</h1>
                <p className="welcome-text">Hello, {user?.fname || 'Guest'}! 👋</p>
                <p className="subtitle">Your one-stop solution for all home appliance repairs and services.</p>
                
                <div className="feature-cards">
                    <div className="feature-card">
                        <div className="feature-icon">🔧</div>
                        <h3>Expert Technicians</h3>
                        <p>Skilled professionals for all your repair needs</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">⚡</div>
                        <h3>Quick Service</h3>
                        <p>Fast response and efficient repairs</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💰</div>
                        <h3>Affordable Rates</h3>
                        <p>Transparent pricing with no hidden charges</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;