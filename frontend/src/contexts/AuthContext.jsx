// src/contexts/AuthContext.jsx (既存トークン名対応版)

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // セッション延長タイマー
  useEffect(() => {
    if (isAuthenticated && user) {
      // ⭐ 29日ごとにトークンをリフレッシュ（有効期限30日の場合）
      const refreshInterval = setInterval(async () => {
        try {
          console.log('トークンを自動リフレッシュします');
          const response = await api.post('/refresh');
          
          if (response.data.token) {
            localStorage.setItem('auth_token', response.data.token);
            localStorage.setItem('token', response.data.token);
            console.log('トークンをリフレッシュしました');
          }
        } catch (error) {
          console.error('トークンリフレッシュ失敗:', error);
          // リフレッシュ失敗時はログアウト
          logout();
        }
      }, 29 * 24 * 60 * 60 * 1000); // ⭐ 29日（有効期限30日の1日前）

      return () => clearInterval(refreshInterval);
    }
  }, [isAuthenticated, user]);

  // ページ読み込み時にローカルストレージからユーザー情報を復元
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token') || localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      console.log('🔐 認証初期化:', { hasToken: !!token, hasUser: !!savedUser });

      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          console.log('✅ ユーザー情報を復元しました:', userData);
          
          // トークンの有効性を確認（バックグラウンドで実行）
          // ⭐ 初回ロード時のみ実行
          verifyToken();
        } catch (error) {
          console.error('❌ ユーザー情報の復元に失敗:', error);
          // パースエラーの場合のみログアウト
          if (error instanceof SyntaxError) {
            logout();
          }
        }
      } else {
        console.log('⚠️ トークンまたはユーザー情報がありません');
      }
      
      // ⭐ 必ずloadingをfalseにする
      setLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ⭐ 空配列で初回のみ実行

  // トークンの有効性を確認
  const verifyToken = async () => {
    try {
      const response = await api.get('/me');
      if (response.data.success && response.data.user) {
        const newUser = response.data.user;
        // ⭐ ユーザー情報が変更された場合のみ更新
        setUser(prevUser => {
          if (JSON.stringify(prevUser) !== JSON.stringify(newUser)) {
            localStorage.setItem('user', JSON.stringify(newUser));
            return newUser;
          }
          return prevUser;
        });
      }
    } catch (error) {
      console.error('トークン検証失敗:', error);
      // ⭐ 検証失敗してもログアウトしない（自動リフレッシュに任せる）
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      
      if (response.data.token) {
        const { token, user } = response.data;
        
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        setIsAuthenticated(true);
        
        return { success: true };
      }
    } catch (error) {
      console.error('ログインエラー:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'ログインに失敗しました'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};