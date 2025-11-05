import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { api } from '../../../../utils/api';

function AdminEmployersApproved() {
    const navigate = useNavigate();
    const [employers, setEmployers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchApprovedEmployers();
    }, []);

    const fetchApprovedEmployers = async () => {
        try {
            setLoading(true);
            const response = await api.getAllEmployers();
            if (response.success) {
                const approvedEmployers = response.data.filter(emp => 
                    emp.status === 'approved' || emp.isApproved === true
                );
                setEmployers(approvedEmployers);
            } else {
                setError(response.message || 'Failed to fetch approved employers');
            }
        } catch (error) {
            setError('Error fetching approved employers');
            
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString();
    };

    if (loading) {
        return (
            <div className="wt-admin-right-page-header clearfix">
                <h2>Approved Employers</h2>
                <div className="panel panel-default site-bg-white">
                    <div className="panel-body wt-panel-body p-a20">
                        <div className="text-center">Loading approved employers...</div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="wt-admin-right-page-header clearfix">
                <h2>Approved Employers</h2>
            </div>

            <div className="panel panel-default site-bg-white">
                <div className="panel-heading wt-panel-heading p-a20">
                    <h4 className="panel-tittle m-a0">Approved Employers ({employers.length})</h4>
                </div>

                <div className="panel-body wt-panel-body">
                    {error && (
                        <div className="alert alert-danger m-b20">{error}</div>
                    )}
                    <div className="p-a20 table-responsive table-container">
                        <table className="table twm-table table-striped table-borderless" style={{tableLayout: 'fixed', width: '100%'}}>
                            <thead>
                                <tr>
                                    <th style={{width: '25%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Company Name</th>
                                    <th style={{width: '12%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Type</th>
                                    <th style={{width: '25%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Email</th>
                                    <th style={{width: '15%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Phone</th>
                                    <th style={{width: '13%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Approved Date</th>
                                    <th style={{width: '10%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}}>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {employers.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="text-center">No approved employers found</td>
                                    </tr>
                                ) : (
                                    employers.map((employer) => (
                                        <tr key={employer._id}>
                                            <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={employer.companyName || employer.email}>
                                                <span className="site-text-primary">
                                                    {employer.companyName || employer.email}
                                                </span>
                                            </td>
                                            <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={employer.employerType === 'consultant' ? 'Consultant' : 'Company'}>{employer.employerType === 'consultant' ? 'Consultant' : 'Company'}</td>
                                            <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={employer.email}>{employer.email}</td>
                                            <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={employer.phone || 'N/A'}>{employer.phone || 'N/A'}</td>
                                            <td style={{overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'}} title={formatDate(employer.updatedAt || employer.createdAt)}>{formatDate(employer.updatedAt || employer.createdAt)}</td>
                                            <td>
                                                <button
                                                    style={{
                                                        backgroundColor: "#fd7e14",
                                                        color: "#fff",
                                                        border: "none",
                                                        padding: "5px 10px",
                                                        borderRadius: "4px",
                                                        cursor: "pointer",
                                                    }}
                                                    className="ms-3"
                                                    onClick={() => navigate(`/admin/employer-details/${employer._id}`)}
                                                >
                                                    View Details
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AdminEmployersApproved;
