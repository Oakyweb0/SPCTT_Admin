import React, { useEffect, useState } from 'react';
import {
  LuSearch,
  LuRefreshCw,
  LuFileText,
  LuImage,
  LuEye,
  LuCheck,
  LuX,
  LuExternalLink
} from 'react-icons/lu';
import { adminApi } from '../../services/api';

const AdminAbstractsPage = () => {
  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedAbs, setSelectedAbs] = useState(null);
  const [reviewModalAbs, setReviewModalAbs] = useState(null);
  const [reviewStatus, setReviewStatus] = useState('accepted');
  const [reviewComments, setReviewComments] = useState('');
  const [updating, setUpdating] = useState(false);

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const cleanBase = backendBase.replace(/\/api$/, '');
    return `${cleanBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

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
      (a.topic && a.topic.toLowerCase().includes(s)) ||
      (a.title && a.title.toLowerCase().includes(s)) ||
      (a.name && a.name.toLowerCase().includes(s)) ||
      (a.authors && a.authors.toLowerCase().includes(s)) ||
      (a.institute_name && a.institute_name.toLowerCase().includes(s)) ||
      (a.email && a.email.toLowerCase().includes(s)) ||
      (a.phone && a.phone.toLowerCase().includes(s)) ||
      (a.abstract_code && a.abstract_code.toLowerCase().includes(s)) ||
      (a.submitter_name && a.submitter_name.toLowerCase().includes(s))
    );
    const matchStatus = !statusFilter || a.status === statusFilter;
    const matchCategory = !categoryFilter || (a.category && a.category.toLowerCase() === categoryFilter.toLowerCase());
    return matchSearch && matchStatus && matchCategory;
  });

  return (
    <div className="dashboard-page-container w-100">
      {/* Header Banner */}
      <div className="dashboard-card-section mb-4">
        <div className="dashboard-card-header bg-white py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
          <div className="d-flex align-items-center gap-3">
            <div className="p-2 bg-info-subtle text-info rounded-3">
              <LuFileText size={24} />
            </div>
            <div>
              <h2 className="dashboard-card-title mb-1">Scientific Abstract Submissions</h2>
              <p className="text-muted small mb-0">Review research papers (Poster / Oral), examine attachments (PDF & Image), and record review decisions</p>
            </div>
          </div>
          <button
            onClick={loadAbstracts}
            disabled={loading}
            className="btn btn-outline-info btn-sm d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3 shadow-none"
          >
            <LuRefreshCw className={loading ? 'fa-spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3 bg-light border-top border-bottom">
          <div className="row g-3 align-items-center">
            <div className="col-md-6 col-12">
              <div className="search-input-box">
                <span className="input-icon">
                  <LuSearch size={18} />
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by topic, author name, institute, email, code..."
                  className="form-control shadow-none"
                />
              </div>
            </div>

            <div className="col-md-3 col-6">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="form-select form-select-sm shadow-none"
              >
                <option value="">All Categories (Poster / Oral)</option>
                <option value="Poster">Poster Presentation</option>
                <option value="Oral">Oral Presentation</option>
              </select>
            </div>

            <div className="col-md-3 col-6 d-flex justify-content-md-end">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="form-select form-select-sm shadow-none"
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
          <table className="spctt-table spctt-table-wide">
            <thead>
              <tr>
                <th style={{ minWidth: '120px' }}>Code</th>
                <th style={{ minWidth: '240px' }}>Topic & Presenter</th>
                <th style={{ minWidth: '160px' }}>Institute</th>
                <th style={{ minWidth: '110px' }}>Category</th>
                <th style={{ minWidth: '180px' }}>Contact</th>
                <th style={{ minWidth: '140px' }}>Files</th>
                <th className="text-center" style={{ minWidth: '120px' }}>Status</th>
                <th className="text-center" style={{ minWidth: '160px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="table-empty-state py-5">
                      <div className="spinner-border text-primary mb-3" style={{ width: '2.2rem', height: '2.2rem' }}></div>
                      <h6 className="table-empty-title mb-1">Loading Research Abstracts...</h6>
                      <p className="table-empty-desc">Fetching submission directory from server</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAbstracts.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="table-empty-state">
                      <div className="table-empty-icon-box">
                        <LuFileText size={26} />
                      </div>
                      <h5 className="table-empty-title">No Abstracts Found</h5>
                      <p className="table-empty-desc">
                        {search || statusFilter || categoryFilter
                          ? "No research papers match your current search terms or filter criteria."
                          : "No abstracts have been submitted to the portal yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAbstracts.map((abs) => {
                  const pdfUrl = abs.pdf_url || abs.file_url;
                  const imageUrl = abs.image_url;

                  return (
                    <tr key={abs.id}>
                      <td>
                        <span className="badge bg-light text-info border font-monospace px-2 py-1">
                          {abs.abstract_code}
                        </span>
                      </td>
                      <td style={{ maxWidth: '300px' }}>
                        <div className="fw-bold text-dark text-truncate" title={abs.topic || abs.title}>
                          {abs.topic || abs.title}
                        </div>
                        <div className="text-muted small">
                          <strong>Author:</strong> {abs.name || abs.authors || abs.submitter_name || '—'}
                        </div>
                      </td>
                      <td className="small text-muted" style={{ maxWidth: '180px' }}>
                        <div className="text-truncate" title={abs.institute_name || abs.affiliation || abs.submitter_org}>
                          {abs.institute_name || abs.affiliation || abs.submitter_org || '—'}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${
                          (abs.category || '').toLowerCase() === 'oral'
                            ? 'bg-purple-subtle text-purple border border-purple'
                            : 'bg-teal-subtle text-teal border border-teal'
                        }`} style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {abs.category || 'Poster'}
                        </span>
                      </td>
                      <td className="small text-muted">
                        <div><strong className="text-dark">Email:</strong> {abs.email || abs.submitter_email || '—'}</div>
                        <div><strong className="text-dark">Phone:</strong> {abs.phone || abs.submitter_phone || '—'}</div>
                      </td>
                      <td>
                        <div className="d-flex align-items-center gap-1.5 flex-wrap">
                          {pdfUrl && (
                            <a
                              href={getFullUrl(pdfUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-outline-danger d-inline-flex align-items-center gap-1 py-1 px-2 rounded"
                              style={{ fontSize: '0.72rem' }}
                              title="Open PDF Document"
                            >
                              <LuFileText size={13} /> <span>PDF</span>
                            </a>
                          )}
                          {imageUrl && (
                            <a
                              href={getFullUrl(imageUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-xs btn-outline-primary d-inline-flex align-items-center gap-1 py-1 px-2 rounded"
                              style={{ fontSize: '0.72rem' }}
                              title="Open Image"
                            >
                              <LuImage size={13} /> <span>Image</span>
                            </a>
                          )}
                          {!pdfUrl && !imageUrl && (
                            <span className="text-muted small" style={{ fontSize: '0.72rem' }}>None</span>
                          )}
                        </div>
                      </td>
                      <td className="text-center">
                        <span className={`badge ${abs.status === 'accepted' ? 'bg-success-subtle text-success border border-success' :
                          abs.status === 'rejected' ? 'bg-danger-subtle text-danger border border-danger' :
                            abs.status === 'under_review' ? 'bg-info-subtle text-info border border-info' :
                              'bg-warning-subtle text-warning border border-warning'
                          } text-uppercase px-2.5 py-1 rounded-pill`} style={{ fontSize: '0.68rem', letterSpacing: '0.04em' }}>
                          {abs.status ? abs.status.replace('_', ' ') : 'submitted'}
                        </span>
                      </td>
                      <td className="text-center text-nowrap">
                        <div className="d-inline-flex gap-2">
                          <button
                            onClick={() => setSelectedAbs(abs)}
                            className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 shadow-none"
                            style={{ fontSize: '0.78rem', fontWeight: 500 }}
                          >
                            <LuEye size={13} /> <span>View</span>
                          </button>
                          <button
                            onClick={() => {
                              setReviewModalAbs(abs);
                              setReviewStatus(abs.status || 'accepted');
                              setReviewComments(abs.review_comments || '');
                            }}
                            className="btn btn-sm btn-info text-white d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 shadow-none"
                            style={{ fontSize: '0.78rem', fontWeight: 500 }}
                          >
                            <LuCheck size={13} /> <span>Review</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Abstract Modal */}
      {selectedAbs && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content rounded-4 shadow-lg border-0">
              <div className="modal-header border-bottom bg-light">
                <div>
                  <div className="d-flex items-center gap-2 mb-1">
                    <span className="badge bg-info-subtle text-info border font-monospace">{selectedAbs.abstract_code}</span>
                    <span className="badge bg-dark text-white">{selectedAbs.category || 'Poster'}</span>
                    <span className={`badge ${selectedAbs.status === 'accepted' ? 'bg-success text-white' :
                      selectedAbs.status === 'rejected' ? 'bg-danger text-white' :
                        selectedAbs.status === 'under_review' ? 'bg-info text-white' : 'bg-warning text-dark'
                    }`}>
                      {selectedAbs.status ? selectedAbs.status.toUpperCase() : 'SUBMITTED'}
                    </span>
                  </div>
                  <h5 className="modal-title fw-bold text-dark mt-1">{selectedAbs.topic || selectedAbs.title}</h5>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSelectedAbs(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* Details Grid */}
                <div className="row g-3 mb-4 p-3 bg-light rounded-3 border">
                  <div className="col-md-6 col-12">
                    <strong className="text-muted small text-uppercase d-block">Presenter / Author Name</strong>
                    <div className="fw-semibold text-dark">{selectedAbs.name || selectedAbs.authors || selectedAbs.submitter_name || '—'}</div>
                  </div>
                  <div className="col-md-6 col-12">
                    <strong className="text-muted small text-uppercase d-block">Institute / Affiliation</strong>
                    <div className="fw-semibold text-dark">{selectedAbs.institute_name || selectedAbs.affiliation || selectedAbs.submitter_org || '—'}</div>
                  </div>
                  <div className="col-md-6 col-12">
                    <strong className="text-muted small text-uppercase d-block">Email Address</strong>
                    <div className="fw-semibold text-dark">{selectedAbs.email || selectedAbs.submitter_email || '—'}</div>
                  </div>
                  <div className="col-md-6 col-12">
                    <strong className="text-muted small text-uppercase d-block">Phone Number</strong>
                    <div className="fw-semibold text-dark">{selectedAbs.phone || selectedAbs.submitter_phone || '—'}</div>
                  </div>
                </div>

                {/* Attachments Section */}
                <div className="mb-4">
                  <h6 className="fw-bold text-dark mb-2">Uploaded Attachments</h6>
                  <div className="d-flex gap-3 flex-wrap">
                    {(selectedAbs.pdf_url || selectedAbs.file_url) ? (
                      <a
                        href={getFullUrl(selectedAbs.pdf_url || selectedAbs.file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-danger d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3"
                      >
                        <LuFileText size={18} />
                        <span>View / Download PDF Document</span>
                        <LuExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="badge bg-light text-muted border p-2">No PDF Uploaded</span>
                    )}

                    {selectedAbs.image_url ? (
                      <a
                        href={getFullUrl(selectedAbs.image_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-3 py-2 rounded-3"
                      >
                        <LuImage size={18} />
                        <span>View Uploaded Image</span>
                        <LuExternalLink size={14} />
                      </a>
                    ) : (
                      <span className="badge bg-light text-muted border p-2">No Image Uploaded</span>
                    )}
                  </div>

                  {selectedAbs.image_url && (
                    <div className="mt-3 p-2 bg-light rounded border text-center">
                      <img
                        src={getFullUrl(selectedAbs.image_url)}
                        alt="Uploaded Abstract Diagram/Poster"
                        className="img-fluid rounded"
                        style={{ maxHeight: '280px', objectFit: 'contain' }}
                      />
                    </div>
                  )}
                </div>

                {/* Abstract Text */}
                {selectedAbs.abstract_text && (
                  <div className="mb-3">
                    <h6 className="fw-bold text-dark mb-2">Abstract Text / Summary</h6>
                    <div className="p-3 bg-light rounded-3 border text-dark" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7', textAlign: 'justify' }}>
                      {selectedAbs.abstract_text}
                    </div>
                  </div>
                )}

                {/* Review Comments */}
                {selectedAbs.review_comments && (
                  <div className="alert alert-info mt-3 mb-0 small">
                    <strong>Reviewer Comments:</strong> {selectedAbs.review_comments}
                  </div>
                )}
              </div>

              <div className="modal-footer border-top">
                <button
                  type="button"
                  onClick={() => {
                    const absToReview = selectedAbs;
                    setSelectedAbs(null);
                    setReviewModalAbs(absToReview);
                    setReviewStatus(absToReview.status || 'accepted');
                    setReviewComments(absToReview.review_comments || '');
                  }}
                  className="btn btn-info text-white"
                >
                  Review Abstract
                </button>
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
                  <p className="text-muted small mb-0">{reviewModalAbs.abstract_code} — {reviewModalAbs.topic || reviewModalAbs.title}</p>
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
