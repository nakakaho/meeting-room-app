import { useState, useEffect, useRef } from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Box,
  CircularProgress,
  Typography,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { format, parseISO } from 'date-fns';
import { ja, enUS } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import { useEvent } from '../../contexts/EventContext';
import EventFormModal from '../../pages/calendar/EventFormModal.jsx';
import { useAuth } from '../../contexts/AuthContext';

const BookingManagement = () => {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { events: allEvents, getEvents, deleteEvent, loading } = useEvent();
  const [events, setEvents] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const currentEventRef = useRef(null);

  const dateLocale = i18n.language === 'ja' ? ja : enUS;

  useEffect(() => {
    fetchMyEvents();
  }, [user]);

  useEffect(() => {
    if (!loading && currentEventRef.current) {
      setTimeout(() => {
        const element = currentEventRef.current;
        const container = element.closest('.MuiTableContainer-root');
        
        if (container) {
          const elementTop = element.offsetTop;
          const offset = 100;
          
          container.scrollTo({
            top: elementTop - offset,
            behavior: 'smooth',
          });
        }
      }, 100);
    }
  }, [loading, events]);

  const fetchMyEvents = async () => {
    try {
      const result = await getEvents(user?.branch_id || 1);
      
      if (result.success) {
        const sortedEvents = result.events
          .sort((a, b) => new Date(b.start_time) - new Date(a.start_time));
        
        setEvents(sortedEvents);
      }
    } catch (error) {
      console.error('予約の取得に失敗:', error);
    }
  };

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setDialogOpen(true);
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm(t('booking.cancel_confirm'))) return;

    try {
      const result = await deleteEvent(eventId);
      if (result.success) {
        fetchMyEvents();
      }
    } catch (error) {
      alert(error.response?.data?.message || t('booking.delete_failed') || '削除に失敗しました');
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedEvent(null);
  };

  const handleEventSaved = () => {
    handleDialogClose();
    fetchMyEvents();
  };

  const isPastEvent = (endTime) => {
    return new Date(endTime) < new Date();
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          gap: 3,
        }}
      >
        <CircularProgress size={30} thickness={3} sx={{ color: 'primary.main' }} />
        <Typography
          variant="h6"
          color="text.secondary"
          sx={{
            animation: 'pulse 1.5s ease-in-out infinite',
            '@keyframes pulse': {
              '0%, 100%': { opacity: 1 },
              '50%': { opacity: 0.5 },
            },
          }}
        >
          {t('common.loading')}
        </Typography>
      </Box>
    );
  }

  return (
    <>
      {events.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography color="text.secondary">{t('booking.no_bookings')}</Typography>
        </Paper>
      ) : (
        <TableContainer 
          component={Paper}
          sx={{
            maxHeight: '70vh',
            overflow: 'auto',
          }}
        >
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>{t('booking.date')}</TableCell>
                <TableCell>{t('booking.organizer')}</TableCell>
                <TableCell>{t('booking.room')}</TableCell>
                <TableCell>{t('booking.time')}</TableCell>
                <TableCell>{t('booking.status')}</TableCell>
                <TableCell align="center">{t('booking.actions')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {events.map((event, index) => {
                const past = isPastEvent(event.end_time);
                const isOrganizer = event.organizer_id === user?.id;

                const now = new Date();
                const eventStart = new Date(event.start_time);
                const eventEnd = new Date(event.end_time);
                const isCurrent = eventStart <= now && eventEnd > now;
                const isNextFuture = !past && index === 0 && !isCurrent;
                const shouldScroll = isCurrent || isNextFuture;
                
                return (
                  <TableRow 
                    key={event.event_id} 
                    ref={shouldScroll ? currentEventRef : null}
                    sx={{ bgcolor: past ? 'grey.100' : 'inherit' }}
                  >
                    <TableCell>
                      {i18n.language === 'ja' 
                        ? format(parseISO(event.start_time), 'yyyy年M月d日(E)', { locale: dateLocale })
                        : format(parseISO(event.start_time), 'MMM d, yyyy (EEE)', { locale: dateLocale })
                      }
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={event.organizer?.name || t('common.unknown')} 
                        color={isOrganizer ? 'primary' : 'default'}
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{event.room_name}</TableCell>
                    <TableCell>
                      {format(parseISO(event.start_time), 'HH:mm')} 〜{' '}
                      {format(parseISO(event.end_time), 'HH:mm')}
                    </TableCell>
                    <TableCell>
                      {past ? (
                        <Chip label={t('booking.completed')} size="small" />
                      ) : (
                        <Chip label={t('booking.reserved')} color="primary" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {!past && (
                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                          <Button
                            size="small"
                            startIcon={<EditIcon />}
                            sx={{ color: 'secondary.light' }}
                            onClick={() => handleEdit(event)}
                          >
                            {t('booking.edit')}
                          </Button>
                          <Button
                            size="small"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDelete(event.event_id)}
                          >
                            {t('booking.cancel')}
                          </Button>
                        </Box>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <EventFormModal
        open={dialogOpen}
        event={selectedEvent}
        roomId={selectedEvent?.room_id}
        onClose={handleDialogClose}
        onSaved={handleEventSaved}
      />
    </>
  );
};

export default BookingManagement;