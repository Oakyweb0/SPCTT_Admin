import React, { useEffect, useState } from 'react';
import {
  LuSearch,
  LuRefreshCw,
  LuFileText,
  LuImage,
  LuEye,
  LuCheck,
  LuX,
  LuExternalLink,
  LuTrash2,
  LuTriangleAlert,
  LuArrowLeft,
  LuUser,
  LuMail,
  LuPhone
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

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notification, setNotification] = useState(null);

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const cleanBase = backendBase.replace(/\/api$/, '');
    return `${cleanBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const getFiles = (abs) => {
    if (!abs) return { pdfUrl: null, imageUrl: null };
    let pdfUrl = abs.pdf_url || null;
    let imageUrl = abs.image_url || null;

    if (abs.file_url) {
      if (typeof abs.file_url === 'string' && (abs.file_url.startsWith('{') || abs.file_url.startsWith('{"'))) {
        try {
          const parsed = JSON.parse(abs.file_url);
          if (parsed.pdf) pdfUrl = parsed.pdf;
          if (parsed.image) imageUrl = parsed.image;
        } catch (e) {
          pdfUrl = pdfUrl || abs.file_url;
        }
      } else if (typeof abs.file_url === 'string') {
        const lower = abs.file_url.toLowerCase();
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg') || lower.endsWith('.png') || lower.endsWith('.webp')) {
          imageUrl = imageUrl || abs.file_url;
        } else {
          pdfUrl = pdfUrl || abs.file_url;
        }
      }
    }
    return { pdfUrl, imageUrl };
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

  const handleDeleteAbstract = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await adminApi.deleteAbstract(deleteTarget.id);
      if (res.status) {
        setNotification({
          type: 'success',
          message: `Abstract '${deleteTarget.abstract_code || ('#' + deleteTarget.id)}' deleted successfully.`
        });
        if (selectedAbs && selectedAbs.id === deleteTarget.id) {
          setSelectedAbs(null);
        }
        setDeleteTarget(null);
        await loadAbstracts();
      } else {
        setNotification({
          type: 'danger',
          message: res.message || 'Failed to delete abstract.'
        });
      }
    } catch (err) {
      console.error('Error deleting abstract:', err);
      setNotification({
        type: 'danger',
        message: err.response?.data?.message || err.message || 'Failed to delete abstract.'
      });
    } finally {
      setIsDeleting(false);
      setTimeout(() => {
        setNotification(null);
      }, 5000);
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
      {/* Toast / Alert Notification */}
      {notification && (
        <div className={`alert alert-${notification.type} alert-dismissible fade show d-flex align-items-center justify-content-between shadow-sm rounded-3 mb-3`} role="alert">
          <div className="d-flex align-items-center gap-2">
            {notification.type === 'success' ? <LuCheck size={20} /> : <LuTriangleAlert size={20} />}
            <span>{notification.message}</span>
          </div>
          <button type="button" className="btn-close shadow-none" onClick={() => setNotification(null)}></button>
        </div>
      )}
      {selectedAbs ? (
        /* Detailed Abstract In-Page View */
        <div className="abstract-detail-view-container">
          {/* Top Action & Navigation Bar */}
          <div className="dashboard-card-section mb-4 bg-white p-3 p-md-4 rounded-3 border shadow-xs">
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div className="d-flex align-items-center gap-3">
                <button
                  onClick={() => setSelectedAbs(null)}
                  className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center gap-1.5 px-2.5 rounded-2 shadow-none"
                  style={{ height: '34px', fontSize: '0.78rem', fontWeight: 600 }}
                >
                  <LuArrowLeft size={14} />
                  <span>Back to Submissions</span>
                </button>
                <div className="vr d-none d-sm-block my-1 text-muted" style={{ height: '18px' }}></div>
                <div className="d-flex align-items-center gap-2 flex-wrap">
                  <span className="badge bg-primary-subtle text-primary border font-monospace px-2 py-1" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
                    {selectedAbs.abstract_code}
                  </span>
                  <span
                    className="badge px-2.5 py-1 rounded-pill text-uppercase"
                    style={{
                      fontSize: '0.72rem',
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
              </div>

              {/* Action Buttons */}
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(selectedAbs)}
                  className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center gap-1.5 px-3 rounded-2 shadow-none fw-medium"
                  style={{ height: '34px', fontSize: '0.80rem' }}
                  title="Delete Abstract"
                >
                  <LuTrash2 size={15} /> <span>Delete</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReviewModalAbs(selectedAbs);
                    setReviewStatus(selectedAbs.status || 'accepted');
                    setReviewComments(selectedAbs.review_comments || '');
                  }}
                  className="btn btn-sm btn-primary d-inline-flex align-items-center justify-content-center px-3 rounded-2 shadow-none fw-semibold"
                  style={{ height: '34px', fontSize: '0.80rem' }}
                >
                  <span>Update Review</span>
                </button>
              </div>
            </div>
          </div>

          {/* Main 2-Column Grid */}
          <div className="row g-4">
            {/* Left / Main Section (8 cols) */}
            <div className="col-lg-8 col-12">
              <div className="d-flex flex-column gap-4">
                {/* 1. Abstract Overview & Text Card */}
                <div className="dashboard-card-section bg-white p-4 rounded-3 border shadow-xs">
                  <div className="mb-3">
                    <span className="text-muted small text-uppercase fw-bold tracking-wider d-block mb-1">
                      Abstract Topic / Title
                    </span>
                    <h2 className="text-dark fw-bold m-0" style={{ fontSize: '1.30rem', lineHeight: '1.4' }}>
                      {selectedAbs.topic || selectedAbs.title}
                    </h2>
                  </div>

                  <div className="p-3 bg-light rounded-3 border mb-4">
                    <div className="row g-3">
                      <div className="col-sm-6">
                        <span className="text-muted small d-block">Presentation Type</span>
                        <strong className="text-dark">{selectedAbs.category || 'Poster Presentation'}</strong>
                      </div>
                      <div className="col-sm-6">
                        <span className="text-muted small d-block">Submission Date</span>
                        <strong className="text-dark">
                          {selectedAbs.created_at ? new Date(selectedAbs.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}
                        </strong>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h6 className="fw-bold text-dark text-uppercase small tracking-wider mb-2 pb-2 border-bottom">
                      Abstract Content / Summary
                    </h6>
                    {selectedAbs.abstract_text ? (
                      <div
                        className="p-3.5 bg-light rounded-3 border text-dark"
                        style={{
                          whiteSpace: 'pre-wrap',
                          lineHeight: '1.8',
                          textAlign: 'justify',
                          fontSize: '0.92rem'
                        }}
                      >
                        {selectedAbs.abstract_text}
                      </div>
                    ) : (
                      <div className="alert alert-light border text-muted small mb-0">
                        No text summary provided. Please refer to the attached PDF document below.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Attachments & Media Card */}
                {(() => {
                  const { pdfUrl: absPdfUrl, imageUrl: absImageUrl } = getFiles(selectedAbs);
                  return (
                    <div className="dashboard-card-section bg-white p-4 rounded-3 border shadow-xs">
                      <h6 className="fw-bold text-dark text-uppercase small tracking-wider mb-3 pb-2 border-bottom">
                        Attached Documents & Media
                      </h6>

                      <div className="row g-3 mb-3">
                        {/* PDF Card */}
                        <div className="col-md-6 col-12">
                          <div className="p-3 rounded-3 border bg-light h-100 d-flex flex-column justify-content-between">
                            <div className="d-flex align-items-center gap-2.5 mb-3">
                              <div className="p-2.5 rounded-3 bg-danger-subtle text-danger">
                                <LuFileText size={24} />
                              </div>
                              <div>
                                <h6 className="fw-bold text-dark mb-0 fs-6">PDF Document</h6>
                                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                  {absPdfUrl ? 'Full Research Paper / Abstract PDF' : 'No document attached'}
                                </span>
                              </div>
                            </div>
                            {absPdfUrl ? (
                              <a
                                href={getFullUrl(absPdfUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-danger w-100 d-inline-flex align-items-center justify-content-center gap-2 py-2 rounded-2 fw-medium shadow-none"
                              >
                                <LuFileText size={16} />
                                <span>Open & Download PDF</span>
                                <LuExternalLink size={14} />
                              </a>
                            ) : (
                              <button disabled className="btn btn-light text-muted w-100 border py-2 rounded-2 small">
                                Not Provided
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Image Card */}
                        <div className="col-md-6 col-12">
                          <div className="p-3 rounded-3 border bg-light h-100 d-flex flex-column justify-content-between">
                            <div className="d-flex align-items-center gap-2.5 mb-3">
                              <div className="p-2.5 rounded-3 bg-primary-subtle text-primary">
                                <LuImage size={24} />
                              </div>
                              <div>
                                <h6 className="fw-bold text-dark mb-0 fs-6">Scientific Poster / Image</h6>
                                <span className="text-muted small" style={{ fontSize: '0.75rem' }}>
                                  {absImageUrl ? 'Poster Graphic / Diagram / Photo' : 'No image attached'}
                                </span>
                              </div>
                            </div>
                            {absImageUrl ? (
                              <a
                                href={getFullUrl(absImageUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary w-100 d-inline-flex align-items-center justify-content-center gap-2 py-2 rounded-2 fw-medium shadow-none"
                              >
                                <LuImage size={16} />
                                <span>View Full-Resolution Image</span>
                                <LuExternalLink size={14} />
                              </a>
                            ) : (
                              <button disabled className="btn btn-light text-muted w-100 border py-2 rounded-2 small">
                                Not Provided
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Clean Image Preview */}
                      {absImageUrl && (
                        <div className="p-3 bg-light rounded-3 border text-center mt-3">
                          <p className="text-muted small mb-2 fw-semibold">Image Preview (Click to open full view):</p>
                          <a href={getFullUrl(absImageUrl)} target="_blank" rel="noopener noreferrer" className="d-inline-block">
                            <img
                              src={getFullUrl(absImageUrl)}
                              alt="Uploaded Abstract Diagram/Poster"
                              className="img-fluid rounded border shadow-xs bg-white"
                              style={{ maxHeight: '280px', maxWidth: '100%', objectFit: 'contain' }}
                            />
                          </a>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Right / Sidebar Column (4 cols) */}
            <div className="col-lg-4 col-12">
              <div className="d-flex flex-column gap-4">
                {/* 1. Presenter & Author Card */}
                <div className="dashboard-card-section bg-white p-4 rounded-3 border shadow-xs">
                  <h6 className="fw-bold text-dark text-uppercase small tracking-wider mb-3 pb-2 border-bottom d-flex align-items-center gap-2">
                    <LuUser size={16} className="text-primary" />
                    <span>Presenter & Author</span>
                  </h6>

                  <div className="mb-3">
                    <label className="text-muted small d-block">Presenter Name</label>
                    <div className="fw-bold text-dark fs-6 mt-0.5">
                      {selectedAbs.name || selectedAbs.authors || selectedAbs.submitter_name || '—'}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-muted small d-block">Institution / Affiliation</label>
                    <div className="fw-medium text-dark mt-0.5" style={{ fontSize: '0.88rem' }}>
                      {selectedAbs.institute_name || selectedAbs.affiliation || selectedAbs.submitter_org || '—'}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="text-muted small d-block">Email Address</label>
                    <div className="mt-0.5">
                      <a
                        href={`mailto:${selectedAbs.email || selectedAbs.submitter_email}`}
                        className="text-primary fw-medium text-decoration-none d-inline-flex align-items-center gap-1"
                        style={{ fontSize: '0.88rem', wordBreak: 'break-all' }}
                      >
                        <LuMail size={14} />
                        <span>{selectedAbs.email || selectedAbs.submitter_email || '—'}</span>
                      </a>
                    </div>
                  </div>

                  <div>
                    <label className="text-muted small d-block">Phone Number</label>
                    <div className="fw-medium text-dark mt-0.5 d-flex align-items-center gap-1" style={{ fontSize: '0.88rem' }}>
                      <LuPhone size={14} className="text-muted" />
                      <span>{selectedAbs.phone || selectedAbs.submitter_phone || '—'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Review Decision Card */}
                <div className="dashboard-card-section bg-white p-4 rounded-3 border shadow-xs">
                  <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                    <h6 className="fw-bold text-dark text-uppercase small tracking-wider m-0 d-flex align-items-center gap-2">
                      <LuCheck size={16} className="text-primary" />
                      <span>Review Status</span>
                    </h6>
                    <button
                      onClick={() => {
                        setReviewModalAbs(selectedAbs);
                        setReviewStatus(selectedAbs.status || 'accepted');
                        setReviewComments(selectedAbs.review_comments || '');
                      }}
                      className="btn btn-sm btn-outline-primary py-0.5 px-2.5 rounded-2 shadow-none"
                      style={{ fontSize: '0.75rem', fontWeight: 600 }}
                    >
                      Edit Decision
                    </button>
                  </div>

                  <div className="mb-3">
                    <label className="text-muted small d-block mb-1">Decision Status</label>
                    <span
                      className="badge text-uppercase px-3 py-2 rounded-pill d-inline-block"
                      style={{
                        fontSize: '0.78rem',
                        letterSpacing: '0.04em',
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
                      {selectedAbs.status ? selectedAbs.status.replace('_', ' ') : 'SUBMITTED'}
                    </span>
                  </div>

                  <div>
                    <label className="text-muted small d-block mb-1">Reviewer Feedback / Comments</label>
                    <div
                      className="p-3 bg-light rounded-3 border text-dark"
                      style={{ fontSize: '0.85rem', lineHeight: '1.5' }}
                    >
                      {selectedAbs.review_comments || (
                        <span className="text-muted fst-italic">No feedback comments recorded yet.</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Standard Table List View */
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
          <div className="activity-table-container table-responsive">
            <table className="spctt-table w-100" style={{ minWidth: '920px' }}>
              <thead>
                <tr style={{ background: '#f8fafc' }}>
                  <th className="py-3 px-3 text-nowrap" style={{ width: '10%' }}>Code</th>
                  <th className="py-3 px-3" style={{ width: '26%' }}>Topic & Presenter</th>
                  <th className="py-3 px-3" style={{ width: '18%' }}>Institute</th>
                  <th className="py-3 px-2 text-center" style={{ width: '9%' }}>Category</th>
                  <th className="py-3 px-3" style={{ width: '15%' }}>Contact</th>
                  <th className="py-3 px-2 text-center" style={{ width: '8%' }}>Files</th>
                  <th className="py-3 px-2 text-center" style={{ width: '9%' }}>Status</th>
                  <th className="py-3 px-3 text-center" style={{ width: '11%', minWidth: '130px' }}>Actions</th>
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
                    const { pdfUrl, imageUrl } = getFiles(abs);

                    return (
                      <tr key={abs.id} style={{ borderBottom: '1px solid #eef2f6' }}>
                        <td className="py-3 px-3 align-middle text-nowrap">
                          <span className="badge bg-light text-primary border font-monospace px-2 py-1" style={{ fontSize: '0.78rem', fontWeight: 600 }}>
                            {abs.abstract_code}
                          </span>
                        </td>
                        <td className="py-3 px-3 align-middle">
                          <div
                            className="fw-bold text-dark"
                            style={{
                              lineHeight: '1.35',
                              fontSize: '0.86rem',
                              marginBottom: '2px'
                            }}
                            title={abs.topic || abs.title}
                          >
                            {abs.topic || abs.title}
                          </div>
                          <div className="text-muted small" style={{ fontSize: '0.75rem' }}>
                            Author: <span className="text-dark fw-medium">{abs.name || abs.authors || abs.submitter_name || '—'}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 align-middle small text-muted">
                          <div
                            style={{ fontSize: '0.80rem', lineHeight: '1.3', color: '#475569' }}
                            title={abs.institute_name || abs.affiliation || abs.submitter_org}
                          >
                            {abs.institute_name || abs.affiliation || abs.submitter_org || '—'}
                          </div>
                        </td>
                        <td className="py-3 px-2 align-middle text-center">
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
                        <td className="py-3 px-3 align-middle small">
                          <div className="text-truncate text-dark fw-medium" style={{ maxWidth: '170px', fontSize: '0.80rem' }} title={abs.email || abs.submitter_email}>
                            {abs.email || abs.submitter_email || '—'}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                            {abs.phone || abs.submitter_phone || '—'}
                          </div>
                        </td>
                        <td className="py-3 px-2 align-middle text-center">
                          <div className="d-flex align-items-center justify-content-center gap-1">
                            {pdfUrl && (
                              <a
                                href={getFullUrl(pdfUrl)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1 rounded shadow-none"
                                style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 5px' }}
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
                                className="btn btn-sm btn-outline-primary d-inline-flex align-items-center gap-1 rounded shadow-none"
                                style={{ fontSize: '0.68rem', fontWeight: 700, padding: '2px 5px' }}
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
                        <td className="py-3 px-2 align-middle text-center">
                          <span
                            className="badge text-uppercase px-2.5 py-1 rounded-pill"
                            style={{
                              fontSize: '0.68rem',
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
                        <td className="py-3 px-3 align-middle text-center">
                          <div className="d-inline-flex align-items-center justify-content-center" style={{ gap: '6px' }}>
                            <button
                              onClick={() => setSelectedAbs(abs)}
                              className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center rounded-2 shadow-none"
                              style={{ width: '32px', height: '32px', padding: 0 }}
                              title="View Full Abstract Details"
                            >
                              <LuEye size={15} />
                            </button>
                            <button
                              onClick={() => {
                                setReviewModalAbs(abs);
                                setReviewStatus(abs.status || 'accepted');
                                setReviewComments(abs.review_comments || '');
                              }}
                              className="btn btn-sm btn-primary d-inline-flex align-items-center justify-content-center px-2.5 rounded-2 shadow-none"
                              style={{ fontSize: '0.78rem', fontWeight: 600, height: '32px' }}
                              title="Review Decision"
                            >
                              <span>Review</span>
                            </button>
                            <button
                              onClick={() => setDeleteTarget(abs)}
                              className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center rounded-2 shadow-none"
                              style={{ width: '32px', height: '32px', padding: 0 }}
                              title="Delete Abstract"
                            >
                              <LuTrash2 size={15} />
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
      )}

      {/* Review Modal */}
      {reviewModalAbs && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1040 }}>
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
                  className="btn btn-outline-secondary px-3 shadow-none"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  disabled={updating}
                  className="btn btn-primary px-4 shadow-none"
                >
                  {updating ? 'Saving...' : 'Save Decision'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Abstract Confirmation Modal */}
      {deleteTarget && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '480px' }}>
            <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden bg-white">
              <div className="modal-header border-bottom py-3 px-4 d-flex justify-content-between align-items-center">
                <h5 className="modal-title fw-bold text-dark mb-0 fs-6">Delete Abstract</h5>
                <button
                  type="button"
                  className="btn-close shadow-none"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                ></button>
              </div>

              <div className="modal-body p-4">
                <p className="text-secondary mb-3">
                  Are you sure you want to permanently delete this abstract submission?
                </p>

                <div className="bg-light p-3 rounded-3 border mb-3">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-primary-subtle text-primary border font-monospace px-2.5 py-1" style={{ fontSize: '0.78rem' }}>
                      {deleteTarget.abstract_code}
                    </span>
                    <span className="badge bg-secondary-subtle text-secondary border px-2 py-1 text-uppercase" style={{ fontSize: '0.72rem' }}>
                      {deleteTarget.category || 'Poster'}
                    </span>
                  </div>
                  <div className="fw-bold text-dark mb-1" style={{ fontSize: '0.9rem' }}>
                    {deleteTarget.topic || deleteTarget.title}
                  </div>
                  <div className="text-muted small">
                    Author: <span className="text-dark fw-medium">{deleteTarget.name || deleteTarget.authors || deleteTarget.submitter_name || '—'}</span>
                  </div>
                  <div className="text-muted small">
                    Institute: <span className="text-dark fw-medium">{deleteTarget.institute_name || deleteTarget.affiliation || deleteTarget.submitter_org || '—'}</span>
                  </div>
                </div>

                <div className="alert alert-warning border-warning-subtle small mb-0 rounded-3 d-flex align-items-center gap-2">
                  <LuTriangleAlert size={20} className="text-warning flex-shrink-0" />
                  <span>
                    <strong>Warning:</strong> This abstract and its associated records will be permanently removed. This action cannot be undone.
                  </span>
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
                  className="btn btn-danger px-4 rounded-2 fw-medium shadow-none d-flex align-items-center gap-2"
                  onClick={handleDeleteAbstract}
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <LuTrash2 size={15} />
                      <span>Delete Abstract</span>
                    </>
                  )}
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
