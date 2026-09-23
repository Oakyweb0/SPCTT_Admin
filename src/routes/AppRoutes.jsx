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
import UserLoginPage from '../pages/user/UserLoginPage';
import UserRegisterPage from '../pages/user/UserRegisterPage';
import UserForgotPasswordPage from '../pages/user/UserForgotPasswordPage';
import UserResetPasswordPage from '../pages/user/UserResetPasswordPage';
import UserDashboardPage from '../pages/user/UserDashboardPage';
import UserProfilePage from '../pages/user/UserProfilePage';
import RegistrationWizardPage from '../pages/user/RegistrationWizardPage';
import AbstractSubmissionPage from '../pages/user/AbstractSubmissionPage';
import InvoiceReceiptPage from '../pages/user/InvoiceReceiptPage';

// Protection helper for Admin
const AdminAuthGuard = ({ children }) => {
  const adminAuth = localStorage.getItem('spctt_admin_auth');
  if (!adminAuth) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
};

// Protection helper for User
const UserAuthGuard = ({ children }) => {
  const userAuth = localStorage.getItem('spctt_user_auth');
  if (!userAuth) {
    return <Navigate to="/user/login" replace />;
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
            <Navigate to="/user/login" replace />
          )
        }
      />

      {/* User Authentication Routes */}
      <Route path="/user/login" element={<UserLoginPage />} />
      <Route path="/user/register" element={<UserRegisterPage />} />
      <Route path="/register" element={<UserRegisterPage />} />
      <Route path="/user/forgot-password" element={<UserForgotPasswordPage />} />
      <Route path="/forgot-password" element={<UserForgotPasswordPage />} />
      <Route path="/user/reset-password" element={<UserResetPasswordPage />} />
      <Route path="/reset-password" element={<UserResetPasswordPage />} />

      {/* Protected User Portal Routes */}
      <Route
        path="/user/dashboard"
        element={
          <UserAuthGuard>
            <UserDashboardPage />
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
      <Route
        path="/user/registration-wizard"
        element={
          <UserAuthGuard>
            <RegistrationWizardPage />
          </UserAuthGuard>
        }
      />
      <Route
        path="/user/abstract-submission"
        element={
          <UserAuthGuard>
            <AbstractSubmissionPage />
          </UserAuthGuard>
        }
      />
      <Route
        path="/user/invoice/:id"
        element={
          <UserAuthGuard>
            <InvoiceReceiptPage />
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
      <Route path="*" element={<Navigate to="/user/login" replace />} />
    </Routes>
  );
};

export default AppRoutes;
