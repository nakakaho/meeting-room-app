// src/hooks/useNotifications.js — 統合版

import { useEffect, useRef } from 'react';
import api from '../api/axios';
import notificationService from '../api/notificationService';

export const useNotifications = (user) => {
  // マイ予約用：通知済みイベントIDを記録
  const notifiedMyEventsRef = useRef(new Set());
  
  // 全室用：差分検知
  const prevActiveIdsRef = useRef(new Set());
  const lastAllEmptyNotifiedRef = useRef(false);

  // ========================================
  // マイ予約通知（5分前）
  // ========================================
  const checkMySchedule = async () => {
    if (!user?.notify_my_schedule) return;

    try {
      const res = await api.get('/notifications/my-schedule');
      if (!res.data.success) return;

      const events = res.data.events || [];

      events.forEach(event => {
        const eventId = event.event_id;
        
        // 既に通知済みならスキップ
        if (notifiedMyEventsRef.current.has(eventId)) return;

        // 通知表示
        notificationService.showMyScheduleNotification(event);
        
        // 通知済みマーク
        notifiedMyEventsRef.current.add(eventId);
      });
    } catch (err) {
      console.error('マイ予約通知チェックエラー:', err);
    }
  };

  // ========================================
  // 全室利用状況通知（差分検知型）
  // ========================================
  // const checkAllRooms = async () => {
  //   if (!user?.notify_all_schedule) return;

  //   try {
  //     const res = await api.get('/notifications/all-rooms');
  //     if (!res.data.success) return;

  //     const activeEvents = res.data.events || [];
  //     const activeIds = new Set(activeEvents.map(e => e.event_id));

  //     // 新規開始イベント
  //     const started = [...activeIds].filter(id => !prevActiveIdsRef.current.has(id));
      
  //     // 終了イベント
  //     const ended = [...prevActiveIdsRef.current].filter(id => !activeIds.has(id));

  //     // 開始通知
  //     started.forEach(id => {
  //       const event = activeEvents.find(e => e.event_id === id);
  //       if (!event) return;

  //       const tz = event.timezone ?? user.branch?.timezone ?? 'UTC';
  //       const start = new Date(event.start_time).toLocaleTimeString('ja-JP', {
  //         hour: '2-digit',
  //         minute: '2-digit',
  //         hour12: false,
  //         timeZone: tz
  //       });
  //       const end = new Date(event.end_time).toLocaleTimeString('ja-JP', {
  //         hour: '2-digit',
  //         minute: '2-digit',
  //         hour12: false,
  //         timeZone: tz
  //       });

  //       notificationService.showAllRoomsNotification({
  //         title: '会議室利用開始',
  //         body: `${event.room_name} ${start}〜${end}\n予約者: ${event.organizer_name ?? ''}`
  //       });
  //     });

  //     // 終了通知
  //     if (ended.length > 0) {
  //       notificationService.showAllRoomsNotification({
  //         title: '会議室利用終了',
  //         body: '会議室の利用が終了しました'
  //       });
  //     }

  //     // 全室空室検知
  //     if (activeIds.size === 0 && !lastAllEmptyNotifiedRef.current) {
  //       notificationService.showAllRoomsNotification({
  //         title: '会議室状況',
  //         body: '現在、利用中の会議室はありません'
  //       });
  //       lastAllEmptyNotifiedRef.current = true;
  //     } else if (activeIds.size > 0) {
  //       lastAllEmptyNotifiedRef.current = false;
  //     }

  //     // 次回の差分検知用に保存
  //     prevActiveIdsRef.current = activeIds;
  //   } catch (err) {
  //     console.error('全室通知チェックエラー:', err);
  //   }
  // };

  // ========================================
  // 統合チェック実行
  // ========================================
  const checkNotifications = async () => {
    await Promise.all([
      checkMySchedule(),
      // checkAllRooms()
    ]);
  };

  useEffect(() => {
    if (!user) return;

    // 権限リクエスト
    notificationService.requestPermission();

    // 初回チェック
    checkNotifications();

    // // 1分ごとにチェック
    // const interval = setInterval(checkNotifications, 60 * 1000);
    
    // 🔥 開発時は10秒ごと、本番は60秒ごと
    const isDev = import.meta.env.DEV;
    const interval = setInterval(
      checkNotifications, 
      isDev ? 10 * 1000 : 60 * 1000
    );

    return () => clearInterval(interval);
  }, [user]);

  return { requestPermission: notificationService.requestPermission };
};