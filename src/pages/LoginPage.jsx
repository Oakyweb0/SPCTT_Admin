import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuCheck, LuTriangleAlert } from 'react-icons/lu';
import bannerImg from '../assets/images/banner1.jpeg';
import logoImg from '../assets/images/logo.png';
import { authApi, saveAuthSession } from '../services/api';

const LoginPage = () => {
  const navigate = useNavigate();

  // Login form state
  const [loginData, setLoginData] = useState({
    email: 'admin@spctt.org',
    password: '',
    rememberMe: true,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (errorMsg) setErrorMsg('');
  };

  // Submit Admin Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!loginData.email.trim() || !loginData.password.trim()) {
      setErrorMsg('Please enter both Email and Password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.adminLogin({
        email: loginData.email.trim(),
        password: loginData.password,
      });

      if (response.status && response.data) {
        const { token, user } = response.data;
        
        const authPayload = {
          isLoggedIn: true,
          token,
          email: user.email,
          name: user.name,
          role: user.role === 'admin' ? 'Super Admin' : user.role,
          phone: user.phone,
          id: user.id,
          avatar: user.avatar,
          loginTime: new Date().toISOString(),
        };

        saveAuthSession(authPayload);
        setSuccessMsg('Login successful! Redirecting to Admin Dashboard...');

        setTimeout(() => {
          setIsLoading(false);
          navigate('/admin/dashboard', { replace: true });
        }, 800);
      } else {
        setErrorMsg(response.message || 'Login failed. Please check credentials.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setErrorMsg(err.message || 'Could not connect to API server. Please check your network or server status.');
      setIsLoading(false);
    }
  };

  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setForgotLoading(true);
    setForgotError('');
    setForgotMsg('');

    try {
      const res = await authApi.forgotPassword(resetEmail.trim());
      if (res.status || res.success) {
        setResetSent(true);
        setForgotMsg(res.message || 'A 6-digit OTP has been sent to your email.');
      } else {
        setForgotError(res.message || 'Failed to send reset OTP.');
      }
    } catch (err) {
      setForgotError(err.message || 'Error processing forgot password request.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="login-page-wrapper position-relative">
      {/* Small Compact Floating Toast Notification */}
      {successMsg && (
        <div 
          className="position-fixed top-0 start-50 translate-middle-x p-3" 
          style={{ zIndex: 99999, pointerEvents: 'none' }}
        >
          <div 
            className="alert alert-success shadow-lg rounded-pill mb-0 d-flex align-items-center gap-2 py-2 px-3.5 border border-success-subtle bg-white text-success fw-semibold"
            role="alert"
            style={{ 
              pointerEvents: 'auto', 
              animation: 'fadeIn 0.25s ease-in-out',
              backdropFilter: 'blur(10px)',
              fontSize: '0.84rem',
              boxShadow: '0 8px 24px rgba(16, 185, 129, 0.22), 0 2px 6px rgba(0,0,0,0.08)'
            }}
          >
            <div className="d-flex align-items-center justify-content-center bg-success text-white rounded-circle" style={{ width: '20px', height: '20px' }}>
              <LuCheck size={13} strokeWidth={3} />
            </div>
            <span style={{ letterSpacing: '0.01em' }}>{successMsg}</span>
          </div>
        </div>
      )}

      {/* Full-screen Background Banner with Top Alignment & Overlay */}
      <div 
        className="login-bg-banner"
        style={{ backgroundImage: `url(${bannerImg})` }}
      >
        <div className="login-backdrop-overlay"></div>
      </div>

      {/* Center Login Container */}
      <div className="container login-main-container">
        <div className="row justify-content-center align-items-center min-vh-100 py-4">
          <div className="col-12 col-sm-10 col-md-8 col-lg-5 col-xl-4">
            
            {/* Login Card */}
            <div className="login-glass-card">
              {/* Card Header & Brand Logo */}
              <div className="login-card-header text-center">
                <div className="login-logo-container mb-3">
                  <img
                    src={logoImg || '/logo.png'}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/logo.png';
                    }}
                    alt="SPCTT 2026 Logo"
                    className="login-brand-logo"
                  />
                </div>
                <h2 className="login-title mb-1">Admin Panel</h2>
                <p className="text-muted small mb-4">
                  Sign in to manage conference operations
                </p>
              </div>

              {/* Error Feedback Message */}
              {errorMsg && (
                <div className="alert alert-danger login-alert d-flex align-items-center gap-2 mb-3 py-2 px-3 rounded-3" role="alert">
                  <LuTriangleAlert size={16} className="text-danger flex-shrink-0" />
                  <div className="small fw-medium">{errorMsg}</div>
                </div>
              )}

              {/* ADMIN LOGIN FORM */}
              <form onSubmit={handleLoginSubmit} className="login-form">
                {/* Email Field */}
                <div className="form-group mb-3">
                  <label htmlFor="email" className="form-label login-input-label">
                    Admin Email
                  </label>
                  <div className="login-input-group">
                    <span className="login-input-icon">
                      <i className="fa-solid fa-envelope"></i>
                    </span>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      className="form-control login-input-control"
                      placeholder="admin@spctt.org"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Password Field with Show/Hide Toggle */}
                <div className="form-group mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <label htmlFor="password" className="form-label login-input-label mb-0">
                      Password
                    </label>
                    <button
                      type="button"
                      className="btn-link-subtle"
                      onClick={() => setShowForgotModal(true)}
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="login-input-group">
                    <span className="login-input-icon">
                      <i className="fa-solid fa-lock"></i>
                    </span>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      id="password"
                      name="password"
                      className="form-control login-input-control"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      className="login-password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? 'Hide password' : 'Show password'}
                      aria-label="Toggle password visibility"
                    >
                      <i className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <div className="form-check login-checkbox">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="rememberMe"
                      name="rememberMe"
                      checked={loginData.rememberMe}
                      onChange={handleLoginChange}
                    />
                    <label className="form-check-label small text-muted" htmlFor="rememberMe">
                      Keep me signed in
                    </label>
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  className="btn btn-primary login-submit-btn w-100"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Sign In</span>
                  )}
                </button>
              </form>
            </div>

          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="modal show d-block login-forgot-modal" tabIndex="-1">
          <div className="modal-backdrop-custom" onClick={() => setShowForgotModal(false)}></div>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg border-0 rounded-4">
              <div className="modal-header border-bottom-0 pb-0">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="fa-solid fa-key text-primary me-2"></i> Password Recovery
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowForgotModal(false)}
                ></button>
              </div>
              <div className="modal-body py-3">
                {resetSent ? (
                  <div className="alert alert-success d-flex flex-column gap-2 p-3">
                    <div className="d-flex align-items-center gap-2">
                      <i className="fa-solid fa-circle-check fs-5 text-success"></i>
                      <strong>OTP Sent to Your Email!</strong>
                    </div>
                    <p className="mb-2 small text-muted">
                      {forgotMsg || 'A 6-digit OTP has been sent to your administrator email address. Please check your inbox.'}
                    </p>
                    <div className="d-flex justify-content-end gap-2 mt-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => {
                          setShowForgotModal(false);
                          setResetSent(false);
                          setResetEmail('');
                        }}
                      >
                        Close
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary"
                        onClick={() => {
                          setShowForgotModal(false);
                          navigate(`/user/reset-password?email=${encodeURIComponent(resetEmail.trim())}`);
                        }}
                      >
                        Enter OTP & Reset Password →
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-muted small mb-3">
                      Enter your registered administrator email address to receive a 6-digit OTP for resetting your password.
                    </p>

                    {forgotError && (
                      <div className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2 mb-3">
                        <i className="fa-solid fa-circle-exclamation flex-shrink-0"></i>
                        <span>{forgotError}</span>
                      </div>
                    )}

                    <form onSubmit={handleForgotSubmit}>
                      <div className="mb-3">
                        <label className="form-label small fw-semibold">Admin Email Address</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="admin@spctt.org"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-light"
                          onClick={() => {
                            setShowForgotModal(false);
                            setForgotError('');
                          }}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary" disabled={forgotLoading}>
                          {forgotLoading ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                              <span>Sending...</span>
                            </>
                          ) : (
                            <span>Send OTP</span>
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LoginPage;
