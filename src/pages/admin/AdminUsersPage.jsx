import React, { useEffect, useState } from 'react';
import {
  LuSearch,
  LuRefreshCw,
  LuUsers,
  LuMail,
  LuPhone,
  LuBuilding2,
  LuShieldCheck,
  LuCalendar,
  LuTrash2,
  LuPencil,
  LuTriangleAlert,
  LuCircleAlert,
  LuCheck,
  LuX,
  LuUserPlus,
  LuLock,
  LuEye,
  LuEyeOff,
  LuDownload
} from 'react-icons/lu';
import { adminApi } from '../../services/api';
import { downloadBlobFile } from '../../services/api/adminApi';
import Pagination from '../../components/Common/Pagination';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Notification state
  const [notification, setNotification] = useState(null);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit state
  const [editTarget, setEditTarget] = useState(null);
  const [editForm, setEditForm] = useState({
    title: 'Mr.',
    name: '',
    email: '',
    phone: '',
    organization: '',
    role: 'user',
    status: 'active'
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [editError, setEditError] = useState(null);

  // Add User state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addForm, setAddForm] = useState({
    title: 'Mr.',
    name: '',
    email: '',
    password: '',
    phone: '',
    organization: '',
    role: 'user',
    status: 'active'
  });

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

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = {};
      if (search) params.search = search;
      if (roleFilter) params.role = roleFilter;

      const blobData = await adminApi.exportUsers(params);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadBlobFile(blobData, `SPCTT_Users_${dateStr}.xlsx`);
      setNotification({
        type: 'success',
        message: 'Users list exported to Excel (.xlsx) successfully!'
      });
    } catch (err) {
      console.error('Error exporting users:', err);
      setNotification({
        type: 'danger',
        message: 'Failed to export users to Excel.'
      });
    } finally {
      setExporting(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleOpenAdd = () => {
    setAddForm({
      title: 'Mr.',
      name: '',
      email: '',
      password: '',
      phone: '',
      organization: '',
      role: 'user',
      status: 'active'
    });
    setAddError(null);
    setShowAddPassword(false);
    setShowAddModal(true);
  };

  const handleCreateUser = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsCreating(true);
      setAddError(null);

      if (!addForm.name.trim()) {
        setAddError('Full name is required.');
        setIsCreating(false);
        return;
      }

      if (!addForm.email.trim()) {
        setAddError('Email address is required.');
        setIsCreating(false);
        return;
      }

      if (!addForm.password || addForm.password.length < 6) {
        setAddError('Password must be at least 6 characters long.');
        setIsCreating(false);
        return;
      }

      const res = await adminApi.createUser(addForm);
      if (res.status) {
        setNotification({
          type: 'success',
          message: `User '${res.data?.name || addForm.name}' (ID: #${res.data?.id}) created successfully!`
        });
        setShowAddModal(false);
        await loadUsers();
      } else {
        setAddError(res.message || 'Failed to create user.');
      }
    } catch (err) {
      console.error('Error creating user:', err);
      setAddError(err.response?.data?.message || err.message || 'Failed to create user.');
    } finally {
      setIsCreating(false);
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const handleOpenEdit = (user) => {
    setEditTarget(user);
    setEditError(null);
    setEditForm({
      title: user.title || 'Mr.',
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      organization: user.organization || '',
      role: user.role || 'user',
      status: user.status || 'active'
    });
  };

  const handleUpdateUser = async (e) => {
    if (e) e.preventDefault();
    if (!editTarget) return;
    try {
      setIsUpdating(true);
      setEditError(null);

      const payload = { ...editForm };

      const res = await adminApi.updateUser(editTarget.id, payload);
      if (res.status) {
        setNotification({
          type: 'success',
          message: `User '${res.data?.name || editForm.name}' (ID: #${editTarget.id}) updated successfully!`
        });
        setEditTarget(null);
        await loadUsers();
      } else {
        setEditError(res.message || 'Failed to update user.');
      }
    } catch (err) {
      console.error('Error updating user:', err);
      setEditError(err.response?.data?.message || err.message || 'Failed to update user.');
    } finally {
      setIsUpdating(false);
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await adminApi.deleteUser(deleteTarget.id);
      if (res.status) {
        setNotification({
          type: 'success',
          message: `User ${deleteTarget.name} (ID: #${deleteTarget.id}) and all associated records deleted successfully.`
        });
        setDeleteTarget(null);
        await loadUsers();
      } else {
        setNotification({
          type: 'danger',
          message: res.message || 'Failed to delete user.'
        });
      }
    } catch (err) {
      console.error('Error deleting user:', err);
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || err.message || 'Failed to delete user.'
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

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

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="dashboard-page-container w-100">
      {/* Toast Notification */}
      {notification && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show d-flex align-items-center justify-content-between shadow-sm rounded-3 mb-3`} role="alert">
          <div className="d-flex align-items-center gap-2">
            {notification.type === 'success' ? <LuCheck size={20} /> : <LuTriangleAlert size={20} />}
            <span>{notification.message}</span>
          </div>
          <button type="button" className="btn-close shadow-none" onClick={() => setNotification(null)}></button>
        </div>
      )}

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
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={exporting || loading}
              className="spctt-outline-btn"
              title="Export Users to Excel (.xlsx)"
            >
              <LuDownload className={exporting ? 'fa-spin' : ''} size={15} />
              <span>{exporting ? 'Exporting...' : 'Export List'}</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="spctt-primary-btn"
            >
              <LuUserPlus size={16} />
              <span>Add New User</span>
            </button>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="spctt-outline-btn"
            >
              <LuRefreshCw className={loading ? 'fa-spin' : ''} size={15} />
              <span>Refresh</span>
            </button>
          </div>
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
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Search delegates by name, email address, institution, phone..."
                  className="form-control shadow-none"
                />
              </div>
            </div>

            <div className="col-md-4 col-12 d-flex justify-content-md-end">
              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select form-select-sm w-auto shadow-none"
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
          <table className="spctt-table w-100">
            <thead>
              <tr>
                <th className="text-center" style={{ width: '5%', minWidth: '45px' }}>S.No</th>
                <th style={{ width: '22%' }}>Delegate Profile</th>
                <th style={{ width: '22%' }}>Contact Details</th>
                <th style={{ width: '18%' }}>Institution / Organization</th>
                <th className="text-center" style={{ width: '9%' }}>Role</th>
                <th className="text-center" style={{ width: '9%' }}>Status</th>
                <th style={{ width: '10%' }}>Registered Date</th>
                <th className="text-center" style={{ width: '7%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="table-empty-state py-5">
                      <div className="spinner-border text-success mb-3" style={{ width: '2.2rem', height: '2.2rem' }}></div>
                      <h6 className="table-empty-title mb-1">Loading Registered Users...</h6>
                      <p className="table-empty-desc">Fetching user directory from server</p>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8}>
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
                paginatedUsers.map((u, idx) => (
                  <tr key={u.id}>
                    <td className="text-center">
                      <span className="fw-semibold text-muted" style={{ fontSize: '0.82rem' }}>
                        {(currentPage - 1) * pageSize + idx + 1}
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2.5">
                        <div className={`user-avatar-badge ${u.role || 'user'}`}>
                          {getInitials(u.name)}
                        </div>
                        <div className="text-truncate">
                          <div className="fw-bold text-dark text-truncate" title={`${u.title ? `${u.title} ` : ''}${u.name}`}>
                            {u.title ? `${u.title} ` : ''}{u.name}
                          </div>
                          <div className="text-muted small" style={{ fontSize: '0.73rem' }}>
                            <span className="badge bg-light text-secondary border px-1.5 py-0.5">ID: #{u.id}</span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1.5 text-dark fw-semibold small text-truncate" title={u.email}>
                        <LuMail size={13} className="text-primary flex-shrink-0" />
                        <span className="text-truncate" style={{ fontSize: '0.82rem' }}>{u.email}</span>
                      </div>
                      {u.phone && (
                        <div className="d-flex align-items-center gap-1.5 text-muted mt-1 small" style={{ fontSize: '0.76rem' }}>
                          <LuPhone size={12} className="text-muted flex-shrink-0" />
                          <span>{u.phone}</span>
                        </div>
                      )}
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1.5 small text-truncate" title={u.organization || 'Not specified'}>
                        <LuBuilding2 size={14} className="text-muted flex-shrink-0" />
                        {u.organization ? (
                          <span className="fw-medium text-dark text-truncate">{u.organization}</span>
                        ) : (
                          <span className="text-muted fst-italic">Not specified</span>
                        )}
                      </div>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${u.role === 'admin' ? 'bg-purple-subtle text-purple border border-purple' :
                          u.role === 'manager' ? 'bg-primary-subtle text-primary border border-primary' :
                            'bg-info-subtle text-info border border-info'
                        } text-uppercase px-2 py-1 rounded-pill d-inline-flex align-items-center justify-content-center gap-1`} style={{ fontSize: '0.7rem', letterSpacing: '0.04em', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {u.role === 'admin' && <LuShieldCheck size={12} className="flex-shrink-0" />}
                        <span>{u.role || 'User'}</span>
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${u.status === 'active' ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'
                        } text-uppercase px-2 py-1 rounded-pill d-inline-flex align-items-center justify-content-center`} style={{ fontSize: '0.7rem', letterSpacing: '0.04em', fontWeight: 600, whiteSpace: 'nowrap' }}>
                        <span>{u.status || 'active'}</span>
                      </span>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1.5 text-muted small text-nowrap" style={{ fontSize: '0.78rem' }}>
                        <LuCalendar size={13} className="text-muted flex-shrink-0" />
                        <span>{new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="text-center text-nowrap">
                      <div className="d-inline-flex align-items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="tbl-action-btn tbl-action-btn-edit"
                          title={`Edit ${u.name}`}
                          aria-label="Edit user"
                        >
                          <LuPencil size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(u)}
                          className="tbl-action-btn tbl-action-btn-delete"
                          title={`Delete ${u.name}`}
                          aria-label="Delete user"
                        >
                          <LuTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <Pagination
          currentPage={currentPage}
          totalItems={filteredUsers.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="users"
        />
      </div>

      {/* Edit User Modal */}
      {editTarget && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '640px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
              <div className="modal-header border-bottom py-3 px-4 d-flex justify-content-between align-items-center bg-light">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary-subtle text-primary p-2 rounded-circle">
                    <LuPencil size={16} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0 fs-6">Edit Delegate / User</h5>
                    <small className="text-muted">User ID: #{editTarget.id}</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setEditTarget(null)}
                  disabled={isUpdating}
                ></button>
              </div>

              <form onSubmit={handleUpdateUser}>
                <div className="modal-body p-4">
                  {editError && (
                    <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                      <LuCircleAlert size={16} className="flex-shrink-0" />
                      <span>{editError}</span>
                    </div>
                  )}

                  <div className="row g-3">
                    {/* Title */}
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Title</label>
                      <select
                        className="form-select shadow-none"
                        value={editForm.title}
                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                        disabled={isUpdating}
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                      </select>
                    </div>

                    {/* Full Name */}
                    <div className="col-md-9">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Full Name *</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        required
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        disabled={isUpdating}
                        placeholder="Delegate full name"
                      />
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Email Address</label>
                      <input
                        type="email"
                        className="form-control shadow-none bg-light"
                        value={editForm.email}
                        disabled
                        readOnly
                        style={{ cursor: 'not-allowed' }}
                        placeholder="email@example.com"
                      />
                    </div>

                    {/* Phone */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Phone / Mobile</label>
                      <input
                        type="tel"
                        className="form-control shadow-none"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        disabled={isUpdating}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    {/* Organization */}
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Institution / Organization</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        value={editForm.organization}
                        onChange={(e) => setEditForm({ ...editForm, organization: e.target.value })}
                        disabled={isUpdating}
                        placeholder="Hospital, University or Company"
                      />
                    </div>

                    {/* Role */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">System Role</label>
                      <select
                        className="form-select shadow-none"
                        value={editForm.role}
                        onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                        disabled={isUpdating}
                      >
                        <option value="user">User (Delegate)</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Account Status</label>
                      <select
                        className="form-select shadow-none"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                        disabled={isUpdating}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="banned">Banned (Suspended)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top py-3 px-4 d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-3 rounded-2 fw-medium shadow-none"
                    onClick={() => setEditTarget(null)}
                    disabled={isUpdating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-success px-4 rounded-2 fw-medium shadow-none d-inline-flex align-items-center gap-1.5"
                    disabled={isUpdating}
                  >
                    {isUpdating ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <LuCheck size={16} />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '640px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
              <div className="modal-header border-bottom py-3 px-4 d-flex justify-content-between align-items-center bg-light">
                <div className="d-flex align-items-center gap-2">
                  <div className="bg-primary-subtle text-primary p-2 rounded-circle">
                    <LuUserPlus size={18} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold text-dark mb-0 fs-6">Add New User / Delegate</h5>
                    <small className="text-muted">Create a new delegate account directly in the system</small>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setShowAddModal(false)}
                  disabled={isCreating}
                ></button>
              </div>

              <form onSubmit={handleCreateUser}>
                <div className="modal-body p-4">
                  {addError && (
                    <div className="alert alert-danger py-2 px-3 small rounded-3 mb-3 d-flex align-items-center gap-2">
                      <LuCircleAlert size={16} className="flex-shrink-0" />
                      <span>{addError}</span>
                    </div>
                  )}

                  <div className="row g-3">
                    {/* Title */}
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Title</label>
                      <select
                        className="form-select shadow-none"
                        value={addForm.title}
                        onChange={(e) => setAddForm({ ...addForm, title: e.target.value })}
                        disabled={isCreating}
                      >
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mrs.">Mrs.</option>
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                      </select>
                    </div>

                    {/* Full Name */}
                    <div className="col-md-9">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Full Name *</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        required
                        value={addForm.name}
                        onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                        disabled={isCreating}
                        placeholder="e.g. Dr. Ramesh Kumar"
                      />
                    </div>

                    {/* Email */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Email Address *</label>
                      <input
                        type="email"
                        className="form-control shadow-none"
                        required
                        value={addForm.email}
                        onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                        disabled={isCreating}
                        placeholder="delegate@example.com"
                      />
                    </div>

                    {/* Password */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Password *</label>
                      <div className="input-group">
                        <input
                          type={showAddPassword ? 'text' : 'password'}
                          className="form-control shadow-none"
                          required
                          minLength={6}
                          value={addForm.password}
                          onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                          disabled={isCreating}
                          placeholder="Min. 6 characters"
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary border shadow-none"
                          onClick={() => setShowAddPassword(!showAddPassword)}
                          title={showAddPassword ? 'Hide password' : 'Show password'}
                          tabIndex="-1"
                        >
                          {showAddPassword ? <LuEyeOff size={16} /> : <LuEye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Phone */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Phone / Mobile</label>
                      <input
                        type="tel"
                        className="form-control shadow-none"
                        value={addForm.phone}
                        onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                        disabled={isCreating}
                        placeholder="+91 98765 43210"
                      />
                    </div>

                    {/* Organization */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Institution / Organization</label>
                      <input
                        type="text"
                        className="form-control shadow-none"
                        value={addForm.organization}
                        onChange={(e) => setAddForm({ ...addForm, organization: e.target.value })}
                        disabled={isCreating}
                        placeholder="Hospital, University, AIIMS, etc."
                      />
                    </div>

                    {/* Role */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">System Role</label>
                      <select
                        className="form-select shadow-none"
                        value={addForm.role}
                        onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                        disabled={isCreating}
                      >
                        <option value="user">User (Delegate)</option>
                        <option value="manager">Manager</option>
                        <option value="admin">Administrator</option>
                      </select>
                    </div>

                    {/* Status */}
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold text-muted text-uppercase">Account Status</label>
                      <select
                        className="form-select shadow-none"
                        value={addForm.status}
                        onChange={(e) => setAddForm({ ...addForm, status: e.target.value })}
                        disabled={isCreating}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="banned">Banned (Suspended)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light border-top py-3 px-4 d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-outline-secondary px-3 rounded-2 fw-medium shadow-none"
                    onClick={() => setShowAddModal(false)}
                    disabled={isCreating}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary px-4 rounded-2 fw-medium shadow-none d-inline-flex align-items-center gap-1.5"
                    disabled={isCreating}
                  >
                    {isCreating ? (
                      <>
                        <span className="spinner-border spinner-border-sm" role="status"></span>
                        <span>Creating User...</span>
                      </>
                    ) : (
                      <>
                        <LuUserPlus size={16} />
                        <span>Create User</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Confirmation Modal */}
      {deleteTarget && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
              <div className="modal-header border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold text-dark mb-0 fs-6">Delete User Account</h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                ></button>
              </div>

              <div className="modal-body p-4">
                <p className="text-secondary mb-3">
                  Are you sure you want to permanently delete this delegate/user account?
                </p>

                <div className="bg-light p-3 rounded-3 border mb-3">
                  <div className="d-flex align-items-center gap-3 mb-2">
                    <div className={`user-avatar-badge ${deleteTarget.role || 'user'}`}>
                      {getInitials(deleteTarget.name)}
                    </div>
                    <div>
                      <div className="fw-bold text-dark">{deleteTarget.title ? `${deleteTarget.title} ` : ''}{deleteTarget.name}</div>
                      <div className="text-muted small">{deleteTarget.email}</div>
                    </div>
                  </div>
                  <div className="d-flex gap-2 mt-2">
                    <span className="badge bg-secondary-subtle text-secondary border px-2 py-1">ID: #{deleteTarget.id}</span>
                    <span className={`badge ${deleteTarget.role === 'admin' ? 'bg-purple-subtle text-purple border border-purple' :
                        deleteTarget.role === 'manager' ? 'bg-primary-subtle text-primary border border-primary' :
                          'bg-info-subtle text-info border border-info'
                      } px-2 py-1 text-uppercase d-inline-flex align-items-center gap-1`}>
                      {deleteTarget.role === 'admin' && <LuShieldCheck size={12} />}
                      <span>{deleteTarget.role || 'user'}</span>
                    </span>
                  </div>
                </div>

                <div className="alert alert-warning border-warning-subtle small mb-0 rounded-3">
                  <strong>Warning:</strong> This will also remove any registrations, uploaded abstracts, and invoices linked to this user from the database. This action cannot be undone.
                </div>
              </div>

              <div className="modal-footer bg-light border-0 py-3 px-4 d-flex justify-content-end gap-2">
                <button
                  type="button"
                  className="btn btn-outline-secondary px-3 rounded-2 fw-medium shadow-none"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger px-4 rounded-2 fw-medium shadow-none"
                  onClick={handleDeleteUser}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsersPage;
