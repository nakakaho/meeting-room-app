// src/api/notificationChecker.js

import api from './axios';
import notificationService from './notificationService';

class NotificationChecker {
  constructor() {
    this.intervalId = null;
    this.checkInterval = 60000; // 1分ごとにチェック
    this.user = null;
  }

  /**
   * 定期チェック開始
   */
  start(user) {
    if (this.intervalId) {
      this.stop();
    }

    this.user = user;
    console.log('通知チェック開始:', user);
    
    // 初回実行
    this.checkNotifications();

    // 定期実行
    this.intervalId = setInterval(() => {
      this.checkNotifications();
    }, this.checkInterval);
  }

  /**
   * 定期チェック停止
   */
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.user = null;
      console.log('通知チェック停止');
    }
  }

  /**
   * 通知対象の予約をチェック
   */
  async checkNotifications() {
    if (!this.user) {
      console.log('ユーザー情報がありません');
      return;
    }

    try {
      const now = new Date();
      const fiveMinutesLater = new Date(now.getTime() + 5 * 60 * 1000);

      // 予約一覧を取得
      const response = await api.get('/events', {
        params: {
          branch_id: this.user.branch_id
        }
      });

      if (!response.data.success) {
        console.error('予約一覧の取得に失敗');
        return;
      }

      const events = response.data.events;

      // マイ予約通知のチェック
      if (this.user.notify_my_schedule) {
        this.checkMyScheduleNotifications(events, this.user.id, now, fiveMinutesLater);
      }

      // 全体利用状況通知のチェック
      if (this.user.notify_all_schedule) {
        this.checkAllRoomsNotifications(events, now);
      }

    } catch (error) {
      console.error('通知チェックエラー:', error);
      
      // セッション切れ（401 Unauthorized）の場合
      if (error.response && error.response.status === 401) {
        console.warn('セッションが切れています。再ログインが必要です。');
        this.handleSessionExpired();
      }
    }
  }

  /**
   * セッション切れ時の処理
   */
  handleSessionExpired() {
    // 通知チェックを停止
    this.stop();

    // セッション切れ通知を表示
    this.showSessionExpiredNotification();
  }

  /**
   * セッション切れ通知を表示
   */
  showSessionExpiredNotification() {
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = 'セッション切れ';
      const options = {
        body: 'ログインセッションが切れました。再度ログインしてください。',
        icon: '/logo192.png',
        tag: 'session-expired',
        requireInteraction: true,
        data: {
          type: 'session_expired',
          url: '/login'
        }
      };

      try {
        const notification = new Notification(title, options);
        
        notification.onclick = (e) => {
          e.preventDefault();
          window.focus();
          window.location.href = '/login';
          notification.close();
        };
      } catch (error) {
        console.error('セッション切れ通知の表示に失敗:', error);
      }
    }
  }

  /**
   * マイ予約通知をチェック（5分前）
   */
  checkMyScheduleNotifications(events, userId, now, fiveMinutesLater) {
    events.forEach(event => {
      try {
        const startTime = new Date(event.start_time);
        
        // 自分が予約者または参加者で、開始5分前の予約を通知
        const isMyReservation = 
          event.organizer_id === userId || 
          (event.attendees && event.attendees.some(a => a.user_id === userId));

        // 開始5分前から開始時刻までの間
        if (isMyReservation && startTime > now && startTime <= fiveMinutesLater) {
          // 既に通知済みかチェック（LocalStorageで管理）
          const notifiedKey = `notified_my_${event.event_id}`;
          if (!localStorage.getItem(notifiedKey)) {
            console.log('マイ予約通知を表示:', event);
            notificationService.showMyScheduleNotification(event);
            
            // 通知済みフラグを設定
            localStorage.setItem(notifiedKey, Date.now().toString());
            
            // 24時間後に削除
            setTimeout(() => {
              localStorage.removeItem(notifiedKey);
            }, 24 * 60 * 60 * 1000);
          }
        }
      } catch (error) {
        console.error('マイ予約通知チェックエラー:', error);
      }
    });
  }

  /**
   * 全体利用状況通知をチェック（現在利用中）
   */
  checkAllRoomsNotifications(events, now) {
    try {
      const currentEvents = events.filter(event => {
        const startTime = new Date(event.start_time);
        const endTime = new Date(event.end_time);
        return startTime <= now && endTime > now;
      });

      if (currentEvents.length > 0) {
        // 15分に1回のみ通知（重複防止）
        const notifiedKey = 'notified_all_rooms';
        const lastNotified = localStorage.getItem(notifiedKey);
        
        const fifteenMinutesAgo = Date.now() - 15 * 60 * 1000; // 15分前
        
        if (!lastNotified || parseInt(lastNotified) < fifteenMinutesAgo) {
          console.log('全体利用状況通知を表示:', currentEvents);
          notificationService.showAllRoomsNotification(currentEvents);
          localStorage.setItem(notifiedKey, Date.now().toString());
        }
      }
    } catch (error) {
      console.error('全体利用状況通知チェックエラー:', error);
    }
  }

  /**
   * 通知済みフラグをクリア（テスト用）
   */
  clearNotificationFlags() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('notified_')) {
        localStorage.removeItem(key);
      }
    });
    console.log('通知フラグをクリアしました');
  }
}

export default new NotificationChecker();