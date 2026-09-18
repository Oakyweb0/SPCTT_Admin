import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from '../components/Layout/AdminLayout';
import Dashboard from '../pages/Dashboard';
import LoginPage from '../pages/LoginPage';

// Admin Pages
import AdminRegistrationsPage from '../pages/admin/AdminRegistrationsPage';
import AdminAbstractsPage from '../pages/admin/AdminAbstractsPage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';

// User Portal Pages
import UserRegisterPage from '../pages/user/UserRegisterPage';
import UserLoginPage from '../pages/user/UserLoginPage';
import UserDashboardPage from '../pages/user/UserDashboardPage';
import RegistrationWizardPage from '../pages/user/RegistrationWizardPage';
import InvoiceReceiptPage from '../pages/user/InvoiceReceiptPage';
import AbstractSubmissionPage from '../pages/user/AbstractSubmissionPage';
import UserProfilePage from '../pages/user/UserProfilePage';

// Protection helper for Admin
const AdminAuthGuard = ({ children }) => {
  const adminAuth = localStorage.getItem('spctt_admin_auth');
  if (!adminAuth) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Protection helper for User Portal
const UserAuthGuard = ({ children }) => {
  const userAuth = localStorage.getItem('spctt_user_auth');
  if (!userAuth) {
    return <Navigate to="/user/login" replace />;
  }
  return children;
};

const AppRoutes = () => {
  const isUserLoggedIn = !!localStorage.getItem('spctt_user_auth');
  const isAdminLoggedIn = !!localStorage.getItem('spctt_admin_auth');

  return (
    <Routes>
      {/* Root Route */}
      <Route
        path="/"
        element={
          isUserLoggedIn ? (
            <Navigate to="/user/dashboard" replace />
          ) : isAdminLoggedIn ? (
            <Navigate to="/admin/dashboard" replace />
          ) : (
            <Navigate to="/user/register" replace />
          )
        }
      />

      {/* User Portal Public Routes */}
      <Route path="/user/register" element={<UserRegisterPage />} />
      <Route path="/register" element={<UserRegisterPage />} />
      <Route path="/user/login" element={<UserLoginPage />} />

      {/* User Portal Protected Routes */}
      <Route
        path="/user/dashboard"
        element={
          <UserAuthGuard>
            <UserDashboardPage />
          </UserAuthGuard>
        }
      />
      <Route
        path="/user/registration"
        element={
          <UserAuthGuard>
            <RegistrationWizardPage />
          </UserAuthGuard>
        }
      />
      <Route
        path="/user/invoices"
        element={
          <UserAuthGuard>
            <InvoiceReceiptPage />
          </UserAuthGuard>
        }
      />
      <Route
        path="/user/abstracts"
        element={
          <UserAuthGuard>
            <AbstractSubmissionPage />
          </UserAuthGuard>
        }
      />
      <Route
        path="/user/profile"
        element={
          <UserAuthGuard>
            <UserProfilePage />
          </UserAuthGuard>
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
        <Route path="users" element={<AdminUsersPage />} />

        {/* Fallback within admin */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>

      {/* Global Fallback */}
      <Route path="*" element={<Navigate to="/user/register" replace />} />
    </Routes>
  );
};

export default AppRoutes;
