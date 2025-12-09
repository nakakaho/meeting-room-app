import { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import { useTranslation } from 'react-i18next';
import UserManagement from '../../components/admin/UserManagement';
import RoomManagement from '../../components/admin/RoomManagement';
import BookingManagement from '../../components/admin/BookingManagement';

const AdminPage = () => {
  const { t } = useTranslation();
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {t('admin.admin_page')}
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={t('admin.user_management')} />
          <Tab label={t('admin.room_management')} />
          <Tab label={t('admin.booking_management')} />
        </Tabs>
      </Paper>

      <Box>
        {tabValue === 0 && <UserManagement />}
        {tabValue === 1 && <RoomManagement />}
        {tabValue === 2 && <BookingManagement />}
      </Box>
    </Container>
  );
};

export default AdminPage;