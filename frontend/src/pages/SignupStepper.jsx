import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Auth.css';

const SignupStepper = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    
    
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        fname: '',
        lname: '',
        dob: '',
        address_line1: '',
        landmark: '',
        stage: '',
        city: 'Bangalore', 
        pincode: '',
        primary_phone: '',
        secondary_phone: ''
    });

    const cities = [
        'Bangalore',
        'Mumbai',
        'Pune',
        'Delhi',
        'Hyderabad',
        'Chennai'
    ];


    const handleEmailCheck = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:3001/api/auth/check-email', {
                email: formData.email
            });

            if (response.data.exists) {
                setError('Email already exists');
            } else {
                setStep(2);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Error checking email');
        } finally {
            setLoading(false);
        }
    };

    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            
            const formattedData = {
                ...formData,
                dob: formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : null,
                landmark: formData.landmark || null,
                stage: formData.stage || null
            };
            
            console.log('Sending registration data:', {
                ...formattedData,
                password: '[REDACTED]'
            });
            
            await axios.post('http://localhost:3001/api/auth/register', formattedData);
            setSuccess('Account created successfully');
            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (err) {
            if (err.response?.status === 409) {
                setError('Email already exists');
                setStep(1); // Go back to email step if email became taken
            } else {
                setError(err.response?.data?.message || 'Error creating account');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    
    const isStep2Valid = () => {
        return (
            formData.fname &&
            formData.dob &&
            formData.address_line1 &&
            formData.city &&
            formData.pincode &&
            formData.primary_phone &&
            /^[1-9][0-9]{5}$/.test(formData.pincode) &&
            /^[0-9]{10}$/.test(formData.primary_phone) &&
            (!formData.secondary_phone || /^[0-9]{10}$/.test(formData.secondary_phone)) &&
            new Date(formData.dob) <= new Date() 
        );
    };

    return (
        <div className="auth-container">
            <div className="auth-box">
                <h2>Create Account</h2>
                {error && <div className="error-message">{error}</div>}
                {success && <div className="success-message">{success}</div>}
                
                {step === 1 ? (
                    <form onSubmit={handleEmailCheck}>
                        <div className="form-group">
                            <label>Email:</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Password:</label>
                            <input
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                minLength="6"
                            />
                        </div>
                        <button type="submit" disabled={loading || !formData.email || !formData.password}>
                            {loading ? 'Checking...' : 'Next'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>First Name: *</label>
                            <input
                                type="text"
                                name="fname"
                                value={formData.fname}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Last Name:</label>
                            <input
                                type="text"
                                name="lname"
                                value={formData.lname}
                                onChange={handleChange}
                            />
                        </div>
                        <div className="form-group">
                            <label>Date of Birth: *</label>
                            <input
                                type="date"
                                name="dob"
                                value={formData.dob}
                                onChange={handleChange}
                                required
                                max={new Date().toISOString().split('T')[0]} // Prevent future dates
                            />
                        </div>
                        <div className="form-group">
                            <label>Address Line 1: *</label>
                            <input
                                type="text"
                                name="address_line1"
                                value={formData.address_line1}
                                onChange={handleChange}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Landmark:</label>
                            <input
                                type="text"
                                name="landmark"
                                value={formData.landmark || ''}
                                onChange={handleChange}
                                placeholder="Near metro station, market, etc."
                            />
                        </div>
                        <div className="form-group">
                            <label>Stage/Area:</label>
                            <input
                                type="text"
                                name="stage"
                                value={formData.stage || ''}
                                onChange={handleChange}
                                placeholder="Colony, Layout, etc."
                            />
                        </div>
                        <div className="form-group">
                            <label>City: *</label>
                            <select
                                name="city"
                                value={formData.city}
                                onChange={handleChange}
                                required
                                className="form-select"
                            >
                                {cities.map(city => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Pincode: *</label>
                            <input
                                type="text"
                                name="pincode"
                                value={formData.pincode}
                                onChange={handleChange}
                                required
                                pattern="[1-9][0-9]{5}"
                                title="Please enter a valid 6-digit pincode"
                            />
                        </div>
                        <div className="form-group">
                            <label>Primary Phone Number: *</label>
                            <input
                                type="tel"
                                name="primary_phone"
                                value={formData.primary_phone}
                                onChange={handleChange}
                                required
                                pattern="[0-9]{10}"
                                title="Please enter a valid 10-digit phone number"
                                placeholder="10-digit number"
                            />
                        </div>
                        <div className="form-group">
                            <label>Secondary Phone Number:</label>
                            <input
                                type="tel"
                                name="secondary_phone"
                                value={formData.secondary_phone}
                                onChange={handleChange}
                                pattern="[0-9]{10}"
                                title="Please enter a valid 10-digit phone number"
                                placeholder="10-digit number (optional)"
                            />
                        </div>
                        <button type="submit" disabled={loading || !isStep2Valid()}>
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setStep(1)} 
                            className="secondary-button"
                        >
                            Back
                        </button>
                    </form>
                )}
                
                <div className="auth-links">
                    <p>
                        Already have an account?{' '}
                        <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login'); }}>
                            Login here
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default SignupStepper;