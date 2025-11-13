// src/api/notificationService.js

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.checkPermission();
  }

  /**
   * 現在の通知権限を確認
   */
  checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
    return this.permission;
  }

  /**
   * 通知権限をリクエスト
   */
  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('このブラウザは通知機能をサポートしていません');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (error) {
      console.error('通知の許可取得に失敗:', error);
      return false;
    }
  }

  /**
   * マイ予約通知を表示（My予約一覧にリンク）
   */
  showMyScheduleNotification(event) {
    if (this.permission !== 'granted') {
      console.log('通知権限がありません');
      return;
    }

    // 通知音を再生
    this.playNotificationSound();

    const title = '【マイ予約】会議室利用開始';
    const body = `会議室: ${event.room_name}\n時間: ${this.formatTime(event.start_time)} - ${this.formatTime(event.end_time)}\n予約者: ${event.organizer?.name || ''}`;
    
    const options = {
      body: body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: `my-schedule-${event.event_id}-${Date.now()}`,
      requireInteraction: false, // ⭐ クリック不要で自動で消える
      silent: false,
      renotify: true,
      vibrate: [200, 100, 200],
      data: {
        type: 'my_schedule',
        url: '/user/my-bookings',
        eventId: event.event_id,
        timestamp: Date.now()
      }
    };

    try {
      const notification = new Notification(title, options);

      // 通知クリック時の処理
      notification.onclick = (e) => {
        e.preventDefault();
        window.focus();
        window.location.href = options.data.url;
        notification.close();
      };

      // 通知が閉じられたときの処理
      notification.onclose = () => {
        console.log('マイ予約通知が閉じられました');
      };

      // エラー処理
      notification.onerror = (err) => {
        console.error('通知エラー:', err);
      };

      // ⭐ 自動で閉じないようにコメントアウト
      // setTimeout(() => {
      //   notification.close();
      // }, 10000);

    } catch (error) {
      console.error('通知の表示に失敗:', error);
    }
  }

  /**
   * 全体の利用状況通知を表示（カレンダーページにリンク）
   */
  showAllRoomsNotification(events) {
    if (this.permission !== 'granted') {
      console.log('通知権限がありません');
      return;
    }

    // 通知音を再生
    this.playNotificationSound();

    const roomList = events
      .slice(0, 3)
      .map(e => `${e.room_name}: ${e.organizer?.name || '不明'}`)
      .join('\n');
    
    const title = '【全体】現在利用中の会議室';
    const body = `現在 ${events.length}件の会議室が利用中です\n${roomList}${events.length > 3 ? '\n...' : ''}`;
    
    const options = {
      body: body,
      icon: '/logo192.png',
      badge: '/logo192.png',
      tag: `all-rooms-status-${Date.now()}`,
      requireInteraction: false, // ⭐ クリック不要で自動で消える
      silent: false,
      renotify: true,
      vibrate: [200, 100, 200],
      data: {
        type: 'all_rooms',
        url: '/calendar',
        events: events,
        timestamp: Date.now()
      }
    };

    try {
      const notification = new Notification(title, options);

      // 通知クリック時の処理
      notification.onclick = (e) => {
        e.preventDefault();
        window.focus();
        window.location.href = options.data.url;
        notification.close();
      };

      // 通知が閉じられたときの処理
      notification.onclose = () => {
        console.log('全体利用状況通知が閉じられました');
      };

      // エラー処理
      notification.onerror = (err) => {
        console.error('通知エラー:', err);
      };

      // ⭐ 自動で閉じないようにコメントアウト
      // setTimeout(() => {
      //   notification.close();
      // }, 10000);

    } catch (error) {
      console.error('通知の表示に失敗:', error);
    }
  }

  /**
   * 予約完了通知（カレンダーページにリンク）
   */
  showReservationCreatedNotification(event) {
    if (this.permission !== 'granted') {
      console.log('通知権限がありません');
      return;
    }

    const title = '予約完了';
    const body = `会議室: ${event.room_name}\n時間: ${this.formatTime(event.start_time)} - ${this.formatTime(event.end_time)}`;
    
    const options = {
      body: body,
      icon: '/logo192.png',
      tag: `reservation-created-${event.event_id}-${Date.now()}`,
      requireInteraction: false, // 予約完了は自動で消える
      data: {
        type: 'reservation_created',
        url: '/calendar',
        eventId: event.event_id
      }
    };

    try {
      const notification = new Notification(title, options);

      notification.onclick = (e) => {
        e.preventDefault();
        window.focus();
        window.location.href = options.data.url;
        notification.close();
      };

      // 5秒後に自動で閉じる
      setTimeout(() => {
        notification.close();
      }, 5000);

    } catch (error) {
      console.error('通知の表示に失敗:', error);
    }
  }

  /**
   * 予約更新通知（カレンダーページにリンク）
   */
  showReservationUpdatedNotification(event) {
    if (this.permission !== 'granted') {
      console.log('通知権限がありません');
      return;
    }

    const title = '予約更新';
    const body = `会議室: ${event.room_name}\n時間: ${this.formatTime(event.start_time)} - ${this.formatTime(event.end_time)}`;
    
    const options = {
      body: body,
      icon: '/logo192.png',
      tag: `reservation-updated-${event.event_id}-${Date.now()}`,
      requireInteraction: false, // 予約更新は自動で消える
      data: {
        type: 'reservation_updated',
        url: '/calendar',
        eventId: event.event_id
      }
    };

    try {
      const notification = new Notification(title, options);

      notification.onclick = (e) => {
        e.preventDefault();
        window.focus();
        window.location.href = options.data.url;
        notification.close();
      };

      // 5秒後に自動で閉じる
      setTimeout(() => {
        notification.close();
      }, 5000);

    } catch (error) {
      console.error('通知の表示に失敗:', error);
    }
  }

  /**
   * 時刻をJSTでフォーマット
   */
  formatTime(timeString) {
    try {
      const date = new Date(timeString);
      // JSTに変換 (UTC+9)
      const jstDate = new Date(date.getTime() + (9 * 60 * 60 * 1000));
      return jstDate.toLocaleTimeString('ja-JP', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false,
        timeZone: 'Asia/Tokyo'
      });
    } catch (error) {
      return timeString;
    }
  }

  /**
   * 通知音を再生
   */
  playNotificationSound() {
    try {
      // ブラウザのデフォルト通知音を使用
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBDN+zPLTgjMGHm7A7+OZSA0PVq3n77BdGAg+ltryxnMpBSh4yO/ckTsKElyw6OyrVxQLR5/e8sFuJAU0fs/y1YU2Bx1uwe/mnEgODlat5++xXxkIP5fd8sp2KgYpecnw35FAChJcr+nrrFgUDEef3vLCbyYGNH7P8tWGNgcdccPv5p1KDg9VrOjvsV8aCD+Y3fLKdywHKXjJ8N+RQAoSXK7p66xYFAxHoN7yw28mBjV/0PLWhjYHHXHE7+adSg4PVqzp77FfGgg/md3yyncsCCl4yfDgkUAKElyu6eurWBUMSKDe8sNwJwY1f9Dy1oY2Bx1xxe/mnUoPEFas6e+yYBoJQJnd8st3LAgoeMnw4JJBChNerug=');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('通知音再生エラー:', err));
    } catch (error) {
      console.error('通知音の再生に失敗:', error);
    }
  }
}

export default new NotificationService();