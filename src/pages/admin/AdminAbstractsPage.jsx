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
          <table className="spctt-table w-100" style={{ tableLayout: 'auto' }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                <th className="py-2.5 px-3 text-nowrap" style={{ width: '9%' }}>Code</th>
                <th className="py-2.5 px-3" style={{ width: '28%' }}>Topic & Presenter</th>
                <th className="py-2.5 px-3" style={{ width: '16%' }}>Institute</th>
                <th className="py-2.5 px-3 text-center" style={{ width: '9%' }}>Category</th>
                <th className="py-2.5 px-3" style={{ width: '15%' }}>Contact</th>
                <th className="py-2.5 px-3 text-center" style={{ width: '8%' }}>Files</th>
                <th className="py-2.5 px-3 text-center" style={{ width: '8%' }}>Status</th>
                <th className="py-2.5 px-3 text-center pe-4" style={{ width: '12%' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8}>
                    <div className="table-empty-state py-4 text-center">
                      <div className="spinner-border text-primary mb-2" style={{ width: '2rem', height: '2rem' }}></div>
                      <h6 className="table-empty-title mb-1">Loading Research Abstracts...</h6>
                      <p className="table-empty-desc small text-muted">Fetching submission directory from server</p>
                    </div>
                  </td>
                </tr>
              ) : filteredAbstracts.length === 0 ? (
                <tr>
                  <td colSpan={8}>
                    <div className="table-empty-state text-center py-4">
                      <div className="table-empty-icon-box mb-2">
                        <LuFileText size={24} />
                      </div>
                      <h5 className="table-empty-title mb-1">No Abstracts Found</h5>
                      <p className="table-empty-desc small text-muted">
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
                    <tr key={abs.id} style={{ borderBottom: '1px solid #eef2f6' }}>
                      <td className="py-2.5 px-3 align-middle text-nowrap">
                        <span className="badge bg-light text-primary border font-monospace px-2 py-1" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                          {abs.abstract_code}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 align-middle">
                        <div
                          className="fw-bold text-dark"
                          style={{
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            lineHeight: '1.3',
                            fontSize: '0.85rem'
                          }}
                          title={abs.topic || abs.title}
                        >
                          {abs.topic || abs.title}
                        </div>
                        <div className="text-muted small mt-0.5" style={{ fontSize: '0.75rem' }}>
                          Author: <span className="text-dark fw-medium">{abs.name || abs.authors || abs.submitter_name || '—'}</span>
                        </div>
                      </td>
                      <td className="py-2.5 px-3 align-middle small text-muted">
                        <div
                          className="text-truncate"
                          style={{ maxWidth: '160px', fontSize: '0.78rem' }}
                          title={abs.institute_name || abs.affiliation || abs.submitter_org}
                        >
                          {abs.institute_name || abs.affiliation || abs.submitter_org || '—'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 align-middle text-center">
                        <span
                          className="badge px-2.5 py-1 rounded-pill"
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: (abs.category || '').toLowerCase() === 'oral' ? '#faf5ff' : '#f0fdfa',
                            color: (abs.category || '').toLowerCase() === 'oral' ? '#7e22ce' : '#0f766e',
                            border: `1px solid ${(abs.category || '').toLowerCase() === 'oral' ? '#d8b4fe' : '#99f6e4'}`
                          }}
                        >
                          {abs.category || 'Poster'}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 align-middle small">
                        <div className="text-truncate text-dark fw-medium" style={{ maxWidth: '160px', fontSize: '0.78rem' }} title={abs.email || abs.submitter_email}>
                          {abs.email || abs.submitter_email || '—'}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.73rem' }}>
                          {abs.phone || abs.submitter_phone || '—'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 align-middle text-center">
                        <div className="d-flex align-items-center justify-content-center gap-1">
                          {pdfUrl && (
                            <a
                              href={getFullUrl(pdfUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 py-1 px-1.5 rounded shadow-none"
                              style={{ fontSize: '0.70rem', fontWeight: 600, padding: '2px 6px' }}
                              title="Open PDF Document"
                            >
                              <LuFileText size={12} /> <span>PDF</span>
                            </a>
                          )}
                          {imageUrl && (
                            <a
                              href={getFullUrl(imageUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 py-1 px-1.5 rounded shadow-none"
                              style={{ fontSize: '0.70rem', fontWeight: 600, padding: '2px 6px' }}
                              title="Open Image"
                            >
                              <LuImage size={12} /> <span>IMG</span>
                            </a>
                          )}
                          {!pdfUrl && !imageUrl && (
                            <span className="text-muted" style={{ fontSize: '0.70rem' }}>—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 align-middle text-center">
                        <span
                          className="badge text-uppercase px-2 py-1 rounded-pill"
                          style={{
                            fontSize: '0.67rem',
                            letterSpacing: '0.03em',
                            fontWeight: 700,
                            backgroundColor:
                              abs.status === 'accepted' ? '#dcfce7' :
                              abs.status === 'rejected' ? '#fee2e2' :
                              abs.status === 'under_review' ? '#e0f2fe' : '#fef3c7',
                            color:
                              abs.status === 'accepted' ? '#166534' :
                              abs.status === 'rejected' ? '#991b1b' :
                              abs.status === 'under_review' ? '#075985' : '#92400e',
                            border: `1px solid ${
                              abs.status === 'accepted' ? '#86efac' :
                              abs.status === 'rejected' ? '#fca5a5' :
                              abs.status === 'under_review' ? '#7dd3fc' : '#fde047'
                            }`
                          }}
                        >
                          {abs.status ? abs.status.replace('_', ' ') : 'submitted'}
                        </span>
                      </td>
                      <td className="py-3 px-3 align-middle text-center text-nowrap pe-4">
                        <div className="d-inline-flex align-items-center" style={{ gap: '10px' }}>
                          <button
                            onClick={() => setSelectedAbs(abs)}
                            className="btn btn-sm btn-light border d-inline-flex align-items-center gap-1.5 py-1.5 px-2.5 rounded-2 shadow-none"
                            style={{ fontSize: '0.78rem', fontWeight: 600 }}
                            title="View Abstract Details"
                          >
                            <LuEye size={13} /> <span>View</span>
                          </button>
                          <button
                            onClick={() => {
                              setReviewModalAbs(abs);
                              setReviewStatus(abs.status || 'accepted');
                              setReviewComments(abs.review_comments || '');
                            }}
                            className="btn btn-sm btn-info text-white d-inline-flex align-items-center gap-1.5 py-1.5 px-2.5 rounded-2 shadow-none"
                            style={{ fontSize: '0.78rem', fontWeight: 600 }}
                            title="Review Abstract Decision"
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

      {/* Full Page View Abstract Drawer / Modal */}
      {selectedAbs && (
        <div className="modal fade show d-block p-0" style={{ backgroundColor: 'rgba(15, 23, 42, 0.75)', zIndex: 1055 }}>
          <div className="modal-dialog modal-fullscreen m-0 p-0" style={{ width: '100vw', height: '100vh', maxWidth: '100%' }}>
            <div className="modal-content border-0 rounded-0 bg-light" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
              
              {/* Full Page Header */}
              <div className="bg-white border-bottom px-4 py-3 d-flex align-items-center justify-content-between flex-wrap gap-3 shadow-xs">
                <div className="d-flex align-items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedAbs(null)}
                    className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1.5 px-3 py-1.5 rounded-3"
                  >
                    <span>← Back to List</span>
                  </button>
                  <div className="vr d-none d-sm-block my-1 text-muted"></div>
                  <div>
                    <div className="d-flex align-items-center gap-2 flex-wrap mb-1">
                      <span className="badge bg-primary-subtle text-primary border font-monospace px-2.5 py-1" style={{ fontSize: '0.8rem' }}>
                        {selectedAbs.abstract_code}
                      </span>
                      <span
                        className="badge px-2.5 py-1 rounded-pill"
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          backgroundColor: (selectedAbs.category || '').toLowerCase() === 'oral' ? '#faf5ff' : '#f0fdfa',
                          color: (selectedAbs.category || '').toLowerCase() === 'oral' ? '#7e22ce' : '#0f766e',
                          border: `1px solid ${(selectedAbs.category || '').toLowerCase() === 'oral' ? '#d8b4fe' : '#99f6e4'}`
                        }}
                      >
                        {selectedAbs.category || 'Poster'}
                      </span>
                      <span
                        className="badge text-uppercase px-2.5 py-1 rounded-pill"
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          backgroundColor:
                            selectedAbs.status === 'accepted' ? '#dcfce7' :
                            selectedAbs.status === 'rejected' ? '#fee2e2' :
                            selectedAbs.status === 'under_review' ? '#e0f2fe' : '#fef3c7',
                          color:
                            selectedAbs.status === 'accepted' ? '#166534' :
                            selectedAbs.status === 'rejected' ? '#991b1b' :
                            selectedAbs.status === 'under_review' ? '#075985' : '#92400e',
                          border: `1px solid ${
                            selectedAbs.status === 'accepted' ? '#86efac' :
                            selectedAbs.status === 'rejected' ? '#fca5a5' :
                            selectedAbs.status === 'under_review' ? '#7dd3fc' : '#fde047'
                          }`
                        }}
                      >
                        {selectedAbs.status ? selectedAbs.status.replace('_', ' ') : 'submitted'}
                      </span>
                    </div>
                    <h4 className="fw-bold text-dark m-0" style={{ fontSize: '1.25rem' }}>
                      {selectedAbs.topic || selectedAbs.title}
                    </h4>
                  </div>
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const absToReview = selectedAbs;
                      setSelectedAbs(null);
                      setReviewModalAbs(absToReview);
                      setReviewStatus(absToReview.status || 'accepted');
                      setReviewComments(absToReview.review_comments || '');
                    }}
                    className="btn btn-info text-white d-inline-flex align-items-center gap-1.5 px-4 py-2 rounded-3 shadow-sm"
                  >
                    <LuCheck size={16} /> <span className="fw-semibold">Update Review Decision</span>
                  </button>
                  <button
                    type="button"
                    className="btn-close ms-2"
                    onClick={() => setSelectedAbs(null)}
                    aria-label="Close"
                  ></button>
                </div>
              </div>

              {/* Full Page Body */}
              <div className="flex-1 overflow-auto p-4 p-md-5" style={{ backgroundColor: '#f8fafc' }}>
                <div className="container-fluid max-w-7xl mx-auto">
                  <div className="row g-4">
                    
                    {/* Left Column: Author & Meta Information */}
                    <div className="col-lg-4 col-12">
                      <div className="space-y-4">
                        
                        {/* Presenter Card */}
                        <div className="bg-white p-4 rounded-4 border shadow-xs mb-4">
                          <h6 className="fw-bold text-dark text-uppercase small tracking-wider mb-3 pb-2 border-bottom">
                            Presenter & Author
                          </h6>
                          <div className="mb-3">
                            <label className="text-muted small d-block">Full Name</label>
                            <div className="fw-bold text-dark fs-6">
                              {selectedAbs.name || selectedAbs.authors || selectedAbs.submitter_name || '—'}
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="text-muted small d-block">Institute / Affiliation</label>
                            <div className="fw-semibold text-dark">
                              {selectedAbs.institute_name || selectedAbs.affiliation || selectedAbs.submitter_org || '—'}
                            </div>
                          </div>
                          <div className="mb-3">
                            <label className="text-muted small d-block">Email Address</label>
                            <div className="text-primary fw-medium">
                              <a href={`mailto:${selectedAbs.email || selectedAbs.submitter_email}`} className="text-decoration-none">
                                {selectedAbs.email || selectedAbs.submitter_email || '—'}
                              </a>
                            </div>
                          </div>
                          <div>
                            <label className="text-muted small d-block">Phone Number</label>
                            <div className="fw-medium text-dark">
                              {selectedAbs.phone || selectedAbs.submitter_phone || '—'}
                            </div>
                          </div>
                        </div>

                        {/* Review Decision Summary Card */}
                        <div className="bg-white p-4 rounded-4 border shadow-xs">
                          <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                            <h6 className="fw-bold text-dark text-uppercase small tracking-wider m-0">
                              Review Status
                            </h6>
                            <button
                              onClick={() => {
                                const absToReview = selectedAbs;
                                setSelectedAbs(null);
                                setReviewModalAbs(absToReview);
                                setReviewStatus(absToReview.status || 'accepted');
                                setReviewComments(absToReview.review_comments || '');
                              }}
                              className="btn btn-sm btn-outline-info py-0.5 px-2 rounded-2"
                              style={{ fontSize: '0.72rem' }}
                            >
                              Edit
                            </button>
                          </div>
                          <div className="mb-3">
                            <label className="text-muted small d-block">Current Status</label>
                            <span className="badge bg-light text-dark border px-3 py-1.5 text-uppercase fw-bold mt-1">
                              {selectedAbs.status ? selectedAbs.status.replace('_', ' ') : 'SUBMITTED'}
                            </span>
                          </div>
                          <div>
                            <label className="text-muted small d-block">Reviewer Feedback</label>
                            <p className="text-dark small bg-light p-3 rounded-3 border mt-1 mb-0">
                              {selectedAbs.review_comments || 'No feedback comments recorded yet.'}
                            </p>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* Right Column: Abstract Text & Attachments Preview */}
                    <div className="col-lg-8 col-12">
                      <div className="space-y-4">
                        
                        {/* Attachments Card */}
                        <div className="bg-white p-4 rounded-4 border shadow-xs mb-4">
                          <h6 className="fw-bold text-dark text-uppercase small tracking-wider mb-3 pb-2 border-bottom">
                            Uploaded Documents & Media
                          </h6>
                          <div className="d-flex gap-3 flex-wrap mb-3">
                            {(selectedAbs.pdf_url || selectedAbs.file_url) ? (
                              <a
                                href={getFullUrl(selectedAbs.pdf_url || selectedAbs.file_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-danger d-inline-flex align-items-center gap-2 px-4 py-2.5 rounded-3 shadow-xs"
                              >
                                <LuFileText size={20} />
                                <span className="fw-semibold">Open & Download PDF Document</span>
                                <LuExternalLink size={15} />
                              </a>
                            ) : (
                              <span className="badge bg-light text-muted border p-2.5 px-3">No PDF Uploaded</span>
                            )}

                            {selectedAbs.image_url ? (
                              <a
                                href={getFullUrl(selectedAbs.image_url)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary d-inline-flex align-items-center gap-2 px-4 py-2.5 rounded-3 shadow-xs"
                              >
                                <LuImage size={20} />
                                <span className="fw-semibold">View Full-Resolution Image</span>
                                <LuExternalLink size={15} />
                              </a>
                            ) : (
                              <span className="badge bg-light text-muted border p-2.5 px-3">No Image Uploaded</span>
                            )}
                          </div>

                          {/* Inline Image Preview */}
                          {selectedAbs.image_url && (
                            <div className="mt-3 p-3 bg-light rounded-3 border text-center">
                              <p className="text-muted small mb-2 fw-semibold">Image Preview (Poster / Scientific Diagram):</p>
                              <a href={getFullUrl(selectedAbs.image_url)} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={getFullUrl(selectedAbs.image_url)}
                                  alt="Uploaded Abstract Diagram/Poster"
                                  className="img-fluid rounded border shadow-xs"
                                  style={{ maxHeight: '420px', objectFit: 'contain', background: '#fff' }}
                                />
                              </a>
                            </div>
                          )}
                        </div>

                        {/* Abstract Text Card */}
                        <div className="bg-white p-4 rounded-4 border shadow-xs">
                          <h6 className="fw-bold text-dark text-uppercase small tracking-wider mb-3 pb-2 border-bottom">
                            Abstract Content / Summary
                          </h6>
                          {selectedAbs.abstract_text ? (
                            <div
                              className="p-4 bg-light rounded-3 border text-dark fs-6"
                              style={{ whiteSpace: 'pre-wrap', lineHeight: '1.8', textAlign: 'justify' }}
                            >
                              {selectedAbs.abstract_text}
                            </div>
                          ) : (
                            <p className="text-muted italic mb-0">No text summary provided. Refer to the attached PDF file above.</p>
                          )}
                        </div>

                      </div>
                    </div>

                  </div>
                </div>
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
