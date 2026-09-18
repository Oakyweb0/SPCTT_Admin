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
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <UserHeader pageTitle="User Login" />

      <main className="flex-1 max-w-md w-full mx-auto px-4 py-16">
        {error && (
          <div className="mb-6 p-4 rounded bg-red-50 border border-red-200 text-red-700 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-gray-100 p-8 rounded-lg shadow-sm">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email Address <span className="text-red-600">*</span>
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@mail.com"
              className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63] transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password <span className="text-red-600">*</span>
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full h-11 px-3 border border-gray-300 rounded text-gray-800 focus:outline-none focus:border-[#004b63] focus:ring-1 focus:ring-[#004b63] transition-colors"
              required
            />
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto bg-[#9e1c2b] hover:bg-[#831422] text-white font-medium px-8 py-2.5 rounded text-sm transition-all shadow-sm focus:outline-none cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>

            <Link
              to="/user/register"
              className="text-[#9e1c2b] hover:text-[#831422] font-medium text-sm hover:underline cursor-pointer"
            >
              Create an Account
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
};

export default UserLoginPage;
