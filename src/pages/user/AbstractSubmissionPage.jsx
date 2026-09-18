import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import UserHeader from '../../components/Layout/UserHeader';
import { getUserAuth, abstractApi } from '../../services/api';

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

  const [formData, setFormData] = useState({
    title: '',
    authors: '',
    affiliation: '',
    category: 'Pediatric Cardiac Surgery',
    abstractText: ''
  });

  useEffect(() => {
    const auth = getUserAuth();
    if (!auth || !auth.token) {
      navigate('/user/login');
      return;
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.authors.trim() || !formData.affiliation.trim() || !formData.abstractText.trim()) {
      setError('Please fill in all mandatory abstract submission fields.');
      return;
    }

    try {
      setSaving(true);
      const res = await abstractApi.submitAbstract(formData);
      if (res.status) {
        setSuccess('Your abstract has been submitted successfully for review!');
        setFormData({
          title: '',
          authors: '',
          affiliation: '',
          category: 'Pediatric Cardiac Surgery',
          abstractText: ''
        });
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

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <UserHeader pageTitle="Abstract Submission" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 md:py-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-200 pb-4 mb-8 gap-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Abstract Management</h2>
            <p className="text-sm text-gray-500">Submit and track research abstracts for SPCTT 2026</p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                setIsSubmitting(!isSubmitting);
                setError('');
                setSuccess('');
              }}
              className="bg-[#9e1c2b] hover:bg-[#831422] text-white px-5 py-2 rounded text-sm font-medium transition-colors cursor-pointer"
            >
              {isSubmitting ? 'View My Abstracts' : '+ Submit New Abstract'}
            </button>
            <Link
              to="/user/dashboard"
              className="text-sm text-[#004b63] hover:underline font-medium"
            >
              Dashboard
            </Link>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Submit Abstract Form */}
        {isSubmitting ? (
          <form onSubmit={handleSubmit} className="bg-gray-50 border border-gray-200 p-6 sm:p-8 rounded-lg space-y-6">
            <h3 className="text-lg font-bold text-[#831422] border-b border-[#831422]/20 pb-2">
              Submit Research Abstract
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Abstract Title <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Advancements in Pediatric Cardiopulmonary Techniques"
                className="w-full h-11 px-3 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Author(s) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="authors"
                  value={formData.authors}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Vivek Tiwari, Dr. Ratan Singh"
                  className="w-full h-11 px-3 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Category / Topic <span className="text-red-600">*</span>
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full h-11 px-3 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                  required
                >
                  <option value="Pediatric Cardiac Surgery">Pediatric Cardiac Surgery</option>
                  <option value="Cardiopulmonary Perfusion">Cardiopulmonary Perfusion</option>
                  <option value="Critical Care & ECMO">Critical Care & ECMO</option>
                  <option value="Congenital Heart Diseases">Congenital Heart Diseases</option>
                  <option value="Nursing & Allied Sciences">Nursing & Allied Sciences</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Affiliation / Institution <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="affiliation"
                value={formData.affiliation}
                onChange={handleChange}
                placeholder="e.g. Department of Cardiothoracic Surgery, SPCTT Institute"
                className="w-full h-11 px-3 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Abstract Text (Structured: Background, Methods, Results, Conclusion) <span className="text-red-600">*</span>
              </label>
              <textarea
                rows={8}
                name="abstractText"
                value={formData.abstractText}
                onChange={handleChange}
                placeholder="Enter your detailed abstract text here..."
                className="w-full p-3 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63]"
                required
              />
            </div>

            <div className="pt-2 flex items-center gap-4">
              <button
                type="submit"
                disabled={saving}
                className="bg-[#9e1c2b] hover:bg-[#831422] text-white font-medium px-8 py-2.5 rounded text-sm transition-all shadow-sm focus:outline-none cursor-pointer disabled:opacity-50"
              >
                {saving ? 'Submitting...' : 'Submit Abstract'}
              </button>

              <button
                type="button"
                onClick={() => setIsSubmitting(false)}
                className="text-gray-600 hover:text-gray-900 px-4 py-2.5 text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div>
            {loading ? (
              <div className="py-20 text-center text-gray-500">
                <div className="w-8 h-8 border-4 border-[#004b63] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                Loading abstracts...
              </div>
            ) : abstracts.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">No abstracts submitted yet.</p>
                <button
                  onClick={() => setIsSubmitting(true)}
                  className="bg-[#9e1c2b] text-white px-6 py-2.5 rounded text-sm font-medium hover:bg-[#831422] transition-colors inline-block"
                >
                  Submit Your First Abstract
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {abstracts.map((abs) => (
                  <div key={abs.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow bg-white">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3 mb-3">
                      <div>
                        <span className="text-xs font-bold text-[#004b63] tracking-wide uppercase mr-2">
                          {abs.abstract_code}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded bg-gray-100 text-gray-700 font-medium">
                          {abs.category}
                        </span>
                      </div>
                      <div>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold uppercase ${
                          abs.status === 'accepted' ? 'bg-emerald-100 text-emerald-800' :
                          abs.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          abs.status === 'under_review' ? 'bg-blue-100 text-blue-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {abs.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-base font-bold text-gray-900 mb-1">
                      {abs.title}
                    </h4>
                    <p className="text-xs text-gray-600 mb-3">
                      <strong>Authors:</strong> {abs.authors} | <strong>Affiliation:</strong> {abs.affiliation}
                    </p>

                    <p className="text-sm text-gray-700 line-clamp-3 bg-gray-50 p-3 rounded text-justify">
                      {abs.abstract_text}
                    </p>

                    {abs.review_comments && (
                      <div className="mt-3 p-3 bg-blue-50/70 border border-blue-100 rounded text-xs text-blue-900">
                        <strong>Review Comments:</strong> {abs.review_comments}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default AbstractSubmissionPage;
