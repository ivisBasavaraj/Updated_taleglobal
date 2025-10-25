import EmpHeaderSection from "../app/pannels/employer/common/emp-header";
import EmpSidebarSection from "../app/pannels/employer/common/emp-sidebar";
import YesNoPopup from "../app/common/popups/popup-yes-no";
import EmployerRoutes from "../routing/employer-routes";
import { popupType } from "../globals/constants";
import { useState, useEffect } from "react";
import "../employer-layout-fix.css";

function EmployerLayout() {
    const [sidebarActive, setSidebarActive] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 991);
            if (window.innerWidth <= 991) {
                setSidebarActive(false);
            } else {
                setSidebarActive(true);
            }
        };
        
        checkMobile();
        window.addEventListener('resize', checkMobile);
        
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleSidebarCollapse = () => {
        setSidebarActive(!sidebarActive);
    }
    
    const handleMobileMenuToggle = () => {
        setSidebarActive(!sidebarActive);
    }
    
    const handleOverlayClick = () => {
        if (isMobile) {
            setSidebarActive(false);
        }
    }

    return (
        <>
            <div className="page-wraper">
                {/* Mobile Menu Toggle Button */}
                {isMobile && (
                    <button 
                        className="mobile-menu-toggle"
                        onClick={handleMobileMenuToggle}
                        aria-label="Toggle Menu"
                        style={{
                            display: 'block',
                            position: 'fixed',
                            top: '15px',
                            left: '15px',
                            zIndex: 10001,
                            background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                            color: 'white',
                            border: 'none',
                            padding: '12px 15px',
                            borderRadius: '8px',
                            fontSize: '18px',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                            cursor: 'pointer'
                        }}
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                )}
                
                {/* Mobile Overlay */}
                {isMobile && sidebarActive && (
                    <div 
                        className="sidebar-overlay active"
                        onClick={handleOverlayClick}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            background: 'rgba(0,0,0,0.5)',
                            zIndex: 9998,
                            backdropFilter: 'blur(2px)'
                        }}
                    ></div>
                )}
                
                <EmpSidebarSection sidebarActive={sidebarActive} />

                <div id="content" className={!isMobile && !sidebarActive ? "active" : ""} style={{
                    marginLeft: isMobile ? '0' : (sidebarActive ? '280px' : '0'),
                    minHeight: '100vh',
                    transition: 'margin-left 0.3s ease',
                    background: '#f8fafc'
                }}>
                    <div className="content-admin-main" style={{
                        width: '100%',
                        minHeight: '100vh',
                        padding: '0',
                        background: '#f8fafc'
                    }}>
                        <EmployerRoutes />
                    </div>
                </div>

                <YesNoPopup id="logout-dash-profile" type={popupType.LOGOUT} msg={"Are you sure you want to logout?"} />
            </div>
        </>
    )
}

export default EmployerLayout;
