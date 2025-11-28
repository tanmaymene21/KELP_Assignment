const express = require('express');
const router = express.Router();
const db = require('../config/database');
const csvParser = require('../parsers/csvParser');
const dataProcessor = require('../services/dataProcessor');
const reportGenerator = require('../services/reportGenerator');

// POST: Process the CSV file
router.post('/process', async (req, res) => {
  try {
    const filePath = process.env.CSV_FILE_PATH;
    if (!filePath) throw new Error('CSV_FILE_PATH not defined');

    console.log('Creating users table if not exists...');
    await dataProcessor.createTableIfNotExists();

    console.log('Parsing CSV...');
    const records = await csvParser.parse(filePath);

    console.log(`Processing ${records.length} records...`);
    const result = await dataProcessor.processRecords(records);

    console.log('Generating Report...');
    const report = await reportGenerator.generateAgeDistributionReport();

    res.json({
      success: true,
      message: 'Processing complete',
      inserted: result.insertedCount,
      report: report,
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET: Get the age report
router.get('/report', async (req, res) => {
  try {
    const report = await reportGenerator.generateAgeDistributionReport();
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await dataProcessor.getAllUsers();
    res.json({ success: true, count: users.length, users: users });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Clear all users
router.delete('/users', async (req, res) => {
  try {
    await dataProcessor.clearUsers();
    res.json({ success: true, message: 'All users deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET: Health check
router.get('/health', async (req, res) => {
  try {
    await db.query('SELECT 1');
    res.json({ status: 'OK', database: 'Connected' });
  } catch (err) {
    res.status(503).json({ status: 'Error', error: err.message });
  }
});

module.exports = router;
