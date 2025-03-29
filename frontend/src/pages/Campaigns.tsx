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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Menu,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  PlayArrow as PlayIcon,
  Pause as PauseIcon,
  Stop as StopIcon,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';

interface Campaign {
  id: number;
  name: string;
  subject: string;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'failed';
  sender: string;
  recipients: number;
  sent: number;
  failed: number;
  scheduledAt?: string;
  createdAt: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Название обязательно'),
  subject: Yup.string().required('Тема обязательна'),
  sender: Yup.string().required('Отправитель обязателен'),
});

export const Campaigns: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Здесь будут данные из Redux store
  const campaigns: Campaign[] = [
    {
      id: 1,
      name: 'Новогодняя рассылка',
      subject: 'С Новым годом!',
      status: 'scheduled',
      sender: 'marketing@example.com',
      recipients: 1000,
      sent: 0,
      failed: 0,
      scheduledAt: '2024-12-31T20:00:00',
      createdAt: '2024-12-01T10:00:00',
    },
    {
      id: 2,
      name: 'Акция "Черная пятница"',
      subject: 'Специальные предложения',
      status: 'active',
      sender: 'marketing@example.com',
      recipients: 500,
      sent: 300,
      failed: 5,
      createdAt: '2024-11-25T09:00:00',
    },
  ];

  const handleOpen = (campaign?: Campaign) => {
    if (campaign) {
      setEditingCampaign(campaign);
    } else {
      setEditingCampaign(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingCampaign(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, campaign: Campaign) => {
    setAnchorEl(event.currentTarget);
    setSelectedCampaign(campaign);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCampaign(null);
  };

  const handleSubmit = async (values: Omit<Campaign, 'id' | 'status' | 'recipients' | 'sent' | 'failed' | 'createdAt'>) => {
    if (editingCampaign) {
      // Обновление кампании
      console.log('Update campaign:', { id: editingCampaign.id, ...values });
    } else {
      // Создание кампании
      console.log('Create campaign:', values);
    }
    handleClose();
  };

  const handleDelete = async (id: number) => {
    // Удаление кампании
    console.log('Delete campaign:', id);
    handleMenuClose();
  };

  const handleStatusChange = async (id: number, newStatus: Campaign['status']) => {
    // Изменение статуса кампании
    console.log('Change campaign status:', { id, newStatus });
    handleMenuClose();
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'scheduled':
        return 'info';
      case 'paused':
        return 'warning';
      case 'completed':
        return 'success';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Кампании
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Создать кампанию
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Тема</TableCell>
              <TableCell>Отправитель</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Получатели</TableCell>
              <TableCell>Отправлено</TableCell>
              <TableCell>Ошибки</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {campaigns.map((campaign) => (
              <TableRow key={campaign.id}>
                <TableCell>{campaign.name}</TableCell>
                <TableCell>{campaign.subject}</TableCell>
                <TableCell>{campaign.sender}</TableCell>
                <TableCell>
                  <Chip
                    label={campaign.status}
                    color={getStatusColor(campaign.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{campaign.recipients}</TableCell>
                <TableCell>{campaign.sent}</TableCell>
                <TableCell>{campaign.failed}</TableCell>
                <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(campaign)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, campaign)}
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {selectedCampaign?.status === 'draft' && (
          <MenuItem onClick={() => handleStatusChange(selectedCampaign.id, 'scheduled')}>
            <PlayIcon sx={{ mr: 1 }} /> Запустить
          </MenuItem>
        )}
        {selectedCampaign?.status === 'scheduled' && (
          <MenuItem onClick={() => handleStatusChange(selectedCampaign.id, 'draft')}>
            <PauseIcon sx={{ mr: 1 }} /> Отменить
          </MenuItem>
        )}
        {selectedCampaign?.status === 'active' && (
          <MenuItem onClick={() => handleStatusChange(selectedCampaign.id, 'paused')}>
            <PauseIcon sx={{ mr: 1 }} /> Приостановить
          </MenuItem>
        )}
        {selectedCampaign?.status === 'paused' && (
          <MenuItem onClick={() => handleStatusChange(selectedCampaign.id, 'active')}>
            <PlayIcon sx={{ mr: 1 }} /> Возобновить
          </MenuItem>
        )}
        <MenuItem onClick={() => handleDelete(selectedCampaign?.id || 0)}>
          <DeleteIcon sx={{ mr: 1 }} /> Удалить
        </MenuItem>
      </Menu>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingCampaign ? 'Редактировать кампанию' : 'Создать кампанию'}
        </DialogTitle>
        <Formik
          initialValues={
            editingCampaign || {
              name: '',
              subject: '',
              sender: '',
              scheduledAt: '',
            }
          }
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur }) => (
            <Form>
              <DialogContent>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Название"
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
                  id="subject"
                  label="Тема"
                  name="subject"
                  autoComplete="subject"
                  value={values.subject}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.subject && Boolean(errors.subject)}
                  helperText={touched.subject && errors.subject}
                />
                <FormControl fullWidth margin="normal">
                  <InputLabel id="sender-label">Отправитель</InputLabel>
                  <Select
                    labelId="sender-label"
                    id="sender"
                    name="sender"
                    value={values.sender}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched.sender && Boolean(errors.sender)}
                  >
                    <MenuItem value="support@example.com">Отдел поддержки</MenuItem>
                    <MenuItem value="marketing@example.com">Маркетинг</MenuItem>
                  </Select>
                  {touched.sender && errors.sender && (
                    <Typography color="error" variant="caption">
                      {errors.sender}
                    </Typography>
                  )}
                </FormControl>
                <TextField
                  margin="normal"
                  fullWidth
                  id="scheduledAt"
                  label="Запланировать на"
                  name="scheduledAt"
                  type="datetime-local"
                  value={values.scheduledAt}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Отмена</Button>
                <Button type="submit" variant="contained">
                  {editingCampaign ? 'Сохранить' : 'Создать'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
}; 