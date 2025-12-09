// src/contexts/UserContext.jsx
import React, { createContext, useContext } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
  const { user } = useAuth(); // ← setUser削除

  // ユーザー情報更新
  const updateUser = async (userId, data) => {
    try {
      const response = await api.put(`/users/${userId}`, data);
      
      // ローカル状態更新
      const updatedUser = { ...user, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // ページリロードで反映（AuthContextが再読み込み）
      window.location.reload();

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '更新に失敗しました',
        errors: error.response?.data?.errors || null,
      };
    }
  };

  // 通知設定・言語更新
  const updateSettings = async (userId, settings) => {
    try {
      const response = await api.put(`/users/${userId}/settings`, settings);
      
      // ローカル状態更新
      const updatedUser = { ...user, ...settings };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // ページリロードで反映
      window.location.reload();

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '設定の更新に失敗しました',
        errors: error.response?.data?.errors || null,
      };
    }
  };

  // パスワード変更
  const changePassword = async (userId, currentPassword, newPassword, confirmPassword) => {
    try {
      const response = await api.post(`/users/${userId}/password`, {
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'パスワード変更に失敗しました',
        errors: error.response?.data?.errors || null,
      };
    }
  };

  // アカウント削除
  const deleteAccount = async (userId) => {
    try {
      const response = await api.delete(`/users/${userId}`);

      // ログアウト処理
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      
      // ログインページへリダイレクト
      window.location.href = '/login';

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'アカウント削除に失敗しました',
        errors: error.response?.data?.errors || null,
      };
    }
  };

  // 拠点のユーザー一覧取得（参加者選択用）
  const getBranchUsers = async () => {
    try {
      const response = await api.get('/users/branch');
      return {
        success: true,
        users: response.data.users
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'ユーザー一覧の取得に失敗しました',
      };
    }
  };

  return (
    <UserContext.Provider
      value={{
        updateUser,
        updateSettings,
        changePassword,
        deleteAccount,
        getBranchUsers,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
};