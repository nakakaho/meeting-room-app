// src/contexts/EventContext.jsx
import React, { createContext, useContext, useState } from 'react';
import api from '../api/axios';

const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  // 予約一覧取得
  const getEvents = async (branchId, userId = null) => {
    setLoading(true);
    try {
      const params = userId ? { branch_id: branchId, user_id: userId } : { branch_id: branchId };
      const response = await api.get('/events', { params });
      
      setEvents(response.data.events);
      
      return {
        success: true,
        events: response.data.events
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '予約一覧の取得に失敗しました',
      };
    } finally {
      setLoading(false);
    }
  };

  // 予約作成
  const createEvent = async (eventData) => {
    try {
      const response = await api.post('/events', eventData);
      
      // ローカル状態更新
      await getEvents(eventData.branch_id);

      return {
        success: true,
        message: response.data.message,
        event_id: response.data.event_id
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '予約の作成に失敗しました',
        errors: error.response?.data?.errors || null,
      };
    }
  };

  // 予約更新
  const updateEvent = async (eventId, eventData) => {
    try {
      const response = await api.put(`/events/${eventId}`, eventData);
      
      // ローカル状態更新
      setEvents(events.map(e => e.event_id === eventId ? { ...e, ...eventData } : e));

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '予約の更新に失敗しました',
        errors: error.response?.data?.errors || null,
      };
    }
  };

  // 予約削除
  const deleteEvent = async (eventId) => {
    try {
      const response = await api.delete(`/events/${eventId}`);
      
      // ローカル状態更新
      setEvents(events.filter(e => e.event_id !== eventId));

      return {
        success: true,
        message: response.data.message
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || '予約の削除に失敗しました',
      };
    }
  };

  return (
    <EventContext.Provider
      value={{
        events,
        loading,
        getEvents,
        createEvent,
        updateEvent,
        deleteEvent,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const ctx = useContext(EventContext);
  if (!ctx) throw new Error("useEvent must be used within EventProvider");
  return ctx;
};