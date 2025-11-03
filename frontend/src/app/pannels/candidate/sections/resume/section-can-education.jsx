import { useState, useEffect, useRef } from 'react';
import { api } from '../../../../../utils/api';

function SectionCanEducation({ profile, onUpdate }) {
    const [educationData, setEducationData] = useState({
        tenth: { schoolName: '', specialization: '', location: '', passoutYear: '', percentage: '', cgpa: '', grade: '', marksheet: null, marksheetBase64: null },
        diploma: { schoolName: '', specialization: '', location: '', passoutYear: '', percentage: '', cgpa: '', grade: '', marksheet: null, marksheetBase64: null },
        degree: { schoolName: '', specialization: '', location: '', passoutYear: '', percentage: '', cgpa: '', grade: '', marksheet: null, marksheetBase64: null }
    });
    const [additionalRows, setAdditionalRows] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editMode, setEditMode] = useState({
        tenth: true,
        diploma: true,
        degree: true
    });
    const [additionalEditMode, setAdditionalEditMode] = useState([]);
    const [errors, setErrors] = useState({});
    const [additionalErrors, setAdditionalErrors] = useState([]);

    useEffect(() => {
        if (profile && profile.education) {
            const newData = { ...educationData };
            const newEditMode = { tenth: true, diploma: true, degree: true };
            
            profile.education.forEach((edu, index) => {
                const key = index === 0 ? 'tenth' : index === 1 ? 'diploma' : 'degree';
                if (newData[key]) {
                    newData[key] = {
                        schoolName: edu.degreeName || '',
                        specialization: edu.specialization || '',
                        location: edu.collegeName || '',
                        passoutYear: edu.passYear || '',
                        percentage: edu.percentage || '',
                        cgpa: edu.cgpa || '',
                        grade: edu.grade || '',
                        marksheet: null,
                        marksheetBase64: edu.marksheet || null
                    };
                    
                    // If data exists, set edit mode to false (show Edit button)
                    if (edu.degreeName || edu.collegeName || edu.passYear || edu.percentage) {
                        newEditMode[key] = false;
                    }
                }
            });
            
            setEducationData(newData);
            setEditMode(newEditMode);
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

    const validateEducationField = (level, field, value, index = null) => {
        const fieldKey = index !== null ? `${level}_${index}_${field}` : `${level}_${field}`;
        const newErrors = index !== null ? { ...additionalErrors[index] } : { ...errors };

        let error = null;

        switch (field) {
            case 'schoolName':
                if (value && value.trim()) {
                    if (value.trim().length < 2) {
                        error = 'School/College name must be at least 2 characters long';
                    } else if (value.trim().length > 100) {
                        error = 'School/College name cannot exceed 100 characters';
                    }
                }
                break;
            case 'specialization':
                if (value && value.trim().length > 100) {
                    error = 'Specialization cannot exceed 100 characters';
                }
                break;
            case 'location':
                if (value && value.trim()) {
                    if (value.trim().length < 2) {
                        error = 'Location must be at least 2 characters long';
                    } else if (value.trim().length > 50) {
                        error = 'Location cannot exceed 50 characters';
                    }
                }
                break;
            case 'passoutYear':
                if (value && value.trim()) {
                    const year = parseInt(value);
                    const currentYear = new Date().getFullYear();
                    if (!isNaN(year) && (year < 1950 || year > currentYear + 10)) {
                        error = `Passout year must be between 1950 and ${currentYear + 10}`;
                    }
                }
                break;
            case 'percentage':
                if (value) {
                    const percentage = parseFloat(value);
                    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
                        error = 'Percentage must be between 0 and 100';
                    }
                }
                break;
        }

        if (index !== null) {
            newErrors[field] = error;
            const updatedAdditionalErrors = [...additionalErrors];
            updatedAdditionalErrors[index] = newErrors;
            setAdditionalErrors(updatedAdditionalErrors);
        } else {
            newErrors[field] = error;
            setErrors(newErrors);
        }

        return !error;
    };

    const handleInputChange = (e, level, index = null) => {
        const { name, value, files } = e.target;

        if (index !== null) {
            const updatedRows = [...additionalRows];
            if (name === 'marksheet') {
                updatedRows[index].marksheet = files[0];
                // Upload marksheet immediately
                if (files[0]) {
                    uploadMarksheet(files[0], 'additional', index);
                }
            } else {
                updatedRows[index][name] = value;
                if (name === 'percentage' && value) {
                    const percentageValue = parseFloat(value);
                    if (!isNaN(percentageValue) && percentageValue >= 0 && percentageValue <= 100) {
                        updatedRows[index].cgpa = convertPercentageToCGPA(percentageValue);
                        updatedRows[index].grade = convertPercentageToGrade(percentageValue);
                    }
                }
                // Clear error when user starts typing
                if (additionalErrors[index] && additionalErrors[index][name]) {
                    const updatedErrors = [...additionalErrors];
                    updatedErrors[index] = { ...updatedErrors[index], [name]: null };
                    setAdditionalErrors(updatedErrors);
                }
            }
            setAdditionalRows(updatedRows);
        } else {
            const updatedData = { ...educationData };
            if (name === 'marksheet') {
                updatedData[level].marksheet = files[0];
                // Upload marksheet immediately
                if (files[0]) {
                    uploadMarksheet(files[0], level);
                }
            } else {
                updatedData[level][name] = value;
                if (name === 'percentage' && value) {
                    const percentageValue = parseFloat(value);
                    if (!isNaN(percentageValue) && percentageValue >= 0 && percentageValue <= 100) {
                        updatedData[level].cgpa = convertPercentageToCGPA(percentageValue);
                        updatedData[level].grade = convertPercentageToGrade(percentageValue);
                    }
                }
                // Clear error when user starts typing
                if (errors[name]) {
                    setErrors(prev => ({ ...prev, [name]: null }));
                }
            }
            setEducationData(updatedData);
        }
    };

    const addNewRow = () => {
        const newRow = {
            id: Date.now(),
            educationType: 'Degree',
            schoolName: '',
            specialization: '',
            location: '',
            passoutYear: '',
            percentage: '',
            cgpa: '',
            grade: '',
            marksheet: null,
            marksheetBase64: null
        };
        setAdditionalRows([...additionalRows, newRow]);
        setAdditionalEditMode([...additionalEditMode, true]);

        // Scroll to the newly added row after a short delay to allow DOM update
        setTimeout(() => {
            const tableBody = document.querySelector('.table tbody');
            if (tableBody) {
                const lastRow = tableBody.lastElementChild;
                if (lastRow) {
                    lastRow.scrollIntoView({
                        behavior: 'smooth',
                        block: 'center'
                    });
                }
            }
        }, 100);
    };

    const removeRow = (index) => {
        const updatedRows = additionalRows.filter((_, i) => i !== index);
        const updatedEditMode = additionalEditMode.filter((_, i) => i !== index);
        setAdditionalRows(updatedRows);
        setAdditionalEditMode(updatedEditMode);
    };

    const toggleEdit = async (level, index = null) => {
        if (index !== null) {
            const updatedEditMode = [...additionalEditMode];
            if (updatedEditMode[index]) {
                // Save individual row
                await handleSave();
                updatedEditMode[index] = false; // Switch to Edit mode after saving
            } else {
                updatedEditMode[index] = true; // Switch to Save mode for editing
            }
            setAdditionalEditMode(updatedEditMode);
        } else {
            if (editMode[level]) {
                // Save individual row
                await handleSave();
                setEditMode(prev => ({ ...prev, [level]: false })); // Switch to Edit mode after saving
            } else {
                setEditMode(prev => ({ ...prev, [level]: true })); // Switch to Save mode for editing
            }
        }
    };

    const uploadMarksheet = async (file, level, index = null) => {
        // File validation
        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        // Check file size (80KB minimum, 15MB maximum)
        const minSize = 80 * 1024; // 80KB in bytes
        const maxSize = 15 * 1024 * 1024; // 15MB in bytes
        if (file.size < minSize) {
            alert('File size must be at least 80KB. Please choose a larger file.');
            return;
        }
        if (file.size > maxSize) {
            alert('File size must be less than 15MB. Please choose a smaller file.');
            return;
        }

        // Check file type
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!allowedTypes.includes(file.type)) {
            alert('Only PDF, JPG, JPEG, and PNG files are allowed.');
            return;
        }

        try {
            const formData = new FormData();
            formData.append('marksheet', file);
            
            let educationIndex;
            let educationDataToSend;
            
            if (index !== null) {
                // Additional row
                educationIndex = 3 + index; // After tenth, diploma, degree
                educationDataToSend = additionalRows[index];
            } else {
                // Main education levels
                if (level === 'tenth') educationIndex = 0;
                else if (level === 'diploma') educationIndex = 1;
                else if (level === 'degree') educationIndex = 2;
                
                educationDataToSend = {
                    degreeName: educationData[level].schoolName,
                    specialization: educationData[level].specialization,
                    collegeName: educationData[level].location,
                    passYear: educationData[level].passoutYear,
                    percentage: educationData[level].percentage,
                    cgpa: educationData[level].cgpa,
                    grade: educationData[level].grade
                };
            }
            
            formData.append('educationIndex', educationIndex);
            formData.append('educationData', JSON.stringify(educationDataToSend));
            
            const token = localStorage.getItem('candidateToken');
            const response = await fetch('http://localhost:5000/api/candidate/education/marksheet', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            
            if (response.ok) {
                const result = await response.json();
                
                // Update local state with the uploaded marksheet
                if (index !== null) {
                    const updatedRows = [...additionalRows];
                    updatedRows[index].marksheetBase64 = result.marksheet;
                    setAdditionalRows(updatedRows);
                } else {
                    const updatedData = { ...educationData };
                    updatedData[level].marksheetBase64 = result.marksheet;
                    setEducationData(updatedData);
                }
                
                // Show success message with better visibility
                const successMsg = document.createElement('div');
                successMsg.innerHTML = '<div class="alert alert-success alert-dismissible fade show" role="alert"><i class="fa fa-check-circle"></i> Marksheet uploaded successfully!<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>';
                document.querySelector('.panel-body').prepend(successMsg.firstChild);
                
                // Auto-hide after 3 seconds
                setTimeout(() => {
                    const alertEl = document.querySelector('.alert-success');
                    if (alertEl) alertEl.remove();
                }, 3000);
            } else {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.message || `Upload failed with status: ${response.status}`;
                alert(`Failed to upload marksheet: ${errorMessage}`);
            }
        } catch (error) {
            console.error('Upload error:', error);
            alert(`Error uploading marksheet: ${error.message || 'Network error. Please check your connection and try again.'}`);
        }
    };

    const validateAllFields = () => {
        let hasErrors = false;
        const newErrors = {};
        const newAdditionalErrors = [];

        // Validate main education fields - all required for saving
        ['tenth', 'diploma', 'degree'].forEach(level => {
            // Check if any field has data for this level
            const hasAnyData = educationData[level].schoolName || educationData[level].location || educationData[level].passoutYear || educationData[level].percentage;
            
            if (hasAnyData) {
                // If any field has data, all required fields must be filled
                ['schoolName', 'location', 'passoutYear'].forEach(field => {
                    const value = educationData[level][field];
                    if (!value || !value.trim()) {
                        const fieldNames = {schoolName: 'School/College name', location: 'Location', passoutYear: 'Passout year'};
                        const levelNames = {tenth: '10th School', diploma: 'Diploma/PUC', degree: 'Degree'};
                        newErrors[`${level}_${field}`] = `${levelNames[level]} - ${fieldNames[field]} is required`;
                        hasErrors = true;
                    } else if (!validateEducationField(level, field, value)) {
                        hasErrors = true;
                    }
                });
            }

            // Validate specialization (optional but length check)
            if (educationData[level].specialization && educationData[level].specialization.trim().length > 100) {
                if (!validateEducationField(level, 'specialization', educationData[level].specialization)) {
                    hasErrors = true;
                }
            }

            // Validate percentage if provided
            if (educationData[level].percentage && !validateEducationField(level, 'percentage', educationData[level].percentage)) {
                hasErrors = true;
            }
        });

        // Validate additional rows - all required for saving if any field has data
        additionalRows.forEach((row, index) => {
            const rowErrors = {};
            const hasAnyData = row.schoolName || row.location || row.passoutYear || row.percentage;
            
            if (hasAnyData) {
                ['schoolName', 'location', 'passoutYear'].forEach(field => {
                    if (!row[field] || !row[field].trim()) {
                        const fieldNames = {schoolName: 'School/College name', location: 'Location', passoutYear: 'Passout year'};
                        rowErrors[field] = `Additional Education Row ${index + 1} - ${fieldNames[field]} is required`;
                        hasErrors = true;
                    } else if (!validateEducationField('additional', field, row[field], index)) {
                        hasErrors = true;
                    }
                });
                
                const updatedAdditionalErrors = [...additionalErrors];
                updatedAdditionalErrors[index] = rowErrors;
                setAdditionalErrors(updatedAdditionalErrors);
            }

            if (row.specialization && row.specialization.trim().length > 100) {
                if (!validateEducationField('additional', 'specialization', row.specialization, index)) {
                    hasErrors = true;
                }
            }

            if (row.percentage && !validateEducationField('additional', 'percentage', row.percentage, index)) {
                hasErrors = true;
            }

            newAdditionalErrors.push(rowErrors);
        });

        // Set errors in state
        setErrors(newErrors);
        setAdditionalErrors(newAdditionalErrors);
        
        // Return validation result with errors
        const allErrors = [];
        Object.values(newErrors).forEach(error => {
            if (error) allErrors.push(error);
        });
        newAdditionalErrors.forEach((rowErrors) => {
            if (rowErrors) {
                Object.values(rowErrors).forEach(error => {
                    if (error) allErrors.push(error);
                });
            }
        });
        
        return { isValid: !hasErrors, errors: allErrors };
    };

    const handleSave = async () => {
        // Validate all fields before saving
        const validationResult = validateAllFields();
        if (!validationResult.isValid) {
            if (validationResult.errors.length > 0) {
                alert(`Please fix the following errors:\n\n${validationResult.errors.join('\n')}`);
            } else {
                alert('Please fill in all required fields before saving.');
            }
            return;
        }

        try {
            setLoading(true);
            const token = localStorage.getItem('candidateToken');

            const educationArray = [
                {
                    degreeName: educationData.tenth.schoolName?.trim(),
                    specialization: educationData.tenth.specialization?.trim(),
                    collegeName: educationData.tenth.location?.trim(),
                    passYear: educationData.tenth.passoutYear,
                    percentage: educationData.tenth.percentage,
                    cgpa: educationData.tenth.cgpa,
                    grade: educationData.tenth.grade,
                    marksheet: educationData.tenth.marksheetBase64
                },
                {
                    degreeName: educationData.diploma.schoolName?.trim(),
                    specialization: educationData.diploma.specialization?.trim(),
                    collegeName: educationData.diploma.location?.trim(),
                    passYear: educationData.diploma.passoutYear,
                    percentage: educationData.diploma.percentage,
                    cgpa: educationData.diploma.cgpa,
                    grade: educationData.diploma.grade,
                    marksheet: educationData.diploma.marksheetBase64
                },
                {
                    degreeName: educationData.degree.schoolName?.trim(),
                    specialization: educationData.degree.specialization?.trim(),
                    collegeName: educationData.degree.location?.trim(),
                    passYear: educationData.degree.passoutYear,
                    percentage: educationData.degree.percentage,
                    cgpa: educationData.degree.cgpa,
                    grade: educationData.degree.grade,
                    marksheet: educationData.degree.marksheetBase64
                },
                ...additionalRows.map(row => ({
                    degreeName: row.schoolName?.trim(),
                    specialization: row.specialization?.trim(),
                    collegeName: row.location?.trim(),
                    passYear: row.passoutYear,
                    percentage: row.percentage,
                    cgpa: row.cgpa,
                    grade: row.grade,
                    marksheet: row.marksheetBase64
                }))
            ];

            const response = await api.updateCandidateProfile({ education: educationArray });

            if (response.success) {
                window.dispatchEvent(new CustomEvent('profileUpdated'));
                alert('Education details saved successfully!');
            } else {
                alert('Failed to save education details. Please try again.');
            }
        } catch (error) {
            alert('Failed to save education details. Please check your connection and try again.');
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
                    <div className="table-responsive">
                        <table className="table table-bordered">
                            <colgroup>
                                <col style={{width: '10%'}} />
                                <col style={{width: '13%'}} />
                                <col style={{width: '12%'}} />
                                <col style={{width: '10%'}} />
                                <col style={{width: '10%'}} />
                                <col style={{width: '9%'}} />
                                <col style={{width: '7%'}} />
                                <col style={{width: '7%'}} />
                                <col style={{width: '14%'}} />
                                <col style={{width: '8%'}} />
                            </colgroup>
                            <thead className="table-light">
                                <tr>
                                    <th>Education Level</th>
                                    <th>School/College Name</th>
                                    <th>Specialization</th>
                                    <th>Location</th>
                                    <th>Passout Year</th>
                                    <th>Percentage</th>
                                    <th>CGPA</th>
                                    <th>Grade</th>
                                    <th>Marksheet</th>
                                    <th>Edit</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><strong>10th School</strong></td>
                                    <td>
                                        <input
                                            className={`form-control ${errors.schoolName ? 'is-invalid' : ''}`}
                                            name="schoolName"
                                            type="text"
                                            placeholder="Enter 10th School Name"
                                            value={educationData.tenth.schoolName}
                                            onChange={(e) => handleInputChange(e, 'tenth')}
                                            disabled={!editMode.tenth}
                                        />
                                        {errors.schoolName && <div className="invalid-feedback d-block" style={{fontSize: '10px'}}>{errors.schoolName}</div>}
                                    </td>
                                    <td>
                                        <input
                                            className={`form-control ${errors.specialization ? 'is-invalid' : ''}`}
                                            name="specialization"
                                            type="text"
                                            placeholder="Enter Specialization"
                                            value={educationData.tenth.specialization}
                                            onChange={(e) => handleInputChange(e, 'tenth')}
                                            disabled={!editMode.tenth}
                                        />
                                        {errors.specialization && <div className="invalid-feedback d-block" style={{fontSize: '10px'}}>{errors.specialization}</div>}
                                    </td>
                                    <td>
                                        <input
                                            className={`form-control ${errors.location ? 'is-invalid' : ''}`}
                                            name="location"
                                            type="text"
                                            placeholder="Enter Location"
                                            value={educationData.tenth.location}
                                            onChange={(e) => handleInputChange(e, 'tenth')}
                                            disabled={!editMode.tenth}
                                        />
                                        {errors.location && <div className="invalid-feedback d-block" style={{fontSize: '10px'}}>{errors.location}</div>}
                                    </td>

                                    <td>
                                        <input
                                            className={`form-control ${errors.passoutYear ? 'is-invalid' : ''}`}
                                            name="passoutYear"
                                            type="text"
                                            placeholder="2024"
                                            value={educationData.tenth.passoutYear}
                                            onChange={(e) => handleInputChange(e, 'tenth')}
                                            disabled={!editMode.tenth}
                                        />
                                        {errors.passoutYear && <div className="invalid-feedback d-block" style={{fontSize: '10px'}}>{errors.passoutYear}</div>}
                                    </td>
                                    <td>
                                        <input
                                            className={`form-control ${errors.percentage ? 'is-invalid' : ''}`}
                                            name="percentage"
                                            type="number"
                                            placeholder="90"
                                            value={educationData.tenth.percentage}
                                            onChange={(e) => handleInputChange(e, 'tenth')}
                                            disabled={!editMode.tenth}
                                        />
                                        {errors.percentage && <div className="invalid-feedback d-block" style={{fontSize: '10px'}}>{errors.percentage}</div>}
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control" 
                                            value={educationData.tenth.cgpa}
                                            readOnly
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control" 
                                            value={educationData.tenth.grade}
                                            readOnly
                                        />
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column gap-1">
                                            <input 
                                                className="form-control"
                                                name="marksheet" 
                                                type="file" 
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleInputChange(e, 'tenth')}
                                                disabled={!editMode.tenth}
                                            />
                                            {educationData.tenth.marksheetBase64 && (
                                                <small className="text-success">
                                                    <i className="fa fa-check"></i> Uploaded
                                                </small>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <button 
                                            type="button" 
                                            className={`btn btn-sm ${editMode.tenth ? 'btn-outline-success' : 'btn-outline-primary'}`}
                                            onClick={() => toggleEdit('tenth')}
                                            style={{backgroundColor: 'transparent'}}
                                        >
                                            {editMode.tenth ? 'Save' : 'Edit'}
                                        </button>
                                    </td>

                                </tr>
                                <tr>
                                    <td><strong>Diploma/PUC</strong></td>
                                    <td>
                                        <input 
                                            className="form-control"
                                            name="schoolName" 
                                            type="text" 
                                            placeholder="Enter Diploma/PUC Name"
                                            value={educationData.diploma.schoolName}
                                            onChange={(e) => handleInputChange(e, 'diploma')}
                                            disabled={!editMode.diploma}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control"
                                            name="specialization" 
                                            type="text" 
                                            placeholder="Enter Specialization" 
                                            value={educationData.diploma.specialization}
                                            onChange={(e) => handleInputChange(e, 'diploma')}
                                            disabled={!editMode.diploma}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control"
                                            name="location" 
                                            type="text" 
                                            placeholder="Enter Location" 
                                            value={educationData.diploma.location}
                                            onChange={(e) => handleInputChange(e, 'diploma')}
                                            disabled={!editMode.diploma}
                                        />
                                    </td>

                                    <td>
                                        <input 
                                            className="form-control"
                                            name="passoutYear" 
                                            type="text" 
                                            placeholder="2024" 
                                            value={educationData.diploma.passoutYear}
                                            onChange={(e) => handleInputChange(e, 'diploma')}
                                            disabled={!editMode.diploma}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control"
                                            name="percentage" 
                                            type="number" 
                                            placeholder="90"
                                            value={educationData.diploma.percentage}
                                            onChange={(e) => handleInputChange(e, 'diploma')}
                                            disabled={!editMode.diploma}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control" 
                                            value={educationData.diploma.cgpa}
                                            readOnly
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control" 
                                            value={educationData.diploma.grade}
                                            readOnly
                                        />
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column gap-1">
                                            <input 
                                                className="form-control"
                                                name="marksheet" 
                                                type="file" 
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleInputChange(e, 'diploma')}
                                                disabled={!editMode.diploma}
                                            />
                                            {educationData.diploma.marksheetBase64 && (
                                                <small className="text-success">
                                                    <i className="fa fa-check"></i> Uploaded
                                                </small>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <button 
                                            type="button" 
                                            className={`btn btn-sm ${editMode.diploma ? 'btn-outline-success' : 'btn-outline-primary'}`}
                                            onClick={() => toggleEdit('diploma')}
                                            style={{backgroundColor: 'transparent'}}
                                        >
                                            {editMode.diploma ? 'Save' : 'Edit'}
                                        </button>
                                    </td>

                                </tr>
                                <tr>
                                    <td><strong>Degree</strong></td>
                                    <td>
                                        <input 
                                            className="form-control"
                                            name="schoolName" 
                                            type="text" 
                                            placeholder="Enter Degree College Name"
                                            value={educationData.degree.schoolName}
                                            onChange={(e) => handleInputChange(e, 'degree')}
                                            disabled={!editMode.degree}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control"
                                            name="specialization" 
                                            type="text" 
                                            placeholder="Enter Specialization" 
                                            value={educationData.degree.specialization}
                                            onChange={(e) => handleInputChange(e, 'degree')}
                                            disabled={!editMode.degree}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control"
                                            name="location" 
                                            type="text" 
                                            placeholder="Enter Location" 
                                            value={educationData.degree.location}
                                            onChange={(e) => handleInputChange(e, 'degree')}
                                            disabled={!editMode.degree}
                                        />
                                    </td>

                                    <td>
                                        <input 
                                            className="form-control"
                                            name="passoutYear" 
                                            type="text" 
                                            placeholder="2024" 
                                            value={educationData.degree.passoutYear}
                                            onChange={(e) => handleInputChange(e, 'degree')}
                                            disabled={!editMode.degree}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control"
                                            name="percentage" 
                                            type="number" 
                                            placeholder="90"
                                            value={educationData.degree.percentage}
                                            onChange={(e) => handleInputChange(e, 'degree')}
                                            disabled={!editMode.degree}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control" 
                                            value={educationData.degree.cgpa}
                                            readOnly
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control" 
                                            value={educationData.degree.grade}
                                            readOnly
                                        />
                                    </td>
                                    <td>
                                        <div className="d-flex flex-column gap-1">
                                            <input 
                                                className="form-control"
                                                name="marksheet" 
                                                type="file" 
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => handleInputChange(e, 'degree')}
                                                disabled={!editMode.degree}
                                            />
                                            {educationData.degree.marksheetBase64 && (
                                                <small className="text-success">
                                                    <i className="fa fa-check"></i> Uploaded
                                                </small>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <button 
                                            type="button" 
                                            className={`btn btn-sm ${editMode.degree ? 'btn-outline-success' : 'btn-outline-primary'}`}
                                            onClick={() => toggleEdit('degree')}
                                            style={{backgroundColor: 'transparent'}}
                                        >
                                            {editMode.degree ? 'Save' : 'Edit'}
                                        </button>
                                    </td>

                                </tr>
                                {additionalRows.map((row, index) => (
                                    <tr key={row.id}>
                                        <td>
                                            <strong>{row.educationType}</strong>
                                            <button 
                                                type="button" 
                                                className="btn btn-sm btn-outline-danger ms-2"
                                                onClick={() => removeRow(index)}
                                                title="Remove"
                                                style={{backgroundColor: 'transparent'}}
                                            >
                                                ×
                                            </button>
                                        </td>
                                        <td>
                                            <input 
                                                className="form-control"
                                                name="schoolName" 
                                                type="text" 
                                                placeholder="Enter Degree College Name"
                                                value={row.schoolName}
                                                onChange={(e) => handleInputChange(e, null, index)}
                                                disabled={!additionalEditMode[index]}
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                className="form-control"
                                                name="specialization" 
                                                type="text" 
                                                placeholder="Enter Specialization" 
                                                value={row.specialization}
                                                onChange={(e) => handleInputChange(e, null, index)}
                                                disabled={!additionalEditMode[index]}
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                className="form-control"
                                                name="location" 
                                                type="text" 
                                                placeholder="Enter Location" 
                                                value={row.location}
                                                onChange={(e) => handleInputChange(e, null, index)}
                                                disabled={!additionalEditMode[index]}
                                            />
                                        </td>

                                        <td>
                                            <input 
                                                className="form-control"
                                                name="passoutYear" 
                                                type="text" 
                                                placeholder="2024" 
                                                value={row.passoutYear}
                                                onChange={(e) => handleInputChange(e, null, index)}
                                                disabled={!additionalEditMode[index]}
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                className="form-control"
                                                name="percentage" 
                                                type="number" 
                                                placeholder="90"
                                                value={row.percentage}
                                                onChange={(e) => handleInputChange(e, null, index)}
                                                disabled={!additionalEditMode[index]}
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                className="form-control" 
                                                value={row.cgpa}
                                                readOnly
                                            />
                                        </td>
                                        <td>
                                            <input 
                                                className="form-control" 
                                                value={row.grade}
                                                readOnly
                                            />
                                        </td>
                                        <td>
                                            <div className="d-flex flex-column gap-1">
                                                <input 
                                                    className="form-control"
                                                    name="marksheet" 
                                                    type="file" 
                                                    accept=".pdf,.jpg,.jpeg,.png"
                                                    onChange={(e) => handleInputChange(e, null, index)}
                                                    disabled={!additionalEditMode[index]}
                                                />
                                                {row.marksheetBase64 && (
                                                    <small className="text-success">
                                                        <i className="fa fa-check"></i> Uploaded
                                                    </small>
                                                )}
                                            </div>
                                        </td>
                                        <td>
                                            <button 
                                                type="button" 
                                                className={`btn btn-sm ${additionalEditMode[index] ? 'btn-outline-success' : 'btn-outline-primary'}`}
                                                onClick={() => toggleEdit(null, index)}
                                                style={{backgroundColor: 'transparent'}}
                                            >
                                                {additionalEditMode[index] ? 'Save' : 'Edit'}
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-3 d-flex gap-3 align-items-center">
                        <button
                            type="button"
                            className="btn btn-outline-success"
                            onClick={addNewRow}
                            style={{
                                height: '38px',
                                backgroundColor: '#fed7aa !important',
                                borderColor: '#fed7aa !important',
                                color: '#000 !important'
                            }}
                        >
                            Add New
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-outline-primary" 
                            onClick={handleSave} 
                            disabled={loading}
                            style={{height: '38px', backgroundColor: 'transparent'}}
                        >
                            {loading ? 'Saving...' : 'Save All Education Details'}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}
export default SectionCanEducation;
