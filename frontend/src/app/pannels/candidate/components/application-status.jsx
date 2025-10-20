// Route: /candidate/status

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadScript } from "../../../../globals/constants";
import { api } from "../../../../utils/api";
import CanPostedJobs from "./can-posted-jobs";
import PopupInterviewRoundDetails from "../../../common/popups/popup-interview-round-details";
import "./status-styles.css";

// Add CSS for hover effect and highlighting
const styles = `
.hover-primary:hover {
	color: #0d6efd !important;
	cursor: pointer;
}

.highlight-shortlisted {
	animation: highlightPulse 2s ease-in-out 3;
	box-shadow: 0 0 15px rgba(76, 175, 80, 0.3);
}

.highlight-company-position {
	animation: highlightCompanyPosition 3s ease-in-out 3;
	box-shadow: 0 0 20px rgba(255, 107, 53, 0.4);
	border: 2px solid #ff6b35 !important;
}

@keyframes highlightPulse {
	0% { background-color: #e8f5e9; }
	50% { background-color: #c8e6c9; }
	100% { background-color: #e8f5e9; }
}

@keyframes highlightCompanyPosition {
	0% { background-color: #fff3e0; }
	50% { background-color: #ffe0b3; }
	100% { background-color: #fff3e0; }
}
`;

// Inject styles
if (typeof document !== 'undefined') {
	const styleSheet = document.createElement('style');
	styleSheet.type = 'text/css';
	styleSheet.innerText = styles;
	document.head.appendChild(styleSheet);
}

