
import { Route, Routes } from "react-router-dom";
import { admin } from "../globals/route-names";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminDashboardPage from "../app/pannels/admin/components/admin-dashboard";
import AdminCandidates from "../app/pannels/admin/components/admin-candidates";
import AdminCandidateAddEdit from "../app/pannels/admin/components/admin-candidate-add";
import AdminEmployerJobs from "../app/pannels/admin/components/admin-emp-jobs";
import AdminJobs from "../app/pannels/admin/components/admin-jobs";
import AdminCreditsPage from "../app/pannels/admin/components/admin-can-credit";
import AdminBulkUploadPage from "../app/pannels/admin/components/admin-credit-bulkupload";
import AdminEmployersAllRequest from "../app/pannels/admin/components/admin-emp-manage";
import AdminEmployersApproved from "../app/pannels/admin/components/admin-emp-approve";
import AdminEmployersRejected from "../app/pannels/admin/components/admin-emp-reject";
import EmployerDetails from "../app/pannels/admin/components/adminEmployerDetails";
import AdminPlacementOfficersAllRequest from "../app/pannels/admin/components/admin-placement-manage";
import AdminPlacementOfficersApproved from "../app/pannels/admin/components/admin-placement-approve";
import AdminPlacementOfficersRejected from "../app/pannels/admin/components/admin-placement-reject";
import PlacementDetails from "../app/pannels/admin/components/placement-details";
import AdminSubAdmin from "../app/pannels/admin/components/admin-sub-admin";
import AdminSupportTickets from "../app/pannels/admin/components/admin-support-tickets";

import RegisteredCandidatesPage from "../app/pannels/admin/components/registered-candidates";
import AdminCandidateReviewPage from "../app/pannels/admin/components/admin-candidate-review";

function AdminRoutes() {
    return (
			<Routes>
				<Route path={admin.DASHBOARD} element={<ProtectedRoute><AdminDashboardPage /></ProtectedRoute>} />
				<Route path={admin.CAN_MANAGE} element={<ProtectedRoute><AdminEmployersAllRequest /></ProtectedRoute>} />
				<Route path={admin.CAN_APPROVE} element={<ProtectedRoute><AdminEmployersApproved /></ProtectedRoute>} />
				<Route path={admin.CAN_REJECT} element={<ProtectedRoute><AdminEmployersRejected /></ProtectedRoute>} />
				<Route path={admin.CANDIDATES} element={<ProtectedRoute><AdminCandidates /></ProtectedRoute>} />
				<Route
					path={admin.CANDIDATE_ADD_EDIT}
					element={<ProtectedRoute><AdminCandidateAddEdit /></ProtectedRoute>}
				/>
				<Route path={admin.EMPLOYER_JOBS} element={<ProtectedRoute><AdminEmployerJobs /></ProtectedRoute>} />
				<Route path={admin.JOBS} element={<ProtectedRoute><AdminJobs /></ProtectedRoute>} />
				<Route path={admin.CREDITS} element={<ProtectedRoute><AdminCreditsPage /></ProtectedRoute>} />
				<Route path={admin.BULK_UPLOAD} element={<ProtectedRoute><AdminBulkUploadPage /></ProtectedRoute>} />
				<Route
					path={admin.EMPLOYER_DETAILS}
					element={<ProtectedRoute><EmployerDetails /></ProtectedRoute>}
				/>

				<Route path={admin.REGISTERED_CANDIDATES} element={<ProtectedRoute><RegisteredCandidatesPage /></ProtectedRoute>} />
				<Route path={admin.CANDIDATE_REVIEW} element={<ProtectedRoute><AdminCandidateReviewPage /></ProtectedRoute>} />
				<Route path={admin.PLACEMENT_MANAGE} element={<ProtectedRoute><AdminPlacementOfficersAllRequest /></ProtectedRoute>} />
				<Route path={admin.PLACEMENT_APPROVE} element={<ProtectedRoute><AdminPlacementOfficersApproved /></ProtectedRoute>} />
				<Route path={admin.PLACEMENT_REJECT} element={<ProtectedRoute><AdminPlacementOfficersRejected /></ProtectedRoute>} />
				<Route path={admin.PLACEMENT_DETAILS} element={<ProtectedRoute><PlacementDetails /></ProtectedRoute>} />
				<Route path={admin.SUPPORT_TICKETS} element={<ProtectedRoute><AdminSupportTickets /></ProtectedRoute>} />
				<Route path={admin.SUB_ADMIN} element={<ProtectedRoute allowedRoles={['admin']}><AdminSubAdmin /></ProtectedRoute>} />
			</Routes>
		);
}

export default AdminRoutes;
