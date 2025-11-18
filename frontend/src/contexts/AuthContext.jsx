// src/contexts/AuthContext.jsx

import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

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
        } catch (e) {
          console.error("user パース失敗", e);
          logout();
        }
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // --------------------------
  // login
  // --------------------------
  const login = async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });

      const { token, user } = response.data;

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user', JSON.stringify(user));

      setUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'ログインに失敗しました',
      };
    }
  };

  // --------------------------
  // logout
  // --------------------------
  const logout = async () => {
    try {
      // APIへログアウトリクエスト（Laravel側に route がある前提）
      await api.post('/logout');
    } catch (_) {
      // エラーでも続行
    }

    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');

    setUser(null);
    setIsAuthenticated(false);
  };

  // --------------------------
  // user 更新
  // --------------------------
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
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
