import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Paper,
  Grid,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from '@mui/material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';

interface ProfileFormValues {
  name: string;
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface SettingsFormValues {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  language: string;
  timezone: string;
  theme: 'light' | 'dark' | 'system';
}

const profileValidationSchema = Yup.object({
  name: Yup.string().required('Имя обязательно'),
  email: Yup.string().email('Введите корректный email').required('Email обязателен'),
  currentPassword: Yup.string().when('newPassword', {
    is: (val: string) => val && val.length > 0,
    then: Yup.string().required('Текущий пароль обязателен'),
    otherwise: Yup.string(),
  }),
  newPassword: Yup.string().min(6, 'Пароль должен содержать минимум 6 символов'),
  confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'Пароли должны совпадать'),
});

const settingsValidationSchema = Yup.object({
  notifications: Yup.object({
    email: Yup.boolean(),
    push: Yup.boolean(),
    sms: Yup.boolean(),
  }),
  language: Yup.string().required('Язык обязателен'),
  timezone: Yup.string().required('Часовой пояс обязателен'),
  theme: Yup.string().oneOf(['light', 'dark', 'system']).required('Тема обязательна'),
});

export const Settings: React.FC = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleProfileOpen = () => setProfileOpen(true);
  const handleProfileClose = () => setProfileOpen(false);
  const handleSettingsOpen = () => setSettingsOpen(true);
  const handleSettingsClose = () => setSettingsOpen(false);

  const handleProfileSubmit = async (values: ProfileFormValues) => {
    try {
      // Здесь будет логика обновления профиля
      console.log('Update profile:', values);
      setSuccessMessage('Профиль успешно обновлен');
      handleProfileClose();
    } catch (error) {
      setErrorMessage('Ошибка при обновлении профиля');
    }
  };

  const handleSettingsSubmit = async (values: SettingsFormValues) => {
    try {
      // Здесь будет логика обновления настроек
      console.log('Update settings:', values);
      setSuccessMessage('Настройки успешно обновлены');
      handleSettingsClose();
    } catch (error) {
      setErrorMessage('Ошибка при обновлении настроек');
    }
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Настройки
      </Typography>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Профиль
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Управление личными данными и безопасностью
            </Typography>
            <Button variant="contained" onClick={handleProfileOpen}>
              Редактировать профиль
            </Button>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Настройки системы
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              Настройки уведомлений, языка и темы
            </Typography>
            <Button variant="contained" onClick={handleSettingsOpen}>
              Настроить систему
            </Button>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={profileOpen} onClose={handleProfileClose} maxWidth="sm" fullWidth>
        <DialogTitle>Редактировать профиль</DialogTitle>
        <Formik
          initialValues={{
            name: user?.name || '',
            email: user?.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
          }}
          validationSchema={profileValidationSchema}
          onSubmit={handleProfileSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <DialogContent>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Имя"
                  name="name"
                  autoComplete="name"
                  autoFocus
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
                <Divider sx={{ my: 2 }} />
                <Typography variant="subtitle1" gutterBottom>
                  Изменить пароль
                </Typography>
                <TextField
                  margin="normal"
                  fullWidth
                  name="currentPassword"
                  label="Текущий пароль"
                  type="password"
                  id="currentPassword"
                  autoComplete="current-password"
                  value={values.currentPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.currentPassword && Boolean(errors.currentPassword)}
                  helperText={touched.currentPassword && errors.currentPassword}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  name="newPassword"
                  label="Новый пароль"
                  type="password"
                  id="newPassword"
                  autoComplete="new-password"
                  value={values.newPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.newPassword && Boolean(errors.newPassword)}
                  helperText={touched.newPassword && errors.newPassword}
                />
                <TextField
                  margin="normal"
                  fullWidth
                  name="confirmPassword"
                  label="Подтверждение пароля"
                  type="password"
                  id="confirmPassword"
                  autoComplete="new-password"
                  value={values.confirmPassword}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.confirmPassword && Boolean(errors.confirmPassword)}
                  helperText={touched.confirmPassword && errors.confirmPassword}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleProfileClose}>Отмена</Button>
                <Button type="submit" variant="contained">
                  Сохранить
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Dialog open={settingsOpen} onClose={handleSettingsClose} maxWidth="sm" fullWidth>
        <DialogTitle>Настройки системы</DialogTitle>
        <Formik
          initialValues={{
            notifications: {
              email: true,
              push: true,
              sms: false,
            },
            language: 'ru',
            timezone: 'Europe/Moscow',
            theme: 'light',
          }}
          validationSchema={settingsValidationSchema}
          onSubmit={handleSettingsSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <DialogContent>
                <Typography variant="subtitle1" gutterBottom>
                  Уведомления
                </Typography>
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.notifications.email}
                      onChange={handleChange}
                      name="notifications.email"
                    />
                  }
                  label="Email уведомления"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.notifications.push}
                      onChange={handleChange}
                      name="notifications.push"
                    />
                  }
                  label="Push уведомления"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={values.notifications.sms}
                      onChange={handleChange}
                      name="notifications.sms"
                    />
                  }
                  label="SMS уведомления"
                />
                <Divider sx={{ my: 2 }} />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="language"
                  label="Язык"
                  name="language"
                  select
                  value={values.language}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.language && Boolean(errors.language)}
                  helperText={touched.language && errors.language}
                >
                  <option value="ru">Русский</option>
                  <option value="en">English</option>
                </TextField>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="timezone"
                  label="Часовой пояс"
                  name="timezone"
                  select
                  value={values.timezone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.timezone && Boolean(errors.timezone)}
                  helperText={touched.timezone && errors.timezone}
                >
                  <option value="Europe/Moscow">Москва (UTC+3)</option>
                  <option value="Europe/London">Лондон (UTC+0)</option>
                  <option value="America/New_York">Нью-Йорк (UTC-5)</option>
                </TextField>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="theme"
                  label="Тема"
                  name="theme"
                  select
                  value={values.theme}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.theme && Boolean(errors.theme)}
                  helperText={touched.theme && errors.theme}
                >
                  <option value="light">Светлая</option>
                  <option value="dark">Темная</option>
                  <option value="system">Системная</option>
                </TextField>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleSettingsClose}>Отмена</Button>
                <Button type="submit" variant="contained">
                  Сохранить
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
}; 