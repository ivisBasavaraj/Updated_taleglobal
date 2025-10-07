import React from 'react';
import { X, Calendar, Clock, FileText } from 'lucide-react';

const PopupInterviewRoundDetails = ({ isOpen, onClose, roundDetails, roundType }) => {
    if (!isOpen) return null;

    const roundNames = {
        technical: 'Technical Round',
        nonTechnical: 'Non-Technical Round',
        managerial: 'Managerial Round',
        final: 'Final Round',
        hr: 'HR Round'
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const formatTime = (timeString) => {
        if (!timeString) return 'Not set';
        return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <div className="modal fade show" style={{ display: 'block', backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content" style={{ borderRadius: '12px', border: 'none' }}>
                    <div className="modal-header" style={{ 
                        background: 'linear-gradient(135deg, #f97316 0%, #ea580c 100%)', 
                        color: 'white',
                        borderRadius: '12px 12px 0 0'
                    }}>
                        <h5 className="modal-title d-flex align-items-center gap-2">
                            <FileText size={20} />
                            {roundNames[roundType] || 'Interview Round Details'}
                        </h5>
                        <button 
                            type="button" 
                            className="btn-close btn-close-white" 
                            onClick={onClose}
                            style={{ filter: 'invert(1)' }}
                        ></button>
                    </div>
                    <div className="modal-body" style={{ padding: '2rem' }}>
                        {roundDetails ? (
                            <div className="row">
                                <div className="col-12 mb-4">
                                    <div className="card" style={{ 
                                        border: '1px solid #e5e7eb', 
                                        borderRadius: '8px',
                                        background: '#f8fafc'
                                    }}>
                                        <div className="card-body">
                                            <h6 className="card-title text-primary mb-3">
                                                Round Information
                                            </h6>
                                            
                                            <div className="row">
                                                <div className="col-md-6 mb-3">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <Calendar size={16} style={{ color: '#f97316' }} />
                                                        <strong>From Date</strong>
                                                    </div>
                                                    <p className="text-muted mb-0 ms-4">
                                                        {formatDate(roundDetails.fromDate)}
                                                    </p>
                                                </div>
                                                
                                                <div className="col-md-6 mb-3">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <Calendar size={16} style={{ color: '#f97316' }} />
                                                        <strong>To Date</strong>
                                                    </div>
                                                    <p className="text-muted mb-0 ms-4">
                                                        {formatDate(roundDetails.toDate)}
                                                    </p>
                                                </div>
                                                
                                                <div className="col-md-6 mb-3">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <Clock size={16} style={{ color: '#f97316' }} />
                                                        <strong>Time</strong>
                                                    </div>
                                                    <p className="text-muted mb-0 ms-4">
                                                        {formatTime(roundDetails.time)}
                                                    </p>
                                                </div>
                                            </div>
                                            
                                            {roundDetails.description && (
                                                <div className="mt-3">
                                                    <div className="d-flex align-items-center gap-2 mb-2">
                                                        <FileText size={16} style={{ color: '#f97316' }} />
                                                        <strong>Description</strong>
                                                    </div>
                                                    <div className="ms-4">
                                                        <div className="p-3" style={{ 
                                                            background: 'white', 
                                                            borderRadius: '6px',
                                                            border: '1px solid #e5e7eb'
                                                        }}>
                                                            <p className="mb-0" style={{ 
                                                                whiteSpace: 'pre-wrap',
                                                                wordBreak: 'break-word'
                                                            }}>
                                                                {roundDetails.description}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4">
                                <div className="mb-3">
                                    <FileText size={48} className="text-muted" />
                                </div>
                                <h6 className="text-muted">No details available for this round</h6>
                                <p className="text-muted mb-0">
                                    Round details have not been configured yet.
                                </p>
                            </div>
                        )}
                    </div>
                    <div className="modal-footer" style={{ 
                        borderTop: '1px solid #e5e7eb',
                        padding: '1rem 2rem'
                    }}>
                        <button 
                            type="button" 
                            className="btn btn-secondary" 
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PopupInterviewRoundDetails;