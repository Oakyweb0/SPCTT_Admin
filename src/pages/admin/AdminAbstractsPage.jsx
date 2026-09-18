import React, { useEffect, useState } from 'react';
import { 
  LuSearch, 
  LuRefreshCw, 
  LuFileText, 
  LuEye, 
  LuCheck,
  LuX
} from 'react-icons/lu';
import { adminApi } from '../../services/api';

const AdminAbstractsPage = () => {
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAbs, setSelectedAbs] = useState(null);
  const [reviewModalAbs, setReviewModalAbs] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('accepted');
  const [reviewComments, setReviewComments] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadAbstracts = async () => {
    try {
      setLoading(true);
      const res = await adminApi.getAbstracts();
      if (res.status && res.data) {
        setAbstracts(res.data);
      }
    } catch (err) {
      console.error('Error fetching admin abstracts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAbstracts();
  }, []);

  const handleUpdateStatus = async () => {
    if (!reviewModalAbs) return;
    try {
      setUpdating(true);
      await adminApi.updateAbstractStatus(reviewModalAbs.id, {
        status: reviewStatus,
        reviewComments
      });
      setReviewModalAbs(null);
      await loadAbstracts();
    } catch (err) {
      alert(err.message || 'Failed to update abstract status');
    } finally {
      setUpdating(false);
    }
  };

  const filteredAbstracts = abstracts.filter((a) => {
    const s = search.toLowerCase();
    const matchSearch = !search || (
      (a.title && a.title.toLowerCase().includes(s)) ||
      (a.authors && a.authors.toLowerCase().includes(s)) ||
      (a.abstract_code && a.abstract_code.toLowerCase().includes(s)) ||
      (a.submitter_name && a.submitter_name.toLowerCase().includes(s))
    );
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="dashboard-page-container container-fluid px-4 py-3">
      {/* Header Banner */}
      <div className="dashboard-card-section mb-4">
        <div className="dashboard-card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 bg-info-subtle text-info rounded-3">
              <LuFileText size={24} />
            </div>
            <div>
              <h2 className="dashboard-card-title mb-1">Scientific Abstract Submissions</h2>
              <p className="text-muted small mb-0">Review research papers, submit feedback, and update acceptance status</p>
            </div>
          </div>
          <button
            onClick={loadAbstracts}
            disabled={loading}
            className="btn btn-outline-info btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3"
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
                  placeholder="Search abstracts by title, author name, code, submitter..."
                  className="form-control shadow-none"
                />
              </div>
            </div>

            <div className="col-md-4 col-12 d-flex justify-content-md-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select form-select-sm w-auto"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="under_review">Under Review</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Abstracts Table */}
        <div className="activity-table-container">
          <table className="spctt-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Abstract Title & Authors</th>
                <th>Category</th>
                <th>Submitter</th>
                <th className="text-center">Status</th>
                <th className="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <div className="table-empty-state py-5">
                      <div className="spinner-border text-primary mb-3" style={{ width: '2.2rem', height: '2.2rem' }}></div>
                      <h6 className="table-empty-title mb-1">Loading Research Abstracts...</h6>
                      <p className="table-empty-desc">Fetching submission directory from server</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAbstracts.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <div className="table-empty-state">
                      <div className="table-empty-icon-box">
                        <LuFileText size={26} />
                      </div>
                      <h5 className="table-empty-title">No Abstracts Found</h5>
                      <p className="table-empty-desc">
                        {search || statusFilter
                          ? "No research papers match your current search terms or filter criteria."
                          : "No abstracts have been submitted to the portal yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAbstracts.map((abs) => (
                  <tr key={abs.id}>
                    <td>
                      <span className="badge bg-light text-info border font-monospace px-2 py-1">
                        {abs.abstract_code}
                      </span>
                    </td>
                    <td style={{ maxWidth: '350px' }}>
                      <div className="fw-bold text-dark text-truncate">{abs.title}</div>
                      <div className="text-muted small"><strong>Authors:</strong> {abs.authors}</div>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.72rem' }}>
                        {abs.category}
                      </span>
                    </td>
                    <td className="small text-muted">
                      <div className="fw-bold text-dark">{abs.submitter_name}</div>
                      <div>{abs.submitter_email}</div>
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
                    <td className="text-center">
                      <div className="d-inline-flex gap-2">
                        <button
                          onClick={() => setSelectedAbs(abs)}
                          className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1 px-2.5 py-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <LuEye size={13} /> View
                        </button>
                        <button
                          onClick={() => {
                            setReviewModalAbs(abs);
                            setReviewStatus(abs.status || 'accepted');
                            setReviewComments(abs.review_comments || '');
                          }}
                          className="btn btn-sm btn-info text-white d-inline-flex align-items-center gap-1 px-2.5 py-1"
                          style={{ fontSize: '0.75rem' }}
                        >
                          <LuCheck size={13} /> Review
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Abstract Text Modal */}
      {selectedAbs && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 shadow-lg border-0">
              <div className="modal-header border-bottom">
                <div>
                  <span className="badge bg-info-subtle text-info border font-monospace mb-1">{selectedAbs.abstract_code}</span>
                  <h5 className="modal-title fw-bold">{selectedAbs.title}</h5>
                  <p className="text-muted small mb-0">Authors: {selectedAbs.authors} | Affiliation: {selectedAbs.affiliation}</p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedAbs(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                <div className="p-3 bg-light rounded-3 border text-dark" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', textAlign: 'justify' }}>
                  {selectedAbs.abstract_text}
                </div>

                {selectedAbs.review_comments && (
                  <div className="alert alert-info mt-3 mb-0 small">
                    <strong>Reviewer Comments:</strong> {selectedAbs.review_comments}
                  </div>
                )}
              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  onClick={() => setSelectedAbs(null)}
                  className="btn btn-light"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {reviewModalAbs && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg border-0">
              <div className="modal-header border-bottom">
                <div>
                  <h5 className="modal-title fw-bold">Review Decision</h5>
                  <p className="text-muted small mb-0">{reviewModalAbs.abstract_code} — {reviewModalAbs.title}</p>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setReviewModalAbs(null)}
                ></button>
              </div>

              <div className="modal-body p-4 space-y-3">
                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase">Decision Status</label>
                  <select
                    value={reviewStatus}
                    onChange={(e) => setReviewStatus(e.target.value)}
                    className="form-select"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="accepted">Accepted (Oral / Poster)</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-bold text-muted text-uppercase">Reviewer Feedback Comments</label>
                  <textarea
                    rows={3}
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="e.g. Accepted for Oral presentation in Session 2."
                    className="form-control"
                  />
                </div>
              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  onClick={() => setReviewModalAbs(null)}
                  className="btn btn-light"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="btn btn-info text-white px-4"
                >
                  {updating ? 'Saving...' : 'Save Decision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAbstractsPage;
