const db = require('../config/database');

/**
 * Creates the users table if it doesn't exist
 */
const createTableIfNotExists = async () => {
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS public.users (
      id SERIAL PRIMARY KEY,
      name VARCHAR NOT NULL,
      age INT NOT NULL,
      address JSONB NULL,
      additional_info JSONB NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;

  await db.query(createTableQuery);
  console.log('Users table ready');
};

/**
 * Transforms raw CSV objects into the Database Schema
 * Separation of mandatory fields (name, age, address) vs additional_info
 */
const processRecords = async (records) => {
  let insertedCount = 0;

  for (const record of records) {
    try {
      const { name, age, address, ...rest } = record;

      if (!name || !age) {
        console.warn('Skipping record missing name or age');
        continue;
      }

      let fullName = name;
      if (typeof name === 'object') {
        const first = name.firstName || '';
        const last = name.lastName || '';
        fullName = `${first} ${last}`.trim();
      }

      const additionalInfo = Object.keys(rest).length > 0 ? rest : null;
      
      const parsedAge = parseInt(age);
      if (isNaN(parsedAge) || parsedAge < 0 || parsedAge > 150) {
        console.warn(`Skipping record with invalid age: ${age}`);
        continue;
      }

      const queryText = `
        INSERT INTO public.users (name, age, address, additional_info)
        VALUES ($1, $2, $3, $4)
      `;

      await db.query(queryText, [
        fullName,
        parsedAge,
        address ? JSON.stringify(address) : null,
        additionalInfo ? JSON.stringify(additionalInfo) : null,
      ]);

      insertedCount++;
    } catch (err) {
      console.error('Failed to insert record:', err.message);
    }
  }

  return { insertedCount };
};

const getAllUsers = async () => {
  const res = await db.query('SELECT * FROM public.users');
  return res.rows;
};

const clearUsers = async () => {
  await db.query('TRUNCATE TABLE public.users RESTART IDENTITY');
};

module.exports = {
  createTableIfNotExists,
  processRecords,
  getAllUsers,
  clearUsers,
};
