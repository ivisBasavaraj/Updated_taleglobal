import EmpHeaderSection from "../app/pannels/employer/common/emp-header";
import EmpSidebarSection from "../app/pannels/employer/common/emp-sidebar";
import YesNoPopup from "../app/common/popups/popup-yes-no";
import EmployerRoutes from "../routing/employer-routes";
import { popupType } from "../globals/constants";
import { useState, useEffect } from "react";

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
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                )}
                
                {/* Mobile Overlay */}
                {isMobile && sidebarActive && (
                    <div 
                        className="sidebar-overlay active"
                        onClick={handleOverlayClick}
                    ></div>
                )}
                
                <EmpHeaderSection onClick={handleSidebarCollapse} sidebarActive={sidebarActive} />
                <EmpSidebarSection sidebarActive={sidebarActive} />

                <div id="content" className={sidebarActive ? "" : "active"}>
                    <div className="content-admin-main">
                        <EmployerRoutes />
                    </div>
                </div>

                <YesNoPopup id="logout-dash-profile" type={popupType.LOGOUT} msg={"Are you sure you want to logout?"} />
            </div>
        </>
    )
}

export default EmployerLayout;
