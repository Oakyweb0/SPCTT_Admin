import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import UserHeader from '../../components/Layout/UserHeader';
import { authApi } from '../../services/api';

const UserForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email.trim()) {
      setError('Please enter your email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await authApi.forgotPassword(email.trim());
      if (res.status || res.success) {
        setSuccess(
          res.message || 'A 6-digit OTP has been sent to your registered email address. Please check your inbox or spam folder.'
        );
      } else {
        setError(res.message || 'Failed to process forgot password request.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error requesting password reset OTP.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <UserHeader pageTitle="Forgot Password" subtitle="Reset your SPCTT conference account password" />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-12 md:py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8">
          <div className="border-b border-gray-100 pb-4 mb-6 text-center">
            <div className="w-12 h-12 bg-red-50 text-[#C0192B] rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
              <i className="fa-solid fa-key"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Forgot Your Password?
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter your registered email address to receive a 6-digit OTP to reset your password.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation text-base"></i>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm space-y-2">
              <div className="flex items-center gap-2 font-bold">
                <i className="fa-solid fa-circle-check text-base"></i>
                <span>OTP Sent Successfully</span>
              </div>
              <p className="text-xs leading-relaxed">{success}</p>
              <div className="pt-2">
                <Link
                  to={`/user/reset-password?email=${encodeURIComponent(email.trim())}`}
                  className="text-xs bg-[#C0192B] text-white px-4 py-2 rounded font-semibold inline-block hover:bg-[#a11424] transition-all"
                >
                  Enter OTP & Reset Password →
                </Link>
              </div>
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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="doctor@hospital.org"
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
                    <span>Processing Request...</span>
                  </>
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <i className="fa-solid fa-paper-plane text-xs"></i>
                  </>
                )}
              </button>

              <div className="text-center text-xs text-gray-600 pt-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to="/user/login"
                  className="text-gray-500 hover:text-gray-800 font-medium hover:underline cursor-pointer"
                >
                  ← Back to Sign In
                </Link>
                <Link
                  to="/user/register"
                  className="text-[#C0192B] hover:text-[#a11424] font-bold hover:underline cursor-pointer"
                >
                  Register Account
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

export default UserForgotPasswordPage;
