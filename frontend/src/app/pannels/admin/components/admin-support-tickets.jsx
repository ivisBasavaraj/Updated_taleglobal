import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';
import './admin-support-tickets.css';

function AdminSupportTickets() {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [response, setResponse] = useState('');
    const [status, setStatus] = useState('');
    const [filters, setFilters] = useState({
        status: '',
        userType: '',
        priority: ''
    });
    const [stats, setStats] = useState({
        total: 0,
        unread: 0,
        new: 0,
        inProgress: 0,
        resolved: 0
    });

    useEffect(() => {
        fetchSupportTickets();
    }, [filters]);

    const fetchSupportTickets = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('adminToken');
            const queryParams = new URLSearchParams(filters).toString();
            
            const response = await fetch(`http://localhost:5000/api/admin/support-tickets?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setTickets(data.tickets || []);
                
                // Calculate stats
                const newStats = {
                    total: data.totalTickets || 0,
                    unread: data.unreadCount || 0,
                    new: data.tickets?.filter(t => t.status === 'new').length || 0,
                    inProgress: data.tickets?.filter(t => t.status === 'in-progress').length || 0,
                    resolved: data.tickets?.filter(t => t.status === 'resolved').length || 0
                };
                setStats(newStats);
            }
        } catch (error) {
            console.error('Error fetching support tickets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleTicketClick = async (ticket) => {
        setSelectedTicket(ticket);
        setResponse(ticket.response || '');
        setStatus(ticket.status);
        setShowModal(true);

        // Mark as read if not already read
        if (!ticket.isRead) {
            try {
                const token = localStorage.getItem('adminToken');
                await fetch(`http://localhost:5000/api/admin/support-tickets/${ticket._id}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
                fetchSupportTickets(); // Refresh to update read status
            } catch (error) {
                console.error('Error marking ticket as read:', error);
            }
        }
    };

    const handleUpdateTicket = async () => {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(`http://localhost:5000/api/admin/support-tickets/${selectedTicket._id}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status, response })
            });

            if (response.ok) {
                setShowModal(false);
                fetchSupportTickets();
                alert('Support ticket updated successfully');
            } else {
                alert('Failed to update support ticket');
            }
        } catch (error) {
            console.error('Error updating support ticket:', error);
            alert('Error updating support ticket');
        }
    };

    const getPriorityBadge = (priority) => {
        const variants = {
            low: 'secondary',
            medium: 'primary',
            high: 'warning',
            urgent: 'danger'
        };
        return <Badge bg={variants[priority] || 'secondary'}>{priority?.toUpperCase()}</Badge>;
    };

    const getStatusBadge = (status) => {
        const variants = {
            new: 'success',
            'in-progress': 'warning',
            resolved: 'info',
            closed: 'secondary'
        };
        return <Badge bg={variants[status] || 'secondary'}>{status?.replace('-', ' ').toUpperCase()}</Badge>;
    };

    const getUserTypeBadge = (userType) => {
        const variants = {
            employer: 'primary',
            candidate: 'success',
            guest: 'secondary'
        };
        return <Badge bg={variants[userType] || 'secondary'}>{userType?.toUpperCase()}</Badge>;
    };

    if (loading) {
        return (
            <div className="loading-spinner">
                <Spinner animation="border" role="status" variant="primary">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <div className="support-tickets-container admin-container">
            <Container fluid>
                <div className="support-header">
                    <h2>🎫 Support Tickets Management</h2>
                    <p>Manage and respond to customer support requests</p>
                </div>

                {/* Stats Cards */}
                <div className="row mb-4">
                    <div className="col-xl-2 col-lg-4 col-md-6 mb-3">
                        <div className="panel panel-default dashboard-stats-card">
                            <div className="panel-body wt-panel-body gradi-1">
                                <div className="wt-card-wrap">
                                    <div className="wt-card-icon">
                                        <i className="fa fa-ticket-alt" />
                                    </div>
                                    <div className="wt-card-right counter">
                                        {stats.total}
                                    </div>
                                    <div className="wt-card-bottom">
                                        <h4 className="m-b0">Total</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-4 col-md-6 mb-3">
                        <div className="panel panel-default dashboard-stats-card">
                            <div className="panel-body wt-panel-body gradi-2">
                                <div className="wt-card-wrap">
                                    <div className="wt-card-icon">
                                        <i className="fa fa-envelope" />
                                    </div>
                                    <div className="wt-card-right counter">
                                        {stats.unread}
                                    </div>
                                    <div className="wt-card-bottom">
                                        <h4 className="m-b0">Unread</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-4 col-md-6 mb-3">
                        <div className="panel panel-default dashboard-stats-card">
                            <div className="panel-body wt-panel-body gradi-3">
                                <div className="wt-card-wrap">
                                    <div className="wt-card-icon">
                                        <i className="fa fa-plus-circle" />
                                    </div>
                                    <div className="wt-card-right counter">
                                        {stats.new}
                                    </div>
                                    <div className="wt-card-bottom">
                                        <h4 className="m-b0">New</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-4 col-md-6 mb-3">
                        <div className="panel panel-default dashboard-stats-card">
                            <div className="panel-body wt-panel-body gradi-4">
                                <div className="wt-card-wrap">
                                    <div className="wt-card-icon">
                                        <i className="fa fa-clock" />
                                    </div>
                                    <div className="wt-card-right counter">
                                        {stats.inProgress}
                                    </div>
                                    <div className="wt-card-bottom">
                                        <h4 className="m-b0">Progress</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-xl-2 col-lg-4 col-md-6 mb-3">
                        <div className="panel panel-default dashboard-stats-card">
                            <div className="panel-body wt-panel-body gradi-1">
                                <div className="wt-card-wrap">
                                    <div className="wt-card-icon">
                                        <i className="fa fa-check-circle" />
                                    </div>
                                    <div className="wt-card-right counter">
                                        {stats.resolved}
                                    </div>
                                    <div className="wt-card-bottom">
                                        <h4 className="m-b0">Resolved</h4>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-section">
                    <Row>
                        <Col md={3} className="mb-3">
                            <Form.Select 
                                className="filter-select"
                                value={filters.status} 
                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                            >
                                <option value="">📋 All Status</option>
                                <option value="new">🆕 New</option>
                                <option value="in-progress">⏳ In Progress</option>
                                <option value="resolved">✅ Resolved</option>
                                <option value="closed">🔒 Closed</option>
                            </Form.Select>
                        </Col>
                        <Col md={3} className="mb-3">
                            <Form.Select 
                                className="filter-select"
                                value={filters.userType} 
                                onChange={(e) => setFilters({...filters, userType: e.target.value})}
                            >
                                <option value="">👥 All User Types</option>
                                <option value="employer">🏢 Employer</option>
                                <option value="candidate">👤 Candidate</option>
                                <option value="guest">🌐 Guest</option>
                            </Form.Select>
                        </Col>
                        <Col md={3} className="mb-3">
                            <Form.Select 
                                className="filter-select"
                                value={filters.priority} 
                                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                            >
                                <option value="">⚡ All Priorities</option>
                                <option value="low">🟢 Low</option>
                                <option value="medium">🟡 Medium</option>
                                <option value="high">🟠 High</option>
                                <option value="urgent">🔴 Urgent</option>
                            </Form.Select>
                        </Col>
                        <Col md={3} className="mb-3">
                            <Button 
                                className="clear-filters-btn w-100" 
                                onClick={() => setFilters({status: '', userType: '', priority: ''})}
                            >
                                🗑️ Clear Filters
                            </Button>
                        </Col>
                    </Row>
                </div>

                {/* Tickets List */}
                <Row>
                    <Col>
                        <Card className="tickets-card">
                            <div className="tickets-header">
                                <h5>📋 Support Tickets ({tickets.length})</h5>
                            </div>
                            <Card.Body className="p-0">
                                {tickets.length === 0 ? (
                                    <div className="empty-state">
                                        <i>📭</i>
                                        <p>No support tickets found.</p>
                                    </div>
                                ) : (
                                    <div className="table-container">
                                        <table className="table tickets-table">
                                            <thead>
                                                <tr>
                                                    <th>📝 Subject</th>
                                                    <th>👤 User</th>
                                                    <th>🏷️ Type</th>
                                                    <th>📂 Category</th>
                                                    <th>⚡ Priority</th>
                                                    <th>📊 Status</th>
                                                    <th>📅 Created</th>
                                                    <th>⚙️ Action</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tickets.map((ticket) => (
                                                    <tr 
                                                        key={ticket._id} 
                                                        className={!ticket.isRead ? 'unread-ticket' : ''}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <td onClick={() => handleTicketClick(ticket)}>
                                                            <div className="ticket-subject">{ticket.subject}</div>
                                                            {!ticket.isRead && <span className="new-badge">New</span>}
                                                        </td>
                                                        <td onClick={() => handleTicketClick(ticket)}>
                                                            <div className="user-info">
                                                                <div className="user-name">{ticket.actualUserName || ticket.name || 'N/A'}</div>
                                                                <div className="user-email">{ticket.actualUserEmail || ticket.email || 'No email provided'}</div>
                                                            </div>
                                                        </td>
                                                        <td onClick={() => handleTicketClick(ticket)}>
                                                            {getUserTypeBadge(ticket.userType)}
                                                        </td>
                                                        <td onClick={() => handleTicketClick(ticket)}>
                                                            <span className="category-badge">{ticket.category}</span>
                                                        </td>
                                                        <td onClick={() => handleTicketClick(ticket)}>
                                                            {getPriorityBadge(ticket.priority)}
                                                        </td>
                                                        <td onClick={() => handleTicketClick(ticket)}>
                                                            {getStatusBadge(ticket.status)}
                                                        </td>
                                                        <td onClick={() => handleTicketClick(ticket)}>
                                                            <div className="ticket-date">{new Date(ticket.createdAt).toLocaleDateString()}</div>
                                                        </td>
                                                        <td>
                                                            <Button 
                                                                className="view-btn"
                                                                size="sm" 
                                                                onClick={() => handleTicketClick(ticket)}
                                                            >
                                                                👁️ View
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>

            {/* Ticket Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>🎫 Support Ticket Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTicket && (
                        <>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <div className="detail-label">📝 Subject:</div>
                                    <div>{selectedTicket.subject}</div>
                                </Col>
                                <Col md={6}>
                                    <div className="detail-label">⚡ Priority:</div>
                                    <div>{getPriorityBadge(selectedTicket.priority)}</div>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <div className="detail-label">👤 User:</div>
                                    <div>{selectedTicket.actualUserName || selectedTicket.name || 'N/A'}</div>
                                    <small className="text-muted">({selectedTicket.actualUserEmail || selectedTicket.email || 'No email provided'})</small>
                                </Col>
                                <Col md={6}>
                                    <div className="detail-label">🏷️ User Type:</div>
                                    <div>{getUserTypeBadge(selectedTicket.userType)}</div>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <div className="detail-label">📂 Category:</div>
                                    <div>{selectedTicket.category}</div>
                                </Col>
                                <Col md={6}>
                                    <div className="detail-label">📞 Phone:</div>
                                    <div>{selectedTicket.phone || 'N/A'}</div>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <div className="detail-label">💬 Message:</div>
                                    <div className="message-box">
                                        {selectedTicket.message}
                                    </div>
                                </Col>
                            </Row>
                            {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                                <Row className="mb-3">
                                    <Col>
                                        <div className="detail-label">📎 Attachments:</div>
                                        <ul className="attachment-list">
                                            {selectedTicket.attachments.map((attachment, index) => (
                                                <li key={index} className="attachment-item">
                                                    <a 
                                                        className="attachment-link"
                                                        href={`http://localhost:5000/api/admin/support-tickets/${selectedTicket._id}/attachments/${index}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        📄 {attachment.originalName}
                                                    </a>
                                                </li>
                                            ))}
                                        </ul>
                                    </Col>
                                </Row>
                            )}
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label className="detail-label">📊 Status:</Form.Label>
                                        <Form.Select className="filter-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                                            <option value="new">🆕 New</option>
                                            <option value="in-progress">⏳ In Progress</option>
                                            <option value="resolved">✅ Resolved</option>
                                            <option value="closed">🔒 Closed</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <Form.Group>
                                        <Form.Label className="detail-label">💭 Admin Response:</Form.Label>
                                        <Form.Control
                                            className="response-textarea"
                                            as="textarea"
                                            rows={4}
                                            value={response}
                                            onChange={(e) => setResponse(e.target.value)}
                                            placeholder="Enter your response to the user..."
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button className="close-btn" onClick={() => setShowModal(false)}>
                        ❌ Close
                    </Button>
                    <Button className="update-btn" onClick={handleUpdateTicket}>
                        ✅ Update Ticket
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default AdminSupportTickets;