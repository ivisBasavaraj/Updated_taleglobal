import React, { useState, useEffect } from "react";
import { api } from "../../../../../utils/api";

function SectionCanPersonalDetail({ profile }) {
    const [formData, setFormData] = useState({
        dateOfBirth: '',
        gender: '',
        location: '',
        fatherName: '',
        motherName: '',
        residentialAddress: '',
        permanentAddress: '',
        correspondenceAddress: ''
    });
    
    const indianCities = [
        'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad',
        'Surat', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
        'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana',
        'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivali', 'Vasai-Virar',
        'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad',
        'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur',
        'Madurai', 'Raipur', 'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli-Dharwad'
    ];
    const [educationList, setEducationList] = useState([]);
    const [otherSelected, setOtherSelected] = useState({});
    const [locationOtherSelected, setLocationOtherSelected] = useState(false);
    
    const getEducationLevelLabel = (index) => {
        const levels = ['10th School Name', 'PUC/Diploma College Name', 'Degree', 'Masters', 'PhD/Doctorate'];
        return levels[index] || 'Additional Qualification';
    };
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (profile) {
            const newFormData = {
                dateOfBirth: profile.dateOfBirth || '',
                gender: profile.gender || '',
                location: profile.location || '',
                fatherName: profile.fatherName || '',
                motherName: profile.motherName || '',
                residentialAddress: profile.residentialAddress || '',
                permanentAddress: profile.permanentAddress || '',
                correspondenceAddress: profile.correspondenceAddress || ''
            };
            setFormData(newFormData);
            
            // Check if location is custom (not in indianCities)
            const isCustomLocation = profile.location && !indianCities.includes(profile.location) && profile.location !== '';
            setLocationOtherSelected(isCustomLocation);
            console.log('Profile loaded - Location:', profile.location, 'Is custom:', isCustomLocation);
            if (profile.education && profile.education.length > 0) {
                const educationWithCalculations = profile.education.map((edu, index) => {
                    const percentage = parseFloat(edu.percentage) || 0;
                    const cgpa = edu.cgpa || (percentage > 0 ? (percentage / 9.5).toFixed(2) : '');
                    const sgpa = edu.sgpa || (percentage > 0 ? (percentage / 10).toFixed(2) : '');
                    let grade = edu.grade || '';
                    if (!grade && percentage > 0) {
                        if (percentage >= 90) grade = 'A+';
                        else if (percentage >= 80) grade = 'A';
                        else if (percentage >= 70) grade = 'B+';
                        else if (percentage >= 60) grade = 'B';
                        else if (percentage >= 50) grade = 'C';
                        else if (percentage >= 40) grade = 'D';
                        else grade = 'F';
                    }
                    // Set otherSelected state if collegeName is not in indianCities
                    if (edu.collegeName && !indianCities.includes(edu.collegeName) && edu.collegeName !== '') {
                        setOtherSelected(prev => ({...prev, [index]: true}));
                    }
                    return {
                        ...edu,
                        startYear: edu.startYear || edu.joiningYear || '',
                        joiningYear: edu.joiningYear || edu.startYear || '',
                        cgpa,
                        sgpa,
                        grade
                    };
                });
                setEducationList(educationWithCalculations);
            } else {
                setEducationList([]);
            }
        }
    }, [profile]);

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        
        // Auto-save after a short delay
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            autoSave();
        }, 1000);
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const updateData = {
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                location: formData.location,
                fatherName: formData.fatherName,
                motherName: formData.motherName,
                residentialAddress: formData.residentialAddress,
                permanentAddress: formData.permanentAddress,
                correspondenceAddress: formData.correspondenceAddress,
                education: educationList.map(edu => ({
                    degreeName: edu.degreeName,
                    collegeName: edu.collegeName,
                    startYear: edu.startYear || edu.joiningYear,
                    joiningYear: edu.joiningYear || edu.startYear,
                    passYear: edu.passYear,
                    percentage: edu.percentage,
                    cgpa: edu.cgpa,
                    sgpa: edu.sgpa,
                    grade: edu.grade,
                    marksheet: edu.marksheet
                }))
            };
            console.log('Sending data:', updateData);
            const response = await api.updateCandidateProfile(updateData);
            if (response.success) {
                alert('Profile updated successfully!');
                // Trigger parent component to refresh profile
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            }
        } catch (error) {
            alert('Failed to update profile');
        } finally {
            setLoading(false);
        }
    };
    
    const handleAddEducation = () => {
        setEducationList([
            ...educationList,
            { degreeName: "", collegeName: "", startYear: "", joiningYear: "", passYear: "", percentage: "", cgpa: "", sgpa: "", grade: "", marksheet: null },
        ]);
    };

    const handleEducationChange = (index, field, value) => {
        const updated = [...educationList];
        updated[index][field] = value;
        setEducationList(updated);
        
        // Auto-save after a short delay
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            autoSave(updated);
        }, 1000);
    };

    const autoSave = async (updatedEducation = educationList) => {
        try {
            const updateData = {
                dateOfBirth: formData.dateOfBirth,
                gender: formData.gender,
                location: formData.location,
                fatherName: formData.fatherName,
                motherName: formData.motherName,
                residentialAddress: formData.residentialAddress,
                permanentAddress: formData.permanentAddress,
                correspondenceAddress: formData.correspondenceAddress,
                education: updatedEducation.map(edu => ({
                    degreeName: edu.degreeName,
                    collegeName: edu.collegeName,
                    startYear: edu.startYear || edu.joiningYear,
                    joiningYear: edu.joiningYear || edu.startYear,
                    passYear: edu.passYear,
                    percentage: edu.percentage,
                    cgpa: edu.cgpa,
                    sgpa: edu.sgpa,
                    grade: edu.grade,
                    marksheet: edu.marksheet
                }))
            };
            console.log('Auto-saving location:', formData.location);
            const response = await api.updateCandidateProfile(updateData);
            console.log('Auto-save response:', response);
        } catch (error) {
            console.error('Auto-save failed:', error);
        }
    };



    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn ">
                <h4 className="panel-tittle m-a0">
                    <i className="fa fa-id-card site-text-primary me-2"></i>
                    Personal Details
                </h4>
            </div>

            <form onSubmit={(e) => e.preventDefault()}>
                <div className="panel panel-default">
                    <div className="panel-body wt-panel-body p-a20 m-b30">
                        <div className="row">
                            <div className="col-md-6">
                                <label><i className="fa fa-calendar me-1"></i> Date of Birth</label>
                                <input
                                    className="form-control"
                                    type="date"
                                    value={formData.dateOfBirth ? formData.dateOfBirth.split('T')[0] : ''}
                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                />
                            </div>

                            <div className="col-md-6">
                                <label><i className="fa fa-venus-mars me-1"></i> Gender</label>
                                <select 
                                    className="form-control"
                                    value={formData.gender}
                                    onChange={(e) => handleInputChange('gender', e.target.value)}
                                >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>

                            <div className="col-md-12">
                                <label><i className="fa fa-map-marker me-1"></i> Current Location</label>
                                {locationOtherSelected ? (
                                    <div className="d-flex">
                                        <input
                                            className="form-control"
                                            type="text"
                                            value={formData.location}
                                            onChange={(e) => {
                                                handleInputChange('location', e.target.value);
                                            }}
                                            placeholder="Enter custom location"
                                            onBlur={() => {
                                                // Force save when user leaves the input field
                                                clearTimeout(window.autoSaveTimeout);
                                                autoSave();
                                            }}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary ms-2"
                                            onClick={() => {
                                                setFormData(prev => ({ ...prev, location: '' }));
                                                setLocationOtherSelected(false);
                                                // Auto-save the empty location
                                                setTimeout(() => autoSave(), 100);
                                            }}
                                            title="Back to dropdown"
                                        >
                                            ↩
                                        </button>
                                    </div>
                                ) : (
                                    <select 
                                        className="form-control"
                                        value={formData.location && indianCities.includes(formData.location) ? formData.location : ''}
                                        onChange={(e) => {
                                            if (e.target.value === 'Other') {
                                                setLocationOtherSelected(true);
                                            } else {
                                                handleInputChange('location', e.target.value);
                                                setLocationOtherSelected(false);
                                            }
                                        }}
                                    >
                                        <option value="">Select Location</option>
                                        {indianCities.map(city => (
                                            <option key={city} value={city}>{city}</option>
                                        ))}
                                        <option value="Other" style={{fontWeight: 'bold', color: '#ff6b35'}}>Other</option>
                                    </select>
                                )}
                            </div>

                            <div className="col-md-6">
                                <label><i className="fa fa-male me-1"></i> Father's / Husband's Name</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Enter name"
                                    value={formData.fatherName}
                                    onChange={(e) => handleInputChange('fatherName', e.target.value)}
                                />
                            </div>

                            <div className="col-md-6">
                                <label><i className="fa fa-female me-1"></i> Mother's Name</label>
                                <input
                                    className="form-control"
                                    type="text"
                                    placeholder="Enter name"
                                    value={formData.motherName}
                                    onChange={(e) => handleInputChange('motherName', e.target.value)}
                                />
                            </div>

                            <div className="col-md-12">
                                <label><i className="fa fa-home me-1"></i> Residential Address</label>
                                <textarea
                                    className="form-control"
                                    rows={2}
                                    placeholder="Enter address"
                                    value={formData.residentialAddress}
                                    onChange={(e) => handleInputChange('residentialAddress', e.target.value)}
                                ></textarea>
                            </div>

                            <div className="col-md-12">
                                <label><i className="fa fa-map-marker me-1"></i> Permanent Address</label>
                                <textarea
                                    className="form-control"
                                    rows={2}
                                    placeholder="Enter permanent address"
                                    value={formData.permanentAddress}
                                    onChange={(e) => handleInputChange('permanentAddress', e.target.value)}
                                ></textarea>
                            </div>

                            <div className="col-md-12">
                                <label><i className="fa fa-envelope me-1"></i> Correspondence Address</label>
                                <textarea
                                    className="form-control"
                                    rows={2}
                                    placeholder="Enter correspondence address"
                                    value={formData.correspondenceAddress}
                                    onChange={(e) => handleInputChange('correspondenceAddress', e.target.value)}
                                ></textarea>
                            </div>
                        </div>

                        <hr />

                        <div className="mt-4">
                            <div className="d-flex align-items-center justify-content-between mb-3">
                                <h5 className="mb-0">
                                    <i className="fa fa-graduation-cap site-text-primary me-2"></i>
                                    Educational Qualification Details
                                </h5>
                            </div>

                            {educationList.map((edu, index) => (
                                <div className="card mb-3 shadow-sm" key={index}>
                                    <div className="card-header bg-light d-flex justify-content-between align-items-center">
                                        <h6 className="mb-0 text-primary">
                                            <i className="fa fa-book me-2"></i>
                                            {getEducationLevelLabel(index)}
                                        </h6>
                                        <button
                                            type="button"
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => {
                                                const updated = educationList.filter((_, i) => i !== index);
                                                setEducationList(updated);
                                            }}
                                            title="Remove this education entry"
                                        >
                                            <i className="fa fa-trash"></i>
                                        </button>
                                    </div>
                                    <div className="card-body">
                                        <div className="row g-3">
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-muted">
                                                    <i className="fa fa-graduation-cap me-1"></i>
                                                    {getEducationLevelLabel(index)}
                                                </label>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    value={edu.degreeName}
                                                    onChange={(e) =>
                                                        handleEducationChange(index, "degreeName", e.target.value)
                                                    }
                                                    placeholder={`Enter ${getEducationLevelLabel(index)}`}
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-muted">
                                                    <i className="fa fa-map-marker me-1"></i>
                                                    Location
                                                </label>
                                                {otherSelected[index] ? (
                                                    <div className="d-flex">
                                                        <input
                                                            className="form-control"
                                                            type="text"
                                                            value={edu.customLocation || ''}
                                                            onChange={(e) => {
                                                                handleEducationChange(index, "customLocation", e.target.value);
                                                                handleEducationChange(index, "collegeName", e.target.value);
                                                            }}
                                                            placeholder="Enter custom location"
                                                        />
                                                        <button
                                                            type="button"
                                                            className="btn btn-outline-secondary ms-2"
                                                            onClick={() => {
                                                                handleEducationChange(index, "collegeName", '');
                                                                handleEducationChange(index, "customLocation", '');
                                                                setOtherSelected(prev => ({...prev, [index]: false}));
                                                            }}
                                                            title="Back to dropdown"
                                                        >
                                                            ↩
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <select
                                                        className="form-control"
                                                        value={edu.collegeName}
                                                        onChange={(e) => {
                                                            if (e.target.value === 'Other') {
                                                                setOtherSelected(prev => ({...prev, [index]: true}));
                                                                handleEducationChange(index, "collegeName", '');
                                                                handleEducationChange(index, "customLocation", '');
                                                            } else {
                                                                handleEducationChange(index, "collegeName", e.target.value);
                                                            }
                                                        }}
                                                    >
                                                        <option value="">Select Location</option>
                                                        {indianCities.map(city => (
                                                            <option key={city} value={city}>{city}</option>
                                                        ))}
                                                        <option value="Other" style={{fontWeight: 'bold', color: '#ff6b35'}}>Other</option>
                                                    </select>
                                                )}
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-muted">
                                                    <i className="fa fa-calendar me-1"></i>
                                                    Year of Joining
                                                </label>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    value={edu.startYear || edu.joiningYear || ''}
                                                    onChange={(e) => {
                                                        handleEducationChange(index, "startYear", e.target.value);
                                                        handleEducationChange(index, "joiningYear", e.target.value);
                                                    }}
                                                    placeholder="Enter Year"
                                                />
                                            </div>

                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-muted">
                                                    <i className="fa fa-calendar-check me-1"></i>
                                                    Passout Year
                                                </label>
                                                <input
                                                    className="form-control"
                                                    type="text"
                                                    value={edu.passYear}
                                                    onChange={(e) =>
                                                        handleEducationChange(index, "passYear", e.target.value)
                                                    }
                                                    placeholder="Enter Year"
                                                />
                                            </div>
                                        </div>

                                        <hr className="my-3" />
                                        
                                        <h6 className="text-muted mb-3">
                                            <i className="fa fa-chart-line me-2"></i>
                                            Academic Performance
                                        </h6>
                                        
                                        <div className="row g-3">
                                            <div className="col-md-3">
                                                <label className="form-label fw-bold text-primary">
                                                    <i className="fa fa-percent me-1"></i>
                                                    Percentage
                                                </label>
                                                <div className="input-group">
                                                    <input
                                                        className="form-control"
                                                        type="text"
                                                        value={edu.percentage || ''}
                                                        onChange={(e) => {
                                                            const percentage = parseFloat(e.target.value) || 0;
                                                            const cgpa = (percentage / 9.5).toFixed(2);
                                                            const sgpa = (percentage / 10).toFixed(2);
                                                            let grade = 'F';
                                                            if (percentage >= 90) grade = 'A+';
                                                            else if (percentage >= 80) grade = 'A';
                                                            else if (percentage >= 70) grade = 'B+';
                                                            else if (percentage >= 60) grade = 'B';
                                                            else if (percentage >= 50) grade = 'C';
                                                            else if (percentage >= 40) grade = 'D';
                                                            
                                                            handleEducationChange(index, "percentage", e.target.value);
                                                            handleEducationChange(index, "cgpa", cgpa);
                                                            handleEducationChange(index, "sgpa", sgpa);
                                                            handleEducationChange(index, "grade", grade);
                                                        }}
                                                        placeholder="Enter %"
                                                    />
                                                    <span className="input-group-text bg-primary text-white">%</span>
                                                </div>
                                            </div>
                                            
                                            <div className="col-md-3">
                                                <label className="form-label fw-bold text-success">
                                                    <i className="fa fa-calculator me-1"></i>
                                                    CGPA
                                                </label>
                                                <input
                                                    className="form-control bg-light"
                                                    type="text"
                                                    value={edu.cgpa || ''}
                                                    readOnly
                                                    placeholder="Auto"
                                                />
                                            </div>
                                            
                                            <div className="col-md-3">
                                                <label className="form-label fw-bold text-info">
                                                    <i className="fa fa-calculator me-1"></i>
                                                    SGPA
                                                </label>
                                                <input
                                                    className="form-control bg-light"
                                                    type="text"
                                                    value={edu.sgpa || ''}
                                                    readOnly
                                                    placeholder="Auto"
                                                />
                                            </div>
                                            
                                            <div className="col-md-3">
                                                <label className="form-label fw-bold text-warning">
                                                    <i className="fa fa-star me-1"></i>
                                                    Grade
                                                </label>
                                                <input
                                                    className="form-control bg-light text-center fw-bold"
                                                    type="text"
                                                    value={edu.grade || ''}
                                                    readOnly
                                                    placeholder="Auto"
                                                />
                                            </div>
                                        </div>
                                        
                                        <hr className="my-3" />
                                        
                                        <div className="row">
                                            <div className="col-md-6">
                                                <label className="form-label fw-bold text-muted">
                                                    <i className="fa fa-upload me-1"></i>
                                                    Upload Marksheet
                                                </label>
                                                <input
                                                    className="form-control"
                                                    type="file"
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={async (e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const formData = new FormData();
                                                            formData.append('marksheet', file);

                                                            try {
                                                                const response = await fetch('http://localhost:5000/api/candidate/upload-marksheet', {
                                                                    method: 'POST',
                                                                    headers: {
                                                                        'Authorization': `Bearer ${localStorage.getItem('candidateToken')}`
                                                                    },
                                                                    body: formData
                                                                });
                                                                const data = await response.json();
                                                                if (data.success) {
                                                                    handleEducationChange(index, "marksheet", data.filePath);
                                                                }
                                                            } catch (error) {
                                                                console.error('Upload failed:', error);
                                                            }
                                                        }
                                                    }}
                                                />
                                                {edu.marksheet && (
                                                    <div className="mt-2">
                                                        <span className="badge bg-success">
                                                            <i className="fa fa-check me-1"></i>
                                                            Marksheet uploaded successfully
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-4">
                            <button
                                type="button"
                                className="btn btn-outline-primary btn-lg"
                                onClick={handleAddEducation}
                            >
                                <i className="fa fa-plus-circle me-2"></i>
                                Add New Education
                            </button>
                        </div>

                        <div className="text-left mt-4">
                            <button type="button" onClick={handleSubmit} className="btn btn-primary" disabled={loading}>
                                <i className="fa fa-save me-1"></i>
                                {loading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </div>
                </div>
            </form>
        </>
    )
}
export default SectionCanPersonalDetail;