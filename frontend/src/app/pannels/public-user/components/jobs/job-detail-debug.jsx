import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

function JobDetailDebug() {
    const { id } = useParams();
    const [job, setJob] = useState(null);

    useEffect(() => {
        const fetchJob = async () => {
            try {
                const response = await fetch(`http://localhost:5000/api/public/jobs/${id}`);
                const data = await response.json();
                console.log('Job API Response:', data);
                if (data.success) {
                    setJob(data.job);
                    console.log('Employer Profile:', data.job.employerProfile);
                    console.log('Logo exists:', !!data.job.employerProfile?.logo);
                    console.log('Cover exists:', !!data.job.employerProfile?.coverImage);
                }
            } catch (error) {
                console.error('Error:', error);
            }
        };
        
        if (id) fetchJob();
    }, [id]);

    if (!job) return <div>Loading...</div>;

    return (
        <div style={{padding: '20px'}}>
            <h2>Debug Job Images</h2>
            <p><strong>Job ID:</strong> {job._id}</p>
            <p><strong>Job Title:</strong> {job.title}</p>
            <p><strong>Company:</strong> {job.employerId?.companyName}</p>
            
            <h3>Employer Profile Data:</h3>
            <p><strong>Profile exists:</strong> {job.employerProfile ? 'YES' : 'NO'}</p>
            
            {job.employerProfile && (
                <>
                    <p><strong>Logo exists:</strong> {job.employerProfile.logo ? 'YES' : 'NO'}</p>
                    <p><strong>Cover exists:</strong> {job.employerProfile.coverImage ? 'YES' : 'NO'}</p>
                    
                    {job.employerProfile.logo && (
                        <div>
                            <h4>Logo:</h4>
                            <img 
                                src={job.employerProfile.logo} 
                                alt="Logo" 
                                style={{maxWidth: '200px', border: '1px solid #ccc'}}
                                onError={(e) => {
                                    console.error('Logo failed to load');
                                    e.target.style.border = '2px solid red';
                                }}
                                onLoad={() => console.log('Logo loaded successfully')}
                            />
                        </div>
                    )}
                    
                    {job.employerProfile.coverImage && (
                        <div>
                            <h4>Cover Image:</h4>
                            <img 
                                src={job.employerProfile.coverImage} 
                                alt="Cover" 
                                style={{maxWidth: '400px', border: '1px solid #ccc'}}
                                onError={(e) => {
                                    console.error('Cover failed to load');
                                    e.target.style.border = '2px solid red';
                                }}
                                onLoad={() => console.log('Cover loaded successfully')}
                            />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default JobDetailDebug;