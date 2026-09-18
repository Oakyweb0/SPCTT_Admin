import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUserAuth, clearUserAuth } from '../../services/api';

const UserHeader = ({ pageTitle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = getUserAuth();

  const handleLogout = () => {
    clearUserAuth();
    navigate('/user/login');
  };

  const isAuthPage = location.pathname === '/user/login' || location.pathname === '/user/register' || location.pathname === '/register' || location.pathname === '/login';

  return (
    <header className="w-full">
      {/* Top Red Navigation Links */}
      <div className="bg-white py-3 border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex justify-center items-center gap-8 text-sm font-semibold tracking-wider">
          {isAuthPage ? (
            location.pathname === '/user/login' || location.pathname === '/login' ? (
              <Link to="/user/register" className="text-[#a01c2b] hover:text-[#7f131f] uppercase tracking-wider transition-colors">
                CREATE AN ACCOUNT
              </Link>
            ) : (
              <Link to="/user/login" className="text-[#a01c2b] hover:text-[#7f131f] uppercase tracking-wider transition-colors">
                LOGIN
              </Link>
            )
          ) : (
            <>
              <Link
                to="/user/dashboard"
                className={`uppercase tracking-wider transition-colors ${
                  location.pathname === '/user/dashboard' ? 'text-[#a01c2b] font-bold underline underline-offset-4' : 'text-[#a01c2b] hover:text-[#7f131f]'
                }`}
              >
                DASHBOARD
              </Link>
              <button
                onClick={handleLogout}
                className="text-[#a01c2b] hover:text-[#7f131f] uppercase tracking-wider font-semibold transition-colors focus:outline-none"
              >
                LOGOUT
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Banner with Deep Teal background and mesh graphic */}
      <div className="relative bg-[#004b63] text-white py-6 px-4 overflow-hidden shadow-inner">
        {/* Subtle geometric pattern / constellation effect */}
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/3 opacity-25 pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#6ee7b7 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0, 10px 10px'
          }}
        />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h1 className="text-2xl md:text-3xl font-bold tracking-wide">
            {pageTitle || 'SPCTT 2026'}
          </h1>
        </div>
      </div>
    </header>
  );
};

export default UserHeader;
