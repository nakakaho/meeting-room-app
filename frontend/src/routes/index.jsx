// src/routes/index.jsx (修正版)

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ページコンポーネント
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import CalendarPage from '../pages/calendar/CalendarPage';
import MyBookingsPage from '../pages/user/MyBookingsPage';
import UserSettingsPage from '../pages/user/UserSettingsPage';
import AdminPage from '../pages/admin/AdminPage';

// レイアウト
import Header from '../components/layout/Header';

// 保護されたルートコンポーネント
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // ⭐ ローディング中は何も表示しない（重要）
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // 認証されていない場合のみログイン画面へ
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 認証されている場合は子コンポーネントを表示
  return (
    <>
      <Header />
      {children}
    </>
  );
}

// 公開ルートコンポーネント（ログイン済みならリダイレクト）
function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  // ⭐ ローディング中は何も表示しない
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        Loading...
      </div>
    );
  }

  // ログイン済みの場合はカレンダーへ
  if (isAuthenticated) {
    return <Navigate to="/calendar" replace />;
  }

  // 未ログインの場合は公開ページを表示
  return children;
}

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公開ルート */}
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
        <Route 
          path="/forgot-password" 
          element={
            <PublicRoute>
              <ForgotPasswordPage />
            </PublicRoute>
          } 
        />
        <Route 
          path="/reset-password/:token" 
          element={
            <PublicRoute>
              <ResetPasswordPage />
            </PublicRoute>
          } 
        />

        {/* 保護されたルート */}
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <CalendarPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/my-bookings" 
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/user/my-bookings" 
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
          path="/user/settings" 
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

        {/* デフォルトルート */}
        <Route path="/" element={<Navigate to="/calendar" replace />} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/calendar" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;