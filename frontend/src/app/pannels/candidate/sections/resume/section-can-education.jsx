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
                console.log('Marksheet uploaded successfully:', result);
                
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
                
                alert('Marksheet uploaded successfully!');
            } else {
                console.error('Failed to upload marksheet');
                alert('Failed to upload marksheet');
            }
        } catch (error) {
            console.error('Error uploading marksheet:', error);
            alert('Error uploading marksheet');
        }
    };

    const handleSave = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('candidateToken');
            
            const educationArray = [
                {
                    degreeName: educationData.tenth.schoolName,
                    specialization: educationData.tenth.specialization,
                    collegeName: educationData.tenth.location,
                    passYear: educationData.tenth.passoutYear,
                    percentage: educationData.tenth.percentage,
                    cgpa: educationData.tenth.cgpa,
                    grade: educationData.tenth.grade,
                    marksheet: educationData.tenth.marksheetBase64
                },
                {
                    degreeName: educationData.diploma.schoolName,
                    specialization: educationData.diploma.specialization,
                    collegeName: educationData.diploma.location,
                    passYear: educationData.diploma.passoutYear,
                    percentage: educationData.diploma.percentage,
                    cgpa: educationData.diploma.cgpa,
                    grade: educationData.diploma.grade,
                    marksheet: educationData.diploma.marksheetBase64
                },
                {
                    degreeName: educationData.degree.schoolName,
                    specialization: educationData.degree.specialization,
                    collegeName: educationData.degree.location,
                    passYear: educationData.degree.passoutYear,
                    percentage: educationData.degree.percentage,
                    cgpa: educationData.degree.cgpa,
                    grade: educationData.degree.grade,
                    marksheet: educationData.degree.marksheetBase64
                },
                ...additionalRows.map(row => ({
                    degreeName: row.schoolName,
                    specialization: row.specialization,
                    collegeName: row.location,
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
                alert('Failed to save education details');
            }
        } catch (error) {
            console.error('Error saving education:', error);
            alert('Failed to save education details');
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
                                            className="form-control"
                                            name="schoolName" 
                                            type="text" 
                                            placeholder="Enter 10th School Name"
                                            value={educationData.tenth.schoolName}
                                            onChange={(e) => handleInputChange(e, 'tenth')}
                                            disabled={!editMode.tenth}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control"
                                            name="specialization" 
                                            type="text" 
                                            placeholder="Enter Specialization" 
                                            value={educationData.tenth.specialization}
                                            onChange={(e) => handleInputChange(e, 'tenth')}
                                            disabled={!editMode.tenth}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control"
                                            name="location" 
                                            type="text" 
                                            placeholder="Enter Location" 
                                            value={educationData.tenth.location}
                                            onChange={(e) => handleInputChange(e, 'tenth')}
                                            disabled={!editMode.tenth}
                                        />
                                    </td>

                                    <td>
                                        <input 
                                            className="form-control"
                                            name="passoutYear" 
                                            type="number" 
                                            placeholder="2024" 
                                            value={educationData.tenth.passoutYear}
                                            onChange={(e) => handleInputChange(e, 'tenth')}
                                            disabled={!editMode.tenth}
                                        />
                                    </td>
                                    <td>
                                        <input 
                                            className="form-control"
                                            name="percentage" 
                                            type="number" 
                                            placeholder="90"
                                            value={educationData.tenth.percentage}
                                            onChange={(e) => handleInputChange(e, 'tenth')}
                                            disabled={!editMode.tenth}
                                        />
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
                                            className={`btn btn-sm ${editMode.tenth ? 'btn-success' : 'btn-primary'}`}
                                            onClick={() => toggleEdit('tenth')}
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
                                            type="number" 
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
                                            className={`btn btn-sm ${editMode.diploma ? 'btn-success' : 'btn-primary'}`}
                                            onClick={() => toggleEdit('diploma')}
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
                                            type="number" 
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
                                            className={`btn btn-sm ${editMode.degree ? 'btn-success' : 'btn-primary'}`}
                                            onClick={() => toggleEdit('degree')}
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
                                                type="number" 
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
                                                className={`btn btn-sm ${additionalEditMode[index] ? 'btn-success' : 'btn-primary'}`}
                                                onClick={() => toggleEdit(null, index)}
                                            >
                                                {additionalEditMode[index] ? 'Save' : 'Edit'}
                                            </button>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="mt-3">
                        <button 
                            type="button" 
                            className="btn btn-success me-2" 
                            onClick={addNewRow}
                        >
                            Add New
                        </button>
                        <button 
                            type="button" 
                            className="btn btn-primary" 
                            onClick={handleSave} 
                            disabled={loading}
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