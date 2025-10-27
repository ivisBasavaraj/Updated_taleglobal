// CANDIDATE DASHBOARD SIDEBAR (Legacy Reff)

import JobZImage from "../../../common/jobz-img";
import { NavLink, useLocation } from "react-router-dom";
import { loadScript, setMenuActive } from "../../../../globals/constants";
import { candidate, canRoute, publicUser } from "../../../../globals/route-names";
import { useEffect } from "react";
import "./can-sidebar.css";

function CanSidebarSection({ sidebarActive, isMobile }) {
  const currentpath = useLocation().pathname;

  useEffect(() => {
    loadScript("js/custom.js");
    loadScript("js/can-sidebar.js");
  });

  const sidebarClasses = [
    sidebarActive ? "active" : "",
    !isMobile && !sidebarActive ? "collapsed" : ""
  ].filter(Boolean).join(" ");

  const mobileStyles = isMobile ? {
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
  } : {};

  return (
    <>
      <nav id="sidebar-admin-wraper" className={sidebarClasses} style={mobileStyles}>
        <div className="page-logo">
          <NavLink to={publicUser.INITIAL}>
            <JobZImage id="skin_page_logo" src="images/logo-dark.png" alt="logo" />
          </NavLink>
        </div>
        <div className="admin-nav scrollbar-macosx">
          <ul>
            <li className={setMenuActive(currentpath, canRoute(candidate.DASHBOARD))}>
              <NavLink to={canRoute(candidate.DASHBOARD)}>
                <i className="fa fa-home" />
                <span className="admin-nav-text">Dashboard</span>
              </NavLink>
            </li>
            <li className={setMenuActive(currentpath, canRoute(candidate.PROFILE))}>
              <NavLink to={canRoute(candidate.PROFILE)}>
                <i className="fa fa-user-tie" />
                <span className="admin-nav-text">My Profile</span>
              </NavLink>
            </li>
            <li className={setMenuActive(currentpath, canRoute(candidate.STATUS))}>
              <NavLink to={canRoute(candidate.STATUS)}>
                <i className="fa fa-user-tie" />
                <span className="admin-nav-text">My Applications</span>
              </NavLink>
            </li>
            <li className={setMenuActive(currentpath, canRoute(candidate.RESUME))}>
              <NavLink to={canRoute(candidate.RESUME)}>
                <i className="fa fa-user-friends" />
                <span className="admin-nav-text">My Resume</span>
              </NavLink>
            </li>
            <li className={setMenuActive(currentpath, canRoute(candidate.SUPPORT))}>
              <NavLink to={canRoute(candidate.SUPPORT)}>
                <i className="fa fa-headset" />
                <span className="admin-nav-text">Support</span>
              </NavLink>
            </li>
            <li>
              <a href="#" data-bs-toggle="modal" data-bs-target="#logout-dash-profile">
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
