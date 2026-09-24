import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LuLayoutDashboard, LuClipboardList, LuFileText, LuUsers } from 'react-icons/lu';
import logoImg from '../../assets/images/logo.png';

const Sidebar = ({ onNavigate }) => {
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LuLayoutDashboard
    },
    {
      name: 'Registration',
      path: '/admin/registration',
      icon: LuClipboardList
    },
    {
      name: 'Abstract',
      path: '/admin/abstract',
      icon: LuFileText
    },
    {
      name: 'Users',
      path: '/admin/users',
      icon: LuUsers
    }
  ];

  return (
    <aside className="spctt-sidebar">
      {/* Brand Header with Full Logo linking to Dashboard */}
      <div className="sidebar-brand-wrapper">
        <Link
          to="/admin/dashboard"
          onClick={onNavigate}
          className="sidebar-full-logo-box text-decoration-none"
          title="Go to Dashboard"
        >
          <img
            src={logoImg || '/logo.png'}
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = '/logo.png';
            }}
            alt="SPCTT Logo"
            className="sidebar-full-logo"
          />
        </Link>
      </div>

      {/* Simplified Menu Navigation (4 Items) */}
      <div className="sidebar-nav-container">
        <div className="sidebar-section-title">MAIN MENU</div>
        <ul className="sidebar-nav-list">
          {menuItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <li key={index} className="sidebar-nav-item">
                <NavLink
                  to={item.path}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    `sidebar-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="sidebar-nav-icon">
                    <IconComponent size={20} />
                  </span>
                  <span className="sidebar-nav-label">{item.name}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
