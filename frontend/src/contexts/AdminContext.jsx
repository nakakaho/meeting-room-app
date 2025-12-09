// src/contexts/AdminContext.jsx
import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // ユーザー一覧取得（admin専用）
  const getUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get('/admin/users');
      
      setUsers(response.data.users);
      
      return {
        success: true,
        users: response.data.users
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'ユーザー一覧の取得に失敗しました',
      };
    } finally {
      setLoading(false);
    }
  };

  // 権限変更（admin専用）
  const changeUserRole = async (userId, role) => {
    try {
      const response = await api.patch(`/admin/users/${userId}/role`, { role });
      
      // ローカル状態更新
      setUsers(users.map(u => u.id === userId ? { ...u, role } : u));

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '権限変更に失敗しました',
        errors: error.response?.data?.errors || null,
      };
    }
  };

  // ユーザー削除（admin専用）
  const deleteUser = async (userId) => {
    try {
      const response = await api.delete(`/admin/users/${userId}`);
      
      // ローカル状態更新
      setUsers(users.filter(u => u.id !== userId));

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'ユーザー削除に失敗しました',
      };
    }
  };

  return (
    <AdminContext.Provider
      value={{
        users,
        loading,
        getUsers,
        changeUserRole,
        deleteUser,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error("useAdmin must be used within AdminProvider");
  return ctx;
};