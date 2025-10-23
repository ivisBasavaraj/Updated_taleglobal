import { useState, useEffect } from "react";
import { api } from "../../../../../utils/api";

function SectionCanProfileSummary({ profile }) {
    const [summary, setSummary] = useState('');
    const [loading, setLoading] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        setSummary(profile?.profileSummary || '');
    }, [profile]);

    const handleSave = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('candidateToken');
            
            const response = await fetch('http://localhost:5000/api/candidate/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ profileSummary: summary.trim() })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                setIsEditing(false);
                alert('Profile summary updated successfully!');
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                alert('Failed to update profile summary: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            alert('Failed to update profile summary: ' + error.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 d-flex justify-content-between align-items-center">
                <h4 className="panel-tittle m-a0">
                    <i className="fa fa-user-circle site-text-primary me-2"></i>
                    Profile Summary
                </h4>
                <button 
                    type="button"
                    className="btn btn-link site-text-primary p-0"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsEditing(!isEditing);
                    }}
                >
                    <i className={isEditing ? "fa fa-times" : "fa fa-edit"}></i>
                </button>
            </div>
            <div className="panel-body wt-panel-body p-a20">
                {isEditing ? (
                    <div className="edit-form">
                        <div className="alert alert-info mb-3">
                            <i className="fa fa-info-circle me-2"></i>
                            Mention highlights of your career, education, and professional interests.
                        </div>
                        <textarea 
                            className="form-control mb-3" 
                            placeholder="e.g., Passionate software developer with 2+ years of experience in full-stack development. Skilled in React, Node.js, and database management."
                            value={summary}
                            onChange={(e) => setSummary(e.target.value)}
                            rows={5}
                            maxLength={1000}
                        />
                        <div className="d-flex justify-content-between align-items-center">
                            <small className="text-muted">{summary.length}/1000 characters</small>
                            <div>
                                <button 
                                    type="button"
                                    className="btn btn-secondary btn-sm me-2"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setIsEditing(false);
                                    }}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button"
                                    className="btn btn-primary btn-sm"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        handleSave();
                                    }}
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Save'}
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="twm-panel-inner">
                        <p>{summary || 'Add your profile summary to highlight your career and education'}</p>
                    </div>
                )}
            </div>
        </>
    )
}
export default SectionCanProfileSummary;
