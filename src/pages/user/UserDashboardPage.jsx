import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import UserHeader from '../../components/Layout/UserHeader';
import { getUserAuth, clearUserAuth, userApi, registrationApi } from '../../services/api';

const UserDashboardPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [registration, setRegistration] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getUserAuth();
    if (!auth || !auth.token) {
      navigate('/user/login');
      return;
    }

    setUser(auth.user);

    // Fetch latest profile & registration info
    async function loadData() {
      try {
        const [profileRes, regRes] = await Promise.all([
          userApi.getProfile().catch(() => null),
          registrationApi.getCurrentRegistration().catch(() => null)
        ]);

        if (profileRes?.data?.user) {
          setUser(profileRes.data.user);
        }
        if (regRes?.data?.registration) {
          setRegistration(regRes.data.registration);
        }
      } catch (err) {
        console.error('Error loading dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [navigate]);

  const handleLogout = () => {
    clearUserAuth();
    navigate('/user/login');
  };

  const displayName = user?.name ? `${user.title || ''} ${user.name}`.trim() : 'User';
  const displayEmail = user?.email || '';

  return (
    <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans">
      <UserHeader pageTitle="Dashboard" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-10">
        {/* Welcome Banner */}
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
            Welcome {displayName}!
          </h2>
          <p className="text-gray-600 italic text-base">
            {displayEmail}
          </p>

          {registration?.payment_status === 'paid' && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Registration Confirmed: {registration.registration_code} ({registration.category_name})
            </div>
          )}
        </div>

        {/* 3 Dashboard Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Registration */}
          <div className="bg-[#f7f9fa] border border-gray-200/80 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              {/* Card Icon */}
              <div className="relative w-11 h-11 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {/* Decorative dots */}
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Registration</h3>
            </div>

            <ul className="space-y-2.5 text-sm text-gray-800 ml-1">
              <li className="flex items-center gap-2">
                <span className="text-gray-500">•</span>
                <Link
                  to="/user/registration"
                  className="text-gray-800 hover:text-[#9e1c2b] hover:underline font-medium transition-colors"
                >
                  Select Registration Category
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-500">•</span>
                <Link
                  to="/user/registration?step=4"
                  className="text-gray-800 hover:text-[#9e1c2b] hover:underline font-medium transition-colors"
                >
                  Update Billing Details
                </Link>
              </li>
            </ul>
          </div>

          {/* Card 2: Abstract Submission */}
          <div className="bg-[#f7f9fa] border border-gray-200/80 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-11 h-11 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 border border-amber-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Abstract Submission</h3>
            </div>

            <ul className="space-y-2.5 text-sm text-gray-800 ml-1">
              <li className="flex items-center gap-2">
                <span className="text-gray-500">•</span>
                <Link
                  to="/user/abstracts"
                  className="text-gray-800 hover:text-[#9e1c2b] hover:underline font-medium transition-colors"
                >
                  View My Submitted Abstracts
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-500">•</span>
                <Link
                  to="/user/abstracts?action=submit"
                  className="text-gray-800 hover:text-[#9e1c2b] hover:underline font-medium transition-colors"
                >
                  Review Submitted Abstracts
                </Link>
              </li>
            </ul>
          </div>

          {/* Card 3: My Account */}
          <div className="bg-[#f7f9fa] border border-gray-200/80 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-11 h-11 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 border border-purple-100">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-400 rounded-full"></span>
              </div>
              <h3 className="text-lg font-bold text-gray-900">My Account</h3>
            </div>

            <ul className="space-y-2.5 text-sm text-gray-800 ml-1">
              <li className="flex items-center gap-2">
                <span className="text-gray-500">•</span>
                <Link
                  to="/user/profile"
                  className="text-gray-800 hover:text-[#9e1c2b] hover:underline font-medium transition-colors"
                >
                  My Profile
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-500">•</span>
                <Link
                  to="/user/registration?step=4"
                  className="text-gray-800 hover:text-[#9e1c2b] hover:underline font-medium transition-colors"
                >
                  Make Payment
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-500">•</span>
                <Link
                  to="/user/invoices"
                  className="text-gray-800 hover:text-[#9e1c2b] hover:underline font-medium transition-colors"
                >
                  Invoice(s) & Receipt(s)
                </Link>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-gray-500">•</span>
                <button
                  onClick={handleLogout}
                  className="text-gray-800 hover:text-[#9e1c2b] hover:underline font-medium transition-colors text-left focus:outline-none"
                >
                  Logout
                </button>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserDashboardPage;
