const cron = require('node-cron');
const { getConfig } = require('./configUtils');
const logger = require('./logger');

const schedules = new Map();

const validateSchedule = (schedule) => {
    const { frequency, time, daysOfWeek, dayOfMonth } = schedule;
    
    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
        throw new Error('Неверная частота');
    }

    if (!/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(time)) {
        throw new Error('Неверный формат времени');
    }

    if (frequency === 'weekly' && (!daysOfWeek || !Array.isArray(daysOfWeek) || daysOfWeek.length === 0)) {
        throw new Error('Еженедельное расписание требует массив дней недели');
    }

    if (frequency === 'monthly' && (!dayOfMonth || dayOfMonth < 1 || dayOfMonth > 31)) {
        throw new Error('Ежемесячное расписание требует корректный день месяца');
    }

    return true;
};

const getCronExpression = (schedule) => {
    const { frequency, time, daysOfWeek, dayOfMonth } = schedule;
    const [hours, minutes] = time.split(':');

    switch (frequency) {
        case 'daily':
            return `${minutes} ${hours} * * *`;
        case 'weekly':
            return `${minutes} ${hours} * * ${daysOfWeek.join(',')}`;
        case 'monthly':
            return `${minutes} ${hours} ${dayOfMonth} * *`;
        default:
            throw new Error('Неверная частота');
    }
};

const createSchedule = (id, schedule, callback) => {
    try {
        validateSchedule(schedule);
        const cronExpression = getCronExpression(schedule);
        
        const job = cron.schedule(cronExpression, callback, {
            scheduled: true,
            timezone: getConfig('app.timezone') || 'UTC'
        });

        schedules.set(id, job);
        logger.info(`Создано расписание с ID: ${id}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при создании расписания ${id}:`, error);
        throw error;
    }
};

const updateSchedule = (id, schedule, callback) => {
    try {
        const existingJob = schedules.get(id);
        if (existingJob) {
            existingJob.stop();
            schedules.delete(id);
        }
        return createSchedule(id, schedule, callback);
    } catch (error) {
        logger.error(`Ошибка при обновлении расписания ${id}:`, error);
        throw error;
    }
};

const deleteSchedule = (id) => {
    try {
        const job = schedules.get(id);
        if (job) {
            job.stop();
            schedules.delete(id);
            logger.info(`Удалено расписание с ID: ${id}`);
            return true;
        }
        return false;
    } catch (error) {
        logger.error(`Ошибка при удалении расписания ${id}:`, error);
        throw error;
    }
};

const getSchedule = (id) => {
    return schedules.get(id);
};

const getAllSchedules = () => {
    return Array.from(schedules.keys());
};

const stopAllSchedules = () => {
    try {
        for (const [id, job] of schedules.entries()) {
            job.stop();
            schedules.delete(id);
            logger.info(`Остановлено расписание с ID: ${id}`);
        }
        return true;
    } catch (error) {
        logger.error('Ошибка при остановке всех расписаний:', error);
        return false;
    }
};

const isScheduleActive = (id) => {
    const job = schedules.get(id);
    return job ? job.running : false;
};

const getNextRunTime = (id) => {
    const job = schedules.get(id);
    if (!job) return null;
    
    const nextDate = job.nextDate();
    return nextDate ? nextDate.toDate() : null;
};

module.exports = {
    validateSchedule,
    createSchedule,
    updateSchedule,
    deleteSchedule,
    getSchedule,
    getAllSchedules,
    stopAllSchedules,
    isScheduleActive,
    getNextRunTime
}; 