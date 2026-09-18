import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

  const handleForgotSubmit = (e) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSent(true);
    setTimeout(() => {
      setResetSent(false);
      setShowForgotModal(false);
      setResetEmail('');
    }, 2500);
  };

  return (
    <div className="login-page-wrapper">
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

              {/* Alert Feedback Messages */}
              {errorMsg && (
                <div className="alert alert-danger login-alert d-flex align-items-center gap-2 mb-3" role="alert">
                  <i className="fa-solid fa-circle-exclamation flex-shrink-0"></i>
                  <div className="small">{errorMsg}</div>
                </div>
              )}

              {successMsg && (
                <div className="alert alert-success login-alert d-flex align-items-center gap-2 mb-3" role="alert">
                  <i className="fa-solid fa-circle-check flex-shrink-0"></i>
                  <div className="small">{successMsg}</div>
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
                  <div className="alert alert-success d-flex align-items-center gap-2">
                    <i className="fa-solid fa-circle-check fs-5"></i>
                    <div>
                      <strong>Recovery Email Sent!</strong>
                      <p className="mb-0 small">Please check your inbox for password reset instructions.</p>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-muted small mb-3">
                      Enter your registered administrator email address and we will send you a reset link.
                    </p>
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
                          onClick={() => setShowForgotModal(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-primary">
                          Send Reset Link
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
