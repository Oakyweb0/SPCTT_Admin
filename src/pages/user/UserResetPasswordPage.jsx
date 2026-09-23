import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import UserHeader from '../../components/Layout/UserHeader';
import { authApi } from '../../services/api';

const UserResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromUrl = searchParams.get('token') || '';

  const [formData, setFormData] = useState({
    token: tokenFromUrl,
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (tokenFromUrl) {
      setFormData(prev => ({ ...prev, token: tokenFromUrl }));
    }
  }, [tokenFromUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.token.trim()) {
      setError('Please provide a valid reset token.');
      return;
    }

    if (!formData.newPassword) {
      setError('Please enter your new password.');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.resetPassword({
        token: formData.token.trim(),
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (res.status) {
        setSuccess(res.message || 'Your password has been reset successfully! Redirecting to Sign In...');
        setTimeout(() => {
          navigate('/user/login');
        }, 2500);
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error resetting password. Token may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <UserHeader pageTitle="Reset Password" subtitle="Set a new password for your account" />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 md:py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8">
          <div className="border-b border-gray-100 pb-4 mb-6 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
              <i className="fa-solid fa-[#C0192B] fa-lock"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Reset Your Password
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter your reset token and set your new password.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation text-base"></i>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 font-semibold">
              <i className="fa-solid fa-circle-check text-base"></i>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Reset Token <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="token"
                value={formData.token}
                onChange={handleChange}
                placeholder="Enter reset token"
                className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                New Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
                Confirm New Password <span className="text-red-600">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Re-enter new password"
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
                    <span>Updating Password...</span>
                  </>
                ) : (
                  <>
                    <span>Update Password</span>
                    <i className="fa-solid fa-check text-xs"></i>
                  </>
                )}
              </button>

              <div className="text-center text-xs text-gray-600 pt-3 border-t border-gray-100">
                Remember your password?{' '}
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

export default UserResetPasswordPage;
