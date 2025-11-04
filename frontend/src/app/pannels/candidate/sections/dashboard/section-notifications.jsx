import { useEffect, useState } from 'react';

function SectionNotifications() {
	const [notifications, setNotifications] = useState([]);
	const [unreadCount, setUnreadCount] = useState(0);
	const [showAll, setShowAll] = useState(false);

	useEffect(() => {
		fetchNotifications();
		
		// Listen for notification refresh events
		const handleRefresh = () => {
			fetchNotifications();
		};
		
		window.addEventListener('refreshNotifications', handleRefresh);
		
		return () => {
			window.removeEventListener('refreshNotifications', handleRefresh);
		};
	}, []);

	const fetchNotifications = async () => {
		try {
			const token = localStorage.getItem('candidateToken');
			if (!token) return;

			const response = await fetch('http://localhost:5000/api/notifications/candidate', {
				headers: { 'Authorization': `Bearer ${token}` }
			});

			if (response.ok) {
				const data = await response.json();
				if (data.success) {
					setNotifications(data.notifications || []);
					setUnreadCount(data.unreadCount || 0);
				}
			}
		} catch (error) {

		}
	};

	const closeNotification = (notificationId) => {
		// Remove the notification from the local state
		setNotifications(prev => prev.filter(n => n._id !== notificationId));
		setUnreadCount(prev => Math.max(0, prev - 1));
	};

	return (
		<div className="panel panel-default mb-4" data-aos="fade-up" style={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxHeight: '400px' }}>
			<div className="panel-heading" style={{ background: 'white', color: 'black', borderRadius: '8px 8px 0 0', padding: '12px 16px', border: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
				<div className="d-flex align-items-center justify-content-between">
					<h5 className="panel-title mb-0" style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
						<i className="feather-bell me-2" style={{ fontSize: '14px', color: '#374151' }}></i><span style={{ color: '#374151', fontWeight: 'bold' }}>Notifications</span>
					</h5>
					<span className="badge" style={{ background: '#f3f4f6', color: '#374151', fontSize: '10px', padding: '2px 6px', fontWeight: 'bold', border: '1px solid #d1d5db' }}>
						{notifications.length}
					</span>
				</div>
			</div>
			<div className="panel-body" style={{ padding: '0', maxHeight: '320px', overflowY: 'auto' }}>
				{notifications.length > 0 ? (
					<div className="notification-list">
						{notifications.slice(0, showAll ? notifications.length : 3).map((notification, index) => {
							const getNotificationIcon = (type) => {
								switch(type) {
									case 'profile_approved': return { icon: 'feather-user', color: '#3b82f6' };
									case 'profile_submitted': return { icon: 'feather-user', color: '#8b5cf6' };
									case 'application_status': return { icon: 'feather-briefcase', color: '#3b82f6' };
									case 'interview_scheduled': return { icon: 'feather-calendar', color: '#f59e0b' };
									default: return { icon: 'feather-info', color: '#6b7280' };
								}
							};
							const iconData = getNotificationIcon(notification.type);
							return (
								<div key={index} className="notification-item" style={{
									padding: '10px 12px',
									borderBottom: index < notifications.slice(0, showAll ? notifications.length : 3).length - 1 ? '1px solid #f1f5f9' : 'none',
									transition: 'all 0.2s ease',
									cursor: 'pointer'
								}} onMouseEnter={(e) => e.target.style.backgroundColor = '#f8fafc'} onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}>
									<div className="d-flex align-items-start">
										<div className="notification-icon me-2" style={{
											width: '28px',
											height: '28px',
											borderRadius: '50%',
											background: `${iconData.color}15`,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											flexShrink: 0
										}}>
											<i className={iconData.icon} style={{ color: iconData.color, fontSize: '14px' }}></i>
										</div>
										<div className="notification-content flex-grow-1">
											<div className="d-flex justify-content-between align-items-start">
												<div className="flex-grow-1">
													<h6 className="notification-title mb-1" style={{ fontSize: '12px', fontWeight: '600', color: '#1f2937', lineHeight: '1.3' }}>
														{notification.title}
													</h6>
													<p className="notification-message mb-1" style={{ fontSize: '11px', color: '#6b7280', lineHeight: '1.3', margin: '0' }}>
														{notification.message.length > 50 ? notification.message.substring(0, 50) + '...' : notification.message}
													</p>
													<small className="notification-time" style={{ fontSize: '10px', color: '#9ca3af' }}>
														{new Date(notification.createdAt).toLocaleDateString('en-US', {
															month: 'short',
															day: 'numeric'
														})}
													</small>
												</div>
												<button
													className="btn btn-sm p-0 ms-2"
													style={{
														background: '#fed7aa !important',
														border: 'none !important',
														color: 'black',
														fontSize: '12px',
														lineHeight: '1',
														cursor: 'pointer',
														flexShrink: 0,
														borderRadius: '2px',
														padding: '2px 4px'
													}}
													onClick={(e) => {
														e.stopPropagation();
														closeNotification(notification._id);
													}}
													onMouseEnter={(e) => {
														e.target.style.setProperty('background-color', '#fdba74', 'important');
													}}
													onMouseLeave={(e) => {
														e.target.style.setProperty('background-color', '#fed7aa', 'important');
													}}
													title="Close notification"
												>
													<i className="fa fa-times" style={{ color: 'black !important' }}></i>
												</button>
											</div>
										</div>
										{!notification.isRead && (
											<div className="notification-dot" style={{
												width: '6px',
												height: '6px',
												borderRadius: '50%',
												background: '#ef4444',
												flexShrink: 0
											}}></div>
										)}
									</div>
								</div>
							);
						})}
						{notifications.length > 3 && (
							<div style={{ padding: '8px 12px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
								<button 
									className="btn btn-sm" 
									onClick={() => setShowAll(!showAll)}
									style={{
										background: 'rgba(0,0,0,0.8)',
										color: 'white',
										border: 'none',
										borderRadius: '12px',
										padding: '4px 12px',
										fontSize: '10px'
									}}>
									{showAll ? 'Show Less' : 'View All'}
								</button>
							</div>
						)}
					</div>
				) : (
					<div className="text-center" style={{ padding: '24px 12px' }}>
						<div style={{ opacity: 0.5, marginBottom: '8px' }}>
							<i className="feather-bell" style={{ fontSize: '32px', color: '#d1d5db' }}></i>
						</div>
						<h6 style={{ color: '#6b7280', fontSize: '12px', margin: '0' }}>No notifications</h6>
						<p style={{ color: '#9ca3af', fontSize: '10px', margin: '2px 0 0 0' }}>Updates will appear here</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default SectionNotifications;
