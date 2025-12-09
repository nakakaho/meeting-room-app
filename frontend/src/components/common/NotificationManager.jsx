// src/components/common/NotificationManager.jsx
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';

/**
 * 通知機能を管理するコンポーネント
 * ユーザーがログインしている場合のみ通知チェックを実行
 */
const NotificationManager = () => {
  const { user, isAuthenticated } = useAuth();
  
  // ✅ useNotifications を実行
  useNotifications(user);

  useEffect(() => {
    if (isAuthenticated && user) {
      console.log('✅ NotificationManager: 通知機能が有効化されました', {
        userId: user.id,
        notify_my_schedule: user.notify_my_schedule,
        notify_all_schedule: user.notify_all_schedule
      });
    } else {
      console.log('⚠️ NotificationManager: ユーザー未ログイン');
    }
  }, [isAuthenticated, user]);

  // このコンポーネントは何も描画しない
  return null;
};

export default NotificationManager;