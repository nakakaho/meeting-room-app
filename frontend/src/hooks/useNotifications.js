import { useEffect, useRef } from 'react';
import api from '../api/axios';

export const useNotifications = (user) => {
  const notifiedEventsRef = useRef(new Set());
  const lastAllRoomsNotifyRef = useRef(null);

  // 通知権限をリクエスト
  const requestPermission = async () => {
    if (!('Notification' in window)) {
      console.log('このブラウザは通知をサポートしていません');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  };

  // デスクトップ通知を表示
  const showNotification = (title, body) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'meeting-room-notification',
      });
    }
  };

  // マイスケジュール通知をチェック
  const checkMyScheduleNotifications = async () => {
    console.log('📅 マイスケジュール通知チェック開始', { 
      notify_my_schedule: user?.notify_my_schedule 
    });
    
    if (!user?.notify_my_schedule) return;

    try {
      const response = await api.get('/notifications/my-schedule');
      const notifications = response.data.notifications;

      console.log('📬 取得した通知:', notifications);

      notifications.forEach((notif) => {
        const key = `my_schedule_${notif.event_id}`;
        
        console.log('🔔 通知チェック:', { 
          key, 
          alreadyNotified: notifiedEventsRef.current.has(key) 
        });
        
        // まだ通知していない場合のみ通知
        if (!notifiedEventsRef.current.has(key)) {
          console.log('✅ 通知を表示:', notif.title, notif.body);
          showNotification(notif.title, notif.body);
          notifiedEventsRef.current.add(key);
        }
      });
    } catch (error) {
      console.error('通知の取得に失敗:', error);
    }
  };

  // 全室利用状況通知をチェック
  const checkAllRoomsNotifications = async () => {
    console.log('🏢 全室利用状況通知チェック開始', {
      notify_all_schedule: user?.notify_all_schedule
    });
    
    if (!user?.notify_all_schedule) return;

    const now = new Date();
    
    console.log('⏰ 現在時刻:', now.toLocaleTimeString(), '分:', now.getMinutes());
    
    // 前回の通知から15分経過していない場合はスキップ
    if (lastAllRoomsNotifyRef.current) {
      const diff = (now - lastAllRoomsNotifyRef.current) / 1000 / 60;
      console.log('⏱️ 前回の通知からの経過時間:', diff, '分');
      if (diff < 15) return;
    }

    // 15分刻みの時刻でない場合はスキップ
    const minutes = now.getMinutes();
    if (minutes % 15 !== 0) {
      console.log('⏳ 15分刻みの時刻ではありません');
      return;
    }

    try {
      const response = await api.get('/notifications/all-rooms');
      const notifications = response.data.notifications;

      console.log('📬 取得した全室通知:', notifications);

      if (notifications.length > 0) {
        const notif = notifications[0];
        console.log('✅ 全室通知を表示:', notif.title, notif.body);
        showNotification(notif.title, notif.body);
        lastAllRoomsNotifyRef.current = now;
      }
    } catch (error) {
      console.error('通知の取得に失敗:', error);
    }
  };

  useEffect(() => {
    if (!user) return;

    // 初回に通知権限をリクエスト
    requestPermission();

    // マイスケジュール通知: 1分ごとにチェック
    const myScheduleInterval = setInterval(() => {
      checkMyScheduleNotifications();
    }, 60000); // 1分

    // 全室利用状況通知: 1分ごとにチェック（内部で15分刻み判定）
    const allRoomsInterval = setInterval(() => {
      checkAllRoomsNotifications();
    }, 60000); // 1分

    // 初回実行
    checkMyScheduleNotifications();
    checkAllRoomsNotifications();

    return () => {
      clearInterval(myScheduleInterval);
      clearInterval(allRoomsInterval);
    };
  }, [user]);

  return { requestPermission, showNotification };
};