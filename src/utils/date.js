const { logger } = require('./logger');

// Функция для форматирования даты
const formatDate = (date, format = 'YYYY-MM-DD') => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        let result = format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);

        logger.info('Дата отформатирована:', {
            input: date,
            output: result,
            format
        });

        return result;
    } catch (error) {
        logger.error('Ошибка форматирования даты:', error);
        throw error;
    }
};

// Функция для форматирования даты в русском формате
const formatDateRu = (date) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        const months = [
            'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
            'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
        ];

        const day = d.getDate();
        const month = months[d.getMonth()];
        const year = d.getFullYear();

        const result = `${day} ${month} ${year}`;

        logger.info('Дата отформатирована в русском формате:', {
            input: date,
            output: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка форматирования даты в русском формате:', error);
        throw error;
    }
};

// Функция для форматирования времени
const formatTime = (date, format = 'HH:mm:ss') => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        let result = format
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);

        logger.info('Время отформатировано:', {
            input: date,
            output: result,
            format
        });

        return result;
    } catch (error) {
        logger.error('Ошибка форматирования времени:', error);
        throw error;
    }
};

// Функция для форматирования даты и времени
const formatDateTime = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        let result = format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);

        logger.info('Дата и время отформатированы:', {
            input: date,
            output: result,
            format
        });

        return result;
    } catch (error) {
        logger.error('Ошибка форматирования даты и времени:', error);
        throw error;
    }
};

// Функция для получения относительного времени
const getRelativeTime = (date) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        const now = new Date();
        const diff = now - d;
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(days / 365);

        let result;

        if (years > 0) {
            result = `${years} ${getPluralForm(years, 'год', 'года', 'лет')}`;
        } else if (months > 0) {
            result = `${months} ${getPluralForm(months, 'месяц', 'месяца', 'месяцев')}`;
        } else if (days > 0) {
            result = `${days} ${getPluralForm(days, 'день', 'дня', 'дней')}`;
        } else if (hours > 0) {
            result = `${hours} ${getPluralForm(hours, 'час', 'часа', 'часов')}`;
        } else if (minutes > 0) {
            result = `${minutes} ${getPluralForm(minutes, 'минуту', 'минуты', 'минут')}`;
        } else {
            result = 'только что';
        }

        logger.info('Получено относительное время:', {
            input: date,
            output: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения относительного времени:', error);
        throw error;
    }
};

