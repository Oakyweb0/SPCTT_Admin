import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/Layout/AdminLayout';
import Dashboard from '../pages/Dashboard';
import LoginPage from '../pages/LoginPage';

// Admin Pages
import AdminRegistrationsPage from '../pages/admin/AdminRegistrationsPage';
import AdminAbstractsPage from '../pages/admin/AdminAbstractsPage';

// Protection helper for Admin
const AdminAuthGuard = ({ children }) => {
  const adminAuth = localStorage.getItem('spctt_admin_auth');
  if (!adminAuth) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const isAdminLoggedIn = !!localStorage.getItem('spctt_admin_auth');

  return (
    <Routes>
      {/* Root Route */}
      <Route
        path="/"
        element={
          isAdminLoggedIn ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/admin/login" replace />
          )
        }
      />

      {/* Admin Authentication Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/login" element={<LoginPage />} />

      {/* Admin Panel Layout & Routes (Protected) */}
      <Route
        path="/admin"
        element={
          <AdminAuthGuard>
            <AdminLayout />
          </AdminAuthGuard>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="registration" element={<AdminRegistrationsPage />} />
        <Route path="abstract" element={<AdminAbstractsPage />} />

        {/* Fallback within admin */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Global Fallback */}
      <Route path="*" element={<Navigate to="/admin/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
