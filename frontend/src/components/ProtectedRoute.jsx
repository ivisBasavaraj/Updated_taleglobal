import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    const adminToken = localStorage.getItem('adminToken');
    const subAdminToken = localStorage.getItem('subAdminToken');
    const adminData = localStorage.getItem('adminData');
    const subAdminData = localStorage.getItem('subAdminData');

    // Check if user is authenticated
    const isAuthenticated = (adminToken && adminData) || (subAdminToken && subAdminData);
    
    if (!isAuthenticated) {
        return <Navigate to="/admin-login" replace />;
    }

    // Check role-based access
    if (allowedRoles.length > 0) {
        let userRole = null;
        
        // Determine user role based on available data
        if (adminToken && adminData) {
            userRole = 'admin';
        } else if (subAdminToken && subAdminData) {
            userRole = 'sub-admin';
        }
        
        if (!userRole || !allowedRoles.includes(userRole)) {
            return (
                <div className="content-admin-main">
                    <div className="wt-admin-right-page-header">
                        <h2>Access Denied</h2>
                    </div>
                    <div className="alert alert-danger">
                        <i className="fa fa-exclamation-triangle me-2"></i>
                        You don't have permission to access this page. Only main administrators can manage sub-admins.
                    </div>
                </div>
            );
        }
    }

    return children;
};

export default ProtectedRoute;