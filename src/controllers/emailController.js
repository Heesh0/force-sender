const { Email, Domain } = require('../models');
const logger = require('../utils/logger');
const { validationResult } = require('express-validator');
const csv = require('csv-parse');
const xlsx = require('xlsx');
const fs = require('fs');

class EmailController {
    async getEmailsByDomain(req, res) {
        try {
            const { domainId } = req.params;
            const { status } = req.query;

            const where = { domainId };
            if (status) {
                where.status = status;
            }

            const emails = await Email.findAll({
                where,
                order: [['createdAt', 'DESC']]
            });

            res.json(emails);
        } catch (error) {
            logger.error('Error getting emails:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async uploadEmails(req, res) {
        try {
            const { domainId } = req.params;
            const file = req.file;

            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }

            const domain = await Domain.findByPk(domainId);
            if (!domain) {
                return res.status(404).json({ error: 'Domain not found' });
            }

            const emails = [];
            const fileExtension = file.originalname.split('.').pop().toLowerCase();

            if (fileExtension === 'csv') {
                const fileContent = fs.readFileSync(file.path, 'utf-8');
                const records = await new Promise((resolve, reject) => {
                    csv.parse(fileContent, {
                        columns: true,
                        skip_empty_lines: true
                    }, (err, records) => {
                        if (err) reject(err);
                        resolve(records);
                    });
                });

                emails.push(...records.map(record => record.email));
            } else if (fileExtension === 'xlsx' || fileExtension === 'xls') {
                const workbook = xlsx.readFile(file.path);
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const records = xlsx.utils.sheet_to_json(worksheet);

                emails.push(...records.map(record => record.email));
            } else {
                return res.status(400).json({ error: 'Unsupported file format' });
            }

            // Удаляем дубликаты и невалидные email
            const uniqueEmails = [...new Set(emails)].filter(email => {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            });

            // Создаем записи в базе данных
            const emailRecords = await Email.bulkCreate(
                uniqueEmails.map(email => ({
                    email,
                    domainId,
                    status: 'new'
                })),
                {
                    ignoreDuplicates: true
                }
            );

            // Удаляем временный файл
            fs.unlinkSync(file.path);

            logger.info(`Uploaded ${emailRecords.length} emails for domain ${domain.name}`);
            res.json({
                message: `Successfully uploaded ${emailRecords.length} emails`,
                total: emailRecords.length
            });
        } catch (error) {
            logger.error('Error uploading emails:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async deleteEmail(req, res) {
        try {
            const { id } = req.params;

            const email = await Email.findByPk(id);
            if (!email) {
                return res.status(404).json({ error: 'Email not found' });
            }

            await email.destroy();
            logger.info(`Email deleted: ${email.email}`);
            res.json({ message: 'Email deleted successfully' });
        } catch (error) {
            logger.error('Error deleting email:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async updateEmailStatus(req, res) {
        try {
            const { id } = req.params;
            const { status } = req.body;

            const email = await Email.findByPk(id);
            if (!email) {
                return res.status(404).json({ error: 'Email not found' });
            }

            await email.update({ status });
            logger.info(`Email status updated: ${email.email} -> ${status}`);
            res.json(email);
        } catch (error) {
            logger.error('Error updating email status:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }

    async exportEmails(req, res) {
        try {
            const { domainId } = req.params;
            const { status } = req.query;

            const where = { domainId };
            if (status) {
                where.status = status;
            }

            const emails = await Email.findAll({
                where,
                attributes: ['email', 'status', 'sentAt', 'errorMessage'],
                order: [['createdAt', 'DESC']]
            });

            const domain = await Domain.findByPk(domainId);
            const filename = `${domain.name}_emails_${new Date().toISOString().split('T')[0]}.csv`;

            const csvContent = [
                ['Email', 'Status', 'Sent At', 'Error Message'],
                ...emails.map(email => [
                    email.email,
                    email.status,
                    email.sentAt || '',
                    email.errorMessage || ''
                ])
            ].map(row => row.join(',')).join('\n');

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
            res.send(csvContent);
        } catch (error) {
            logger.error('Error exporting emails:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}

module.exports = new EmailController(); 