import React, { useEffect, useState } from 'react';

const JobDebugComponent = () => {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                console.log('Fetching jobs...');
                const response = await fetch('http://localhost:5000/api/public/jobs?limit=3');
                const data = await response.json();
                
                console.log('API Response:', data);
                
                if (data.success) {
                    setJobs(data.jobs || []);
                    console.log('Jobs set:', data.jobs);
                } else {
                    setError('Failed to fetch jobs');
                }
            } catch (err) {
                console.error('Error fetching jobs:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    if (loading) return <div>Loading jobs...</div>;
    if (error) return <div>Error: {error}</div>;

    return (
        <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
            <h2>Job Debug Component</h2>
            <p>Total jobs: {jobs.length}</p>
            
            {jobs.map((job, index) => (
                <div key={job._id} style={{
                    border: '1px solid #ccc',
                    borderRadius: '8px',
                    padding: '16px',
                    margin: '16px 0',
                    backgroundColor: '#f9f9f9'
                }}>
                    <h3>Job {index + 1}</h3>
                    <p><strong>ID:</strong> {job._id}</p>
                    <p><strong>Title:</strong> {job.title}</p>
                    <p><strong>Location:</strong> {job.location}</p>
                    <p><strong>Job Type:</strong> {job.jobType}</p>
                    <p><strong>Vacancies:</strong> {job.vacancies}</p>
                    <p><strong>CTC:</strong> {JSON.stringify(job.ctc)}</p>
                    <p><strong>Company:</strong> {job.employerId?.companyName}</p>
                    <p><strong>Posted By:</strong> {job.postedBy}</p>
                    <p><strong>Logo:</strong> {job.employerProfile?.logo ? 'Available' : 'Not available'}</p>
                    
                    <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#e6f3ff', borderRadius: '4px' }}>
                        <strong>CTC Calculation:</strong>
                        {job.ctc?.min && job.ctc?.max ? (
                            <span>
                                {job.ctc.min === job.ctc.max 
                                    ? `₹${Math.floor(job.ctc.min / 100000)}LPA`
                                    : `₹${Math.floor(job.ctc.min / 100000)} - ${Math.floor(job.ctc.max / 100000)} LPA`
                                }
                            </span>
                        ) : (
                            <span>Not specified</span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default JobDebugComponent;