import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  LuArrowLeft, 
  LuRefreshCw, 
  LuCheck, 
  LuTriangleAlert, 
  LuClipboardList, 
  LuUser, 
  LuCreditCard, 
  LuFileText, 
  LuUsers, 
  LuBuilding, 
  LuMail, 
  LuPhone, 
  LuMapPin,
  LuClock
} from 'react-icons/lu';
import { adminApi } from '../../services/api';

const AdminRegistrationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [registration, setRegistration] = useState(null);
  const [paymentDetail, setPaymentDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [notification, setNotification] = useState(null);

  const [updateStatus, setUpdateStatus] = useState({
    status: '',
    paymentStatus: '',
    sendEmail: true
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [regRes, payRes] = await Promise.allSettled([
        adminApi.getRegistrationById(id),
        adminApi.getPaymentStatusByRegistrationId(id)
      ]);

      if (regRes.status === 'fulfilled' && regRes.value?.status && regRes.value?.data) {
        const regData = regRes.value.data;
        setRegistration(regData);
        setUpdateStatus({
          status: regData.status || 'draft',
          paymentStatus: regData.payment_status || 'pending',
          sendEmail: true
        });
      } else {
        throw new Error(regRes.reason?.message || 'Could not load registration data');
      }

      if (payRes.status === 'fulfilled' && payRes.value?.status && payRes.value?.data) {
        setPaymentDetail(payRes.value.data);
      }
    } catch (err) {
      console.error('Error loading registration details:', err);
      setNotification({
        type: 'danger',
        message: err.message || 'Failed to load registration details.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const handleStatusUpdate = async () => {
    if (!registration) return;
    try {
      setUpdating(true);
      const res = await adminApi.updateRegistrationStatus(registration.id, updateStatus);
      setNotification({
        type: 'success',
        message: res?.message || 'Registration & payment status updated successfully!'
      });
      await loadData();
    } catch (err) {
      setNotification({
        type: 'danger',
        message: err.message || 'Failed to update registration status.'
      });
    } finally {
      setUpdating(false);
      setTimeout(() => {
        setNotification(null);
      }, 5000);
    }
  };

  const formatCurrency = (amount) => {
    const num = parseFloat(amount || 0);
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (loading) {
    return (
      <div className="dashboard-page-container w-100 py-5 text-center">
        <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}></div>
        <h5 className="text-dark fw-bold">Loading Registration Details...</h5>
        <p className="text-muted small">Please wait while we fetch the latest delegate information & payment status.</p>
      </div>
    );
  }

  if (!registration) {
    return (
      <div className="dashboard-page-container w-100 py-5 text-center">
        <div className="p-4 bg-white rounded-4 border shadow-sm max-w-lg mx-auto">
          <LuTriangleAlert size={48} className="text-danger mb-3" />
          <h4 className="fw-bold text-dark mb-2">Registration Not Found</h4>
          <p className="text-muted mb-4">The registration record with ID #{id} could not be located in the database.</p>
          <button onClick={() => navigate('/admin/registration')} className="btn btn-primary px-4 shadow-none">
            <LuArrowLeft size={16} className="me-2" /> Back to Registrations
          </button>
        </div>
      </div>
    );
  }

  let accompanyingPersonsList = [];
  try {
    if (typeof registration.accompanying_persons === 'string') {
      accompanyingPersonsList = JSON.parse(registration.accompanying_persons);
    } else if (Array.isArray(registration.accompanying_persons)) {
      accompanyingPersonsList = registration.accompanying_persons;
    }
  } catch (e) {
    accompanyingPersonsList = [];
  }

  const currentPaymentStatus = paymentDetail?.paymentStatus || updateStatus.paymentStatus || registration.payment_status || 'pending';
  const currentRegStatus = updateStatus.status || registration.status || 'draft';

  return (
    <div className="dashboard-page-container w-100 pb-5">
      {/* Toast Notification */}
      {notification && (
        <div 
          className="position-fixed top-0 start-50 translate-middle-x p-3" 
          style={{ zIndex: 9999, minWidth: '320px', maxWidth: '520px' }}
        >
          <div 
            className={`alert alert-${notification.type} shadow-lg rounded-3 mb-0 d-flex align-items-center justify-content-between py-2.5 px-3 border`}
            role="alert"
          >
            <div className="d-flex align-items-center gap-2">
              {notification.type === 'success' ? (
                <LuCheck size={18} className="text-success flex-shrink-0" />
              ) : (
                <LuTriangleAlert size={18} className="text-danger flex-shrink-0" />
              )}
              <span className="fw-semibold small">{notification.message}</span>
            </div>
            <button 
              type="button" 
              className="btn-close btn-sm shadow-none ms-2" 
              onClick={() => setNotification(null)}
            ></button>
          </div>
        </div>
      )}

      {/* Top Header Card */}
      <div className="bg-white p-4 rounded-4 border shadow-sm mb-4">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3 mb-3">
          <div className="d-flex align-items-center gap-3">
            <button
              onClick={() => navigate('/admin/registration')}
              className="btn btn-outline-secondary btn-sm rounded-3 d-inline-flex align-items-center gap-1.5 shadow-none px-3 py-2"
              title="Return to registrations table"
            >
              <LuArrowLeft size={16} />
              <span className="fw-semibold">Back to List</span>
            </button>
            <div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <h3 className="fw-bold text-dark mb-0">
                  {registration.title ? `${registration.title} ` : ''}{registration.full_name}
                </h3>
                <span className="badge bg-dark text-white font-monospace px-2.5 py-1">
                  ID: #{registration.id}
                </span>
                <span className="badge bg-primary-subtle text-primary font-monospace px-2.5 py-1 fw-bold">
                  {registration.registration_code}
                </span>
              </div>
              <p className="text-muted small mb-0 mt-1">
                {registration.email} &bull; {registration.phone || 'No phone'} &bull; Registered on: {registration.created_at ? new Date(registration.created_at).toLocaleString('en-IN') : 'N/A'}
              </p>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <button
              onClick={loadData}
              disabled={loading}
              className="btn btn-light border btn-sm px-3 py-2 d-inline-flex align-items-center gap-1.5 shadow-none fw-semibold"
            >
              <LuRefreshCw className={loading ? 'fa-spin' : ''} size={15} />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        {/* Quick Highlights Bar */}
        <div className="row g-3 pt-3 border-top">
          <div className="col-md-3 col-6">
            <div className="p-3 bg-light rounded-3 border">
              <span className="text-muted small d-block mb-1">Registration Category</span>
              <span className="fw-bold text-dark">{registration.category_name || 'Standard Delegate'}</span>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="p-3 bg-light rounded-3 border">
              <span className="text-muted small d-block mb-1">Payment Status</span>
              <span 
                className="badge text-uppercase px-2.5 py-1 rounded-pill" 
                style={{ 
                  fontSize: '0.75rem', 
                  letterSpacing: '0.04em',
                  backgroundColor: currentPaymentStatus === 'paid' ? '#16a34a' : currentPaymentStatus === 'refunded' ? '#7c3aed' : currentPaymentStatus === 'failed' ? '#dc2626' : '#d97706',
                  color: '#ffffff'
                }}
              >
                {currentPaymentStatus}
              </span>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="p-3 bg-light rounded-3 border">
              <span className="text-muted small d-block mb-1">Registration Status</span>
              <span className={`badge ${
                currentRegStatus === 'confirmed' ? 'bg-primary-subtle text-primary border border-primary' :
                currentRegStatus === 'draft' ? 'bg-light text-muted border' :
                'bg-info-subtle text-info border border-info'
              } text-uppercase px-2.5 py-1 rounded-pill`} style={{ fontSize: '0.75rem', letterSpacing: '0.04em', fontWeight: 700 }}>
                {currentRegStatus}
              </span>
            </div>
          </div>
          <div className="col-md-3 col-6">
            <div className="p-3 bg-light rounded-3 border">
              <span className="text-muted small d-block mb-1">Total Payable Amount</span>
              <span className="fw-bold text-danger fs-6">
                {formatCurrency(paymentDetail?.breakdown?.totalPayable ?? ((paymentDetail?.breakdown?.grandTotal || registration.grand_total || 0) * 1.045))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="row g-4">
        {/* Left Column (7 cols): Attendee Profile, Accompanying, Gateway, Invoices */}
        <div className="col-lg-7 col-12">
          {/* 1. Attendee Profile Card */}
          <div className="bg-white p-4 rounded-4 border shadow-sm mb-4">
            <div className="d-flex align-items-center gap-2 text-primary fw-bold text-uppercase small mb-3 pb-2 border-bottom">
              <LuUser size={18} />
              <span>Delegate Profile Information</span>
            </div>

            <div className="row g-3">
              <div className="col-sm-6">
                <span className="text-muted small d-block">Full Name:</span>
                <span className="fw-bold text-dark fs-6">{registration.title ? `${registration.title} ` : ''}{registration.full_name}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted small d-block">Email Address:</span>
                <a href={`mailto:${registration.email}`} className="fw-semibold text-primary text-decoration-none">
                  {registration.email}
                </a>
              </div>
              <div className="col-sm-6">
                <span className="text-muted small d-block">Phone / Mobile:</span>
                <span className="fw-semibold text-dark">{registration.phone || 'N/A'}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted small d-block">Designation:</span>
                <span className="fw-semibold text-dark">{registration.designation || 'N/A'}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted small d-block">Organization / Institute:</span>
                <span className="fw-semibold text-dark">{registration.organization || 'N/A'}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted small d-block">Registration Category:</span>
                <span className="badge bg-primary-subtle text-primary fw-bold px-2.5 py-1">
                  {registration.category_name || 'Standard'}
                </span>
              </div>

              {/* Address */}
              <div className="col-12 pt-2 border-top">
                <span className="text-muted small d-block">Full Address:</span>
                <span className="text-dark">
                  {[registration.address, registration.city, registration.state, registration.country, registration.postal_code].filter(Boolean).join(', ') || 'N/A'}
                </span>
              </div>

              {/* Medical Council Info */}
              {(registration.medical_council_reg_no || registration.state_medical_council) && (
                <div className="col-12 pt-2 border-top">
                  <div className="row g-2">
                    <div className="col-sm-6">
                      <span className="text-muted small d-block">Medical Council Reg. No:</span>
                      <span className="fw-semibold font-monospace text-dark">{registration.medical_council_reg_no || 'N/A'}</span>
                    </div>
                    <div className="col-sm-6">
                      <span className="text-muted small d-block">State Medical Council:</span>
                      <span className="fw-semibold text-dark">{registration.state_medical_council || 'N/A'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Dietary / Special Needs */}
              {(registration.dietary_requirements || registration.special_needs) && (
                <div className="col-12 pt-2 border-top">
                  <div className="row g-2">
                    {registration.dietary_requirements && (
                      <div className="col-sm-6">
                        <span className="text-muted small d-block">Dietary Requirements:</span>
                        <span className="text-dark">{registration.dietary_requirements}</span>
                      </div>
                    )}
                    {registration.special_needs && (
                      <div className="col-sm-6">
                        <span className="text-muted small d-block">Special Needs / Assistance:</span>
                        <span className="text-dark">{registration.special_needs}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. Accompanying Delegates Card (if any) */}
          {accompanyingPersonsList.length > 0 && (
            <div className="bg-white p-4 rounded-4 border shadow-sm mb-4">
              <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                <div className="d-flex align-items-center gap-2 text-primary fw-bold text-uppercase small">
                  <LuUsers size={18} />
                  <span>Accompanying Delegates ({accompanyingPersonsList.length})</span>
                </div>
                <span className="badge bg-secondary">Total: {accompanyingPersonsList.length}</span>
              </div>

              <div className="table-responsive">
                <table className="table table-sm table-bordered mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '40px' }}>#</th>
                      <th>Full Name</th>
                      <th>Relationship</th>
                      <th>Age / Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {accompanyingPersonsList.map((person, idx) => (
                      <tr key={idx}>
                        <td>{idx + 1}</td>
                        <td className="fw-semibold text-dark">{person.name || person.full_name || 'N/A'}</td>
                        <td>{person.relationship || person.relation || 'Accompanying Person'}</td>
                        <td>{person.age ? `${person.age} yrs` : person.notes || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. Razorpay Payment Gateway Info */}
          <div className="bg-white p-4 rounded-4 border shadow-sm mb-4">
            <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
              <div className="d-flex align-items-center gap-2 text-primary fw-bold text-uppercase small">
                <LuCreditCard size={18} />
                <span>Razorpay Payment Gateway Info</span>
              </div>
              <span 
                className="badge text-uppercase px-2.5 py-1 rounded-pill" 
                style={{ 
                  fontSize: '0.72rem', 
                  letterSpacing: '0.04em',
                  backgroundColor: currentPaymentStatus === 'paid' ? '#16a34a' : currentPaymentStatus === 'refunded' ? '#7c3aed' : currentPaymentStatus === 'failed' ? '#dc2626' : '#d97706',
                  color: '#ffffff'
                }}
              >
                {currentPaymentStatus}
              </span>
            </div>

            <div className="row g-3 small">
              <div className="col-sm-6">
                <span className="text-muted d-block">Payment Method:</span>
                <span className="fw-semibold text-dark">
                  {(paymentDetail?.paymentMethod || registration.payment_method || 'Razorpay (PAGE WORLDWIDE)').replace(/Axis\s*Razorpay/gi, 'Razorpay').replace(/Elisyan\s*India/gi, 'PAGE WORLDWIDE')}
                </span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted d-block">Transaction ID:</span>
                <span className="font-monospace fw-semibold text-primary">
                  {paymentDetail?.transactionId || registration.transaction_id || 'Not Generated Yet'}
                </span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted d-block">Selected Category:</span>
                <span className="fw-semibold text-dark">{paymentDetail?.categoryName || registration.category_name || 'Standard'}</span>
              </div>
              <div className="col-sm-6">
                <span className="text-muted d-block">Paid / Updated Timestamp:</span>
                <span className="fw-semibold text-dark">
                  {paymentDetail?.paidAt ? new Date(paymentDetail.paidAt).toLocaleString('en-IN') : (registration.paid_at ? new Date(registration.paid_at).toLocaleString('en-IN') : 'N/A')}
                </span>
              </div>
            </div>
          </div>

          {/* 4. Official Invoices & Receipts */}
          {paymentDetail?.invoices && paymentDetail.invoices.length > 0 && (
            <div className="bg-white p-4 rounded-4 border shadow-sm">
              <div className="d-flex align-items-center gap-2 text-primary fw-bold text-uppercase small mb-3 pb-2 border-bottom">
                <LuFileText size={18} />
                <span>Official Invoices & Receipts ({paymentDetail.invoices.length})</span>
              </div>

              <div className="table-responsive">
                <table className="table table-sm table-hover mb-0 small">
                  <thead className="table-light">
                    <tr>
                      <th>Invoice Number</th>
                      <th>Type</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentDetail.invoices.map((inv) => (
                      <tr key={inv.id}>
                        <td className="font-monospace fw-bold text-primary">{inv.invoice_number}</td>
                        <td className="text-capitalize">{inv.invoice_type || 'Receipt'}</td>
                        <td className="fw-semibold">{formatCurrency(inv.total_amount)}</td>
                        <td>
                          <span className={`badge ${inv.status === 'paid' ? 'bg-success' : 'bg-warning text-dark'}`}>
                            {inv.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Financial Breakdown & Status Update Card */}
        <div className="col-lg-5 col-12">
          {/* 1. Financial Breakdown Card */}
          <div className="bg-white p-4 rounded-4 border shadow-sm mb-4">
            <div className="d-flex align-items-center gap-2 text-primary fw-bold text-uppercase small mb-3 pb-2 border-bottom">
              <LuCreditCard size={18} />
              <span>Financial Breakdown</span>
            </div>

            <div className="space-y-2 small">
              <div className="d-flex justify-content-between py-1.5">
                <span className="text-muted">Category Base Price:</span>
                <span className="fw-semibold text-dark">{formatCurrency(paymentDetail?.breakdown?.categoryPrice ?? registration.category_price)}</span>
              </div>

              {(paymentDetail?.breakdown?.accompanyingTotal > 0 || parseFloat(registration.accompanying_total || 0) > 0) && (
                <div className="d-flex justify-content-between py-1.5">
                  <span className="text-muted">Accompanying Delegates Total:</span>
                  <span className="fw-semibold text-dark">{formatCurrency(paymentDetail?.breakdown?.accompanyingTotal ?? registration.accompanying_total)}</span>
                </div>
              )}

              <div className="d-flex justify-content-between py-1.5 border-top pt-2">
                <span className="text-muted">Subtotal:</span>
                <span className="fw-semibold text-dark">{formatCurrency(paymentDetail?.breakdown?.subtotal ?? registration.subtotal)}</span>
              </div>

              <div className="d-flex justify-content-between py-1.5">
                <span className="text-muted">GST ({paymentDetail?.breakdown?.gstRate ?? registration.gst_rate ?? 18}%):</span>
                <span className="fw-semibold text-dark">{formatCurrency(paymentDetail?.breakdown?.gstAmount ?? registration.gst_amount)}</span>
              </div>

              <div className="d-flex justify-content-between py-1.5">
                <span className="text-muted">Sub Total (Base + GST):</span>
                <span className="fw-semibold text-dark">{formatCurrency(paymentDetail?.breakdown?.grandTotal ?? registration.grand_total)}</span>
              </div>

              <div className="d-flex justify-content-between py-1.5">
                <span className="text-muted">Facilitation Charges (4.5%):</span>
                <span className="fw-semibold text-dark">
                  {formatCurrency(paymentDetail?.breakdown?.facilitationCharges ?? ((paymentDetail?.breakdown?.grandTotal || registration.grand_total || 0) * 0.045))}
                </span>
              </div>

              <div className="d-flex justify-content-between align-items-center py-3 border-top mt-2 bg-light p-3 rounded-3">
                <span className="fw-bold text-dark fs-6">Total Payable Amount:</span>
                <span className="fw-bold text-danger fs-4">
                  {formatCurrency(paymentDetail?.breakdown?.totalPayable ?? ((paymentDetail?.breakdown?.grandTotal || registration.grand_total || 0) * 1.045))}
                </span>
              </div>
            </div>
          </div>

          {/* 2. Update Registration & Payment Status Card */}
          <div className="bg-white p-4 rounded-4 border shadow-sm sticky-top" style={{ top: '24px' }}>
            <h6 className="fw-bold text-dark small text-uppercase mb-3 pb-2 border-bottom">
              Update Registration & Payment Status
            </h6>

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label small fw-bold text-muted text-uppercase">Registration Status</label>
                <select
                  value={updateStatus.status}
                  onChange={(e) => setUpdateStatus({ ...updateStatus, status: e.target.value })}
                  className="form-select shadow-none py-2"
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div className="col-12">
                <label className="form-label small fw-bold text-muted text-uppercase">Payment Status</label>
                <select
                  value={updateStatus.paymentStatus}
                  onChange={(e) => setUpdateStatus({ ...updateStatus, paymentStatus: e.target.value })}
                  className="form-select shadow-none py-2"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              {/* Email Switch */}
              <div className="col-12 mt-3 pt-3 border-top">
                <div className="form-check form-switch d-flex align-items-center gap-2">
                  <input
                    className="form-check-input ms-0"
                    type="checkbox"
                    role="switch"
                    id="sendPaymentEmailNotification"
                    checked={updateStatus.sendEmail !== false}
                    onChange={(e) => setUpdateStatus({ ...updateStatus, sendEmail: e.target.checked })}
                  />
                  <label className="form-check-label small fw-semibold text-dark cursor-pointer" htmlFor="sendPaymentEmailNotification">
                    📧 Dispatch email notification to delegate ({registration.email}) & CC admin alert
                  </label>
                </div>
              </div>

              {/* Status Action Explanation */}
              <div className="col-12">
                <div 
                  className="p-3 rounded-3 small"
                  style={{
                    backgroundColor: updateStatus.paymentStatus === 'paid' ? '#f0fdf4' : updateStatus.paymentStatus === 'refunded' ? '#f5f3ff' : updateStatus.paymentStatus === 'failed' ? '#fef2f2' : '#fffbeb',
                    border: `1px solid ${updateStatus.paymentStatus === 'paid' ? '#bbf7d0' : updateStatus.paymentStatus === 'refunded' ? '#ddd6fe' : updateStatus.paymentStatus === 'failed' ? '#fecaca' : '#fde68a'}`,
                    color: updateStatus.paymentStatus === 'paid' ? '#166534' : updateStatus.paymentStatus === 'refunded' ? '#5b21b6' : updateStatus.paymentStatus === 'failed' ? '#991b1b' : '#92400e'
                  }}
                >
                  <strong>Action Trigger:</strong>{' '}
                  {updateStatus.paymentStatus === 'paid' && 'Marks registration as Confirmed, marks tax invoices as paid, and dispatches confirmation email.'}
                  {updateStatus.paymentStatus === 'refunded' && 'Records refund in payments table and emails refund processing confirmation (5-7 working days timeline).'}
                  {updateStatus.paymentStatus === 'pending' && 'Sets status to Pending and sends payment reminder email with complete payment link.'}
                  {updateStatus.paymentStatus === 'failed' && 'Marks status as Failed and dispatches payment failure alert.'}
                </div>
              </div>

              {/* Save Button */}
              <div className="col-12 pt-2">
                <button
                  type="button"
                  onClick={handleStatusUpdate}
                  disabled={updating}
                  className="btn btn-primary w-100 py-2.5 shadow-none d-inline-flex align-items-center justify-content-center gap-2 fw-semibold fs-6 rounded-3"
                >
                  {updating ? (
                    <>
                      <div className="spinner-border spinner-border-sm"></div>
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <>
                      <LuCheck size={18} />
                      <span>Save Status Changes</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminRegistrationDetailPage;
