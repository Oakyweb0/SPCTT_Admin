import React, { useEffect, useState } from 'react';
import { 
  LuSearch, 
  LuRefreshCw, 
  LuUsers, 
  LuMail, 
  LuPhone, 
  LuBuilding2, 
  LuShieldCheck,
  LuCalendar
} from 'react-icons/lu';
import { adminApi } from '../../services/api';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const loadUsers = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getUsers();
      if (res.status && res.data) {
        setUsers(res.data);
      }
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const s = search.toLowerCase();
    const matchSearch = !search || (
      (u.name && u.name.toLowerCase().includes(s)) ||
      (u.email && u.email.toLowerCase().includes(s)) ||
      (u.organization && u.organization.toLowerCase().includes(s)) ||
      (u.phone && u.phone.toLowerCase().includes(s))
    );
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="dashboard-page-container container-fluid px-4 py-3">
      {/* Header Banner */}
      <div className="dashboard-card-section mb-4">
        <div className="dashboard-card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 bg-success-subtle text-success rounded-3">
              <LuUsers size={24} />
            </div>
            <div>
              <h2 className="dashboard-card-title mb-1">Registered Delegates & Users</h2>
              <p className="text-muted small mb-0">Directory of all registered accounts, delegate institutional details, and system roles</p>
            </div>
          </div>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3"
          >
            <LuRefreshCw className={loading ? 'fa-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search Toolbar */}
        <div className="p-3 bg-light border-top border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-md-8 col-12">
              <div className="search-input-box">
                <span className="input-icon">
                  <LuSearch size={18} />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search delegates by name, email address, institution, phone..."
                  className="form-control shadow-none"
                />
              </div>
            </div>

            <div className="col-md-4 col-12 d-flex justify-content-md-end">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="form-select form-select-sm w-auto"
              >
                <option value="">All Roles</option>
                <option value="user">User / Delegate</option>
                <option value="admin">Administrator</option>
                <option value="manager">Manager</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="activity-table-container">
          <table className="spctt-table">
            <thead>
              <tr>
                <th>Delegate Profile</th>
                <th>Contact Details</th>
                <th>Institution / Organization</th>
                <th className="text-center">Role</th>
                <th className="text-center">Status</th>
                <th>Registered Date</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="table-empty-state py-5">
                      <div className="spinner-border text-success mb-3" style={{ width: '2.2rem', height: '2.2rem' }}></div>
                      <h6 className="table-empty-title mb-1">Loading Registered Users...</h6>
                      <p className="table-empty-desc">Fetching user directory from server</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="table-empty-state">
                      <div className="table-empty-icon-box" style={{ background: 'rgba(22, 163, 74, 0.1)', color: '#16a34a' }}>
                        <LuUsers size={26} />
                      </div>
                      <h5 className="table-empty-title">No Users Found</h5>
                      <p className="table-empty-desc">
                        {search || roleFilter
                          ? "No registered accounts match your current search terms or role filter."
                          : "No delegate accounts have been created yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className={`user-avatar-badge ${u.role || 'user'}`}>
                          {getInitials(u.name)}
                        </div>
                        <div>
                          <div className="fw-bold text-dark">{u.title ? `${u.title} ` : ''}{u.name}</div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            <span className="badge bg-light text-secondary border px-1.5 py-0.5">ID: #{u.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 text-dark fw-semibold small">
                        <LuMail size={14} className="text-primary flex-shrink-0" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="d-flex align-items-center gap-2 text-muted mt-1 small" style={{ fontSize: '0.78rem' }}>
                          <LuPhone size={13} className="text-muted flex-shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 small">
                        <LuBuilding2 size={15} className="text-muted flex-shrink-0" />
                        {u.organization ? (
                          <span className="fw-medium text-dark">{u.organization}</span>
                        ) : (
                          <span className="text-muted fst-italic">Not specified</span>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${
                        u.role === 'admin' ? 'bg-purple-subtle text-purple border border-purple' :
                        u.role === 'manager' ? 'bg-primary-subtle text-primary border border-primary' :
                        'bg-info-subtle text-info border border-info'
                      } text-uppercase px-2.5 py-1 rounded-pill`} style={{ fontSize: '0.72rem', letterSpacing: '0.04em', fontWeight: 600 }}>
                        {u.role === 'admin' && <LuShieldCheck size={12} className="me-1" />}
                        {u.role || 'User'}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${
                        u.status === 'active' ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'
                      } text-uppercase px-2.5 py-1 rounded-pill`} style={{ fontSize: '0.72rem', letterSpacing: '0.04em', fontWeight: 600 }}>
                        <span className={`badge-status-dot ${u.status === 'active' ? 'active' : 'inactive'}`}></span>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2 text-muted small">
                        <LuCalendar size={14} className="text-muted flex-shrink-0" />
                        <span>{new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminUsersPage;
