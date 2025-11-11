import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// ページコンポーネント（後で作成）
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import CalendarPage from '../pages/calendar/CalendarPage';
import AdminPage from '../pages/admin/AdminPage';
import UserSettingsPage from '../pages/user/UserSettingsPage';
import MyBookingsPage from '../pages/user/MyBookingsPage';

// 認証が必要なルートを保護
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
};

// 管理者専用ルート
const AdminRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  console.log('AdminRoute check:', { isAuthenticated, user, role: user?.role }); // デバッグ用
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  if (user?.role !== 'admin') {
    console.log('Not admin, redirecting to calendar'); // デバッグ用
    return <Navigate to="/calendar" />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 公開ルート */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        
        {/* 認証必須ルート */}
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <CalendarPage />
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
          path="/my-bookings" 
          element={
            <ProtectedRoute>
              <MyBookingsPage />
            </ProtectedRoute>
          } 
        />
        
        {/* 管理者専用ルート */}
        <Route 
          path="/admin" 
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          } 
        />
        
        {/* デフォルトリダイレクト */}
        <Route path="/" element={<Navigate to="/calendar" />} />
        
        {/* 404 */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;