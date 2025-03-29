const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { getConfig } = require('./configUtils');
const logger = require('./logger');
const { logInfo, logError } = require('./logger');
const config = require('../config/app');
const { hashFile } = require('./cryptoUtils');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = getConfig('upload.allowedTypes');
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Неподдерживаемый тип файла'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: parseInt(getConfig('upload.maxSize')) * 1024 * 1024
    }
});

const ensureDirectoryExists = async (dirPath) => {
    try {
        await fs.access(dirPath);
    } catch {
        await fs.mkdir(dirPath, { recursive: true });
        logger.info(`Создана директория: ${dirPath}`);
    }
};

const deleteFile = async (filePath) => {
    try {
        await fs.unlink(filePath);
        logger.info(`Удален файл: ${filePath}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при удалении файла ${filePath}:`, error);
        return false;
    }
};

const moveFile = async (sourcePath, destinationPath) => {
    try {
        await fs.rename(sourcePath, destinationPath);
        logger.info(`Перемещен файл из ${sourcePath} в ${destinationPath}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при перемещении файла из ${sourcePath} в ${destinationPath}:`, error);
        return false;
    }
};

const copyFile = async (sourcePath, destinationPath) => {
    try {
        await fs.copyFile(sourcePath, destinationPath);
        logger.info(`Скопирован файл из ${sourcePath} в ${destinationPath}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при копировании файла из ${sourcePath} в ${destinationPath}:`, error);
        return false;
    }
};

const getFileSize = async (filePath) => {
    try {
        const stats = await fs.stat(filePath);
        return stats.size;
    } catch (error) {
        logger.error(`Ошибка при получении размера файла ${filePath}:`, error);
        return null;
    }
};

const getFileExtension = (filename) => {
    return path.extname(filename).toLowerCase();
};

const getFileName = (filePath) => {
    return path.basename(filePath);
};

const getDirectoryName = (filePath) => {
    return path.dirname(filePath);
};

const isFileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
};

const readFile = async (filePath) => {
    try {
        const content = await fs.readFile(filePath, 'utf-8');
        return content;
    } catch (error) {
        logger.error(`Ошибка при чтении файла ${filePath}:`, error);
        throw error;
    }
};

const writeFile = async (filePath, content) => {
    try {
        await fs.writeFile(filePath, content, 'utf-8');
        logger.info(`Записано содержимое в файл: ${filePath}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при записи в файл ${filePath}:`, error);
        return false;
    }
};

const appendToFile = async (filePath, content) => {
    try {
        await fs.appendFile(filePath, content, 'utf-8');
        logger.info(`Добавлено содержимое в файл: ${filePath}`);
        return true;
    } catch (error) {
        logger.error(`Ошибка при добавлении в файл ${filePath}:`, error);
        return false;
    }
};

const getFileStats = async (filePath) => {
    try {
        const stats = await fs.stat(filePath);
        return {
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            accessedAt: stats.atime,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile(),
            isSymbolicLink: stats.isSymbolicLink()
        };
    } catch (error) {
        logger.error(`Ошибка при получении статистики файла ${filePath}:`, error);
        return null;
    }
};

const listDirectory = async (dirPath) => {
    try {
        const files = await fs.readdir(dirPath);
        const stats = await Promise.all(
            files.map(async (file) => {
                const filePath = path.join(dirPath, file);
                const fileStats = await getFileStats(filePath);
                return {
                    name: file,
                    path: filePath,
                    ...fileStats
                };
            })
        );
        return stats;
    } catch (error) {
        logger.error(`Ошибка при получении списка файлов в директории ${dirPath}:`, error);
        return [];
    }
};

// Создание директории
const createDirectory = async (dirPath) => {
    try {
        await fs.mkdir(dirPath, { recursive: true });
        logInfo(`Создана директория:`, { path: dirPath });
    } catch (error) {
        logError(`Ошибка создания директории:`, { path: dirPath, error });
        throw error;
    }
};

// Удаление директории
const deleteDirectory = async (dirPath) => {
    try {
        await fs.rm(dirPath, { recursive: true, force: true });
        logInfo(`Удалена директория:`, { path: dirPath });
    } catch (error) {
        logError(`Ошибка удаления директории:`, { path: dirPath, error });
        throw error;
    }
};

