import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Chip,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  Autocomplete,
  Typography,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api/axios';
import moment from 'moment';

const minuteOptions = ["00", "15", "30", "45"];

const EventFormModal = ({ 
  open, 
  slot, 
  event, 
  defaultRoomId, 
  rooms: roomsProp,
  users: usersProp,
  onClose, 
  onSubmit,
  onRollback,
}) => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!event;

  const [formData, setFormData] = useState({
    room_id: '',
    start_time: '',
    end_time: '',
    attendees: [],
    memo: '',
  });

  // 権限チェック関数
  const canEdit = () => {
    if (!user) return false;
    if (!event) return true;
    if (user.role === 'admin') return true;
    
    const organizerId = event.resource?.organizer_id 
      || event.resource?.raw?.organizer_id 
      || event.organizer_id;
    
    return organizerId === user.id;
  };

  const canDelete = () => {
    if (!user || !event) return false;
    if (user.role === 'admin') return true;
    
    const organizerId = event.resource?.organizer_id 
      || event.resource?.raw?.organizer_id 
      || event.organizer_id;
    
    return organizerId === user.id;
  };

  // 予約者情報の取得（編集モード用）
  const organizerId = event?.resource?.organizer_id 
    || event?.resource?.raw?.organizer_id 
    || event?.organizer_id;
  
  const organizerName = event?.resource?.organizer_name 
    || event?.resource?.raw?.organizer?.name 
    || event?.organizer?.name 
    || users.find(u => u.id === organizerId)?.name 
    || t('common.unknown') || '不明';

  useEffect(() => {
    const fetchData = async () => {
      if (!open) return;

      if (roomsProp && roomsProp.length > 0) {
        setRooms(roomsProp);
      } else {
        setLoading(true);
        try {
          const roomsRes = await api.get('/rooms', {
            params: { branch_id: user?.branch_id }
          });
          if (roomsRes.data.success) {
            setRooms(roomsRes.data.rooms);
          }
        } catch (error) {
          console.error('部屋取得エラー:', error);
        }
        setLoading(false);
      }

      if (usersProp && usersProp.length > 0) {
        setUsers(usersProp);
      } else {
        setLoading(true);
        try {
          const usersRes = await api.get('/users/branch');
          if (usersRes.data.success) {
            setUsers(usersRes.data.users);
          }
        } catch (error) {
          console.error('ユーザー取得エラー:', error);
        }
        setLoading(false);
      }

      setMessage({ type: '', text: '' });
    };

    fetchData();
  }, [open, user, roomsProp, usersProp]);

  useEffect(() => {
    if (!open) return;

    if (event) {
      const raw = event.resource?.raw || event;
      
      setFormData({
        room_id: raw.room_id || '',
        start_time: raw.start_time 
          ? moment(raw.start_time).format('YYYY-MM-DD HH:mm:ss') 
          : moment(event.start || event.start_time).format('YYYY-MM-DD HH:mm:ss'),
        end_time: raw.end_time 
          ? moment(raw.end_time).format('YYYY-MM-DD HH:mm:ss') 
          : moment(event.end || event.end_time).format('YYYY-MM-DD HH:mm:ss'),
        attendees: raw.attendees ? raw.attendees.map(a => a.user_id) : [],
        memo: raw.memo || '',
      });
    } else if (slot) {
      setFormData({
        room_id: defaultRoomId || '',
        start_time: moment(slot.start).format('YYYY-MM-DD HH:mm:ss'),
        end_time: moment(slot.end).format('YYYY-MM-DD HH:mm:ss'),
        attendees: [],
        memo: '',
      });
    } else {
      setFormData({
        room_id: defaultRoomId || '',
        start_time: moment().format('YYYY-MM-DD HH:mm:00'),
        end_time: moment().add(30, 'minutes').format('YYYY-MM-DD HH:mm:00'),
        attendees: [],
        memo: '',
      });
    }
  }, [open, slot, event, defaultRoomId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const eventId = event?.id || event?.event_id;
      
      if (isEdit && event) {
        onSubmit && onSubmit('update', eventId, formData);

        const response = await api.put(`/events/${eventId}`, {
          branch_id: user?.branch_id,
          ...formData,
        });

        if (response.data.success) {
          setMessage({ type: 'success', text: t('booking.update_success') || '予約を更新しました' });
          setTimeout(() => {
            onClose && onClose();
          }, 1000);
        }
      } else {
        onSubmit && onSubmit('create', null, formData);

        const response = await api.post('/events', {
          branch_id: user?.branch_id,
          ...formData,
        });

        if (response.data.success) {
          setMessage({ type: 'success', text: t('booking.create_success') || '予約を作成しました' });
          setTimeout(() => {
            onClose && onClose();
          }, 1000);
        }
      }
    } catch (error) {
      const eventId = event?.id || event?.event_id;
      if (onRollback) {
        onRollback(eventId);
      }

      if (error.response?.data?.message) {
        setMessage({ type: 'error', text: error.response.data.message });
      } else if (error.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
        setMessage({ type: 'error', text: errorMessages });
      } else {
        setMessage({ type: 'error', text: t('booking.save_failed') || '保存に失敗しました' });
      }
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t('booking.cancel_confirm'))) return;
    setSubmitting(true);

    try {
      const eventId = event?.id || event?.event_id;
      
      onSubmit && onSubmit('delete', eventId, null);

      const response = await api.delete(`/events/${eventId}`);
      
      if (response.data.success) {
        setMessage({ type: 'success', text: t('booking.cancel_success') || '予約をキャンセルしました' });
        setTimeout(() => {
          onClose && onClose();
        }, 1000);
      }
    } catch (error) {
      const eventId = event?.id || event?.event_id;
      if (onRollback) {
        onRollback(eventId);
      }

      if (error.response?.data?.message) {
        setMessage({ type: 'error', text: error.response.data.message });
      } else {
        setMessage({ type: 'error', text: t('booking.cancel_failed') || 'キャンセルに失敗しました' });
      }
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const isEditable = canEdit();
  const isDeletable = canDelete();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>
          {isEdit ? t('booking.edit_booking') : t('booking.create_booking')}
          <IconButton
            aria-label="close"
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          {message.text && (
            <Alert severity={message.type} sx={{ mb: 2 }}>
              {message.text}
            </Alert>
          )}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <FormControl fullWidth sx={{ mt: 2 }} disabled={!isEditable || submitting}>
                <InputLabel>{t('booking.room')}</InputLabel>
                <Select
                  value={formData.room_id}
                  onChange={(e) => setFormData({ ...formData, room_id: e.target.value })}
                  required
                  label={t('booking.room')}
                >
                  {rooms.map(room => (
                    <MenuItem key={room.room_id} value={room.room_id}>
                      {room.room_name} ({t('room.capacity')}: {room.capacity}{t('room.people') || '名'})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* 開始日時 */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <TextField
                  label={t('booking.start_time')}
                  type="date"
                  value={moment(formData.start_time).format("YYYY-MM-DD")}
                  onChange={(e) => {
                    const date = e.target.value;
                    const startHour = moment(formData.start_time).format("HH");
                    const startMinute = moment(formData.start_time).format("mm");
                    const endHour = moment(formData.end_time).format("HH");
                    const endMinute = moment(formData.end_time).format("mm");

                    setFormData({
                      ...formData,
                      start_time: `${date} ${startHour}:${startMinute}:00`,
                      end_time: `${date} ${endHour}:${endMinute}:00`,
                    });
                  }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={!isEditable || submitting}
                />

                <FormControl fullWidth disabled={!isEditable || submitting}>
                  <Select
                    value={moment(formData.start_time).format("HH")}
                    onChange={(e) => {
                      const hour = e.target.value;
                      const date = moment(formData.start_time).format("YYYY-MM-DD");
                      const minute = moment(formData.start_time).format("mm");

                      setFormData({
                        ...formData,
                        start_time: `${date} ${hour}:${minute}:00`,
                      });
                    }}
                  >
                    {[...Array(24)].map((_, i) => (
                      <MenuItem key={i} value={String(i).padStart(2, "0")}>
                        {String(i).padStart(2, "0")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth disabled={!isEditable || submitting}>
                  <Select
                    value={moment(formData.start_time).format("mm")}
                    onChange={(e) => {
                      const minute = e.target.value;
                      const date = moment(formData.start_time).format("YYYY-MM-DD");
                      const hour = moment(formData.start_time).format("HH");

                      setFormData({
                        ...formData,
                        start_time: `${date} ${hour}:${minute}:00`,
                      });
                    }}
                  >
                    {minuteOptions.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* 終了日時 */}
              <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                <TextField
                  label={t('booking.end_time')}
                  type="date"
                  value={moment(formData.end_time).format("YYYY-MM-DD")}
                  onChange={(e) => {
                    const date = e.target.value;
                    const hour = moment(formData.end_time).format("HH");
                    const minute = moment(formData.end_time).format("mm");

                    setFormData({
                      ...formData,
                      end_time: `${date} ${hour}:${minute}:00`,
                    });
                  }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  disabled={!isEditable || submitting}
                />

                <FormControl fullWidth disabled={!isEditable || submitting}>
                  <Select
                    value={moment(formData.end_time).format("HH")}
                    onChange={(e) => {
                      const hour = e.target.value;
                      const date = moment(formData.end_time).format("YYYY-MM-DD");
                      const minute = moment(formData.end_time).format("mm");

                      setFormData({
                        ...formData,
                        end_time: `${date} ${hour}:${minute}:00`,
                      });
                    }}
                  >
                    {[...Array(24)].map((_, i) => (
                      <MenuItem key={i} value={String(i).padStart(2, "0")}>
                        {String(i).padStart(2, "0")}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth disabled={!isEditable || submitting}>
                  <Select
                    value={moment(formData.end_time).format("mm")}
                    onChange={(e) => {
                      const minute = e.target.value;
                      const date = moment(formData.end_time).format("YYYY-MM-DD");
                      const hour = moment(formData.end_time).format("HH");

                      setFormData({
                        ...formData,
                        end_time: `${date} ${hour}:${minute}:00`,
                      });
                    }}
                  >
                    {minuteOptions.map((m) => (
                      <MenuItem key={m} value={m}>
                        {m}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* 編集モード：予約者表示 + 参加者選択 */}
              {isEdit && (
                <>
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
                      {t('booking.organizer') || '予約者'}: {organizerName}
                    </Typography>
                  </Box>

                  <Autocomplete
                    multiple
                    options={users.filter(u => u.id !== organizerId)}
                    getOptionLabel={(option) => option.name}
                    value={users.filter(u => formData.attendees.includes(u.id))}
                    onChange={(event, newValue) => {
                      setFormData({ 
                        ...formData, 
                        attendees: newValue.map(u => u.id) 
                      });
                    }}
                    disabled={!isEditable || submitting}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label={t('booking.other_attendees') || 'その他の参加者'}
                        placeholder={t('booking.search_attendees') || '参加者を検索...'}
                        sx={{ mt: 2 }}
                      />
                    )}
                    renderTags={(value, getTagProps) =>
                      value.map((option, index) => {
                        const { key, ...tagProps } = getTagProps({ index });
                        return (
                          <Chip
                            key={key}
                            label={option.name}
                            {...tagProps}
                            size="small"
                          />
                        );
                      })
                    }
                    noOptionsText={t('booking.no_users_found') || '該当するユーザーがいません'}
                  />
                </>
              )}

              {/* 新規作成モード：参加者選択（自分を除外） */}
              {!isEdit && (
                <Autocomplete
                  multiple
                  options={users.filter(u => u.id !== user?.id)}
                  getOptionLabel={(option) => option.name}
                  value={users.filter(u => formData.attendees.includes(u.id))}
                  onChange={(event, newValue) => {
                    setFormData({ 
                      ...formData, 
                      attendees: newValue.map(u => u.id) 
                    });
                  }}
                  disabled={!isEditable || submitting}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label={t('booking.attendees') || '参加者'}
                      placeholder={t('booking.search_attendees') || '参加者を検索...'}
                      sx={{ mt: 2 }}
                    />
                  )}
                  renderTags={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          key={key}
                          label={option.name}
                          {...tagProps}
                          size="small"
                        />
                      );
                    })
                  }
                  noOptionsText={t('booking.no_users_found') || '該当するユーザーがいません'}
                />
              )}

              <TextField
                fullWidth
                label={t('booking.memo')}
                multiline
                rows={3}
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                sx={{ mt: 2 }}
                inputProps={{ maxLength: 150 }}
                helperText={`${formData.memo.length}/150`}
                disabled={!isEditable || submitting}
              />
            </>
          )}
        </DialogContent>

        <DialogActions>
          {!loading && (
            <>
              {isEdit && isDeletable && (
                <Button 
                  onClick={handleDelete} 
                  variant="contained"
                  color="error" 
                  disabled={submitting}
                >
                  {submitting ? t('common.processing') || '処理中...' : t('booking.cancel')}
                </Button>
              )}

              {isEditable && (
                <Button type="submit" variant="contained" disabled={submitting}>
                  {submitting 
                    ? t('common.processing') || '処理中...' 
                    : (isEdit ? t('common.update') : t('booking.create'))
                  }
                </Button>
              )}
            </>
          )}
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default EventFormModal;