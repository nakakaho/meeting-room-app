// src/App.jsx (修正版)

import React, { useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppRoutes from './routes';
import notificationService from './api/notificationService';
import notificationChecker from './api/notificationChecker';

function AppContent() {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('ログインユーザー:', user);
      
      // 通知権限をリクエスト
      notificationService.requestPermission().then(granted => {
        if (granted) {
          console.log('通知権限が許可されました');
          // 通知チェック開始
          notificationChecker.start(user);
        } else {
          console.log('通知権限が拒否されました');
        }
      });

      // クリーンアップ
      return () => {
        notificationChecker.stop();
      };
    }
  }, [isAuthenticated, user?.id]); // ⭐ user全体ではなくuser.idを監視

  return <AppRoutes />;
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;