import { useEffect, useState } from "react";
import { MapPin } from 'lucide-react';
import { loadScript } from "../../../../globals/constants";
import SectionCandidateOverview from "../sections/dashboard/section-can-overview";
import CompleteProfileCard from "../sections/dashboard/section-can-profile";
import SectionNotifications from "../sections/dashboard/section-notifications";
import SectionRecommendedJobs from "../sections/dashboard/section-recommended-jobs";
import './can-dashboard.css';

function CanDashboardPage() {
  const [candidate, setCandidate] = useState({ name: 'Loading...', location: 'Bangalore', profilePicture: null });

  useEffect(() => {
    loadScript("js/custom.js");
    fetchCandidateData();
  }, []);

  const fetchCandidateData = async () => {
    try {
      const token = localStorage.getItem('candidateToken');
      if (!token) return;

      const response = await fetch('http://localhost:5000/api/candidate/profile', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setCandidate({
            name: data.profile.candidateId?.name || data.profile.name || 'Candidate',
            location: data.profile.location || 'Bangalore',
            profilePicture: data.profile.profilePicture
          });
        }
      }
    } catch (error) {
      
    }
  };

  return (
    <>
      <div className="twm-right-section-panel site-bg-gray can-dashboard">
        {/* Welcome Card */}
        <div style={{ padding: '2rem 2rem 0 2rem' }}>
          <div className="admin-dashboard-header" data-aos="fade-up">
            <h2>
              <i className="fa fa-tachometer-alt me-3"></i>
              Welcome, {candidate.name}
            </h2>
            <p className="dashboard-subtitle mb-0">
              <i className="fa fa-chart-line me-2"></i>
              Track your job search progress and applications
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={{ padding: '0 2rem 2rem 2rem' }}>
          <SectionCandidateOverview />

          {/* Profile Completion and Notifications */}
          <div className="row">
            <div className="col-xl-7 col-lg-7 col-md-12 mb-4">
              <CompleteProfileCard />
            </div>
            <div className="col-xl-5 col-lg-5 col-md-12 mb-4">
              <SectionNotifications />
            </div>
          </div>

          {/* Recommended Jobs */}
          <div className="row">
            <div className="col-12 mb-4">
              <SectionRecommendedJobs />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default CanDashboardPage;
