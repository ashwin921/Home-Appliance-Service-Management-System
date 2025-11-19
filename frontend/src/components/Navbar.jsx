import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import authService from '../services/auth.service';
import './Navbar.css';

const Navbar = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <span className="logo-icon">🏠</span>
                    <span className="logo-text">HomeFix Hub</span>
                </div>
                
                <ul className="navbar-menu">
                    <li><Link to="/home">Home</Link></li>
                    <li><Link to="/book-service">Book Service</Link></li>
                    <li><Link to="/bookings">My Bookings</Link></li>
                    <li><Link to="/support">Support</Link></li>
                </ul>

                <div className="navbar-profile">
                    <Link to="/profile" className="profile-link">
                        <div className="profile-avatar">
                            {user?.fname?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;