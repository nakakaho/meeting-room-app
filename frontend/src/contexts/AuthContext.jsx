// src/contexts/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';
import i18n from '../i18n'; // ✅ src/i18n.js の場合
// または
// import i18n from '../i18n/index'; // ✅ src/i18n/index.js の場合

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // ページ読み込み時：localStorage から復元
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
          setIsAuthenticated(true);
          
          // ✅ 追加: ログイン復元時にも言語を適用
          if (userData?.lang) {
            i18n.changeLanguage(userData.lang);
          }
        } catch (e) {
          console.error("user パース失敗", e);
          logout();
        }
      } else {
        // ✅ 追加: 未ログイン時は localStorage の言語設定を適用
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage) {
          i18n.changeLanguage(savedLanguage);
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // ログイン
  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const { token, user } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);
      
      // ✅ ログイン時に言語設定を適用
      if (user?.lang) {
        i18n.changeLanguage(user.lang);
        localStorage.setItem('preferredLanguage', user.lang);
      }
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'ログインに失敗しました',
        errors: error.response?.data?.errors || null,
      };
    }
  };

  // 新規登録
  const register = async (name, email, password) => {
    try {
      const params = new URLSearchParams(window.location.search);
      const branchId = params.get('branch_id') || 1;

      const response = await api.post('/register', { 
        name, 
        email, 
        password,
        branch_id: branchId
      });

      const { token, user } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);
      
      // ✅ 追加: 新規登録時にも言語設定を適用
      if (user?.lang) {
        i18n.changeLanguage(user.lang);
        localStorage.setItem('preferredLanguage', user.lang);
      }

      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '登録に失敗しました',
        errors: error.response?.data?.errors || null,
      };
    }
  };

  // ログアウト
  const logout = async () => {
    try {
      await api.post('/logout');
    } catch (_) {
      // エラーでも続行
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');

    setUser(null);
    setIsAuthenticated(false);
    
    // ✅ 追加: ログアウト後も言語設定は保持
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  };

  // パスワードリセットメール送信
  const forgotPassword = async (email) => {
    try {
      const response = await api.post('/password-reset', { email });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'メール送信に失敗しました',
        errors: error.response?.data?.errors || null,
      };
    }
  };

  // パスワードリセット実行
  const resetPassword = async (email, token, newPassword) => {
    try {
      const response = await api.post('/password-update', { 
        email, 
        token, 
        new_password: newPassword 
      });
      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'パスワードリセットに失敗しました',
        errors: error.response?.data?.errors || null,
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        isAuthenticated,
        loading,
        login,
        register,
        logout,
        forgotPassword,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};