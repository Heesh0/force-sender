const moment = require('moment-timezone');
const { logInfo, logError } = require('./logger');
const config = require('../config/app');

// Форматирование даты
const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    try {
        return moment(date).format(format);
    } catch (error) {
        logError('Ошибка форматирования даты:', { date, format, error });
        return null;
    }
};

// Парсинг даты
const parseDate = (dateString, format = 'YYYY-MM-DD HH:mm:ss') => {
    try {
        return moment(dateString, format).toDate();
    } catch (error) {
        logError('Ошибка парсинга даты:', { dateString, format, error });
        return null;
    }
};

// Добавление времени к дате
const addTime = (date, amount, unit = 'days') => {
    try {
        return moment(date).add(amount, unit).toDate();
    } catch (error) {
        logError('Ошибка добавления времени к дате:', { date, amount, unit, error });
        return null;
    }
};

// Вычитание времени из даты
const subtractTime = (date, amount, unit = 'days') => {
    try {
        return moment(date).subtract(amount, unit).toDate();
    } catch (error) {
        logError('Ошибка вычитания времени из даты:', { date, amount, unit, error });
        return null;
    }
};

// Получение разницы между датами
const getDateDiff = (date1, date2, unit = 'days') => {
    try {
        return moment(date1).diff(moment(date2), unit);
    } catch (error) {
        logError('Ошибка получения разницы между датами:', { date1, date2, unit, error });
        return null;
    }
};

// Проверка, является ли дата валидной
const isValidDate = (date) => {
    try {
        return moment(date).isValid();
    } catch (error) {
        logError('Ошибка проверки валидности даты:', { date, error });
        return false;
    }
};

// Получение начала дня
const getStartOfDay = (date) => {
    try {
        return moment(date).startOf('day').toDate();
    } catch (error) {
        logError('Ошибка получения начала дня:', { date, error });
        return null;
    }
};

// Получение конца дня
const getEndOfDay = (date) => {
    try {
        return moment(date).endOf('day').toDate();
    } catch (error) {
        logError('Ошибка получения конца дня:', { date, error });
        return null;
    }
};

// Получение начала недели
const getStartOfWeek = (date) => {
    try {
        return moment(date).startOf('week').toDate();
    } catch (error) {
        logError('Ошибка получения начала недели:', { date, error });
        return null;
    }
};

// Получение конца недели
const getEndOfWeek = (date) => {
    try {
        return moment(date).endOf('week').toDate();
    } catch (error) {
        logError('Ошибка получения конца недели:', { date, error });
        return null;
    }
};

// Получение начала месяца
const getStartOfMonth = (date) => {
    try {
        return moment(date).startOf('month').toDate();
    } catch (error) {
        logError('Ошибка получения начала месяца:', { date, error });
        return null;
    }
};

// Получение конца месяца
const getEndOfMonth = (date) => {
    try {
        return moment(date).endOf('month').toDate();
    } catch (error) {
        logError('Ошибка получения конца месяца:', { date, error });
        return null;
    }
};

// Получение начала года
const getStartOfYear = (date) => {
    try {
        return moment(date).startOf('year').toDate();
    } catch (error) {
        logError('Ошибка получения начала года:', { date, error });
        return null;
    }
};

// Получение конца года
const getEndOfYear = (date) => {
    try {
        return moment(date).endOf('year').toDate();
    } catch (error) {
        logError('Ошибка получения конца года:', { date, error });
        return null;
    }
};

// Конвертация даты в другой часовой пояс
const convertTimezone = (date, fromZone, toZone) => {
    try {
        return moment.tz(date, fromZone).tz(toZone).toDate();
    } catch (error) {
        logError('Ошибка конвертации часового пояса:', { date, fromZone, toZone, error });
        return null;
    }
};

// Получение текущей даты в указанном часовом поясе
const getCurrentDate = (timezone = config.app.timezone) => {
    try {
        return moment().tz(timezone).toDate();
    } catch (error) {
        logError('Ошибка получения текущей даты:', { timezone, error });
        return null;
    }
};

// Проверка, является ли дата рабочим днем
const isWorkday = (date) => {
    try {
        const day = moment(date).day();
        return day !== 0 && day !== 6;
    } catch (error) {
        logError('Ошибка проверки рабочего дня:', { date, error });
        return false;
    }
};

// Получение следующего рабочего дня
const getNextWorkday = (date) => {
    try {
        let nextDate = moment(date).add(1, 'days');
        while (!isWorkday(nextDate)) {
            nextDate.add(1, 'days');
        }
        return nextDate.toDate();
    } catch (error) {
        logError('Ошибка получения следующего рабочего дня:', { date, error });
        return null;
    }
};

// Получение предыдущего рабочего дня
const getPrevWorkday = (date) => {
    try {
        let prevDate = moment(date).subtract(1, 'days');
        while (!isWorkday(prevDate)) {
            prevDate.subtract(1, 'days');
        }
        return prevDate.toDate();
    } catch (error) {
        logError('Ошибка получения предыдущего рабочего дня:', { date, error });
        return null;
    }
};

// Форматирование длительности
const formatDuration = (milliseconds) => {
    try {
        const duration = moment.duration(milliseconds);
        return {
            years: duration.years(),
            months: duration.months(),
            days: duration.days(),
            hours: duration.hours(),
            minutes: duration.minutes(),
            seconds: duration.seconds(),
            milliseconds: duration.milliseconds()
        };
    } catch (error) {
        logError('Ошибка форматирования длительности:', { milliseconds, error });
        return null;
    }
};

// Получение возраста
const getAge = (birthDate) => {
    try {
        return moment().diff(moment(birthDate), 'years');
    } catch (error) {
        logError('Ошибка получения возраста:', { birthDate, error });
        return null;
    }
};

module.exports = {
    formatDate,
    parseDate,
    addTime,
    subtractTime,
    getDateDiff,
    isValidDate,
    getStartOfDay,
    getEndOfDay,
    getStartOfWeek,
    getEndOfWeek,
    getStartOfMonth,
    getEndOfMonth,
    getStartOfYear,
    getEndOfYear,
    convertTimezone,
    getCurrentDate,
    isWorkday,
    getNextWorkday,
    getPrevWorkday,
    formatDuration,
    getAge
}; 