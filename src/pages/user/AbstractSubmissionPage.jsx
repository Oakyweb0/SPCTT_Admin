import React, { useEffect, useState, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import UserHeader from '../../components/Layout/UserHeader';
import { getUserAuth, abstractApi } from '../../services/api';
import { LuFileText, LuImage, LuCloudUpload, LuCheck, LuX, LuExternalLink } from 'react-icons/lu';

const AbstractSubmissionPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const showSubmitFormInitially = searchParams.get('action') === 'submit';

  const [abstracts, setAbstracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(showSubmitFormInitially);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [pdfFile, setPdfFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [isImageFile, setIsImageFile] = useState(false);
  const pdfInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    instituteName: '',
    category: 'Poster',
    email: '',
    phone: '',
    topic: '',
    abstractText: ''
  });

  useEffect(() => {
    const auth = getUserAuth();
    if (!auth || !auth.token) {
      navigate('/user/login');
      return;
    }

    if (auth.user) {
      setFormData(prev => ({
        ...prev,
        name: prev.name || auth.user.name || '',
        email: prev.email || auth.user.email || '',
        phone: prev.phone || auth.user.phone || '',
        instituteName: prev.instituteName || auth.user.organization || ''
      }));
    }

    loadAbstracts();
  }, [navigate]);

  async function loadAbstracts() {
    try {
      setLoading(true);
      const res = await abstractApi.getMyAbstracts();
      if (res.status && res.data) {
        setAbstracts(res.data);
      }
    } catch (err) {
      console.error('Error fetching abstracts:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20MB

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
      const isImg = file.type.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif)$/i.test(file.name);

      if (!isPdf && !isImg) {
        setError('Please select a valid PDF document (.pdf) or Image file (.jpg, .jpeg, .png, .webp).');
        return;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setError(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the 20 MB limit. Please upload a smaller file.`);
        if (pdfInputRef.current) pdfInputRef.current.value = '';
        return;
      }

      setPdfFile(file);
      setIsImageFile(isImg);
      if (isImg) {
        const objectUrl = URL.createObjectURL(file);
        setFilePreview(objectUrl);
      } else {
        setFilePreview(null);
      }
      setError('');
    }
  };

  const removePdf = () => {
    setPdfFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
    setIsImageFile(false);
    if (pdfInputRef.current) pdfInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Please enter author/presenter name.');
      return;
    }
    if (!formData.instituteName.trim()) {
      setError('Please enter institute name.');
      return;
    }
    if (!formData.category) {
      setError('Please select a presentation category (Poster or Oral).');
      return;
    }
    if (!formData.email.trim()) {
      setError('Please enter email address.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please enter phone number.');
      return;
    }
    if (!formData.topic.trim()) {
      setError('Please enter the topic / title of the abstract.');
      return;
    }

    try {
      setSaving(true);
      const submissionData = new FormData();
      submissionData.append('name', formData.name.trim());
      submissionData.append('instituteName', formData.instituteName.trim());
      submissionData.append('category', formData.category);
      submissionData.append('email', formData.email.trim());
      submissionData.append('phone', formData.phone.trim());
      submissionData.append('topic', formData.topic.trim());
      submissionData.append('title', formData.topic.trim());
      submissionData.append('authors', formData.name.trim());
      submissionData.append('affiliation', formData.instituteName.trim());
      submissionData.append('abstractText', formData.abstractText ? formData.abstractText.trim() : '');

      if (pdfFile) {
        submissionData.append('pdf', pdfFile);
      }

      const res = await abstractApi.submitAbstract(submissionData);
      if (res.status) {
        setSuccess('Your abstract has been submitted successfully for review!');
        setFormData({
          name: '',
          instituteName: '',
          category: 'Poster',
          email: '',
          phone: '',
          topic: '',
          abstractText: ''
        });
        removePdf();
        setIsSubmitting(false);
        await loadAbstracts();
      } else {
        setError(res.message || 'Failed to submit abstract.');
      }
    } catch (err) {
      setError(err.message || 'An error occurred while submitting the abstract.');
    } finally {
      setSaving(false);
    }
  };

  const getFullUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const backendBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    const cleanBase = backendBase.replace(/\/api$/, '');
    return `${cleanBase}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <UserHeader pageTitle="Abstract Submission" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 md:py-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Abstract Management</h2>
            <p className="text-sm text-gray-500 mt-1">Submit and track research abstracts for SPCTT 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setIsSubmitting(!isSubmitting);
                setError('');
                setSuccess('');
              }}
              className="bg-[#9e1c2b] hover:bg-[#831422] text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-all shadow-sm cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? 'View My Abstracts' : '+ Submit New Abstract'}
            </button>
            <Link
              to="/user/dashboard"
              className="text-sm text-[#004b63] hover:underline font-medium px-2 py-1"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs flex-shrink-0">
              <LuCheck size={14} />
            </span>
            <span>{success}</span>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-500 hover:text-red-700">
              <LuX size={16} />
            </button>
          </div>
        )}

        {/* Submit Abstract Form */}
        {isSubmitting ? (
          <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 sm:p-8 rounded-xl shadow-sm space-y-6">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-bold text-[#831422]">
                Submit Research Abstract
              </h3>
              <p className="text-xs text-gray-500 mt-1">Please provide accurate details for Poster or Oral presentation evaluation.</p>
            </div>

            {/* Row 1: Name & Institute Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Presenter / Author Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Vivek Tiwari"
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-2 focus:ring-[#004b63]/10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Institute Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="instituteName"
                  value={formData.instituteName}
                  onChange={handleChange}
                  placeholder="e.g. All India Institute of Medical Sciences"
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-2 focus:ring-[#004b63]/10"
                  required
                />
              </div>
            </div>

            {/* Row 2: Category & Topic */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category (Poster / Oral) <span className="text-red-600">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-2 focus:ring-[#004b63]/10 font-medium"
                  required
                >
                  <option value="Poster">Poster Presentation</option>
                  <option value="Oral">Oral Presentation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Topic / Abstract Title <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="topic"
                  value={formData.topic}
                  onChange={handleChange}
                  placeholder="e.g. Clinical Outcomes in Complex Pediatric Perfusion"
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-2 focus:ring-[#004b63]/10"
                  required
                />
              </div>
            </div>

            {/* Row 3: Email & Phone Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. presenter@example.com"
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-2 focus:ring-[#004b63]/10"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Phone Number <span className="text-red-600">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="e.g. +91 9876543210"
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-2 focus:ring-[#004b63]/10"
                  required
                />
              </div>
            </div>

            {/* Row 4: Document / Image Upload */}
            <div className="bg-gray-50/80 p-5 rounded-xl border border-gray-200/80">
              <div>
                <label className="block text-sm font-semibold text-gray-800 mb-1.5 flex items-center gap-2">
                  <LuCloudUpload className="text-[#004b63]" size={18} />
                  <span>Upload Abstract Document / Image (PDF, JPG, PNG, WEBP - Max 20 MB)</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">Upload research paper, presentation abstract PDF, or scientific poster image (Files are securely saved to Cloudflare)</p>
                
                <input
                  ref={pdfInputRef}
                  type="file"
                  accept="application/pdf,image/png,image/jpeg,image/webp,.pdf,.jpg,.jpeg,.png,.webp"
                  onChange={handlePdfChange}
                  className="hidden"
                  id="pdf-upload-input"
                />

                {!pdfFile ? (
                  <label
                    htmlFor="pdf-upload-input"
                    className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 rounded-lg bg-white hover:bg-blue-50/40 hover:border-[#004b63]/40 transition-colors cursor-pointer text-center"
                  >
                    <div className="flex items-center gap-2 text-[#004b63] mb-1.5">
                      <LuFileText size={26} />
                      <span className="text-gray-400 font-light">/</span>
                      <LuImage size={26} />
                    </div>
                    <span className="text-xs font-semibold text-gray-700">Click to Select PDF or Image</span>
                    <span className="text-[11px] text-gray-500 mt-0.5">PDF (.pdf) or Images (.jpg, .png, .webp) up to 20 MB</span>
                  </label>
                ) : (
                  <div className="flex items-center justify-between p-3.5 bg-white border border-[#004b63]/20 rounded-lg shadow-2xs">
                    <div className="flex items-center gap-3 overflow-hidden">
                      {isImageFile && filePreview ? (
                        <img 
                          src={filePreview} 
                          alt="Upload preview" 
                          className="w-12 h-12 object-cover rounded border border-gray-200 flex-shrink-0"
                        />
                      ) : (
                        <LuFileText className="text-red-600 flex-shrink-0" size={28} />
                      )}
                      <div className="truncate">
                        <p className="text-xs font-semibold text-gray-800 truncate">{pdfFile.name}</p>
                        <p className="text-[11px] text-gray-500">{(pdfFile.size / 1024 / 1024).toFixed(2)} MB {isImageFile ? '• Image' : '• PDF Document'}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={removePdf}
                      className="text-gray-400 hover:text-red-600 p-1.5 rounded transition-colors"
                      title="Remove File"
                    >
                      <LuX size={18} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Row 5: Abstract Text (Optional / Summary) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Abstract Summary / Text (Optional)
              </label>
              <textarea
                rows={5}
                name="abstractText"
                value={formData.abstractText}
                onChange={handleChange}
                placeholder="Enter background, methods, results, or conclusion summary if applicable..."
                className="w-full p-3.5 border border-gray-300 rounded-lg bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-2 focus:ring-[#004b63]/10 text-sm leading-relaxed"
              />
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#9e1c2b] hover:bg-[#831422] text-white font-semibold px-8 py-3 rounded-lg text-sm transition-all shadow-sm focus:outline-none cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>{pdfFile ? 'Uploading to Cloudflare...' : 'Submitting Abstract...'}</span>
                  </>
                ) : (
                  <span>Submit Abstract</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsSubmitting(false)}
                className="text-gray-600 hover:text-gray-900 px-4 py-3 text-sm font-medium rounded-lg hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            {loading ? (
              <div className="py-20 text-center text-gray-500">
                <div className="w-8 h-8 border-4 border-[#004b63] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                <p className="text-sm font-medium">Loading your submitted abstracts...</p>
              </div>
            ) : abstracts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300 shadow-2xs">
                <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <LuFileText size={28} />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">No Abstracts Submitted Yet</h4>
                <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
                  Submit your research papers or presentations for SPCTT 2026 Poster or Oral category evaluation.
                </p>
                <button
                  onClick={() => setIsSubmitting(true)}
                  className="bg-[#9e1c2b] text-white px-6 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#831422] transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer"
                >
                  <span>+ Submit Your First Abstract</span>
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                {abstracts.map((abs) => {
                  const pdfUrl = abs.pdf_url || abs.file_url;

                  return (
                    <div key={abs.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-all bg-white">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3 mb-4">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono font-bold text-[#004b63] bg-blue-50 px-2.5 py-1 rounded border border-blue-100">
                            {abs.abstract_code}
                          </span>
                          <span className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            (abs.category || '').toLowerCase() === 'oral'
                              ? 'bg-purple-100 text-purple-800'
                              : 'bg-teal-100 text-teal-800'
                          }`}>
                            {abs.category || 'Poster'}
                          </span>
                        </div>
                        <div>
                          <span className={`text-xs px-3 py-1 rounded-full font-bold uppercase tracking-wider ${
                            abs.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                            abs.status === 'rejected' ? 'bg-red-100 text-red-800' :
                            abs.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {abs.status ? abs.status.replace('_', ' ') : 'Pending'}
                          </span>
                        </div>
                      </div>

                      <h4 className="text-lg font-bold text-gray-900 mb-2">
                        {abs.topic || abs.title}
                      </h4>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-gray-600 mb-4 bg-gray-50/70 p-3 rounded-lg">
                        <div>
                          <span className="font-semibold text-gray-700">Author / Name:</span> {abs.name || abs.authors || '—'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Institute Name:</span> {abs.institute_name || abs.affiliation || '—'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Email:</span> {abs.email || '—'}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-700">Phone:</span> {abs.phone || '—'}
                        </div>
                      </div>

                      {abs.abstract_text && (
                        <p className="text-sm text-gray-700 bg-white border border-gray-100 p-3 rounded-lg text-justify mb-4">
                          {abs.abstract_text}
                        </p>
                      )}

                      {/* Attached Document / Image */}
                      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
                        {pdfUrl ? (() => {
                          const isImg = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(pdfUrl);
                          return (
                            <a
                              href={getFullUrl(pdfUrl)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                                isImg 
                                  ? 'bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100'
                                  : 'bg-red-50 border border-red-200 text-red-700 hover:bg-red-100'
                              }`}
                            >
                              {isImg ? <LuImage size={15} /> : <LuFileText size={15} />}
                              <span>{isImg ? 'View / Download Image' : 'View / Download PDF'}</span>
                              <LuExternalLink size={12} />
                            </a>
                          );
                        })() : (
                          <span className="text-xs text-gray-400 italic">No document or image attached</span>
                        )}
                      </div>

                      {abs.review_comments && (
                        <div className="mt-4 p-3 bg-blue-50/80 border border-blue-100 rounded-lg text-xs text-blue-900">
                          <strong>Reviewer Feedback:</strong> {abs.review_comments}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AbstractSubmissionPage;
