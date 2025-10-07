import JobZImage from "../../../../common/jobz-img";
import { NavLink } from "react-router-dom";
import { publicUser } from "../../../../../globals/route-names";
import SectionPagination from "../common/section-pagination";
import { useState, useEffect } from "react";

function SectionJobsList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/public/jobs');
            const data = await response.json();
            if (data.success) {
                setJobs(data.jobs);
            }
        } catch (error) {
            console.error('Error fetching jobs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center p-5">Loading jobs...</div>;
    }

    return (
        <>
            <div>
                <div className="twm-jobs-list-wrap">
                    <ul>
                        {jobs.length > 0 ? jobs.map((job) => (
                            <li key={job._id}>
                                <div className="twm-jobs-list-style1 mb-5">
                                    <div className="twm-media">
                                        <JobZImage src="images/jobs-company/pic1.jpg" alt="#" />
                                    </div>
                                    <div className="twm-mid-content">
                                        <NavLink to={`${publicUser.jobs.DETAIL1}/${job._id}`} className="twm-job-title">
                                            <h4>{job.title}<span className="twm-job-post-duration">/ {new Date(job.createdAt).toLocaleDateString()}</span></h4>
                                        </NavLink>
                                        <p className="twm-job-address">{job.location}</p>
                                        {job.companyName && (
                                            <p className="twm-job-websites" style={{color: '#666', fontSize: '14px', margin: '4px 0'}}>
                                                <i className="feather-briefcase" style={{marginRight: '4px'}} />
                                                {job.companyName}
                                            </p>
                                        )}
                                        <span className="twm-job-websites site-text-primary">{job.jobType}</span>
                                        <div style={{fontSize: '12px', color: '#888', marginTop: '4px'}}>
                                            <i className="feather-user" style={{marginRight: '4px'}} />
                                            Posted by: <strong>{job.employerId?.employerType === 'consultant' || job.companyName ? 'Consultancy' : 'Company'}</strong>
                                        </div>
                                    </div>
                                    <div className="twm-right-content">
                                        <div className="twm-jobs-category green">
                                            <span className={`twm-bg-${job.status === 'active' ? 'green' : 'gray'}`}>
                                                {job.status === 'active' ? 'Active' : 'Closed'}
                                            </span>
                                        </div>
                                        <div className="twm-jobs-amount">
                                            {job.ctc && job.ctc.min && job.ctc.max ? (
                                                job.ctc.min === job.ctc.max ? `₹${Math.floor(job.ctc.min/100000)}LPA` : `₹${Math.floor(job.ctc.min/100000)} - ${Math.floor(job.ctc.max/100000)} LPA`
                                            ) : (
                                                'CTC not specified'
                                            )}
                                        </div>
                                        <NavLink to={`${publicUser.jobs.DETAIL1}/${job._id}`} className="twm-jobs-browse site-text-primary">Browse Job</NavLink>
                                    </div>
                                </div>
                            </li>
                        )) : (
                            <li>
                                <div className="text-center p-5">
                                    <h5>No jobs found</h5>
                                    <p>Please check back later for new opportunities.</p>
                                </div>
                            </li>
                        )}
                    </ul>
                </div>
                <SectionPagination />
            </div>

        </>
    )
}

export default SectionJobsList;