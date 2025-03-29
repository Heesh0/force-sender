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
  Menu,
  MenuItem,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Preview as PreviewIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '../store';

interface Template {
  id: number;
  name: string;
  subject: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

const validationSchema = Yup.object({
  name: Yup.string().required('Название обязательно'),
  subject: Yup.string().required('Тема обязательна'),
  content: Yup.string().required('Содержание обязательно'),
});

export const Templates: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);

  // Здесь будут данные из Redux store
  const templates: Template[] = [
    {
      id: 1,
      name: 'Новогоднее поздравление',
      subject: 'С Новым годом!',
      content: 'Уважаемый {name},\n\nПоздравляем вас с Новым годом!\n\nС наилучшими пожеланиями,\nКоманда',
      createdAt: '2024-12-01T10:00:00',
      updatedAt: '2024-12-01T10:00:00',
    },
    {
      id: 2,
      name: 'Акция "Черная пятница"',
      subject: 'Специальные предложения',
      content: 'Уважаемый {name},\n\nСпециально для вас мы подготовили уникальные предложения!\n\nПодробности в письме.',
      createdAt: '2024-11-25T09:00:00',
      updatedAt: '2024-11-25T09:00:00',
    },
  ];

  const handleOpen = (template?: Template) => {
    if (template) {
      setEditingTemplate(template);
    } else {
      setEditingTemplate(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingTemplate(null);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, template: Template) => {
    setAnchorEl(event.currentTarget);
    setSelectedTemplate(template);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedTemplate(null);
  };

  const handleSubmit = async (values: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingTemplate) {
      // Обновление шаблона
      console.log('Update template:', { id: editingTemplate.id, ...values });
    } else {
      // Создание шаблона
      console.log('Create template:', values);
    }
    handleClose();
  };

  const handleDelete = async (id: number) => {
    // Удаление шаблона
    console.log('Delete template:', id);
    handleMenuClose();
  };

  const handlePreview = (template: Template) => {
    setSelectedTemplate(template);
    setPreviewOpen(true);
  };

  const handleCopy = async (template: Template) => {
    // Копирование шаблона
    console.log('Copy template:', template);
    handleMenuClose();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ru-RU');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Шаблоны
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpen()}
        >
          Создать шаблон
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Название</TableCell>
              <TableCell>Тема</TableCell>
              <TableCell>Дата создания</TableCell>
              <TableCell>Дата обновления</TableCell>
              <TableCell align="right">Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {templates.map((template) => (
              <TableRow key={template.id}>
                <TableCell>{template.name}</TableCell>
                <TableCell>{template.subject}</TableCell>
                <TableCell>{formatDate(template.createdAt)}</TableCell>
                <TableCell>{formatDate(template.updatedAt)}</TableCell>
                <TableCell align="right">
                  <IconButton
                    size="small"
                    onClick={() => handlePreview(template)}
                  >
                    <PreviewIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => handleOpen(template)}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, template)}
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
        <MenuItem onClick={() => handleCopy(selectedTemplate || templates[0])}>
          <ContentCopyIcon sx={{ mr: 1 }} /> Копировать
        </MenuItem>
        <MenuItem onClick={() => handleDelete(selectedTemplate?.id || 0)}>
          <DeleteIcon sx={{ mr: 1 }} /> Удалить
        </MenuItem>
      </Menu>

      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTemplate ? 'Редактировать шаблон' : 'Создать шаблон'}
        </DialogTitle>
        <Formik
          initialValues={
            editingTemplate || {
              name: '',
              subject: '',
              content: '',
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
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="content"
                  label="Содержание"
                  name="content"
                  multiline
                  rows={10}
                  value={values.content}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.content && Boolean(errors.content)}
                  helperText={touched.content && errors.content}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose}>Отмена</Button>
                <Button type="submit" variant="contained">
                  {editingTemplate ? 'Сохранить' : 'Создать'}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>

      <Dialog open={previewOpen} onClose={() => setPreviewOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Предпросмотр шаблона</DialogTitle>
        <DialogContent>
          {selectedTemplate && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedTemplate.subject}
              </Typography>
              <Typography
                component="pre"
                sx={{
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'inherit',
                  backgroundColor: '#f5f5f5',
                  p: 2,
                  borderRadius: 1,
                }}
              >
                {selectedTemplate.content}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Закрыть</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}; 