const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const { getConfig } = require('./configUtils');
const logger = require('./logger');

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
    listDirectory
}; 