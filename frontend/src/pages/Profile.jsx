import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import authService from '../services/auth.service';
import './PageStyles.css';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const user = authService.getCurrentUser();
    const token = authService.getToken();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Modal states
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isEditAddressOpen, setIsEditAddressOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    
    // Form states
    const [profileForm, setProfileForm] = useState({
        fname: '',
        lname: '',
        dob: '',
        primary_phone: '',
        secondary_phone: ''
    });
    
    const [addressForm, setAddressForm] = useState({
        address_line1: '',
        landmark: '',
        stage: '',
        city: '',
        pincode: ''
    });
    
    const [passwordForm, setPasswordForm] = useState({
        old_password: '',
        new_password: '',
        confirm_password: ''
    });
    
    const [passwordStep, setPasswordStep] = useState(1);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:3001/api/customer/profile/${user.id}`,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setProfile(response.data);
            setProfileForm({
                fname: response.data.fname || '',
                lname: response.data.lname || '',
                dob: response.data.dob ? response.data.dob.split('T')[0] : '',
                primary_phone: response.data.primary_phone || '',
                secondary_phone: response.data.secondary_phone || ''
            });
            setAddressForm({
                address_line1: response.data.address_line1 || '',
                landmark: response.data.landmark || '',
                stage: response.data.stage || '',
                city: response.data.city || '',
                pincode: response.data.pincode || ''
            });
        } catch (err) {
            setError('Error loading profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const handleEditProfile = async (e) => {
        e.preventDefault();
        
        
        if (!profileForm.primary_phone) {
            alert('Primary phone is required');
            return;
        }

        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(profileForm.primary_phone)) {
            alert('Primary phone must be 10 digits');
            return;
        }

        if (profileForm.secondary_phone && !phoneRegex.test(profileForm.secondary_phone)) {
            alert('Secondary phone must be 10 digits');
            return;
        }

        try {
            
            await axios.put(
                `http://localhost:3001/api/customer/profile/${user.id}`,
                {
                    fname: profileForm.fname,
                    lname: profileForm.lname,
                    dob: profileForm.dob
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            
            await axios.put(
                `http://localhost:3001/api/customer/phone/${user.id}`,
                {
                    primary_phone: profileForm.primary_phone,
                    secondary_phone: profileForm.secondary_phone
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            
            await fetchProfile();
            setIsEditProfileOpen(false);
            alert('✅ Profile updated successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating profile');
        }
    };

    const handleEditAddress = async (e) => {
        e.preventDefault();
        try {
            await axios.put(
                `http://localhost:3001/api/customer/address/${user.id}`,
                addressForm,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            await fetchProfile();
            setIsEditAddressOpen(false);
            alert('✅ Address updated successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating address');
        }
    };

    const handleVerifyOldPassword = async (e) => {
        e.preventDefault();
        try {
            await axios.post(
                'http://localhost:3001/api/customer/verify-password',
                {
                    customer_id: user.id,
                    old_password: passwordForm.old_password
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setPasswordStep(2);
        } catch (err) {
            alert(err.response?.data?.message || 'Incorrect old password');
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        
        if (passwordForm.new_password !== passwordForm.confirm_password) {
            alert('New passwords do not match');
            return;
        }

        if (passwordForm.new_password.length < 6) {
            alert('Password must be at least 6 characters');
            return;
        }

        try {
            await axios.put(
                `http://localhost:3001/api/customer/change-password/${user.id}`,
                { new_password: passwordForm.new_password },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setIsChangePasswordOpen(false);
            setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
            setPasswordStep(1);
            alert('✅ Password changed successfully!');
        } catch (err) {
            alert(err.response?.data?.message || 'Error changing password');
        }
    };

    const closePasswordModal = () => {
        setIsChangePasswordOpen(false);
        setPasswordForm({ old_password: '', new_password: '', confirm_password: '' });
        setPasswordStep(1);
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="profile-content">
                    <h1>Profile</h1>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="page-container">
                <div className="profile-content">
                    <h1>Profile</h1>
                    <p>Error loading profile</p>
                </div>
            </div>
        );
    }

    const formatAddress = () => {
        const parts = [
            profile.address_line1,
            profile.landmark,
            profile.stage,
            profile.city,
            profile.pincode
        ].filter(Boolean);
        return parts.join(', ');
    };

    return (
        <div className="page-container">
            <div className="profile-content">
                <h1>My Profile</h1>
                
                <div className="profile-card">
                    <div className="profile-avatar-large">
                        {profile.fname?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    
                    <div className="profile-info-section">
                        <div className="info-row">
                            <strong>Name:</strong>
                            <span>{profile.fname} {profile.lname}</span>
                        </div>
                        
                        <div className="info-row">
                            <strong>Date of Birth:</strong>
                            <span>{new Date(profile.dob).toLocaleDateString('en-GB')}</span>
                        </div>
                        
                        <div className="info-row">
                            <strong>Email:</strong>
                            <span>{profile.email}</span>
                        </div>
                        
                        <div className="info-row">
                            <strong>Primary Phone:</strong>
                            <span>{profile.primary_phone || 'Not provided'}</span>
                        </div>
                        
                        <div className="info-row">
                            <strong>Secondary Phone:</strong>
                            <span>{profile.secondary_phone || 'Not provided'}</span>
                        </div>
                        
                        <div className="info-row">
                            <strong>Address:</strong>
                            <span>{formatAddress()}</span>
                        </div>
                    </div>
                    
                    <div className="profile-actions">
                        <div className="action-row-inline">
                            <button onClick={() => setIsEditProfileOpen(true)} className="btn-edit">
                                📝 Edit Profile
                            </button>
                            <button onClick={() => setIsEditAddressOpen(true)} className="btn-edit">
                                📍 Edit Address
                            </button>
                        </div>
                        <button onClick={() => setIsChangePasswordOpen(true)} className="btn-password">
                            🔒 Change Password
                        </button>
                        <button onClick={handleLogout} className="logout-button">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Edit Profile Modal */}
                {isEditProfileOpen && (
                    <div className="modal-overlay" onClick={() => setIsEditProfileOpen(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Edit Profile</h2>
                                <button className="modal-close" onClick={() => setIsEditProfileOpen(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleEditProfile}>
                                <div className="form-group">
                                    <label>First Name: *</label>
                                    <input
                                        type="text"
                                        value={profileForm.fname}
                                        onChange={(e) => setProfileForm({...profileForm, fname: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Last Name:</label>
                                    <input
                                        type="text"
                                        value={profileForm.lname}
                                        onChange={(e) => setProfileForm({...profileForm, lname: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Date of Birth: *</label>
                                    <input
                                        type="date"
                                        value={profileForm.dob}
                                        onChange={(e) => setProfileForm({...profileForm, dob: e.target.value})}
                                        max={new Date().toISOString().split('T')[0]}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Primary Phone: *</label>
                                    <input
                                        type="tel"
                                        value={profileForm.primary_phone}
                                        onChange={(e) => setProfileForm({...profileForm, primary_phone: e.target.value})}
                                        pattern="[0-9]{10}"
                                        title="Phone number must be 10 digits"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Secondary Phone:</label>
                                    <input
                                        type="tel"
                                        value={profileForm.secondary_phone}
                                        onChange={(e) => setProfileForm({...profileForm, secondary_phone: e.target.value})}
                                        pattern="[0-9]{10}"
                                        title="Phone number must be 10 digits"
                                        placeholder="Optional"
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setIsEditProfileOpen(false)} className="btn-cancel">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Edit Address Modal */}
                {isEditAddressOpen && (
                    <div className="modal-overlay" onClick={() => setIsEditAddressOpen(false)}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Edit Address</h2>
                                <button className="modal-close" onClick={() => setIsEditAddressOpen(false)}>&times;</button>
                            </div>
                            <form onSubmit={handleEditAddress}>
                                <div className="form-group">
                                    <label>Address Line 1: *</label>
                                    <input
                                        type="text"
                                        value={addressForm.address_line1}
                                        onChange={(e) => setAddressForm({...addressForm, address_line1: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Landmark:</label>
                                    <input
                                        type="text"
                                        value={addressForm.landmark}
                                        onChange={(e) => setAddressForm({...addressForm, landmark: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Stage/Area:</label>
                                    <input
                                        type="text"
                                        value={addressForm.stage}
                                        onChange={(e) => setAddressForm({...addressForm, stage: e.target.value})}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>City: *</label>
                                    <select
                                        value={addressForm.city}
                                        onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                                        required
                                        className="form-select"
                                    >
                                        <option value="">-- Select City --</option>
                                        <option value="Bangalore">Bangalore</option>
                                        <option value="Mumbai">Mumbai</option>
                                        <option value="Pune">Pune</option>
                                        <option value="Delhi">Delhi</option>
                                        <option value="Hyderabad">Hyderabad</option>
                                        <option value="Chennai">Chennai</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Pincode: *</label>
                                    <input
                                        type="text"
                                        value={addressForm.pincode}
                                        onChange={(e) => setAddressForm({...addressForm, pincode: e.target.value})}
                                        pattern="[1-9][0-9]{5}"
                                        title="6-digit pincode"
                                        required
                                    />
                                </div>
                                <div className="modal-actions">
                                    <button type="button" onClick={() => setIsEditAddressOpen(false)} className="btn-cancel">
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-submit">
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Change Password Modal */}
                {isChangePasswordOpen && (
                    <div className="modal-overlay" onClick={closePasswordModal}>
                        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h2>Change Password</h2>
                                <button className="modal-close" onClick={closePasswordModal}>&times;</button>
                            </div>
                            
                            {passwordStep === 1 ? (
                                <form onSubmit={handleVerifyOldPassword}>
                                    <div className="form-group">
                                        <label>Old Password: *</label>
                                        <input
                                            type="password"
                                            value={passwordForm.old_password}
                                            onChange={(e) => setPasswordForm({...passwordForm, old_password: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="modal-actions">
                                        <button type="button" onClick={closePasswordModal} className="btn-cancel">
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-submit">
                                            Verify
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <form onSubmit={handleChangePassword}>
                                    <div className="form-group">
                                        <label>New Password: *</label>
                                        <input
                                            type="password"
                                            value={passwordForm.new_password}
                                            onChange={(e) => setPasswordForm({...passwordForm, new_password: e.target.value})}
                                            minLength="6"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm Password: *</label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirm_password}
                                            onChange={(e) => setPasswordForm({...passwordForm, confirm_password: e.target.value})}
                                            minLength="6"
                                            required
                                        />
                                    </div>
                                    <div className="modal-actions">
                                        <button type="button" onClick={closePasswordModal} className="btn-cancel">
                                            Cancel
                                        </button>
                                        <button type="submit" className="btn-submit">
                                            Change Password
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;