// Функция для проверки корректности даты
const isValidDate = (date) => {
    try {
        const d = new Date(date);
        const result = d instanceof Date && !isNaN(d.getTime());

        logger.info('Проверка даты:', {
            date,
            isValid: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка проверки даты:', error);
        return false;
    }
};

// Функция для добавления дней к дате
const addDays = (date, days) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        d.setDate(d.getDate() + days);
        const result = d.toISOString();

        logger.info('Дни добавлены к дате:', {
            input: date,
            days,
            output: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка добавления дней к дате:', error);
        throw error;
    }
};

// Функция для добавления месяцев к дате
const addMonths = (date, months) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        d.setMonth(d.getMonth() + months);
        const result = d.toISOString();

        logger.info('Месяцы добавлены к дате:', {
            input: date,
            months,
            output: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка добавления месяцев к дате:', error);
        throw error;
    }
};

// Функция для добавления лет к дате
const addYears = (date, years) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        d.setFullYear(d.getFullYear() + years);
        const result = d.toISOString();

        logger.info('Годы добавлены к дате:', {
            input: date,
            years,
            output: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка добавления лет к дате:', error);
        throw error;
    }
};

// Функция для получения разницы в днях между датами
const getDaysDiff = (date1, date2) => {
    try {
        const d1 = new Date(date1);
        const d2 = new Date(date2);

        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
            throw new Error('Некорректная дата');
        }

        const diff = Math.abs(d2 - d1);
        const result = Math.floor(diff / (1000 * 60 * 60 * 24));

        logger.info('Получена разница в днях:', {
            date1,
            date2,
            diff: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения разницы в днях:', error);
        throw error;
    }
};

// Функция для получения разницы в часах между датами
const getHoursDiff = (date1, date2) => {
    try {
        const d1 = new Date(date1);
        const d2 = new Date(date2);

        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
            throw new Error('Некорректная дата');
        }

        const diff = Math.abs(d2 - d1);
        const result = Math.floor(diff / (1000 * 60 * 60));

        logger.info('Получена разница в часах:', {
            date1,
            date2,
            diff: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения разницы в часах:', error);
        throw error;
    }
};

// Функция для получения разницы в минутах между датами
const getMinutesDiff = (date1, date2) => {
    try {
        const d1 = new Date(date1);
        const d2 = new Date(date2);

        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
            throw new Error('Некорректная дата');
        }

        const diff = Math.abs(d2 - d1);
        const result = Math.floor(diff / (1000 * 60));

        logger.info('Получена разница в минутах:', {
            date1,
            date2,
            diff: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения разницы в минутах:', error);
        throw error;
    }
};

// Функция для получения разницы в секундах между датами
const getSecondsDiff = (date1, date2) => {
    try {
        const d1 = new Date(date1);
        const d2 = new Date(date2);

        if (isNaN(d1.getTime()) || isNaN(d2.getTime())) {
            throw new Error('Некорректная дата');
        }

        const diff = Math.abs(d2 - d1);
        const result = Math.floor(diff / 1000);

        logger.info('Получена разница в секундах:', {
            date1,
            date2,
            diff: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения разницы в секундах:', error);
        throw error;
    }
};

// Функция для получения начала дня
const getStartOfDay = (date) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        d.setHours(0, 0, 0, 0);
        const result = d.toISOString();

        logger.info('Получено начало дня:', {
            input: date,
            output: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения начала дня:', error);
        throw error;
    }
};

// Функция для получения конца дня
const getEndOfDay = (date) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        d.setHours(23, 59, 59, 999);
        const result = d.toISOString();

        logger.info('Получен конец дня:', {
            input: date,
            output: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения конца дня:', error);
        throw error;
    }
};

// Функция для получения начала недели
const getStartOfWeek = (date) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        d.setDate(diff);
        d.setHours(0, 0, 0, 0);
        const result = d.toISOString();

        logger.info('Получено начало недели:', {
            input: date,
            output: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения начала недели:', error);
        throw error;
    }
};

// Функция для получения конца недели
const getEndOfWeek = (date) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? 0 : 7);
        d.setDate(diff);
        d.setHours(23, 59, 59, 999);
        const result = d.toISOString();

        logger.info('Получен конец недели:', {
            input: date,
            output: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения конца недели:', error);
        throw error;
    }
};

// Функция для получения начала месяца
const getStartOfMonth = (date) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        const result = d.toISOString();

        logger.info('Получено начало месяца:', {
            input: date,
            output: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения начала месяца:', error);
        throw error;
    }
};

// Функция для получения конца месяца
const getEndOfMonth = (date) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        d.setMonth(d.getMonth() + 1);
        d.setDate(0);
        d.setHours(23, 59, 59, 999);
        const result = d.toISOString();

        logger.info('Получен конец месяца:', {
            input: date,
            output: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения конца месяца:', error);
        throw error;
    }
};

// Функция для получения начала года
const getStartOfYear = (date) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        d.setMonth(0);
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        const result = d.toISOString();

        logger.info('Получено начало года:', {
            input: date,
            output: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения начала года:', error);
        throw error;
    }
};

// Функция для получения конца года
const getEndOfYear = (date) => {
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) {
            throw new Error('Некорректная дата');
        }

        d.setMonth(11);
        d.setDate(31);
        d.setHours(23, 59, 59, 999);
        const result = d.toISOString();

        logger.info('Получен конец года:', {
            input: date,
            output: result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения конца года:', error);
        throw error;
    }
};

// Функция для получения правильной формы слова
const getPluralForm = (number, one, two, many) => {
    try {
        const lastDigit = number % 10;
        const lastTwoDigits = number % 100;

        let result;

        if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
            result = many;
        } else if (lastDigit === 1) {
            result = one;
        } else if (lastDigit >= 2 && lastDigit <= 4) {
            result = two;
        } else {
            result = many;
        }

        logger.info('Получена форма слова:', {
            number,
            one,
            two,
            many,
            result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения формы слова:', error);
        throw error;
    }
};

module.exports = {
    formatDate,
    formatDateRu,
    formatTime,
    formatDateTime,
    getRelativeTime,
    isValidDate,
    addDays,
    addMonths,
    addYears,
    getDaysDiff,
    getHoursDiff,
    getMinutesDiff,
    getSecondsDiff,
    getStartOfDay,
    getEndOfDay,
    getStartOfWeek,
    getEndOfWeek,
    getStartOfMonth,
    getEndOfMonth,
    getStartOfYear,
    getEndOfYear,
    getPluralForm
}; 