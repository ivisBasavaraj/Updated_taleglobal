import { useState, useEffect, useRef } from 'react';
import { api } from '../../../../../utils/api';



function SectionCanEducation({ profile, onUpdate }) {
    const [educationList, setEducationList] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        schoolName: '',
        location: '',
        passoutYear: '',
        percentage: '',
        cgpa: '',
        sgpa: '',
        grade: '',
        marksheet: null
    });
    const [loading, setLoading] = useState(false);

    const getFormLabels = () => {
        const count = educationList.length;
        if (count === 0) {
            return {
                schoolLabel: 'School Name',
                schoolPlaceholder: 'Enter 10th School Name'
            };
        } else if (count === 1) {
            return {
                schoolLabel: 'Diploma/PUC Name',
                schoolPlaceholder: 'Enter diploma/puc name'
            };
        } else {
            return {
                schoolLabel: 'Degree College Name',
                schoolPlaceholder: 'Enter degree college Name'
            };
        }
    };

    useEffect(() => {
        if (profile && profile.education) {
            setEducationList(profile.education.map(edu => ({
                id: edu._id,
                schoolName: edu.degreeName || '',
                location: edu.collegeName || '',
                passoutYear: edu.passYear || '',
                percentage: edu.percentage || '',
                cgpa: edu.cgpa || '',
                sgpa: edu.sgpa || '',
                grade: edu.grade || ''
            })));
        }
    }, [profile]);



    const convertPercentageToCGPA = (percentage) => {
        if (percentage >= 90) return 10;
        if (percentage >= 80) return 9;
        if (percentage >= 70) return 8;
        if (percentage >= 60) return 7;
        if (percentage >= 50) return 6;
        if (percentage >= 40) return 5;
        return 4;
    };

    const convertPercentageToGrade = (percentage) => {
        if (percentage >= 90) return 'A+';
        if (percentage >= 80) return 'A';
        if (percentage >= 70) return 'B+';
        if (percentage >= 60) return 'B';
        if (percentage >= 50) return 'C';
        if (percentage >= 40) return 'D';
        return 'F';
    };

    const handleInputChange = (e) => {
        const { name, value, files } = e.target;
        let updatedData = { ...formData };
        
        if (name === 'marksheet') {
            updatedData.marksheet = files[0];
        } else {
            updatedData[name] = value;
        }
        
        if (name === 'percentage' && value) {
            const percentageValue = parseFloat(value);
            if (!isNaN(percentageValue)) {
                updatedData.cgpa = convertPercentageToCGPA(percentageValue);
                updatedData.sgpa = convertPercentageToCGPA(percentageValue);
                updatedData.grade = convertPercentageToGrade(percentageValue);
            }
        }
        
        setFormData(updatedData);
    };



    const resetForm = () => {
        setFormData({
            schoolName: '',
            location: '',
            passoutYear: '',
            percentage: '',
            cgpa: '',
            sgpa: '',
            grade: '',
            marksheet: null
        });
        setShowForm(false);
    };



    const handleDelete = async (educationId) => {
        if (window.confirm('Are you sure you want to delete this education record?')) {
            try {
                setLoading(true);
                await api.deleteEducation(educationId);
                setEducationList(educationList.filter(e => e.id !== educationId));
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } catch (error) {
                console.error('Error deleting education:', error);
                alert('Failed to delete education record');
            } finally {
                setLoading(false);
            }
        }
    };

    const handleSave = async () => {
        if (!formData.schoolName || !formData.location || !formData.passoutYear || !formData.percentage) {
            alert('Please fill all required fields');
            return;
        }

        try {
            setLoading(true);
            const formDataToSend = new FormData();
            formDataToSend.append('schoolName', formData.schoolName);
            formDataToSend.append('location', formData.location);
            formDataToSend.append('passoutYear', formData.passoutYear);
            formDataToSend.append('percentage', formData.percentage);
            formDataToSend.append('cgpa', formData.cgpa);
            formDataToSend.append('sgpa', formData.sgpa);
            formDataToSend.append('grade', formData.grade);
            if (formData.marksheet) {
                formDataToSend.append('marksheet', formData.marksheet);
            }
            
            const response = await api.addEducation(formDataToSend);
            
            if (response.success) {
                const newEducation = {
                    id: response.education._id || Date.now(),
                    schoolName: response.education.degreeName,
                    location: response.education.collegeName,
                    passoutYear: response.education.passYear,
                    percentage: response.education.percentage,
                    cgpa: response.education.cgpa,
                    sgpa: response.education.sgpa,
                    grade: response.education.grade
                };
                
                setEducationList([...educationList, newEducation]);
                resetForm();
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            }
        } catch (error) {
            console.error('Error saving education:', error);
            alert('Failed to save education record');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20">
                <h4 className="panel-tittle m-a0">Educational Qualification Details</h4>
            </div>
            <div className="panel-body wt-panel-body p-a20">
                <div className="twm-panel-inner">
                    <div className="mb-3">
                        <button 
                            type="button" 
                            className="btn btn-primary"
                            onClick={() => setShowForm(!showForm)}
                        >
                            {showForm ? 'Cancel' : 'Add New'}
                        </button>
                    </div>
                    
                    {showForm && (
                        <div className="education-form mb-4">
                        <div className="row">
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label>{getFormLabels().schoolLabel}</label>
                                    <input 
                                        className="form-control" 
                                        name="schoolName" 
                                        type="text" 
                                        placeholder={getFormLabels().schoolPlaceholder}
                                        value={formData.schoolName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label>Location</label>
                                    <input 
                                        className="form-control" 
                                        name="location" 
                                        type="text" 
                                        placeholder="Enter Location" 
                                        value={formData.location}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label>Passout Year</label>
                                    <input 
                                        className="form-control" 
                                        name="passoutYear" 
                                        type="text" 
                                        placeholder="Enter Passout Year" 
                                        value={formData.passoutYear}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="form-group mb-3">
                                    <label>Percentage</label>
                                    <input 
                                        className="form-control" 
                                        name="percentage" 
                                        type="number" 
                                        placeholder="90"
                                        value={formData.percentage}
                                        onChange={handleInputChange}
                                        min="0"
                                        max="100"
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group mb-3">
                                    <label>CGPA (Auto-calculated)</label>
                                    <input 
                                        className="form-control" 
                                        name="cgpa" 
                                        type="number" 
                                        value={formData.cgpa}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group mb-3">
                                    <label>SGPA (Auto-calculated)</label>
                                    <input 
                                        className="form-control" 
                                        name="sgpa" 
                                        type="number" 
                                        value={formData.sgpa}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="col-md-4">
                                <div className="form-group mb-3">
                                    <label>Grade (Auto-calculated)</label>
                                    <input 
                                        className="form-control" 
                                        name="grade" 
                                        type="text" 
                                        value={formData.grade}
                                        readOnly
                                    />
                                </div>
                            </div>
                            <div className="col-md-12">
                                <div className="form-group mb-3">
                                    <label>Upload Marksheet</label>
                                    <input 
                                        className="form-control" 
                                        name="marksheet" 
                                        type="file" 
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        onChange={handleInputChange}
                                    />
                                    <small className="text-muted">Upload your 10th standard marksheet (PDF, JPG, PNG)</small>
                                    {!formData.marksheet && <div className="text-muted mt-1">No file chosen</div>}
                                    {formData.marksheet && <div className="text-success mt-1">File selected: {formData.marksheet.name}</div>}
                                </div>
                            </div>
                            <div className="col-md-12">
                                <button 
                                    type="button" 
                                    className="btn btn-primary" 
                                    onClick={handleSave} 
                                    disabled={loading}
                                >
                                    {loading ? 'Saving...' : 'Add Education'}
                                </button>
                            </div>
                        </div>
                        </div>
                    )}
                    
                    {educationList.length > 0 && <hr />}
                    {educationList.map((education) => (
                        <div key={education.id} className="education-item mb-3">
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <p><b>{education.schoolName}</b></p>
                                    <p><i className="fa fa-map-marker text-primary me-1"></i>{education.location}</p>
                                    <p>Passout Year: {education.passoutYear}</p>
                                    <div className="row">
                                        <div className="col-md-3"><small>Percentage: {education.percentage}%</small></div>
                                        <div className="col-md-3"><small>CGPA: {education.cgpa}</small></div>
                                        <div className="col-md-3"><small>SGPA: {education.sgpa}</small></div>
                                        <div className="col-md-3"><small>Grade: {education.grade}</small></div>
                                    </div>
                                </div>
                                <button 
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDelete(education.id)}
                                    title="Delete"
                                    disabled={loading}
                                >
                                    <i className="fa fa-trash"></i>
                                </button>
                            </div>
                            <hr />
                        </div>
                    ))}
                </div>
            </div>

        </>
    )
}
export default SectionCanEducation;