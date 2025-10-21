import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Button, Modal, Form, Alert, Spinner } from 'react-bootstrap';

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
            <div className="text-center py-5">
                <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <Container fluid className="py-4">
            <Row className="mb-4">
                <Col>
                    <h2>Support Tickets Management</h2>
                </Col>
            </Row>

            {/* Stats Cards */}
            <Row className="mb-4">
                <Col md={2}>
                    <Card className="text-center">
                        <Card.Body>
                            <h4 className="text-primary">{stats.total}</h4>
                            <small>Total Tickets</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="text-center">
                        <Card.Body>
                            <h4 className="text-danger">{stats.unread}</h4>
                            <small>Unread</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="text-center">
                        <Card.Body>
                            <h4 className="text-success">{stats.new}</h4>
                            <small>New</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="text-center">
                        <Card.Body>
                            <h4 className="text-warning">{stats.inProgress}</h4>
                            <small>In Progress</small>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={2}>
                    <Card className="text-center">
                        <Card.Body>
                            <h4 className="text-info">{stats.resolved}</h4>
                            <small>Resolved</small>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            {/* Filters */}
            <Row className="mb-4">
                <Col md={3}>
                    <Form.Select 
                        value={filters.status} 
                        onChange={(e) => setFilters({...filters, status: e.target.value})}
                    >
                        <option value="">All Status</option>
                        <option value="new">New</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Select 
                        value={filters.userType} 
                        onChange={(e) => setFilters({...filters, userType: e.target.value})}
                    >
                        <option value="">All User Types</option>
                        <option value="employer">Employer</option>
                        <option value="candidate">Candidate</option>
                        <option value="guest">Guest</option>
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Form.Select 
                        value={filters.priority} 
                        onChange={(e) => setFilters({...filters, priority: e.target.value})}
                    >
                        <option value="">All Priorities</option>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                    </Form.Select>
                </Col>
                <Col md={3}>
                    <Button variant="outline-secondary" onClick={() => setFilters({status: '', userType: '', priority: ''})}>
                        Clear Filters
                    </Button>
                </Col>
            </Row>

            {/* Tickets List */}
            <Row>
                <Col>
                    <Card>
                        <Card.Header>
                            <h5>Support Tickets ({tickets.length})</h5>
                        </Card.Header>
                        <Card.Body className="p-0">
                            {tickets.length === 0 ? (
                                <div className="text-center py-4">
                                    <p>No support tickets found.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-hover mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Subject</th>
                                                <th>User</th>
                                                <th>Type</th>
                                                <th>Category</th>
                                                <th>Priority</th>
                                                <th>Status</th>
                                                <th>Created</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {tickets.map((ticket) => (
                                                <tr 
                                                    key={ticket._id} 
                                                    className={!ticket.isRead ? 'table-warning' : ''}
                                                    style={{ cursor: 'pointer' }}
                                                >
                                                    <td onClick={() => handleTicketClick(ticket)}>
                                                        <strong>{ticket.subject}</strong>
                                                        {!ticket.isRead && <Badge bg="danger" className="ms-2">New</Badge>}
                                                    </td>
                                                    <td onClick={() => handleTicketClick(ticket)}>
                                                        <div>
                                                            <strong>{ticket.name || 'N/A'}</strong><br/>
                                                            <small className="text-muted">{ticket.email || ticket.userEmail || ticket.contactEmail || 'No email provided'}</small>
                                                        </div>
                                                    </td>
                                                    <td onClick={() => handleTicketClick(ticket)}>
                                                        {getUserTypeBadge(ticket.userType)}
                                                    </td>
                                                    <td onClick={() => handleTicketClick(ticket)}>
                                                        <Badge bg="light" text="dark">{ticket.category}</Badge>
                                                    </td>
                                                    <td onClick={() => handleTicketClick(ticket)}>
                                                        {getPriorityBadge(ticket.priority)}
                                                    </td>
                                                    <td onClick={() => handleTicketClick(ticket)}>
                                                        {getStatusBadge(ticket.status)}
                                                    </td>
                                                    <td onClick={() => handleTicketClick(ticket)}>
                                                        <small>{new Date(ticket.createdAt).toLocaleDateString()}</small>
                                                    </td>
                                                    <td>
                                                        <Button 
                                                            size="sm" 
                                                            variant="outline-primary"
                                                            onClick={() => handleTicketClick(ticket)}
                                                        >
                                                            View
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

            {/* Ticket Detail Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Support Ticket Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedTicket && (
                        <>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Subject:</strong> {selectedTicket.subject}
                                </Col>
                                <Col md={6}>
                                    <strong>Priority:</strong> {getPriorityBadge(selectedTicket.priority)}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>User:</strong> {selectedTicket.name || 'N/A'} ({selectedTicket.email || selectedTicket.userEmail || selectedTicket.contactEmail || 'No email provided'})
                                </Col>
                                <Col md={6}>
                                    <strong>User Type:</strong> {getUserTypeBadge(selectedTicket.userType)}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col md={6}>
                                    <strong>Category:</strong> {selectedTicket.category}
                                </Col>
                                <Col md={6}>
                                    <strong>Phone:</strong> {selectedTicket.phone || 'N/A'}
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <strong>Message:</strong>
                                    <div className="border p-3 mt-2 bg-light">
                                        {selectedTicket.message}
                                    </div>
                                </Col>
                            </Row>
                            {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                                <Row className="mb-3">
                                    <Col>
                                        <strong>Attachments:</strong>
                                        <ul className="mt-2">
                                            {selectedTicket.attachments.map((attachment, index) => (
                                                <li key={index}>
                                                    <a 
                                                        href={`http://localhost:5000/api/admin/support-tickets/${selectedTicket._id}/attachments/${index}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                    >
                                                        {attachment.originalName}
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
                                        <Form.Label><strong>Status:</strong></Form.Label>
                                        <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                                            <option value="new">New</option>
                                            <option value="in-progress">In Progress</option>
                                            <option value="resolved">Resolved</option>
                                            <option value="closed">Closed</option>
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                            </Row>
                            <Row className="mb-3">
                                <Col>
                                    <Form.Group>
                                        <Form.Label><strong>Admin Response:</strong></Form.Label>
                                        <Form.Control
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
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        Close
                    </Button>
                    <Button variant="primary" onClick={handleUpdateTicket}>
                        Update Ticket
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
}

export default AdminSupportTickets;