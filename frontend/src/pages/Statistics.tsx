import React from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  TrendingUp as TrendingUpIcon,
  AccessTime as AccessTimeIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  trend?: number;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color, trend }) => (
  <Card>
    <CardContent>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <Box
          sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 1,
            mr: 2,
          }}
        >
          {icon}
        </Box>
        <Typography variant="h6" component="div">
          {title}
        </Typography>
      </Box>
      <Typography variant="h4" component="div" sx={{ mb: 1 }}>
        {value}
      </Typography>
      {trend !== undefined && (
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TrendingUpIcon
            sx={{
              color: trend >= 0 ? 'success.main' : 'error.main',
              mr: 0.5,
            }}
          />
          <Typography
            variant="body2"
            color={trend >= 0 ? 'success.main' : 'error.main'}
          >
            {Math.abs(trend)}% с прошлого периода
          </Typography>
        </Box>
      )}
      <LinearProgress
        variant="determinate"
        value={100}
        sx={{
          height: 4,
          borderRadius: 2,
          backgroundColor: `${color}20`,
          '& .MuiLinearProgress-bar': {
            backgroundColor: color,
          },
        }}
      />
    </CardContent>
  </Card>
);

export const Statistics: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Здесь будут данные из Redux store
  const stats = {
    totalEmails: 15000,
    deliveredEmails: 14500,
    failedEmails: 500,
    openRate: 65,
    clickRate: 35,
    bounceRate: 3,
    unsubscribeRate: 2,
    avgDeliveryTime: 2.5,
  };

  const trends = {
    totalEmails: 15,
    deliveredEmails: 18,
    failedEmails: -25,
    openRate: 5,
    clickRate: 8,
    bounceRate: -10,
    unsubscribeRate: -5,
    avgDeliveryTime: -15,
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Статистика
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Всего писем"
            value={stats.totalEmails}
            icon={<EmailIcon sx={{ color: '#1976d2' }} />}
            color="#1976d2"
            trend={trends.totalEmails}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Доставлено"
            value={stats.deliveredEmails}
            icon={<CheckCircleIcon sx={{ color: '#2e7d32' }} />}
            color="#2e7d32"
            trend={trends.deliveredEmails}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Ошибки"
            value={stats.failedEmails}
            icon={<ErrorIcon sx={{ color: '#d32f2f' }} />}
            color="#d32f2f"
            trend={trends.failedEmails}
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Среднее время доставки"
            value={stats.avgDeliveryTime}
            icon={<AccessTimeIcon sx={{ color: '#ed6c02' }} />}
            color="#ed6c02"
            trend={trends.avgDeliveryTime}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Статистика открытий
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="div" sx={{ mr: 2 }}>
                {stats.openRate}%
              </Typography>
              <Typography
                variant="body2"
                color={trends.openRate >= 0 ? 'success.main' : 'error.main'}
              >
                {trends.openRate >= 0 ? '+' : ''}{trends.openRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={stats.openRate}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#2e7d32',
                },
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Статистика переходов
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="div" sx={{ mr: 2 }}>
                {stats.clickRate}%
              </Typography>
              <Typography
                variant="body2"
                color={trends.clickRate >= 0 ? 'success.main' : 'error.main'}
              >
                {trends.clickRate >= 0 ? '+' : ''}{trends.clickRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={stats.clickRate}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#1976d2',
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Отказы
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="div" sx={{ mr: 2 }}>
                {stats.bounceRate}%
              </Typography>
              <Typography
                variant="body2"
                color={trends.bounceRate >= 0 ? 'error.main' : 'success.main'}
              >
                {trends.bounceRate >= 0 ? '+' : ''}{trends.bounceRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={stats.bounceRate}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#d32f2f',
                },
              }}
            />
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Отписки
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Typography variant="h4" component="div" sx={{ mr: 2 }}>
                {stats.unsubscribeRate}%
              </Typography>
              <Typography
                variant="body2"
                color={trends.unsubscribeRate >= 0 ? 'error.main' : 'success.main'}
              >
                {trends.unsubscribeRate >= 0 ? '+' : ''}{trends.unsubscribeRate}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={stats.unsubscribeRate}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: '#e0e0e0',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: '#ed6c02',
                },
              }}
            />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 