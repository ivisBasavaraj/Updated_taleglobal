import { useNavigate } from 'react-router-dom';
import { isAuthenticated, redirectToLogin } from '../utils/auth';

const JobCard = ({ job }) => {
    const navigate = useNavigate();

    const handleApplyClick = () => {
        if (isAuthenticated('candidate')) {
            // User is logged in as candidate, proceed with application
            navigate(`/job-detail/${job._id}`);
        } else {
            // User not logged in, redirect to login
            redirectToLogin(navigate, `/job-detail/${job._id}`);
        }
    };

    const handleViewDetails = () => {
        navigate(`/job-detail/${job._id}`);
    };

    return (
        <div className="job-card">
            <div className="job-header">
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    {job.companyLogo && (
                        <img
                            src={job.companyLogo}
                            alt="Company Logo"
                            style={{
                                width: '40px',
                                height: '40px',
                                objectFit: 'cover',
                                borderRadius: '4px', // or '50%' for circular
                            }}
                        />
                    )}
                    <div>
                        <h3 style={{ marginTop: 0, marginBottom: '5px', fontSize: '1.2em' }}>{job.title}</h3>
                        <p style={{margin: 0, marginBottom: '4px'}}>{job.companyName || job.employerId?.companyName || job.company}</p>
                        <span>{job.location}</span>
                    </div>
                </div>
                <div className="posted-by-info" style={{fontSize: '12px', color: '#666', marginTop: '4px'}}>
                    Posted by: {job.employerId?.employerType === 'consultant' ? 'Consultancy' : 'Company'}
                </div>
            </div>

            <div className="job-details">
                <p>{job.description}</p>
                <div className="job-meta">
                    <span>CTC: {job.ctc && job.ctc.min && job.ctc.max ?
                        job.ctc.min === job.ctc.max ? `₹${Math.floor(job.ctc.min/100000)}LPA` : `₹${Math.floor(job.ctc.min/100000)} - ${Math.floor(job.ctc.max/100000)} LPA` :
                        'Not specified'}</span>
                    <span>Type: {job.jobType || job.type}</span>
                    {job.category && <span>Category: {job.category}</span>}
                </div>
            </div>

            <div className="job-actions">
                <button onClick={handleViewDetails} className="btn-view">
                    View Details
                </button>
                <button onClick={handleApplyClick} className="btn-apply">
                    {isAuthenticated('candidate') ? 'Apply Now' : 'Login to Apply'}
                </button>
            </div>
        </div>
    );
};

export default JobCard;