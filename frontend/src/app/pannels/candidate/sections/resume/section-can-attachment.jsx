import { useEffect, useState } from "react";
import { api } from "../../../../../utils/api";

function SectionCanAttachment({ profile }) {
    const [uploading, setUploading] = useState(false);
    const [resumeFile, setResumeFile] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        if (profile?.resumeFileName) {
            setResumeFile(profile.resumeFileName);
        } else {
            setResumeFile(null);
        }
    }, [profile?.resumeFileName]);

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        setSelectedFile(file);
    };

    const handleSubmit = async () => {
        if (!selectedFile) {
            alert('Please select a file first');
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('resume', selectedFile);

        try {
            const response = await api.uploadResume(formData);
            if (response.success) {
                alert('Resume uploaded successfully!');
                setResumeFile(selectedFile.name);
                setSelectedFile(null);
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            }
        } catch (error) {
            alert('Failed to upload resume');
        } finally {
            setUploading(false);
        }
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn ">
                <h4 className="panel-tittle m-a0">
                    <i className="fa fa-paperclip site-text-primary me-2"></i>
                    Attach Resume
                </h4>
            </div>
            <div className="panel-body wt-panel-body p-a20 ">
                <div className="twm-panel-inner">
                    <p>Resume is the most important document recruiters look for. Recruiters generally do not look at profiles without resumes.</p>
                    <div className="dashboard-cover-pic">
                        <div className="mb-3">
                            <label className="form-label">
                                <i className="fa fa-file-text me-1"></i>
                                Choose Resume File
                            </label>
                            <div className="position-relative">
                                <input 
                                    type="file" 
                                    accept=".pdf,.doc,.docx" 
                                    onChange={handleFileSelect}
                                    disabled={uploading}
                                    className="form-control"
                                    style={{opacity: 0, position: 'absolute', zIndex: 2}}
                                />
                                <div className="form-control d-flex align-items-center" style={{cursor: 'pointer', color: '#6c757d'}}>
                                    {resumeFile ? `Current: ${resumeFile}` : 'No file chosen'}
                                </div>
                            </div>
                        </div>
                        {selectedFile && (
                            <p className="text-info">
                                <i className="fa fa-file me-1"></i>
                                Selected: {selectedFile.name}
                            </p>
                        )}
                        <button 
                            type="button" 
                            className="btn btn-outline-primary mb-3"
                            onClick={handleSubmit}
                            disabled={uploading || !selectedFile}
                            style={{backgroundColor: 'transparent'}}
                        >
                            <i className="fa fa-upload me-1"></i>
                            {uploading ? 'Uploading...' : 'Submit Resume'}
                        </button>
                        {resumeFile && (
                            <p className="text-success">
                                <i className="fa fa-check-circle me-1"></i>
                                Current resume: <span style={{color: '#28a745', fontWeight: 'bold'}}>{resumeFile}</span>
                            </p>
                        )}
                        <p className="text-muted small">
                            <i className="fa fa-info-circle me-1"></i>
                            Upload Resume File size max 3 MB
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
export default SectionCanAttachment;
