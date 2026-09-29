import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LuSearch, 
  LuRefreshCw, 
  LuCheck, 
  LuTriangleAlert,
  LuClipboardList,
  LuSlidersHorizontal,
  LuDownload,
  LuCreditCard,
  LuFileText,
  LuClock,
  LuInfo
} from 'react-icons/lu';
import { adminApi } from '../../services/api';
import { downloadBlobFile } from '../../services/api/adminApi';
import Pagination from '../../components/Common/Pagination';

const AdminRegistrationsPage = () => {
  const navigate = useNavigate();
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('');

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

  const handleExportExcel = async () => {
    try {
      setExporting(true);
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (paymentFilter) params.payment_status = paymentFilter;

      const blobData = await adminApi.exportRegistrations(params);
      const dateStr = new Date().toISOString().split('T')[0];
      downloadBlobFile(blobData, `SPCTT_Registrations_${dateStr}.xlsx`);
      setNotification({
        type: 'success',
        message: 'Registrations exported to Excel (.xlsx) successfully!'
      });
    } catch (err) {
      console.error('Error exporting registrations:', err);
      setNotification({
        type: 'danger',
        message: 'Failed to export registrations to Excel. Please try again.'
      });
    } finally {
      setExporting(false);
      setTimeout(() => {
        setNotification(null);
      }, 4000);
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
      {/* Compact Floating Toast Notification */}
      {notification && (
        <div 
          className="position-fixed top-0 start-50 translate-middle-x p-3" 
          style={{ zIndex: 9999, minWidth: '320px', maxWidth: '480px', pointerEvents: 'none' }}
        >
          <div 
            className={`alert alert-${notification.type} shadow-lg rounded-3 mb-0 d-flex align-items-center justify-content-between py-2 px-3 border`}
            role="alert"
            style={{ 
              pointerEvents: 'auto', 
              animation: 'fadeIn 0.25s ease-in-out',
              backdropFilter: 'blur(8px)', 
              fontSize: '0.85rem'
            }}
          >
            <div className="d-flex align-items-center gap-2">
              {notification.type === 'success' ? (
                <LuCheck size={16} className="text-success flex-shrink-0" />
              ) : (
                <LuTriangleAlert size={16} className="text-danger flex-shrink-0" />
              )}
              <span className="fw-semibold">{notification.message}</span>
            </div>
            <button 
              type="button" 
              className="btn-close btn-sm shadow-none ms-2" 
              style={{ fontSize: '0.65rem' }} 
              onClick={() => setNotification(null)}
              aria-label="Close"
            ></button>
          </div>
        </div>
      )}

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
          <div className="d-flex align-items-center gap-2">
            <button
              onClick={handleExportExcel}
              disabled={exporting || loading}
              className="spctt-outline-btn"
              title="Export Registrations to Excel (.xlsx)"
            >
              <LuDownload className={exporting ? 'fa-spin' : ''} size={15} />
              <span>{exporting ? 'Exporting...' : 'Export List'}</span>
            </button>
            <button
              onClick={loadRegistrations}
              disabled={loading}
              className="spctt-primary-btn"
            >
              <LuRefreshCw className={loading ? 'fa-spin' : ''} size={15} />
              <span>Refresh</span>
            </button>
          </div>
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
              <div className="d-flex align-items-center gap-2">
                <LuSlidersHorizontal size={16} className="text-muted" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select form-select-sm shadow-none"
                  style={{ width: '150px' }}
                >
                  <option value="">All Statuses</option>
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="form-select form-select-sm shadow-none"
                  style={{ width: '160px' }}
                >
                  <option value="">All Payments</option>
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="table-responsive">
          <table className="spctt-table align-middle">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Reg. Code</th>
                <th>Delegate Info</th>
                <th>Category</th>
                <th>Organization</th>
                <th className="text-end">Amount</th>
                <th className="text-center">Payment Status</th>
                <th className="text-center">Status</th>
                <th className="text-center" style={{ width: '110px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="9" className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div className="text-muted mt-2 small">Loading registrations...</div>
                  </td>
                </tr>
              ) : paginatedRegistrations.length === 0 ? (
                <tr>
                  <td colSpan="9" className="text-center py-5 text-muted">
                    <LuClipboardList size={36} className="text-muted mb-2 opacity-50" />
                    <p className="mb-0">No registrations found matching the filters.</p>
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map((reg) => (
                  <tr key={reg.id}>
                    <td className="text-muted font-monospace small">#{reg.id}</td>
                    <td>
                      <span className="badge bg-light text-primary border font-monospace fw-bold px-2 py-1">
                        {reg.registration_code}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">
                        {reg.title || ''} {reg.full_name}
                      </div>
                      <div className="text-muted small">{reg.email}</div>
                      {reg.phone && <div className="text-muted small opacity-75">{reg.phone}</div>}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">
                        {reg.category_name || 'Standard'}
                      </span>
                      {reg.accompanying_count > 0 && (
                        <span className="badge bg-purple-subtle text-purple mt-1 d-block" style={{ fontSize: '0.68rem', width: 'fit-content' }}>
                          +{reg.accompanying_count} Accompanying
                        </span>
                      )}
                    </td>
                    <td className="text-muted small">
                      {reg.organization || '—'}
                    </td>
                    <td className="text-end fw-bold text-dark">
                      <div>{formatCurrency(reg.total_payable || (parseFloat(reg.grand_total || 0) * 1.045))}</div>
                    </td>
                    <td className="text-center">
                      <span 
                        className="badge text-uppercase px-2.5 py-1 rounded-pill" 
                        style={{ 
                          fontSize: '0.68rem', 
                          letterSpacing: '0.04em', 
                          fontWeight: 700,
                          backgroundColor: reg.payment_status === 'paid' ? '#16a34a' : reg.payment_status === 'refunded' ? '#7c3aed' : reg.payment_status === 'failed' ? '#dc2626' : '#d97706',
                          color: '#ffffff'
                        }}
                      >
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
                        onClick={() => navigate(`/admin/registration/${reg.id}`)}
                        className="btn btn-outline-primary btn-sm px-3 py-1.5 rounded-2 d-inline-flex align-items-center gap-1.5 shadow-none"
                        style={{ fontSize: '0.78rem', fontWeight: 600 }}
                      >
                        <LuClipboardList size={14} />
                        <span>Manage</span>
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
    </div>
  );
};

export default AdminRegistrationsPage;
