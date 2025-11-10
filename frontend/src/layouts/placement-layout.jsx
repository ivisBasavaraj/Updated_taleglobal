import { useLocation } from "react-router-dom";
import PlacementRoutes from "../routing/placement-routes";

function PlacementLayout() {
    // const currentpath = useLocation().pathname; // Unused variable

    return (
        <>
            <div className="page-wraper" style={{background: '#f8f9fa'}}>
                {/* Logout Button */}
                <div style={{position: 'fixed', top: '20px', right: '20px', zIndex: 1000}}>
                    <button 
                        className="btn btn-sm logout-btn"
                        style={{borderRadius: '50px', padding: '0.5rem 1.2rem', fontWeight: 600, color: '#ffffff', border: '2px solid #FF8237', backgroundColor: '#FF8237', transition: 'all 0.3s', boxShadow: '0 2px 8px rgba(255,130,55,0.3)'}}
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
                            background-color: #e55a2b !important;
                            border-color: #e55a2b !important;
                            transform: translateY(-2px);
                            box-shadow: 0 4px 12px rgba(255,130,55,0.4) !important;
                        }
                    `}</style>
                </div>
                
                <div className="page-content">
                    <PlacementRoutes />
                </div>
            </div>
        </>
    )
}

export default PlacementLayout;
