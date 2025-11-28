const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const initialize = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS public.users (
      id SERIAL PRIMARY KEY,
      name VARCHAR NOT NULL,
      age INT NOT NULL,
      address JSONB NULL,
      additional_info JSONB NULL
    )
  `;

  try {
    await pool.query(queryText);
    console.log('Database initialized successfully.');
  } catch (err) {
    console.error('Error initializing database:', err.message);
  }
};

const query = (text, params) => pool.query(text, params);

const close = () => pool.end();

module.exports = {
  initialize,
  query,
  close
};