import { useState, useEffect } from "react";

const API_BASE_URL = 'http://localhost:5000/api';

function AdminSubAdmin() {
    const [showAddForm, setShowAddForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        phone: '',
        permissions: [],
        password: '',
        confirmPassword: ''
    });
    const [subAdmins, setSubAdmins] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isMainAdmin, setIsMainAdmin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePermissionChange = (permission) => {
        setFormData(prev => ({
            ...prev,
            permissions: prev.permissions.includes(permission)
                ? prev.permissions.filter(p => p !== permission)
                : [...prev.permissions, permission]
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Only check password match if password is provided (for add or if changing password in edit)
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        
        // For add form, password is required
        if (showAddForm && !formData.password) {
            alert('Password is required');
            return;
        }
        
        if (formData.permissions.length === 0) {
            alert('Please select at least one permission');
            return;
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const url = showEditForm ? `${API_BASE_URL}/admin/sub-admins/${editingId}` : `${API_BASE_URL}/admin/sub-admins`;
            const method = showEditForm ? 'PUT' : 'POST';
            
            const requestBody = {
                name: `${formData.firstName} ${formData.lastName}`,
                firstName: formData.firstName,
                lastName: formData.lastName,
                username: formData.username,
                email: formData.email,
                phone: formData.phone,
                permissions: formData.permissions
            };
            
            // Only include password if it's provided
            if (formData.password) {
                requestBody.password = formData.password;
            }
            
            const response = await fetch(url, {
                method: method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestBody)
            });
            
            const data = await response.json();
            if (data.success) {
                alert(showEditForm ? 'Sub Admin updated successfully' : 'Sub Admin created successfully');
                resetForm();
                fetchSubAdmins();
            } else {
                alert(data.message || `Error ${showEditForm ? 'updating' : 'creating'} sub admin`);
            }
        } catch (error) {
            alert(`Error ${showEditForm ? 'updating' : 'creating'} sub admin`);
        }
        setLoading(false);
    };
    
    const resetForm = () => {
        setFormData({
            firstName: '',
            lastName: '',
            username: '',
            email: '',
            phone: '',
            permissions: [],
            password: '',
            confirmPassword: ''
        });
        setShowAddForm(false);
        setShowEditForm(false);
        setEditingId(null);
    };
    
    const handleEdit = (admin) => {
        const [firstName, ...lastNameParts] = admin.name.split(' ');
        const lastName = lastNameParts.join(' ');
        
        setFormData({
            firstName: firstName || '',
            lastName: lastName || '',
            username: admin.username,
            email: admin.email,
            phone: admin.phone || '',
            permissions: admin.permissions || [],
            password: '',
            confirmPassword: ''
        });
        setEditingId(admin._id);
        setShowEditForm(true);
        setShowAddForm(false);
    };

    const fetchSubAdmins = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            
            const response = await fetch(`${API_BASE_URL}/admin/sub-admins`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.status === 401) {
                setError('Authentication failed. Please refresh the page or login again.');
                return;
            }
            
            const data = await response.json();
            
            if (data.success) {
                setSubAdmins(data.subAdmins);
                setError('');
            } else {
                setError(data.message || 'Failed to fetch sub admins');
            }
        } catch (error) {
            
            setError('Failed to connect to server');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this sub admin?')) {
            return;
        }
        
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/admin/sub-admins/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            if (data.success) {
                alert('Sub Admin deleted successfully');
                fetchSubAdmins();
            } else {
                alert(data.message || 'Error deleting sub admin');
            }
        } catch (error) {
            alert('Error deleting sub admin');
        }
    };

    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        const adminData = localStorage.getItem('adminData');
        
        if (!adminToken || !adminData) {
            window.location.href = '/';
            return;
        }
        
        setAuthChecked(true);
        fetchSubAdmins();
    }, []);



    return (
        <div className="content-admin-main admin-container" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
            <div className="container-fluid">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h2 className="fw-bold text-dark mb-0">Sub Admin Management</h2>
                </div>
                
                {error && (
                    <div className="alert alert-danger rounded-3 shadow-sm">
                        <i className="fa fa-exclamation-triangle me-2"></i>
                        {error}
                    </div>
                )}

                <div className="card border-0 shadow-sm rounded-4">
                    <div className="card-body p-4">
                        {!showAddForm && !showEditForm ? (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-semibold text-dark mb-0">Sub Admins List</h4>
                                    <button 
                                        className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold"
                                        style={{ backgroundColor: 'transparent', borderColor: '#ff6b35', color: '#ff6b35' }}
                                        onClick={() => {
                                            resetForm();
                                            setShowAddForm(true);
                                        }}
                                    >
                                        <i className="fa fa-plus me-2"></i>
                                        Add New Sub Admin
                                    </button>
                                </div>
                                
                                <div className="table-container">
                                    <table className="table emp-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th>Username</th>
                                                <th>Email</th>
                                                <th>Permissions</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subAdmins.length > 0 ? (
                                                subAdmins.map((admin) => (
                                                    <tr key={admin._id}>
                                                        <td>
                                                            <span className="company-name">{admin.name}</span>
                                                        </td>
                                                        <td style={{fontFamily: 'monospace', fontSize: '0.85rem'}}>{admin.username}</td>
                                                        <td style={{fontFamily: 'monospace', fontSize: '0.85rem'}}>{admin.email}</td>
                                                        <td style={{fontSize: '0.85rem'}}>
                                                            {admin.permissions.map((permission, index) => (
                                                                <span key={index}>
                                                                    {permission.replace('_', ' ')}{index < admin.permissions.length - 1 ? ', ' : ''}
                                                                </span>
                                                            ))}
                                                        </td>
                                                        <td>
                                                            <div className="action-buttons">
                                                                <button 
                                                                    className="action-btn"
                                                                    onClick={() => handleEdit(admin)}
                                                                    style={{ minWidth: '140px', maxWidth: '140px', width: '140px' }}
                                                                >
                                                                    <i className="fa fa-edit"></i>
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    className="action-btn"
                                                                    onClick={() => handleDelete(admin._id)}
                                                                    style={{ minWidth: '140px', maxWidth: '140px', width: '140px' }}
                                                                >
                                                                    <i className="fa fa-trash"></i>
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center">
                                                        No sub admins found
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className="d-flex justify-content-between align-items-center mb-4">
                                    <h4 className="fw-semibold text-dark mb-0">
                                        <i className={`fa ${showEditForm ? 'fa-edit' : 'fa-plus'} me-2`} style={{ color: '#fd7e14' }}></i>
                                        {showEditForm ? 'Edit Sub Admin' : 'Add New Sub Admin'}
                                    </h4>
                                    <button 
                                        className="btn btn-outline-secondary rounded-pill px-4"
                                        onClick={resetForm}
                                    >
                                        <i className="fa fa-arrow-left me-2"></i>
                                        Back to List
                                    </button>
                                </div>
                                
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <input
                                                className="form-control rounded-3"
                                                name="firstName"
                                                type="text"
                                                placeholder="First Name *"
                                                value={formData.firstName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <input
                                                className="form-control rounded-3"
                                                name="lastName"
                                                type="text"
                                                placeholder="Last Name *"
                                                value={formData.lastName}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <input
                                                className="form-control rounded-3"
                                                name="username"
                                                type="text"
                                                placeholder="Username *"
                                                value={formData.username}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-md-6">
                                            <input
                                                className="form-control rounded-3"
                                                name="email"
                                                type="email"
                                                placeholder="Email Address *"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-12">
                                            <input
                                                className="form-control rounded-3"
                                                name="phone"
                                                type="tel"
                                                placeholder="Phone Number *"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                                required
                                            />
                                        </div>

                                        <div className="col-12 mt-4">
                                            <label className="form-label fw-semibold text-dark mb-3">Permissions *</label>
                                            <div className="row g-3">
                                                <div className="col-md-4">
                                                    <div className="card border-2 h-100" style={{ cursor: 'pointer', borderColor: formData.permissions.includes('employers') ? '#fd7e14' : '#dee2e6' }}>
                                                        <div className="card-body text-center p-3">
                                                            <input
                                                                className="form-check-input d-none"
                                                                type="checkbox"
                                                                id="employers"
                                                                checked={formData.permissions.includes('employers')}
                                                                onChange={() => handlePermissionChange('employers')}
                                                            />
                                                            <label className="form-check-label w-100 h-100 d-flex flex-column align-items-center justify-content-center" htmlFor="employers" style={{ cursor: 'pointer' }}>
                                                                <i className="fa fa-building fa-2x mb-2" style={{ color: formData.permissions.includes('employers') ? '#fd7e14' : '#6c757d' }}></i>
                                                                <span className="fw-medium">Employers</span>
                                                                <small className="text-muted">Manage employer accounts</small>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="card border-2 h-100" style={{ cursor: 'pointer', borderColor: formData.permissions.includes('placement_officers') ? '#fd7e14' : '#dee2e6' }}>
                                                        <div className="card-body text-center p-3">
                                                            <input
                                                                className="form-check-input d-none"
                                                                type="checkbox"
                                                                id="placement_officers"
                                                                checked={formData.permissions.includes('placement_officers')}
                                                                onChange={() => handlePermissionChange('placement_officers')}
                                                            />
                                                            <label className="form-check-label w-100 h-100 d-flex flex-column align-items-center justify-content-center" htmlFor="placement_officers" style={{ cursor: 'pointer' }}>
                                                                <i className="fa fa-graduation-cap fa-2x mb-2" style={{ color: formData.permissions.includes('placement_officers') ? '#fd7e14' : '#6c757d' }}></i>
                                                                <span className="fw-medium">Placement Officers</span>
                                                                <small className="text-muted">Manage placement officers</small>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="card border-2 h-100" style={{ cursor: 'pointer', borderColor: formData.permissions.includes('registered_candidates') ? '#fd7e14' : '#dee2e6' }}>
                                                        <div className="card-body text-center p-3">
                                                            <input
                                                                className="form-check-input d-none"
                                                                type="checkbox"
                                                                id="registered_candidates"
                                                                checked={formData.permissions.includes('registered_candidates')}
                                                                onChange={() => handlePermissionChange('registered_candidates')}
                                                            />
                                                            <label className="form-check-label w-100 h-100 d-flex flex-column align-items-center justify-content-center" htmlFor="registered_candidates" style={{ cursor: 'pointer' }}>
                                                                <i className="fa fa-users fa-2x mb-2" style={{ color: formData.permissions.includes('registered_candidates') ? '#fd7e14' : '#6c757d' }}></i>
                                                                <span className="fw-medium">Registered Candidates</span>
                                                                <small className="text-muted">Manage candidate accounts</small>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6" style={{ position: 'relative' }}>
                                            <input
                                                className="form-control rounded-3"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                placeholder={showAddForm ? "Password *" : "Password (Leave blank to keep current)"}
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                required={showAddForm}
                                                style={{ paddingRight: '45px' }}
                                            />
                                            <span
                                                onClick={() => setShowPassword(!showPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    cursor: 'pointer',
                                                    fontSize: '16px',
                                                    color: '#666'
                                                }}
                                            >
                                                {showPassword ? '👁️' : '👁️🗨️'}
                                            </span>
                                        </div>

                                        <div className="col-md-6" style={{ position: 'relative' }}>
                                            <input
                                                className="form-control rounded-3"
                                                name="confirmPassword"
                                                type={showConfirmPassword ? "text" : "password"}
                                                placeholder={showAddForm ? "Confirm Password *" : "Confirm Password"}
                                                value={formData.confirmPassword}
                                                onChange={handleInputChange}
                                                required={showAddForm}
                                                style={{ paddingRight: '45px' }}
                                            />
                                            <span
                                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                style={{
                                                    position: 'absolute',
                                                    right: '15px',
                                                    top: '50%',
                                                    transform: 'translateY(-50%)',
                                                    cursor: 'pointer',
                                                    fontSize: '16px',
                                                    color: '#666'
                                                }}
                                            >
                                                {showConfirmPassword ? '👁️' : '👁️🗨️'}
                                            </span>
                                        </div>

                                        <div className="col-12">
                                            <div className="d-flex gap-3 pt-3">
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-outline-primary rounded-pill px-4 py-2 fw-semibold"
                                                    style={{ backgroundColor: 'transparent', borderColor: '#ff6b35', color: '#ff6b35' }}
                                                    disabled={loading}
                                                >
                                                    {loading ? (
                                                        <>
                                                            <i className="fa fa-spinner fa-spin me-2"></i>
                                                            {showEditForm ? 'Updating...' : 'Adding...'}
                                                        </>
                                                    ) : (
                                                        <>
                                                            <i className={`fa ${showEditForm ? 'fa-save' : 'fa-plus'} me-2`}></i>
                                                            {showEditForm ? 'Update Sub Admin' : 'Add Sub Admin'}
                                                        </>
                                                    )}
                                                </button>
                                                <button 
                                                    type="button" 
                                                    className="btn btn-outline-secondary rounded-pill px-4 py-2"
                                                    onClick={resetForm}
                                                >
                                                    <i className="fa fa-times me-2"></i>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminSubAdmin;
