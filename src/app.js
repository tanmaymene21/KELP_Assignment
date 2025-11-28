const express = require('express');
require('dotenv').config();
const db = require('./config/database');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'CSV Data Processing API',
    version: '1.0.0',
    endpoints: {
      'POST /api/upload/process': 'Process CSV file and store data',
      'GET /api/upload/report': 'Get age distribution report',
      'GET /api/upload/users': 'Get all users',
      'DELETE /api/upload/users': 'Clear all users',
      'GET /api/upload/health': 'Health check',
    },
  });
});

// Register Routes
app.use('/api/upload', uploadRoutes);

const start = async () => {
  await db.initialize();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();

module.exports = app;
