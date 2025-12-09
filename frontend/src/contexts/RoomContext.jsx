// src/contexts/RoomContext.jsx
import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const RoomContext = createContext(null);

export const RoomProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // 部屋一覧取得
  const getRooms = async (branchId) => {
    setLoading(true);
    try {
      const response = await api.get('/rooms', { params: { branch_id: branchId } });
      
      setRooms(response.data.rooms);
      
      return {
        success: true,
        rooms: response.data.rooms
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '部屋一覧の取得に失敗しました',
      };
    } finally {
      setLoading(false);
    }
  };

  // 部屋作成（admin専用）
  const createRoom = async (roomData) => {
    try {
      const response = await api.post('/rooms', roomData);
      
      // ローカル状態更新
      await getRooms(roomData.branch_id);

      return {
        success: true,
        message: response.data.message,
        room_id: response.data.room_id
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '部屋の作成に失敗しました',
        errors: error.response?.data?.errors || null,
      };
    }
  };

  // 部屋更新（admin専用）
  const updateRoom = async (roomId, roomData) => {
    try {
      const response = await api.put(`/rooms/${roomId}`, roomData);
      
      // ローカル状態更新
      setRooms(rooms.map(r => r.room_id === roomId ? { ...r, ...roomData } : r));

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '部屋の更新に失敗しました',
        errors: error.response?.data?.errors || null,
      };
    }
  };

  // 部屋削除（admin専用）
  const deleteRoom = async (roomId) => {
    try {
      const response = await api.delete(`/rooms/${roomId}`);
      
      // ローカル状態更新
      setRooms(rooms.filter(r => r.room_id !== roomId));

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '部屋の削除に失敗しました',
      };
    }
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        loading,
        getRooms,
        createRoom,
        updateRoom,
        deleteRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
};

export const useRoom = () => {
  const ctx = useContext(RoomContext);
  if (!ctx) throw new Error("useRoom must be used within RoomProvider");
  return ctx;
};