import { useEffect, useRef, useState } from "react";
import { api } from "../../../../../utils/api";

function SectionCanEmployment({ profile }) {
    const modalRef = useRef(null);
    const [formData, setFormData] = useState({
        designation: '',
        organization: '',
        isCurrent: false,
        startDate: '',
        endDate: '',
        description: ''
    });
    const [loading, setLoading] = useState(false);
    const [employment, setEmployment] = useState([]);

    useEffect(() => {
        if (window.bootstrap && modalRef.current) {
            new window.bootstrap.Modal(modalRef.current);
        }
        if (profile?.employment) {
            setEmployment(profile.employment);
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
            const response = await api.updateCandidateProfile({ employment: newEmployment });
            if (response.success) {
                setEmployment(newEmployment);
                setFormData({ designation: '', organization: '', isCurrent: false, startDate: '', endDate: '', description: '' });
                alert('Employment added successfully!');
                window.dispatchEvent(new CustomEvent('profileUpdated'));
                const modal = window.bootstrap.Modal.getInstance(modalRef.current);
                if (modal) modal.hide();
            }
        } catch (error) {
            alert('Failed to save employment');
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="panel-heading wt-panel-heading p-a20 panel-heading-with-btn ">
                <h4 className="panel-tittle m-a0">Employment</h4>
                <a data-bs-toggle="modal" href="#Employment" role="button" title="Edit" className="site-text-primary">
                    <span className="fa fa-edit" />
                </a>
            </div>
            <div className="panel-body wt-panel-body p-a20 ">
                <div className="twm-panel-inner">
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
            <div className="modal fade twm-saved-jobs-view" id="Employment" tabIndex={-1} ref={modalRef}>
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content">
                        <form>
                            <div className="modal-header">
                                <h2 className="modal-title">Add Employment</h2>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close" />
                            </div>
                            <div className="modal-body">
                                <div className="row">
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
                                    onClick={handleSave}
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
export default SectionCanEmployment;