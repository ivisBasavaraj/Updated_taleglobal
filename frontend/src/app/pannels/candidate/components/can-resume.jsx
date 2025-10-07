import { useEffect, useState, useCallback } from "react";
import SectionCanAccomplishments from "../sections/resume/section-can-accomplishments";
import SectionCanAttachment from "../sections/resume/section-can-attachment";
import SectionCanDesiredProfile from "../sections/resume/section-can-desired-profile";
// import SectionCanEducation from "../sections/resume/section-can-education";
import SectionCanEmployment from "../sections/resume/section-can-employment";
import SectionCanITSkills from "../sections/resume/section-can-itskills";
import SectionCanKeySkills from "../sections/resume/section-can-keyskills";
import SectionCanPersonalDetail from "../sections/resume/section-can-personal";
import SectionCanProfileSummary from "../sections/resume/section-can-profile-summary";
import SectionCanProjects from "../sections/resume/section-can-projects";
import SectionCanResumeHeadline from "../sections/resume/section-can-resume-headline";
import { loadScript } from "../../../../globals/constants";
import { api } from "../../../../utils/api";
import { initializeAllModals } from "../../../../utils/modalUtils";
import "./resume-styles.css";

function CanMyResumePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalsInitialized, setModalsInitialized] = useState(false);
    
    useEffect(()=>{
        fetchProfile();
    }, [])

    // Initialize modals when component is ready
    const initializeModals = useCallback(() => {
        if (!modalsInitialized && !loading) {
            const timer = setTimeout(() => {
                try {
                    initializeAllModals();
                    setModalsInitialized(true);
                    console.log('Modals initialized successfully');
                } catch (error) {
                    console.error('Failed to initialize modals:', error);
                }
            }, 200);
            
            return () => clearTimeout(timer);
        }
    }, [loading, modalsInitialized]);
    
    useEffect(() => {
        initializeModals();
    }, [initializeModals]);
    
    // Clean up modals on unmount
    useEffect(() => {
        return () => {
            try {
                // Clean up any open modals when component unmounts
                const openModals = document.querySelectorAll('.modal.show');
                openModals.forEach(modal => {
                    if (window.bootstrap && window.bootstrap.Modal) {
                        const modalInstance = window.bootstrap.Modal.getInstance(modal);
                        if (modalInstance) modalInstance.hide();
                    }
                });
                
                // Clean up backdrops
                const backdrops = document.querySelectorAll('.modal-backdrop');
                backdrops.forEach(backdrop => backdrop.remove());
                
                // Remove modal-open class from body
                document.body.classList.remove('modal-open');
                document.body.style.paddingRight = '';
            } catch (error) {
                console.error('Error during modal cleanup:', error);
            }
        };
    }, []);

    const fetchProfile = useCallback(async () => {
        try {
            setError(null);
            const response = await api.getCandidateProfile();
            console.log('Resume profile response:', response);
            if (response.success) {
                setProfile(response.profile);
                // Trigger dashboard refresh by dispatching custom event
                window.dispatchEvent(new CustomEvent('profileUpdated'));
            } else {
                setError('Failed to load profile data');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            setError('Unable to connect to server. Please check your internet connection.');
        } finally {
            setLoading(false);
        }
    }, []);

    const handleProfileUpdate = useCallback(() => {
        fetchProfile();
        // Re-initialize modals after profile update
        setModalsInitialized(false);
        setTimeout(() => {
            initializeModals();
        }, 100);
    }, [fetchProfile, initializeModals]);

    return (
			<>
				<div className="twm-right-section-panel site-bg-gray" style={{minHeight: '100vh', padding: '20px'}}>
					{/* Resume Page Header */}
					<div className="panel panel-default mb-4">
						<div className="panel-heading wt-panel-heading p-a20">
							<h3 className="panel-tittle m-a0 text-center">
								<i className="fa fa-file-text-o me-2" style={{color: '#ff6b35'}}></i>
								My Resume
							</h3>
							<p className="text-center text-muted mb-0">
								<i className="fa fa-wrench me-1" style={{color: '#ff6b35'}}></i>
								Build and manage your professional resume
							</p>
						</div>
					</div>

					{loading ? (
						<div className="text-center p-5">
							<div className="d-flex flex-column align-items-center">
								<i className="fa fa-spinner fa-spin fa-3x site-text-primary mb-3"></i>
								<h5 className="text-muted">Loading your resume...</h5>
								<p className="text-muted small">Please wait while we fetch your profile data</p>
							</div>
						</div>
					) : error ? (
						<div className="text-center p-5">
							<div className="alert alert-danger">
								<i className="fa fa-exclamation-triangle fa-2x mb-3"></i>
								<h5>Error Loading Profile</h5>
								<p>{error}</p>
								<button 
									type="button" 
									className="btn btn-primary mt-2"
									onClick={() => {
										setLoading(true);
										fetchProfile();
									}}
								>
									<i className="fa fa-refresh me-1"></i>
									Try Again
								</button>
							</div>
						</div>
					) : (
						<div className="row">
							<div className="col-12">
								<div className="panel panel-default mb-4">
									<SectionCanResumeHeadline profile={profile} />
								</div>

								<div className="panel panel-default mb-4">
									<SectionCanProfileSummary profile={profile} />
								</div>

								<div className="panel panel-default mb-4">
									<SectionCanKeySkills profile={profile} />
								</div>

								<div className="panel panel-default mb-4">
									<SectionCanPersonalDetail profile={profile} />
								</div>

								<div className="panel panel-default mb-4">
									<SectionCanAttachment profile={profile} />
								</div>
							</div>
						</div>
					)}
				</div>
			</>
		);
}

export default CanMyResumePage;