import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserHeader from '../../components/Layout/UserHeader';
import { getUserAuth, userApi, authApi, saveUserAuth } from '../../services/api';

const UserProfilePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: 'Mr.',
    name: '',
    email: '',
    organization: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'India',
    pincode: ''
  });

  const [passData, setPassData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [passSaving, setPassSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passError, setPassError] = useState('');

  useEffect(() => {
    const auth = getUserAuth();
    if (!auth || !auth.token) {
      navigate('/user/login');
      return;
    }

    async function loadProfile() {
      try {
        setLoading(true);
        const res = await userApi.getProfile();
        if (res.status && res.data?.user) {
          const u = res.data.user;
          setFormData({
            title: u.title || 'Mr.',
            name: u.name || '',
            email: u.email || '',
            organization: u.organization || '',
            phone: u.phone || '',
            address: u.address || '',
            city: u.city || '',
            state: u.state || '',
            country: u.country || 'India',
            pincode: u.pincode || '',
            password: ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setSaving(true);
      const res = await userApi.updateProfile(formData);
      if (res.status && res.data?.user) {
        setSuccess('Profile updated successfully!');
        const currentAuth = getUserAuth();
        if (currentAuth) {
          saveUserAuth({
            ...currentAuth,
            user: res.data.user
          });
        }
      } else {
        setError(res.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message || 'Error updating profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!passData.currentPassword) {
      setPassError('Please enter your current password.');
      return;
    }

    if (!passData.newPassword || passData.newPassword.length < 6) {
      setPassError('New password must be at least 6 characters long.');
      return;
    }

    if (passData.newPassword !== passData.confirmPassword) {
      setPassError('New password and confirm password do not match.');
      return;
    }

    try {
      setPassSaving(true);
      const res = await authApi.changePassword({
        currentPassword: passData.currentPassword,
        newPassword: passData.newPassword,
        confirmPassword: passData.confirmPassword
      });

      if (res.status) {
        setPassSuccess(res.message || 'Password changed successfully!');
        setPassData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setPassError(res.message || 'Failed to change password.');
      }
    } catch (err) {
      console.error(err);
      setPassError(err.message || 'Current password is incorrect or request failed.');
    } finally {
      setPassSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <UserHeader pageTitle="My Profile" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10 md:py-14">
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-8">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Personal & Contact Profile</h2>
            <p className="text-sm text-gray-500">Manage your delegate account details & security settings</p>
          </div>
          <Link
            to="/user/dashboard"
            className="text-sm text-[#004b63] hover:underline font-medium"
          >
            ← Back to Dashboard
          </Link>
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

        {loading ? (
          <div className="py-20 text-center text-gray-500">
            <div className="w-8 h-8 border-4 border-[#004b63] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            Loading profile...
          </div>
        ) : (
          <div className="space-y-12">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Primary Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Title
                    </label>
                    <select
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-gray-300 rounded bg-white text-gray-800 focus:outline-none focus:border-[#004b63]"
                    >
                      <option value="Mr.">Mr.</option>
                      <option value="Ms.">Ms.</option>
                      <option value="Mrs.">Mrs.</option>
                      <option value="Dr.">Dr.</option>
                      <option value="Prof.">Prof.</option>
                    </select>
                  </div>

                  <div className="md:col-span-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63]"
                      required
                    />
                  </div>

                  <div className="md:col-span-5">
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      disabled
                      className="w-full h-11 px-3 border border-gray-200 bg-gray-50 rounded text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Organization / Institution <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63]"
                    />
                  </div>
                </div>
              </div>

              {/* Address Details */}
              <div className="space-y-4 pt-4 border-t border-gray-200">
                <h3 className="text-base font-bold text-gray-900">Address & Location</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address
                  </label>
                  <textarea
                    rows={2}
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      State / Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Pincode / Zipcode
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63]"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Profile Details */}
              <div className="pt-4 flex items-center gap-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#9e1c2b] hover:bg-[#831422] text-white font-medium px-8 py-2.5 rounded text-sm transition-all shadow-sm focus:outline-none cursor-pointer disabled:opacity-50"
                >
                  {saving ? 'Updating Profile...' : 'Save Profile Details'}
                </button>
              </div>
            </form>

            {/* Change Password Form */}
            <div className="pt-8 border-t border-gray-200">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900">Security & Password</h3>
                <p className="text-xs text-gray-500">Update your account password</p>
              </div>

              {passSuccess && (
                <div className="mb-6 p-4 rounded bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium flex items-center gap-2">
                  <i className="fa-solid fa-circle-check"></i>
                  <span>{passSuccess}</span>
                </div>
              )}

              {passError && (
                <div className="mb-6 p-4 rounded bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
                  <i className="fa-solid fa-circle-exclamation"></i>
                  <span>{passError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Current Password <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passData.currentPassword}
                    onChange={(e) => setPassData({ ...passData, currentPassword: e.target.value })}
                    placeholder="Enter current password"
                    className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      New Password <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="password"
                      name="newPassword"
                      value={passData.newPassword}
                      onChange={(e) => setPassData({ ...passData, newPassword: e.target.value })}
                      placeholder="Minimum 6 characters"
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63]"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Confirm New Password <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={passData.confirmPassword}
                      onChange={(e) => setPassData({ ...passData, confirmPassword: e.target.value })}
                      placeholder="Re-enter new password"
                      className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63]"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={passSaving}
                    className="bg-[#004b63] hover:bg-[#003749] text-white font-medium px-6 py-2.5 rounded text-sm transition-all shadow-sm focus:outline-none cursor-pointer disabled:opacity-50"
                  >
                    {passSaving ? 'Updating Password...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserProfilePage;
