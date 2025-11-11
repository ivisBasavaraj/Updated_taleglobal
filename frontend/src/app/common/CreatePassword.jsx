import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { pubRoute, publicUser } from '../../globals/route-names';

function CreatePassword() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const email = searchParams.get('email');
    const rawType = (searchParams.get('type') || 'candidate').toLowerCase();
    const endpointMap = {
        candidate: 'http://localhost:5000/api/candidate/create-password',
        employer: 'http://localhost:5000/api/employer/create-password',
        placement: 'http://localhost:5000/api/placement/create-password'
    };
    const hasTypeParam = !!searchParams.get('type');
    const userType = endpointMap[rawType] ? rawType : 'candidate';
    const endpoint = endpointMap[userType];
    const displayRole = userType === 'placement' ? 'placement officer' : userType;
    const displayRoleLabel = displayRole === 'placement officer' ? 'Placement Officer' : displayRole.charAt(0).toUpperCase() + displayRole.slice(1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters long');
            return;
        }

        if (!email) {
            setError('Email parameter is missing.');
            return;
        }

        if (hasTypeParam && !endpointMap[rawType]) {
            setError('Invalid user type. Please use the link provided in your email.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Password created successfully! Please login.');
                navigate('/', { replace: true });
                setTimeout(() => {
                    const loginModal = document.getElementById('sign_up_popup2');
                    if (loginModal) {
                        const modal = new window.bootstrap.Modal(loginModal);
                        modal.show();
                    }
                }, 500);
            } else {
                setError(data.message || 'Failed to create password');
            }
        } catch (error) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
            <div className="row justify-content-center">
                <div className="col-md-6">
                    <div className="card">
                        <div className="card-header">
                            <h3>Create Your Password</h3>
                            {email && <p className="mb-0">for {email} ({displayRoleLabel})</p>}
                        </div>
                        <div className="card-body">
                            <form onSubmit={handleSubmit}>
                                {error && (
                                    <div className="alert alert-danger">{error}</div>
                                )}
                                
                                <div className="form-group mb-3 position-relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Password*"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <span
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={showPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
                                    </span>
                                </div>

                                <div className="form-group mb-3 position-relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        className="form-control"
                                        placeholder="Confirm Password*"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <span
                                        style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer' }}
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <i className={showConfirmPassword ? "fas fa-eye-slash" : "fas fa-eye"} />
                                    </span>
                                </div>

                                <button 
                                    type="submit" 
                                    className="w-100"
                                    disabled={loading}
                                    style={{ padding: '12px', fontSize: '16px', backgroundColor: '#fd7e14', color: 'white', border: 'none', borderRadius: '5px', fontWeight: '600' }}
                                >
                                    {loading ? 'Creating Password...' : 'Create Password'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CreatePassword;