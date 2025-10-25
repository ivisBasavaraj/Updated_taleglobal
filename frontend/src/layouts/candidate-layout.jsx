
import YesNoPopup from "../app/common/popups/popup-yes-no";
import { popupType } from "../globals/constants";
import { useState, useEffect } from "react";
import CanHeaderSection from "../app/pannels/candidate/common/can-header";
import CanSidebarSection from "../app/pannels/candidate/common/can-sidebar";
import CandidateRoutes from "../routing/candidate-routes";
import "../candidate-layout-fix.css";

function CandidateLayout() {

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

    const contentClasses = [
        !isMobile && !sidebarActive ? "sidebar-hidden" : "",
        isMobile ? "mobile-view" : ""
    ].filter(Boolean).join(" ");

    return (
        <>
            <div className="page-wraper">

                {isMobile && (
                    <button 
                        className="mobile-menu-toggle"
                        onClick={handleMobileMenuToggle}
                        aria-label="Toggle Menu"
                    >
                        <i className="fas fa-bars"></i>
                    </button>
                )}

                {isMobile && sidebarActive && (
                    <div 
                        className="sidebar-overlay active"
                        onClick={handleOverlayClick}
                    ></div>
                )}

                <CanHeaderSection onClick={handleSidebarCollapse} sidebarActive={sidebarActive} isMobile={isMobile} />
                <CanSidebarSection sidebarActive={sidebarActive} isMobile={isMobile} />

                <div id="content" className={contentClasses}>
                    <div className="content-admin-main">
                        <CandidateRoutes />
                    </div>
                </div>

                <YesNoPopup id="delete-dash-profile" type={popupType.DELETE} msg={"Do you want to delete your profile?"} />
                <YesNoPopup id="logout-dash-profile" type={popupType.LOGOUT} msg={"Do you want to Logout your profile?"} />

            </div>
        </>
    )
}

export default CandidateLayout;
