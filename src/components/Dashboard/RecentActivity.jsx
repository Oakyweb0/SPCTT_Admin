import React from 'react';

const RecentActivity = ({ activities = [] }) => {
  return (
    <div className="dashboard-card-section mb-4">
      <div className="dashboard-card-header">
        <div className="dashboard-card-title-box">
          <i className="fa-solid fa-clock-rotate-left card-title-icon"></i>
          <h2 className="dashboard-card-title">Recent Activity</h2>
        </div>
        <span className="badge bg-light text-muted border">
          <i className="fa-regular fa-calendar-days me-1"></i>
          September 2026
        </span>
      </div>

      <div className="activity-table-container">
        <table className="spctt-table">
          <thead>
            <tr>
              <th>Activity</th>
              <th>User</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((item) => (
              <tr key={item.id}>
                <td>
                  <div className="activity-title-cell">
                    <div 
                      className="activity-category-icon"
                      style={{ backgroundColor: item.iconBg, color: item.iconColor }}
                    >
                      <i className={item.icon}></i>
                    </div>
                    <div>
                      <div className="fw-semibold text-dark">{item.activity}</div>
                      {item.detail && (
                        <div className="text-muted small" style={{ fontSize: '0.78rem' }}>
                          {item.detail}
                        </div>
                      )}
                    </div>
                  </div>
                </td>
                <td>
                  <div className="activity-user-pill">
                    <div className="activity-user-avatar-mini">
                      {item.user.charAt(0)}
                    </div>
                    <span>{item.user}</span>
                  </div>
                </td>
                <td>
                  <span className="activity-date-text">
                    <i className="fa-regular fa-clock me-1 text-muted"></i>
                    {item.date}
                  </span>
                </td>
                <td>
                  <span className={`status-badge-custom ${item.badgeClass}`}>
                    <i className="fa-solid fa-circle" style={{ fontSize: '0.45rem' }}></i>
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentActivity;
