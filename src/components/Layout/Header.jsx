import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LuUser, 
  LuLock, 
  LuKeyRound,
  LuLogOut, 
  LuSun, 
  LuMoon, 
  LuSearch, 
  LuBell, 
  LuExternalLink, 
  LuMenu, 
  LuChevronDown, 
  LuCheck, 
  LuX,
  LuShieldCheck,
  LuCode
} from 'react-icons/lu';
import { getStoredAuth, clearAuthSession, userApi, saveAuthSession } from '../../services/api';

const Header = ({ onToggleSidebar, onToggleMobileSidebar, pageTitle = 'Dashboard' }) => {
  const navigate = useNavigate();
  const authData = getStoredAuth();
  const initialUser = authData?.user || authData || {};
  
  const [userProfile, setUserProfile] = useState({
    title: initialUser.title || 'Dr.',
    name: initialUser.name || 'SPCTT Administrator',
    email: initialUser.email || 'admin@spctt.org',
    organization: initialUser.organization || 'SPCTT Society',
    phone: initialUser.phone || '+91 9876543210',
    role: initialUser.role || 'admin'
  });

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('spctt_admin_theme') || 'light';
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    title: 'Dr.',
    name: '',
    phone: '',
    organization: ''
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });

  const profileRef = useRef(null);
  const notifRef = useRef(null);
  const searchRef = useRef(null);

  // Sync theme attribute with document root & persist to localStorage
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('spctt_admin_theme', theme);
  }, [theme]);

  // Load latest admin profile
  useEffect(() => {
    async function loadLatestProfile() {
      try {
        const res = await userApi.getProfile();
        if (res.status && res.data?.user) {
          const u = res.data.user;
          setUserProfile({
            title: u.title || 'Dr.',
            name: u.name,
            email: u.email,
            organization: u.organization || '',
            phone: u.phone || '',
            role: u.role || 'admin'
          });
          setProfileForm({
            title: u.title || 'Dr.',
            name: u.name || '',
            phone: u.phone || '',
            organization: u.organization || ''
          });
        }
      } catch (err) {
        console.error('Error fetching admin header profile:', err);
      }
    }

    loadLatestProfile();
  }, []);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Open Profile Modal
  const handleOpenProfileModal = () => {
    setIsProfileOpen(false);
    setProfileForm({
      title: userProfile.title || 'Dr.',
      name: userProfile.name || '',
      phone: userProfile.phone || '',
      organization: userProfile.organization || ''
    });
    setProfileMsg({ type: '', text: '' });
    setShowProfileModal(true);
  };

  // Open Password Modal
  const handleOpenPasswordModal = () => {
    setIsProfileOpen(false);
    setPasswordForm({
      newPassword: '',
      confirmPassword: ''
    });
    setPasswordMsg({ type: '', text: '' });
    setShowPasswordModal(true);
  };

  // Save Profile Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });

    if (!profileForm.name.trim()) {
      setProfileMsg({ type: 'error', text: 'Full name is required.' });
      return;
    }

    try {
      setProfileSaving(true);
      const res = await userApi.updateProfile({
        title: profileForm.title,
        name: profileForm.name.trim(),
        phone: profileForm.phone.trim(),
        organization: profileForm.organization.trim()
      });

      if (res.status && res.data?.user) {
        const updated = res.data.user;
        setUserProfile(prev => ({
          ...prev,
          title: updated.title,
          name: updated.name,
          phone: updated.phone,
          organization: updated.organization
        }));

        // Update stored auth
        if (authData) {
          saveAuthSession({
            ...authData,
            user: updated,
            name: updated.name
          });
        }

        setProfileMsg({ type: 'success', text: 'Profile updated successfully!' });
        setTimeout(() => {
          setShowProfileModal(false);
        }, 1200);
      } else {
        setProfileMsg({ type: 'error', text: res.message || 'Failed to update profile.' });
      }
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Error saving profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  // Save Password Handler
  const handleSavePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordMsg({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    try {
      setPasswordSaving(true);
      const res = await userApi.updateProfile({
        password: passwordForm.newPassword
      });

      if (res.status) {
        setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
        setTimeout(() => {
          setShowPasswordModal(false);
        }, 1200);
      } else {
        setPasswordMsg({ type: 'error', text: res.message || 'Failed to change password.' });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Error updating password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleLogout = () => {
    setIsProfileOpen(false);
    clearAuthSession();
    navigate('/admin/login');
  };

  return (
    <header className="spctt-header">
      {/* Left side: Toggles & Title */}
      <div className="header-left">
        {/* Mobile Toggle */}
        <button
          type="button"
          className="sidebar-toggle-btn d-lg-none"
          onClick={onToggleMobileSidebar}
          aria-label="Toggle Mobile Sidebar"
        >
          <LuMenu size={20} />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          type="button"
          className="sidebar-toggle-btn d-none d-lg-flex"
          onClick={onToggleSidebar}
          title="Collapse/Expand Sidebar"
        >
          <LuMenu size={20} />
        </button>

        <div className="header-page-title-group">
          <h1 className="header-page-title">{pageTitle}</h1>
          <div className="header-breadcrumb">
            <span>SPCTT 2026 Admin</span>
            <span>›</span>
            <span className="text-primary fw-medium">{pageTitle}</span>
          </div>
        </div>
      </div>

      {/* Right side: Actions & Profile */}
      <div className="header-right">
        {/* Live Public Website Link */}
        <a
          href="https://registration.spctt2026.elisyan.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="live-site-btn"
          title="Visit Public Website"
        >
          <LuExternalLink size={14} />
          <span>Live Site</span>
        </a>

        {/* Dark / Light Mode Toggle Button */}
        <button
          type="button"
          className="header-icon-btn theme-toggle-btn"
          title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          onClick={toggleTheme}
          aria-label="Toggle Dark or Light Mode"
        >
          {theme === 'dark' ? <LuSun size={18} className="text-warning" /> : <LuMoon size={18} />}
        </button>

        {/* Admin Profile Dropdown */}
        <div className="header-profile-dropdown" ref={profileRef}>
          <button
            type="button"
            className="header-profile-btn"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="header-profile-avatar">
              <LuUser size={16} />
            </div>
            <div className="header-profile-info">
              <span className="header-profile-name">{userProfile.name}</span>
              <span className="header-profile-role text-capitalize">{userProfile.role}</span>
            </div>
            <LuChevronDown className="text-muted" size={13} />
          </button>

          {isProfileOpen && (
            <div className="header-dropdown-menu">
              <div className="dropdown-header-box">
                <div className="dropdown-header-title">{userProfile.name}</div>
                <div className="dropdown-header-subtitle">{userProfile.email}</div>
              </div>
              
              {/* 1. Working My Profile Button */}
              <button
                type="button"
                className="dropdown-item-link border-0 bg-transparent w-100 text-start"
                onClick={handleOpenProfileModal}
              >
                <LuUser className="dropdown-item-icon text-primary" size={16} />
                <span>My Profile</span>
              </button>
              
              {/* 2. Working Change Password Button */}
              <button
                type="button"
                className="dropdown-item-link border-0 bg-transparent w-100 text-start"
                onClick={handleOpenPasswordModal}
              >
                <LuKeyRound className="dropdown-item-icon text-info" size={16} />
                <span>Change Password</span>
              </button>

              <div className="dropdown-divider my-1 border-top"></div>

              {/* 3. Logout */}
              <button
                type="button"
                className="dropdown-item-link text-danger border-0 bg-transparent w-100 text-start"
                onClick={handleLogout}
              >
                <LuLogOut className="dropdown-item-icon" size={16} />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. MY PROFILE MODAL */}
      {/* ========================================================================= */}
      {showProfileModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg border-0">
              <div className="modal-header border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 bg-primary-subtle text-primary rounded-3">
                    <LuUser size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">Administrator Profile</h5>
                    <p className="text-muted small mb-0">Update your administrator details</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowProfileModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSaveProfile}>
                <div className="modal-body p-4 space-y-3">
                  {profileMsg.text && (
                    <div className={`alert ${profileMsg.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 small mb-3`}>
                      {profileMsg.text}
                    </div>
                  )}

                  <div className="row g-3">
                    <div className="col-4">
                      <label className="form-label small fw-bold text-muted text-uppercase">Title</label>
                      <select
                        value={profileForm.title}
                        onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                        className="form-select"
                      >
                        <option value="Dr.">Dr.</option>
                        <option value="Prof.">Prof.</option>
                        <option value="Mr.">Mr.</option>
                        <option value="Ms.">Ms.</option>
                        <option value="Mrs.">Mrs.</option>
                      </select>
                    </div>

                    <div className="col-8">
                      <label className="form-label small fw-bold text-muted text-uppercase">Full Name <span className="text-danger">*</span></label>
                      <input
                        type="text"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        className="form-control"
                        required
                      />
                    </div>
                  </div>

                  <div className="mb-3 mt-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Email Address</label>
                    <input
                      type="email"
                      value={userProfile.email}
                      disabled
                      className="form-control bg-light text-muted"
                    />
                    <span className="text-muted" style={{ fontSize: '0.72rem' }}>Administrator email address cannot be modified.</span>
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Organization</label>
                      <input
                        type="text"
                        value={profileForm.organization}
                        onChange={(e) => setProfileForm({ ...profileForm, organization: e.target.value })}
                        placeholder="e.g. SPCTT Institute"
                        className="form-control"
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-bold text-muted text-uppercase">Mobile Number</label>
                      <input
                        type="text"
                        value={profileForm.phone}
                        onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                        placeholder="+91 9876543210"
                        className="form-control"
                      />
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button
                    type="button"
                    onClick={() => setShowProfileModal(false)}
                    className="btn btn-light"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={profileSaving}
                    className="btn btn-primary px-4"
                  >
                    {profileSaving ? 'Saving...' : 'Save Profile'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CHANGE PASSWORD MODAL */}
      {/* ========================================================================= */}
      {showPasswordModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content rounded-4 shadow-lg border-0">
              <div className="modal-header border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <div className="p-2 bg-info-subtle text-info rounded-3">
                    <LuKeyRound size={20} />
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">Change Password</h5>
                    <p className="text-muted small mb-0">Set a new secure administrator password</p>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPasswordModal(false)}
                ></button>
              </div>

              <form onSubmit={handleSavePassword}>
                <div className="modal-body p-4 space-y-3">
                  {passwordMsg.text && (
                    <div className={`alert ${passwordMsg.type === 'success' ? 'alert-success' : 'alert-danger'} py-2 small mb-3`}>
                      {passwordMsg.text}
                    </div>
                  )}

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">New Password <span className="text-danger">*</span></label>
                    <input
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="form-control"
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-bold text-muted text-uppercase">Repeat New Password <span className="text-danger">*</span></label>
                    <input
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                      placeholder="Repeat your new password"
                      className="form-control"
                      required
                    />
                  </div>
                </div>

                <div className="modal-footer border-top">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="btn btn-light"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={passwordSaving}
                    className="btn btn-primary px-4"
                  >
                    {passwordSaving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
