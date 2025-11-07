function SectionNotifications() {
	return (
		<div className="panel panel-default mb-4" data-aos="fade-up" style={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', maxHeight: '400px' }}>
			<div className="panel-heading" style={{ background: 'white', color: 'black', borderRadius: '8px 8px 0 0', padding: '12px 16px', border: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb' }}>
				<div className="d-flex align-items-center justify-content-between">
					<h5 className="panel-title mb-0" style={{ fontSize: '14px', fontWeight: 'bold', color: '#374151' }}>
						<i className="feather-bell me-2" style={{ fontSize: '14px', color: '#374151' }}></i><span style={{ color: '#374151', fontWeight: 'bold' }}>Notifications</span>
					</h5>
					<span className="badge" style={{ background: '#f3f4f6', color: '#374151', fontSize: '10px', padding: '2px 6px', fontWeight: 'bold', border: '1px solid #d1d5db' }}>
						0
					</span>
				</div>
			</div>
			<div className="panel-body" style={{ padding: '0', maxHeight: '320px', overflowY: 'auto' }}>
				<div className="text-center" style={{ padding: '24px 12px' }}>
					<div style={{ opacity: 0.5, marginBottom: '8px' }}>
						<i className="feather-bell" style={{ fontSize: '32px', color: '#d1d5db' }}></i>
					</div>
					<h6 style={{ color: '#6b7280', fontSize: '12px', margin: '0' }}>No notifications</h6>
					<p style={{ color: '#9ca3af', fontSize: '10px', margin: '2px 0 0 0' }}>Updates will appear here</p>
				</div>
			</div>
		</div>
	);
}

export default SectionNotifications;