// Создание файла
const createFile = async (filePath, content) => {
    try {
        await fs.writeFile(filePath, content);
        logInfo(`Создан файл:`, { path: filePath });
    } catch (error) {
        logError(`Ошибка создания файла:`, { path: filePath, error });
        throw error;
    }
};

// Получение информации о файле
const getFileInfo = async (filePath) => {
    try {
        const stats = await fs.stat(filePath);
        const hash = await hashFile(filePath);
        
        const info = {
            name: path.basename(filePath),
            path: filePath,
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            accessedAt: stats.atime,
            hash,
            isDirectory: stats.isDirectory(),
            isFile: stats.isFile(),
            isSymbolicLink: stats.isSymbolicLink()
        };

        logInfo(`Получена информация о файле:`, { path: filePath, info });
        return info;
    } catch (error) {
        logError(`Ошибка получения информации о файле:`, { path: filePath, error });
        throw error;
    }
};

// Получение списка файлов в директории
const listFiles = async (dirPath) => {
    try {
        const files = await fs.readdir(dirPath);
        const fileInfos = await Promise.all(
            files.map(file => getFileInfo(path.join(dirPath, file)))
        );

        logInfo(`Получен список файлов:`, { path: dirPath, count: files.length });
        return fileInfos;
    } catch (error) {
        logError(`Ошибка получения списка файлов:`, { path: dirPath, error });
        throw error;
    }
};

// Проверка существования файла
const fileExists = async (filePath) => {
    try {
        await fs.access(filePath);
        return true;
    } catch (error) {
        return false;
    }
};

// Получение имени файла без расширения
const getFileNameWithoutExtension = (filePath) => {
    return path.basename(filePath, path.extname(filePath));
};

// Создание временного файла
const createTempFile = async (content, prefix = 'temp') => {
    try {
        const tempPath = path.join(config.app.tempDir, `${prefix}-${Date.now()}`);
        await createFile(tempPath, content);
        return tempPath;
    } catch (error) {
        logError(`Ошибка создания временного файла:`, error);
        throw error;
    }
};

// Очистка временных файлов
const cleanTempFiles = async (maxAge = 24 * 60 * 60 * 1000) => {
    try {
        const files = await listFiles(config.app.tempDir);
        const now = Date.now();

        for (const file of files) {
            if (now - file.modifiedAt.getTime() > maxAge) {
                await deleteFile(file.path);
            }
        }

        logInfo(`Очищены временные файлы:`, { maxAge });
    } catch (error) {
        logError(`Ошибка очистки временных файлов:`, error);
        throw error;
    }
};

// Создание архива
const createArchive = async (sourcePath, targetPath) => {
    try {
        const archiver = require('archiver');
        const output = require('fs').createWriteStream(targetPath);
        const archive = archiver('zip', {
            zlib: { level: 9 }
        });

        output.on('close', () => {
            logInfo(`Создан архив:`, { source: sourcePath, target: targetPath });
        });

        archive.on('error', (error) => {
            logError(`Ошибка создания архива:`, { source: sourcePath, target: targetPath, error });
            throw error;
        });

        archive.pipe(output);
        archive.directory(sourcePath, false);
        await archive.finalize();
    } catch (error) {
        logError(`Ошибка создания архива:`, { source: sourcePath, target: targetPath, error });
        throw error;
    }
};

// Распаковка архива
const extractArchive = async (archivePath, targetPath) => {
    try {
        const extract = require('extract-zip');
        await extract(archivePath, { dir: targetPath });
        logInfo(`Распакован архив:`, { archive: archivePath, target: targetPath });
    } catch (error) {
        logError(`Ошибка распаковки архива:`, { archive: archivePath, target: targetPath, error });
        throw error;
    }
};

module.exports = {
    upload,
    ensureDirectoryExists,
    deleteFile,
    moveFile,
    copyFile,
    getFileSize,
    getFileExtension,
    getFileName,
    getDirectoryName,
    isFileExists,
    readFile,
    writeFile,
    appendToFile,
    getFileStats,
    listDirectory,
    createDirectory,
    deleteDirectory,
    createFile,
    getFileInfo,
    listFiles,
    fileExists,
    getFileNameWithoutExtension,
    createTempFile,
    cleanTempFiles,
    createArchive,
    extractArchive
}; 