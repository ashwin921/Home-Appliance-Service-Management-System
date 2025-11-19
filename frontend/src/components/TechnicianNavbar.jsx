import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';
import './TechnicianNavbar.css';

const TechnicianNavbar = ({ technicianId }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [menuOpen, setMenuOpen] = useState(false);

    const isActive = (path) => {
        return location.pathname === path ? 'active' : '';
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
    };

    const handleProfileClick = () => {
        navigate('/technician/profile');
        setMenuOpen(false);
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-logo">
                    <span className="logo-icon">🏠</span>
                    <span className="logo-text">HomeFix Hub</span>
                    <span className="tech-badge">Technician</span>
                </div>
                
                <button className="hamburger" onClick={toggleMenu}>
                    <span></span>
                    <span></span>
                    <span></span>
                </button>

                <ul className={`navbar-menu ${menuOpen ? 'active' : ''}`}>
                    <li>
                        <Link 
                            to="/technician/requests" 
                            className={isActive('/technician/requests')}
                            onClick={() => setMenuOpen(false)}
                        >
                            📋 Requests
                        </Link>
                    </li>
                    <li>
                        <Link 
                            to="/technician/history" 
                            className={isActive('/technician/history')}
                            onClick={() => setMenuOpen(false)}
                        >
                            � History
                        </Link>
                    </li>
                    <li className="mobile-profile-link">
                        <Link 
                            to="/technician/profile" 
                            className={isActive('/technician/profile')}
                            onClick={() => setMenuOpen(false)}
                        >
                            👤 Profile
                        </Link>
                    </li>
                </ul>

                <div className="navbar-profile">
                    <button 
                        onClick={handleProfileClick} 
                        className="profile-icon-btn"
                        title="View Profile"
                    >
                        👤
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default TechnicianNavbar;
