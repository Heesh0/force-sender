const fs = require('fs').promises;
const path = require('path');
const csv = require('csv-parse');
const { logger } = require('./logger');
const config = require('../config/app');

// Функция для создания директории, если она не существует
const ensureDirectory = async (dirPath) => {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
        logger.info(`Создана директория: ${dirPath}`);
    }
};

// Функция для удаления файла
const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
        logger.info(`Удален файл: ${filePath}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка удаления файла ${filePath}:`, error);
        return false;
    }
};

// Функция для перемещения файла
const moveFile = async (sourcePath, destinationPath) => {
    try {
        await fs.rename(sourcePath, destinationPath);
        logger.info(`Файл перемещен: ${sourcePath} -> ${destinationPath}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка перемещения файла ${sourcePath}:`, error);
        return false;
    }
};

// Функция для чтения CSV файла
const readCSV = async (filePath) => {
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        return new Promise((resolve, reject) => {
            csv.parse(fileContent, {
                columns: true,
                skip_empty_lines: true
            }, (err, records) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(records);
                }
            });
        });
    } catch (error) {
        logger.error(`Ошибка чтения CSV файла ${filePath}:`, error);
        throw error;
    }
};

// Функция для проверки типа файла
const checkFileType = (file) => {
    if (!file) {
        throw new Error('Файл не предоставлен');
    }

    if (!config.upload.allowedTypes.includes(file.mimetype)) {
        throw new Error(`Неподдерживаемый тип файла. Разрешены: ${config.upload.allowedTypes.join(', ')}`);
    }

    if (file.size > config.upload.maxFileSize) {
        throw new Error(`Размер файла превышает ${config.upload.maxFileSize / (1024 * 1024)}MB`);
    }

    return true;
};

// Функция для очистки временных файлов
const cleanupTempFiles = async () => {
    try {
        const tempDir = path.join(__dirname, '../../', config.upload.tempDir);
        const files = await fs.readdir(tempDir);
        
        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const stats = await fs.stat(filePath);
            
            // Удаляем файлы старше 24 часов
            if (Date.now() - stats.mtime.getTime() > 24 * 60 * 60 * 1000) {
                await deleteFile(filePath);
            }
        }
        
        logger.info('Очистка временных файлов завершена');
        return true;
    } catch (error) {
        logger.error('Ошибка очистки временных файлов:', error);
        return false;
    }
};

// Функция для чтения файла
const readFile = async (filePath) => {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        
        logger.info('Файл прочитан:', {
            path: filePath,
            size: content.length
        });

        return content;
    } catch (error) {
        logger.error('Ошибка чтения файла:', {
            error: error.message,
            path: filePath
        });
        throw error;
    }
};

// Функция для записи файла
const writeFile = async (filePath, content) => {
    try {
        await fs.writeFile(filePath, content, 'utf8');
        
        logger.info('Файл записан:', {
            path: filePath,
            size: content.length
        });
    } catch (error) {
        logger.error('Ошибка записи файла:', {
            error: error.message,
            path: filePath
        });
        throw error;
    }
};

// Функция для проверки существования файла
const fileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        
        logger.info('Проверка существования файла:', {
            path: filePath,
            exists: true
        });

        return true;
    } catch (error) {
        logger.info('Проверка существования файла:', {
            path: filePath,
            exists: false
        });
        return false;
    }
};

// Функция для создания директории
const createDirectory = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        
        logger.info('Директория создана:', {
            path: dirPath
        });
    } catch (error) {
        logger.error('Ошибка создания директории:', {
            error: error.message,
            path: dirPath
        });
        throw error;
    }
};

// Функция для удаления директории
const deleteDirectory = async (dirPath) => {
    try {
        await fs.rmdir(dirPath, { recursive: true });
        
        logger.info('Директория удалена:', {
            path: dirPath
        });
    } catch (error) {
        logger.error('Ошибка удаления директории:', {
            error: error.message,
            path: dirPath
        });
        throw error;
    }
};

// Функция для получения списка файлов в директории
const listFiles = async (dirPath) => {
    try {
        const files = await fs.readdir(dirPath);
        
        logger.info('Получен список файлов:', {
            path: dirPath,
            count: files.length
        });

        return files;
    } catch (error) {
        logger.error('Ошибка получения списка файлов:', {
            error: error.message,
            path: dirPath
        });
        throw error;
    }
};

// Функция для получения информации о файле
const getFileInfo = async (filePath) => {
    try {
        const stats = await fs.stat(filePath);
        
        logger.info('Получена информация о файле:', {
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
        });

        return {
            name: path.basename(filePath),
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile()
        };
    } catch (error) {
        logger.error('Ошибка получения информации о файле:', {
            error: error.message,
            path: filePath
        });
        throw error;
    }
};

// Функция для копирования файла
const copyFile = async (sourcePath, targetPath) => {
    try {
        await fs.copyFile(sourcePath, targetPath);
        
        logger.info('Файл скопирован:', {
            source: sourcePath,
            target: targetPath
        });
    } catch (error) {
        logger.error('Ошибка копирования файла:', {
            error: error.message,
            source: sourcePath,
            target: targetPath
        });
        throw error;
    }
};

// Функция для получения расширения файла
const getFileExtension = (filePath) => {
    try {
        const ext = path.extname(filePath).toLowerCase();
        
        logger.info('Получено расширение файла:', {
            path: filePath,
            extension: ext
        });

        return ext;
    } catch (error) {
        logger.error('Ошибка получения расширения файла:', {
            error: error.message,
            path: filePath
        });
        throw error;
    }
};

// Функция для получения имени файла без расширения
const getFileNameWithoutExtension = (filePath) => {
    try {
        const name = path.basename(filePath, path.extname(filePath));
        
        logger.info('Получено имя файла без расширения:', {
            path: filePath,
            name
        });

        return name;
    } catch (error) {
        logger.error('Ошибка получения имени файла без расширения:', {
            error: error.message,
            path: filePath
        });
        throw error;
    }
};

// Функция для получения размера файла в человекочитаемом формате
const getHumanReadableFileSize = (bytes) => {
    try {
        const units = ['B', 'KB', 'MB', 'GB', 'TB'];
        let size = bytes;
        let unitIndex = 0;

        while (size >= 1024 && unitIndex < units.length - 1) {
            size /= 1024;
            unitIndex++;
        }

        const result = `${size.toFixed(2)} ${units[unitIndex]}`;
        
        logger.info('Получен размер файла в человекочитаемом формате:', {
            bytes,
            result
        });

        return result;
    } catch (error) {
        logger.error('Ошибка получения размера файла в человекочитаемом формате:', {
            error: error.message,
            bytes
        });
        throw error;
    }
};

module.exports = {
    ensureDirectory,
    deleteFile,
    moveFile,
    readCSV,
    checkFileType,
    cleanupTempFiles,
    readFile,
    writeFile,
    fileExists,
    createDirectory,
    deleteDirectory,
    listFiles,
    getFileInfo,
    copyFile,
    getFileExtension,
    getFileNameWithoutExtension,
    getHumanReadableFileSize
}; 