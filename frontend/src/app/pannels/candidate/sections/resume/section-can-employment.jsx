import { useEffect, useState, memo } from "react";
import { api } from "../../../../../utils/api";

function SectionCanEmployment({ profile }) {
    const modalId = 'EmploymentModal';
    const [formData, setFormData] = useState({
        designation: '',
        organization: '',
        isCurrent: false,
        startDate: '',
        endDate: '',
        description: ''
    });
    const [totalExperience, setTotalExperience] = useState('');
    const [loading, setLoading] = useState(false);
    const [employment, setEmployment] = useState([]);

    useEffect(() => {
        if (profile?.employment) {
            setEmployment(profile.employment);
        }
        if (profile?.totalExperience) {
            setTotalExperience(profile.totalExperience);
        }
    }, [profile]);



    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        if (!formData.designation || !formData.organization) {
            alert('Please fill in designation and organization');
            return;
        }
        
        setLoading(true);
        try {
            const newEmployment = [...employment, formData];
            const updateData = { employment: newEmployment };
            if (totalExperience) {
                updateData.totalExperience = totalExperience;
            }
            const response = await api.updateCandidateProfile(updateData);
            if (response.success) {
                setEmployment(newEmployment);
                setFormData({ designation: '', organization: '', isCurrent: false, startDate: '', endDate: '', description: '' });
                alert('Employment added successfully!');
                document.querySelector('[data-bs-dismiss="modal"]').click();
            }
        } catch (error) {
            alert('Failed to save employment');
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn">
                <h4 className="panel-tittle m-a0">Employment</h4>
                <button 
                    type="button" 
                    data-bs-toggle="modal" 
                    data-bs-target={`#${modalId}`}
                    title="Edit" 
                    className="btn btn-link site-text-primary p-0 border-0"
                    style={{
                        background: 'none', 
                        textDecoration: 'none', 
                        cursor: 'pointer', 
                        outline: 'none', 
                        transition: 'none',
                        transform: 'none',
                        animation: 'none',
                        willChange: 'auto',
                        backfaceVisibility: 'hidden',
                        WebkitBackfaceVisibility: 'hidden'
                    }}
                >
                    <span className="fa fa-edit" style={{
                        transition: 'none',
                        transform: 'none',
                        animation: 'none'
                    }} />
                </button>
            </div>
            <div className="panel-body wt-panel-body p-a20" style={{
                transition: 'none', 
                animation: 'none',
                transform: 'none',
                willChange: 'auto'
            }}>
                <div className="twm-panel-inner" style={{
                    transition: 'none', 
                    transform: 'none',
                    animation: 'none',
                    willChange: 'auto'
                }}>
                    {totalExperience && (
                        <div className="mb-3" style={{background: '#f8f9fa', padding: '12px', borderRadius: '6px', border: '1px solid #e9ecef'}}>
                            <p><b>Total Experience: {totalExperience}</b></p>
                        </div>
                    )}
                    {employment.length > 0 ? (
                        employment.map((emp, index) => (
                            <div key={index} className="mb-3">
                                <p><b>{emp.designation}</b></p>
                                <p>{emp.organization}</p>
                                <p>{emp.startDate} - {emp.isCurrent ? 'Present' : emp.endDate}</p>
                                {emp.description && <p>{emp.description}</p>}
                            </div>
                        ))
                    ) : (
                        <p>No employment history added yet. Click the edit button to add your work experience.</p>
                    )}
                </div>
            </div>
            {/*Employment */}
            <div className="modal fade twm-saved-jobs-view" id={modalId} tabIndex={-1} style={{display: 'none'}}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form onSubmit={(e) => e.preventDefault()}>
                            <div className="modal-header">
                                <h2 className="modal-title">Add Employment</h2>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>
                            <div className="modal-body">
                                <div className="row">
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Total Experience</label>
                                            <div className="ls-inputicon-box">
                                                <input 
                                                    className="form-control" 
                                                    type="text" 
                                                    placeholder="e.g., 2 years, 6 months" 
                                                    value={totalExperience}
                                                    onChange={(e) => setTotalExperience(e.target.value)}
                                                    style={{paddingLeft: '40px'}}
                                                />
                                                <i className="fs-input-icon fa fa-clock" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Your Designation</label>
                                            <div className="ls-inputicon-box">
                                                <input 
                                                    className="form-control" 
                                                    type="text" 
                                                    placeholder="Enter Your Designation" 
                                                    value={formData.designation}
                                                    onChange={(e) => handleInputChange('designation', e.target.value)}
                                                    style={{paddingLeft: '40px'}}
                                                />
                                                <i className="fs-input-icon fa fa-address-card" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Your Organization</label>
                                            <div className="ls-inputicon-box">
                                                <input 
                                                    className="form-control" 
                                                    type="text" 
                                                    placeholder="Enter Your Organization" 
                                                    value={formData.organization}
                                                    onChange={(e) => handleInputChange('organization', e.target.value)}
                                                    style={{paddingLeft: '40px'}}
                                                />
                                                <i className="fs-input-icon fa fa-building" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-xl-12 col-lg-12">
                                        <div className="form-group">
                                            <label>Is this your current company?</label>
                                            <div className="row twm-form-radio-inline">
                                                <div className="col-md-6">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="radio" 
                                                        name="flexRadioDefault" 
                                                        id="flexRadioDefault1" 
                                                        checked={formData.isCurrent}
                                                        onChange={() => handleInputChange('isCurrent', true)}
                                                    />
                                                    <label className="form-check-label" htmlFor="flexRadioDefault1">
                                                        Yes
                                                    </label>
                                                </div>
                                                <div className="col-md-6">
                                                    <input 
                                                        className="form-check-input" 
                                                        type="radio" 
                                                        name="flexRadioDefault" 
                                                        id="S_no" 
                                                        checked={!formData.isCurrent}
                                                        onChange={() => handleInputChange('isCurrent', false)}
                                                    />
                                                    <label className="form-check-label" htmlFor="S_no">
                                                        No
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/*Start Date*/}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Started Working From</label>
                                            <div className="ls-inputicon-box">
                                                <input 
                                                    className="form-control" 
                                                    type="date" 
                                                    value={formData.startDate}
                                                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                                                    style={{paddingLeft: '40px'}}
                                                />
                                                <i className="fs-input-icon far fa-calendar" />
                                            </div>
                                        </div>
                                    </div>
                                    {/*End Date*/}
                                    <div className="col-md-6">
                                        <div className="form-group">
                                            <label>Worked Till</label>
                                            <div className="ls-inputicon-box">
                                                <input 
                                                    className="form-control" 
                                                    type="date" 
                                                    value={formData.endDate}
                                                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                                                    disabled={formData.isCurrent}
                                                    style={{paddingLeft: '40px'}}
                                                />
                                                <i className="fs-input-icon far fa-calendar" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-md-12">
                                        <div className="form-group mb-0">
                                            <label>Describe your Job Profile</label>
                                            <textarea 
                                                className="form-control" 
                                                rows={3} 
                                                placeholder="Describe your Job" 
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="site-button" data-bs-dismiss="modal">Close</button>
                                <button 
                                    type="button" 
                                    className="site-button" 
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
                        </form>
                    </div>
                </div>
            </div>
        </>
    )
}
export default memo(SectionCanEmployment);