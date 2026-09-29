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
  LuInfo,
  LuArrowUpDown,
  LuArrowUp,
  LuArrowDown,
  LuMail
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

  // Sorting state (ascending / descending)
  const [sortField, setSortField] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

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

  const sortedRegistrations = [...registrations].sort((a, b) => {
    let valA = a[sortField];
    let valB = b[sortField];

    if (sortField === 'id') {
      valA = Number(valA || 0);
      valB = Number(valB || 0);
    } else if (sortField === 'amount') {
      valA = parseFloat(a.total_payable || (parseFloat(a.grand_total || 0) * 1.045) || 0);
      valB = parseFloat(b.total_payable || (parseFloat(b.grand_total || 0) * 1.045) || 0);
    } else if (sortField === 'delegate') {
      valA = `${a.title || ''} ${a.full_name || ''}`.trim().toLowerCase();
      valB = `${b.title || ''} ${b.full_name || ''}`.trim().toLowerCase();
    } else {
      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();
    }

    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  const paginatedRegistrations = sortedRegistrations.slice(
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
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <LuSlidersHorizontal size={16} className="text-muted flex-shrink-0" />

                {/* Ascending / Descending Order Button */}
                <button
                  type="button"
                  onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
                  className="btn btn-sm btn-white bg-white border d-flex align-items-center gap-1.5 shadow-none px-2.5 py-1"
                  style={{ height: '31px', fontSize: '0.82rem', fontWeight: 600, color: '#334155' }}
                  title={`Current: ${sortOrder === 'asc' ? 'Ascending (Oldest / 1 → 9)' : 'Descending (Newest / 9 → 1)'}. Click to switch.`}
                >
                  {sortOrder === 'asc' ? (
                    <>
                      <LuArrowUp size={14} className="text-primary" />
                      <span>Ascending (1 → 9)</span>
                    </>
                  ) : (
                    <>
                      <LuArrowDown size={14} className="text-primary" />
                      <span>Descending (9 → 1)</span>
                    </>
                  )}
                </button>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="form-select form-select-sm shadow-none"
                  style={{ width: '135px' }}
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
                  style={{ width: '145px' }}
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
        <div className="activity-table-container table-responsive">
          <table className="spctt-table align-middle w-100">
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th className="py-3 px-1 text-center" style={{ width: '45px', minWidth: '40px' }}>ID</th>
                <th className="py-3 px-2 text-center text-nowrap" style={{ width: '95px' }}>Reg. Code</th>
                <th className="py-3 px-2" style={{ minWidth: '150px' }}>Delegate Info</th>
                <th className="py-3 px-2" style={{ minWidth: '160px' }}>Email</th>
                <th className="py-3 px-1 text-center" style={{ width: '130px' }}>Category</th>
                <th className="py-3 px-2" style={{ minWidth: '110px' }}>Organization</th>
                <th className="py-3 px-2 text-end" style={{ width: '90px' }}>Amount</th>
                <th className="py-3 px-1 text-center" style={{ width: '85px' }}>Payment</th>
                <th className="py-3 px-1 text-center" style={{ width: '85px' }}>Status</th>
                <th className="py-3 px-2 text-center" style={{ width: '90px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10}>
                    <div className="table-empty-state py-4 text-center">
                      <div className="spinner-border text-primary mb-2" style={{ width: '2rem', height: '2rem' }}></div>
                      <h6 className="table-empty-title mb-1">Loading Conference Registrations...</h6>
                      <p className="table-empty-desc small text-muted">Fetching registration directory from server</p>
                    </div>
                  </td>
                </tr>
              ) : paginatedRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={10}>
                    <div className="table-empty-state text-center py-4">
                      <div className="table-empty-icon-box mb-2" style={{ background: 'rgba(71, 110, 172, 0.1)', color: 'var(--spctt-primary)' }}>
                        <LuClipboardList size={24} />
                      </div>
                      <h5 className="table-empty-title mb-1">No Registrations Found</h5>
                      <p className="table-empty-desc small text-muted">No registrations found matching the current search filters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedRegistrations.map((reg) => (
                  <tr key={reg.id} style={{ borderBottom: '1px solid #eef2f6' }}>
                    <td className="py-3 px-1 align-middle text-center">
                      <span className="fw-semibold text-muted" style={{ fontSize: '0.82rem' }}>
                        #{reg.id}
                      </span>
                    </td>
                    <td className="py-3 px-2 align-middle text-center text-nowrap">
                      {reg.registration_code ? (
                        <span className="badge bg-light text-primary border font-monospace px-2 py-1" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                          {reg.registration_code}
                        </span>
                      ) : (
                        <span className="text-muted small fst-italic px-1" style={{ fontSize: '0.75rem' }}>—</span>
                      )}
                    </td>
                    <td className="py-3 px-2 align-middle">
                      <div className="fw-bold text-dark text-truncate" style={{ lineHeight: '1.35', fontSize: '0.86rem', marginBottom: '2px', maxWidth: '170px' }} title={`${reg.title || ''} ${reg.full_name}`}>
                        {reg.title || ''} {reg.full_name}
                      </div>
                      {reg.phone && <div className="text-muted small text-truncate mt-0.5" style={{ fontSize: '0.75rem' }}>{reg.phone}</div>}
                    </td>
                    <td className="py-3 px-2 align-middle">
                      <div className="d-flex align-items-center gap-1.5 text-dark text-truncate" style={{ fontSize: '0.80rem', maxWidth: '175px' }} title={reg.email || '—'}>
                        <LuMail size={13} className="text-primary flex-shrink-0" />
                        <span className="text-truncate">{reg.email || '—'}</span>
                      </div>
                    </td>
                    <td className="py-3 px-1 align-middle text-center">
                      <span className="badge badge-category-teal px-2 py-1 rounded-pill text-truncate d-inline-block" style={{ fontSize: '0.70rem', fontWeight: 700, maxWidth: '140px' }} title={reg.category_name || 'Standard'}>
                        {reg.category_name || 'Standard'}
                      </span>
                      {reg.accompanying_count > 0 && (
                        <span className="badge bg-purple-subtle text-purple mt-1 d-block mx-auto" style={{ fontSize: '0.65rem', width: 'fit-content' }}>
                          +{reg.accompanying_count} Accompanying
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-2 align-middle">
                      <div className="text-dark text-truncate" style={{ fontSize: '0.80rem', lineHeight: '1.3', color: '#475569', maxWidth: '150px' }} title={reg.organization || '—'}>
                        {reg.organization || '—'}
                      </div>
                    </td>
                    <td className="py-3 px-2 align-middle text-end">
                      <div className="fw-bold text-dark text-nowrap" style={{ fontSize: '0.86rem' }}>
                        {formatCurrency(reg.total_payable || (parseFloat(reg.grand_total || 0) * 1.045))}
                      </div>
                    </td>
                    <td className="py-3 px-1 align-middle text-center">
                      <span 
                        className="badge text-uppercase px-2 py-1 rounded-pill" 
                        style={{ 
                          fontSize: '0.68rem', 
                          letterSpacing: '0.03em', 
                          fontWeight: 700,
                          backgroundColor: reg.payment_status === 'paid' ? '#16a34a' : reg.payment_status === 'refunded' ? '#7c3aed' : reg.payment_status === 'failed' ? '#dc2626' : '#d97706',
                          color: '#ffffff'
                        }}
                      >
                        {reg.payment_status}
                      </span>
                    </td>
                    <td className="py-3 px-1 align-middle text-center">
                      <span className={`badge ${
                        reg.status === 'confirmed' ? 'bg-primary-subtle text-primary border border-primary' :
                        reg.status === 'draft' ? 'bg-light text-muted border' :
                        'bg-info-subtle text-info border border-info'
                      } text-uppercase px-2 py-1 rounded-pill`} style={{ fontSize: '0.68rem', letterSpacing: '0.03em', fontWeight: 700 }}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 align-middle text-center text-nowrap">
                      <button
                        onClick={() => navigate(`/admin/registration/${reg.id}`)}
                        className="btn btn-outline-primary btn-sm px-2.5 rounded-2 d-inline-flex align-items-center gap-1 shadow-none fw-semibold"
                        style={{ height: '30px', fontSize: '0.78rem' }}
                      >
                        <LuClipboardList size={13} />
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
