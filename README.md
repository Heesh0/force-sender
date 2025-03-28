# ForceSender

Система управления email-рассылками с веб-интерфейсом, построенная на Node.js и использующая API RuSender для отправки писем.

## Возможности

- Управление несколькими доменами для отправки писем
- Создание и управление кампаниями рассылок
- Планирование рассылок с настраиваемым расписанием
- Загрузка и управление списками получателей
- Мониторинг статистики отправки
- Тестирование писем перед массовой рассылкой
- Управление шаблонами писем
- API для интеграции с другими системами

## Требования

- Node.js >= 18.0.0
- PostgreSQL >= 14.0
- Redis >= 6.0
- Ubuntu 20.04 или выше (для установки на сервер)

## Установка

1. Клонируйте репозиторий:
```bash
git clone https://github.com/yourusername/force-sender.git
cd force-sender
```

2. Установите зависимости:
```bash
npm install
```

3. Создайте файл конфигурации `.env`:
```bash
cp .env.example .env
```

4. Настройте параметры в файле `.env`:
```env
# Приложение
APP_PORT=3000
APP_HOST=localhost
APP_ENV=development
APP_SECRET=your-secret-key

# База данных
DB_HOST=localhost
DB_PORT=5432
DB_NAME=force_sender
DB_USER=postgres
DB_PASSWORD=your-password

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0

# RuSender API
RUSENDER_API_KEY=your-api-key
```

5. Создайте базу данных:
```bash
createdb force_sender
```

6. Запустите миграции:
```bash
npm run migrate
```

7. Запустите приложение:
```bash
# Для разработки
npm run dev

# Для продакшена
npm start
```

## Развертывание на Ubuntu

1. Установите необходимые пакеты:
```bash
sudo apt update
sudo apt install -y nodejs npm postgresql redis-server nginx
```

2. Настройте PostgreSQL:
```bash
sudo -u postgres psql
CREATE DATABASE force_sender;
CREATE USER forcesender WITH PASSWORD 'your-password';
GRANT ALL PRIVILEGES ON DATABASE force_sender TO forcesender;
\q
```

3. Настройте Redis:
```bash
sudo systemctl enable redis-server
sudo systemctl start redis-server
```

4. Настройте Nginx:
```bash
sudo nano /etc/nginx/sites-available/force-sender
```

Добавьте конфигурацию:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

5. Активируйте конфигурацию:
```bash
sudo ln -s /etc/nginx/sites-available/force-sender /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

6. Настройте PM2 для управления процессом:
```bash
sudo npm install -g pm2
pm2 start src/server.js --name force-sender
pm2 startup
pm2 save
```

## Использование

1. Откройте веб-интерфейс по адресу `http://your-domain.com`
2. Войдите в систему с учетными данными администратора
3. Настройте домены для отправки писем
4. Создайте кампании рассылок
5. Загрузите списки получателей
6. Запустите рассылки

## API

API документация доступна по адресу `/api/docs` после запуска приложения.

## Разработка

1. Запустите тесты:
```bash
npm test
```

2. Проверьте код:
```bash
npm run lint
```

3. Форматируйте код:
```bash
npm run format
```

## Лицензия

ISC 