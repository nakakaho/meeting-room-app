// src/routes/index.jsx
console.log("AppRoutes 読み込み OK");
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

import CalendarPageNew from '../pages/calendar/CalendarPageNew';
import MyBookingsPage from '../pages/user/MyBookingsPage';
import UserSettingsPage from '../pages/user/UserSettingsPage';
import AdminPage from '../pages/admin/AdminPage';

import Layout from '../components/layout/Layout';

/* ---------------------------------------------
   Protected Route（ログイン必須）
---------------------------------------------- */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children; // ← ここ重要（Fragmentで包まない）
}

/* ---------------------------------------------
   Public Route（未ログインのみ）
---------------------------------------------- */
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  if (isAuthenticated) return <Navigate to="/calendar" replace />;

  return children; // ← ここも
}

/* ---------------------------------------------
   Routes
---------------------------------------------- */
function AppRoutes() {
  return (
    <BrowserRouter>
      {/* 全ページ共通レイアウト */}
      <Layout>
        <Routes>
          {/* 公開ページ */}
          <Route path="/calendar" element={<CalendarPageNew />} />

          <Route
            path="/login"
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          <Route
            path="/register"
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            }
          />

          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* ログイン必須 */}
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <UserSettingsPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPage />
              </ProtectedRoute>
            }
          />

          {/* デフォルト */}
          <Route path="/" element={<Navigate to="/calendar" replace />} />
          <Route path="*" element={<Navigate to="/calendar" replace />} />

        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default AppRoutes;
