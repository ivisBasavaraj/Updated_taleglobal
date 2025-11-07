import { NavLink, useNavigate, useLocation } from "react-router-dom";
import JobZImage from "../../../../common/jobz-img";
import { canRoute, candidate, empRoute, employer, placementRoute, placement, publicUser } from "../../../../../globals/route-names";
import { useState, useEffect } from "react";
import { useAuth } from "../../../../../contexts/AuthContext";
import { loadScript, publicUrlFor } from "../../../../../globals/constants";
import { handleFacebookLogin, handleGoogleLogin } from "../../../../../utils/socialAuth";


function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();
    const [canusername, setCanUsername] = useState('');
    const [empusername, setEmpUsername] = useState('');
    const [placementusername, setPlacementUsername] = useState('');
    const [canpassword, setCanPassword] = useState('');
    const [emppassword, setEmpPassword] = useState('');
    const [placementpassword, setPlacementPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState('candidate');

    
    const from = location.state?.from?.pathname || '/';

    useEffect(() => {
        loadScript("js/custom.js");

    }, []);



    const handleCandidateLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await login({
            email: canusername,
            password: canpassword
        }, 'candidate');
        
        setLoading(false);
        
        if (result.success) {
            // Check if there's a redirect URL stored
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectUrl, { replace: true });
            } else {
                navigate('/candidate/dashboard', { replace: true });
            }
        } else {
            setError(result.message || 'Login failed');
        }
    }

    const handleEmployerLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        // Validate inputs
        if (!empusername.trim() || !emppassword.trim()) {
            setError('Please enter both email and password');
            setLoading(false);
            return;
        }
        
        try {
            const result = await login({
                email: empusername.trim(),
                password: emppassword
            }, 'employer');
            
            setLoading(false);
            
            if (result.success) {
                // Check if there's a redirect URL stored
                const redirectUrl = localStorage.getItem('redirectAfterLogin');
                if (redirectUrl) {
                    localStorage.removeItem('redirectAfterLogin');
                    navigate(redirectUrl, { replace: true });
                } else {
                    navigate('/employer/dashboard', { replace: true });
                }
            } else {
                setError(result.message || 'Invalid email or password');
            }
        } catch (error) {
            setLoading(false);
            setError('Login failed. Please check your connection and try again.');
        }
    }

    const handlePlacementLogin = async (event) => {
        event.preventDefault();
        setLoading(true);
        setError('');
        
        const result = await login({
            email: placementusername,
            password: placementpassword
        }, 'placement');
        
        setLoading(false);
        
        if (result.success) {
            // Check if there's a redirect URL stored
            const redirectUrl = localStorage.getItem('redirectAfterLogin');
            if (redirectUrl) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectUrl, { replace: true });
            } else {
                navigate(placementRoute(placement.DASHBOARD), { replace: true });
            }
        } else {
            setError(result.message || 'Login failed');
        }
    }

    return (
        <>
            <div className="min-vh-100 d-flex align-items-center" style={{background: 'radial-gradient(ellipse at center, white 40%, #FFE5CC 100%)'}}>
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-11 col-xl-10">
                            <div className="row g-0">
                                    <div className="col-md-6 position-relative">
                                        <div className="h-100 d-flex align-items-center justify-content-center" style={{background: 'white', minHeight: '600px'}}>
                                            <JobZImage src="images/login-image.svg" alt="" style={{width: '95%', maxWidth: '400px'}} />
                                        </div>
                                    </div>
                                    <div className="col-md-6" style={{borderLeft: '4px solid #FF6A00'}}>
                                        <div className="p-5 d-flex flex-column justify-content-center" style={{minHeight: '600px'}}>
                                            <div className="text-center mb-4">
                                                <NavLink to={publicUser.HOME1}>
                                                    <JobZImage src="images/logo-dark.png" alt="" className="mb-3" style={{maxHeight: '45px'}} />
                                                </NavLink>
                                                <h3 className="fw-bold text-dark mb-2">Welcome Back</h3>
                                                <p className="text-muted mb-0">Sign in to your account</p>
                                            </div>
                                    {error && (
                                        <div className="alert alert-danger" role="alert">
                                            {error}
                                        </div>
                                    )}
                                            <div className="mb-4">
                                                <div style={{display: 'flex', flexWrap: 'wrap', backgroundColor: 'rgba(255, 122, 0, 0.08)', borderRadius: '12px', padding: '6px', marginBottom: '24px', gap: '6px'}}>
                                                    <button onClick={() => setActiveTab('candidate')} style={{flex: 1, border: 'none', backgroundColor: activeTab === 'candidate' ? '#FF7A00' : 'transparent', color: activeTab === 'candidate' ? 'white' : '#FF7A00', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'none'}}>
                                                        <i className="fas fa-user-tie"></i>
                                                        <span>Candidate</span>
                                                    </button>
                                                    <button onClick={() => setActiveTab('employer')} style={{flex: 1, border: 'none', backgroundColor: activeTab === 'employer' ? '#FF7A00' : 'transparent', color: activeTab === 'employer' ? 'white' : '#FF7A00', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'none'}}>
                                                        <i className="fas fa-building"></i>
                                                        <span>Employer</span>
                                                    </button>
                                                    <button onClick={() => setActiveTab('placement')} style={{flex: 1, border: 'none', backgroundColor: activeTab === 'placement' ? '#FF7A00' : 'transparent', color: activeTab === 'placement' ? 'white' : '#FF7A00', borderRadius: '10px', padding: '10px 16px', fontSize: '14px', fontWeight: '500', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'none'}}>
                                                        <i className="fas fa-graduation-cap"></i>
                                                        <span>Placement Officer</span>
                                                    </button>
                                                </div>
                                                <div>
                                            {activeTab === 'candidate' && (
                                            <form onSubmit={handleCandidateLogin}>
                                                <div className="mb-3">
                                                    <input name="email"
                                                        type="email"
                                                        required
                                                        className="form-control"
                                                        placeholder="Username"
                                                        value={canusername}
                                                        onChange={(event) => setCanUsername(event.target.value)}
                                                        autoComplete="new-password"
                                                        autoCorrect="off"
                                                        autoCapitalize="off"
                                                        spellCheck="false"
                                                        style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}} />
                                                </div>
                                                <div className="mb-3">
                                                    <input
                                                        name="password"
                                                        type="password"
                                                        className="form-control"
                                                        placeholder="Password"
                                                        required
                                                        value={canpassword}
                                                        onChange={(event) => setCanPassword(event.target.value)}
                                                        autoComplete="new-password"
                                                        autoCorrect="off"
                                                        autoCapitalize="off"
                                                        spellCheck="false"
                                                        style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}} />
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <div className="form-check">
                                                        <input type="checkbox" className="form-check-input" id="rememberCandidate" />
                                                        <label className="form-check-label" htmlFor="rememberCandidate" style={{fontSize: '14px', color: '#666'}}>Remember me</label>
                                                    </div>
                                                    <NavLink to={publicUser.pages.FORGOT} className="site-text-primary" style={{fontSize: '14px', textDecoration: 'none'}}>Forgot Password</NavLink>
                                                </div>
                                                <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading} style={{padding: '12px', borderRadius: '8px', fontWeight: '500'}}>
                                                    {loading ? 'Logging in...' : 'Log in'}
                                                </button>
                                            </form>
                                            )}
                                            {activeTab === 'employer' && (
                                            <form onSubmit={handleEmployerLogin}>
                                                <div className="mb-3">
                                                    <input
                                                        name="email"
                                                        type="email"
                                                        required
                                                        className="form-control"
                                                        placeholder="Username"
                                                        value={empusername}
                                                        onChange={(event) => setEmpUsername(event.target.value)}
                                                        autoComplete="email"
                                                        autoCorrect="off"
                                                        autoCapitalize="off"
                                                        spellCheck="false"
                                                        style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}} />
                                                </div>
                                                <div className="mb-3">
                                                    <input
                                                        name="password"
                                                        type="password"
                                                        className="form-control"
                                                        placeholder="Password"
                                                        required
                                                        value={emppassword}
                                                        onChange={(event) => setEmpPassword(event.target.value)}
                                                        autoComplete="current-password"
                                                        autoCorrect="off"
                                                        autoCapitalize="off"
                                                        spellCheck="false"
                                                        style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}} />
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <div className="form-check">
                                                        <input type="checkbox" className="form-check-input" id="rememberEmployer" />
                                                        <label className="form-check-label" htmlFor="rememberEmployer" style={{fontSize: '14px', color: '#666'}}>Remember me</label>
                                                    </div>
                                                    <NavLink to={publicUser.pages.FORGOT} className="site-text-primary" style={{fontSize: '14px', textDecoration: 'none'}}>Forgot Password</NavLink>
                                                </div>
                                                <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading} style={{padding: '12px', borderRadius: '8px', fontWeight: '500'}}>
                                                    {loading ? 'Logging in...' : 'Log in'}
                                                </button>
                                            </form>
                                            )}
                                            {activeTab === 'placement' && (
                                            <form onSubmit={handlePlacementLogin}>
                                                <div className="mb-3">
                                                    <input
                                                        name="username"
                                                        type="text"
                                                        required
                                                        className="form-control"
                                                        placeholder="Username"
                                                        value={placementusername}
                                                        onChange={(event) => setPlacementUsername(event.target.value)}
                                                        autoComplete="new-password"
                                                        autoCorrect="off"
                                                        autoCapitalize="off"
                                                        spellCheck="false"
                                                        style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}} />
                                                </div>
                                                <div className="mb-3">
                                                    <input
                                                        name="password"
                                                        type="password"
                                                        className="form-control"
                                                        placeholder="Password"
                                                        required
                                                        value={placementpassword}
                                                        onChange={(event) => setPlacementPassword(event.target.value)}
                                                        autoComplete="new-password"
                                                        autoCorrect="off"
                                                        autoCapitalize="off"
                                                        spellCheck="false"
                                                        style={{padding: '12px 16px', borderRadius: '8px', border: '1px solid #e0e0e0'}} />
                                                </div>
                                                <div className="d-flex justify-content-between align-items-center mb-4">
                                                    <div className="form-check">
                                                        <input type="checkbox" className="form-check-input" id="rememberPlacement" />
                                                        <label className="form-check-label" htmlFor="rememberPlacement" style={{fontSize: '14px', color: '#666'}}>Remember me</label>
                                                    </div>
                                                    <NavLink to={publicUser.pages.FORGOT} className="site-text-primary" style={{fontSize: '14px', textDecoration: 'none'}}>Forgot Password</NavLink>
                                                </div>
                                                <button type="submit" className="btn btn-primary w-100 mb-3" disabled={loading} style={{padding: '12px', borderRadius: '8px', fontWeight: '500'}}>
                                                    {loading ? 'Logging in...' : 'Log in'}
                                                </button>
                                            </form>
                                            )}
                                        </div>
                                        <div className="text-center mt-3">
                                            <NavLink to={publicUser.INITIAL} className="btn" style={{padding: '8px 20px', borderRadius: '8px', textDecoration: 'none', border: '1px solid #FF7A00', color: '#FF7A00', backgroundColor: 'transparent'}}>
                                                <i className="fas fa-home me-2" style={{color: '#FF7A00'}}></i>Back to Home
                                            </NavLink>
                                        </div>
                                    </div>
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default LoginPage;
