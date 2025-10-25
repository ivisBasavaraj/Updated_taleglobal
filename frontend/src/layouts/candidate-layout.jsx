
import YesNoPopup from "../app/common/popups/popup-yes-no";
import { popupType } from "../globals/constants";
import { useState, useEffect } from "react";
import CanHeaderSection from "../app/pannels/candidate/common/can-header";
import CanSidebarSection from "../app/pannels/candidate/common/can-sidebar";
import CandidateRoutes from "../routing/candidate-routes";
import "../candidate-layout-fix.css";
import "../mobile-menu-fix.css";

function CandidateLayout() {

    const [isMobile, setIsMobile] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth <= 991;
            setIsMobile(mobile);
            if (mobile) {
                setSidebarOpen(false);
            } else {
                setSidebarOpen(true);
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const updateModalState = () => {
            setModalOpen(document.body.classList.contains("modal-open"));
        };

        updateModalState();
        document.addEventListener("show.bs.modal", updateModalState);
        document.addEventListener("hidden.bs.modal", updateModalState);

        return () => {
            document.removeEventListener("show.bs.modal", updateModalState);
            document.removeEventListener("hidden.bs.modal", updateModalState);
            // Cleanup: remove sidebar-open class when component unmounts
            document.body.classList.remove('sidebar-open');
        };
    }, []);

    const handleSidebarCollapse = () => {
        setSidebarOpen(prev => !prev);
    }

    const handleMobileMenuToggle = () => {
        setSidebarOpen(prev => {
            const newState = !prev;
            console.log('Mobile menu toggle:', newState); // Debug log
            
            // Add/remove body class to prevent scrolling when sidebar is open
            if (newState) {
                document.body.classList.add('sidebar-open');
            } else {
                document.body.classList.remove('sidebar-open');
            }
            return newState;
        });
    }

    const handleOverlayClick = () => {
        if (isMobile) {
            setSidebarOpen(false);
            document.body.classList.remove('sidebar-open');
        }
    }

    const handleRouteNavigate = () => {
        if (isMobile) {
            setSidebarOpen(false);
            document.body.classList.remove('sidebar-open');
        }
    }

    const sidebarActive = sidebarOpen;

    return (
        <>
            <div className="page-wraper">

                {isMobile && (
                    <button
                        className="mobile-menu-toggle"
                        onClick={handleMobileMenuToggle}
                        aria-label="Toggle Menu"
                        style={{
                            display: "block",
                            position: "fixed",
                            top: "15px",
                            left: "15px",
                            zIndex: 10001,
                            background: "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)",
                            color: "white",
                            border: "none",
                            padding: "12px 15px",
                            borderRadius: "8px",
                            fontSize: "18px",
                            boxShadow: "0 4px 15px rgba(0,0,0,0.2)",
                            cursor: "pointer",
                            transition: "all 0.3s ease"
                        }}
                    >
                        <i className={sidebarOpen ? "fas fa-times" : "fas fa-bars"}></i>
                    </button>
                )}

                {isMobile && sidebarOpen && !modalOpen && (
                    <div
                        className="sidebar-overlay active"
                        onClick={handleOverlayClick}
                    ></div>
                )}

                <CanHeaderSection onClick={handleSidebarCollapse} sidebarActive={sidebarActive} />
                <CanSidebarSection
                    sidebarActive={sidebarActive}
                    isMobile={isMobile}
                    onNavigate={handleRouteNavigate}
                />

                <div id="content" className={!sidebarActive && !isMobile ? "active" : ""} style={{
                    marginLeft: isMobile ? "0" : (sidebarOpen ? "280px" : "0"),
                    minHeight: "100vh",
                    transition: "margin-left 0.3s ease",
                    background: "#f8fafc",
                    position: "relative",
                    zIndex: isMobile && sidebarOpen ? 1 : "auto"
                }}>
                    <div className="content-admin-main" style={{
                        width: "100%",
                        minHeight: "100vh",
                        padding: "0",
                        background: "#f8fafc"
                    }}>
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
