import { useState, useEffect } from 'react';

function CanSupport() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        userType: 'candidate',
        userId: '',
        subject: '',
        category: 'general',
        priority: 'medium',
        message: ''
    });
    const [files, setFiles] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    useEffect(() => {
        const candidateData = localStorage.getItem('candidateData');
        if (candidateData) {
            const candidate = JSON.parse(candidateData);
            setFormData(prev => ({
                ...prev,
                name: candidate.name || '',
                email: candidate.email || '',
                phone: candidate.phone || '',
                userId: candidate.id || ''
            }));
        }
    }, []);

    const categories = [
        { value: 'general', label: 'General Inquiry' },
        { value: 'technical', label: 'Technical Issue' },
        { value: 'account', label: 'Account Management' },
        { value: 'application', label: 'Job Application' }
    ];

    const priorities = [
        { value: 'low', label: 'Low' },
        { value: 'medium', label: 'Medium' },
        { value: 'high', label: 'High' },
        { value: 'urgent', label: 'Urgent' }
    ];

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Valid email is required';
        if (!formData.subject.trim()) newErrors.subject = 'Subject is required';
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        if (selectedFiles.length > 3) {
            setErrors(prev => ({ ...prev, files: 'Maximum 3 files allowed' }));
            return;
        }
        setFiles(selectedFiles);
        if (errors.files) {
            setErrors(prev => ({ ...prev, files: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) return;
        
        setIsSubmitting(true);
        try {
            const submitData = new FormData();
            
            // Ensure all required fields are present
            const requiredData = {
                name: formData.name.trim() || 'Candidate User',
                email: formData.email.trim() || 'candidate@jobportal.com',
                phone: formData.phone.trim() || '',
                userType: formData.userType,
                userId: formData.userId || '',
                subject: formData.subject.trim(),
                category: formData.category,
                priority: formData.priority,
                message: formData.message.trim()
            };
            
            console.log('Submitting candidate support ticket with data:', requiredData);
            
            Object.keys(requiredData).forEach(key => {
                submitData.append(key, requiredData[key]);
            });
            
            files.forEach(file => {
                submitData.append('attachments', file);
            });

            const response = await fetch('http://localhost:5000/api/public/support', {
                method: 'POST',
                body: submitData
            });
            
            if (response.ok) {
                setIsSubmitted(true);
                setFormData(prev => ({
                    ...prev,
                    subject: '',
                    category: 'general',
                    priority: 'medium',
                    message: ''
                }));
                setFiles([]);
            } else {
                const data = await response.json();
                console.error('Support ticket submission failed:', data);
                
                // Handle validation errors
                if (data.errors && Array.isArray(data.errors)) {
                    const validationErrors = {};
                    data.errors.forEach(error => {
                        if (error.path) {
                            validationErrors[error.path] = error.msg;
                        }
                    });
                    setErrors({ ...validationErrors, submit: data.message || 'Validation failed' });
                } else {
                    setErrors({ submit: data.message || 'Failed to submit support ticket' });
                }
            }
        } catch (error) {
            
            setErrors({ submit: 'Backend server not running. Please start the backend server on port 5000.' });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="panel-main-content">
                <div className="twm-dash-b-blocks">
                    <div className="col-lg-12">
                        <div className="panel panel-default">
                            <div className="panel-heading wt-panel-heading p-a20">
                                <h4 className="panel-tittle m-a0">Support Ticket Submitted</h4>
                            </div>
                            <div className="panel-body wt-panel-body p-a20 m-b30">
                                <div className="text-center">
                                    <div className="success-icon mb-3">
                                        <i className="fa fa-check-circle" style={{fontSize: '4rem', color: '#28a745'}}></i>
                                    </div>
                                    <p>Thank you for contacting our support team. We have received your ticket and will respond within 24 hours.</p>
                                    <h3 className="text-success" style={{display: 'block', margin: '10px auto', textAlign: 'center'}}>✓ Support Ticket Submitted!</h3>
                                    <button 
                                        onClick={() => setIsSubmitted(false)} 
                                        className="mt-3"
                                        style={{
                                            backgroundColor: '#FFF3E5',
                                            color: '#FF7A00',
                                            border: '1px solid #FF7A00',
                                            padding: '10px 20px',
                                            borderRadius: '5px',
                                            fontWeight: '600',
                                            cursor: 'pointer',
                                            display: 'block',
                                            margin: '10px auto 0 auto'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.target.style.backgroundColor = '#FFF3E5';
                                            e.target.style.color = '#FF7A00';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.target.style.backgroundColor = '#FFF3E5';
                                            e.target.style.color = '#FF7A00';
                                        }}
                                    >
                                        Submit Another Ticket
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="panel-main-content">
            <div className="twm-dash-b-blocks">
                <div className="col-lg-12">
                    <div className="panel panel-default">
                        <div className="panel-heading wt-panel-heading p-a20">
                            <h4 className="panel-tittle m-a0">Get Support</h4>
                        </div>
                        <div className="panel-body wt-panel-body p-a20 m-b30">
                            <form onSubmit={handleSubmit}>
                                {errors.submit && (
                                    <div className="alert alert-danger mb-3" style={{position: 'sticky', top: '10px', zIndex: '1000'}}>{errors.submit}</div>
                                )}
                                
                                <div className="row">
                                    <div className="col-xl-6 col-lg-6 col-md-12">
                                        <div className="form-group">
                                            <label>Name *</label>
                                            <input 
                                                name="name" 
                                                type="text" 
                                                className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                placeholder="Your name" 
                                                value={formData.name}
                                                onChange={handleChange}
                                            />
                                            {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-6 col-lg-6 col-md-12">
                                        <div className="form-group">
                                            <label>Email *</label>
                                            <input 
                                                name="email" 
                                                type="email" 
                                                className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                placeholder="Your email address" 
                                                value={formData.email}
                                                onChange={handleChange}
                                            />
                                            {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-12 col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Subject *</label>
                                            <input 
                                                name="subject" 
                                                type="text" 
                                                className={`form-control ${errors.subject ? 'is-invalid' : ''}`}
                                                placeholder="Brief description of your issue" 
                                                value={formData.subject}
                                                onChange={handleChange}
                                            />
                                            {errors.subject && <div className="invalid-feedback">{errors.subject}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-6 col-lg-6 col-md-12">
                                        <div className="form-group">
                                            <label>Category</label>
                                            <select 
                                                name="category" 
                                                className="form-control"
                                                value={formData.category}
                                                onChange={handleChange}
                                            >
                                                {categories.map(cat => (
                                                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-6 col-lg-6 col-md-12">
                                        <div className="form-group">
                                            <label>Priority</label>
                                            <select 
                                                name="priority" 
                                                className="form-control"
                                                value={formData.priority}
                                                onChange={handleChange}
                                            >
                                                {priorities.map(pri => (
                                                    <option key={pri.value} value={pri.value}>{pri.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-12 col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Message *</label>
                                            <textarea 
                                                name="message" 
                                                className={`form-control ${errors.message ? 'is-invalid' : ''}`}
                                                rows={5} 
                                                placeholder="Describe your issue or question in detail..." 
                                                value={formData.message}
                                                onChange={handleChange}
                                            />
                                            {errors.message && <div className="invalid-feedback">{errors.message}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-12 col-lg-12 col-md-12">
                                        <div className="form-group">
                                            <label>Attachments (Optional)</label>
                                            <input 
                                                type="file" 
                                                className={`form-control ${errors.files ? 'is-invalid' : ''}`}
                                                multiple 
                                                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.txt"
                                                onChange={handleFileChange}
                                            />
                                            <small className="form-text text-muted">
                                                Upload up to 3 files (max 5MB each). Supported: PDF, DOC, DOCX, JPG, PNG, TXT
                                            </small>
                                            {errors.files && <div className="invalid-feedback">{errors.files}</div>}
                                        </div>
                                    </div>
                                    
                                    <div className="col-xl-12 col-lg-12 col-md-12">
                                        <button 
                                            type="submit" 
                                            className="site-button"
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CanSupport;
