import React, { useState, useEffect } from "react";
import { api } from "../../../../../utils/api";

const LocationDropdown = ({ value, onChange, onBlur, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const indianCities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
        'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
        'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
        'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
        'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad',
        'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
        'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad'
    ];
    
    const filteredCities = indianCities.filter(city => {
        const cityLower = city.toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        // Match if city starts with search term or any word in city starts with search term
        return cityLower.startsWith(searchLower) || 
               cityLower.split(/[\s-]/).some(word => word.startsWith(searchLower));
    });
    
    const handleSelect = (city) => {
        onChange(city);
        setSearchTerm('');
        setIsOpen(false);
    };
    
    const handleInputChange = (e) => {
        const inputValue = e.target.value;
        setSearchTerm(inputValue);
        onChange(inputValue);
        setIsOpen(true);
    };
    
    return (
        <div className="location-dropdown-container position-relative">
            <input
                className={`form-control ${className}`}
                type="text"
                value={searchTerm || value}
                onChange={handleInputChange}
                onFocus={() => setIsOpen(true)}
                onBlur={(e) => {
                    setTimeout(() => {
                        setIsOpen(false);
                        onBlur && onBlur(e);
                    }, 200);
                }}
                placeholder="Type to search or select location"
                autoComplete="off"
            />
            {isOpen && filteredCities.length > 0 && (
                <div className="dropdown-menu show w-100">
                    {filteredCities.slice(0, 10).map(city => (
                        <button
                            key={city}
                            type="button"
                            className="dropdown-item"
                            onClick={() => handleSelect(city)}
                            onMouseDown={(e) => e.preventDefault()}
                        >
                            {city}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};


function SectionCandicateBasicInfo() {
    const [formData, setFormData] = useState({
        name: '',
        middleName: '',
        lastName: '',
        phone: '',
        email: '',
        location: '',
        profilePicture: null,
        idCard: null
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [currentProfilePicture, setCurrentProfilePicture] = useState(null);
    const [idCardPreview, setIdCardPreview] = useState(null);
    const [currentIdCard, setCurrentIdCard] = useState(null);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [notification, setNotification] = useState(null);

    useEffect(() => {
        fetchProfile();
    }, []);
    
    useEffect(() => {
        if (notification && notification.type === 'success') {
            const timer = setTimeout(() => setNotification(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [notification]);

    const fetchProfile = async () => {
        try {
            const token = localStorage.getItem('candidateToken');
            if (!token) {
                setNotification({ type: 'error', message: 'Please log in to access your profile.' });
                setTimeout(() => window.location.href = '/login', 2000);
                return;
            }
            
            // Check if backend server is running
            try {
                await fetch('http://localhost:5000/health');
            } catch (serverError) {
                setNotification({ type: 'error', message: 'Backend server is not running. Please start the server.' });
                return;
            }
            
            const response = await api.getCandidateProfile();
            console.log('Profile response:', response);
            
            if (response.success && response.profile) {
                const profile = response.profile;
                const candidate = profile.candidateId || {};
                
                setFormData({
                    name: candidate.name || '',
                    middleName: profile.middleName || '',
                    lastName: profile.lastName || '',
                    phone: candidate.phone || '',
                    email: candidate.email || '',
                    location: profile.location || '',
                    profilePicture: null
                });
                setErrors({});
                setTouched({});
                setCurrentProfilePicture(profile.profilePicture);
                setCurrentIdCard(profile.idCard);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            if (error.message && error.message.includes('401')) {
                setNotification({ type: 'error', message: 'Please log in to access your profile.' });
                setTimeout(() => window.location.href = '/login', 2000);
            }
        } finally {
            setLoading(false);
        }
    };

    const validateField = (name, value) => {
        const newErrors = { ...errors };
        
        switch (name) {
            case 'name':
                if (!value || !value.trim()) {
                    newErrors.name = 'This field is required';
                } else if (value.length < 2 || value.length > 50) {
                    newErrors.name = 'Name must be between 2 and 50 characters';
                } else if (!/^[a-zA-Z\s]+$/.test(value)) {
                    newErrors.name = 'Name can only contain letters and spaces';
                } else {
                    delete newErrors.name;
                }
                break;
            
            case 'middleName':
                if (!value || !value.trim()) {
                    newErrors.middleName = 'Middle name is required';
                } else if (value.length > 30) {
                    newErrors.middleName = 'Middle name cannot exceed 30 characters';
                } else if (!/^[a-zA-Z\s]*$/.test(value)) {
                    newErrors.middleName = 'Middle name can only contain letters and spaces';
                } else {
                    delete newErrors.middleName;
                }
                break;
            
            case 'lastName':
                if (!value || !value.trim()) {
                    newErrors.lastName = 'Last name is required';
                } else if (value.length > 30) {
                    newErrors.lastName = 'Last name cannot exceed 30 characters';
                } else if (!/^[a-zA-Z\s]*$/.test(value)) {
                    newErrors.lastName = 'Last name can only contain letters and spaces';
                } else {
                    delete newErrors.lastName;
                }
                break;
            
            case 'phone':
                if (!value || !value.trim()) {
                    newErrors.phone = 'Mobile number is required';
                } else if (!/^[6-9]\d{9}$/.test(value)) {
                    newErrors.phone = 'Mobile number must be 10 digits starting with 6-9';
                } else {
                    delete newErrors.phone;
                }
                break;
            
            case 'email':
                if (!value || !value.trim()) {
                    newErrors.email = 'This field is required';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    newErrors.email = 'Please provide a valid email address';
                } else {
                    delete newErrors.email;
                }
                break;
            
            case 'location':
                if (!value || !value.trim()) {
                    newErrors.location = 'Location is required';
                } else if (value.length > 100) {
                    newErrors.location = 'Location cannot exceed 100 characters';
                } else if (!/^[a-zA-Z0-9\s,.-]*$/.test(value)) {
                    newErrors.location = 'Location contains invalid characters';
                } else {
                    delete newErrors.location;
                }
                break;
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Validate field if it has been touched
        if (touched[name]) {
            validateField(name, value);
        }
    };

    const handleBlur = (e) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        validateField(name, value);
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setNotification({ type: 'error', message: 'File size must be less than 5MB' });
                e.target.value = '';
                return;
            }
            
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
            if (!allowedTypes.includes(file.type)) {
                setNotification({ type: 'error', message: 'Please upload only JPG, PNG or GIF files' });
                e.target.value = '';
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                profilePicture: file
            }));
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleIdCardChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB max)
            if (file.size > 5 * 1024 * 1024) {
                setNotification({ type: 'error', message: 'File size must be less than 5MB' });
                e.target.value = '';
                return;
            }
            
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                setNotification({ type: 'error', message: 'Please upload only JPG, PNG, GIF or PDF files' });
                e.target.value = '';
                return;
            }
            
            setFormData(prev => ({
                ...prev,
                idCard: file
            }));
            
            // Create preview URL for images only
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setIdCardPreview(reader.result);
                };
                reader.readAsDataURL(file);
            } else {
                setIdCardPreview(null);
            }
        }
    };

    const validateForm = () => {
        const fieldsToValidate = ['name', 'email', 'middleName', 'lastName', 'phone', 'location'];
        let isValid = true;
        
        fieldsToValidate.forEach(field => {
            const fieldValid = validateField(field, formData[field]);
            if (!fieldValid) isValid = false;
        });
        
        // Mark all fields as touched
        const allTouched = {};
        fieldsToValidate.forEach(field => {
            allTouched[field] = true;
        });
        setTouched(allTouched);
        
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setNotification({ type: 'error', message: 'Please fix the validation errors before submitting.' });
            return;
        }
        
        setSaving(true);
        
        try {
            const submitData = new FormData();
            submitData.append('name', formData.name.trim());
            submitData.append('middleName', formData.middleName.trim());
            submitData.append('lastName', formData.lastName.trim());
            submitData.append('phone', formData.phone.trim());
            submitData.append('email', formData.email.trim());
            submitData.append('location', formData.location.trim());
            if (formData.profilePicture) {
                submitData.append('profilePicture', formData.profilePicture);
            }
            if (formData.idCard) {
                submitData.append('idCard', formData.idCard);
            }
            
            console.log('Form data being sent:', formData);
            
            const response = await api.updateCandidateProfile(submitData);
            console.log('API response:', response);
            if (response.success) {
                setNotification({ type: 'success', message: 'Profile updated successfully!' });
                setTimeout(() => setNotification(null), 3000);
                fetchProfile();
                setImagePreview(null);
                setIdCardPreview(null);
                window.dispatchEvent(new Event('profileUpdated'));
            } else {
                if (response.errors && Array.isArray(response.errors)) {
                    const errorMessages = response.errors.map(err => err.msg).join(', ');
                    setNotification({ type: 'error', message: `Validation errors: ${errorMessages}` });
                } else {
                    setNotification({ type: 'error', message: `Failed to update profile: ${response.message || 'Unknown error'}` });
                }
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            if (error.response?.status === 401) {
                setNotification({ type: 'error', message: 'Please log in to update your profile.' });
                setTimeout(() => window.location.href = '/login', 2000);
                return;
            } else if (error.response?.data?.errors) {
                const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
                setNotification({ type: 'error', message: `Validation errors: ${errorMessages}` });
            } else {
                setNotification({ type: 'error', message: `Error updating profile: ${error.message}` });
            }
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="panel panel-default">
                <div className="panel-body p-a20 text-center">
                    Loading profile...
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit}>
            <div className="panel panel-default">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0" style={{color: '#232323'}}>
                        <i className="fa fa-info-circle me-2" style={{color: '#ff6b35'}}></i>
                        Basic Information
                    </h4>
                </div>
                {notification && (
                    <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} alert-dismissible mx-3 mt-3`}>
                        <i className="fa fa-info-circle me-2" style={{color: '#ff6b35'}}></i>
                        {notification.message}
                        <button type="button" className="btn-close" onClick={() => setNotification(null)}></button>
                    </div>
                )}
                <div className="panel-body wt-panel-body p-a20 m-b30">
                    {/* Profile Picture Section */}
                    <div className="row mb-4">
                        <div className="col-md-12">
                            <div className="profile-picture-section text-center">
                                <label className="form-label fw-bold mb-3">
                                    <i className="fa fa-camera me-2" style={{color: '#ff6b35'}}></i>
                                    Profile Picture
                                </label>
                                <div className="mb-3">
                                    {imagePreview ? (
                                        <img 
                                            src={imagePreview} 
                                            alt="Preview" 
                                            className="profile-image-preview rounded-circle"
                                            style={{width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #ff6b35'}}
                                        />
                                    ) : currentProfilePicture ? (
                                        <img 
                                            src={currentProfilePicture} 
                                            alt="Current Profile" 
                                            className="profile-image-preview rounded-circle"
                                            style={{width: '120px', height: '120px', objectFit: 'cover', border: '3px solid #ff6b35'}}
                                        />
                                    ) : (
                                        <div className="profile-placeholder rounded-circle d-flex align-items-center justify-content-center" 
                                             style={{width: '120px', height: '120px', backgroundColor: '#f8f9fa', border: '3px dashed #dee2e6', margin: '0 auto'}}>
                                            <i className="fa fa-user fa-3x text-muted"></i>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    className="form-control mx-auto" 
                                    type="file" 
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    style={{maxWidth: '300px'}}
                                />
                                <small className="text-muted mt-2 d-block">Upload JPG, PNG or GIF (Max 5MB)</small>
                            </div>
                        </div>
                    </div>

                    {/* ID Card Section */}
                    <div className="row mb-4">
                        <div className="col-md-12">
                            <div className="id-card-section text-center">
                                <label className="form-label fw-bold mb-3">
                                    <i className="fa fa-id-card me-2" style={{color: '#ff6b35'}}></i>
                                    ID Card (Optional)
                                </label>
                                <div className="mb-3">
                                    {idCardPreview ? (
                                        <img 
                                            src={idCardPreview} 
                                            alt="ID Card Preview" 
                                            className="id-card-preview"
                                            style={{maxWidth: '300px', maxHeight: '200px', objectFit: 'contain', border: '2px solid #ff6b35', borderRadius: '8px'}}
                                        />
                                    ) : currentIdCard ? (
                                        currentIdCard.startsWith('data:image') ? (
                                            <img 
                                                src={currentIdCard} 
                                                alt="Current ID Card" 
                                                className="id-card-preview"
                                                style={{maxWidth: '300px', maxHeight: '200px', objectFit: 'contain', border: '2px solid #ff6b35', borderRadius: '8px'}}
                                            />
                                        ) : (
                                            <div className="id-card-placeholder d-flex align-items-center justify-content-center" 
                                                 style={{width: '300px', height: '200px', backgroundColor: '#f8f9fa', border: '2px solid #ff6b35', borderRadius: '8px', margin: '0 auto'}}>
                                                <div className="text-center">
                                                    <i className="fa fa-file-pdf-o fa-3x text-muted mb-2"></i>
                                                    <p className="text-muted mb-0">PDF ID Card Uploaded</p>
                                                </div>
                                            </div>
                                        )
                                    ) : (
                                        <div className="id-card-placeholder d-flex align-items-center justify-content-center" 
                                             style={{width: '300px', height: '200px', backgroundColor: '#f8f9fa', border: '2px dashed #dee2e6', borderRadius: '8px', margin: '0 auto'}}>
                                            <div className="text-center">
                                                <i className="fa fa-id-card fa-3x text-muted mb-2"></i>
                                                <p className="text-muted mb-0">No ID Card Uploaded</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <input 
                                    className="form-control mx-auto" 
                                    type="file" 
                                    accept="image/*,application/pdf"
                                    onChange={handleIdCardChange}
                                    style={{maxWidth: '300px'}}
                                />
                                <small className="text-muted mt-2 d-block">Upload JPG, PNG, GIF or PDF (Max 5MB)</small>
                            </div>
                        </div>
                    </div>

                    <hr className="my-4" />

                    {/* Personal Information */}
                    <div className="row mb-4">
                        <div className="col-md-4 mb-3">
                            <label className="form-label"><i className="fa fa-user me-2" style={{color: '#ff6b35'}}></i>First Name *</label>
                            <input
                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="Enter your complete name"
                                required
                            />
                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label"><i className="fa fa-user me-2" style={{color: '#ff6b35'}}></i>Middle Name *</label>
                            <input
                                className={`form-control ${errors.middleName ? 'is-invalid' : ''}`}
                                type="text"
                                name="middleName"
                                value={formData.middleName}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="Middle name"
                                required
                            />
                            {errors.middleName && <div className="invalid-feedback">{errors.middleName}</div>}
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label"><i className="fa fa-user me-2" style={{color: '#ff6b35'}}></i>Last Name *</label>
                            <input
                                className={`form-control ${errors.lastName ? 'is-invalid' : ''}`}
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="Last name"
                                required
                            />
                            {errors.lastName && <div className="invalid-feedback">{errors.lastName}</div>}
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label"><i className="fa fa-phone me-2" style={{color: '#ff6b35'}}></i>Mobile Number *</label>
                            <input
                                className={`form-control ${errors.phone ? 'is-invalid' : ''}`}
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="Enter 10-digit mobile number"
                                maxLength="10"
                                required
                            />
                            {errors.phone && <div className="invalid-feedback">{errors.phone}</div>}
                            <small className="text-muted">Enter 10-digit Indian mobile number (starting with 6-9)</small>
                        </div>
                        <div className="col-md-4 mb-3">
                            <label className="form-label"><i className="fa fa-envelope me-2" style={{color: '#ff6b35'}}></i>Email Address *</label>
                            <input
                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                onBlur={handleBlur}
                                placeholder="Enter email address"
                                required
                            />
                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                        </div>
                        <div className="col-md-4 mb-3" style={{position: 'relative', zIndex: 10}}>
                            <label className="form-label"><i className="fa fa-map-marker me-2" style={{color: '#ff6b35'}}></i>Location *</label>
                            <LocationDropdown 
                                value={formData.location}
                                onChange={(value) => {
                                    setFormData(prev => ({ ...prev, location: value }));
                                    if (touched.location) {
                                        validateField('location', value);
                                    }
                                }}
                                onBlur={() => {
                                    setTouched(prev => ({ ...prev, location: true }));
                                    validateField('location', formData.location);
                                }}
                                className={`${errors.location ? 'is-invalid' : ''}`}
                            />
                            {errors.location && <div className="invalid-feedback">{errors.location}</div>}
                        </div>
                    </div>

                    <div className="text-center mt-4">
                        <button 
                            type="submit" 
                            className="btn btn-primary btn-lg px-5"
                            disabled={saving || Object.keys(errors).length > 0}
                            style={{backgroundColor: '#ff6b35', borderColor: '#ff6b35'}}
                        >
                            <i className={`fa ${saving ? 'fa-spinner fa-spin' : 'fa-save'} me-2`}></i>
                            {saving ? 'Saving Profile...' : 'Save Profile'}
                        </button>

                    </div>
                </div>
            </div>
        </form>
    );
}

export default SectionCandicateBasicInfo;