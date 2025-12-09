// src/components/layout/CurrentUsageBar.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Card, CardContent, Typography, CircularProgress } from '@mui/material';
import EventIcon from '@mui/icons-material/Event';
import moment from 'moment';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';

const CurrentUsageBar = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const branchId = user?.branch_id ?? 1;

  // 部屋情報取得
  const fetchRooms = useCallback(async () => {
    try {
      const res = await api.get('/rooms', { params: { branch_id: branchId } });
      if (res.data.success) {
        setRooms(res.data.rooms);
      }
    } catch (error) {
      console.error('部屋取得エラー:', error);
    }
  }, [branchId]);

  // 予約情報取得
  const fetchEvents = useCallback(async () => {
    try {
      const response = await api.get('/events', { params: { branch_id: branchId } });

      if (response.data.success) {
        const formattedEvents = response.data.events.map(event => ({
          id: event.event_id,
          start: new Date(event.start_time),
          end: new Date(event.end_time),
          resource: {
            room_id: event.room_id,
            organizer_name: event.organizer?.name || t('common.unknown') || '不明',
          }
        }));

        setAllEvents(formattedEvents);
      }
    } catch (error) {
      console.error('予約取得エラー:', error);
    } finally {
      setLoading(false);
    }
  }, [branchId, t]);

  // 初回読み込み
  useEffect(() => {
    fetchRooms();
    fetchEvents();
  }, [branchId]);

  // 10秒ごとの自動更新
  useEffect(() => {
    const interval = setInterval(() => {
      fetchEvents();
    }, 10000);

    return () => clearInterval(interval);
  }, [fetchEvents]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 2, bgcolor: '#f5f5f5' }}>
        <CircularProgress size={20} />
      </Box>
    );
  }

  return (
    <Box sx={{ bgcolor: '#f5f5f5', py: 2, borderBottom: '1px solid #ddd' }}>
      <Box sx={{ maxWidth: '1200px', margin: '0 auto', px: 2 }}>
        {/* タイトル */}
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
          <EventIcon sx={{ color: 'primary.main', fontSize: 24, mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
            {t('calendar.current_usage') || '現在の利用状況'}
          </Typography>
        </Box>

        {/* 部屋一覧 */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, flexWrap: 'wrap', maxWidth: '100%' }}>
          {rooms.map(room => {
            const now = new Date();
            const current = allEvents.filter(
              e => e.resource.room_id === room.room_id && e.start <= now && e.end >= now
            );
            const isInUse = current.length > 0;

            return (
              <Card
                key={room.room_id}
                sx={{
                  width: 200,
                  minHeight: 100,
                  bgcolor: isInUse ? 'rgba(88, 89, 90, 0.1)' : 'rgba(255, 112, 67, 0.1)',
                  border: `2px solid ${isInUse ? '#58595a' : '#ff7043'}`,
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Box
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: isInUse ? '#58595a' : '#ff7043',
                        mr: 0.8,
                        flexShrink: 0
                      }}
                    />
                    <Typography variant="subtitle1" component="div" noWrap>
                      {room.room_name}
                    </Typography>
                  </Box>

                  {isInUse ? (
                    <>
                      <Typography variant="caption" color="text.secondary" sx={{ mb: 0.3 }}>
                        {moment(current[0].start).format('HH:mm')}〜{moment(current[0].end).format('HH:mm')}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                        {current[0].resource.organizer_name}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <Typography variant="caption" color="text.primary" sx={{ mb: 0.3, visibility: 'hidden' }}>
                        --:-- 〜 --:--
                      </Typography>
                      <Typography variant="body2" color="text.primary" sx={{ fontWeight: 'bold', mt: 0.5 }}>
                        {t('calendar.available') || '空き'}
                      </Typography>
                    </>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default CurrentUsageBar;