import React, { useEffect, useState, useRef } from 'react';
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
  LuDownload,
  LuArrowUp,
  LuArrowDown,
  LuArrowUpDown,
  LuSlidersHorizontal,
  LuHash,
  LuFilter
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

  // Sorting state (ascending / descending)
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc'); // 'asc' or 'desc'

  // Search category state & popup
  const [searchCategory, setSearchCategory] = useState('all'); // 'all', 'id', 'name', 'email', 'phone', 'organization'
  const [showSearchMenu, setShowSearchMenu] = useState(false);
  const searchContainerRef = useRef(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

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

  const loadUsers = async (customPage = currentPage, customSearch = search) => {
    try {
      setLoading(true);
      const params = {
        page: customPage,
        limit: pageSize,
        sortField,
        sortOrder
      };
      if (customSearch && customSearch.trim()) {
        params.search = customSearch.trim();
        if (searchCategory && searchCategory !== 'all') {
          params.searchCategory = searchCategory;
        }
      }
      if (roleFilter) {
        params.role = roleFilter;
      }

      const res = await adminApi.getUsers(params);
      if (res && res.status && res.data) {
        setUsers(res.data);
        if (res.pagination) {
          setTotalItems(res.pagination.total);
        } else {
          setTotalItems(res.data.length);
        }
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
    loadUsers(currentPage);
  }, [currentPage, pageSize, roleFilter, sortField, sortOrder, searchCategory]);

  // Handle outside click for search suggestions menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
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

  const handleSearchSubmit = (e) => {
    if (e) e.preventDefault();
    if (currentPage === 1) {
      loadUsers(1, search);
    } else {
      setCurrentPage(1);
    }
    setShowSearchMenu(false);
  };

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  // Dynamic suggestions for search popup
  const suggestedUsers = users.slice(0, 6);

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
      <div className="dashboard-card-section mb-3">
        <div className="dashboard-card-header bg-white py-2.5 px-3 d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="d-flex align-items-center gap-2.5">
            <div className="p-2 bg-success-subtle text-success rounded-3">
              <LuUsers size={22} />
            </div>
            <div>
              <h2 className="dashboard-card-title mb-0.5 fs-5">Registered Delegates & Users</h2>
              <p className="text-muted small mb-0" style={{ fontSize: '0.78rem' }}>Directory of registered accounts, institutional details, and system roles</p>
            </div>
          </div>
          <div className="d-flex align-items-center gap-1.5">
            <button
              onClick={handleExportExcel}
              disabled={exporting || loading}
              className="spctt-outline-btn py-1 px-2.5"
              style={{ fontSize: '0.82rem' }}
              title="Export Users to Excel (.xlsx)"
            >
              <LuDownload className={exporting ? 'fa-spin' : ''} size={14} />
              <span>{exporting ? 'Exporting...' : 'Export List'}</span>
            </button>
            <button
              onClick={handleOpenAdd}
              className="spctt-primary-btn py-1 px-2.5"
              style={{ fontSize: '0.82rem' }}
            >
              <LuUserPlus size={14} />
              <span>Add New User</span>
            </button>
            <button
              onClick={loadUsers}
              disabled={loading}
              className="spctt-outline-btn py-1 px-2.5"
              style={{ fontSize: '0.82rem' }}
            >
              <LuRefreshCw className={loading ? 'fa-spin' : ''} size={14} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Search & Sort Toolbar */}
        <div className="p-2.5 bg-light border-top border-bottom">
          <div className="row g-2 align-items-center">
            {/* Search Input Box with Tap-to-Open Menu & Search Button */}
            <div className="col-lg-7 col-md-12 col-12">
              <form onSubmit={handleSearchSubmit} className="d-flex align-items-center gap-1.5 w-100">
                <div className="position-relative flex-grow-1" ref={searchContainerRef}>
                  <div className="search-input-box position-relative">
                    <span className="input-icon">
                      <LuSearch size={18} />
                    </span>
                    <input
                      type="text"
                      value={search}
                      onFocus={() => setShowSearchMenu(true)}
                      onClick={() => setShowSearchMenu(true)}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                        setShowSearchMenu(true);
                      }}
                      placeholder={
                        searchCategory === 'id'
                          ? 'Search by User ID (e.g. 1, 25, #10)...'
                          : searchCategory === 'name'
                          ? 'Search by Delegate Name...'
                          : searchCategory === 'email'
                          ? 'Search by Email Address...'
                          : searchCategory === 'phone'
                          ? 'Search by Phone Number...'
                          : searchCategory === 'organization'
                          ? 'Search by Institution / Organization...'
                          : 'Search delegates by name, ID, email, institution, phone...'
                      }
                      className="form-control shadow-none pe-5"
                    />
                    {search && (
                      <button
                        type="button"
                        className="btn btn-link p-0 text-muted position-absolute end-0 top-50 translate-middle-y me-3 text-decoration-none"
                        style={{ zIndex: 5 }}
                        onClick={() => {
                          setSearch('');
                          setCurrentPage(1);
                        }}
                        title="Clear search"
                      >
                        <LuX size={16} />
                      </button>
                    )}
                  </div>

                  {/* Tap / Dropdown Menu on Search Click */}
                  {showSearchMenu && (
                    <div
                      className="position-absolute start-0 end-0 bg-white border shadow-lg rounded-3 p-3 mt-1"
                      style={{ zIndex: 1050, maxHeight: '380px', overflowY: 'auto' }}
                    >
                      {/* Section 1: Search Category Tabs */}
                      <div className="mb-3">
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                            Search In Field:
                          </span>
                          {searchCategory !== 'all' && (
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 text-decoration-none text-primary"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => setSearchCategory('all')}
                            >
                              Reset to All
                            </button>
                          )}
                        </div>
                        <div className="d-flex flex-wrap gap-1.5">
                          {[
                            { id: 'all', label: 'All Fields', icon: LuFilter },
                            { id: 'id', label: 'User ID', icon: LuHash },
                            { id: 'name', label: 'Name', icon: LuUsers },
                            { id: 'email', label: 'Email', icon: LuMail },
                            { id: 'organization', label: 'Institution', icon: LuBuilding2 },
                            { id: 'phone', label: 'Phone', icon: LuPhone },
                          ].map((cat) => {
                            const Icon = cat.icon;
                            const isActive = searchCategory === cat.id;
                            return (
                              <button
                                key={cat.id}
                                type="button"
                                onClick={() => {
                                  setSearchCategory(cat.id);
                                  setCurrentPage(1);
                                }}
                                className={`btn btn-sm d-inline-flex align-items-center gap-1 px-2.5 py-1 rounded-pill ${
                                  isActive
                                    ? 'btn-primary text-white shadow-sm'
                                    : 'btn-light border text-secondary'
                                }`}
                                style={{ fontSize: '0.78rem', fontWeight: isActive ? 600 : 500 }}
                              >
                                <Icon size={13} />
                                <span>{cat.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Section 2: Quick Suggestions / Matching Items */}
                      <div>
                        <div className="d-flex align-items-center justify-content-between mb-2">
                          <span className="text-muted text-uppercase fw-bold" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                            {search.trim() ? `Matching Users (${suggestedUsers.length})` : 'Recent / Suggested Users:'}
                          </span>
                          <span className="text-muted" style={{ fontSize: '0.72rem' }}>
                            Tap item to search
                          </span>
                        </div>

                        {suggestedUsers.length === 0 ? (
                          <div className="text-center py-3 text-muted small">
                            No matching delegates found for "<strong>{search}</strong>"
                          </div>
                        ) : (
                          <div className="d-flex flex-column gap-1">
                            {suggestedUsers.map((u) => (
                              <div
                                key={u.id}
                                onClick={() => {
                                  if (searchCategory === 'id') {
                                    setSearch(String(u.id));
                                  } else {
                                    setSearch(u.name || String(u.id));
                                  }
                                  setShowSearchMenu(false);
                                  setCurrentPage(1);
                                }}
                                className="d-flex align-items-center justify-content-between p-2 rounded-2 border border-light bg-light bg-opacity-50 text-decoration-none text-dark transition-all"
                                style={{ cursor: 'pointer' }}
                                role="button"
                              >
                                <div className="d-flex align-items-center gap-2 overflow-hidden">
                                  <span className="badge bg-light text-primary border font-monospace fw-bold px-1.5 py-1" style={{ fontSize: '0.75rem' }}>
                                    #{u.id}
                                  </span>
                                  <div className="text-truncate">
                                    <span className="fw-semibold small d-block text-truncate">
                                      {u.title ? `${u.title} ` : ''}{u.name}
                                    </span>
                                    <span className="text-muted text-truncate d-block" style={{ fontSize: '0.74rem' }}>
                                      {u.email} {u.organization ? `• ${u.organization}` : ''}
                                    </span>
                                  </div>
                                </div>
                                <span className="badge bg-primary-subtle text-primary border border-primary-subtle small px-2 py-0.5 ms-2 flex-shrink-0" style={{ fontSize: '0.7rem' }}>
                                  Tap to select
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Explicit Search Button */}
                <button
                  type="submit"
                  className="btn btn-primary px-3 text-nowrap shadow-none d-inline-flex align-items-center gap-1.5"
                  style={{ height: '34px', fontSize: '0.82rem', fontWeight: 600, borderRadius: '6px' }}
                >
                  <LuSearch size={14} />
                  <span>Search</span>
                </button>
              </form>
            </div>

            {/* Sort & Role Controls */}
            <div className="col-lg-5 col-md-12 col-12 d-flex flex-wrap align-items-center justify-content-lg-end gap-2">
              {/* Ascending / Descending User ID Button */}
              <button
                type="button"
                onClick={() => {
                  setSortField('id');
                  setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
                }}
                className="btn btn-sm btn-white bg-white border d-flex align-items-center gap-1.5 shadow-none px-2.5 py-1"
                style={{ height: '34px', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}
                title={`Sort by User ID: Current is ${sortOrder === 'asc' ? 'Ascending (1 → 9)' : 'Descending (9 → 1)'}. Click to switch.`}
              >
                {sortOrder === 'asc' && sortField === 'id' ? (
                  <>
                    <LuArrowUp size={14} className="text-primary" />
                    <span>User ID: Ascending (1 → 9)</span>
                  </>
                ) : (
                  <>
                    <LuArrowDown size={14} className="text-primary" />
                    <span>User ID: Descending (9 → 1)</span>
                  </>
                )}
              </button>

              <select
                value={roleFilter}
                onChange={(e) => {
                  setRoleFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="form-select form-select-sm w-auto shadow-none"
                style={{ height: '34px', minWidth: '130px' }}
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
        <div className="activity-table-container table-responsive">
          <table className="spctt-table align-middle w-100">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th className="py-3 px-1 text-center" style={{ width: '45px', minWidth: '40px' }}>S.No</th>
                <th
                  className="py-3 px-2 text-center user-select-none"
                  style={{ width: '80px', cursor: 'pointer' }}
                  onClick={() => toggleSort('id')}
                  title="Click to sort by User ID (Ascending / Descending)"
                >
                  <div className="d-inline-flex align-items-center gap-1 justify-content-center">
                    <span>User ID</span>
                    {sortField === 'id' ? (
                      sortOrder === 'asc' ? <LuArrowUp size={13} className="text-primary" /> : <LuArrowDown size={13} className="text-primary" />
                    ) : (
                      <LuArrowUpDown size={12} className="text-muted opacity-50" />
                    )}
                  </div>
                </th>
                <th
                  className="py-3 px-2 user-select-none"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleSort('name')}
                  title="Click to sort by Name"
                >
                  <div className="d-inline-flex align-items-center gap-1">
                    <span>Delegate Profile</span>
                    {sortField === 'name' ? (
                      sortOrder === 'asc' ? <LuArrowUp size={13} className="text-primary" /> : <LuArrowDown size={13} className="text-primary" />
                    ) : (
                      <LuArrowUpDown size={12} className="text-muted opacity-50" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-2">Contact Details</th>
                <th className="py-3 px-2">Institution / Organization</th>
                <th className="py-3 px-1 text-center" style={{ width: '80px' }}>Role</th>
                <th className="py-3 px-1 text-center" style={{ width: '80px' }}>Status</th>
                <th
                  className="py-3 px-2 text-center user-select-none"
                  style={{ width: '105px', cursor: 'pointer' }}
                  onClick={() => toggleSort('created_at')}
                  title="Click to sort by Registered Date"
                >
                  <div className="d-inline-flex align-items-center gap-1 justify-content-center">
                    <span>Reg. Date</span>
                    {sortField === 'created_at' ? (
                      sortOrder === 'asc' ? <LuArrowUp size={13} className="text-primary" /> : <LuArrowDown size={13} className="text-primary" />
                    ) : (
                      <LuArrowUpDown size={12} className="text-muted opacity-50" />
                    )}
                  </div>
                </th>
                <th className="py-3 px-2 text-center" style={{ width: '80px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9}>
                    <div className="table-empty-state py-4 text-center">
                      <div className="spinner-border text-primary mb-2" style={{ width: '2rem', height: '2rem' }}></div>
                      <h6 className="table-empty-title mb-1">Loading Registered Users...</h6>
                      <p className="table-empty-desc small text-muted">Fetching user directory from server</p>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={9}>
                    <div className="table-empty-state text-center py-4">
                      <div className="table-empty-icon-box mb-2" style={{ background: 'rgba(71, 110, 172, 0.1)', color: 'var(--spctt-primary)' }}>
                        <LuUsers size={24} />
                      </div>
                      <h5 className="table-empty-title mb-1">No Users Found</h5>
                      <p className="table-empty-desc small text-muted">
                        {search || roleFilter
                          ? "No registered accounts match your current search terms or role filter."
                          : "No delegate accounts have been created yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                users.map((u, idx) => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #eef2f6' }}>
                    <td className="py-3 px-1 align-middle text-center">
                      <span className="fw-semibold text-muted" style={{ fontSize: '0.82rem' }}>
                        {(currentPage - 1) * pageSize + idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-2 align-middle text-center text-nowrap">
                      <span className="badge bg-light text-primary border font-monospace px-2 py-1" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                        #{u.id}
                      </span>
                    </td>
                    <td className="py-3 px-2 align-middle">
                      <div className="d-flex align-items-center gap-2">
                        <div className={`user-avatar-badge ${u.role || 'user'}`} style={{ width: '32px', height: '32px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {getInitials(u.name)}
                        </div>
                        <div className="text-truncate" style={{ maxWidth: '170px' }}>
                          <div className="fw-bold text-dark text-truncate" title={`${u.title ? `${u.title} ` : ''}${u.name}`} style={{ fontSize: '0.86rem', lineHeight: '1.35', marginBottom: '2px' }}>
                            {u.title ? `${u.title} ` : ''}{u.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2 align-middle">
                      <div className="text-truncate" style={{ maxWidth: '175px' }}>
                        <div className="d-flex align-items-center gap-1 text-dark fw-medium text-truncate" title={u.email} style={{ fontSize: '0.80rem' }}>
                          <LuMail size={13} className="text-primary flex-shrink-0" />
                          <span className="text-truncate">{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="d-flex align-items-center gap-1 text-muted small text-truncate mt-0.5" style={{ fontSize: '0.75rem' }}>
                            <LuPhone size={12} className="text-muted flex-shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2 align-middle">
                      <div className="d-flex align-items-center gap-1.5 text-truncate" style={{ maxWidth: '160px' }} title={u.organization || 'Not specified'}>
                        <LuBuilding2 size={13} className="text-muted flex-shrink-0" />
                        {u.organization ? (
                          <span className="text-dark text-truncate" style={{ fontSize: '0.80rem', lineHeight: '1.3', color: '#475569' }}>{u.organization}</span>
                        ) : (
                          <span className="text-muted fst-italic" style={{ fontSize: '0.75rem' }}>Not specified</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-1 align-middle text-center">
                      <span className={`badge ${u.role === 'admin' ? 'bg-purple-subtle text-purple border border-purple' :
                          u.role === 'manager' ? 'bg-primary-subtle text-primary border border-primary' :
                            'bg-info-subtle text-info border border-info'
                        } text-uppercase px-2 py-1 rounded-pill d-inline-flex align-items-center justify-content-center gap-1`} style={{ fontSize: '0.68rem', letterSpacing: '0.03em', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        {u.role === 'admin' && <LuShieldCheck size={11} className="flex-shrink-0" />}
                        <span>{u.role || 'User'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-1 align-middle text-center">
                      <span className={`badge ${u.status === 'active' ? 'bg-success-subtle text-success border border-success' : 'bg-danger-subtle text-danger border border-danger'
                        } text-uppercase px-2 py-1 rounded-pill d-inline-flex align-items-center justify-content-center`} style={{ fontSize: '0.68rem', letterSpacing: '0.03em', fontWeight: 700, whiteSpace: 'nowrap' }}>
                        <span>{u.status || 'active'}</span>
                      </span>
                    </td>
                    <td className="py-3 px-2 align-middle text-center">
                      <div className="d-inline-flex align-items-center gap-1 text-muted text-nowrap" style={{ fontSize: '0.75rem' }}>
                        <LuCalendar size={13} className="text-muted flex-shrink-0" />
                        <span>{new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 align-middle text-center text-nowrap">
                      <div className="d-inline-flex align-items-center justify-content-center" style={{ gap: '4px' }}>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(u)}
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center rounded-2 shadow-none"
                          style={{ width: '30px', height: '30px', padding: 0 }}
                          title={`Edit ${u.name}`}
                          aria-label="Edit user"
                        >
                          <LuPencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(u)}
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center rounded-2 shadow-none"
                          style={{ width: '30px', height: '30px', padding: 0 }}
                          title={`Delete ${u.name}`}
                          aria-label="Delete user"
                        >
                          <LuTrash2 size={13} />
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
          totalItems={totalItems}
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
