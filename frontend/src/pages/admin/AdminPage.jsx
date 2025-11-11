import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Tabs,
  Tab,
} from '@mui/material';
import UserManagement from '../../components/admin/UserManagement';
import RoomManagement from '../../components/admin/RoomManagement';

const AdminPage = () => {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        管理者ページ
      </Typography>

      <Paper sx={{ mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="ユーザー管理" />
          <Tab label="会議室管理" />
        </Tabs>
      </Paper>

      <Box>
        {tabValue === 0 && <UserManagement />}
        {tabValue === 1 && <RoomManagement />}
      </Box>
    </Container>
  );
};

export default AdminPage;