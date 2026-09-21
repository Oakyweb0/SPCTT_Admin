import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserHeader from '../../components/Layout/UserHeader';
import { authApi, saveUserAuth } from '../../services/api';

const UserLoginPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    if (!formData.email.trim() || !formData.password) {
      setError('Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.userLogin({
        email: formData.email.trim(),
        password: formData.password
      });

      if (res.status && res.data?.token) {
        saveUserAuth(res.data);
        navigate('/user/dashboard');
      } else {
        setError(res.message || 'Login failed.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <UserHeader pageTitle="Delegate Login" subtitle="Access your registration, abstract status & receipts" />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 md:py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8">
          <div className="border-b border-gray-100 pb-4 mb-6 text-center">
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Sign In to Your Account
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter your registered email and password
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation text-base"></i>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Email Address <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="doctor@hospital.org"
                className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all placeholder:text-gray-400"
                required
              />
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#C0192B] hover:bg-[#a11424] text-white font-semibold py-3 rounded-lg text-sm transition-all shadow-sm hover:shadow focus:outline-none cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin"></i>
                    <span>Signing in...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <i className="fa-solid fa-arrow-right text-xs"></i>
                  </>
                )}
              </button>

              <div className="text-center text-xs text-gray-600 pt-3 border-t border-gray-100">
                Don't have an account?{' '}
                <Link
                  to="/user/register"
                  className="text-[#C0192B] hover:text-[#a11424] font-bold hover:underline cursor-pointer ml-1"
                >
                  Create an Account
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

export default UserLoginPage;
