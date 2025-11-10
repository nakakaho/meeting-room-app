import { Box, IconButton, Typography, Paper } from '@mui/material';
import { ChevronLeft, ChevronRight } from '@mui/icons-material';
import { format, addDays, startOfWeek, isSameDay, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale';

const WeekCalendar = ({ events, loading, currentWeek, onWeekChange, onEventClick }) => {
  // 週の開始日（月曜日）を取得
  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 });

  // 1週間の日付を生成
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  // 時間スロット（9:00-22:00、15分刻み）
  const timeSlots = [];
  for (let hour = 9; hour < 22; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      timeSlots.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`);
    }
  }

  const handlePrevWeek = () => {
    onWeekChange(addDays(currentWeek, -7));
  };

  const handleNextWeek = () => {
    onWeekChange(addDays(currentWeek, 7));
  };

  // 特定の日時に予約があるかチェック
  const getEventAtTime = (date, time) => {
    return events.find((event) => {
      const eventDate = parseISO(event.start_time);
      const eventStartTime = format(eventDate, 'HH:mm');
      return isSameDay(eventDate, date) && eventStartTime === time;
    });
  };

  return (
    <Box>
      {/* 週ナビゲーション */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <IconButton onClick={handlePrevWeek}>
          <ChevronLeft />
        </IconButton>
        <Typography variant="h6" sx={{ mx: 2 }}>
          {format(weekStart, 'yyyy年M月d日', { locale: ja })} 〜 {format(addDays(weekStart, 6), 'M月d日', { locale: ja })}
        </Typography>
        <IconButton onClick={handleNextWeek}>
          <ChevronRight />
        </IconButton>
      </Box>

      {/* カレンダーグリッド */}
      <Box sx={{ overflow: 'auto', maxHeight: '70vh' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: 0.5, minWidth: '900px' }}>
          {/* ヘッダー（曜日） */}
          <Box />
          {weekDays.map((day, index) => (
            <Paper
              key={index}
              sx={{
                p: 1,
                textAlign: 'center',
                bgcolor: isSameDay(day, new Date()) ? 'primary.light' : 'grey.100',
                color: isSameDay(day, new Date()) ? 'white' : 'inherit',
              }}
            >
              <Typography variant="caption" display="block">
                {format(day, 'E', { locale: ja })}
              </Typography>
              <Typography variant="body2">
                {format(day, 'M/d')}
              </Typography>
            </Paper>
          ))}

          {/* 時間スロット */}
          {timeSlots.map((time, timeIndex) => (
            <>
              {/* 時間ラベル */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderTop: time.endsWith('00') ? 1 : 0,
                  borderColor: 'grey.300',
                  bgcolor: 'grey.50',
                }}
              >
                {time.endsWith('00') && (
                  <Typography variant="caption" color="text.secondary">
                    {time}
                  </Typography>
                )}
              </Box>

              {/* 各日のセル */}
              {weekDays.map((day, dayIndex) => {
                const event = getEventAtTime(day, time);
                return (
                  <Paper
                    key={`${dayIndex}-${timeIndex}`}
                    sx={{
                      minHeight: '30px',
                      cursor: event ? 'pointer' : 'default',
                      bgcolor: event ? 'primary.main' : 'white',
                      color: event ? 'white' : 'inherit',
                      borderTop: time.endsWith('00') ? 1 : 0,
                      borderColor: 'grey.300',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 0.5,
                      '&:hover': event ? {
                        bgcolor: 'primary.dark',
                      } : {},
                    }}
                    onClick={() => event && onEventClick(event)}
                  >
                    {event && time === format(parseISO(event.start_time), 'HH:mm') && (
                      <Typography variant="caption" noWrap>
                        {event.memo || '予約あり'}
                      </Typography>
                    )}
                  </Paper>
                );
              })}
            </>
          ))}
        </Box>
      </Box>

      {loading && (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography>読み込み中...</Typography>
        </Box>
      )}
    </Box>
  );
};

export default WeekCalendar;
