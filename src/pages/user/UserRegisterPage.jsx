import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserHeader from '../../components/Layout/UserHeader';
import { authApi, saveUserAuth } from '../../services/api';

const UserRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: 'Mr.',
    fullName: '',
    email: '',
    organization: '',
    countryCode: '+91',
    phone: '',
    password: '',
    repeatPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.fullName.trim() || !formData.email.trim() || !formData.organization.trim() || !formData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.repeatPassword) {
      setError('Set Password and Repeat Password do not match.');
      return;
    }

    try {
      setLoading(true);
      const fullPhone = `${formData.countryCode} ${formData.phone}`.trim();
      const payload = {
        title: formData.title,
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        organization: formData.organization.trim(),
        phone: fullPhone,
        password: formData.password,
        repeatPassword: formData.repeatPassword
      };

      const res = await authApi.userRegister(payload);
      if (res.status && res.data?.token) {
        saveUserAuth(res.data);
        // Redirect to dashboard on successful registration
        navigate('/user/dashboard');
      } else {
        setError(res.message || 'Registration failed.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'An error occurred during account creation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <UserHeader pageTitle="Create an Account" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-12 md:py-16">
        {error && (
          <div className="mb-6 p-4 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1: Title, Full Name, Email Address */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Title */}
            <div className="md:col-span-3">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Title <span className="text-red-600">*</span>
              </label>
              <select
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full h-11 px-3 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63] transition-colors"
                required
              >
                <option value="Mr.">Mr.</option>
                <option value="Ms.">Ms.</option>
                <option value="Mrs.">Mrs.</option>
                <option value="Dr.">Dr.</option>
                <option value="Prof.">Prof.</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="md:col-span-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Full Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder=""
                className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63] transition-colors"
                required
              />
            </div>

            {/* Email Address */}
            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder=""
                className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63] transition-colors"
                required
              />
            </div>
          </div>

          {/* Row 2: Organization / Institution Name & Mobile Number */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
            {/* Organization */}
            <div className="md:col-span-7">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Organization / Institution Name <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                placeholder=""
                className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63] transition-colors"
                required
              />
            </div>

            {/* Mobile Number with country selector */}
            <div className="md:col-span-5">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Mobile Number
              </label>
              <div className="flex items-center border border-gray-300 rounded h-11 overflow-hidden focus-within:border-[#004b63] focus-within:ring-1 focus-within:ring-[#004b63]">
                <div className="flex items-center gap-1.5 px-3 bg-gray-50 border-r border-gray-200 text-sm text-gray-700 select-none">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="11 2345 6789"
                  maxLength={15}
                  className="flex-1 h-full px-3 text-gray-800 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Max Length : 15 Numbers</p>
            </div>
          </div>

          {/* Row 3: Set Password & Repeat Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Set Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63] transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Repeat Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                name="repeatPassword"
                value={formData.repeatPassword}
                onChange={handleChange}
                className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63] transition-colors"
                required
              />
            </div>
          </div>

          {/* Submit & Sign In Actions */}
          <div className="pt-4 flex items-center gap-6">
            <button
              type="submit"
              disabled={loading}
              className="bg-[#9e1c2b] hover:bg-[#831422] text-white font-medium px-8 py-2.5 rounded text-sm transition-all shadow-sm focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Proceed'}
            </button>

            <Link
              to="/user/login"
              className="text-[#9e1c2b] hover:text-[#831422] font-medium text-sm hover:underline cursor-pointer"
            >
              Sign In
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default UserRegisterPage;
