import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logoImg from '../../assets/images/logo.png';
import { getUserAuth, clearUserAuth } from '../../services/api';

const UserHeader = ({ pageTitle, subtitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getUserAuth();

  const handleLogout = () => {
    clearUserAuth();
    navigate('/user/login');
  };

  const isAuthPage = location.pathname === '/user/login' || location.pathname === '/user/register' || location.pathname === '/register';

  return (
    <header className="w-full shadow-sm">
      {/* Top Navbar with Logo & Links */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between">
          {/* Logo & Conference Brand */}
          <Link to="/" className="flex items-center gap-3 text-decoration-none group">
            <img src={logoImg} alt="SPCTT Logo" className="h-10 w-auto object-contain" />
            <div className="flex flex-col">
              <span className="text-base font-bold text-gray-900 tracking-tight leading-tight group-hover:text-[#476EAC] transition-colors">
                SPCTT 2026
              </span>
              <span className="text-[11px] text-gray-500 font-medium tracking-wide">
                Annual Medical Conference
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-3 sm:gap-6 text-sm font-semibold">
            {isAuthPage ? (
              <>
                {location.pathname === '/user/login' ? (
                  <Link 
                    to="/user/register" 
                    className="text-[#C0192B] hover:text-[#a11424] uppercase tracking-wider text-xs sm:text-sm font-bold transition-colors"
                  >
                    CREATE AN ACCOUNT
                  </Link>
                ) : (
                  <Link 
                    to="/user/login" 
                    className="text-[#C0192B] hover:text-[#a11424] uppercase tracking-wider text-xs sm:text-sm font-bold transition-colors"
                  >
                    LOGIN
                  </Link>
                )}

                <span className="text-gray-300">|</span>

                <Link
                  to="/admin/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-[#476EAC] bg-blue-50 hover:bg-blue-100 transition-colors uppercase tracking-wider"
                  title="Admin Portal Login"
                >
                  <i className="fa-solid fa-lock text-[10px]"></i>
                  <span>Admin Panel</span>
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/user/dashboard"
                  className={`uppercase tracking-wider transition-colors text-xs sm:text-sm ${
                    location.pathname === '/user/dashboard' ? 'text-[#C0192B] font-bold underline underline-offset-4' : 'text-gray-700 hover:text-[#C0192B]'
                  }`}
                >
                  DASHBOARD
                </Link>
                <Link
                  to="/user/abstracts"
                  className={`uppercase tracking-wider transition-colors text-xs sm:text-sm ${
                    location.pathname === '/user/abstracts' ? 'text-[#C0192B] font-bold underline underline-offset-4' : 'text-gray-700 hover:text-[#C0192B]'
                  }`}
                >
                  ABSTRACTS
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-[#C0192B] hover:text-[#a11424] uppercase tracking-wider font-semibold text-xs sm:text-sm transition-colors focus:outline-none bg-transparent border-0 cursor-pointer"
                >
                  LOGOUT
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Banner with Deep Teal background and pattern */}
      <div className="relative bg-gradient-to-r from-[#00384a] via-[#004b63] to-[#00384a] text-white py-8 px-4 overflow-hidden shadow-inner">
        {/* Subtle geometric pattern / constellation effect */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-20 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#6ee7b7 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide !text-white text-white mb-1.5">
            {pageTitle || 'SPCTT 2026'}
          </h1>
          <p className="text-xs md:text-sm text-cyan-100 font-normal opacity-90 max-w-xl mx-auto">
            {subtitle || 'Society for Pulmonary, Critical Care & Thoracic Therapy • 14th Annual Conference'}
          </p>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
