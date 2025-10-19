
import JobZImage from "../jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../globals/route-names";
import { useState, useCallback, memo, useEffect } from "react";

const Header1 = memo(function Header1({ _config }) {

    const [menuActive, setMenuActive] = useState(false);
    const [isEmployerLoggedIn, setIsEmployerLoggedIn] = useState(false);
    const [employerData, setEmployerData] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('employerToken');
        const employer = localStorage.getItem('employerData');
        if (token && employer) {
            setIsEmployerLoggedIn(true);
            setEmployerData(JSON.parse(employer));
        }
    }, []);

    const handleNavigationClick = useCallback(() => {
        setMenuActive(prev => !prev);
    }, []);

    const closeMenu = useCallback(() => {
        setMenuActive(false);
    }, []);

    const handleLogout = useCallback(() => {
        localStorage.removeItem('employerToken');
        localStorage.removeItem('employerData');
        setIsEmployerLoggedIn(false);
        setEmployerData(null);
        window.location.href = '/';
    }, []);

    return (
        <>
            <header className={"site-header " + _config.style + " mobile-sider-drawer-menu " + (menuActive ? "active" : "") }>
                <div className="sticky-header main-bar-wraper navbar-expand-lg">
                    <div className="main-bar">
                        <div className="container-fluid clearfix">
                            <div className="logo-header">
                                <div className="logo-header-inner logo-header-one">
                                    <NavLink to={publicUser.INITIAL}>
                                        {
                                            _config.withBlackLogo
                                                ?
                                                <JobZImage src="images/logo-12.png" alt="" />
                                                :
                                                (
                                                    _config.withWhiteLogo
                                                        ?
                                                        <JobZImage src="images/logo-white.png" alt="" />
                                                        :
                                                        (
                                                            _config.withLightLogo ?
                                                                <>
                                                                    <JobZImage id="skin_header_logo_light" src="images/logo-light-3.png" alt="" className="default-scroll-show" />
                                                                    <JobZImage id="skin_header_logo" src="images/logo-dark.png" alt="" className="on-scroll-show" />
                                                                </> :
                                                                <JobZImage id="skin_header_logo" src="images/logo-dark.png" alt="" />
                                                        )
                                                )
                                        }
                                    </NavLink>
                                </div>
                            </div>
                            {/* NAV Toggle Button */}
                            <button id="mobile-side-drawer"
                                data-target=".header-nav"
                                data-toggle="collapse"
                                type="button"
                                className="navbar-toggler collapsed"
                                onClick={handleNavigationClick}
                            >
                                <span className="sr-only">Toggle navigation</span>
                                <span className="icon-bar icon-bar-first" />
                                <span className="icon-bar icon-bar-two" />
                                <span className="icon-bar icon-bar-three" />
                            </button>
                            {/* MAIN Vav */}
                            <div className="nav-animation header-nav navbar-collapse d-flex justify-content-center" style={{display: 'flex !important'}}>
                                <ul className="nav navbar-nav" style={{display: 'flex', listStyle: 'none', gap: '2rem'}}>
                                    <li className="nav-item">
                                        <NavLink
                                            to="/"
                                            style={{color: '#333', textDecoration: 'none', padding: '10px 15px'}}
                                            onClick={closeMenu}
                                        >
                                            Home
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink
                                            to="/job-grid"
                                            style={{color: '#333', textDecoration: 'none', padding: '10px 15px'}}
                                            onClick={closeMenu}
                                        >
                                            Jobs
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink
                                            to="/emp-grid"
                                            style={{color: '#333', textDecoration: 'none', padding: '10px 15px'}}
                                            onClick={closeMenu}
                                        >
                                            Employers
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink
                                            to="/contact-us"
                                            style={{color: '#333', textDecoration: 'none', padding: '10px 15px'}}
                                            onClick={closeMenu}
                                        >
                                            Contact Us
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink
                                            to="/support"
                                            style={{color: '#333', textDecoration: 'none', padding: '10px 15px'}}
                                            onClick={closeMenu}
                                        >
                                            Support
                                        </NavLink>
                                    </li>
                                </ul>
                            </div>

                            {/* Header Right Section*/}
                            <div className="extra-nav header-2-nav">
                                <div className="extra-cell">
                                    {isEmployerLoggedIn ? (
                                        <div className="employer-nav-menu">
                                            <div className="dropdown">
                                                <button className="btn btn-outline-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                                                    <i className="feather-user" /> {employerData?.companyName || 'Dashboard'}
                                                </button>
                                                <ul className="dropdown-menu">
                                                    <li><NavLink className="dropdown-item" to="/employer/dashboard" onClick={closeMenu}><i className="feather-home" /> Dashboard</NavLink></li>
                                                    <li><NavLink className="dropdown-item" to="/employer/profile" onClick={closeMenu}><i className="feather-user" /> Company Profile</NavLink></li>
                                                    <li><NavLink className="dropdown-item" to="/employer/manage-jobs" onClick={closeMenu}><i className="feather-briefcase" /> Openings</NavLink></li>
                                                    <li><NavLink className="dropdown-item" to="/employer/candidates-list" onClick={closeMenu}><i className="feather-users" /> Applicants</NavLink></li>
                                                    <li><NavLink className="dropdown-item" to="/employer/support" onClick={closeMenu}><i className="feather-headphones" /> Support</NavLink></li>
                                                    <li><hr className="dropdown-divider" /></li>
                                                    <li><button className="dropdown-item" onClick={handleLogout}><i className="feather-log-out" /> Logout</button></li>
                                                </ul>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="header-nav-btn-section">
                                            <div className="twm-nav-btn-left">
                                                <a className="twm-nav-sign-up" data-bs-toggle="modal" href="#sign_up_popup" role="button">
                                                    <i className="feather-log-in" /> Sign Up
                                                </a>
                                            </div>
                                            <div className="twm-nav-btn-right">
                                                <a className="twm-nav-post-a-job" data-bs-toggle="modal" href="#sign_up_popup2" role="button">
                                                    <i className="feather-log-in" /> Sign In
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* SITE Search */}
                    <div id="search">
                        <span className="close" />
                        <form role="search" id="searchform" action="/search" method="get" className="radius-xl">
                            <input className="form-control" name="q" type="search" placeholder="Type to search" />
                            <span className="input-group-append">
                                <button type="button" className="search-btn">
                                    <i className="fa fa-paper-plane" />
                                </button>
                            </span>
                        </form>
                    </div>
                </div>
            </header>

        </>
    )
});

export default Header1;