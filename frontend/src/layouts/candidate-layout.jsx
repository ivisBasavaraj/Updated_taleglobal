import YesNoPopup from "../app/common/popups/popup-yes-no";
import { popupType } from "../globals/constants";
import { useState, useEffect } from "react";
import CanHeaderSection from "../app/pannels/candidate/common/can-header";
import CanSidebarSection from "../app/pannels/candidate/common/can-sidebar";
import CandidateRoutes from "../routing/candidate-routes";

function CandidateLayout() {
  const [sidebarActive, setSidebarActive] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    document.body.classList.add("candidate-layout");

    return () => {
      document.body.classList.remove(
        "candidate-layout",
        "candidate-layout-desktop",
        "candidate-layout-mobile",
        "candidate-sidebar-open",
        "candidate-sidebar-expanded",
        "candidate-sidebar-collapsed",
        "sidebar-open"
      );
    };
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 991;
      setIsMobile(mobile);
      setSidebarActive(mobile ? false : true);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    document.body.classList.toggle("candidate-layout-mobile", isMobile);
    document.body.classList.toggle("candidate-layout-desktop", !isMobile);
  }, [isMobile]);

  useEffect(() => {
    if (isMobile) {
      document.body.classList.remove("candidate-sidebar-expanded", "candidate-sidebar-collapsed");

      if (sidebarActive) {
        document.body.classList.add("candidate-sidebar-open", "sidebar-open");
      } else {
        document.body.classList.remove("candidate-sidebar-open", "sidebar-open");
      }
    } else {
      document.body.classList.remove("candidate-sidebar-open", "sidebar-open");
      document.body.classList.toggle("candidate-sidebar-expanded", sidebarActive);
      document.body.classList.toggle("candidate-sidebar-collapsed", !sidebarActive);
    }
  }, [sidebarActive, isMobile]);

  const handleSidebarCollapse = () => {
    setSidebarActive((prev) => !prev);
  };

  const handleMobileMenuToggle = () => {
    setSidebarActive((prev) => !prev);
  };

  const closeSidebar = () => {
    setSidebarActive(false);
  };

  const contentClasses = [
    !isMobile && !sidebarActive ? "sidebar-hidden" : "",
    isMobile ? "mobile-view" : ""
  ].filter(Boolean).join(" ");

  return (
    <>
      <div className="page-wraper">
        {isMobile && (
          <button
            className={`mobile-menu-toggle ${sidebarActive ? "sidebar-open" : ""}`}
            onClick={handleMobileMenuToggle}
            aria-label="Toggle Menu"
          >
            <i className={sidebarActive ? "fas fa-times" : "fas fa-bars"}></i>
          </button>
        )}

        {isMobile && (
          <div
            className={`sidebar-overlay ${sidebarActive ? "active" : ""}`}
            onClick={closeSidebar}
          ></div>
        )}

        <CanHeaderSection onClick={handleSidebarCollapse} sidebarActive={sidebarActive} isMobile={isMobile} />
        <CanSidebarSection sidebarActive={sidebarActive} isMobile={isMobile} onLinkClick={isMobile ? closeSidebar : undefined} />

        <div id="content" className={contentClasses}>
          <div className="content-admin-main">
            <CandidateRoutes />
          </div>
        </div>

        <YesNoPopup id="delete-dash-profile" type={popupType.DELETE} msg={"Do you want to delete your profile?"} />
        <YesNoPopup id="logout-dash-profile" type={popupType.LOGOUT} msg={"Do you want to Logout your profile?"} />
      </div>
    </>
  );
}

export default CandidateLayout;
