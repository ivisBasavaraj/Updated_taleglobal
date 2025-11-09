import React, { useState, useEffect } from "react";
import AssessmentCard from "../assessments/AssessmnetCard";
import CreateAssessmentModal from "../assessments/CreateassessmentModal";
import axios from "axios";

export default function AssessmentDashboard() {
	const [assessments, setAssessments] = useState([]);
	const [showModal, setShowModal] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchAssessments();
	}, []);

	const fetchAssessments = async () => {
		try {
			const token = localStorage.getItem('employerToken');
			const response = await axios.get('http://localhost:5000/api/employer/assessments', {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (response.data.success) {
				setAssessments(response.data.assessments);
			}
		} catch (error) {
			console.error('Error fetching assessments:', error);
		} finally {
			setLoading(false);
		}
	};

	const handleCreateAssessment = async (newAssessment) => {
		try {
			const token = localStorage.getItem('employerToken');
			const response = await axios.post('http://localhost:5000/api/employer/assessments', newAssessment, {
				headers: { Authorization: `Bearer ${token}` }
			});
			if (response.data.success) {
				setAssessments((prev) => [response.data.assessment, ...prev]);
				setShowModal(false);
				alert('Assessment created successfully!');
			}
		} catch (error) {
			console.error('Error creating assessment:', error);
			alert('Failed to create assessment');
		}
	};

	const handleDeleteAssessment = async (id) => {
		if (!window.confirm('Are you sure you want to delete this assessment?')) return;
		try {
			const token = localStorage.getItem('employerToken');
			await axios.delete(`http://localhost:5000/api/employer/assessments/${id}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			setAssessments(prev => prev.filter(a => a._id !== id));
			alert('Assessment deleted successfully');
		} catch (error) {
			console.error('Error deleting assessment:', error);
			alert('Failed to delete assessment');
		}
	};

	if (loading) {
		return <div className="container mt-4"><p>Loading...</p></div>;
	}

	return (
		<div className="container mt-4">
			<div className="d-flex justify-content-between align-items-center mb-3 p-3 border rounded bg-light shadow-sm">
				<div>
					<h4 className="mb-1">Assessments</h4>
					<small className="text-muted">
						Manage and create your assessments ({assessments.length})
					</small>
				</div>
				<button className="btn btn-dark" onClick={() => setShowModal(true)}>
					<i className="fa fa-plus me-2"></i>Create Assessment
				</button>
			</div>

			{assessments.length === 0 ? (
				<div className="text-center mt-5">
					<i className="fa fa-clipboard-list" style={{fontSize: '64px', color: '#ccc'}}></i>
					<p className="mt-3 text-muted">No assessments yet. Create one to get started.</p>
				</div>
			) : (
				<div className="row mt-4">
					{assessments.map((assessment) => (
						<div key={assessment._id} className="col-md-6 col-lg-4 mb-3">
							<AssessmentCard data={assessment} onDelete={handleDeleteAssessment} />
						</div>
					))}
				</div>
			)}

			{showModal && (
				<CreateAssessmentModal
					onClose={() => setShowModal(false)}
					onCreate={handleCreateAssessment}
				/>
			)}
		</div>
	);
}
