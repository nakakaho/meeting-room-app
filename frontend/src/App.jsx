// src/App.jsx
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import AppRoutes from './routes';
import Layout from './components/layout/Layout';
import theme from './theme';

import { AuthProvider } from './contexts/AuthContext';
import { UserProvider } from './contexts/UserContext';
import { EventProvider } from './contexts/EventContext';
import { RoomProvider } from './contexts/RoomContext';
import { AdminProvider } from './contexts/AdminContext';
import { Room } from '@mui/icons-material';
import NotificationManager from './components/common/NotificationManager';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>

        {/* 🔥 これが抜けていた！！！！ */}
        <AuthProvider>
          <UserProvider>
            <EventProvider>
              <RoomProvider>
                <AdminProvider>
                  <NotificationManager />
                  <Layout>
                    <AppRoutes />
                  </Layout>
                </AdminProvider>
              </RoomProvider>
            </EventProvider>
          </UserProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