function CanStatusPage() {
	const navigate = useNavigate();
	const [applications, setApplications] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeTab, setActiveTab] = useState('applications');
	const [highlightShortlisted, setHighlightShortlisted] = useState(false);
	const [highlightCompanyPosition, setHighlightCompanyPosition] = useState(false);
	const [showRoundDetails, setShowRoundDetails] = useState(false);
	const [selectedRoundDetails, setSelectedRoundDetails] = useState(null);
	const [selectedRoundType, setSelectedRoundType] = useState(null);

	useEffect(() => {
		loadScript("js/custom.js");
		fetchApplications();
		
		// Check if we should highlight shortlisted applications
		const shouldHighlight = sessionStorage.getItem('highlightShortlisted');
		if (shouldHighlight === 'true') {
			setHighlightShortlisted(true);
			// Clear the flag after 5 seconds
			setTimeout(() => {
				setHighlightShortlisted(false);
				sessionStorage.removeItem('highlightShortlisted');
			}, 5000);
		}
		
		// Check if we should highlight company and position columns
		const shouldHighlightCP = sessionStorage.getItem('highlightCompanyPosition');
		if (shouldHighlightCP === 'true') {
			setHighlightCompanyPosition(true);
			// Clear the flag after 5 seconds
			setTimeout(() => {
				setHighlightCompanyPosition(false);
				sessionStorage.removeItem('highlightCompanyPosition');
			}, 5000);
		}
		
		// Set up polling to refresh data every 30 seconds
		const interval = setInterval(() => {
			fetchApplications();
		}, 30000);
		
		return () => clearInterval(interval);
	}, []);

	const fetchApplications = async () => {
		setLoading(true);
		try {
			console.log('Fetching applications with company and position data...');
			const response = await api.getCandidateApplicationsWithInterviews();
			if (response.success) {
				const apps = response.applications || response.data || [];
				console.log('Fetched applications:', apps.length);
				
				// Log company and position data for debugging
				apps.forEach((app, index) => {
					console.log(`Application ${index + 1}:`, {
						company: app.employerId?.companyName,
						position: app.jobId?.title,
						status: app.status,
						appliedDate: app.createdAt
					});
				});
				
				setApplications(apps);
			} else {
				console.error('API response not successful:', response);
			}
		} catch (error) {
			console.error('Error fetching applications:', error);
			// Fallback to regular applications if new endpoint fails
			try {
				console.log('Trying fallback API...');
				const fallbackResponse = await api.getCandidateApplications();
				if (fallbackResponse.success) {
					const apps = fallbackResponse.applications || fallbackResponse.data || [];
					console.log('Fallback applications fetched:', apps.length);
					setApplications(apps);
				}
			} catch (fallbackError) {
				console.error('Fallback fetch also failed:', fallbackError);
			}
		} finally {
			setLoading(false);
		}
	};

	const getInterviewRounds = (job) => {
		// For testing - show default rounds if no specific types
		if (job?.interviewRoundTypes) {
			const rounds = [];
			const roundTypes = job.interviewRoundTypes;
			
			if (roundTypes.technical) rounds.push('Technical');
			if (roundTypes.hr) rounds.push('HR');
			if (roundTypes.managerial) rounds.push('Managerial');
			if (roundTypes.nonTechnical) rounds.push('Non-Technical');
			if (roundTypes.final) rounds.push('Final');
			
			if (rounds.length > 0) return rounds;
		}
		
		// Default rounds for testing
		return ['Technical', 'HR', 'Final'];
	};

	const getRoundStatus = (application, roundIndex) => {
		// Check if there are actual interview rounds data from employer review
		if (application.interviewRounds && application.interviewRounds.length > 0) {
			const round = application.interviewRounds.find(r => r.round === roundIndex + 1);
			if (round) {
				switch (round.status) {
					case 'passed':
						return { 
							text: 'Passed', 
							class: 'bg-success text-white',
							feedback: round.feedback || ''
						};
					case 'failed':
						return { 
							text: 'Failed', 
							class: 'bg-danger text-white',
							feedback: round.feedback || ''
						};
					case 'pending':
					default:
						return { 
							text: 'Pending', 
							class: 'bg-warning text-dark',
							feedback: round.feedback || ''
						};
				}
			}
		}
		
		// Fallback to application status logic
		const status = application.status;
		if (status === 'shortlisted' && roundIndex === 0) {
			return { text: 'Shortlisted', class: 'bg-success text-white', feedback: '' };
		} else if (status === 'interviewed') {
			if (roundIndex === 0) return { text: 'Completed', class: 'bg-success text-white', feedback: '' };
			if (roundIndex === 1) return { text: 'In Progress', class: 'bg-warning text-dark', feedback: '' };
		} else if (status === 'hired') {
			return { text: 'Completed', class: 'bg-success text-white', feedback: '' };
		} else if (status === 'rejected') {
			return { text: 'Rejected', class: 'bg-danger text-white', feedback: '' };
		}
		
		return { text: 'Not Started', class: 'bg-secondary text-white', feedback: '' };
	};

	const handleViewRoundDetails = (roundType, roundDetails) => {
		setSelectedRoundType(roundType);
		setSelectedRoundDetails(roundDetails);
		setShowRoundDetails(true);
	};

	return (
		<>
			{/* Enhanced Header */}
			<div className="panel panel-default mb-4 status-header">
				<div className="panel-heading wt-panel-heading p-a20">
					<h3 className="panel-tittle m-a0 text-center" style={{color: '#232323'}}>
						<i className="fa fa-clipboard-list me-2" style={{color: '#ff6b35'}}></i>
						Application Status
					</h3>
					<p className="text-center text-muted mb-0">Track your job applications and interview progress</p>
				</div>
			</div>



			{/* Highlight notification */}
			{highlightShortlisted && (
				<div className="alert alert-success alert-dismissible fade show mb-3" role="alert">
					<i className="fa fa-star me-2"></i>
					<strong>Shortlisted Applications Highlighted!</strong> Your shortlisted applications are highlighted below.
				</div>
			)}
			
			{highlightCompanyPosition && (
				<div className="alert alert-info alert-dismissible fade show mb-3" role="alert">
					<i className="fa fa-building me-2"></i>
					<strong>Company & Position Columns Highlighted!</strong> View your applied companies and positions below.
				</div>
			)}

			{/* Refresh Controls */}
			<div className="d-flex justify-content-between align-items-center mb-3">
				<div className="d-flex align-items-center">
					<i className="fa fa-clock-o me-2" style={{color: '#ff6b35'}}></i>
					<small className="text-muted">Updates automatically every 30 seconds</small>
				</div>
				<button 
					className="btn btn-sm btn-outline-primary refresh-btn"
					onClick={fetchApplications}
					disabled={loading}
				>
					<i className="fa fa-refresh me-1" />
					{loading ? 'Refreshing...' : 'Refresh Now'}
				</button>
			</div>
			
			<div className="twm-pro-view-chart-wrap">
				<div className="col-lg-12 col-md-12 mb-4">
					<div className="card card-shadow border-0">
						<div className="card-body p-0">
							<div className="table-responsive">
								<table className="table table-hover mb-0">
									<thead style={{backgroundColor: '#f8f9fa'}}>
										<tr>
											<th className="border-0 px-4 py-3 fw-semibold" style={{color: '#232323'}}>
												<i className="fa fa-calendar me-2" style={{color: '#ff6b35'}}></i>
												Applied Date
											</th>
											<th className={`border-0 px-4 py-3 fw-semibold ${highlightCompanyPosition ? 'highlight-company-position' : ''}`} style={{color: '#232323', transition: 'all 0.3s ease'}}>
												<i className="fa fa-building me-2" style={{color: '#ff6b35'}}></i>
												Company
											</th>
											<th className={`border-0 px-4 py-3 fw-semibold ${highlightCompanyPosition ? 'highlight-company-position' : ''}`} style={{color: '#232323', transition: 'all 0.3s ease'}}>
												<i className="fa fa-briefcase me-2" style={{color: '#ff6b35'}}></i>
												Position
											</th>
											<th className="border-0 px-4 py-3 fw-semibold" style={{color: '#232323'}}>
												<i className="fa fa-tasks me-2" style={{color: '#ff6b35'}}></i>
												Interview Progress
											</th>
											<th className="border-0 px-4 py-3 fw-semibold" style={{color: '#232323'}}>
												<i className="fa fa-flag me-2" style={{color: '#ff6b35'}}></i>
												Status
											</th>
											<th className="border-0 px-4 py-3 fw-semibold" style={{color: '#232323'}}>
												<i className="fa fa-eye me-2" style={{color: '#ff6b35'}}></i>
												View Details
											</th>
										</tr>
									</thead>

									<tbody>
										{loading ? (
											<tr>
												<td colSpan="6" className="text-center py-5">
													<div className="d-flex flex-column align-items-center">
														<i className="fa fa-spinner fa-spin fa-3x mb-3" style={{color: '#ff6b35'}}></i>
														<p className="text-muted mb-0">Loading your applications...</p>
													</div>
												</td>
											</tr>
										) : applications.length === 0 ? (
											<tr>
												<td colSpan="6" className="text-center py-5">
													<div className="d-flex flex-column align-items-center">
														<i className="fa fa-search fa-3x mb-3" style={{color: '#ff6b35'}}></i>
														<h5 style={{color: '#232323'}}>No Applications Yet</h5>
														<p className="text-muted mb-3">Start applying to jobs to see your application status here</p>
														<button className="btn btn-primary" onClick={() => window.location.href = '/jobs'}>
															<i className="fa fa-search me-2"></i>
															Browse Jobs
														</button>
													</div>
												</td>
											</tr>
										) : (
											applications.map((app, index) => {
												const interviewRounds = getInterviewRounds(app.jobId);
												const isShortlisted = app.status === 'shortlisted';
												const shouldHighlightRow = highlightShortlisted && isShortlisted;
												return (
													<tr 
														key={index} 
														className={`border-bottom ${shouldHighlightRow ? 'highlight-shortlisted' : ''}`}
														style={{
															backgroundColor: shouldHighlightRow ? '#e8f5e9' : 'transparent',
															transition: 'background-color 0.3s ease',
															border: shouldHighlightRow ? '2px solid #4caf50' : 'none'
														}}
													>
														<td className="px-4 py-3">
															<span className="text-dark fw-medium">
																{new Date(app.createdAt || app.appliedAt).toLocaleDateString('en-US', {
																	day: '2-digit',
																	month: 'short',
																	year: 'numeric'
																})}
															</span>
														</td>
														<td className={`px-4 py-3 ${highlightCompanyPosition ? 'highlight-company-position' : ''}`} style={{transition: 'all 0.3s ease'}}>
															<div className="d-flex align-items-center">
																<div className="me-3">
																	<div className="rounded-circle d-flex align-items-center justify-content-center" style={{width: '45px', height: '45px', backgroundColor: '#fff3e0', border: '2px solid #ff6b35'}}>
																		<i className="fa fa-building" style={{color: '#ff6b35', fontSize: '18px'}}></i>
																	</div>
																</div>
																<div>
																	<a href={`/emp-detail/${app.employerId?._id}`} className="text-decoration-none">
																		<h6 className="mb-1 fw-semibold text-dark hover-primary">
																			{app.employerId?.companyName || 'Company Name Not Available'}
																		</h6>
																	</a>
																	<small className="text-muted">
																		<i className="fas fa-map-marker-alt me-1"></i>
																		{app.jobId?.location || 'Location Not Available'}
																	</small>
																</div>
															</div>
														</td>
														<td className={`px-4 py-3 ${highlightCompanyPosition ? 'highlight-company-position' : ''}`} style={{transition: 'all 0.3s ease'}}>
															<span className="fw-medium text-dark">
																{app.jobId?.title || 'Position Not Available'}
															</span>
														</td>
														<td className="px-4 py-3">
															<div className="d-flex flex-wrap gap-2">
																{interviewRounds.length > 0 ? (
																	interviewRounds.map((round, roundIndex) => {
																		const roundStatus = getRoundStatus(app, roundIndex);
																		// Get interview details for this round
																		const roundTypeMap = {
																			'Technical': 'technical',
																			'HR': 'hr',
																			'Managerial': 'managerial',
																			'Non-Technical': 'nonTechnical',
																			'Final': 'final'
																		};
																		const roundKey = roundTypeMap[round];
																		const roundDetails = app.jobId?.interviewRoundDetails?.[roundKey];
																		return (
																			<div key={roundIndex} className="mb-2" style={{minWidth: '160px'}}>
																				<div className="card border-0 shadow-sm" style={{fontSize: '11px'}}>
																					<div className="card-body p-2">
																						<div className="text-muted fw-medium mb-1">{round}</div>
																						<span className={`badge ${roundStatus.class}`} style={{fontSize: '10px', padding: '4px 8px'}}>
																							{roundStatus?.text || 'Pending'}
																						</span>
																						{/* Show interview dates and time */}
																						{roundDetails && (
																							<div className="mt-1" style={{fontSize: '9px', lineHeight: '1.2'}}>
																								{roundDetails.fromDate && (
																									<div className="text-primary">
																										<i className="fa fa-calendar me-1"></i>
																										{new Date(roundDetails.fromDate).toLocaleDateString()}
																										{roundDetails.toDate && roundDetails.fromDate !== roundDetails.toDate && (
																											<span> - {new Date(roundDetails.toDate).toLocaleDateString()}</span>
																										)}
																									</div>
																								)}
																								{roundDetails.time && (
																									<div className="text-success">
																										<i className="fa fa-clock me-1"></i>
																										{roundDetails.time}
																									</div>
																								)}
																							</div>
																						)}
																						{roundStatus.feedback && (
																							<div className="text-muted mt-1" style={{fontSize: '9px', lineHeight: '1.2'}}>
																								{roundStatus.feedback}
																							</div>
																						)}
																					</div>
																				</div>
																			</div>
																		);
																	})
																) : (
																	<span className="text-muted fst-italic">No rounds specified</span>
																)}
															</div>
														</td>
														<td className="px-4 py-3">
															<span className={
																app.status === 'pending' ? 'badge bg-warning bg-opacity-10 text-warning border border-warning' :
																app.status === 'shortlisted' ? 'badge bg-info bg-opacity-10 text-info border border-info' :
																app.status === 'interviewed' ? 'badge bg-primary bg-opacity-10 text-primary border border-primary' :
																app.status === 'hired' ? 'badge bg-success bg-opacity-10 text-success border border-success' :
																app.status === 'rejected' ? 'badge bg-danger bg-opacity-10 text-danger border border-danger' : 'badge bg-secondary bg-opacity-10 text-secondary border border-secondary'
															} style={{fontSize: '12px', padding: '6px 12px'}}>
																{app.status?.charAt(0).toUpperCase() + app.status?.slice(1) || 'Pending'}
															</span>
														</td>
														<td className="px-4 py-3">
															<div className="d-flex flex-wrap gap-1">
																{interviewRounds.length > 0 ? (
																	interviewRounds.map((round, roundIndex) => {
																		const roundTypeMap = {
																			'Technical': 'technical',
																			'HR': 'hr',
																			'Managerial': 'managerial',
																			'Non-Technical': 'nonTechnical',
																			'Final': 'final'
																		};
																		const roundKey = roundTypeMap[round];
																		const roundDetails = app.jobId?.interviewRoundDetails?.[roundKey];
																		return (
																			<button
																				key={roundIndex}
																				className="btn btn-sm btn-outline-primary"
																				style={{fontSize: '10px', padding: '2px 6px', margin: '1px'}}
																				onClick={() => handleViewRoundDetails(roundKey, roundDetails)}
																				title={`View ${round} details`}
																			>
																				<i className="fa fa-eye me-1"></i>
																				{round}
																			</button>
																		);
																	})
																) : (
																	<span className="text-muted fst-italic" style={{fontSize: '11px'}}>No rounds</span>
																)}
															</div>
														</td>
													</tr>
												);
											})
										)}

									</tbody>
								</table>
							</div>
						</div>
					</div>
				</div>
			</div>
			
			{/* Interview Round Details Popup */}
			<PopupInterviewRoundDetails
				isOpen={showRoundDetails}
				onClose={() => setShowRoundDetails(false)}
				roundDetails={selectedRoundDetails}
				roundType={selectedRoundType}
			/>
		</>
	);
}

export default CanStatusPage;
