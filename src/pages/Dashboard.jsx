import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  LuClipboardList, 
  LuFileText, 
  LuUsers, 
  LuIndianRupee, 
  LuCheck, 
  LuArrowUpRight, 
  LuRefreshCw,
  LuCalendar,
  LuClock
} from 'react-icons/lu';
import { adminApi, getStoredAuth } from '../services/api';

const Dashboard = () => {
  const authUser = getStoredAuth();
  const adminName = authUser?.user?.name || authUser?.name || 'Admin User';

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRegistrations: 0,
    paidRegistrations: 0,
    totalRevenue: 0,
    totalAbstracts: 0,
    recentRegistrations: [],
    recentAbstracts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadStats = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getDashboardStats();
      if (res.status && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
      setError(err.message || 'Failed to load dashboard statistics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="dashboard-page-container container-fluid px-4 py-3">
      {/* 1. Welcome Banner */}
      <div className="dashboard-welcome-banner mb-4">
        <div className="banner-content">
          <div className="banner-title-area">
            <h1>Welcome back, {adminName}</h1>
            <p className="banner-subtitle">
              Real-time summary of conference delegate registrations, revenue collection, and scientific abstract submissions.
            </p>
          </div>

          <div className="d-flex align-items-center gap-3">
            <button
              onClick={loadStats}
              disabled={loading}
              className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3"
            >
              <LuRefreshCw className={loading ? 'fa-spin' : ''} />
              <span>{loading ? 'Refreshing...' : 'Refresh Data'}</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center justify-content-between mb-4 rounded-3 shadow-sm">
          <span>{error}</span>
          <button onClick={loadStats} className="btn btn-link btn-sm text-danger fw-bold p-0">Retry</button>
        </div>
      )}

      {/* 2. Stat Cards Grid (4 Columns) */}
      <div className="row g-4 mb-4">
        {/* Card 1: Total Revenue */}
        <div className="col-xl-3 col-md-6 col-12">
          <div className="stat-card-wrapper stat-theme-events">
            <div className="stat-card-top">
              <div className="stat-card-info">
                <span className="stat-card-label">Total Revenue</span>
                <span className="stat-card-value text-danger">
                  {loading ? '...' : formatCurrency(stats.totalRevenue)}
                </span>
              </div>
              <div className="stat-icon-box">
                <LuIndianRupee size={24} />
              </div>
            </div>
            <div className="stat-card-bottom">
              <span className="text-muted small">
                {stats.paidRegistrations} Confirmed Paid
              </span>
              <span className="stat-trend-badge positive">
                <LuCheck size={12} className="me-1" /> Paid
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Total Registrations */}
        <div className="col-xl-3 col-md-6 col-12">
          <div className="stat-card-wrapper stat-theme-members">
            <div className="stat-card-top">
              <div className="stat-card-info">
                <span className="stat-card-label">Registrations</span>
                <span className="stat-card-value text-primary">
                  {loading ? '...' : stats.totalRegistrations}
                </span>
              </div>
              <div className="stat-icon-box">
                <LuClipboardList size={24} />
              </div>
            </div>
            <div className="stat-card-bottom">
              <span className="text-muted small">Total submissions</span>
              <Link to="/admin/registration" className="text-decoration-none fw-bold text-primary small d-flex align-items-center gap-1">
                View <LuArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Research Abstracts */}
        <div className="col-xl-3 col-md-6 col-12">
          <div className="stat-card-wrapper stat-theme-blogs">
            <div className="stat-card-top">
              <div className="stat-card-info">
                <span className="stat-card-label">Abstracts</span>
                <span className="stat-card-value text-info">
                  {loading ? '...' : stats.totalAbstracts}
                </span>
              </div>
              <div className="stat-icon-box">
                <LuFileText size={24} />
              </div>
            </div>
            <div className="stat-card-bottom">
              <span className="text-muted small">Papers for review</span>
              <Link to="/admin/abstract" className="text-decoration-none fw-bold text-info small d-flex align-items-center gap-1">
                Review <LuArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 4: Registered Users */}
        <div className="col-xl-3 col-md-6 col-12">
          <div className="stat-card-wrapper stat-theme-enquiries">
            <div className="stat-card-top">
              <div className="stat-card-info">
                <span className="stat-card-label">User Accounts</span>
                <span className="stat-card-value text-success">
                  {loading ? '...' : stats.totalUsers}
                </span>
              </div>
              <div className="stat-icon-box">
                <LuUsers size={24} />
              </div>
            </div>
            <div className="stat-card-bottom">
              <span className="text-muted small">Active delegates</span>
              <Link to="/admin/users" className="text-decoration-none fw-bold text-success small d-flex align-items-center gap-1">
                Directory <LuArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tables Row (Recent Registrations & Recent Abstracts) */}
      <div className="row g-4">
        {/* Left: Recent Registrations Card */}
        <div className="col-lg-6 col-12">
          <div className="dashboard-card-section h-100 mb-0">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title-box">
                <LuClipboardList className="card-title-icon text-primary" size={20} />
                <h3 className="dashboard-card-title">Recent Registrations</h3>
              </div>
              <Link to="/admin/registration" className="btn btn-sm btn-outline-primary rounded-pill px-3">
                View All
              </Link>
            </div>

            <div className="dashboard-card-body p-0">
              <div className="activity-table-container">
                <table className="spctt-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Delegate</th>
                      <th>Category</th>
                      <th className="text-end">Amount</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-muted">
                          <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                          Loading registrations...
                        </td>
                      </tr>
                    ) : stats.recentRegistrations?.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-muted">
                          No registrations found yet.
                        </td>
                      </tr>
                    ) : (
                      stats.recentRegistrations.map((reg) => (
                        <tr key={reg.id}>
                          <td>
                            <span className="badge bg-light text-primary border font-monospace">
                              {reg.registration_code}
                            </span>
                          </td>
                          <td>
                            <div className="fw-bold text-dark">{reg.title || ''} {reg.full_name || 'Delegate'}</div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{reg.email}</div>
                          </td>
                          <td>
                            <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.72rem' }}>
                              {reg.category_name || 'Standard'}
                            </span>
                          </td>
                          <td className="text-end fw-bold text-dark">
                            {formatCurrency(reg.grand_total)}
                          </td>
                          <td className="text-center">
                            <span className={`badge ${
                              reg.payment_status === 'paid' 
                                ? 'bg-success-subtle text-success border border-success' 
                                : 'bg-warning-subtle text-warning border border-warning'
                            } text-uppercase px-2.5 py-1 rounded-pill`} style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                              {reg.payment_status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Abstracts Card */}
        <div className="col-lg-6 col-12">
          <div className="dashboard-card-section h-100 mb-0">
            <div className="dashboard-card-header">
              <div className="dashboard-card-title-box">
                <LuFileText className="card-title-icon text-info" size={20} />
                <h3 className="dashboard-card-title">Recent Abstracts</h3>
              </div>
              <Link to="/admin/abstract" className="btn btn-sm btn-outline-info rounded-pill px-3">
                Review All
              </Link>
            </div>

            <div className="dashboard-card-body p-0">
              <div className="activity-table-container">
                <table className="spctt-table">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Abstract Title</th>
                      <th>Category</th>
                      <th className="text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">
                          <div className="spinner-border spinner-border-sm text-info me-2"></div>
                          Loading abstracts...
                        </td>
                      </tr>
                    ) : stats.recentAbstracts?.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4 text-muted">
                          No abstracts submitted yet.
                        </td>
                      </tr>
                    ) : (
                      stats.recentAbstracts.map((abs) => (
                        <tr key={abs.id}>
                          <td>
                            <span className="badge bg-light text-info border font-monospace">
                              {abs.abstract_code}
                            </span>
                          </td>
                          <td>
                            <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '220px' }}>
                              {abs.title}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              By {abs.authors}
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark border" style={{ fontSize: '0.72rem' }}>
                              {abs.category}
                            </span>
                          </td>
                          <td className="text-center">
                            <span className={`badge ${
                              abs.status === 'accepted' ? 'bg-success-subtle text-success border border-success' :
                              abs.status === 'rejected' ? 'bg-danger-subtle text-danger border border-danger' :
                              abs.status === 'under_review' ? 'bg-info-subtle text-info border border-info' :
                              'bg-warning-subtle text-warning border border-warning'
                            } text-uppercase px-2.5 py-1 rounded-pill`} style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                              {abs.status ? abs.status.replace('_', ' ') : 'submitted'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
