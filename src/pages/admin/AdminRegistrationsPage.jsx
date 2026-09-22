import React, { useEffect, useState } from 'react';
import { 
  LuSearch, 
  LuRefreshCw, 
  LuCheck, 
  LuClipboardList,
  LuSlidersHorizontal,
  LuX
} from 'react-icons/lu';
import { adminApi } from '../../services/api';
import Pagination from '../../components/Common/Pagination';

const AdminRegistrationsPage = () => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');
  const [selectedReg, setSelectedReg] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState({
    status: '',
    paymentStatus: ''
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.payment_status = paymentFilter;

      const res = await adminApi.getRegistrations(params);
      if (res.status && res.data) {
        setRegistrations(res.data);
      }
    } catch (err) {
      console.error('Error loading registrations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
    loadRegistrations();
  }, [statusFilter, paymentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadRegistrations();
  };

  const handleStatusUpdate = async () => {
    if (!selectedReg) return;
    try {
      setUpdating(true);
      await adminApi.updateRegistrationStatus(selectedReg.id, updateStatus);
      setSelectedReg(null);
      await loadRegistrations();
    } catch (err) {
      alert(err.message || 'Failed to update registration status');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const paginatedRegistrations = registrations.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="dashboard-page-container w-100">
      {/* 1. Header Banner */}
      <div className="dashboard-card-section mb-4">
        <div className="dashboard-card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 bg-primary-subtle text-primary rounded-3">
              <LuClipboardList size={24} />
            </div>
            <div>
              <h2 className="dashboard-card-title mb-1">Conference Registrations</h2>
              <p className="text-muted small mb-0">Manage delegate registrations, payments, and order statuses</p>
            </div>
          </div>
          <button
            onClick={loadRegistrations}
            disabled={loading}
            className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-none"
          >
            <LuRefreshCw className={loading ? 'fa-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3 bg-light border-top border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-md-6 col-12">
              <form onSubmit={handleSearchSubmit} className="d-flex gap-2">
                <div className="search-input-box">
                  <span className="input-icon">
                    <LuSearch size={18} />
                  </span>
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, code, organization..."
                    className="form-control shadow-none"
                  />
                </div>
                <button type="submit" className="btn btn-primary px-3 text-nowrap shadow-none">
                  Search
                </button>
              </form>
            </div>

            <div className="col-md-6 col-12 d-flex justify-content-md-end gap-2">
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="form-select form-select-sm w-auto shadow-none"
              >
                <option value="">All Payments</option>
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select form-select-sm w-auto shadow-none"
              >
                <option value="">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="submitted">Submitted</option>
                <option value="draft">Draft</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="activity-table-container">
          <table className="spctt-table w-100">
            <thead>
              <tr>
                <th style={{ width: '12%' }}>Reg Code</th>
                <th style={{ width: '22%' }}>Delegate Details</th>
                <th style={{ width: '15%' }}>Category</th>
                <th style={{ width: '18%' }}>Organization</th>
                <th className="text-end" style={{ width: '11%' }}>Grand Total</th>
                <th className="text-center" style={{ width: '8%' }}>Payment</th>
                <th className="text-center" style={{ width: '8%' }}>Status</th>
                <th className="text-center" style={{ width: '6%' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="table-empty-state py-5">
                      <div className="spinner-border text-primary mb-3" style={{ width: '2.2rem', height: '2.2rem' }}></div>
                      <h6 className="table-empty-title mb-1">Loading Delegate Registrations...</h6>
                      <p className="table-empty-desc">Fetching conference registrations from server</p>
                    </div>
                  </td>
                </tr>
              ) : registrations.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="table-empty-state">
                      <div className="table-empty-icon-box">
                        <LuClipboardList size={26} />
                      </div>
                      <h5 className="table-empty-title">No Registrations Found</h5>
                      <p className="table-empty-desc">
                        {search || statusFilter || paymentFilter
                          ? "No delegate registrations match your filter or search query."
                          : "No delegate registrations have been recorded yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map((reg) => (
                  <tr key={reg.id}>
                    <td>
                      <span className="badge bg-light text-primary border font-monospace px-2 py-1">
                        {reg.registration_code}
                      </span>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">{reg.title || ''} {reg.full_name || 'Delegate'}</div>
                      <div className="text-muted small">{reg.email}</div>
                      {reg.phone && <div className="text-muted" style={{ fontSize: '0.72rem' }}>{reg.phone}</div>}
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{reg.category_name || 'Standard'}</div>
                      {reg.accompanying_count > 0 && (
                        <span className="badge bg-purple-subtle text-purple mt-1" style={{ fontSize: '0.68rem' }}>
                          +{reg.accompanying_count} Accompanying
                        </span>
                      )}
                    </td>
                    <td className="text-muted small">
                      {reg.organization || '—'}
                    </td>
                    <td className="text-end fw-bold text-dark">
                      {formatCurrency(reg.grand_total)}
                    </td>
                    <td className="text-center">
                      <span className={`badge ${
                        reg.payment_status === 'paid'
                          ? 'bg-success-subtle text-success border border-success'
                          : 'bg-warning-subtle text-warning border border-warning'
                      } text-uppercase px-2.5 py-1 rounded-pill`} style={{ fontSize: '0.68rem', letterSpacing: '0.04em', fontWeight: 700 }}>
                        {reg.payment_status}
                      </span>
                    </td>
                    <td className="text-center">
                      <span className={`badge ${
                        reg.status === 'confirmed' ? 'bg-primary-subtle text-primary border border-primary' :
                        reg.status === 'draft' ? 'bg-light text-muted border' :
                        'bg-info-subtle text-info border border-info'
                      } text-uppercase px-2.5 py-1 rounded-pill`} style={{ fontSize: '0.68rem', letterSpacing: '0.04em', fontWeight: 700 }}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="text-center text-nowrap">
                      <button
                        onClick={() => {
                          setSelectedReg(reg);
                          setUpdateStatus({
                            status: reg.status,
                            paymentStatus: reg.payment_status
                          });
                        }}
                        className="btn btn-outline-primary btn-sm px-3 py-1.5 rounded-2 d-inline-flex align-items-center gap-1.5 shadow-none"
                        style={{ fontSize: '0.78rem', fontWeight: 500 }}
                      >
                        Edit
                      </button>
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
          totalItems={registrations.length}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          onPageSizeChange={(newSize) => {
            setPageSize(newSize);
            setCurrentPage(1);
          }}
          itemLabel="registrations"
        />
      </div>

      {/* Edit Status Modal */}
      {selectedReg && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg border-0">
              <div className="modal-header border-bottom">
                <div>
                  <h5 className="modal-title fw-bold">Update Status</h5>
                  <p className="text-muted small mb-0">{selectedReg.registration_code} — {selectedReg.full_name}</p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedReg(null)}
                ></button>
              </div>

              <div className="modal-body p-4 space-y-3">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase">Registration Status</label>
                  <select
                    value={updateStatus.status}
                    onChange={(e) => setUpdateStatus({ ...updateStatus, status: e.target.value })}
                    className="form-select"
                  >
                    <option value="draft">Draft</option>
                    <option value="submitted">Submitted</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase">Payment Status</label>
                  <select
                    value={updateStatus.paymentStatus}
                    onChange={(e) => setUpdateStatus({ ...updateStatus, paymentStatus: e.target.value })}
                    className="form-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  onClick={() => setSelectedReg(null)}
                  className="btn btn-light"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="btn btn-primary px-4"
                >
                  {updating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrationsPage;
