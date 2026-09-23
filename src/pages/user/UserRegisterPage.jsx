import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserHeader from '../../components/Layout/UserHeader';
import { authApi, saveUserAuth } from '../../services/api';
import { COUNTRIES, INDIAN_STATES, CITIES_BY_STATE } from '../../data/locations';

const UserRegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: 'Mr.',
    fullName: '',
    email: '',
    organization: '',
    countryCode: '+91',
    phone: '',
    country: 'India',
    customCountry: '',
    state: '',
    customState: '',
    city: '',
    customCity: '',
    password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const updated = { ...prev, [name]: value };
      
      // Reset state and city if country changes
      if (name === 'country' && value !== 'India') {
        updated.state = '';
        updated.city = '';
      }
      // Reset city if state changes
      if (name === 'state') {
        updated.city = '';
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const resolvedCountry = formData.country === 'Other' ? formData.customCountry.trim() : formData.country.trim();
    const resolvedState = (formData.country === 'India' && formData.state !== 'Other')
      ? formData.state.trim()
      : (formData.customState.trim() || formData.state.trim());
    const resolvedCity = formData.city === 'Other'
      ? formData.customCity.trim()
      : (formData.customCity.trim() || formData.city.trim());

    if (!formData.title || !formData.fullName.trim() || !formData.email.trim() || !formData.organization.trim() || !formData.password) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    if (!resolvedCountry || !resolvedState || !resolvedCity) {
      setError('Please select/enter your Country, State, and City.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
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
        country: resolvedCountry,
        state: resolvedState,
        city: resolvedCity,
        password: formData.password
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

  // Get available cities for selected Indian state
  const availableCities = formData.country === 'India' && formData.state && CITIES_BY_STATE[formData.state]
    ? CITIES_BY_STATE[formData.state]
    : null;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <UserHeader pageTitle="Create an Account" subtitle="Register for SPCTT 2026 Annual Conference" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 md:py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-10">
          <div className="border-b border-gray-100 pb-5 mb-8">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Personal & Contact Information
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Please enter your details to create your conference delegate account. Fields marked with <span className="text-red-500 font-semibold">*</span> are required.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation text-base"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1: Title, Full Name, Email Address */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Title */}
              <div className="md:col-span-3">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Title <span className="text-red-600">*</span>
                </label>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all cursor-pointer"
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
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Full Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="e.g. John Doe"
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Email Address */}
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Email Address <span className="text-red-600">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="e.g. doctor@hospital.org"
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Row 2: Organization / Institution Name & Mobile Number */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-start">
              {/* Organization */}
              <div className="md:col-span-7">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Organization / Institution Name <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  name="organization"
                  value={formData.organization}
                  onChange={handleChange}
                  placeholder="e.g. Apollo Hospital / AIIMS"
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all placeholder:text-gray-400"
                  required
                />
              </div>

              {/* Mobile Number with country selector */}
              <div className="md:col-span-5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Mobile Number
                </label>
                <div className="flex items-center border border-gray-300 rounded-lg h-11 overflow-hidden focus-within:border-[#476EAC] focus-within:ring-2 focus-within:ring-[#476EAC]/20 transition-all bg-white">
                  <div className="flex items-center gap-1.5 px-3 bg-gray-50 border-r border-gray-200 text-xs font-semibold text-gray-600 select-none">
                    <span>🇮🇳</span>
                    <span>+91</span>
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="98765 43210"
                    maxLength={15}
                    className="flex-1 h-full px-3 text-gray-800 text-sm focus:outline-none placeholder:text-gray-400"
                  />
                </div>
                <p className="text-[11px] text-gray-400 mt-1">Max Length: 15 digits</p>
              </div>
            </div>

            {/* Row 3: Country, State, City Dropdowns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
              {/* Country */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Country <span className="text-red-600">*</span>
                </label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all cursor-pointer"
                  required
                >
                  {COUNTRIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
                {formData.country === 'Other' && (
                  <input
                    type="text"
                    name="customCountry"
                    value={formData.customCountry}
                    onChange={handleChange}
                    placeholder="Enter country name"
                    className="w-full h-11 mt-2 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all"
                    required
                  />
                )}
              </div>

              {/* State / Province */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  State / Province <span className="text-red-600">*</span>
                </label>
                {formData.country === 'India' ? (
                  <>
                    <select
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full h-11 px-3.5 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all cursor-pointer"
                      required
                    >
                      <option value="">-- Select State --</option>
                      {INDIAN_STATES.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {formData.state === 'Other' && (
                      <input
                        type="text"
                        name="customState"
                        value={formData.customState}
                        onChange={handleChange}
                        placeholder="Enter state name"
                        className="w-full h-11 mt-2 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all"
                        required
                      />
                    )}
                  </>
                ) : (
                  <input
                    type="text"
                    name="customState"
                    value={formData.customState}
                    onChange={handleChange}
                    placeholder="e.g. California / London"
                    className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all"
                    required
                  />
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  City <span className="text-red-600">*</span>
                </label>
                {formData.country === 'India' && availableCities ? (
                  <>
                    <select
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full h-11 px-3.5 border border-gray-300 rounded-lg bg-white text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all cursor-pointer"
                      required
                    >
                      <option value="">-- Select City --</option>
                      {availableCities.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                    </select>
                    {formData.city === 'Other' && (
                      <input
                        type="text"
                        name="customCity"
                        value={formData.customCity}
                        onChange={handleChange}
                        placeholder="Enter city name"
                        className="w-full h-11 mt-2 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all"
                        required
                      />
                    )}
                  </>
                ) : (
                  <input
                    type="text"
                    name="customCity"
                    value={formData.customCity}
                    onChange={handleChange}
                    placeholder="e.g. Los Angeles / Manchester"
                    className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all"
                    required
                  />
                )}
              </div>
            </div>

            {/* Row 4: Password */}
            <div className="grid grid-cols-1 md:grid-cols-1 gap-5 items-start">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                  Password <span className="text-red-600">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Minimum 6 characters"
                  className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all placeholder:text-gray-400"
                  required
                />
              </div>
            </div>

            {/* Submit & Sign In Actions */}
            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto bg-[#C0192B] hover:bg-[#a11424] text-white font-semibold px-8 py-3 rounded-lg text-sm transition-all shadow-sm hover:shadow focus:outline-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Proceed</span>
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </>
                )}
              </button>

              <div className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link
                  to="/user/login"
                  className="text-[#C0192B] hover:text-[#a11424] font-bold hover:underline cursor-pointer ml-1"
                >
                  Sign In here
                </Link>
              </div>
            </div>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 text-center text-xs text-gray-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>&copy; {new Date().getFullYear()} SPCTT 2026. All rights reserved.</span>
          <div className="flex items-center gap-4">
            <Link to="/admin/login" className="text-gray-500 hover:text-gray-800 transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default UserRegisterPage;
