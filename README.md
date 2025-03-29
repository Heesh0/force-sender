# Система управления email-рассылками

Веб-приложение для управления email-кампаниями, созданное с использованием React и Node.js.

## Функциональность

- Управление кампаниями (создание, редактирование, удаление)
- Управление получателями (импорт/экспорт, группировка)
- Создание и управление шаблонами писем
- Статистика и аналитика
- Настройки системы и профиля пользователя

## Технологии

### Frontend
- React 18
- TypeScript
- Material-UI
- Redux Toolkit
- React Router
- Formik & Yup
- Axios

### Backend
- Node.js
- Express
- TypeScript
- PostgreSQL
- TypeORM
- JWT
- Nodemailer

## Установка и запуск

### Предварительные требования
- Node.js 18+
- PostgreSQL 14+
- npm или yarn

### Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/your-username/email-campaign-manager.git
cd email-campaign-manager
```

2. Установите зависимости:
```bash
# Установка зависимостей бэкенда
cd backend
npm install

# Установка зависимостей фронтенда
cd ../frontend
npm install
```

3. Создайте файлы окружения:
```bash
# В директории backend
cp .env.example .env

# В директории frontend
cp .env.example .env
```

4. Настройте переменные окружения в файлах `.env`

### Запуск

1. Запуск бэкенда:
```bash
cd backend
npm run dev
```

2. Запуск фронтенда:
```bash
cd frontend
npm start
```

Приложение будет доступно по адресу: http://localhost:3000

## Разработка

### Структура проекта

```
email-campaign-manager/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.ts
│   ├── tests/
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   ├── store/
    │   ├── utils/
    │   └── App.tsx
    └── package.json
```

### Скрипты

#### Backend
- `npm run dev` - запуск в режиме разработки
- `npm run build` - сборка проекта
- `npm run start` - запуск в продакшн режиме
- `npm run test` - запуск тестов
- `npm run lint` - проверка кода линтером

#### Frontend
- `npm start` - запуск в режиме разработки
- `npm run build` - сборка проекта
- `npm test` - запуск тестов
- `npm run lint` - проверка кода линтером

## Лицензия

MIT 