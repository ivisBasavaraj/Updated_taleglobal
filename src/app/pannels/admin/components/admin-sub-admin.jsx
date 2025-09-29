import { useState, useEffect } from "react";

const API_BASE_URL = 'http://localhost:5000/api';

function AdminSubAdmin() {
    const [showAddForm, setShowAddForm] = useState(false);
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
        if (formData.password !== formData.confirmPassword) {
            alert('Passwords do not match');
            return;
        }
        if (formData.permissions.length === 0) {
            alert('Please select at least one permission');
            return;
        }
        
        setLoading(true);
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`${API_BASE_URL}/admin/sub-admins`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    name: `${formData.firstName} ${formData.lastName}`,
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    username: formData.username,
                    email: formData.email,
                    phone: formData.phone,
                    permissions: formData.permissions,
                    password: formData.password
                })
            });
            
            const data = await response.json();
            if (data.success) {
                alert('Sub Admin created successfully');
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
                fetchSubAdmins();
            } else {
                alert(data.message || 'Error creating sub admin');
            }
        } catch (error) {
            alert('Error creating sub admin');
        }
        setLoading(false);
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
        <div className="content-admin-main">
            <div className="wt-admin-right-page-header">
                <h2>Sub Admin Management</h2>
            </div>
            
            {error && (
                <div className="alert alert-danger">
                    {error}
                </div>
            )}

            <div className="twm-tabs-style-2">
                <div className="row">
                    <div className="col-xl-12 col-lg-12 col-md-12">
                        <div className="panel panel-default">
                            <div className="panel-body wt-panel-body p-a25">
                                {!showAddForm ? (
                                    <div>
                                        <div className="twm-D_table-responsive">
                                            <div className="d-flex justify-content-between align-items-center mb-3">
                                                <h4>Sub Admins List</h4>
                                                <button 
                                                    className="site-button"
                                                    onClick={() => setShowAddForm(true)}
                                                >
                                                    Add New Sub Admin
                                                </button>
                                            </div>
                                            <table className="table table-striped table-bordered twm-bookmark-list-wrap">
                                                <thead>
                                                    <tr>
                                                        <th>Name</th>
                                                        <th>Username</th>
                                                        <th>Email</th>
                                                        <th>Role</th>
                                                        <th>Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {subAdmins.length > 0 ? (
                                                        subAdmins.map((admin) => (
                                                            <tr key={admin._id}>
                                                                <td>{admin.name}</td>
                                                                <td>{admin.username}</td>
                                                                <td>{admin.email}</td>
                                                                <td>{admin.permissions.join(', ')}</td>
                                                                <td>
                                                                    <button 
                                                                        className="btn btn-sm btn-danger"
                                                                        onClick={() => handleDelete(admin._id)}
                                                                    >
                                                                        Delete
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan="5" className="text-center">No sub admins found</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div>
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h4>Add New Sub Admin</h4>
                                            <button 
                                                className="site-button-secondry"
                                                onClick={() => setShowAddForm(false)}
                                            >
                                                Back to List
                                            </button>
                                        </div>
                                        
                                        <form onSubmit={handleSubmit}>
                                            <div className="row">
                                                <div className="col-xl-6 col-lg-6 col-md-12">
                                                    <div className="form-group">
                                                        <label className="wt-label">First Name *</label>
                                                        <div className="ls-inputicon-box">
                                                            <input
                                                                className="form-control"
                                                                name="firstName"
                                                                type="text"
                                                                placeholder="Enter First Name"
                                                                value={formData.firstName}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                            <i className="fs-input-icon fa fa-user" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-xl-6 col-lg-6 col-md-12">
                                                    <div className="form-group">
                                                        <label className="wt-label">Last Name *</label>
                                                        <div className="ls-inputicon-box">
                                                            <input
                                                                className="form-control"
                                                                name="lastName"
                                                                type="text"
                                                                placeholder="Enter Last Name"
                                                                value={formData.lastName}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                            <i className="fs-input-icon fa fa-user" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-xl-6 col-lg-6 col-md-12">
                                                    <div className="form-group">
                                                        <label className="wt-label">Username *</label>
                                                        <div className="ls-inputicon-box">
                                                            <input
                                                                className="form-control"
                                                                name="username"
                                                                type="text"
                                                                placeholder="Enter Username"
                                                                value={formData.username}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                            <i className="fs-input-icon fa fa-user-circle" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-xl-6 col-lg-6 col-md-12">
                                                    <div className="form-group">
                                                        <label className="wt-label">Email *</label>
                                                        <div className="ls-inputicon-box">
                                                            <input
                                                                className="form-control"
                                                                name="email"
                                                                type="email"
                                                                placeholder="Enter email address"
                                                                value={formData.email}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                            <i className="fs-input-icon fa fa-envelope" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-xl-6 col-lg-6 col-md-12">
                                                    <div className="form-group">
                                                        <label className="wt-label">Phone *</label>
                                                        <div className="ls-inputicon-box">
                                                            <input
                                                                className="form-control"
                                                                name="phone"
                                                                type="tel"
                                                                placeholder="Enter phone number"
                                                                value={formData.phone}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                            <i className="fs-input-icon fa fa-phone" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-xl-12 col-lg-12 col-md-12">
                                                    <div className="form-group">
                                                        <label className="wt-label">Permissions *</label>
                                                        <div className="row">
                                                            <div className="col-md-4">
                                                                <div className="form-check">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        id="employers"
                                                                        checked={formData.permissions.includes('employers')}
                                                                        onChange={() => handlePermissionChange('employers')}
                                                                    />
                                                                    <label className="form-check-label" htmlFor="employers">
                                                                        Employers
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-check">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        id="placement_officers"
                                                                        checked={formData.permissions.includes('placement_officers')}
                                                                        onChange={() => handlePermissionChange('placement_officers')}
                                                                    />
                                                                    <label className="form-check-label" htmlFor="placement_officers">
                                                                        Placement Officers
                                                                    </label>
                                                                </div>
                                                            </div>
                                                            <div className="col-md-4">
                                                                <div className="form-check">
                                                                    <input
                                                                        className="form-check-input"
                                                                        type="checkbox"
                                                                        id="registered_candidates"
                                                                        checked={formData.permissions.includes('registered_candidates')}
                                                                        onChange={() => handlePermissionChange('registered_candidates')}
                                                                    />
                                                                    <label className="form-check-label" htmlFor="registered_candidates">
                                                                        Registered Candidates
                                                                    </label>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-xl-6 col-lg-6 col-md-12">
                                                    <div className="form-group">
                                                        <label className="wt-label">Password *</label>
                                                        <div className="ls-inputicon-box">
                                                            <input
                                                                className="form-control"
                                                                name="password"
                                                                type="password"
                                                                placeholder="Enter password"
                                                                value={formData.password}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                            <i className="fs-input-icon fa fa-lock" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-xl-6 col-lg-6 col-md-12">
                                                    <div className="form-group">
                                                        <label className="wt-label">Confirm Password *</label>
                                                        <div className="ls-inputicon-box">
                                                            <input
                                                                className="form-control"
                                                                name="confirmPassword"
                                                                type="password"
                                                                placeholder="Confirm password"
                                                                value={formData.confirmPassword}
                                                                onChange={handleInputChange}
                                                                required
                                                            />
                                                            <i className="fs-input-icon fa fa-lock" />
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="col-xl-12 col-lg-12 col-md-12">
                                                    <div className="text-left">
                                                        <button type="submit" className="site-button" disabled={loading}>
                                                            {loading ? 'Adding...' : 'Add Sub Admin'}
                                                        </button>
                                                        <button 
                                                            type="button" 
                                                            className="site-button-secondry ms-3"
                                                            onClick={() => setShowAddForm(false)}
                                                        >
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
            </div>
        </div>
    );
}

export default AdminSubAdmin;