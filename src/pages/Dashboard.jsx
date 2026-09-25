import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LuClipboardList,
  LuFileText,
  LuArrowUpRight,
  LuRefreshCw,
  LuCalendar,
  LuClock,
  LuUsers
} from 'react-icons/lu';
import { adminApi, getStoredAuth } from '../services/api';
import Pagination from '../components/Common/Pagination';

const Dashboard = () => {
  const authUser = getStoredAuth();
  const adminName = authUser?.user?.name || authUser?.name || 'Admin User';

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRegistrations: 0,
    paidRegistrations: 0,
    pendingRegistrations: 0,
    totalRevenue: 0,
    totalAbstracts: 0,
    recentRegistrations: [],
    recentAbstracts: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Pagination states (5 items per page)
  const [regPage, setRegPage] = useState(1);
  const [absPage, setAbsPage] = useState(1);
  const pageSize = 5;

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

  // Sliced data for pagination
  const allRegistrations = stats.recentRegistrations || [];
  const paginatedRegistrations = allRegistrations.slice((regPage - 1) * pageSize, regPage * pageSize);

  const allAbstracts = stats.recentAbstracts || [];
  const paginatedAbstracts = allAbstracts.slice((absPage - 1) * pageSize, absPage * pageSize);

  return (
    <div className="dashboard-page-container w-100">
      {/* 1. Welcome Banner */}
      <div className="dashboard-welcome-banner mb-4">
        <div className="banner-content">
          <div className="banner-title-area">
            <h1>Welcome back, {adminName}</h1>
            <p className="banner-subtitle">
              Real-time summary of conference delegate registrations and scientific abstract submissions.
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

      {/* 2. Stat Cards Grid (3 Columns) */}
      <div className="row g-4 mb-4">
        {/* Card 1: Total Registrations */}
        <div className="col-md-4 col-12">
          <div className="stat-card-wrapper stat-theme-members">
            <div className="stat-card-top mb-1">
              <div className="stat-card-info">
                <span className="stat-card-label">Registrations</span>
                
                {/* Vertical list: Total submissions, Paid and Pending */}
                <div className="d-flex flex-column gap-1 my-1">
                  <div className="d-flex align-items-baseline gap-1.5" style={{ lineHeight: 1.25 }}>
                    <span className="fw-bold text-primary" style={{ fontSize: '1.18rem' }}>
                      {loading ? '...' : (stats.totalRegistrations || 0)}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                      Total submissions
                    </span>
                  </div>

                  <div className="d-flex align-items-baseline gap-1.5" style={{ lineHeight: 1.25 }}>
                    <span className="fw-bold text-primary" style={{ fontSize: '1.18rem' }}>
                      {loading ? '...' : (stats.paidRegistrations || 0)}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                      Paid
                    </span>
                  </div>

                  <div className="d-flex align-items-baseline gap-1.5" style={{ lineHeight: 1.25 }}>
                    <span className="fw-bold text-primary" style={{ fontSize: '1.18rem' }}>
                      {loading ? '...' : (stats.pendingRegistrations ?? Math.max(0, (stats.totalRegistrations || 0) - (stats.paidRegistrations || 0)))}
                    </span>
                    <span className="text-muted" style={{ fontSize: '0.82rem' }}>
                      Pending
                    </span>
                  </div>
                </div>
              </div>

              <div className="stat-icon-box">
                <LuClipboardList size={22} />
              </div>
            </div>

            <div className="stat-card-bottom mt-1 pt-2">
              <span className="text-muted small">Delegate registrations</span>
              <Link to="/admin/registration" className="text-decoration-none fw-bold text-primary small d-flex align-items-center gap-1">
                View <LuArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 2: Research Abstracts */}
        <div className="col-md-4 col-12">
          <div className="stat-card-wrapper stat-theme-blogs">
            <div className="stat-card-top mb-1">
              <div className="stat-card-info">
                <span className="stat-card-label">Abstracts</span>
                <span className="stat-card-value text-info my-1">
                  {loading ? '...' : stats.totalAbstracts}
                </span>
              </div>
              <div className="stat-icon-box">
                <LuFileText size={22} />
              </div>
            </div>
            <div className="stat-card-bottom mt-1 pt-2">
              <span className="text-muted small">Papers for review</span>
              <Link to="/admin/abstract" className="text-decoration-none fw-bold text-info small d-flex align-items-center gap-1">
                Review <LuArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>

        {/* Card 3: Total Users / Delegates */}
        <div className="col-md-4 col-12">
          <div className="stat-card-wrapper stat-theme-enquiries">
            <div className="stat-card-top mb-1">
              <div className="stat-card-info">
                <span className="stat-card-label">Registered Users</span>
                <span className="stat-card-value text-success my-1">
                  {loading ? '...' : stats.totalUsers}
                </span>
              </div>
              <div className="stat-icon-box">
                <LuUsers size={22} />
              </div>
            </div>
            <div className="stat-card-bottom mt-1 pt-2">
              <span className="text-muted small">Delegate accounts</span>
              <Link to="/admin/users" className="text-decoration-none fw-bold text-success small d-flex align-items-center gap-1">
                Manage <LuArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Tables Row (Recent Registrations & Recent Abstracts) */}
      <div className="row g-4">
        {/* Left: Recent Registrations Card */}
        <div className="col-lg-6 col-12">
          <div className="dashboard-card-section h-100 mb-0 d-flex flex-column justify-content-between">
            <div>
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
                  <table className="spctt-table spctt-dashboard-table">
                    <thead>
                      <tr>
                        <th style={{ width: '22%' }}>Code</th>
                        <th style={{ width: '43%' }}>Delegate</th>
                        <th style={{ width: '20%' }}>Category</th>
                        <th className="text-center" style={{ width: '15%' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted">
                            <div className="spinner-border spinner-border-sm text-primary me-2"></div>
                            Loading registrations...
                          </td>
                        </tr>
                      ) : allRegistrations.length === 0 ? (
                        <tr>
                          <td colSpan={4}>
                            <div className="text-center py-4 my-2">
                              <div className="d-inline-flex p-2.5 rounded-circle bg-primary-subtle text-primary mb-2">
                                <LuClipboardList size={22} />
                              </div>
                              <div className="text-dark fw-semibold small">No registrations found yet</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Delegate registrations will appear here</div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedRegistrations.map((reg) => (
                          <tr key={reg.id}>
                            <td>
                              <span className="badge bg-light text-primary border font-monospace px-1.5 py-0.5">
                                {reg.registration_code}
                              </span>
                            </td>
                            <td>
                              <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '180px' }}>
                                {reg.title || ''} {reg.full_name || 'Delegate'}
                              </div>
                              <div className="text-muted text-truncate" style={{ fontSize: '0.75rem', maxWidth: '180px' }}>
                                {reg.email}
                              </div>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark border text-truncate d-inline-block" style={{ fontSize: '0.72rem', maxWidth: '140px' }} title={reg.category_name || 'Standard'}>
                                {reg.category_name || 'Standard'}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className={`badge ${reg.payment_status === 'paid'
                                  ? 'bg-success-subtle text-success border border-success'
                                  : reg.payment_status === 'failed'
                                    ? 'bg-danger-subtle text-danger border border-danger'
                                    : 'bg-warning-subtle text-warning border border-warning'
                                } text-uppercase px-2.5 py-1 rounded-pill`} style={{ fontSize: '0.68rem', letterSpacing: '0.04em', fontWeight: 700 }}>
                                {reg.payment_status || 'pending'}
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

            {/* Registrations Pagination */}
            {!loading && allRegistrations.length > 0 && (
              <Pagination
                currentPage={regPage}
                totalItems={allRegistrations.length}
                pageSize={pageSize}
                onPageChange={(page) => setRegPage(page)}
                itemLabel="registrations"
              />
            )}
          </div>
        </div>

        {/* Right: Recent Abstracts Card */}
        <div className="col-lg-6 col-12">
          <div className="dashboard-card-section h-100 mb-0 d-flex flex-column justify-content-between">
            <div>
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
                  <table className="spctt-table spctt-dashboard-table">
                    <thead>
                      <tr>
                        <th style={{ width: '22%' }}>Code</th>
                        <th style={{ width: '43%' }}>Abstract Title</th>
                        <th style={{ width: '20%' }}>Category</th>
                        <th className="text-center" style={{ width: '15%' }}>Status</th>
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
                      ) : allAbstracts.length === 0 ? (
                        <tr>
                          <td colSpan={4}>
                            <div className="text-center py-4 my-2">
                              <div className="d-inline-flex p-2.5 rounded-circle bg-info-subtle text-info mb-2">
                                <LuFileText size={22} />
                              </div>
                              <div className="text-dark fw-semibold small">No abstracts submitted yet</div>
                              <div className="text-muted" style={{ fontSize: '0.75rem' }}>Submitted research papers will appear here</div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedAbstracts.map((abs) => (
                          <tr key={abs.id}>
                            <td>
                              <span className="badge bg-light text-info border font-monospace px-1.5 py-0.5">
                                {abs.abstract_code}
                              </span>
                            </td>
                            <td>
                              <div className="fw-bold text-dark text-truncate" style={{ maxWidth: '180px' }}>
                                {abs.title}
                              </div>
                              <div className="text-muted text-truncate" style={{ fontSize: '0.75rem', maxWidth: '180px' }}>
                                By {abs.authors}
                              </div>
                            </td>
                            <td>
                              <span className="badge badge-category-teal px-2.5 py-1 rounded-pill" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                                {abs.category || 'Poster'}
                              </span>
                            </td>
                            <td className="text-center">
                              <span className={`badge ${abs.status === 'accepted' ? 'bg-success-subtle text-success border border-success' :
                                  abs.status === 'rejected' ? 'bg-danger-subtle text-danger border border-danger' :
                                    abs.status === 'under_review' ? 'bg-info-subtle text-info border border-info' :
                                      'bg-warning-subtle text-warning border border-warning'
                                } text-uppercase px-2.5 py-1 rounded-pill`} style={{ fontSize: '0.68rem', letterSpacing: '0.04em', fontWeight: 700 }}>
                                {abs.status ? abs.status.replace('_', ' ') : 'pending'}
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

            {/* Abstracts Pagination */}
            {!loading && allAbstracts.length > 0 && (
              <Pagination
                currentPage={absPage}
                totalItems={allAbstracts.length}
                pageSize={pageSize}
                onPageChange={(page) => setAbsPage(page)}
                itemLabel="abstracts"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
