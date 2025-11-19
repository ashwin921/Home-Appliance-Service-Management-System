import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../pages/PageStyles.css';
import './TechnicianProfile.css';

const TechnicianProfile = () => {
    const technicianId = localStorage.getItem('technicianId');
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState({ fname: '', lname: '', phone_no: '' });
    const [saving, setSaving] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);
    const [availableSkills, setAvailableSkills] = useState([]);
    const [showAddSkill, setShowAddSkill] = useState(false);
    const [selectedSkill, setSelectedSkill] = useState('');

    useEffect(() => {
        fetchProfile();
        fetchAvailableSkills();
        
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const response = await axios.get(
                `http://localhost:3001/api/technician/${technicianId}/profile`
            );
            setProfile(response.data);
            setEditData({
                fname: response.data.fname || '',
                lname: response.data.lname || '',
                phone_no: response.data.phone_no || ''
            });
        } catch (err) {
            setError('Error loading profile');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchAvailableSkills = async () => {
        try {
            const response = await axios.get('http://localhost:3001/api/technician/available-skills');
            setAvailableSkills(response.data);
        } catch (error) {
            console.error('Error fetching available skills:', error);
        }
    };

    const convertBlobToBase64 = (blob) => {
        if (!blob || !blob.data) return null;
        const uint8Array = new Uint8Array(blob.data);
        const binaryString = uint8Array.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
        return `data:image/png;base64,${btoa(binaryString)}`;
    };

    const handleEditClick = () => {
        setEditData({
            fname: profile.fname || '',
            lname: profile.lname || '',
            phone_no: profile.phone_no || ''
        });
        setEditMode(true);
    };

    const handleCancelEdit = () => {
        setEditMode(false);
        setEditData({
            fname: profile.fname || '',
            lname: profile.lname || '',
            phone_no: profile.phone_no || ''
        });
        setSelectedFile(null);
        setPreviewImage(null);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert('File size must be less than 5MB');
                return;
            }
            if (!file.type.startsWith('image/')) {
                alert('Only image files are allowed');
                return;
            }
            setSelectedFile(file);
            
            
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        
        if (!editData.fname.trim()) {
            alert('First name is required');
            return;
        }

        if (editData.phone_no && !/^[0-9]{10}$/.test(editData.phone_no)) {
            alert('Phone number must be 10 digits');
            return;
        }

        try {
            setSaving(true);
            
            
            const formData = new FormData();
            formData.append('fname', editData.fname.trim());
            formData.append('lname', editData.lname ? editData.lname.trim() : '');
            formData.append('phone_no', editData.phone_no || '');
            if (selectedFile) {
                formData.append('photo', selectedFile);
            }
            
            await axios.put(
                `http://localhost:3001/api/technician/${technicianId}/profile`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            alert('✅ Profile updated successfully!');
            setEditMode(false);
            setSelectedFile(null);
            setPreviewImage(null);
            fetchProfile(); 
        } catch (err) {
            alert(err.response?.data?.message || 'Error updating profile');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = () => {
        if (window.confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('technicianId');
            window.location.href = '/technician';
        }
    };

    const handleAddSkill = async (e) => {
        e.preventDefault();
        
        if (!selectedSkill) {
            alert('Please select a skill');
            return;
        }

        try {
            await axios.post(`http://localhost:3001/api/technician/${technicianId}/skills`, {
                skill: selectedSkill
            });
            
            
            await fetchProfile();
            setShowAddSkill(false);
            setSelectedSkill('');
        } catch (error) {
            console.error('Error adding skill:', error);
            alert(error.response?.data?.message || 'Failed to add skill');
        }
    };

    const handleDeleteSkill = async (skill) => {
        if (!window.confirm(`Are you sure you want to remove "${skill}" from your skills?`)) {
            return;
        }

        try {
            await axios.delete(`http://localhost:3001/api/technician/${technicianId}/skills/${encodeURIComponent(skill)}`);
            
            
            await fetchProfile();
        } catch (error) {
            console.error('Error deleting skill:', error);
            alert(error.response?.data?.message || 'Failed to delete skill');
        }
    };

    if (loading) {
        return (
            <div className="page-container">
                <div className="profile-loading">
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="page-container">
                <div className="profile-error">
                    <p>{error || 'Profile not found'}</p>
                </div>
            </div>
        );
    }

    const photoBase64 = profile.photo ? convertBlobToBase64(profile.photo) : null;

    return (
        <div className="page-container">
            <div className="profile-page-wrapper">
                <div className="profile-card-main">
                    {/* Profile Image */}
                    <div className="profile-image-container">
                        {photoBase64 ? (
                            <img 
                                src={photoBase64} 
                                alt={`${profile.fname} ${profile.lname}`}
                                className="profile-image-circle"
                            />
                        ) : (
                            <div className="profile-image-placeholder">
                                👤
                            </div>
                        )}
                    </div>

                    {/* Profile Information */}
                    {!editMode ? (
                        <div className="profile-info-section">
                            <h2 className="profile-name">
                                {profile.fname} {profile.lname || ''}
                            </h2>
                            <p className="profile-id">Technician ID: #{profile.technician_id}</p>

                            <div className="profile-details-grid">
                                <div className="profile-detail-item">
                                    <span className="detail-label">📞 Phone Number</span>
                                    <span className="detail-value">{profile.phone_no || 'Not provided'}</span>
                                </div>

                                <div className="profile-detail-item">
                                    <span className="detail-label">⭐ My Rating</span>
                                    <span className="detail-value rating-value">
                                        {profile.rating ? Number(profile.rating).toFixed(1) : 'N/A'}
                                    </span>
                                </div>

                                <div className="profile-detail-item full-width">
                                    <span className="detail-label">🏢 Service Center</span>
                                    <span className="detail-value">
                                        {profile.center_name || 'Not assigned'} 
                                        {profile.center_location && ` - ${profile.center_location}`}
                                    </span>
                                </div>

                                <div className="profile-detail-item">
                                    <span className="detail-label">⭐ Center Rating</span>
                                    <span className="detail-value rating-value">
                                        {profile.center_rating ? Number(profile.center_rating).toFixed(2) : 'N/A'}
                                    </span>
                                </div>

                                <div className="profile-detail-item">
                                    <span className="detail-label">✅ Completed Jobs</span>
                                    <span className="detail-value">{profile.completed_jobs}</span>
                                </div>

                                <div className="profile-detail-item">
                                    <span className="detail-label">🔄 Active Jobs</span>
                                    <span className="detail-value">{profile.active_jobs}</span>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className="profile-skills-section">
                                <div className="skills-header">
                                    <h3>🛠️ Skills</h3>
                                    {!editMode && (
                                        <button 
                                            onClick={() => setShowAddSkill(true)} 
                                            className="btn-add-skill-small"
                                        >
                                            + Add Skill
                                        </button>
                                    )}
                                </div>
                                
                                {profile.skills && profile.skills.length > 0 ? (
                                    <div className="skills-list">
                                        {profile.skills.map((skill, index) => (
                                            <div key={index} className="skill-tag">
                                                <span>{skill}</span>
                                                {!editMode && (
                                                    <button 
                                                        onClick={() => handleDeleteSkill(skill)}
                                                        className="skill-delete-btn"
                                                        title="Remove skill"
                                                    >
                                                        ×
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="no-skills">No skills added yet. Click "Add Skill" to get started!</p>
                                )}

                                {/* Add Skill Form */}
                                {showAddSkill && (
                                    <div className="add-skill-form">
                                        <form onSubmit={handleAddSkill}>
                                            <div className="form-group">
                                                <label>Select Skill</label>
                                                <select 
                                                    value={selectedSkill}
                                                    onChange={(e) => setSelectedSkill(e.target.value)}
                                                    required
                                                    className="skill-select"
                                                >
                                                    <option value="">-- Choose a skill --</option>
                                                    {availableSkills
                                                        .filter(skill => !profile.skills.includes(skill))
                                                        .map((skill, index) => (
                                                            <option key={index} value={skill}>{skill}</option>
                                                        ))
                                                    }
                                                </select>
                                            </div>
                                            <div className="add-skill-actions">
                                                <button type="submit" className="btn-save-skill">Add</button>
                                                <button 
                                                    type="button" 
                                                    onClick={() => {
                                                        setShowAddSkill(false);
                                                        setSelectedSkill('');
                                                    }}
                                                    className="btn-cancel-skill"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}
                            </div>

                            {/* Action Buttons */}
                            <div className="profile-actions">
                                <button onClick={handleEditClick} className="btn-edit-profile">
                                    ✏️ Edit Profile
                                </button>
                                <button onClick={handleLogout} className="btn-logout-profile">
                                    🚪 Logout
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Edit Mode Form */
                        <div className="profile-edit-section">
                            <h2 className="profile-edit-title">Edit Profile</h2>
                            <form onSubmit={handleSaveEdit} className="profile-edit-form">
                                {/* Photo Upload */}
                                <div className="form-group photo-upload-group">
                                    <label>Profile Photo</label>
                                    <div className="photo-upload-container">
                                        <div className="current-photo-preview">
                                            {previewImage ? (
                                                <img src={previewImage} alt="Preview" className="preview-image" />
                                            ) : photoBase64 ? (
                                                <img src={photoBase64} alt="Current" className="preview-image" />
                                            ) : (
                                                <div className="preview-placeholder">👤</div>
                                            )}
                                        </div>
                                        <div className="photo-upload-controls">
                                            <input 
                                                type="file"
                                                id="photo-upload"
                                                accept="image/*"
                                                onChange={handleFileChange}
                                                style={{ display: 'none' }}
                                            />
                                            <label htmlFor="photo-upload" className="btn-upload-photo">
                                                📷 Choose Photo
                                            </label>
                                            {selectedFile && (
                                                <p className="file-name">{selectedFile.name}</p>
                                            )}
                                            <p className="upload-hint">Max 5MB, JPG/PNG</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>First Name *</label>
                                    <input 
                                        type="text"
                                        value={editData.fname}
                                        onChange={(e) => setEditData({...editData, fname: e.target.value})}
                                        required
                                        placeholder="Enter first name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input 
                                        type="text"
                                        value={editData.lname}
                                        onChange={(e) => setEditData({...editData, lname: e.target.value})}
                                        placeholder="Enter last name"
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <input 
                                        type="text"
                                        value={editData.phone_no}
                                        onChange={(e) => setEditData({...editData, phone_no: e.target.value})}
                                        placeholder="Enter 10-digit phone number"
                                        maxLength="10"
                                        pattern="[0-9]{10}"
                                    />
                                </div>

                                <div className="edit-actions">
                                    <button type="button" onClick={handleCancelEdit} className="btn-cancel-edit" disabled={saving}>
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn-save-edit" disabled={saving}>
                                        {saving ? 'Saving...' : '💾 Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TechnicianProfile;
