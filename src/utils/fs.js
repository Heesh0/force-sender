const fs = require('fs').promises;
const path = require('path');
const { logger } = require('./logger');
const config = require('../config/app');

// Функция для создания директории
const createDirectory = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        logger.info('Директория создана:', {
            path: dirPath
        });
        return true;
    } catch (error) {
        logger.error('Ошибка создания директории:', error);
        return false;
    }
};

// Функция для проверки существования директории
const directoryExists = async (dirPath) => {
    try {
        await fs.access(dirPath);
        return true;
    } catch {
        return false;
    }
};

// Функция для проверки существования файла
const fileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
};

// Функция для чтения файла
const readFile = async (filePath) => {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        logger.error('Ошибка чтения файла:', error);
        return null;
    }
};

// Функция для записи файла
const writeFile = async (filePath, content) => {
    try {
        await fs.writeFile(filePath, content, 'utf-8');
        logger.info('Файл записан:', {
            path: filePath
        });
        return true;
    } catch (error) {
        logger.error('Ошибка записи файла:', error);
        return false;
    }
};

// Функция для удаления файла
const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
        logger.info('Файл удален:', {
            path: filePath
        });
        return true;
    } catch (error) {
        logger.error('Ошибка удаления файла:', error);
        return false;
    }
};

// Функция для удаления директории
const deleteDirectory = async (dirPath) => {
    try {
        await fs.rmdir(dirPath, { recursive: true });
        logger.info('Директория удалена:', {
            path: dirPath
        });
        return true;
    } catch (error) {
        logger.error('Ошибка удаления директории:', error);
        return false;
    }
};

// Функция для получения списка файлов в директории
const getFiles = async (dirPath) => {
    try {
        const files = await fs.readdir(dirPath);
        return files;
    } catch (error) {
        logger.error('Ошибка получения списка файлов:', error);
        return [];
    }
};

// Функция для получения информации о файле
const getFileInfo = async (filePath) => {
    try {
        const stats = await fs.stat(filePath);
        return {
            name: path.basename(filePath),
            path: filePath,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile()
        };
    } catch (error) {
        logger.error('Ошибка получения информации о файле:', error);
        return null;
    }
};

// Функция для копирования файла
const copyFile = async (sourcePath, destinationPath) => {
    try {
        await fs.copyFile(sourcePath, destinationPath);
        logger.info('Файл скопирован:', {
            source: sourcePath,
            destination: destinationPath
        });
        return true;
    } catch (error) {
        logger.error('Ошибка копирования файла:', error);
        return false;
    }
};

// Функция для перемещения файла
const moveFile = async (sourcePath, destinationPath) => {
    try {
        await fs.rename(sourcePath, destinationPath);
        logger.info('Файл перемещен:', {
            source: sourcePath,
            destination: destinationPath
        });
        return true;
    } catch (error) {
        logger.error('Ошибка перемещения файла:', error);
        return false;
    }
};

// Функция для изменения прав доступа к файлу
const chmod = async (filePath, mode) => {
    try {
        await fs.chmod(filePath, mode);
        logger.info('Права доступа изменены:', {
            path: filePath,
            mode
        });
        return true;
    } catch (error) {
        logger.error('Ошибка изменения прав доступа:', error);
        return false;
    }
};

// Функция для очистки временных файлов
const cleanupTempFiles = async () => {
    try {
        const tempDir = path.join(__dirname, '../../', config.upload.tempDir);
        const files = await getFiles(tempDir);
        const now = new Date();

        for (const file of files) {
            const filePath = path.join(tempDir, file);
            const fileInfo = await getFileInfo(filePath);

            if (fileInfo && fileInfo.isFile) {
                const diff = now - fileInfo.modifiedAt;
                if (diff > config.upload.tempFileTTL * 1000) {
                    await deleteFile(filePath);
                }
            }
        }

        logger.info('Временные файлы очищены');
        return true;
    } catch (error) {
        logger.error('Ошибка очистки временных файлов:', error);
        return false;
    }
};

module.exports = {
    createDirectory,
    directoryExists,
    fileExists,
    readFile,
    writeFile,
    deleteFile,
    deleteDirectory,
    getFiles,
    getFileInfo,
    copyFile,
    moveFile,
    chmod,
    cleanupTempFiles
}; 