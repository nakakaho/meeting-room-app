// src/api/notificationService.js
import i18n from '../i18n';

class NotificationService {
  constructor() {
    this.permission = 'default';
    this.checkPermission();
  }

  checkPermission() {
    if ('Notification' in window) {
      this.permission = Notification.permission;
    }
    return this.permission;
  }

  async requestPermission() {
    if (!('Notification' in window)) {
      console.warn('このブラウザは通知に対応していません');
      return false;
    }

    if (this.permission === 'granted') return true;

    try {
      this.permission = await Notification.requestPermission();
      return this.permission === 'granted';
    } catch (e) {
      console.error('通知権限の取得に失敗', e);
      return false;
    }
  }

  /**
   * 時刻フォーマット（タイムゾーン対応）
   * @param {string} timeString - ISO形式の時刻
   * @param {string} timezone - タイムゾーン（例: 'Asia/Tokyo'）
   * @returns {string} - HH:mm 形式
   */
  formatTime(timeString, timezone = 'UTC') {
    try {
      const lang = i18n.language === 'ja' ? 'ja-JP' : 'en-US';
      return new Date(timeString).toLocaleTimeString(lang, {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
        timeZone: timezone,
      });
    } catch (e) {
      console.error('時刻フォーマットエラー:', e);
      return timeString;
    }
  }

  /**
   * マイ予約通知（多言語対応）
   */
  showMyScheduleNotification(event) {
    if (this.permission !== 'granted') return;

    const tz = event.timezone ?? 'Asia/Tokyo';
    const start = this.formatTime(event.start_time, tz);
    const end = this.formatTime(event.end_time, tz);

    // ✅ 翻訳文字列を使用
    const title = i18n.t('notification.my_schedule_title');
    const body = i18n.t('notification.my_schedule_body', {
      room: event.room_name,
      time: `${start}〜${end}`,
      organizer: event.organizer_name ?? ''
    });

    const n = new Notification(title, {
      body,
      icon: '/favicon.ico',
      tag: `my-${event.event_id}`,
      data: { url: '/my-bookings' }
    });

    n.onclick = () => {
      window.focus();
      window.location.href = '/my-bookings';
      n.close();
    };
  }
}

export default new NotificationService();