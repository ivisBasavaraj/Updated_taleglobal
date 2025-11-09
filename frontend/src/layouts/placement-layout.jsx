import { useLocation } from "react-router-dom";
import PlacementRoutes from "../routing/placement-routes";

function PlacementLayout() {
    // const currentpath = useLocation().pathname; // Unused variable

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
                        <div className="navbar-nav ml-auto d-flex align-items-center" style={{columnGap: '1rem'}}>
                            <div className="nav-item">
                                <span className="nav-link d-flex align-items-center" style={{color: 'white', fontWeight: 500}}>
                                    <i className="fa fa-user-circle mr-2"></i>
                                    Account
                                </span>
                            </div>
                            <button 
                                className="btn btn-sm logout-btn"
                                style={{borderRadius: '50px', padding: '0.4rem 1.1rem', fontWeight: 600, letterSpacing: '0.5px', color: '#ffffff', border: '2px solid #ffffff', backgroundColor: 'transparent', transition: 'all 0.3s'}}
                                onClick={() => {
                                    localStorage.removeItem('placementToken');
                                    window.location.href = '/login';
                                }}
                            >
                                <i className="fa fa-sign-out mr-2"></i>
                                Logout
                            </button>
                            <style>{`
                                .logout-btn:hover {
                                    background-color: #ffffff !important;
                                    color: #ff6b35 !important;
                                }
                            `}</style>
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
