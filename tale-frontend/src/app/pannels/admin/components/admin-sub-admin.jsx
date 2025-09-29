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
            console.log('Token:', token);
            console.log('Fetching from:', `${API_BASE_URL}/admin/sub-admins`);
            
            const response = await fetch(`${API_BASE_URL}/admin/sub-admins`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            console.log('Response status:', response.status);
            
            if (response.status === 401) {
                setError('Authentication failed. Please login again.');
                return;
            }
            
            const data = await response.json();
            console.log('Response data:', data);
            
            if (data.success) {
                setSubAdmins(data.subAdmins);
                setError('');
            } else {
                setError(data.message || 'Failed to fetch sub admins');
            }
        } catch (error) {
            console.error('Error fetching sub admins:', error);
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
        // Check if user is main admin
        const adminData = localStorage.getItem('adminData');
        const subAdminData = localStorage.getItem('subAdminData');
        
        if (subAdminData) {
            setIsMainAdmin(false);
            setError('Only main administrators can manage sub-admins.');
        } else if (adminData) {
            setIsMainAdmin(true);
            fetchSubAdmins();
        } else {
            setError('Please login as an administrator.');
        }
    }, []);

    if (!isMainAdmin) {
        return (
            <div className="content-admin-main">
                <div className="wt-admin-right-page-header">
                    <h2>Sub Admin Management</h2>
                </div>
                <div className="alert alert-warning">
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="content-admin-main" style={{ backgroundColor: '#f8f9fa', minHeight: '100vh', padding: '20px' }}>
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
                                        className="btn btn-primary rounded-pill px-4 py-2 fw-semibold"
                                        style={{ backgroundColor: '#ff5a1f', border: 'none' }}
                                        onClick={() => {
                                            resetForm();
                                            setShowAddForm(true);
                                        }}
                                    >
                                        <i className="fa fa-plus me-2"></i>
                                        Add New Sub Admin
                                    </button>
                                </div>
                                
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle">
                                        <thead className="table-light">
                                            <tr>
                                                <th className="fw-semibold text-dark border-0 py-3">Name</th>
                                                <th className="fw-semibold text-dark border-0 py-3">Username</th>
                                                <th className="fw-semibold text-dark border-0 py-3">Email</th>
                                                <th className="fw-semibold text-dark border-0 py-3">Permissions</th>
                                                <th className="fw-semibold text-dark border-0 py-3 text-center">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {subAdmins.length > 0 ? (
                                                subAdmins.map((admin) => (
                                                    <tr key={admin._id} className="border-bottom">
                                                        <td className="py-3">
                                                            <div className="d-flex align-items-center">
                                                                <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-3" 
                                                                     style={{ width: '40px', height: '40px', backgroundColor: '#ff5a1f' }}>
                                                                    <i className="fa fa-user text-white"></i>
                                                                </div>
                                                                <span className="fw-medium">{admin.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-muted">{admin.username}</td>
                                                        <td className="py-3 text-muted">{admin.email}</td>
                                                        <td className="py-3">
                                                            <div className="d-flex flex-wrap gap-1">
                                                                {admin.permissions.map((permission, index) => (
                                                                    <span key={index} className="badge bg-light text-dark rounded-pill px-2 py-1 small">
                                                                        {permission.replace('_', ' ')}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </td>
                                                        <td className="py-3 text-center">
                                                            <div className="btn-group" role="group">
                                                                <button 
                                                                    className="btn btn-outline-primary btn-sm rounded-pill me-2"
                                                                    onClick={() => handleEdit(admin)}
                                                                    title="Edit Sub Admin"
                                                                >
                                                                    <i className="fa fa-edit me-1"></i>
                                                                    Edit
                                                                </button>
                                                                <button 
                                                                    className="btn btn-outline-danger btn-sm rounded-pill"
                                                                    onClick={() => handleDelete(admin._id)}
                                                                    title="Delete Sub Admin"
                                                                >
                                                                    <i className="fa fa-trash me-1"></i>
                                                                    Delete
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="5" className="text-center py-5 text-muted">
                                                        <i className="fa fa-users fa-3x mb-3 text-muted opacity-50"></i>
                                                        <div>No sub admins found</div>
                                                        <small>Click "Add New Sub Admin" to create your first sub admin</small>
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
                                        <i className={`fa ${showEditForm ? 'fa-edit' : 'fa-plus'} me-2`} style={{ color: '#ff5a1f' }}></i>
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
                                            <div className="form-floating">
                                                <input
                                                    className="form-control rounded-3"
                                                    name="firstName"
                                                    type="text"
                                                    placeholder="First Name"
                                                    value={formData.firstName}
                                                    onChange={handleInputChange}
                                                    required
                                                    id="firstName"
                                                />
                                                <label htmlFor="firstName">First Name *</label>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    className="form-control rounded-3"
                                                    name="lastName"
                                                    type="text"
                                                    placeholder="Last Name"
                                                    value={formData.lastName}
                                                    onChange={handleInputChange}
                                                    required
                                                    id="lastName"
                                                />
                                                <label htmlFor="lastName">Last Name *</label>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    className="form-control rounded-3"
                                                    name="username"
                                                    type="text"
                                                    placeholder="Username"
                                                    value={formData.username}
                                                    onChange={handleInputChange}
                                                    required
                                                    id="username"
                                                />
                                                <label htmlFor="username">Username *</label>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    className="form-control rounded-3"
                                                    name="email"
                                                    type="email"
                                                    placeholder="Email"
                                                    value={formData.email}
                                                    onChange={handleInputChange}
                                                    required
                                                    id="email"
                                                />
                                                <label htmlFor="email">Email Address *</label>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    className="form-control rounded-3"
                                                    name="phone"
                                                    type="tel"
                                                    placeholder="Phone"
                                                    value={formData.phone}
                                                    onChange={handleInputChange}
                                                    required
                                                    id="phone"
                                                />
                                                <label htmlFor="phone">Phone Number *</label>
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <label className="form-label fw-semibold text-dark mb-3">Permissions *</label>
                                            <div className="row g-3">
                                                <div className="col-md-4">
                                                    <div className="card border-2 h-100" style={{ cursor: 'pointer', borderColor: formData.permissions.includes('employers') ? '#ff5a1f' : '#dee2e6' }}>
                                                        <div className="card-body text-center p-3">
                                                            <input
                                                                className="form-check-input d-none"
                                                                type="checkbox"
                                                                id="employers"
                                                                checked={formData.permissions.includes('employers')}
                                                                onChange={() => handlePermissionChange('employers')}
                                                            />
                                                            <label className="form-check-label w-100 h-100 d-flex flex-column align-items-center justify-content-center" htmlFor="employers" style={{ cursor: 'pointer' }}>
                                                                <i className="fa fa-building fa-2x mb-2" style={{ color: formData.permissions.includes('employers') ? '#ff5a1f' : '#6c757d' }}></i>
                                                                <span className="fw-medium">Employers</span>
                                                                <small className="text-muted">Manage employer accounts</small>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="card border-2 h-100" style={{ cursor: 'pointer', borderColor: formData.permissions.includes('placement_officers') ? '#ff5a1f' : '#dee2e6' }}>
                                                        <div className="card-body text-center p-3">
                                                            <input
                                                                className="form-check-input d-none"
                                                                type="checkbox"
                                                                id="placement_officers"
                                                                checked={formData.permissions.includes('placement_officers')}
                                                                onChange={() => handlePermissionChange('placement_officers')}
                                                            />
                                                            <label className="form-check-label w-100 h-100 d-flex flex-column align-items-center justify-content-center" htmlFor="placement_officers" style={{ cursor: 'pointer' }}>
                                                                <i className="fa fa-graduation-cap fa-2x mb-2" style={{ color: formData.permissions.includes('placement_officers') ? '#ff5a1f' : '#6c757d' }}></i>
                                                                <span className="fw-medium">Placement Officers</span>
                                                                <small className="text-muted">Manage placement officers</small>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="col-md-4">
                                                    <div className="card border-2 h-100" style={{ cursor: 'pointer', borderColor: formData.permissions.includes('registered_candidates') ? '#ff5a1f' : '#dee2e6' }}>
                                                        <div className="card-body text-center p-3">
                                                            <input
                                                                className="form-check-input d-none"
                                                                type="checkbox"
                                                                id="registered_candidates"
                                                                checked={formData.permissions.includes('registered_candidates')}
                                                                onChange={() => handlePermissionChange('registered_candidates')}
                                                            />
                                                            <label className="form-check-label w-100 h-100 d-flex flex-column align-items-center justify-content-center" htmlFor="registered_candidates" style={{ cursor: 'pointer' }}>
                                                                <i className="fa fa-users fa-2x mb-2" style={{ color: formData.permissions.includes('registered_candidates') ? '#ff5a1f' : '#6c757d' }}></i>
                                                                <span className="fw-medium">Registered Candidates</span>
                                                                <small className="text-muted">Manage candidate accounts</small>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    className="form-control rounded-3"
                                                    name="password"
                                                    type="password"
                                                    placeholder="Password"
                                                    value={formData.password}
                                                    onChange={handleInputChange}
                                                    required={showAddForm}
                                                    id="password"
                                                />
                                                <label htmlFor="password">
                                                    Password {showAddForm ? '*' : '(Leave blank to keep current)'}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-md-6">
                                            <div className="form-floating">
                                                <input
                                                    className="form-control rounded-3"
                                                    name="confirmPassword"
                                                    type="password"
                                                    placeholder="Confirm Password"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    required={showAddForm}
                                                    id="confirmPassword"
                                                />
                                                <label htmlFor="confirmPassword">
                                                    Confirm Password {showAddForm ? '*' : ''}
                                                </label>
                                            </div>
                                        </div>

                                        <div className="col-12">
                                            <div className="d-flex gap-3 pt-3">
                                                <button 
                                                    type="submit" 
                                                    className="btn btn-primary rounded-pill px-4 py-2 fw-semibold"
                                                    style={{ backgroundColor: '#ff5a1f', border: 'none' }}
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