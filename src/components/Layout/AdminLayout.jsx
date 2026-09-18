import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const AdminLayout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const location = useLocation();

  // Helper to get clean title based on current route
  const getPageTitle = (path) => {
    if (path.includes('/admin/registration')) return 'Registration';
    if (path.includes('/admin/abstract')) return 'Abstract';
    if (path.includes('/admin/users')) return 'Users';
    return 'Dashboard';
  };

  const handleToggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleToggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const handleCloseMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const layoutClasses = [
    'admin-layout-wrapper',
    isSidebarCollapsed ? 'sidebar-collapsed' : '',
    isMobileSidebarOpen ? 'mobile-sidebar-open' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={layoutClasses}>
      {/* Mobile Drawer Overlay Backdrop */}
      <div
        className="sidebar-overlay-backdrop"
        onClick={handleCloseMobileSidebar}
      ></div>

      {/* Sidebar Component */}
      <Sidebar onNavigate={handleCloseMobileSidebar} />

      {/* Main Panel Content Container */}
      <div className="admin-main-container">
        <Header
          onToggleSidebar={handleToggleSidebar}
          onToggleMobileSidebar={handleToggleMobileSidebar}
          pageTitle={getPageTitle(location.pathname)}
        />

        <main className="admin-content-area">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
