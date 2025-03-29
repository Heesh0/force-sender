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
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';

interface Recipient {
  id: number;
  email: string;
  name: string;
  status: 'active' | 'unsubscribed' | 'bounced' | 'spam';
  campaignId: number;
  campaignName: string;
  createdAt: string;
}

const validationSchema = Yup.object({
  email: Yup.string().email('Введите корректный email').required('Email обязателен'),
  name: Yup.string().required('Имя обязательно'),
});

export const Recipients: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingRecipient, setEditingRecipient] = useState<Recipient | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [importError, setImportError] = useState<string | null>(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Здесь будут данные из Redux store
  const recipients: Recipient[] = [
    {
      id: 1,
      email: 'user1@example.com',
      name: 'Иван Иванов',
      status: 'active',
      campaignId: 1,
      campaignName: 'Новогодняя рассылка',
      createdAt: '2024-12-01T10:00:00',
    },
    {
      id: 2,
      email: 'user2@example.com',
      name: 'Петр Петров',
      status: 'unsubscribed',
      campaignId: 2,
      campaignName: 'Акция "Черная пятница"',
      createdAt: '2024-11-25T09:00:00',
    },
  ];

  const handleOpen = (recipient?: Recipient) => {
    if (recipient) {
      setEditingRecipient(recipient);
    } else {
      setEditingRecipient(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRecipient(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, recipient: Recipient) => {
    setAnchorEl(event.currentTarget);
    setSelectedRecipient(recipient);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedRecipient(null);
  };

  const handleSubmit = async (values: Omit<Recipient, 'id' | 'status' | 'campaignId' | 'campaignName' | 'createdAt'>) => {
    if (editingRecipient) {
      // Обновление получателя
      console.log('Update recipient:', { id: editingRecipient.id, ...values });
    } else {
      // Создание получателя
      console.log('Create recipient:', values);
    }
    handleClose();
  };

  const handleDelete = async (id: number) => {
    // Удаление получателя
    console.log('Delete recipient:', id);
    handleMenuClose();
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Здесь будет логика импорта из CSV
      console.log('Import file:', file);
      setImportError(null);
    } catch (error) {
      setImportError('Ошибка при импорте файла');
    }
  };

  const handleExport = async () => {
    try {
      // Здесь будет логика экспорта в CSV
      console.log('Export recipients');
    } catch (error) {
      console.error('Export error:', error);
    }
  };

  const getStatusColor = (status: Recipient['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'unsubscribed':
        return 'warning';
      case 'bounced':
        return 'error';
      case 'spam':
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
          Получатели
        </Typography>
        <Box>
          <input
            accept=".csv"
            style={{ display: 'none' }}
            id="import-file"
            type="file"
            onChange={handleImport}
          />
          <label htmlFor="import-file">
            <Button
              component="span"
              variant="outlined"
              startIcon={<FileUploadIcon />}
              sx={{ mr: 2 }}
            >
              Импорт
            </Button>
          </label>
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExport}
            sx={{ mr: 2 }}
          >
            Экспорт
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpen()}
          >
            Добавить получателя
          </Button>
        </Box>
      </Box>

      {importError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {importError}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Email</TableCell>
              <TableCell>Имя</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Кампания</TableCell>
              <TableCell>Дата добавления</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipients.map((recipient) => (
              <TableRow key={recipient.id}>
                <TableCell>{recipient.email}</TableCell>
                <TableCell>{recipient.name}</TableCell>
                <TableCell>
                  <Chip
                    label={recipient.status}
                    color={getStatusColor(recipient.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{recipient.campaignName}</TableCell>
                <TableCell>{formatDate(recipient.createdAt)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(recipient)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, recipient)}
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
        <MenuItem onClick={() => handleDelete(selectedRecipient?.id || 0)}>
          <DeleteIcon sx={{ mr: 1 }} /> Удалить
        </MenuItem>
      </Menu>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingRecipient ? 'Редактировать получателя' : 'Добавить получателя'}
        </DialogTitle>
        <Formik
          initialValues={
            editingRecipient || {
              email: '',
              name: '',
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
                  id="email"
                  label="Email"
                  name="email"
                  autoComplete="email"
                  autoFocus
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="name"
                  label="Имя"
                  name="name"
                  autoComplete="name"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Отмена</Button>
                <Button type="submit" variant="contained">
                  {editingRecipient ? 'Сохранить' : 'Создать'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
}; 