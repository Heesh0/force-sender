import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './store';
import { theme } from './theme';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Senders } from './pages/Senders';
import { Campaigns } from './pages/Campaigns';
import { Recipients } from './pages/Recipients';
import { Templates } from './pages/Templates';
import { Settings } from './pages/Settings';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<Layout />}>
              <Route
                index
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="senders"
                element={
                  <PrivateRoute>
                    <Senders />
                  </PrivateRoute>
                }
              />
              <Route
                path="campaigns"
                element={
                  <PrivateRoute>
                    <Campaigns />
                  </PrivateRoute>
                }
              />
              <Route
                path="recipients"
                element={
                  <PrivateRoute>
                    <Recipients />
                  </PrivateRoute>
                }
              />
              <Route
                path="templates"
                element={
                  <PrivateRoute>
                    <Templates />
                  </PrivateRoute>
                }
              />
              <Route
                path="settings"
                element={
                  <PrivateRoute>
                    <Settings />
                  </PrivateRoute>
                }
              />
            </Route>
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
};

export default App; 