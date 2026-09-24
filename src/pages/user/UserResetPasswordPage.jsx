import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import UserHeader from '../../components/Layout/UserHeader';
import { authApi } from '../../services/api';

const UserResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const emailFromUrl = searchParams.get('email') || '';
  const tokenFromUrl = searchParams.get('token') || searchParams.get('otp') || '';

  const [formData, setFormData] = useState({
    email: emailFromUrl,
    otp: tokenFromUrl,
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  useEffect(() => {
    if (emailFromUrl || tokenFromUrl) {
      setFormData(prev => ({
        ...prev,
        email: emailFromUrl || prev.email,
        otp: tokenFromUrl || prev.otp
      }));
    }
  }, [emailFromUrl, tokenFromUrl]);

  // Resend cooldown timer
  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleResendOtp = async () => {
    if (!formData.email.trim()) {
      setError('Please enter your email address to resend OTP.');
      return;
    }

    try {
      setResending(true);
      setError('');
      setInfoMsg('');
      const res = await authApi.forgotPassword(formData.email.trim());
      if (res.status || res.success) {
        setInfoMsg(res.message || 'A new 6-digit OTP has been sent to your email.');
        setResendCooldown(60); // 60 seconds cooldown
      } else {
        setError(res.message || 'Could not resend OTP.');
      }
    } catch (err) {
      setError(err.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setInfoMsg('');

    if (!formData.otp.trim()) {
      setError('Please enter the 6-digit OTP sent to your email.');
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
        email: formData.email.trim(),
        otp: formData.otp.trim(),
        token: formData.otp.trim(),
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword
      });

      if (res.status || res.success) {
        setSuccess(res.message || 'Your password has been reset successfully! Redirecting to Sign In...');
        setTimeout(() => {
          navigate('/user/login');
        }, 2500);
      } else {
        setError(res.message || 'Failed to reset password.');
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error updating password. OTP may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <UserHeader pageTitle="Reset Password" subtitle="Verify OTP and create a new password" />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-10 md:py-14">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 md:p-8">
          <div className="border-b border-gray-100 pb-4 mb-6 text-center">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl">
              <i className="fa-solid fa-lock"></i>
            </div>
            <h2 className="text-xl font-bold text-gray-800 tracking-tight">
              Reset Your Password
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Enter the 6-digit OTP sent to your registered email and choose a new password.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
              <i className="fa-solid fa-circle-exclamation text-base shrink-0"></i>
              <span>{error}</span>
            </div>
          )}

          {infoMsg && (
            <div className="mb-5 p-4 rounded-lg bg-blue-50 border border-blue-200 text-blue-700 text-sm flex items-center gap-3">
              <i className="fa-solid fa-circle-info text-base shrink-0"></i>
              <span>{infoMsg}</span>
            </div>
          )}

          {success && (
            <div className="mb-5 p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-3 font-semibold">
              <i className="fa-solid fa-circle-check text-base shrink-0"></i>
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Registered Email Address <span className="text-red-600">*</span>
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
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  6-Digit OTP Code <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resending || resendCooldown > 0}
                  className="text-xs text-[#C0192B] hover:text-[#a11424] font-semibold hover:underline disabled:opacity-50 disabled:no-underline cursor-pointer"
                >
                  {resending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend OTP'}
                </button>
              </div>
              <input
                type="text"
                name="otp"
                maxLength={8}
                value={formData.otp}
                onChange={handleChange}
                placeholder="123456"
                className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-gray-900 font-bold text-center tracking-[0.35em] text-lg focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all font-mono placeholder:tracking-normal placeholder:font-normal placeholder:text-sm placeholder:text-gray-400"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">Check your inbox or spam folder for the 6-digit code.</p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider">
                  New Password <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-xs text-gray-500 hover:text-gray-700"
                >
                  <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} me-1`}></i>
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="Minimum 6 characters"
                className="w-full h-11 px-3.5 border border-gray-300 rounded-lg text-gray-800 text-sm focus:outline-none focus:border-[#476EAC] focus:ring-2 focus:ring-[#476EAC]/20 transition-all placeholder:text-gray-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                Confirm New Password <span className="text-red-600">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
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

              <div className="text-center text-xs text-gray-600 pt-3 border-t border-gray-100 flex items-center justify-between">
                <Link
                  to="/user/forgot-password"
                  className="text-gray-500 hover:text-gray-800 font-medium hover:underline cursor-pointer"
                >
                  ← Request New OTP
                </Link>
                <Link
                  to="/user/login"
                  className="text-[#C0192B] hover:text-[#a11424] font-bold hover:underline cursor-pointer"
                >
                  Sign In
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

