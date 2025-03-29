import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  LinearProgress,
} from '@mui/material';
import {
  Email as EmailIcon,
  People as PeopleIcon,
  Campaign as CampaignIcon,
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
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

export const Dashboard: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  // Здесь будут данные из Redux store
  const stats = {
    totalCampaigns: 12,
    activeCampaigns: 3,
    totalRecipients: 1500,
    deliveredEmails: 1200,
    failedEmails: 50,
  };

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Добро пожаловать, {user?.name}!
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Всего кампаний"
            value={stats.totalCampaigns}
            icon={<CampaignIcon sx={{ color: '#1976d2' }} />}
            color="#1976d2"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Активные кампании"
            value={stats.activeCampaigns}
            icon={<EmailIcon sx={{ color: '#2e7d32' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Всего получателей"
            value={stats.totalRecipients}
            icon={<PeopleIcon sx={{ color: '#ed6c02' }} />}
            color="#ed6c02"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Доставлено писем"
            value={stats.deliveredEmails}
            icon={<CheckCircleIcon sx={{ color: '#2e7d32' }} />}
            color="#2e7d32"
          />
        </Grid>
        <Grid item xs={12} md={6} lg={3}>
          <StatCard
            title="Ошибок доставки"
            value={stats.failedEmails}
            icon={<ErrorIcon sx={{ color: '#d32f2f' }} />}
            color="#d32f2f"
          />
        </Grid>
      </Grid>
      <Grid container spacing={3} sx={{ mt: 2 }}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Последние кампании
            </Typography>
            {/* Здесь будет таблица с последними кампаниями */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Статистика доставки
            </Typography>
            {/* Здесь будет график статистики доставки */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}; 