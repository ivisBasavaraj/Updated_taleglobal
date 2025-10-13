import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { Col, Row } from "react-bootstrap";
import { NavLink, useNavigate } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import JobZImage from "../../../../common/jobz-img";
import SectionPagination from "../common/section-pagination";
import { requestCache } from "../../../../../utils/requestCache";

const SectionJobsGrid = memo(({ filters, onTotalChange }) => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const fetchJobs = useCallback(async () => {
        if (!filters) return;
        
        setLoading(true);
        try {
            const params = new URLSearchParams();
            
            // Optimized parameter building
            const paramMap = {
                search: filters.search,
                keyword: filters.keyword,
                location: filters.location,
                employmentType: filters.employmentType,
                jobTitle: filters.jobTitle,
                category: filters.category,
                sortBy: filters.sortBy,
                limit: filters.itemsPerPage?.toString()
            };
            
            Object.entries(paramMap).forEach(([key, value]) => {
                if (value) params.append(key, value);
            });
            
            if (filters.jobType) {
                if (Array.isArray(filters.jobType)) {
                    filters.jobType.forEach(type => params.append('jobType', type));
                } else {
                    params.append('jobType', filters.jobType);
                }
            }
            
            if (filters.skills?.length > 0) {
                filters.skills.forEach(skill => params.append('skills', skill));
            }

            const url = `http://localhost:5000/api/public/jobs?${params.toString()}`;
            const data = await requestCache.get(url, {
                ttl: 300000, // 5 minutes cache
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            });
            
            if (data.success) {
                const jobList = data.jobs || [];
                setJobs(jobList);
                onTotalChange?.(data.totalCount || jobList.length);
            } else {
                setJobs([]);
                onTotalChange?.(0);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
            setJobs([]);
            onTotalChange?.(0);
        } finally {
            setLoading(false);
            setIsFirstLoad(false);
        }
    }, [filters, onTotalChange]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);



    const JobCard = memo(({ job, index }) => {
        const handleApplyClick = useCallback(() => {
            window.location.href = `/job-detail/${job._id}`;
        }, [job._id]);

        const jobTypeClass = useMemo(() => {
            const typeMap = {
                'Full-time': 'green',
                'Part-time': 'brown', 
                'Contract': 'purple',
                'Internship': 'sky'
            };
            return typeMap[job.jobType] || 'golden';
        }, [job.jobType]);

        const ctcDisplay = useMemo(() => {
            if (job.ctc?.min && job.ctc?.max) {
                const minLPA = Math.floor(job.ctc.min / 100000);
                const maxLPA = Math.floor(job.ctc.max / 100000);
                return job.ctc.min === job.ctc.max ? `₹${minLPA}LPA` : `₹${minLPA} - ${maxLPA} LPA`;
            }
            return 'Not specified';
        }, [job.ctc]);

        return (
            <Col key={job._id} lg={6} md={12} className="mb-4">
                <div className="twm-jobs-grid-style1 hover-card job-card">
                    <div className="twm-media">
                        {job.employerProfile?.logo ? (
                            <img src={job.employerProfile.logo} alt="Company Logo" loading="lazy" />
                        ) : (
                            <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                        )}
                    </div>

                    <div className="twm-jobs-category green">
                        <span className={`twm-bg-${jobTypeClass}`}>
                            {job.jobType || 'Full-time'}
                        </span>
                    </div>

                    <div className="twm-mid-content">
                        <NavLink to={`${publicUser.jobs.DETAIL1}/${job._id}`} className="twm-job-title">
                            <h4>{job.title}</h4>
                        </NavLink>
                        <div className="twm-job-address">
                            <i className="feather-map-pin" />
                            &nbsp;{job.location}
                        </div>
                    </div>

                    <div className="twm-right-content twm-job-right-group">
                        <div className="twm-salary-and-apply mb-2">
                            <div className="twm-jobs-amount">
                                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1967d2', marginBottom: '4px' }}>
                                    Annual CTC: {ctcDisplay}
                                </div>
                            </div>
                            <span className="vacancy-text">Vacancies: {job.vacancies || 'N/A'}</span>
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                            <h6 className="twm-job-address posted-by-company mb-0">
                                Posted by {job.postedBy || 'Company'}
                            </h6>
                            <button 
                                className="btn btn-sm apply-now-button"
                                onClick={handleApplyClick}
                            >
                                Apply Now
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
        <>
            <Row>
                {loading && isFirstLoad && skeletonCards}

                {!loading && jobs.length > 0 ? 
                    jobs.map((job, index) => (
                        <JobCard key={job._id} job={job} index={index} />
                    )) : !loading && (
                        <Col xs={12} className="text-center py-5">
                            <h5>No jobs found</h5>
                            <p>Please check back later for new opportunities.</p>
                        </Col>
                    )
                }
            </Row>
            <SectionPagination />
        </>
    );
});

export default SectionJobsGrid;