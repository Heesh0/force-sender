const csv = require('csv-parse');
const { createReadStream } = require('fs');
const { logger } = require('./logger');

// Функция для чтения CSV файла
const readCSV = async (filePath, options = {}) => {
    const {
        columns = true,
        skip_empty_lines = true,
        delimiter = ',',
        encoding = 'utf-8'
    } = options;

    return new Promise((resolve, reject) => {
        const results = [];
        const parser = csv.parse({
            columns,
            skip_empty_lines,
            delimiter,
            encoding
        });

        createReadStream(filePath)
            .pipe(parser)
            .on('data', (data) => {
                results.push(data);
            })
            .on('end', () => {
                logger.info('CSV файл успешно прочитан:', {
                    path: filePath,
                    rows: results.length
                });
                resolve(results);
            })
            .on('error', (error) => {
                logger.error('Ошибка чтения CSV файла:', error);
                reject(error);
            });
    });
};

// Функция для валидации данных CSV
const validateCSVData = (data, requiredFields) => {
    const errors = [];
    const validData = [];

    data.forEach((row, index) => {
        const rowErrors = [];
        
        // Проверка обязательных полей
        requiredFields.forEach(field => {
            if (!row[field]) {
                rowErrors.push(`Отсутствует обязательное поле "${field}"`);
            }
        });

        // Проверка формата email
        if (row.email && !isValidEmail(row.email)) {
            rowErrors.push('Некорректный формат email');
        }

        if (rowErrors.length > 0) {
            errors.push({
                row: index + 1,
                errors: rowErrors
            });
        } else {
            validData.push(row);
        }
    });

    return {
        validData,
        errors
    };
};

// Функция для проверки формата email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Функция для получения заголовков CSV
const getCSVHeaders = async (filePath) => {
    return new Promise((resolve, reject) => {
        const parser = csv.parse({
            columns: true,
            skip_empty_lines: true,
            delimiter: ',',
            encoding: 'utf-8'
        });

        createReadStream(filePath)
            .pipe(parser)
            .on('headers', (headers) => {
                resolve(headers);
            })
            .on('error', (error) => {
                logger.error('Ошибка чтения заголовков CSV:', error);
                reject(error);
            });
    });
};

// Функция для подсчета строк в CSV
const countCSVRows = async (filePath) => {
    return new Promise((resolve, reject) => {
        let count = 0;
        const parser = csv.parse({
            skip_empty_lines: true,
            delimiter: ',',
            encoding: 'utf-8'
        });

        createReadStream(filePath)
            .pipe(parser)
            .on('data', () => {
                count++;
            })
            .on('end', () => {
                resolve(count);
            })
            .on('error', (error) => {
                logger.error('Ошибка подсчета строк CSV:', error);
                reject(error);
            });
    });
};

// Функция для проверки размера CSV файла
const checkCSVSize = async (filePath, maxSize) => {
    const fs = require('fs').promises;
    try {
        const stats = await fs.stat(filePath);
        const fileSize = stats.size;
        const isValid = fileSize <= maxSize;

        logger.info('Проверка размера CSV файла:', {
            path: filePath,
            size: fileSize,
            maxSize,
            isValid
        });

        return {
            isValid,
            size: fileSize
        };
    } catch (error) {
        logger.error('Ошибка проверки размера CSV файла:', error);
        throw error;
    }
};

module.exports = {
    readCSV,
    validateCSVData,
    isValidEmail,
    getCSVHeaders,
    countCSVRows,
    checkCSVSize
}; 