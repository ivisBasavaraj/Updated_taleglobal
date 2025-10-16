import { useEffect, useState, useMemo, useCallback, memo, useRef } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import JobZImage from "../../../../common/jobz-img";
import SectionJobsSidebar1 from "../../sections/jobs/sidebar/section-jobs-sidebar1";
import SectionRecordsFilter from "../../sections/common/section-records-filter";
import SectionPagination from "../../sections/common/section-pagination";
import { loadScript } from "../../../../../globals/constants";
import { requestCache } from "../../../../../utils/requestCache";
import { performanceMonitor } from "../../../../../utils/performanceMonitor";
import "../../../../../job-grid-optimizations.css";
import "../../../../../emp-grid-optimizations.css";

const EmployersGridPage = memo(() => {
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalEmployers, setTotalEmployers] = useState(0);
    const [sortBy, setSortBy] = useState("Most Recent");
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isFirstLoad, setIsFirstLoad] = useState(true);
    const navigate = useNavigate();
    const abortControllerRef = useRef(null);
    const debounceTimerRef = useRef(null);

    const _filterConfig = useMemo(() => ({
        prefix: "Showing",
        type: "employers",
        total: totalEmployers.toString(),
        showRange: false,
        showingUpto: ""
    }), [totalEmployers]);

    const handleSortChange = useCallback((value) => {
        setSortBy(value);
    }, []);

    const handleItemsPerPageChange = useCallback((value) => {
        setItemsPerPage(value);
    }, []);

    useEffect(() => {
        loadScript("js/custom.js");
    }, []);

    const fetchEmployers = useCallback(async () => {
        // Cancel previous request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Clear previous debounce
        if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
        }
        
        // Debounce API calls
        debounceTimerRef.current = setTimeout(async () => {
            setLoading(true);
            abortControllerRef.current = new AbortController();
            
            const apiStartTime = performance.now();
            
            try {
                const params = new URLSearchParams({
                    sortBy,
                    limit: itemsPerPage.toString(),
                    page: '1'
                });

                const url = `http://localhost:5000/api/public/employers?${params.toString()}`;
                const data = await requestCache.get(url, {
                    ttl: 180000, // 3 minutes cache
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    signal: abortControllerRef.current.signal
                });
                
                // Monitor API performance
                performanceMonitor.monitorAPICall(url, apiStartTime);
                
                if (data.success) {
                    setEmployers(data.employers || []);
                    setTotalEmployers(data.totalCount || data.employers?.length || 0);
                } else {
                    setEmployers([]);
                    setTotalEmployers(0);
                }
            } catch (error) {
                if (error.name !== 'AbortError') {
                    console.error('Error fetching employers:', error);
                    setEmployers([]);
                    setTotalEmployers(0);
                }
            } finally {
                setLoading(false);
                setIsFirstLoad(false);
            }
        }, 200); // 200ms debounce for employers
    }, [sortBy, itemsPerPage]);

    useEffect(() => {
        fetchEmployers();
        
        // Cleanup on unmount
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }
        };
    }, [fetchEmployers]);

    const EmployerCard = memo(({ employer }) => {
        const cardRef = useRef(null);
        
        // Intersection observer for lazy loading
        useEffect(() => {
            const observer = performanceMonitor.setupIntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            entry.target.setAttribute('data-visible', 'true');
                        } else {
                            entry.target.setAttribute('data-visible', 'false');
                        }
                    });
                },
                { rootMargin: '100px' }
            );
            
            if (cardRef.current) {
                observer.observe(cardRef.current);
            }
            
            return () => {
                if (cardRef.current) {
                    observer.unobserve(cardRef.current);
                }
            };
        }, []);
        const handleViewClick = useCallback((e) => {
            e.preventDefault();
            navigate(`/emp-detail/${employer._id}`);
        }, [employer._id, navigate]);

        const companyTypeClass = useMemo(() => {
            const typeMap = {
                'IT': 'green',
                'Healthcare': 'brown', 
                'Finance': 'purple',
                'Education': 'sky'
            };
            return typeMap[employer.profile?.industry] || 'golden';
        }, [employer.profile?.industry]);

        return (
            <Col key={employer._id} lg={6} md={12} className="mb-4">
                <div ref={cardRef} className="twm-jobs-grid-style1 hover-card job-card" data-visible="true">
                    <div className="twm-media">
                        {employer.profile?.logo ? (
                            <img 
                                src={employer.profile.logo} 
                                alt="Company Logo" 
                                loading="lazy"
                            />
                        ) : (
                            <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                        )}
                    </div>

                    <div className="twm-jobs-category green">
                        <span className={`twm-bg-${companyTypeClass}`}>
                            {employer.profile?.industry || 'Company'}
                        </span>
                    </div>

                    <div className="twm-mid-content">
                        <NavLink to={`/emp-detail/${employer._id}`} className="twm-job-title">
                            <h4>{employer.companyName}</h4>
                        </NavLink>
                        <div className="twm-job-address">
                            <i className="feather-map-pin" />
                            &nbsp;{employer.profile?.corporateAddress || 'Location not specified'}
                        </div>
                    </div>

                    <div className="twm-right-content twm-job-right-group">
                        <div className="twm-salary-and-apply mb-2">
                            <div className="twm-jobs-amount">
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1967d2', marginBottom: '4px' }}>
                                    Active Jobs: {employer.jobCount || 0}
                                </div>
                            </div>
                            {employer.profile?.website && (
                                <span className="vacancy-text">
                                    <a href={employer.profile.website} target="_blank" rel="noopener noreferrer" className="site-text-primary">
                                        Visit Website
                                    </a>
                                </span>
                            )}
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                            <h6 className="twm-job-address posted-by-company mb-0">
                                {employer.profile?.companySize ? `${employer.profile.companySize} employees` : 'Company'}
                            </h6>
                            <button 
                                className="btn btn-sm apply-now-button"
                                onClick={handleViewClick}
                            >
                                View Details
                            </button>
                        </div>
                    </div>
                </div>
            </Col>
        );
    });

    const skeletonCards = useMemo(() => 
        [...Array(4)].map((_, idx) => (
            <Col key={`skeleton-${idx}`} lg={6} md={12} className="mb-4">
                <div className="twm-jobs-grid-style1 job-card-skeleton">
                    <div className="skeleton-logo" />
                    <div className="skeleton-lines">
                        <div className="skeleton-line short" />
                        <div className="skeleton-line" />
                        <div className="skeleton-line" />
                    </div>
                </div>
            </Col>
        )), []
    );

    return (
        <div className="section-full py-5 site-bg-white emp-grid-page">
            <Container>
                <Row className="mb-4">
                    <Col lg={4} md={12} className="rightSidebar">
                        <SectionJobsSidebar1 />
                    </Col>

                    <Col lg={8} md={12}>
                        <div className="mb-4">
                            <SectionRecordsFilter
                                _config={_filterConfig}
                                onSortChange={handleSortChange}
                                onItemsPerPageChange={handleItemsPerPageChange}
                            />
                        </div>

                        <div className="twm-employer-list-wrap">
                            <Row>
                                {loading && isFirstLoad && skeletonCards}

                                {!loading && employers.length > 0 ? 
                                    employers.map((employer, index) => (
                                        <EmployerCard key={employer._id} employer={employer} index={index} />
                                    )) : !loading && (
                                        <Col xs={12} className="text-center py-5">
                                            <h5>No employers found</h5>
                                            <p>Please check back later for new companies.</p>
                                        </Col>
                                    )
                                }
                            </Row>
                        </div>

                        <SectionPagination />
                    </Col>
                </Row>
            </Container>
        </div>
    );
});

export default EmployersGridPage;