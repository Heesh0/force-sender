const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const logger = require('./logger');

const generateExcelReport = async (data, filename) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Отчет');

        // Добавляем заголовки
        const headers = Object.keys(data[0]);
        worksheet.addRow(headers);

        // Добавляем данные
        data.forEach(row => {
            worksheet.addRow(Object.values(row));
        });

        // Сохраняем файл
        const filePath = path.join(__dirname, '../../reports', filename);
        await workbook.xlsx.writeFile(filePath);
        logger.info(`Сгенерирован Excel отчет: ${filename}`);
        return filePath;
    } catch (error) {
        logger.error(`Ошибка при генерации Excel отчета:`, error);
        throw error;
    }
};

const generatePDFReport = async (data, filename) => {
    try {
        const doc = new PDFDocument();
        const filePath = path.join(__dirname, '../../reports', filename);
        doc.pipe(fs.createWriteStream(filePath));

        // Добавляем заголовок
        doc.fontSize(20).text('Отчет', { align: 'center' });
        doc.moveDown();

        // Добавляем данные
        data.forEach(row => {
            Object.entries(row).forEach(([key, value]) => {
                doc.fontSize(12).text(`${key}: ${value}`);
            });
            doc.moveDown();
        });

        doc.end();
        logger.info(`Сгенерирован PDF отчет: ${filename}`);
        return filePath;
    } catch (error) {
        logger.error(`Ошибка при генерации PDF отчета:`, error);
        throw error;
    }
};

const generateCampaignReport = async (campaignData) => {
    try {
        const report = {
            'Название кампании': campaignData.name,
            'Всего писем': campaignData.totalEmails,
            'Отправлено писем': campaignData.sentEmails,
            'Неудачных отправок': campaignData.failedEmails,
            'Процент открытий': `${campaignData.openRate}%`,
            'Процент кликов': `${campaignData.clickRate}%`,
            'Процент отписок': `${campaignData.unsubscribeRate}%`,
            'Дата начала': campaignData.startDate,
            'Дата окончания': campaignData.endDate
        };

        const filename = `campaign_report_${Date.now()}.xlsx`;
        return await generateExcelReport([report], filename);
    } catch (error) {
        logger.error('Ошибка при генерации отчета кампании:', error);
        throw error;
    }
};

const generateSenderReport = async (senderData) => {
    try {
        const report = {
            'Имя отправителя': senderData.name,
            'Всего писем': senderData.totalEmails,
            'Успешных доставок': senderData.successfulDeliveries,
            'Неудачных доставок': senderData.failedDeliveries,
            'Процент отказов': `${senderData.bounceRate}%`,
            'Процент спама': `${senderData.spamRate}%`,
            'Среднее время доставки': `${senderData.averageDeliveryTime} сек`
        };

        const filename = `sender_report_${Date.now()}.pdf`;
        return await generatePDFReport([report], filename);
    } catch (error) {
        logger.error('Ошибка при генерации отчета отправителя:', error);
        throw error;
    }
};

const cleanupOldReports = async (days = 30) => {
    try {
        const reportsDir = path.join(__dirname, '../../reports');
        const files = await fs.promises.readdir(reportsDir);
        const now = Date.now();

        for (const file of files) {
            const filePath = path.join(reportsDir, file);
            const stats = await fs.promises.stat(filePath);
            const fileAge = now - stats.mtime.getTime();
            const daysOld = fileAge / (1000 * 60 * 60 * 24);

            if (daysOld > days) {
                await fs.promises.unlink(filePath);
                logger.info(`Удален старый отчет: ${file}`);
            }
        }
    } catch (error) {
        logger.error('Ошибка при очистке старых отчетов:', error);
        throw error;
    }
};

module.exports = {
    generateExcelReport,
    generatePDFReport,
    generateCampaignReport,
    generateSenderReport,
    cleanupOldReports
}; 