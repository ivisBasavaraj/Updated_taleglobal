import { useLocation } from "react-router-dom";
import PlacementRoutes from "../routing/placement-routes";

function PlacementLayout() {
    const currentpath = useLocation().pathname;

    return (
        <>
            <div className="page-wraper" style={{background: '#f8f9fa'}}>
                {/* Top Navigation Bar */}
                <nav className="navbar navbar-expand-lg" style={{
                    background: '#ff6b35',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <div className="container-fluid px-4">
                        <div className="navbar-brand d-flex align-items-center" style={{color: 'white'}}>
                            <i className="fa fa-graduation-cap fa-lg mr-2" style={{color: 'white'}}></i>
                            <span style={{fontWeight: '600', fontSize: '1.2rem'}}>Placement Portal</span>
                        </div>
                        <div className="navbar-nav ml-auto">
                            <div className="nav-item dropdown">
                                <button 
                                    className="btn btn-link nav-link dropdown-toggle" 
                                    style={{color: 'white', textDecoration: 'none'}}
                                    data-toggle="dropdown"
                                >
                                    <i className="fa fa-user-circle mr-1"></i>
                                    Account
                                </button>
                                <div className="dropdown-menu dropdown-menu-right">
                                    <button 
                                        className="dropdown-item"
                                        onClick={() => {
                                            localStorage.removeItem('placementToken');
                                            window.location.href = '/login';
                                        }}
                                    >
                                        <i className="fa fa-sign-out mr-2"></i>
                                        Logout
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
                
                <div className="page-content">
                    <PlacementRoutes />
                </div>
            </div>
        </>
    )
}

export default PlacementLayout;