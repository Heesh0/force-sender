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
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';

interface Sender {
  id: number;
  name: string;
  email: string;
  domain: string;
  status: 'active' | 'inactive' | 'blocked';
}

const validationSchema = Yup.object({
  name: Yup.string().required('Имя обязательно'),
  email: Yup.string().email('Введите корректный email').required('Email обязателен'),
  domain: Yup.string().required('Домен обязателен'),
});

export const Senders: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingSender, setEditingSender] = useState<Sender | null>(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Здесь будут данные из Redux store
  const senders: Sender[] = [
    {
      id: 1,
      name: 'Отдел поддержки',
      email: 'support@example.com',
      domain: 'example.com',
      status: 'active',
    },
    {
      id: 2,
      name: 'Маркетинг',
      email: 'marketing@example.com',
      domain: 'example.com',
      status: 'active',
    },
  ];

  const handleOpen = (sender?: Sender) => {
    if (sender) {
      setEditingSender(sender);
    } else {
      setEditingSender(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingSender(null);
  };

  const handleSubmit = async (values: Omit<Sender, 'id'>) => {
    if (editingSender) {
      // Обновление отправителя
      console.log('Update sender:', { id: editingSender.id, ...values });
    } else {
      // Создание отправителя
      console.log('Create sender:', values);
    }
    handleClose();
  };

  const handleDelete = async (id: number) => {
    // Удаление отправителя
    console.log('Delete sender:', id);
  };

  const getStatusColor = (status: Sender['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'warning';
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Отправители
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Добавить отправителя
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Имя</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Домен</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {senders.map((sender) => (
              <TableRow key={sender.id}>
                <TableCell>{sender.name}</TableCell>
                <TableCell>{sender.email}</TableCell>
                <TableCell>{sender.domain}</TableCell>
                <TableCell>
                  <Chip
                    label={sender.status}
                    color={getStatusColor(sender.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(sender)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleDelete(sender.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingSender ? 'Редактировать отправителя' : 'Добавить отправителя'}
        </DialogTitle>
        <Formik
          initialValues={
            editingSender || {
              name: '',
              email: '',
              domain: '',
              status: 'active',
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
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="domain"
                  label="Домен"
                  name="domain"
                  autoComplete="domain"
                  value={values.domain}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.domain && Boolean(errors.domain)}
                  helperText={touched.domain && errors.domain}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Отмена</Button>
                <Button type="submit" variant="contained">
                  {editingSender ? 'Сохранить' : 'Создать'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
}; 