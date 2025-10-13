import { useState, useEffect } from 'react';
import { api } from '../../../utils/api';
import { useAuth } from '../../../contexts/AuthContext';
import './placement-dashboard.css';

function PlacementDashboard() {
    const { user, userType, isAuthenticated } = useAuth();
    const [placementData, setPlacementData] = useState(null);
    const [studentData, setStudentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingFile, setUploadingFile] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [processingFiles, setProcessingFiles] = useState({});
    const [placementId, setPlacementId] = useState(null);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [showStudentModal, setShowStudentModal] = useState(false);
    const [customFileName, setCustomFileName] = useState('');
    const [showNameModal, setShowNameModal] = useState(false);
    const [pendingFile, setPendingFile] = useState(null);

    useEffect(() => {
        fetchPlacementDetails();
        
        // Auto-refresh every 30 seconds to check for status updates
        const interval = setInterval(() => {
            fetchPlacementDetails();
        }, 30000);
        
        return () => clearInterval(interval);
    }, []);

    const fetchPlacementDetails = async () => {
        try {
            setLoading(true);
            
            if (!isAuthenticated() || userType !== 'placement') {
                console.error('Not authenticated as placement officer');
                return;
            }
            
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const profileResponse = await fetch(`${API_BASE_URL}/placement/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (!profileResponse.ok) return;
            
            const profileData = await profileResponse.json();
            const userEmail = profileData.placement?.email;
            
            if (!userEmail) return;
            
            const allPlacementsResponse = await api.getAllPlacements();
            if (!allPlacementsResponse.success) return;
            
            const userPlacement = allPlacementsResponse.data.find(placement => 
                placement.email === userEmail
            );
            
            if (!userPlacement) return;
            
            const response = await api.getPlacementDetails(userPlacement._id);
            if (response.success) {
                setPlacementData(response.placement);
                setPlacementId(userPlacement._id);
                fetchStudentData(userPlacement._id);
                
                // Save dashboard data to database
                saveDashboardData({
                    placementData: response.placement,
                    studentCount: studentData.length,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error fetching placement details:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const saveDashboardData = async (dashboardData) => {
        try {
            const token = localStorage.getItem('placementToken');
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            await fetch(`${API_BASE_URL}/placement/save-dashboard-state`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ dashboardData })
            });
        } catch (error) {
            console.error('Error saving dashboard data:', error);
        }
    };

    const fetchStudentData = async (placementId) => {
        try {
            // Use placement-specific endpoint instead of admin endpoint
            const data = await api.getMyPlacementData();
            if (data.success) {
                setStudentData(data.students || []);
            } else {
                console.error('Failed to fetch student data:', data.message);
            }
        } catch (error) {
            console.error('Error fetching student data:', error);
        }
    };

    const validateFileFormat = (file) => {
        const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel',
            'text/csv'
        ];
        
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload only Excel (.xlsx, .xls) or CSV files.');
            return false;
        }
        
        if (file.size > 5 * 1024 * 1024) {
            alert('File size should be less than 5MB.');
            return false;
        }
        
        return true;
    };

    const handleFileApprove = async (fileId, fileName) => {
        if (!placementId) {
            alert('Placement ID not found');
            return;
        }
        if (!window.confirm(`Approve file "${fileName}"?`)) return;
        
        try {
            setProcessingFiles(prev => ({...prev, [fileId]: 'approving'}));
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/admin/placements/${placementId}/files/${fileId}/approve`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('placementToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                alert('File approved successfully!');
                fetchPlacementDetails();
            } else {
                alert('Failed to approve file');
            }
        } catch (error) {
            alert('Error approving file');
        } finally {
            setProcessingFiles(prev => ({...prev, [fileId]: null}));
        }
    };

    const handleFileReject = async (fileId, fileName) => {
        if (!placementId) {
            alert('Placement ID not found');
            return;
        }
        if (!window.confirm(`Reject file "${fileName}"?`)) return;
        
        try {
            setProcessingFiles(prev => ({...prev, [fileId]: 'rejecting'}));
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/admin/placements/${placementId}/files/${fileId}/reject`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('placementToken')}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data.success) {
                alert('File rejected successfully!');
                fetchPlacementDetails();
            } else {
                alert('Failed to reject file');
            }
        } catch (error) {
            alert('Error rejecting file');
        } finally {
            setProcessingFiles(prev => ({...prev, [fileId]: null}));
        }
    };

    const handleViewFile = async (fileId, fileName) => {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/placement/files/${fileId}/view`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('placementToken')}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.fileData) {
                    const cleanedData = data.fileData.map(row => {
                        return {
                            'ID': row.ID || row.id || row.Id || '',
                            'Candidate Name': row['Candidate Name'] || row['candidate name'] || row['CANDIDATE NAME'] || row.Name || row.name || row.NAME || row['Full Name'] || row['Student Name'] || '',
                            'College Name': row['College Name'] || row['college name'] || row['COLLEGE NAME'] || row.College || row.college || row.COLLEGE || '',
                            'Email': row.Email || row.email || row.EMAIL || '',
                            'Phone': row.Phone || row.phone || row.PHONE || row.Mobile || row.mobile || row.MOBILE || '',
                            'Course': row.Course || row.course || row.COURSE || row.Branch || row.branch || row.BRANCH || 'Not Specified',
                            'Password': row.Password || row.password || row.PASSWORD || '',
                            'Credits': row['Credits Assigned'] || row['credits assigned'] || row['CREDITS ASSIGNED'] || row.Credits || row.credits || row.CREDITS || row.Credit || row.credit || '0'
                        };
                    });
                    setStudentData(cleanedData);
                } else {
                    alert('File data not available or file not processed yet.');
                }
            } else {
                alert('Unable to view file. Please try again.');
            }
        } catch (error) {
            console.error('Error viewing file:', error);
            alert('Error viewing file. Please try again.');
        }
    };

    const handleFileUpload = async (file, customName = '') => {
        if (!file) return;
        
        if (!validateFileFormat(file)) {
            setSelectedFile(null);
            document.getElementById('fileInput').value = '';
            return;
        }

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('studentData', file);
            if (customName.trim()) {
                formData.append('customFileName', customName.trim());
            }

            const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
            const response = await fetch(`${API_BASE_URL}/placement/upload-student-data`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${localStorage.getItem('placementToken')}` },
                body: formData
            });

            const data = await response.json();
            
            if (data.success) {
                alert('Student data uploaded successfully! Waiting for admin approval.\n\nMake sure your file contains these columns:\n- ID\n- Candidate Name\n- College Name\n- Email\n- Phone\n- Course\n- Password\n- Credits Assigned');
                setSelectedFile(null);
                setCustomFileName('');
                setPendingFile(null);
                document.getElementById('fileInput').value = '';
                fetchPlacementDetails();
            } else {
                alert(data.message || 'Upload failed');
            }
        } catch (error) {
            alert('Upload failed. Please try again.');
        } finally {
            setUploadingFile(false);
        }
    };

    const handleFileSelect = (file) => {
        if (file && validateFileFormat(file)) {
            setPendingFile(file);
            setCustomFileName('');
            setShowNameModal(true);
        }
    };

    const handleConfirmUpload = () => {
        if (pendingFile) {
            setShowNameModal(false);
            handleFileUpload(pendingFile, customFileName);
        }
    };

    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }
        
        if (file.size > 2 * 1024 * 1024) {
            alert('Image size should be less than 2MB');
            return;
        }
        
        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const base64Logo = event.target.result;
                const token = localStorage.getItem('placementToken');
                
                const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
                const response = await fetch(`${API_BASE_URL}/placement/upload-logo`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ logo: base64Logo })
                });
                
                const data = await response.json();
                if (data.success) {
                    alert('Logo uploaded successfully!');
                    fetchPlacementDetails();
                } else {
                    alert('Failed to upload logo');
                }
            } catch (error) {
                alert('Error uploading logo');
            }
        };
        reader.readAsDataURL(file);
    };

    if (loading) {
        return (
            <div className="container-fluid p-4" style={{background: '#f8f9fa', minHeight: '100vh'}}>
                <div className="text-center py-5">
                    <div className="spinner-border text-primary mb-3" role="status"></div>
                    <h4>Loading Dashboard...</h4>
                </div>
            </div>
        );
    }

    if (!placementData) {
        return (
            <div className="container-fluid p-4" style={{background: '#f8f9fa', minHeight: '100vh'}}>
                <div className="modern-card p-5 text-center">
                    <i className="fa fa-lock fa-3x text-danger mb-3"></i>
                    <h3>Access Denied</h3>
                    <p className="text-muted">Please login with valid placement officer credentials.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid p-4" style={{background: '#f8f9fa', minHeight: '100vh'}}>
            {/* Header */}
            <div className="modern-card mb-4 p-4">
                <div className="d-flex justify-content-between align-items-center">
                    <h2 className="mb-0" style={{color: '#2c3e50', fontWeight: '600'}}>
                        <i className="fa fa-dashboard mr-2"></i>
                        Placement Dashboard
                    </h2>
                    <button 
                        className="btn btn-outline-primary"
                        onClick={fetchPlacementDetails}
                        style={{borderRadius: '8px'}}
                    >
                        <i className="fa fa-refresh mr-2"></i>
                        Refresh
                    </button>
                </div>
            </div>

            {/* Officer Information */}
            <div className="modern-card mb-4 p-4">
                <div className="row align-items-center mb-4">
                    <div className="col-md-2 text-center">
                        {placementData.logo ? (
                            <img 
                                src={placementData.logo} 
                                alt="College Logo" 
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    objectFit: 'contain',
                                    borderRadius: '12px',
                                    border: '2px solid #e9ecef',
                                    background: '#f8f9fa',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('logoInput').click()}
                            />
                        ) : (
                            <div 
                                style={{
                                    width: '100px',
                                    height: '100px',
                                    borderRadius: '12px',
                                    border: '2px dashed #ccc',
                                    background: '#f8f9fa',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer'
                                }}
                                onClick={() => document.getElementById('logoInput').click()}
                            >
                                <i className="fa fa-university fa-2x text-muted"></i>
                            </div>
                        )}
                        <input 
                            id="logoInput"
                            type="file" 
                            accept="image/*"
                            style={{display: 'none'}}
                            onChange={handleLogoUpload}
                        />
                        <small className="text-muted d-block mt-2">College Logo</small>
                    </div>
                    <div className="col-md-10">
                        <h3 className="mb-2" style={{color: '#2c3e50'}}>{placementData.name}</h3>
                        <p className="mb-1" style={{color: '#6c757d', fontSize: '1.1rem'}}>
                            <i className="fa fa-university mr-2"></i>
                            {placementData.collegeName || 'College Name Not Available'}
                        </p>
                        <p className="mb-0" style={{color: '#6c757d'}}>
                            <i className="fa fa-envelope mr-2"></i>
                            {placementData.email}
                        </p>
                    </div>
                </div>

                <div className="row">
                    <div className="col-lg-3 col-md-6 mb-3">
                        <div className="info-card">
                            <div className="info-icon" style={{
                                background: '#ff8c00 !important', 
                                color: '#fff !important',
                                width: '50px !important',
                                height: '50px !important',
                                borderRadius: '12px !important',
                                display: 'flex !important',
                                alignItems: 'center !important',
                                justifyContent: 'center !important',
                                marginRight: '15px !important'
                            }}>
                                <i className="fa fa-users" style={{fontSize: '20px !important', color: '#ffffff !important'}}></i>
                            </div>
                            <div>
                                <label className="text-muted mb-1">Total Students</label>
                                <p className="mb-0 font-weight-bold">{studentData.length}</p>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-3 col-md-6 mb-3">
                        <div className="info-card">
                            <div className="info-icon" style={{
                                background: '#ff8c00 !important', 
                                color: '#fff !important',
                                width: '50px !important',
                                height: '50px !important',
                                borderRadius: '12px !important',
                                display: 'flex !important',
                                alignItems: 'center !important',
                                justifyContent: 'center !important',
                                marginRight: '15px !important'
                            }}>
                                <i className={`fa ${placementData.status === 'approved' ? 'fa-check-circle' : 'fa-clock-o'}`} style={{fontSize: '20px !important', color: '#ffffff !important'}}></i>
                            </div>
                            <div>
                                <label className="text-muted mb-1">Status</label>
                                <p className="mb-0 font-weight-bold" style={{
                                    color: placementData.status === 'approved' ? '#28a745' : 
                                           placementData.status === 'rejected' ? '#dc3545' : '#ffc107'
                                }}>
                                    {placementData.status || 'Pending'}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-6 mb-3">
                        <div className="info-card">
                            <div className="info-icon" style={{
                                background: '#ff8c00 !important', 
                                color: '#fff !important',
                                width: '50px !important',
                                height: '50px !important',
                                borderRadius: '12px !important',
                                display: 'flex !important',
                                alignItems: 'center !important',
                                justifyContent: 'center !important',
                                marginRight: '15px !important'
                            }}>
                                <i className="fa fa-file-excel-o" style={{fontSize: '20px !important', color: '#ffffff !important'}}></i>
                            </div>
                            <div>
                                <label className="text-muted mb-1">Files Uploaded</label>
                                <p className="mb-0 font-weight-bold">{placementData.fileHistory?.length || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* File Upload Section */}
            <div className="modern-card mb-4 p-4">
                <h5 className="mb-3" style={{color: '#2c3e50'}}>
                    <i className="fa fa-cloud-upload mr-2"></i>
                    Upload Student Data
                </h5>
                <div className="row">
                    <div className="col-md-8">
                        <div 
                            className="upload-zone p-4 text-center"
                            style={{
                                border: '2px dashed #007bff',
                                borderRadius: '12px',
                                background: '#f8f9fa',
                                cursor: 'pointer'
                            }}
                            onClick={() => !uploadingFile && document.getElementById('fileInput').click()}
                        >
                            {uploadingFile ? (
                                <div>
                                    <div className="spinner-border text-primary mb-3" role="status"></div>
                                    <h5 className="text-primary">Uploading...</h5>
                                    <p className="text-muted">Please wait while we process your file</p>
                                </div>
                            ) : (
                                <div>
                                    <i className="fa fa-file-excel-o fa-3x text-primary mb-3"></i>
                                    <h5 className="text-primary mb-2">Drop your file here or click to browse</h5>
                                    <p className="text-muted mb-2">Supported formats: .xlsx, .xls, .csv (Max 5MB)</p>
                                    <p className="text-muted mb-3" style={{fontSize: '0.85rem'}}>
                                        Required: ID | Candidate Name | College Name | Email | Phone | Course | Password | Credits Assigned
                                    </p>
                                    <button className="btn btn-primary" disabled={uploadingFile}>
                                        <i className="fa fa-upload mr-2"></i>
                                        Choose File
                                    </button>
                                </div>
                            )}
                        </div>
                        <input 
                            id="fileInput"
                            type="file" 
                            accept=".xlsx,.xls,.csv"
                            style={{display: 'none'}}
                            onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                    setSelectedFile(file);
                                    handleFileSelect(file);
                                }
                            }}
                        />
                        <div className="mt-3">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                                <small className="text-muted">
                                    <i className="fa fa-info-circle mr-1"></i>
                                    Required columns: ID, Candidate Name, College Name, Email, Phone, Course, Password, Credits Assigned
                                </small>
                                <div className="d-flex" style={{gap: '8px'}}>
                                    <a 
                                        href="/assets/student-data-template.csv" 
                                        download="student-data-template.csv"
                                        className="btn btn-sm btn-outline-success"
                                        style={{fontSize: '0.8rem'}}
                                    >
                                        <i className="fa fa-download mr-1"></i>
                                        Template
                                    </a>
                                    <a 
                                        href="/assets/sample-student-data.csv" 
                                        download="sample-student-data.csv"
                                        className="btn btn-sm btn-outline-info"
                                        style={{fontSize: '0.8rem'}}
                                    >
                                        <i className="fa fa-download mr-1"></i>
                                        Sample Data
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="p-3" style={{background: '#e3f2fd', borderRadius: '8px'}}>
                            <h6 className="text-primary mb-2">
                                <i className="fa fa-lightbulb-o mr-2"></i>
                                Upload Tips
                            </h6>
                            <ul className="list-unstyled mb-0 small">
                                <li className="mb-1"><i className="fa fa-check text-success mr-2"></i>Use Excel (.xlsx) or CSV format</li>
                                <li className="mb-1"><i className="fa fa-check text-success mr-2"></i>Include all 8 required columns</li>
                                <li className="mb-1"><i className="fa fa-check text-success mr-2"></i>Course field must contain degree names</li>
                                <li className="mb-1"><i className="fa fa-check text-success mr-2"></i>Download sample data for reference</li>
                                <li className="mb-1"><i className="fa fa-check text-success mr-2"></i>File size should be under 5MB</li>
                                <li className="mb-0"><i className="fa fa-check text-success mr-2"></i>Admin approval required</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* File History & Student Data */}
            <div className="row">
                <div className="col-lg-4 mb-4">
                    <div className="modern-card p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0" style={{color: '#2c3e50'}}>
                                <i className="fa fa-history mr-2"></i>
                                Upload History
                            </h5>
                            <button 
                                className="btn btn-sm btn-outline-primary"
                                onClick={fetchPlacementDetails}
                                style={{borderRadius: '6px'}}
                            >
                                <i className="fa fa-refresh"></i>
                            </button>
                        </div>
                        <div style={{maxHeight: '400px', overflowY: 'auto'}}>
                            {placementData.fileHistory && placementData.fileHistory.length > 0 ? (
                                placementData.fileHistory.slice().reverse().map((file, index) => (
                                    <div key={file._id || index} className="mb-3 p-3" style={{background: '#f8f9fa', borderRadius: '8px'}}>
                                        <div className="d-flex align-items-start">
                                            <div className={`timeline-dot ${
                                                file.status === 'processed' ? 'bg-success' : 
                                                file.status === 'approved' ? 'bg-info' : 
                                                file.status === 'rejected' ? 'bg-danger' : 'bg-warning'
                                            }`} style={{
                                                width: '20px', 
                                                height: '20px', 
                                                borderRadius: '50%', 
                                                display: 'flex', 
                                                alignItems: 'center', 
                                                justifyContent: 'center', 
                                                flexShrink: 0,
                                                marginRight: '12px'
                                            }}>
                                                <i className={`fa ${
                                                    file.status === 'processed' ? 'fa-check-circle' : 
                                                    file.status === 'approved' ? 'fa-check' : 
                                                    file.status === 'rejected' ? 'fa-times' : 'fa-clock-o'
                                                } text-white`} style={{fontSize: '10px'}}></i>
                                            </div>
                                            <div className="flex-grow-1">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <strong className="d-block" style={{fontSize: '0.9rem'}}>
                                            {file.customName || file.fileName}
                                            {file.customName && (
                                                <small className="text-muted d-block" style={{fontSize: '0.75rem'}}>
                                                    Original: {file.fileName}
                                                </small>
                                            )}
                                        </strong>
                                                        <small className="text-muted d-block">
                                                            {new Date(file.uploadedAt).toLocaleDateString()} at {new Date(file.uploadedAt).toLocaleTimeString()}
                                                        </small>
                                                    </div>
                                                    <button 
                                                        className="btn btn-sm btn-outline-primary"
                                                        onClick={() => handleViewFile(file._id, file.fileName)}
                                                        style={{fontSize: '0.7rem', padding: '2px 8px'}}
                                                        title="View file data"
                                                    >
                                                        <i className="fa fa-eye"></i>
                                                    </button>
                                                </div>
                                                <div className="mt-1">
                                                    {file.status === 'processed' ? (
                                                        <span className="badge badge-success" style={{fontSize: '0.7rem'}}>
                                                            <i className="fa fa-check-circle mr-1"></i>Processed - Login Ready
                                                        </span>
                                                    ) : file.status === 'approved' ? (
                                                        <span className="badge badge-info" style={{fontSize: '0.7rem'}}>
                                                            <i className="fa fa-check mr-1"></i>Approved
                                                        </span>
                                                    ) : file.status === 'rejected' ? (
                                                        <span className="badge badge-danger" style={{fontSize: '0.7rem'}}>
                                                            <i className="fa fa-times mr-1"></i>Rejected
                                                        </span>
                                                    ) : (
                                                        <span className="badge badge-warning" style={{fontSize: '0.7rem'}}>
                                                            <i className="fa fa-clock-o mr-1"></i>Waiting for Admin Approval
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-4">
                                    <i className="fa fa-history fa-2x text-muted mb-2"></i>
                                    <p className="mb-0 text-muted">No files uploaded yet</p>
                                    <small className="text-muted">Upload history will appear here</small>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-8 mb-4">
                    <div className="modern-card p-4 h-100">
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5 className="mb-0" style={{color: '#2c3e50'}}>
                                <i className="fa fa-graduation-cap mr-2"></i>
                                Student Data
                                {studentData.length > 0 && (
                                    <span className="badge badge-primary ml-2">{studentData.length}</span>
                                )}
                            </h5>
                        </div>
                        
                        {studentData.length > 0 ? (
                            <div className="table-responsive">
                                <table className="table table-hover" style={{fontSize: '0.9rem'}}>
                                    <thead style={{background: '#f8f9fa'}}>
                                        <tr>
                                            {Object.keys(studentData[0]).map(key => (
                                                <th key={key} style={{border: 'none', fontWeight: '600'}}>
                                                    {key.charAt(0).toUpperCase() + key.slice(1)}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {studentData.map((student, index) => (
                                            <tr key={index} style={{borderTop: '1px solid #e9ecef'}}>
                                                {Object.entries(student).map(([key, value], i) => (
                                                    <td key={i} style={{border: 'none', paddingTop: '12px', paddingBottom: '12px'}}>
                                                        {key === 'Course' && (value === 'Not Specified' || !value) ? (
                                                            <span className="text-warning">
                                                                <i className="fa fa-exclamation-triangle mr-1"></i>
                                                                Not Specified
                                                            </span>
                                                        ) : (
                                                            value || '-'
                                                        )}
                                                    </td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="text-center py-5">
                                <i className="fa fa-users fa-3x text-muted mb-3"></i>
                                <h6 className="text-muted">No student data available</h6>
                                <p className="text-muted mb-0">Click the eye icon on any file to view student data</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Student Details Modal */}
            {showStudentModal && selectedStudent && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setShowStudentModal(false)}>
                    <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-user mr-2"></i>
                                    Student Details
                                </h5>
                                <button 
                                    type="button" 
                                    className="close" 
                                    onClick={() => setShowStudentModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Student ID</label>
                                        <p className="mb-0 font-weight-bold">{selectedStudent.id || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Full Name</label>
                                        <p className="mb-0 font-weight-bold">{selectedStudent.name || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">College Name</label>
                                        <p className="mb-0">{selectedStudent.collegeName || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Course</label>
                                        <p className="mb-0">{selectedStudent.course || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Email Address</label>
                                        <p className="mb-0">{selectedStudent.email || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Phone Number</label>
                                        <p className="mb-0">{selectedStudent.phone || 'N/A'}</p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Credits Assigned</label>
                                        <p className="mb-0">
                                            <span className="badge badge-info">
                                                {selectedStudent.credits || placementData?.credits || 0}
                                            </span>
                                        </p>
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="text-muted small">Password</label>
                                        <p className="mb-0">{selectedStudent.password || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowStudentModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* File Name Modal */}
            {showNameModal && pendingFile && (
                <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} onClick={() => setShowNameModal(false)}>
                    <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    <i className="fa fa-edit mr-2"></i>
                                    Set File Name
                                </h5>
                                <button 
                                    type="button" 
                                    className="close" 
                                    onClick={() => setShowNameModal(false)}
                                >
                                    <span>&times;</span>
                                </button>
                            </div>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="font-weight-bold">Original File Name:</label>
                                    <p className="text-muted mb-3">{pendingFile.name}</p>
                                    
                                    <label className="font-weight-bold">Custom Display Name (Optional):</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={customFileName}
                                        onChange={(e) => setCustomFileName(e.target.value)}
                                        placeholder="Enter a custom name for this file (e.g., 'CSE Batch 2024', 'Final Year Students')..."
                                        maxLength="100"
                                    />
                                    <small className="text-muted">
                                        Leave empty to use the original filename. This name will be displayed to admins.
                                    </small>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button 
                                    type="button" 
                                    className="btn btn-secondary" 
                                    onClick={() => setShowNameModal(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={handleConfirmUpload}
                                >
                                    <i className="fa fa-upload mr-1"></i>
                                    Upload File
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default PlacementDashboard;