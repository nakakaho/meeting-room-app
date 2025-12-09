import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminRoute({ children }) {
  const { user, isAuthenticated, loading } = useAuth();

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

  // 未ログイン → ログインページへ
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // ログイン済みだがadminでない → カレンダーへ
  if (user?.role !== 'admin') {
    return <Navigate to="/calendar" replace />;
  }

  // admin → アクセス許可
  return children;
}