import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import CountUp from "react-countup";
import { useEffect, useState } from "react";
import { loadScript, updateSkinStyle } from "../../../../../globals/constants";
import api from "../../../../../utils/api";
import HeroBody from "../../../../../components/HeroBody";
import { Container, Row, Col } from "react-bootstrap";
import HomeJobCard from "../../../../../components/HomeJobCard";
import "../../../../../new-job-card.css";

function Home16Page() {
    const [jobs, setJobs] = useState([]);
    const [allJobs, setAllJobs] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [stats, setStats] = useState({ totalJobs: 0, totalEmployers: 0, totalApplications: 0 });
    const [categories, setCategories] = useState([]);
    const [recruiters, setRecruiters] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFiltered, setIsFiltered] = useState(false);
    const [showingCount, setShowingCount] = useState(6);
    const [error, setError] = useState(null);
    const [dataLoadError, setDataLoadError] = useState({
        jobs: false,
        stats: false,
        recruiters: false
    });

    useEffect(() => {
        updateSkinStyle("8", false, false)
        loadScript("js/custom.js")
        fetchHomeData();

        // Add smooth scrolling behavior
        document.documentElement.style.scrollBehavior = 'smooth';

        // Add intersection observer for animations
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, { threshold: 0.1 });

        // Observe all sections that should animate
        const sections = document.querySelectorAll('.animate-on-scroll');
        sections.forEach(section => observer.observe(section));

        return () => {
            sections.forEach(section => observer.unobserve(section));
        };
    }, [])

    const fetchHomeData = async () => {
        setLoading(true);
        setError(null);
        const errors = { jobs: false, stats: false, recruiters: false };

        try {
            // Fetch jobs with error handling
            try {
                const jobsData = await api.getJobs({ limit: 50 });
                
                if (!jobsData) {
                    throw new Error('No response from jobs API');
                }
                
                if (jobsData.success) {
                    // Validate jobs data
                    if (!Array.isArray(jobsData.jobs)) {
                        throw new Error('Invalid jobs data format');
                    }
                    
                    // Show all jobs without filtering
                    const validJobs = jobsData.jobs || [];
                    console.log('Total jobs from API:', validJobs.length);
                    
                    setAllJobs(validJobs);
                    setJobs(validJobs.slice(0, 6));
                    
                    // Calculate category counts
                    const categoryCount = {};
                    validJobs.forEach(job => {
                        const category = job.category || 'Other';
                        categoryCount[category] = (categoryCount[category] || 0) + 1;
                    });
                    
                    const categoryList = [
                        { name: 'IT', count: categoryCount['IT'] || 0 },
                        { name: 'Content', count: categoryCount['Content'] || 0 },
                        { name: 'Sales', count: categoryCount['Sales'] || 0 },
                        { name: 'Healthcare', count: categoryCount['Healthcare'] || 0 },
                        { name: 'HR', count: categoryCount['HR'] || 0 }
                    ];
                    
                    setCategories(categoryList);
                } else {
                    throw new Error(jobsData.message || 'Failed to fetch jobs');
                }
            } catch (jobError) {
                console.error('Error fetching jobs:', jobError);
                errors.jobs = true;
                setAllJobs([]);
                setJobs([]);
            }

            // Fetch stats with error handling
            try {
                const pub = await api.getPublicStats();
                if (pub && pub.success && pub.stats) {
                    // Validate stats data
                    const validStats = {
                        totalJobs: Number(pub.stats.totalJobs) || 0,
                        totalEmployers: Number(pub.stats.totalEmployers) || 0,
                        totalApplications: Number(pub.stats.totalApplications) || 0
                    };
                    setStats(validStats);
                } else {
                    // Try admin stats as fallback
                    const adm = await api.getAdminStats();
                    if (adm && adm.success && adm.stats) {
                        const validStats = {
                            totalJobs: Number(adm.stats.totalJobs) || 0,
                            totalEmployers: Number(adm.stats.totalEmployers) || 0,
                            totalApplications: Number(adm.stats.totalApplications) || 0
                        };
                        setStats(validStats);
                    } else {
                        throw new Error('Failed to fetch stats');
                    }
                }
            } catch (statsError) {
                console.error('Error fetching stats:', statsError);
                errors.stats = true;
                setStats({ totalJobs: 0, totalEmployers: 0, totalApplications: 0 });
            }

            // Fetch recruiters with error handling
            try {
                const response = await fetch('http://localhost:5000/api/public/top-recruiters?limit=12');
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const recruitersData = await response.json();
                
                if (recruitersData && recruitersData.success) {
                    // Validate recruiters data
                    if (!Array.isArray(recruitersData.recruiters)) {
                        throw new Error('Invalid recruiters data format');
                    }
                    
                    // Sanitize recruiters data
                    const validRecruiters = recruitersData.recruiters.filter(recruiter => {
                        return recruiter && 
                               typeof recruiter === 'object' && 
                               recruiter._id && 
                               recruiter.companyName;
                    });
                    
                    setRecruiters(validRecruiters);
                } else {
                    throw new Error(recruitersData.message || 'Failed to fetch recruiters');
                }
            } catch (recruitersError) {
                console.error('Error fetching recruiters:', recruitersError);
                errors.recruiters = true;
                setRecruiters([]);
            }

            setDataLoadError(errors);
            
            // Set general error if all data failed to load
            if (errors.jobs && errors.stats && errors.recruiters) {
                setError('Unable to load page data. Please check your connection and try again.');
            }
        } catch (error) {
            console.error('Critical error fetching home data:', error);
            setError('An unexpected error occurred. Please refresh the page.');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (filters) => {
        try {
            // Validate filters object
            if (!filters || typeof filters !== 'object') {
                console.error('Invalid filters object');
                return;
            }

            console.log('Received filters:', filters);
            console.log('All jobs count:', allJobs.length);
            
            // Validate allJobs array
            if (!Array.isArray(allJobs)) {
                console.error('Invalid jobs data');
                setError('Unable to search jobs. Please refresh the page.');
                return;
            }
            
            let filtered = [...allJobs];
            
            // Filter by search term (job title, company name, or description)
            if (filters.search) {
                // Sanitize search term
                const searchTerm = String(filters.search).trim().toLowerCase();
                
                if (searchTerm.length < 2) {
                    alert('Search term must be at least 2 characters');
                    return;
                }
                
                if (searchTerm.length > 100) {
                    alert('Search term is too long');
                    return;
                }
                
                console.log('Filtering by search term:', searchTerm);
                filtered = filtered.filter(job => {
                    try {
                        return job.title?.toLowerCase().includes(searchTerm) ||
                               job.companyName?.toLowerCase().includes(searchTerm) ||
                               job.employerId?.companyName?.toLowerCase().includes(searchTerm) ||
                               job.description?.toLowerCase().includes(searchTerm) ||
                               job.category?.toLowerCase().includes(searchTerm);
                    } catch (err) {
                        console.error('Error filtering job:', err);
                        return false;
                    }
                });
                console.log('After search filter:', filtered.length);
            }
            
            // Filter by job type
            if (filters.jobType) {
                const jobType = String(filters.jobType).trim().toLowerCase();
                
                if (jobType.length > 50) {
                    alert('Job type filter is invalid');
                    return;
                }
                
                console.log('Filtering by job type:', jobType);
                filtered = filtered.filter(job => {
                    try {
                        const jobTypeField = job.jobType || job.type || '';
                        return jobTypeField.toLowerCase().includes(jobType);
                    } catch (err) {
                        console.error('Error filtering job by type:', err);
                        return false;
                    }
                });
                console.log('After job type filter:', filtered.length);
            }
            
            // Filter by location
            if (filters.location) {
                const location = String(filters.location).trim().toLowerCase();
                
                if (location.length < 2) {
                    alert('Location must be at least 2 characters');
                    return;
                }
                
                if (location.length > 100) {
                    alert('Location filter is too long');
                    return;
                }
                
                console.log('Filtering by location:', location);
                filtered = filtered.filter(job => {
                    try {
                        return job.location?.toLowerCase().includes(location);
                    } catch (err) {
                        console.error('Error filtering job by location:', err);
                        return false;
                    }
                });
                console.log('After location filter:', filtered.length);
            }
            
            console.log('Final filtered jobs:', filtered.length);
            
            setFilteredJobs(filtered);
            setJobs(filtered.slice(0, 6)); // Show first 6 filtered results
            setShowingCount(6);
            setIsFiltered(Object.keys(filters).length > 0);
            
            // Scroll to jobs section when search is performed
            if (Object.keys(filters).length > 0) {
                setTimeout(() => {
                    const jobsSection = document.querySelector('.twm-jobs-grid-wrap');
                    if (jobsSection) {
                        jobsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 100);
            }
        } catch (error) {
            console.error('Error in handleSearch:', error);
            setError('An error occurred while searching. Please try again.');
        }
    };
    
    const handleShowMore = () => {
        try {
            // Validate current state
            if (!Array.isArray(allJobs) || !Array.isArray(filteredJobs)) {
                console.error('Invalid jobs data');
                setError('Unable to load more jobs. Please refresh the page.');
                return;
            }
            
            const newCount = showingCount + 6;
            
            // Validate newCount
            if (newCount < 0 || newCount > 1000) {
                console.error('Invalid count value');
                return;
            }
            
            const sourceJobs = isFiltered ? filteredJobs : allJobs;
            const newJobs = sourceJobs.slice(0, newCount);
            
            setJobs(newJobs);
            setShowingCount(newCount);
        } catch (error) {
            console.error('Error in handleShowMore:', error);
            setError('An error occurred while loading more jobs.');
        }
    };

    return (
			<>
				{/* Error Alert */}
				{error && (
					<div style={{
						position: 'fixed',
						top: '80px',
						left: '50%',
						transform: 'translateX(-50%)',
						zIndex: 9999,
						maxWidth: '600px',
						width: '90%'
					}}>
						<div style={{
							backgroundColor: '#f8d7da',
							color: '#721c24',
							padding: '15px 20px',
							borderRadius: '8px',
							border: '1px solid #f5c6cb',
							boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between'
						}}>
							<div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<circle cx="12" cy="12" r="10"/>
									<line x1="12" y1="8" x2="12" y2="12"/>
									<line x1="12" y1="16" x2="12.01" y2="16"/>
								</svg>
								<span style={{ fontWeight: '500' }}>{error}</span>
							</div>
							<button
								onClick={() => setError(null)}
								style={{
									background: 'none',
									border: 'none',
									color: '#721c24',
									fontSize: '20px',
									cursor: 'pointer',
									padding: '0 5px',
									lineHeight: '1'
								}}
							>
								×
							</button>
						</div>
					</div>
				)}

				<HeroBody className="mt-4 mt-md-5" onSearch={handleSearch} />

				{/* Hidden banner section */}
				<div
					className="twm-home16-banner-section site-bg-light-purple"
					style={{ display: "none" }}
				>
					<Container className="py-5">
						<Row>
							{/*Left Section*/}
							<Col xl={6} lg={6} md={12}>
								<div className="twm-bnr-left-section">
									<div className="twm-bnr-title-small mb-4">
										We Have{" "}
										<span className="site-text-primary">
											{stats.totalJobs || "2,000"}+
										</span>{" "}
										Live Jobs
									</div>

									<div className="twm-bnr-title-large mb-4">
										Find the <span className="site-text-primary">job</span> that
										fits your life
									</div>

									<div className="twm-bnr-discription mb-4">
										Type your keyword, then click search to find your perfect
										job.
									</div>

									<div className="twm-bnr-search-bar mb-4">
										<form>
											<Row>
												{/*Title*/}
												<Col xl={3} lg={6} md={6} className="mb-3">
													<label>What</label>
													<select
														className="wt-search-bar-select selectpicker"
														data-live-search="true"
														title=""
														id="j-Job_Title"
														data-bv-field="size"
														defaultValue="Job Title"
													>
														<option disabled value="">
															Select Category
														</option>
														<option>Job Title</option>
														<option>Web Designer</option>
														<option>Developer</option>
														<option>Acountant</option>
													</select>
												</Col>

												{/*All Category*/}
												<Col xl={3} lg={6} md={6} className="mb-3">
													<label>Type</label>
													<select
														className="wt-search-bar-select selectpicker"
														data-live-search="true"
														title=""
														id="j-All_Category"
														data-bv-field="size"
														defaultValue="All Category"
													>
														<option disabled value="">
															Select Category
														</option>
														<option>All Category</option>
														<option>Full Time</option>
														<option>Internship</option>
														<option>Contract</option>
														<option>Work From Home</option>
													</select>
												</Col>

												{/*Location*/}
												<Col xl={3} lg={6} md={6} className="mb-3">
													<label>Location</label>
													<div className="twm-inputicon-box">
														<input
															name="username"
															type="text"
															required
															className="form-control"
															placeholder="Search..."
														/>
														<i className="twm-input-icon fas fa-map-marker-alt" />
													</div>
												</Col>

												{/*Find job btn*/}
												<Col xl={3} lg={6} md={6} className="mb-3">
													<NavLink to="/job-grid" className="site-button">
														Find Job
													</NavLink>
												</Col>
											</Row>
										</form>
									</div>

									<div className="twm-bnr-popular-search">
										<span className="twm-title">Popular Searches:</span>
										<NavLink to={"#!"}>Developer</NavLink> ,
										<NavLink to={"#!"}>Designer</NavLink> ,
										<NavLink to={"#!"}>Architect</NavLink> ,
										<NavLink to={"#!"}>Engineer</NavLink> ...
									</div>
								</div>
							</Col>

							{/*right Section*/}
							<Col xl={6} lg={6} md={12}>
								<div className="twm-h-page-16-bnr-right-section">
									<div className="twm-h-page16-bnr-pic">
										<JobZImage
											src="images/home-16/banner/bnr-pic.png"
											alt="#"
										/>
									</div>

									{/*Samll Ring Left*/}
									<div className="twm-small-ring-l bounce" />
									<div className="twm-small-ring-2 bounce2" />
									<div className="twm-bnr-right-carousel">
										<div className="twm-bnr-blocks-position-wrap">
											{/*icon-block-1*/}
											<div className="twm-bnr-blocks twm-bnr-blocks-position-1">
												<div className="twm-content">
													<div className="tw-count-number text-clr-sky">
														<span className="counter">
															<CountUp
																end={stats.totalEmployers || 2}
																duration={10}
															/>
														</span>
														+
													</div>
													<p className="icon-content-info">Companies</p>
												</div>
											</div>

											{/*icon-block-2*/}
											<div className="twm-bnr-blocks twm-bnr-blocks-position-2">
												<div className="twm-content">
													<div className="tw-count-number text-clr-pink">
														<span className="counter">
															<CountUp end={98} duration={10} />
														</span>{" "}
														+
													</div>
													<p className="icon-content-info">Job Categories</p>
												</div>
											</div>

											{/*icon-block-3*/}
											<div className="twm-bnr-blocks-3 twm-bnr-blocks-position-3">
												<div className="twm-content">
													<div className="tw-count-number text-clr-green">
														<span className="counter">
															<CountUp
																end={stats.totalApplications || 3}
																duration={10}
															/>
														</span>
														+
													</div>
													<p className="icon-content-info">Applications</p>
												</div>
											</div>
										</div>
									</div>
								</div>
							</Col>
						</Row>

						<div className="twm-img-bg-circle-area">
							<div className="twm-img-bg-circle1">
								<span />
							</div>

							<div className="twm-img-bg-circle2">
								<span />
							</div>

							<div className="twm-img-bg-circle3">
								<span />
							</div>
						</div>
					</Container>
				</div>

				{/* HOW IT WORK SECTION START */}
				<div className="section-full p-t70 p-b60 site-bg-gray twm-how-it-work-area animate-on-scroll">
					<Container className="py-5">
						{/* title="" START*/}
						<div className="section-head center wt-small-separator-outer mb-5">
							<div className="wt-small-separator site-text-primary">
								<div>Working Process</div>
							</div>

							<h2 className="wt-title">How It Works</h2>
						</div>
						{/* title="" END*/}

						<div className="twm-how-it-work-section3">
							<Row>
								<Col xl={3} lg={6} col={12} className="mb-4">
									<div className="twm-w-process-steps3 hover-card">
										<div className="twm-w-pro-top">
											<div className="twm-media">
												<span>
													<JobZImage
														src="images/work-process/icon1.png"
														alt="icon1"
													/>
												</span>
											</div>
										</div>

										<h4 className="twm-title">Register Your Account</h4>
										<p>You need to create an account to find the best jobs.</p>
									</div>
								</Col>

								<Col xl={3} lg={6} col={12} className="mb-4">
									<div className="twm-w-process-steps3 hover-card">
										<div className="twm-w-pro-top">
											<div className="twm-media">
												<span>
													<JobZImage
														src="images/work-process/icon4.png"
														alt="icon2"
													/>
												</span>
											</div>
										</div>

										<h4 className="twm-title">Search and Apply</h4>
										<p>Search your preferred jobs and apply the best jobs.</p>
									</div>
								</Col>

								<Col xl={3} lg={6} col={12} className="mb-4">
									<div className="twm-w-process-steps3 hover-card">
										<div className="twm-w-pro-top">
											<div className="twm-media">
												<span>
													<JobZImage
														src="images/work-process/icon3.png"
														alt="icon1"
													/>
												</span>
											</div>
										</div>

										<h4 className="twm-title">Take Assessment</h4>
										<p>Take assessment curated based on the job profile.</p>
									</div>
								</Col>

								<Col xl={3} lg={6} col={12} className="mb-4">
									<div className="twm-w-process-steps3 hover-card">
										<div className="twm-w-pro-top">
											<div className="twm-media">
												<span>
													<JobZImage
														src="images/work-process/icon2.png"
														alt="icon1"
													/>
												</span>
											</div>
										</div>

										<h4 className="twm-title">Recruitment Process</h4>
										<p>
											Interviews and discussion rounds scheduled by company.
										</p>
									</div>
								</Col>
							</Row>
						</div>
					</Container>
				</div>
				{/* HOW IT WORK SECTION END */}

				{/* HOW IT WORK SECTION 2 START */}
				<div className="section-full p-t70 p-b60 site-bg-gray twm-how-it-work-area animate-on-scroll">
					<Container className="py-5">
						{/* title="" START*/}
						<div className="section-head center wt-small-separator-outer mb-5">
							<div className="wt-small-separator site-text-primary">
								<div>Working Process</div>
							</div>

							<h2 className="wt-title">How It Works</h2>
						</div>
						{/* title="" END*/}

						<div className="twm-how-it-work-section3">
							<Row>
								<Col xl={3} lg={6} col={12} className="mb-4">
									<div className="twm-w-process-steps3 hover-card">
										<div className="twm-w-pro-top">
											<div className="twm-media">
												<span>
													<JobZImage
														src="images/work-process/icon1.png"
														alt="icon1"
													/>
												</span>
											</div>
										</div>

										<h4 className="twm-title">Register Your Account</h4>
										<p>You need to create an account to find the best jobs.</p>
									</div>
								</Col>

								<Col xl={3} lg={6} col={12} className="mb-4">
									<div className="twm-w-process-steps3 hover-card">
										<div className="twm-w-pro-top">
											<div className="twm-media">
												<span>
													<JobZImage
														src="images/work-process/icon4.png"
														alt="icon2"
													/>
												</span>
											</div>
										</div>

										<h4 className="twm-title">Search and Apply</h4>
										<p>Search your preferred jobs and apply the best jobs.</p>
									</div>
								</Col>

								<Col xl={3} lg={6} col={12} className="mb-4">
									<div className="twm-w-process-steps3 hover-card">
										<div className="twm-w-pro-top">
											<div className="twm-media">
												<span>
													<JobZImage
														src="images/work-process/icon3.png"
														alt="icon1"
													/>
												</span>
											</div>
										</div>

										<h4 className="twm-title">Take Assessment</h4>
										<p>Take assessment curated based on the job profile.</p>
									</div>
								</Col>

								<Col xl={3} lg={6} col={12} className="mb-4">
									<div className="twm-w-process-steps3 hover-card">
										<div className="twm-w-pro-top">
											<div className="twm-media">
												<span>
													<JobZImage
														src="images/work-process/icon2.png"
														alt="icon1"
													/>
												</span>
											</div>
										</div>

										<h4 className="twm-title">Recruitment Process</h4>
										<p>
											Interviews and discussion rounds scheduled by company.
										</p>
									</div>
								</Col>
							</Row>
						</div>
					</Container>
				</div>
				{/* HOW IT WORK SECTION 2 END */}

				{/* JOBS CATEGORIES SECTION START */}
				<div className="section-full p-t50 p-b50 site-bg-white twm-job-categories-hpage-6-area animate-on-scroll">
					{/* title="" START*/}
					<div className="section-head center wt-small-separator-outer mb-5">
						<div className="wt-small-separator site-text-primary">
							<div>Jobs by Categories</div>
						</div>

						<h2 className="wt-title">Choose a Relevant Category</h2>
					</div>
					{/* title="" END*/}
					<Container className="py-5">
						<div className="twm-job-cat-hpage-6-wrap">
							<div className="job-cat-block-hpage-6-section m-b30">
								<Row>
									{/* COLUMNS 1 */}
									<Col className="mb-4">
										<div className="job-cat-block-hpage-6 m-b30 hover-card">
											<div className="twm-media">
												<div className="flaticon-dashboard" />
											</div>
											<div className="twm-content">
												<NavLink to="/job-grid?category=IT">
													Programming &amp; Tech
												</NavLink>
												<div className="twm-jobs-available">
													<span>{categories[0]?.count || 0}+</span> Posted new
													jobs
												</div>
												<div className="circle-line-wrap">
													<NavLink
														to="/job-grid?category=IT"
														className="circle-line-btn"
													>
														<i className="fa fa-arrow-right" />
													</NavLink>
												</div>
											</div>
										</div>
									</Col>

									{/* COLUMNS 2 */}
									<Col className="mb-4">
										<div className="job-cat-block-hpage-6 m-b30 hover-card">
											<div className="twm-media">
												<div className="flaticon-project-management" />
											</div>
											<div className="twm-content">
												<NavLink to="/job-grid?category=Content">
													Content Writer
												</NavLink>
												<div className="twm-jobs-available">
													<span>{categories[1]?.count || 0}+</span> Posted new
													jobs
												</div>
												<div className="circle-line-wrap">
													<NavLink
														to="/job-grid?category=Content"
														className="circle-line-btn"
													>
														<i className="fa fa-arrow-right" />
													</NavLink>
												</div>
											</div>
										</div>
									</Col>

									{/* COLUMNS 3 */}
									<Col className="mb-4">
										<div className="job-cat-block-hpage-6 m-b30 hover-card">
											<div className="twm-media">
												<div className="flaticon-note" />
											</div>
											<div className="twm-content">
												<NavLink to="/job-grid?category=Sales">
													Sales & Marketing
												</NavLink>
												<div className="twm-jobs-available">
													<span>{categories[2]?.count || 0}+</span> Posted new
													jobs
												</div>
												<div className="circle-line-wrap">
													<NavLink
														to="/job-grid?category=Sales"
														className="circle-line-btn"
													>
														<i className="fa fa-arrow-right" />
													</NavLink>
												</div>
											</div>
										</div>
									</Col>

									{/* COLUMNS 4 */}
									<Col className="mb-4">
										<div className="job-cat-block-hpage-6 m-b30 hover-card">
											<div className="twm-media">
												<div className="flaticon-customer-support" />
											</div>
											<div className="twm-content">
												<NavLink to="/job-grid?category=Healthcare">
													Healthcare
												</NavLink>
												<div className="twm-jobs-available">
													<span>{categories[3]?.count || 0}+</span> Posted new
													jobs
												</div>
												<div className="circle-line-wrap">
													<NavLink
														to="/job-grid?category=Healthcare"
														className="circle-line-btn"
													>
														<i className="fa fa-arrow-right" />
													</NavLink>
												</div>
											</div>
										</div>
									</Col>

									{/* COLUMNS 5 */}
									<Col className="mb-4">
										<div className="job-cat-block-hpage-6 m-b30 hover-card">
											<div className="twm-media">
												<div className="flaticon-bars" />
											</div>
											<div className="twm-content">
												<NavLink to="/job-grid?category=HR">
													Human Resources
												</NavLink>
												<div className="twm-jobs-available">
													<span>{categories[4]?.count || 0}+</span> Posted new
													jobs
												</div>
												<div className="circle-line-wrap">
													<NavLink
														to="/job-grid?category=HR"
														className="circle-line-btn"
													>
														<i className="fa fa-arrow-right" />
													</NavLink>
												</div>
											</div>
										</div>
									</Col>
								</Row>
							</div>

							<div className="text-center job-categories-btn">
								<NavLink to={"#!"} className=" site-button">
									All Categories
								</NavLink>
							</div>
						</div>
					</Container>
				</div>
				{/* JOBS CATEGORIES SECTION END */}

				{/* JOB POST START */}
				<div className="section-full p-t50 p-b30 site-bg-gray twm-bg-ring-wrap2 animate-on-scroll">
					<div className="twm-bg-ring-right" />
					<div className="twm-bg-ring-left" />
					<Container className="py-5">
						<div className="wt-separator-two-part">
							<Row className="wt-separator-two-part-row">
								<Col
									xl={6}
									lg={6}
									md={12}
									className="wt-separator-two-part-left mb-4"
								>
									{/* title="" START*/}
									<div className="section-head left wt-small-separator-outer">
										<div className="wt-small-separator site-text-primary">
											<div>
												{isFiltered ? "Filtered Jobs" : "Top Recruiters"}
											</div>
										</div>

										<h2 className="wt-title">
											{isFiltered
												? `Found ${filteredJobs.length} Job${
														filteredJobs.length !== 1 ? "s" : ""
												  } Matching Your Search`
												: "Discover your next career move"}
										</h2>
									</div>
									{/* title="" END*/}
								</Col>

								<Col
									xl={6}
									lg={6}
									md={12}
									className="wt-separator-two-part-right text-right mb-4"
								>
									{isFiltered && (
										<button
											className="site-button me-3"
											onClick={() => {
												setJobs(allJobs.slice(0, 6));
												setFilteredJobs([]);
												setIsFiltered(false);
												setShowingCount(6);
												// Reset search form
												const searchForm =
													document.querySelector(".search-container");
												if (searchForm) {
													const selects = searchForm.querySelectorAll("select");
													selects.forEach((select) => (select.value = ""));
												}
											}}
											style={{ marginRight: "10px" }}
										>
											Clear Filters
										</button>
									)}
									<NavLink to="/job-grid" className=" site-button">
										Browse All Jobs
									</NavLink>
								</Col>
							</Row>
						</div>

						<div className="section-content">
							<div className="twm-jobs-grid-wrap">
								<Row>
									{jobs.length > 0 ? (
										jobs.map((job) => (
											<Col lg={4} md={6} key={job._id} className="mb-4">
												<div className="new-job-card">
													{/* Top Row */}
													<div className="job-card-header">
														<div className="job-card-left">
															<div className="company-logo">
																{job.employerProfile?.logo ? (
																	<img
																		src={
																			job.companyLogo ||
																			(job.employerProfile.logo?.startsWith("data:")
																				? job.employerProfile.logo
																				: `data:image/jpeg;base64,${job.employerProfile.logo}`)
																		}
																		alt="Company Logo"
																	/>
																) : (
																	<div className="logo-placeholder">
																		{(job.employerId?.companyName || "C").charAt(0)}
																	</div>
																)}
															</div>
															<div className="job-info">
																<h4 className="job-title">{job.title}</h4>
																<div className="job-location">
																	<i className="feather-map-pin" />
																	{job.location}
																</div>
															</div>
														</div>
														<div className="job-type-badge">
															<span className={`job-type-pill ${
																job.jobType === "Full-Time" ? "full-time" :
																job.jobType === "Part-Time" ? "part-time" :
																job.jobType === "Contract" ? "contract" :
																job.jobType?.includes("Internship") ? "internship" :
																job.jobType === "Work From Home" ? "wfh" : "full-time"
															}`}>
																{job.jobType || "Full-Time"}
															</span>
														</div>
													</div>

													{/* Middle Row */}
													<div className="job-card-middle">
														<div className="ctc-info">
															{job.ctc && typeof job.ctc === "object" && job.ctc.min > 0 && job.ctc.max > 0 ? (
																<span className="ctc-text">
																	Annual CTC: {job.ctc.min === job.ctc.max
																		? `₹${Math.floor(job.ctc.min / 100000)}LPA`
																		: `₹${Math.floor(job.ctc.min / 100000)} - ${Math.floor(job.ctc.max / 100000)} LPA`}
																</span>
															) : (
																<span className="ctc-text">CTC: Not specified</span>
															)}
														</div>
														<div className="vacancy-info">
															<span className="vacancy-text">
																Vacancies: {job.vacancies || "Not specified"}
															</span>
														</div>
													</div>

													{/* Bottom Row */}
													<div className="job-card-footer">
														<div className="company-info">
															<div className="posted-by-label">Posted by:</div>
															<div className="company-name">
																{job.employerId?.companyName || "Company"}
															</div>
															<div className="poster-type">
																{job.postedBy || (job.employerId?.employerType === "consultant" ? "Consultancy" : "Company")}
															</div>
														</div>
														<button
															className="apply-now-btn"
															onClick={() => {
																if (job._id && String(job._id).trim()) {
																	const sanitizedJobId = String(job._id).replace(/[^a-zA-Z0-9]/g, '');
																	if (sanitizedJobId) {
																		window.location.href = `/job-detail/${sanitizedJobId}`;
																	} else {
																		alert('Invalid job ID. Cannot navigate to job details.');
																	}
																} else {
																	alert('Job ID is missing. Cannot navigate to job details.');
																}
															}}
														>
															Apply Now
														</button>
													</div>
												</div>
											</Col>
										))
									) : (
										<Col xs={12} className="text-center">
											<p>
												{isFiltered
													? "No jobs found matching your search criteria."
													: "No jobs available at the moment."}
											</p>
											{isFiltered && (
												<button
													className="site-button mt-3"
													onClick={() => {
														setJobs(allJobs.slice(0, 6));
														setFilteredJobs([]);
														setIsFiltered(false);
														setShowingCount(6);
														// Reset search form
														const searchForm =
															document.querySelector(".search-container");
														if (searchForm) {
															const selects =
																searchForm.querySelectorAll("select");
															selects.forEach((select) => (select.value = ""));
														}
													}}
												>
													View All Jobs
												</button>
											)}
										</Col>
									)}
								</Row>
							</div>
						</div>
					</Container>
				</div>
				{/* JOB POST END */}

				{/* Recruiters START */}
				<div className="section-full p-t50 p-b30 site-bg-white animate-on-scroll">
					<Container className="py-5">
						{/* title="" START*/}
						<div className="section-head center wt-small-separator-outer mb-5">
							<div className="wt-small-separator site-text-primary">
								<div>Top Recruiters</div>
							</div>
							<h2 className="wt-title">Discover your next career move</h2>
						</div>
						{/* title="" END*/}

						<div className="section-content">
							<div className="twm-recruiters5-wrap">
								<div
									className="twm-column-5 m-b30"
									style={{
										"--cards-per-row": "6",
									}}
								>
									<ul>
										{loading ? (
											<li>
												<div className="text-center py-4">
													<div className="spinner-border" role="status">
														<span className="sr-only">Loading...</span>
													</div>
												</div>
											</li>
										) : recruiters.length > 0 ? (
											recruiters.map((recruiter, index) => {
												const generateCompanyLogo = (companyName) => {
													const colors = [
														"#007bff",
														"#28a745",
														"#dc3545",
														"#ffc107",
														"#17a2b8",
														"#6f42c1",
													];
													const color =
														colors[companyName.length % colors.length];
													const initials = companyName
														.split(" ")
														.map((word) => word[0])
														.join("")
														.substring(0, 2)
														.toUpperCase();

													return (
														<div
															style={{
																width: "60px",
																height: "60px",
																backgroundColor: color,
																color: "white",
																display: "flex",
																alignItems: "center",
																justifyContent: "center",
																fontSize: "18px",
																fontWeight: "bold",
																borderRadius: "8px",
															}}
														>
															{initials}
														</div>
													);
												};

												return (
													<li key={recruiter._id}>
														<div className="twm-recruiters5-box hover-card">
															<div className="twm-rec-top">
																<div className="twm-rec-media">
																	{recruiter.logo ? (
																		<img
																			src={recruiter.logo}
																			alt={recruiter.companyName}
																			style={{
																				width: "60px",
																				height: "60px",
																				objectFit: "cover",
																				borderRadius: "8px"
																			}}
																		/>
																	) : (
																		generateCompanyLogo(recruiter.companyName)
																	)}
																</div>
																<div className="twm-rec-jobs">
																	{recruiter.jobCount} {recruiter.jobCount === 1 ? 'Job' : 'Jobs'}
																</div>
															</div>
															<div className="twm-rec-content">
																<h4 className="twm-title">
																	<NavLink
																		to={`/job-grid?employerId=${recruiter._id}`}
																	>
																		{recruiter.companyName}
																	</NavLink>
																</h4>
																<div className="twm-job-address" style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxHeight: '20px'}}>
																	<i className="feather-map-pin" />
																	{recruiter.location || "Multiple Locations"}
																</div>
															</div>
														</div>
													</li>
												);
											})
										) : (
											<li>
												<div className="text-center py-4">
													<p className="text-muted">No recruiters available at the moment.</p>
												</div>
											</li>
										)}
									</ul>
								</div>

								<div className="text-center m-b30">
									<NavLink to="/emp-grid" className=" site-button">
										View All
									</NavLink>
								</div>
							</div>
						</div>
					</Container>
				</div>
				{/* Recruiters END */}

				{/* TOP COMPANIES START */}
				<div className="section-full p-t60 p-b80 site-bg-white twm-companies-wrap twm-companies-wrap-h-page-7 pos-relative animate-on-scroll">
					<div className="twm-companies-wrap-bg-block" />
					{/* title="" START*/}
					<div className="section-head center wt-small-separator-outer content-white mb-5">
						<div className="wt-small-separator site-text-primary">
							<div>Top Companies</div>
						</div>
						<h2 className="wt-title">Get hired in top companies</h2>
					</div>
					{/* title="" END*/}

					<Container className="py-5">
						<div className="twm-companies-h-page-7">
							<div className="section-content">
								<div className="owl-carousel home-client-carousel3 owl-btn-vertical-center">
									<div className="item">
										<div className="ow-client-logo">
											<div className="client-logo client-logo-media">
												<NavLink to={"#!"}>
													<JobZImage src="images/client-logo2/w1.png" alt="" />
												</NavLink>
											</div>
										</div>
									</div>

									<div className="item">
										<div className="ow-client-logo">
											<div className="client-logo client-logo-media">
												<NavLink to={"#!"}>
													<JobZImage src="images/client-logo2/w2.png" alt="" />
												</NavLink>
											</div>
										</div>
									</div>

									<div className="item">
										<div className="ow-client-logo">
											<div className="client-logo client-logo-media">
												<NavLink to={"#!"}>
													<JobZImage src="images/client-logo2/w3.png" alt="" />
												</NavLink>
											</div>
										</div>
									</div>

									<div className="item">
										<div className="ow-client-logo">
											<div className="client-logo client-logo-media">
												<NavLink to={"#!"}>
													<JobZImage src="images/client-logo2/w4.png" alt="" />
												</NavLink>
											</div>
										</div>
									</div>

									<div className="item">
										<div className="ow-client-logo">
											<div className="client-logo client-logo-media">
												<NavLink to={"#!"}>
													<JobZImage src="images/client-logo2/w5.png" alt="" />
												</NavLink>
											</div>
										</div>
									</div>

									<div className="item">
										<div className="ow-client-logo">
											<div className="client-logo client-logo-media">
												<NavLink to={"#!"}>
													<JobZImage src="images/client-logo2/w6.png" alt="" />
												</NavLink>
											</div>
										</div>
									</div>
									<div className="item">
										<div className="ow-client-logo">
											<div className="client-logo client-logo-media">
												<NavLink to={"#!"}>
													<JobZImage src="images/client-logo2/w1.png" alt="" />
												</NavLink>
											</div>
										</div>
									</div>
									<div className="item">
										<div className="ow-client-logo">
											<div className="client-logo client-logo-media">
												<NavLink to={"#!"}>
													<JobZImage src="images/client-logo2/w2.png" alt="" />
												</NavLink>
											</div>
										</div>
									</div>
									<div className="item">
										<div className="ow-client-logo">
											<div className="client-logo client-logo-media">
												<NavLink to={"#!"}>
													<JobZImage src="images/client-logo2/w3.png" alt="" />
												</NavLink>
											</div>
										</div>
									</div>
									<div className="item">
										<div className="ow-client-logo">
											<div className="client-logo client-logo-media">
												<NavLink to={"#!"}>
													<JobZImage src="images/client-logo2/w5.png" alt="" />
												</NavLink>
											</div>
										</div>
									</div>
								</div>
							</div>

							<div className="twm-company-approch2-outer">
								<div className="twm-company-approch2">
									<Row className="mb-4">
										{/*block 1*/}
										<Col lg={4} md={4} className="mb-4">
											<div className="counter-outer-two">
												<div className="icon-content">
													<div className="tw-count-number site-text-primary">
														<span className="counter">
															<CountUp end={5} duration={10} />
														</span>
														M+
													</div>
													<p className="icon-content-info">
														Million daily active users
													</p>
												</div>
											</div>
										</Col>

										{/*block 2*/}
										<Col lg={4} md={4} className="mb-4">
											<div className="counter-outer-two">
												<div className="icon-content">
													<div className="tw-count-number site-text-primary">
														<span className="counter">
															<CountUp end={9} duration={10} />
														</span>
														K+
													</div>
													<p className="icon-content-info">
														Open job positions
													</p>
												</div>
											</div>
										</Col>

										{/*block 3*/}
										<Col lg={4} md={4} className="mb-4">
											<div className="counter-outer-two">
												<div className="icon-content">
													<div className="tw-count-number site-text-primary">
														<span className="counter">
															<CountUp end={2} duration={10} />
														</span>
														M+
													</div>
													<p className="icon-content-info">
														Million stories shared
													</p>
												</div>
											</div>
										</Col>
									</Row>
								</div>
							</div>
						</div>
					</Container>
				</div>
				{/* TOP COMPANIES END */}
			</>
		);
}

export default Home16Page;