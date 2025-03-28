const moment = require('moment-timezone');
const logger = require('./logger');

const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
    try {
        return moment(date).format(format);
    } catch (error) {
        logger.error('Ошибка при форматировании даты:', error);
        throw error;
    }
};

const parseDate = (dateString, format = 'YYYY-MM-DD HH:mm:ss') => {
    try {
        return moment(dateString, format).toDate();
    } catch (error) {
        logger.error('Ошибка при разборе даты:', error);
        throw error;
    }
};

const isValidDate = (dateString, format = 'YYYY-MM-DD HH:mm:ss') => {
    try {
        return moment(dateString, format).isValid();
    } catch (error) {
        logger.error('Ошибка при проверке даты:', error);
        return false;
    }
};

const getCurrentTime = () => {
    return moment().toDate();
};

const addDays = (date, days) => {
    try {
        return moment(date).add(days, 'days').toDate();
    } catch (error) {
        logger.error('Ошибка при добавлении дней к дате:', error);
        throw error;
    }
};

const subtractDays = (date, days) => {
    try {
        return moment(date).subtract(days, 'days').toDate();
    } catch (error) {
        logger.error('Ошибка при вычитании дней из даты:', error);
        throw error;
    }
};

const isDateBefore = (date1, date2) => {
    try {
        return moment(date1).isBefore(date2);
    } catch (error) {
        logger.error('Ошибка при сравнении дат:', error);
        throw error;
    }
};

const isDateAfter = (date1, date2) => {
    try {
        return moment(date1).isAfter(date2);
    } catch (error) {
        logger.error('Ошибка при сравнении дат:', error);
        throw error;
    }
};

const isDateBetween = (date, startDate, endDate) => {
    try {
        return moment(date).isBetween(startDate, endDate, 'day', '[]');
    } catch (error) {
        logger.error('Ошибка при проверке даты в диапазоне:', error);
        throw error;
    }
};

const getTimezoneOffset = (timezone) => {
    try {
        return moment.tz(timezone).format('Z');
    } catch (error) {
        logger.error('Ошибка при получении смещения часового пояса:', error);
        throw error;
    }
};

const convertToTimezone = (date, timezone) => {
    try {
        return moment(date).tz(timezone).toDate();
    } catch (error) {
        logger.error('Ошибка при конвертации даты в часовой пояс:', error);
        throw error;
    }
};

const getStartOfDay = (date) => {
    try {
        return moment(date).startOf('day').toDate();
    } catch (error) {
        logger.error('Ошибка при получении начала дня:', error);
        throw error;
    }
};

const getEndOfDay = (date) => {
    try {
        return moment(date).endOf('day').toDate();
    } catch (error) {
        logger.error('Ошибка при получении конца дня:', error);
        throw error;
    }
};

const getStartOfWeek = (date) => {
    try {
        return moment(date).startOf('week').toDate();
    } catch (error) {
        logger.error('Ошибка при получении начала недели:', error);
        throw error;
    }
};

const getEndOfWeek = (date) => {
    try {
        return moment(date).endOf('week').toDate();
    } catch (error) {
        logger.error('Ошибка при получении конца недели:', error);
        throw error;
    }
};

const getStartOfMonth = (date) => {
    try {
        return moment(date).startOf('month').toDate();
    } catch (error) {
        logger.error('Ошибка при получении начала месяца:', error);
        throw error;
    }
};

const getEndOfMonth = (date) => {
    try {
        return moment(date).endOf('month').toDate();
    } catch (error) {
        logger.error('Ошибка при получении конца месяца:', error);
        throw error;
    }
};

const formatDuration = (milliseconds) => {
    try {
        const duration = moment.duration(milliseconds);
        const days = Math.floor(duration.asDays());
        const hours = duration.hours();
        const minutes = duration.minutes();
        const seconds = duration.seconds();

        let result = '';
        if (days > 0) result += `${days}д `;
        if (hours > 0) result += `${hours}ч `;
        if (minutes > 0) result += `${minutes}м `;
        if (seconds > 0) result += `${seconds}с`;

        return result.trim();
    } catch (error) {
        logger.error('Ошибка при форматировании длительности:', error);
        throw error;
    }
};

const getRandomDate = (startDate, endDate) => {
    try {
        const start = moment(startDate);
        const end = moment(endDate);
        const diff = end.diff(start, 'milliseconds');
        return moment(start).add(Math.random() * diff).toDate();
    } catch (error) {
        logger.error('Ошибка при получении случайной даты:', error);
        throw error;
    }
};

module.exports = {
    formatDate,
    parseDate,
    isValidDate,
    getCurrentTime,
    addDays,
    subtractDays,
    isDateBefore,
    isDateAfter,
    isDateBetween,
    getTimezoneOffset,
    convertToTimezone,
    getStartOfDay,
    getEndOfDay,
    getStartOfWeek,
    getEndOfWeek,
    getStartOfMonth,
    getEndOfMonth,
    formatDuration,
    getRandomDate
}; 