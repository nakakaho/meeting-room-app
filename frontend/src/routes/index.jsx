// src/routes/index.jsx
console.log("AppRoutes 読み込み OK");
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom'; // ✅ BrowserRouter削除
import { useAuth } from '../contexts/AuthContext';

import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';

import CalendarPage from '../pages/calendar/CalendarPage';
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

  return children;
}

/* ---------------------------------------------
   Admin Route（admin専用）
---------------------------------------------- */
function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  // 未ログイン → ログインページへ
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  // ログイン済みだがadminでない → カレンダーへ
  if (user?.role !== 'admin') return <Navigate to="/calendar" replace />;

  // admin → アクセス許可
  return children;
}

/* ---------------------------------------------
   Public Route（未ログインのみ）
---------------------------------------------- */
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  if (isAuthenticated) return <Navigate to="/calendar" replace />;

  return children;
}

/* ---------------------------------------------
   Routes
---------------------------------------------- */
function AppRoutes() {
  return (
    // ✅ BrowserRouter削除、Layoutも削除
    <Routes>
      {/* 公開ページ */}
      <Route path="/calendar" element={<CalendarPage />} />

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

      {/* ✅ admin専用ルート */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminPage />
          </AdminRoute>
        }
      />

      {/* デフォルト */}
      <Route path="/" element={<Navigate to="/calendar" replace />} />
      <Route path="*" element={<Navigate to="/calendar" replace />} />
    </Routes>
  );
}

export default AppRoutes;