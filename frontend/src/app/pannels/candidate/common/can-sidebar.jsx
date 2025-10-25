// CANDIDATE DASHBOARD SIDEBAR (Legacy Reff)

import JobZImage from "../../../common/jobz-img";
import { NavLink, useLocation } from "react-router-dom";
import { loadScript, setMenuActive } from "../../../../globals/constants";
import { candidate, canRoute, publicUser } from "../../../../globals/route-names";
import { useEffect } from "react";

function CanSidebarSection({ sidebarActive, onNavigate, isMobile }) {
  const currentpath = useLocation().pathname;

  useEffect(() => {
    loadScript("js/custom.js");
    loadScript("js/can-sidebar.js");
  });

  const handleNavigate = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  const menuItems = [
    {
      route: canRoute(candidate.DASHBOARD),
      icon: "fa fa-home",
      label: "Dashboard",
    },
    {
      route: canRoute(candidate.PROFILE),
      icon: "fa fa-user-tie",
      label: "My Profile",
    },
    {
      route: canRoute(candidate.STATUS),
      icon: "fa fa-briefcase",
      label: "My Applications",
    },
    {
      route: canRoute(candidate.RESUME),
      icon: "fa fa-user-friends",
      label: "My Resume",
    },
    {
      route: canRoute(candidate.SUPPORT),
      icon: "fa fa-headset",
      label: "Support",
    },
  ];

  return (
    <>
      <nav
        id="sidebar-admin-wraper"
        className={sidebarActive ? "" : "active"}
        style={isMobile ? {
          position: "fixed",
          top: 0,
          left: 0,
          width: "280px",
          transform: sidebarActive ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          boxShadow: sidebarActive ? "0 4px 24px rgba(0,0,0,0.25)" : "none",
          zIndex: 10000,
          background: "#ffffff",
          height: "100vh",
          overflowY: "auto"
        } : {} }
      >
        <div className="page-logo">
          <NavLink to={publicUser.INITIAL} onClick={handleNavigate}>
            <JobZImage id="skin_page_logo" src="images/logo-dark.png" alt="logo" />
          </NavLink>
        </div>
        <div className="admin-nav scrollbar-macosx">
          <ul>
            {menuItems.map((item) => (
              <li key={item.route} className={setMenuActive(currentpath, item.route)}>
                <NavLink to={item.route} onClick={handleNavigate}>
                  <i className={item.icon} />
                  <span className="admin-nav-text">{item.label}</span>
                </NavLink>
              </li>
            ))}
            <li>
              <a href="#" data-bs-toggle="modal" data-bs-target="#logout-dash-profile" onClick={handleNavigate}>
                <i className="fa fa-share-square" />
                <span className="admin-nav-text">Logout</span>
              </a>
            </li>
          </ul>
        </div>
      </nav>
    </>
  );
}

export default CanSidebarSection;
